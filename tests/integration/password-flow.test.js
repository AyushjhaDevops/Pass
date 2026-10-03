import { describe, expect, it } from "vitest";

import { generatePassword } from "../../src/modules/generator.js";
import { analyzePassword } from "../../src/modules/checker.js";

describe("Password generation and analysis integration", () => {
  it("generates a password that the checker can analyze", () => {
    const password = generatePassword({
      length: 24,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });

    const result = analyzePassword(password);

    expect(result.checks.length).toBe(24);
    expect(result.checks.hasUppercase).toBe(true);
    expect(result.checks.hasLowercase).toBe(true);
    expect(result.checks.hasNumber).toBe(true);
    expect(result.checks.hasSpecial).toBe(true);
    expect(result.entropy).toBeGreaterThan(0);
  });

  it("analyzes many generated passwords without throwing", () => {
    for (let index = 0; index < 100; index += 1) {
      const password = generatePassword({
        length: 20,
      });

      expect(() =>
        analyzePassword(password),
      ).not.toThrow();
    }
  });

  it("does not persist generated passwords through the checker", () => {
    const password = generatePassword({
      length: 20,
    });

    analyzePassword(password);

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});