import {
  analyzePin,
  calculatePinEntropy,
  calculatePinSearchSpace,
  estimatePinCrackTime,
  generatePin,
  getDefaultPinOptions,
  hasRepeatedDigits,
  hasSequentialPattern,
  isCommonPin,
} from "../src/modules/pin.js";
import { describe, expect, it } from "vitest";
describe("PIN module", () => {
  describe("getDefaultPinOptions", () => {
    it("returns secure defaults", () => {
      expect(
        getDefaultPinOptions(),
      ).toEqual({
        length: 6,
        noRepeats: true,
        avoidSequential: true,
        avoidCommon: true,
      });
    });
  });

  describe("hasRepeatedDigits", () => {
    it("detects repeated digits", () => {
      expect(
        hasRepeatedDigits("1123"),
      ).toBe(true);
    });

    it("returns false for unique digits", () => {
      expect(
        hasRepeatedDigits("5831"),
      ).toBe(false);
    });
  });

  describe("hasSequentialPattern", () => {
    it("detects ascending sequences", () => {
      expect(
        hasSequentialPattern("1234"),
      ).toBe(true);
    });

    it("detects descending sequences", () => {
      expect(
        hasSequentialPattern("4321"),
      ).toBe(true);
    });

    it("detects circular ascending sequences", () => {
      expect(
        hasSequentialPattern("8901"),
      ).toBe(true);
    });

    it("detects circular descending sequences", () => {
      expect(
        hasSequentialPattern("2109"),
      ).toBe(true);
    });

    it("rejects a non-sequential PIN", () => {
      expect(
        hasSequentialPattern("5831"),
      ).toBe(false);
    });
  });

  describe("isCommonPin", () => {
    it("detects common PINs", () => {
      expect(
        isCommonPin("1234"),
      ).toBe(true);

      expect(
        isCommonPin("0000"),
      ).toBe(true);
    });

    it("rejects a less common PIN", () => {
      expect(
        isCommonPin("5831"),
      ).toBe(false);
    });
  });

  describe("calculatePinEntropy", () => {
    it("calculates entropy for a 4 digit PIN", () => {
      expect(
        calculatePinEntropy(4),
      ).toBeCloseTo(
        4 * Math.log2(10),
      );
    });

    it("increases with PIN length", () => {
      expect(
        calculatePinEntropy(8),
      ).toBeGreaterThan(
        calculatePinEntropy(4),
      );
    });

    it("returns zero for invalid length", () => {
      expect(
        calculatePinEntropy(0),
      ).toBe(0);
    });
  });

  describe("calculatePinSearchSpace", () => {
    it("calculates normal PIN search space", () => {
      expect(
        calculatePinSearchSpace(4),
      ).toBe(10000);
    });

    it("calculates no-repeat search space", () => {
      expect(
        calculatePinSearchSpace(
          4,
          true,
        ),
      ).toBe(5040);
    });

    it("returns zero when no-repeat length exceeds ten", () => {
      expect(
        calculatePinSearchSpace(
          11,
          true,
        ),
      ).toBe(0);
    });
  });

  describe("estimatePinCrackTime", () => {
    it("returns instant for zero entropy", () => {
      expect(
        estimatePinCrackTime(0),
      ).toEqual({
        seconds: 0,
        label: "Instant",
      });
    });

    it("returns a positive time for valid entropy", () => {
      const result =
        estimatePinCrackTime(20);

      expect(result.seconds).toBeGreaterThan(0);
      expect(result.label).toBeTruthy();
    });
  });

  describe("generatePin", () => {
    it("generates a PIN with the requested length", () => {
      const pin = generatePin({
        length: 6,
      });

      expect(pin).toHaveLength(6);
      expect(pin).toMatch(/^\d{6}$/);
    });

    it("generates an 8 digit PIN", () => {
      const pin = generatePin({
        length: 8,
      });

      expect(pin).toHaveLength(8);
      expect(pin).toMatch(/^\d{8}$/);
    });

    it("generates a PIN without repeated digits", () => {
      const pin = generatePin({
        length: 6,
        noRepeats: true,
      });

      expect(
        hasRepeatedDigits(pin),
      ).toBe(false);
    });

    it("avoids sequential patterns", () => {
      const pin = generatePin({
        length: 6,
        avoidSequential: true,
      });

      expect(
        hasSequentialPattern(pin),
      ).toBe(false);
    });

    it("avoids common PINs", () => {
      const pin = generatePin({
        length: 4,
        avoidCommon: true,
      });

      expect(
        isCommonPin(pin),
      ).toBe(false);
    });

    it("allows repeated digits when disabled", () => {
      const pin = generatePin({
        length: 4,
        noRepeats: false,
        avoidSequential: false,
        avoidCommon: false,
      });

      expect(pin).toMatch(/^\d{4}$/);
    });

    it("rejects invalid PIN length", () => {
      expect(() =>
        generatePin({
          length: 3,
        }),
      ).toThrow();

      expect(() =>
        generatePin({
          length: 13,
        }),
      ).toThrow();
    });

    it("rejects impossible no-repeat configuration", () => {
      expect(() =>
        generatePin({
          length: 11,
          noRepeats: true,
        }),
      ).toThrow();
    });
  });

  describe("analyzePin", () => {
    it("analyzes an empty PIN", () => {
      const result =
        analyzePin("");

      expect(result.score).toBe(0);
      expect(result.strength).toBe(
        "Not analyzed",
      );
    });

    it("rejects non-numeric input", () => {
      const result =
        analyzePin("12ab");

      expect(result.strength).toBe(
        "Invalid",
      );

      expect(
        result.checks.validDigits,
      ).toBe(false);
    });

    it("detects weak common PINs", () => {
      const result =
        analyzePin("1234");

      expect(
        result.checks.commonPin,
      ).toBe(true);

      expect(
        result.checks.sequentialPattern,
      ).toBe(true);
    });

    it("detects repeated digits", () => {
      const result =
        analyzePin("1111");

      expect(
        result.checks.repeatedDigits,
      ).toBe(true);
    });

    it("produces recommendations", () => {
      const result =
        analyzePin("1234");

      expect(
        result.suggestions.length,
      ).toBeGreaterThan(0);
    });

    it("analyzes a stronger PIN", () => {
      const result =
        analyzePin("583164", {
          noRepeats: true,
          avoidSequential: true,
          avoidCommon: true,
        });

      expect(
        result.checks.validDigits,
      ).toBe(true);

      expect(
        result.checks.repeatedDigits,
      ).toBe(false);

      expect(
        result.checks.sequentialPattern,
      ).toBe(false);

      expect(result.entropy).toBeGreaterThan(0);
      expect(result.searchSpace).toBeGreaterThan(0);
    });
  });
});