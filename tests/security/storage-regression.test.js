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

  it("detects sensitive keys in sessionStorage", () => {
    sessionStorage.setItem(
      "userPin",
      "123456",
    );

    expect(hasSensitiveStorageKeys()).toBe(true);

    const findings = getSensitiveStorageFindings();

    expect(findings.length).toBeGreaterThan(0);
  });

  it("detects passphrase storage", () => {
    localStorage.setItem(
      "generatedPassphrase",
      "correct horse battery staple",
    );

    expect(hasSensitiveStorageKeys()).toBe(true);
  });

  it("detects hash storage", () => {
    localStorage.setItem(
      "passwordHash",
      "A".repeat(40),
    );

    expect(hasSensitiveStorageKeys()).toBe(true);
  });

  it("detects breach-result storage", () => {
    localStorage.setItem(
      "breachResult",
      JSON.stringify({
        breached: true,
        count: 100,
      }),
    );

    expect(hasSensitiveStorageKeys()).toBe(true);
  });

  it("does not classify ordinary settings as passwords", () => {
    localStorage.setItem(
      "theme",
      "dark",
    );

    expect(hasSensitiveStorageKeys()).toBe(false);
  });

  it("does not classify ordinary application settings as sensitive", () => {
    localStorage.setItem(
      "appearance",
      "compact",
    );

    localStorage.setItem(
      "language",
      "en",
    );

    expect(hasSensitiveStorageKeys()).toBe(false);
  });
});