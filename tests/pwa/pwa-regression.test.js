import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const pwaPath = path.resolve(
  process.cwd(),
  "src/ui/pwa.js",
);

const pwaSource = fs.readFileSync(
  pwaPath,
  "utf8",
);

describe("PWA regression tests", () => {
  it("contains service worker support", () => {
    expect(pwaSource).toMatch(
      /serviceWorker/,
    );
  });

  it("references the service worker script", () => {
    expect(pwaSource).toContain(
      "/sw.js",
    );
  });

  it("handles service worker registration failures", () => {
    expect(pwaSource).toMatch(
      /catch/,
    );
  });

  it("uses browser service worker APIs", () => {
    expect(pwaSource).toContain(
      "navigator.serviceWorker",
    );
  });
});