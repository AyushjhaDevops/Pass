import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const serviceWorkerPath = path.resolve(
  process.cwd(),
  "public/sw.js",
);

const serviceWorkerSource = fs.readFileSync(
  serviceWorkerPath,
  "utf8",
);

describe("Service worker regression tests", () => {
  it("contains a versioned cache", () => {
    expect(serviceWorkerSource).toMatch(
      /CACHE_VERSION\s*=\s*["']password-toolkit-v\d+["']/,
    );
  });

  it("handles install events", () => {
    expect(serviceWorkerSource).toMatch(
      /addEventListener\(\s*["']install["']/,
    );
  });

  it("handles activate events", () => {
    expect(serviceWorkerSource).toMatch(
      /addEventListener\(\s*["']activate["']/,
    );
  });

  it("handles fetch events", () => {
    expect(serviceWorkerSource).toMatch(
      /addEventListener\(\s*["']fetch["']/,
    );
  });

  it("only handles GET requests", () => {
    expect(serviceWorkerSource).toMatch(
      /request\.method\s*!==\s*["']GET["']/,
    );
  });

  it("does not cache URL query strings", () => {
    expect(serviceWorkerSource).toMatch(
      /requestUrl\.search/,
    );
  });

  it("contains an offline fallback", () => {
    expect(serviceWorkerSource).toContain(
      "/offline.html",
    );
  });

  it("contains the app shell", () => {
    expect(serviceWorkerSource).toContain(
      "/index.html",
    );

    expect(serviceWorkerSource).toContain(
      "/manifest.webmanifest",
    );
  });
});
