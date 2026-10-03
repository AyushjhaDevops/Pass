import { describe, expect, it } from "vitest";

import { generatePassword } from "../../src/modules/generator.js";

describe("Randomness security regression tests", () => {
  it("does not generate empty passwords", () => {
    for (let index = 0; index < 100; index += 1) {
      const password = generatePassword({
        length: 16,
      });

      expect(password.length).toBe(16);
    }
  });

  it("generates sufficiently varied passwords", () => {
    const passwords = new Set();

    for (let index = 0; index < 250; index += 1) {
      passwords.add(
        generatePassword({
          length: 32,
        }),
      );
    }

    expect(passwords.size).toBeGreaterThan(240);
  });

  it("preserves requested length", () => {
    for (const length of [8, 12, 16, 32, 64, 128]) {
      const password = generatePassword({
        length,
      });

      expect(password).toHaveLength(length);
    }
  });
});