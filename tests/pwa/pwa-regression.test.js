import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pwaPath = path.resolve(
  "src/ui/pwa.js",
);

const pwaSource = fs.readFileSync(
  pwaPath,
  "utf8",
);

describe("PWA regression tests", () => {
  it("contains service worker support", () => {
    expect(pwaSource).toContain(
      "navigator.serviceWorker",
    );
  });

  it("references the service worker script", () => {
    /*
     * The service worker path is intentionally built
     * from Vite's BASE_URL so the application works
     * both locally and under the GitHub Pages
     * /Pass/ project path.
     *
     * Example:
     *
     *   local:       /sw.js
     *   GitHub Pages: /Pass/sw.js
     *
     * Do not require a specific quote style here.
     */
    expect(pwaSource).toContain(
      "import.meta.env.BASE_URL",
    );

    expect(pwaSource).toContain(
      "sw.js",
    );

    expect(pwaSource).toContain(
      "SERVICE_WORKER_PATH",
    );

    expect(pwaSource).toContain(
      "navigator.serviceWorker.register",
    );
  });

  it("handles service worker registration failures", () => {
    expect(pwaSource).toContain(
      "Service Worker registration failed.",
    );

    expect(pwaSource).toContain(
      "catch",
    );
  });

  it("uses browser service worker APIs", () => {
    expect(pwaSource).toContain(
      "navigator.serviceWorker.register",
    );

    expect(pwaSource).toContain(
      "navigator.serviceWorker.addEventListener",
    );

    expect(pwaSource).toContain(
      "registration.addEventListener",
    );
  });
});