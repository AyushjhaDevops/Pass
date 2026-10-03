import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  hasSensitiveStorageKeys,
  getSensitiveStorageFindings,
} from "../../src/modules/security.js";

describe("Sensitive storage regression tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("starts without sensitive storage", () => {
    expect(hasSensitiveStorageKeys()).toBe(false);
  });

  it("detects suspicious sensitive keys", () => {
    localStorage.setItem(
      "savedPassword",
      "secret",
    );

    expect(hasSensitiveStorageKeys()).toBe(true);

    const findings = getSensitiveStorageFindings();

    expect(findings.length).toBeGreaterThan(0);
  });

  it("does not classify ordinary settings as passwords", () => {
    localStorage.setItem(
      "theme",
      "dark",
    );

    expect(hasSensitiveStorageKeys()).toBe(false);
  });
});