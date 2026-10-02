import { describe, expect, test } from "vitest";

import {
  calculateEntropy,
  calculateSearchSpace,
  estimateCrackTime,
  getCharacterPoolSize,
} from "../src/modules/entropy.js";

describe("Entropy Analysis", () => {
  test("returns zero entropy for an empty password", () => {
    expect(calculateEntropy("")).toBe(0);
  });

  test("calculates entropy for lowercase passwords", () => {
    const entropy = calculateEntropy("abcdefgh");

    expect(entropy).toBeGreaterThan(0);
  });

  test("detects character pool size", () => {
    expect(getCharacterPoolSize("abc")).toBe(26);
    expect(getCharacterPoolSize("ABC")).toBe(26);
    expect(getCharacterPoolSize("123")).toBe(10);
    expect(getCharacterPoolSize("abc123")).toBe(36);
  });

  test("calculates search space", () => {
    expect(calculateSearchSpace("abc")).toBe(26 ** 3);
  });

  test("longer passwords have more entropy", () => {
    const shortPassword = calculateEntropy("abc");
    const longPassword = calculateEntropy("abcdefghijk");

    expect(longPassword).toBeGreaterThan(shortPassword);
  });

  test("estimates crack time", () => {
    const result = estimateCrackTime(10);

    expect(result.seconds).toBeGreaterThan(0);
    expect(result.label).toBeTruthy();
  });

  test("handles invalid entropy values", () => {
    const result = estimateCrackTime(0);

    expect(result.seconds).toBe(0);
    expect(result.label).toBe("Instant");
  });
});