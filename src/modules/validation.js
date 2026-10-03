const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const PIN_MIN_LENGTH = 4;
const PIN_MAX_LENGTH = 12;

const PASSPHRASE_MIN_WORDS = 4;
const PASSPHRASE_MAX_WORDS = 12;

const ALLOWED_CLIPBOARD_TIMEOUTS = Object.freeze([
  10,
  15,
  30,
  60,
  120,
]);

function createResult(valid, message = "") {
  return Object.freeze({
    valid,
    message,
  });
}

export function validateString(
  value,
  fieldName = "Value",
) {
  if (typeof value !== "string") {
    return createResult(
      false,
      `${fieldName} must be a string.`,
    );
  }

  return createResult(true);
}

export function validatePassword(password) {
  if (typeof password !== "string") {
    return createResult(
      false,
      "Password must be a string.",
    );
  }

  if (password.length === 0) {
    return createResult(
      false,
      "Password cannot be empty.",
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return createResult(
      false,
      `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`,
    );
  }

  return createResult(true);
}

export function validatePasswordLength(length) {
  const numericLength = Number(length);

  if (!Number.isInteger(numericLength)) {
    return createResult(
      false,
      "Password length must be an integer.",
    );
  }

  if (
    numericLength < PASSWORD_MIN_LENGTH ||
    numericLength > PASSWORD_MAX_LENGTH
  ) {
    return createResult(
      false,
      `Password length must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH}.`,
    );
  }

  return createResult(true);
}

export function validatePin(pin) {
  if (typeof pin !== "string") {
    return createResult(
      false,
      "PIN must be a string.",
    );
  }

  if (pin.length < PIN_MIN_LENGTH) {
    return createResult(
      false,
      `PIN must contain at least ${PIN_MIN_LENGTH} digits.`,
    );
  }

  if (pin.length > PIN_MAX_LENGTH) {
    return createResult(
      false,
      `PIN cannot exceed ${PIN_MAX_LENGTH} digits.`,
    );
  }

  if (!/^\d+$/.test(pin)) {
    return createResult(
      false,
      "PIN must contain only digits.",
    );
  }

  return createResult(true);
}

export function validatePinLength(length) {
  const numericLength = Number(length);

  if (!Number.isInteger(numericLength)) {
    return createResult(
      false,
      "PIN length must be an integer.",
    );
  }

  if (
    numericLength < PIN_MIN_LENGTH ||
    numericLength > PIN_MAX_LENGTH
  ) {
    return createResult(
      false,
      `PIN length must be between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH}.`,
    );
  }

  return createResult(true);
}

export function validatePassphraseWordCount(
  wordCount,
) {
  const numericCount = Number(wordCount);

  if (!Number.isInteger(numericCount)) {
    return createResult(
      false,
      "Passphrase word count must be an integer.",
    );
  }

  if (
    numericCount < PASSPHRASE_MIN_WORDS ||
    numericCount > PASSPHRASE_MAX_WORDS
  ) {
    return createResult(
      false,
      `Passphrase must contain between ${PASSPHRASE_MIN_WORDS} and ${PASSPHRASE_MAX_WORDS} words.`,
    );
  }

  return createResult(true);
}

export function validateClipboardTimeout(
  seconds,
) {
  const numericSeconds = Number(seconds);

  if (
    !ALLOWED_CLIPBOARD_TIMEOUTS.includes(
      numericSeconds,
    )
  ) {
    return createResult(
      false,
      "Clipboard timeout is not supported.",
    );
  }

  return createResult(true);
}

export function validateCharacterSetOptions(
  options = {},
) {
  if (
    !options ||
    typeof options !== "object" ||
    Array.isArray(options)
  ) {
    return createResult(
      false,
      "Generator options must be an object.",
    );
  }

  return createResult(true);
}

export function isValidPasswordLength(length) {
  return validatePasswordLength(length).valid;
}

export function isValidPin(pin) {
  return validatePin(pin).valid;
}

export function isValidPassphraseWordCount(
  wordCount,
) {
  return validatePassphraseWordCount(wordCount)
    .valid;
}