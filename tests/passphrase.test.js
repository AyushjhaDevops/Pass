import { describe, expect, it } from "vitest";

import {
  calculatePassphraseEntropy,
  generatePassphrase,
  getDefaultPassphraseOptions,
  getWordList,
} from "../src/modules/passphrase.js";

describe("Passphrase Generator", () => {
  it("returns default options", () => {
    const options = getDefaultPassphraseOptions();

    expect(options.wordCount).toBe(5);
    expect(options.separator).toBe("-");
    expect(options.capitalize).toBe(false);
    expect(options.addNumber).toBe(false);
    expect(options.addSymbol).toBe(false);
  });

  it("returns a word list", () => {
    const words = getWordList();

    expect(words.length).toBeGreaterThan(10);
    expect(words).toContain("apple");
  });

  it("generates the requested number of words", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      separator: "-",
    });

    expect(passphrase.split("-")).toHaveLength(5);
  });

  it("supports custom separators", () => {
    const passphrase = generatePassphrase({
      wordCount: 4,
      separator: "_",
    });

    expect(passphrase.split("_")).toHaveLength(4);
  });

  it("supports capitalization", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      capitalize: true,
    });

    const words = passphrase.split("-");

    expect(words.every((word) => /^[A-Z]/.test(word))).toBe(true);
  });

  it("supports adding a number", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      addNumber: true,
    });

    expect(passphrase).toMatch(/\d$/);
  });

  it("supports adding a symbol", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      addSymbol: true,
    });

    expect(passphrase).toMatch(/[!@#$%^&*]$/);
  });

  it("supports adding both number and symbol", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      addNumber: true,
      addSymbol: true,
    });

    expect(passphrase).toMatch(/\d[!@#$%^&*]$/);
  });

  it("rejects too few words", () => {
    expect(() =>
      generatePassphrase({
        wordCount: 3,
      }),
    ).toThrow();
  });

  it("rejects too many words", () => {
    expect(() =>
      generatePassphrase({
        wordCount: 13,
      }),
    ).toThrow();
  });

  it("calculates entropy", () => {
    const entropy = calculatePassphraseEntropy(5);

    expect(entropy).toBeGreaterThan(0);
  });

  it("has greater entropy with more words", () => {
    const fourWords = calculatePassphraseEntropy(4);
    const sixWords = calculatePassphraseEntropy(6);

    expect(sixWords).toBeGreaterThan(fourWords);
  });
});