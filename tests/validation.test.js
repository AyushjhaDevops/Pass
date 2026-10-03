import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validatePassword,
  validatePasswordLength,
  validatePin,
  validatePinLength,
  validatePassphraseWordCount,
  validateClipboardTimeout,
  validateCharacterSetOptions,
} from "../src/modules/validation.js";

describe("validation", () => {
  it("accepts a valid password", () => {
    expect(
      validatePassword("CorrectHorseBatteryStaple!")
        .valid,
    ).toBe(true);
  });

  it("rejects a non-string password", () => {
    expect(
      validatePassword(123).valid,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      validatePassword("").valid,
    ).toBe(false);
  });

  it("rejects an oversized password", () => {
    expect(
      validatePassword("a".repeat(129)).valid,
    ).toBe(false);
  });

  it("accepts a valid password length", () => {
    expect(
      validatePasswordLength(20).valid,
    ).toBe(true);
  });

  it("rejects an invalid password length", () => {
    expect(
      validatePasswordLength(7).valid,
    ).toBe(false);
  });

  it("accepts a valid PIN", () => {
    expect(
      validatePin("482917").valid,
    ).toBe(true);
  });

  it("rejects a PIN containing letters", () => {
    expect(
      validatePin("12ab56").valid,
    ).toBe(false);
  });

  it("rejects a PIN that is too short", () => {
    expect(
      validatePin("123").valid,
    ).toBe(false);
  });

  it("accepts valid PIN length", () => {
    expect(
      validatePinLength(6).valid,
    ).toBe(true);
  });

  it("accepts a valid passphrase word count", () => {
    expect(
      validatePassphraseWordCount(6).valid,
    ).toBe(true);
  });

  it("rejects an invalid passphrase word count", () => {
    expect(
      validatePassphraseWordCount(20).valid,
    ).toBe(false);
  });

  it("accepts supported clipboard timeout", () => {
    expect(
      validateClipboardTimeout(30).valid,
    ).toBe(true);
  });

  it("rejects unsupported clipboard timeout", () => {
    expect(
      validateClipboardTimeout(45).valid,
    ).toBe(false);
  });

  it("accepts generator options objects", () => {
    expect(
      validateCharacterSetOptions({}).valid,
    ).toBe(true);
  });

  it("rejects invalid generator options", () => {
    expect(
      validateCharacterSetOptions(null).valid,
    ).toBe(false);
  });
});