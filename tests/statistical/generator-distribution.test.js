import { describe, expect, it } from "vitest";
import { generatePassword } from "../../src/modules/generator.js";

describe("Password generator statistical behavior", () => {
  it("uses all requested character classes over many samples", () => {
    const counts = {
      uppercase: 0,
      lowercase: 0,
      numbers: 0,
      symbols: 0,
    };

    const samples = 500;

    for (let index = 0; index < samples; index += 1) {
      const password = generatePassword({
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      });

      if (/[A-Z]/.test(password)) counts.uppercase += 1;
      if (/[a-z]/.test(password)) counts.lowercase += 1;
      if (/[0-9]/.test(password)) counts.numbers += 1;
      if (/[^A-Za-z0-9]/.test(password)) counts.symbols += 1;
    }

    expect(counts.uppercase).toBe(samples);
    expect(counts.lowercase).toBe(samples);
    expect(counts.numbers).toBe(samples);
    expect(counts.symbols).toBe(samples);
  });

  it("produces a broad distribution of first characters", () => {
    const frequencies = new Map();

    for (let index = 0; index < 1000; index += 1) {
      const password = generatePassword({
        length: 32,
      });

      const first = password[0];

      frequencies.set(
        first,
        (frequencies.get(first) || 0) + 1,
      );
    }

    expect(frequencies.size).toBeGreaterThan(10);
  });

  it("does not repeatedly generate the same password", () => {
    const passwords = [];

    for (let index = 0; index < 100; index += 1) {
      passwords.push(
        generatePassword({
          length: 32,
        }),
      );
    }

    const unique = new Set(passwords);

    expect(unique.size).toBeGreaterThanOrEqual(95);
  });
});