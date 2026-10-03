import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  runSecurityAudit,
  getSecurityStatus,
  hasSecureRandomness,
  hasSensitiveStorageKeys,
  getSensitiveStorageFindings,
  getExternalScriptUrls,
  getSensitiveInputs,
  getSecuritySummary,
} from "../src/modules/security.js";

describe("security module", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    localStorage.clear();
    sessionStorage.clear();

    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    vi.restoreAllMocks();
  });

  it("runs a security audit", () => {
    const result = runSecurityAudit();

    expect(result).toHaveProperty("checks");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("passed");
    expect(result).toHaveProperty("failed");
    expect(result).toHaveProperty("critical");

    expect(Array.isArray(result.checks)).toBe(true);
  });

  it("detects Web Crypto randomness support", () => {
    expect(
      typeof hasSecureRandomness(),
    ).toBe("boolean");
  });

  it("returns a valid security status", () => {
    expect([
      "secure",
      "review",
      "critical",
    ]).toContain(getSecurityStatus());
  });

  it("does not report sensitive storage initially", () => {
    expect(
      hasSensitiveStorageKeys(),
    ).toBe(false);
  });

  it("detects potentially sensitive storage keys", () => {
    localStorage.setItem(
      "test-password-value",
      "placeholder",
    );

    expect(
      hasSensitiveStorageKeys(),
    ).toBe(true);

    const findings =
      getSensitiveStorageFindings();

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].storage).toBe(
      "localStorage",
    );
  });

  it("detects external scripts", () => {
    const script =
      document.createElement("script");

    script.src =
      "https://example.com/script.js";

    document.head.appendChild(script);

    const urls =
      getExternalScriptUrls();

    expect(urls).toContain(
      "https://example.com/script.js",
    );
  });

  it("does not report same-origin scripts as external", () => {
    const script =
      document.createElement("script");

    script.src = "/src/main.js";

    document.head.appendChild(script);

    expect(
      getExternalScriptUrls(),
    ).not.toContain(
      expect.stringContaining("/src/main.js"),
    );
  });

  it("detects sensitive DOM fields", () => {
    document.body.innerHTML = `
      <input
        id="passwordInput"
        type="password"
        data-sensitive="true"
      />
    `;

    const fields =
      getSensitiveInputs();

    expect(fields).toHaveLength(1);
    expect(fields[0].id).toBe(
      "passwordInput",
    );
  });

  it("returns a security summary", () => {
    const summary =
      getSecuritySummary();

    expect(summary).toHaveProperty(
      "status",
    );

    expect(summary).toHaveProperty(
      "passed",
    );

    expect(summary).toHaveProperty(
      "failed",
    );

    expect(summary).toHaveProperty(
      "critical",
    );
  });

  it("does not modify sensitive values during auditing", () => {
    document.body.innerHTML = `
      <input
        id="passwordInput"
        type="password"
        data-sensitive="true"
        value="ExampleSecret123!"
      />
    `;

    runSecurityAudit();

    const input =
      document.querySelector(
        "#passwordInput",
      );

    expect(input.value).toBe(
      "ExampleSecret123!",
    );
  });
  it("detects inline event handlers", () => {
  document.body.innerHTML = `
    <button
      onclick="alert('test')"
    >
      Test
    </button>
  `;

  const audit =
    runSecurityAudit();

  const check =
    audit.checks.find(
      (item) =>
        item.id === "inline-handlers",
    );

  expect(check).toBeDefined();
  expect(check.passed).toBe(false);
});
  
});