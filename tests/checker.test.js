import { describe, expect, test } from "vitest";
import { analyzePassword } from "../src/modules/checker.js";

describe("Password Checker", () => {
  test("handles an empty password", () => {
    const result = analyzePassword("");

    expect(result.score).toBe(0);
    expect(result.strength).toBe("Not analyzed");
    expect(result.entropy).toBe(0);
  });

  test("detects uppercase characters", () => {
    const result = analyzePassword("Password");

    expect(result.checks.hasUppercase).toBe(true);
  });

  test("detects lowercase characters", () => {
    const result = analyzePassword("PASSWORDa");

    expect(result.checks.hasLowercase).toBe(true);
  });

  test("detects numbers", () => {
    const result = analyzePassword("Password123");

    expect(result.checks.hasNumber).toBe(true);
  });

  test("detects special characters", () => {
    const result = analyzePassword("Password123!");

    expect(result.checks.hasSpecial).toBe(true);
  });

  test("detects repeated characters", () => {
    const result = analyzePassword("Password111");

    expect(result.checks.repeatedCharacters).toBe(true);
  });

  test("detects sequential numbers", () => {
    const result = analyzePassword("Password1234");

    expect(result.checks.sequentialPattern).toBe(true);
  });

  test("detects keyboard patterns", () => {
    const result = analyzePassword("MyQwertyPassword");

    expect(result.checks.keyboardPattern).toBe(true);
  });

  test("detects common passwords", () => {
    const result = analyzePassword("password");

    expect(result.checks.commonPassword).toBe(true);
  });

  test("calculates entropy", () => {
    const result = analyzePassword(
      "xT7@kP9#mQ2!vL8$"
    );

    expect(result.entropy).toBeGreaterThan(0);
  });

  test("returns suggestions", () => {
    const result = analyzePassword("password");

    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test("does not throw for normal passwords", () => {
    expect(() =>
      analyzePassword("MyVeryLongPassword!123")
    ).not.toThrow();
  });

  test("rejects non-string input", () => {
    expect(() =>
      analyzePassword(null)
    ).toThrow();

    expect(() =>
      analyzePassword(123456)
    ).toThrow();
  });
});