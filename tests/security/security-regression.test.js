import { describe, expect, it } from "vitest";

import {
  runSecurityAudit,
  getSecurityStatus,
  hasSecureRandomness,
  hasSensitiveStorageKeys,
  getExternalScriptUrls,
  getSensitiveInputs,
} from "../../src/modules/security.js";

describe("Security regression tests", () => {
  it("detects secure randomness support", () => {
    expect(typeof hasSecureRandomness()).toBe("boolean");
  });

  it("returns a security audit", () => {
    const audit = runSecurityAudit();

    expect(audit).toBeDefined();
    expect(typeof audit).toBe("object");
  });

  it("returns security status", () => {
    const status = getSecurityStatus();

    expect(status).toBeDefined();
    expect(typeof status).toBe("string");
    expect(status.length).toBeGreaterThan(0);
  });

  it("does not contain suspicious sensitive storage keys", () => {
    expect(hasSensitiveStorageKeys()).toBe(false);
  });

  it("does not load external scripts", () => {
    const scripts = getExternalScriptUrls();

    expect(Array.isArray(scripts)).toBe(true);
    expect(scripts).toHaveLength(0);
  });

  it("can inspect sensitive inputs", () => {
    const inputs = getSensitiveInputs();

    expect(Array.isArray(inputs)).toBe(true);
  });
});