import { describe, expect, it } from "vitest";

import {
  generatePassphrase,
  calculatePassphraseEntropy,
} from "../../src/modules/passphrase.js";

describe("Passphrase integration", () => {
  it("generates the requested number of words", () => {
    const passphrase = generatePassphrase({
      wordCount: 6,
      separator: "-",
    });

    expect(passphrase.split("-")).toHaveLength(6);
  });

  it("supports capitalization", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      capitalize: true,
    });

    expect(passphrase).toMatch(/[A-Z]/);
  });

  it("supports numbers", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      addNumber: true,
    });

    expect(passphrase).toMatch(/[0-9]/);
  });

  it("supports symbols", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      addSymbol: true,
    });

    expect(passphrase).toMatch(/[^A-Za-z0-9\s-]/);
  });

  it("calculates positive entropy", () => {
    const entropy = calculatePassphraseEntropy(5);

    expect(entropy).toBeGreaterThan(0);
  });
});