import { describe, expect, it } from "vitest";

import { generatePassword } from "../../src/modules/generator.js";
import { analyzePassword } from "../../src/modules/checker.js";
import { generatePassphrase } from "../../src/modules/passphrase.js";
import { generatePin } from "../../src/modules/pin.js";

describe("Complete generator suite", () => {
  it("password generator produces analyzable output", () => {
    const password = generatePassword({
      length: 24,
    });

    const analysis = analyzePassword(password);

    expect(password).toHaveLength(24);
    expect(analysis.entropy).toBeGreaterThan(0);
  });

  it("passphrase generator produces usable output", () => {
    const passphrase = generatePassphrase({
      wordCount: 5,
      separator: "-",
    });

    expect(passphrase.split("-")).toHaveLength(5);
    expect(passphrase.length).toBeGreaterThan(0);
  });

  it("PIN generator produces numeric output", () => {
    const pin = generatePin({
      length: 6,
    });

    expect(pin).toMatch(/^\d{6}$/);
  });
});