import { describe, expect, it } from "vitest";
import { analyzePassword } from "../../src/modules/checker.js";

describe("Password checker edge cases", () => {
  it("handles an empty password", () => {
    const result = analyzePassword("");

    expect(result.score).toBe(0);
    expect(result.strength).toBe("Not analyzed");
    expect(result.entropy).toBe(0);
  });

  it("rejects non-string input", () => {
    expect(() => analyzePassword(null)).toThrow(TypeError);
    expect(() => analyzePassword(12345)).toThrow(TypeError);
    expect(() => analyzePassword({})).toThrow(TypeError);
  });

  it("detects common passwords", () => {
    const result = analyzePassword("password");

    expect(result.checks.commonPassword).toBe(true);
  });

  it("detects sequential patterns", () => {
    const result = analyzePassword("123456789");

    expect(result.patterns.sequential).toBe(true);
  });

  it("detects keyboard patterns", () => {
    const result = analyzePassword("qwerty123");

    expect(result.patterns.keyboard).toBe(true);
  });

  it("detects repeated characters", () => {
    const result = analyzePassword("aaaaaaaaaaaa");

    expect(result.patterns.repeatedCharacters).toBe(true);
  });

  it("detects predictable years", () => {
    const result = analyzePassword("Password2026!");

    expect(result.patterns.year).toBe(true);
  });

  it("returns suggestions", () => {
    const result = analyzePassword("password");

    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("returns character counts", () => {
    const result = analyzePassword("Aa1234!");

    expect(result.characterCounts.uppercase).toBe(1);
    expect(result.characterCounts.lowercase).toBe(1);
    expect(result.characterCounts.numbers).toBe(4);
    expect(result.characterCounts.symbols).toBe(1);
  });
});