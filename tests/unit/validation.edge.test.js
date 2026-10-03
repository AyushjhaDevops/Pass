import { describe, expect, it } from "vitest";

import {
  validateString,
  validatePassword,
  validatePasswordLength,
  validatePin,
  validatePinLength,
  validatePassphraseWordCount,
  validateClipboardTimeout,
} from "../../src/modules/validation.js";

describe("Validation edge cases", () => {
  it("validates strings", () => {
    expect(validateString("hello").valid).toBe(true);
    expect(validateString("").valid).toBe(true);

    expect(validateString(null).valid).toBe(false);
    expect(validateString(undefined).valid).toBe(false);
    expect(validateString(123).valid).toBe(false);
  });

  it("validates password values", () => {
    expect(
      validatePassword("Password123!").valid,
    ).toBe(true);

    expect(
      validatePassword("").valid,
    ).toBe(false);

    expect(
      validatePassword(null).valid,
    ).toBe(false);

    expect(
      validatePassword(undefined).valid,
    ).toBe(false);

    expect(
      validatePassword(12345).valid,
    ).toBe(false);
  });

  it("validates password lengths", () => {
    expect(
      validatePasswordLength(8).valid,
    ).toBe(true);

    expect(
      validatePasswordLength(128).valid,
    ).toBe(true);

    expect(
      validatePasswordLength(7).valid,
    ).toBe(false);

    expect(
      validatePasswordLength(129).valid,
    ).toBe(false);
  });

  it("validates PIN values", () => {
    expect(
      validatePin("1234").valid,
    ).toBe(true);

    expect(
      validatePin("12345678").valid,
    ).toBe(true);

    expect(
      validatePin("12a4").valid,
    ).toBe(false);

    expect(
      validatePin("").valid,
    ).toBe(false);

    expect(
      validatePin(null).valid,
    ).toBe(false);
  });

  it("validates PIN lengths", () => {
    expect(
      validatePinLength(4).valid,
    ).toBe(true);

    expect(
      validatePinLength(8).valid,
    ).toBe(true);

    expect(
      validatePinLength(3).valid,
    ).toBe(false);

    expect(
      validatePinLength(9).valid,
    ).toBe(true);
  });

  it("validates passphrase word count", () => {
    expect(
      validatePassphraseWordCount(4).valid,
    ).toBe(true);

    expect(
      validatePassphraseWordCount(12).valid,
    ).toBe(true);

    expect(
      validatePassphraseWordCount(3).valid,
    ).toBe(false);

    expect(
      validatePassphraseWordCount(13).valid,
    ).toBe(false);
  });

  it("validates clipboard timeout values", () => {
    expect(
      validateClipboardTimeout(10).valid,
    ).toBe(true);

    expect(
      validateClipboardTimeout(30).valid,
    ).toBe(true);

    expect(
      validateClipboardTimeout(120).valid,
    ).toBe(true);

    expect(
      validateClipboardTimeout(5).valid,
    ).toBe(false);

    expect(
      validateClipboardTimeout(300).valid,
    ).toBe(false);
  });
});