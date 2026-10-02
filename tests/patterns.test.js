import { describe, expect, test } from "vitest";

import {
  analyzePatterns,
  detectCommonFragments,
  detectDate,
  detectKeyboardPattern,
  detectLeetspeak,
  detectRepeatedBlocks,
  detectRepeatedCharacters,
  detectSequentialPattern,
  detectWeakStructure,
  detectYear,
  normalizeLeetspeak,
} from "../src/modules/patterns.js";

describe("Advanced Pattern Detection", () => {
  test("normalizes leetspeak", () => {
    expect(normalizeLeetspeak("P@55w0rd")).toBe("password");
  });

  test("detects leetspeak", () => {
    expect(detectLeetspeak("P@ssw0rd")).toBe(true);
  });

  test("detects common fragments", () => {
    expect(detectCommonFragments("MyPassword123")).toContain("password");
  });

  test("detects keyboard patterns", () => {
    expect(detectKeyboardPattern("MyQwerty123")).toBe(true);
  });

  test("detects sequential patterns", () => {
    expect(detectSequentialPattern("abc12345")).toBe(true);
  });

  test("detects repeated characters", () => {
    expect(detectRepeatedCharacters("Password111")).toBe(true);
  });

  test("detects repeated blocks", () => {
    expect(detectRepeatedBlocks("abcabc")).toBe(true);
  });

  test("detects years", () => {
    expect(detectYear("MyPassword2026")).toBe(true);
  });

  test("detects dates", () => {
    expect(detectDate("12/10/2026")).toBe(true);
  });

  test("detects weak structures", () => {
    expect(
      detectWeakStructure("Password2026!"),
    ).toBe(true);
  });

  test("returns complete pattern analysis", () => {
    const result = analyzePatterns("Password123!");

    expect(result).toHaveProperty("leetspeak");
    expect(result).toHaveProperty("commonFragments");
    expect(result).toHaveProperty("keyboard");
    expect(result).toHaveProperty("sequential");
    expect(result).toHaveProperty("repeatedCharacters");
    expect(result).toHaveProperty("repeatedBlocks");
    expect(result).toHaveProperty("year");
    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("weakStructure");
  });
});