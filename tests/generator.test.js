import { describe, expect, test } from "vitest";
import { generatePassword } from "../src/modules/generator.js";

describe("Password Generator", () => {
  test("generates the requested password length", () => {
    const password = generatePassword({
      length: 20,
    });

    expect(password).toHaveLength(20);
  });

  test("supports the minimum allowed length", () => {
    const password = generatePassword({
      length: 8,
    });

    expect(password).toHaveLength(8);
  });

  test("supports the maximum allowed length", () => {
    const password = generatePassword({
      length: 128,
    });

    expect(password).toHaveLength(128);
  });

  test("contains uppercase characters", () => {
    const password = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
      minimumUppercase: 1,
      minimumLowercase: 0,
      minimumNumbers: 0,
      minimumSymbols: 0,
    });

    expect(password).toMatch(/[A-Z]/);
  });

  test("contains lowercase characters", () => {
    const password = generatePassword({
      length: 20,
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
      minimumUppercase: 0,
      minimumLowercase: 1,
      minimumNumbers: 0,
      minimumSymbols: 0,
    });

    expect(password).toMatch(/[a-z]/);
  });

  test("contains numbers", () => {
    const password = generatePassword({
      length: 20,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      minimumUppercase: 0,
      minimumLowercase: 0,
      minimumNumbers: 1,
      minimumSymbols: 0,
    });

    expect(password).toMatch(/[0-9]/);
  });

  test("contains symbols", () => {
    const password = generatePassword({
      length: 20,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: true,
      minimumUppercase: 0,
      minimumLowercase: 0,
      minimumNumbers: 0,
      minimumSymbols: 1,
    });

    expect(password).toMatch(/[^A-Za-z0-9]/);
  });

  test("respects excluded characters", () => {
    const password = generatePassword({
      length: 32,
      excludeCharacters: "ABCabc123!@#",
    });

    for (const character of password) {
      expect("ABCabc123!@#").not.toContain(character);
    }
  });

  test("can exclude similar characters", () => {
    const password = generatePassword({
      length: 32,
      excludeSimilar: true,
    });

    expect(password).not.toMatch(/[0Oo1Il]/);
  });

  test("rejects an invalid length", () => {
    expect(() =>
      generatePassword({
        length: 5,
      })
    ).toThrow();
  });

  test("rejects a length above 128", () => {
    expect(() =>
      generatePassword({
        length: 129,
      })
    ).toThrow();
  });

  test("rejects impossible minimum requirements", () => {
    expect(() =>
      generatePassword({
        length: 8,
        minimumUppercase: 5,
        minimumLowercase: 5,
        minimumNumbers: 1,
        minimumSymbols: 1,
      })
    ).toThrow();
  });

  test("rejects minimum requirements for disabled character sets", () => {
    expect(() =>
      generatePassword({
        length: 20,
        uppercase: false,
        minimumUppercase: 1,
      })
    ).toThrow();
  });

  test("can generate passwords without duplicate characters", () => {
    const password = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      minimumUppercase: 1,
      minimumLowercase: 1,
      minimumNumbers: 1,
      minimumSymbols: 1,
      allowDuplicates: false,
    });

    const uniqueCharacters = new Set(password);

    expect(uniqueCharacters.size).toBe(password.length);
  });

  test("fails when no character set is enabled", () => {
    expect(() =>
      generatePassword({
        length: 20,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        minimumUppercase: 0,
        minimumLowercase: 0,
        minimumNumbers: 0,
        minimumSymbols: 0,
      })
    ).toThrow();
  });
});