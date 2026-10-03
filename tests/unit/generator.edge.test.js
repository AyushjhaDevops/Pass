import { describe, expect, it } from "vitest";
import {
  generatePassword,
  getCharacterSets,
} from "../../src/modules/generator.js";

describe("Password generator edge cases", () => {
  it("generates the minimum supported password length", () => {
    const password = generatePassword({
      length: 8,
    });

    expect(password).toHaveLength(8);
  });

  it("generates the maximum supported password length", () => {
    const password = generatePassword({
      length: 128,
    });

    expect(password).toHaveLength(128);
  });

  it("rejects passwords shorter than the supported minimum", () => {
    expect(() =>
      generatePassword({
        length: 7,
      }),
    ).toThrow();
  });

  it("rejects passwords longer than the supported maximum", () => {
    expect(() =>
      generatePassword({
        length: 129,
      }),
    ).toThrow();
  });

  it("returns configured character sets", () => {
    const sets = getCharacterSets();

    expect(sets).toBeDefined();
    expect(typeof sets).toBe("object");
  });

  it("generates different passwords across multiple calls", () => {
    const passwords = new Set();

    for (let index = 0; index < 50; index += 1) {
      passwords.add(
        generatePassword({
          length: 24,
        }),
      );
    }

    expect(passwords.size).toBeGreaterThan(45);
  });
});