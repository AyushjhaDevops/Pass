import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

describe("Offline PWA regression tests", () => {
  const publicDir = path.resolve(
    process.cwd(),
    "public",
  );

  it("contains the offline page", () => {
    expect(
      fs.existsSync(
        path.join(publicDir, "offline.html"),
      ),
    ).toBe(true);
  });

  it("contains the web manifest", () => {
    expect(
      fs.existsSync(
        path.join(
          publicDir,
          "manifest.webmanifest",
        ),
      ),
    ).toBe(true);
  });

  it("contains the service worker", () => {
    expect(
      fs.existsSync(
        path.join(publicDir, "sw.js"),
      ),
    ).toBe(true);
  });

  it("contains the expected PWA manifest fields", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(
          publicDir,
          "manifest.webmanifest",
        ),
        "utf8",
      ),
    );

    expect(manifest.name).toBe(
      "Password Security Toolkit",
    );

    expect(manifest.start_url).toBe("/Pass/");
    expect(manifest.scope).toBe("/Pass/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});