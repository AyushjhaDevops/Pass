import { describe, expect, it } from "vitest";
import {
  calculateEntropy,
  calculateSearchSpace,
  estimateCrackTime,
  getCharacterPoolSize,
} from "../../src/modules/entropy.js";

describe("Entropy edge cases", () => {
  it("returns zero for empty input", () => {
    expect(calculateEntropy("")).toBe(0);
    expect(calculateSearchSpace("")).toBe(0);
    expect(getCharacterPoolSize("")).toBe(0);
  });

  it("returns zero for invalid input", () => {
    expect(calculateEntropy(null)).toBe(0);
    expect(calculateSearchSpace(null)).toBe(0);
  });

  it("calculates entropy for lowercase passwords", () => {
    const entropy = calculateEntropy("abcdefgh");

    expect(entropy).toBeGreaterThan(0);
  });

  it("calculates entropy for mixed character classes", () => {
    const entropy = calculateEntropy("Aa1234!");

    expect(entropy).toBeGreaterThan(
      calculateEntropy("abcdefg"),
    );
  });

  it("returns an instant label for zero entropy", () => {
    const result = estimateCrackTime(0);

    expect(result.seconds).toBe(0);
    expect(result.label).toBe("Instant");
  });

  it("supports a custom guesses-per-second value", () => {
    const result = estimateCrackTime(20, 1);

    expect(result.seconds).toBe(2 ** 20);
  });
});