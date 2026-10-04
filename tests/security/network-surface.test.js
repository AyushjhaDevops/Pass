import { describe, expect, it } from "vitest";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");

const SOURCE_DIRECTORIES = [
  "src",
  "public",
];

const ALLOWED_EXTERNAL_ORIGIN =
  "https://api.pwnedpasswords.com";

const ALLOWED_NETWORK_FILES = new Set([
  "src/modules/breach.js",
  "public/sw.js",
]);

function collectJavaScriptFiles(directory) {
  const files = [];

  if (!existsSync(directory)) {
    return files;
  }

  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(
        ...collectJavaScriptFiles(fullPath),
      );
      continue;
    }

    if (
      stats.isFile() &&
      /\.(js|mjs|cjs)$/.test(entry)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function getProductionJavaScriptFiles() {
  return SOURCE_DIRECTORIES.flatMap(
    (directory) =>
      collectJavaScriptFiles(
        resolve(PROJECT_ROOT, directory),
      ),
  );
}

function readProductionFile(filePath) {
  return {
    filePath,
    relativePath: relative(
      PROJECT_ROOT,
      filePath,
    ),
    source: readFileSync(
      filePath,
      "utf8",
    ),
  };
}

describe("Production network surface", () => {
  it("contains only the expected network API", () => {
    const unexpected = [];

    const productionFiles =
      getProductionJavaScriptFiles();

    for (const filePath of productionFiles) {
      const {
        relativePath,
        source,
      } = readProductionFile(filePath);

      const networkApiPattern =
        /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/g;

      for (const match of source.matchAll(
        networkApiPattern,
      )) {
        const api = match[1];

        const isAllowedFile =
          ALLOWED_NETWORK_FILES.has(
            relativePath,
          );

        const isAllowedFetch =
          api === "fetch" &&
          isAllowedFile;

        if (!isAllowedFetch) {
          unexpected.push({
            filePath,
            index: match.index,
            api,
          });
        }
      }
    }

    expect(unexpected).toEqual([]);
  });

  it("does not contain unexpected external HTTP URLs", () => {
    const unexpected = [];

    const productionFiles =
      getProductionJavaScriptFiles();

    for (const filePath of productionFiles) {
      const {
        relativePath,
        source,
      } = readProductionFile(filePath);

      const urlPattern =
        /https?:\/\/[^\s"'`)<]+/g;

      for (const match of source.matchAll(
        urlPattern,
      )) {
        const url = match[0].replace(
          /[),.;]+$/,
          "",
        );

        let parsedUrl;

        try {
          parsedUrl = new URL(url);
        } catch {
          continue;
        }

        const isAllowedHibp =
          parsedUrl.origin ===
          ALLOWED_EXTERNAL_ORIGIN;

        const isSameOrigin =
          parsedUrl.origin ===
          "http://localhost" ||
          parsedUrl.origin ===
          "https://localhost";

        if (
          !isAllowedHibp &&
          !isSameOrigin
        ) {
          unexpected.push({
            filePath,
            relativePath,
            index: match.index,
            url,
          });
        }
      }
    }

    expect(unexpected).toEqual([]);
  });
});