
const DEFAULT_PRIVACY_SETTINGS = Object.freeze({
  autoClearClipboard: true,
  clipboardClearSeconds: 30,
  clearOnPageHide: true,
  clearSensitiveFieldsOnUnload: true,
  localOnlyMode: true,
});

const ALLOWED_CLIPBOARD_TIMES = Object.freeze([
  10,
  15,
  30,
  60,
  120,
]);

function isValidClipboardTime(value) {
  return ALLOWED_CLIPBOARD_TIMES.includes(Number(value));
}

function sanitizeSettings(settings = {}) {
  return {
    autoClearClipboard:
      settings.autoClearClipboard !== false,

    clipboardClearSeconds:
      isValidClipboardTime(settings.clipboardClearSeconds)
        ? Number(settings.clipboardClearSeconds)
        : DEFAULT_PRIVACY_SETTINGS.clipboardClearSeconds,

    clearOnPageHide:
      settings.clearOnPageHide !== false,

    clearSensitiveFieldsOnUnload:
      settings.clearSensitiveFieldsOnUnload !== false,

    localOnlyMode:
      settings.localOnlyMode !== false,
  };
}

export function getDefaultPrivacySettings() {
  return { ...DEFAULT_PRIVACY_SETTINGS };
}

export function getPrivacySettings() {
  /*
   * IMPORTANT:
   *
   * Privacy settings themselves are intentionally NOT persisted.
   *
   * This prevents localStorage/sessionStorage from becoming a
   * persistent storage mechanism for the application.
   */
  return getDefaultPrivacySettings();
}

export function validatePrivacySettings(settings) {
  if (!settings || typeof settings !== "object") {
    return false;
  }

  if (
    typeof settings.autoClearClipboard !== "boolean" ||
    typeof settings.clearOnPageHide !== "boolean" ||
    typeof settings.clearSensitiveFieldsOnUnload !== "boolean" ||
    typeof settings.localOnlyMode !== "boolean"
  ) {
    return false;
  }

  return isValidClipboardTime(settings.clipboardClearSeconds);
}

export function sanitizePrivacySettings(settings) {
  return sanitizeSettings(settings);
}

export function isSensitiveElement(element) {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  if (element.dataset.sensitive === "true") {
    return true;
  }

  if (element.type === "password") {
    return true;
  }

  return element.hasAttribute("data-sensitive");
}

export function clearSensitiveElement(element) {
  if (!isSensitiveElement(element)) {
    return;
  }

  if ("value" in element) {
    element.value = "";
  }

  if (element.dataset.generatedSensitive === "true") {
    element.textContent = "";
  }
}

export function clearSensitiveElements(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return 0;
  }

  let clearedCount = 0;

  const elements = root.querySelectorAll(
    '[data-sensitive="true"], input[type="password"]',
  );

  elements.forEach((element) => {
    const hadValue =
      "value" in element
        ? element.value.length > 0
        : element.textContent.length > 0;

    clearSensitiveElement(element);

    if (hadValue) {
      clearedCount += 1;
    }
  });

  return clearedCount;
}

export function clearSensitiveStorage() {
  /*
   * Deliberately do NOT call localStorage.clear().
   *
   * A web page may coexist with other applications/origin data.
   * Clearing unrelated storage would be unsafe.
   *
   * The toolkit itself does not store sensitive values.
   */
  return {
    localStorageCleared: false,
    sessionStorageCleared: false,
    indexedDBCleared: false,
    cookiesCleared: false,
  };
}

export function getPrivacyStatus() {
  return {
    localOnly: true,
    networkTransmission: false,
    passwordStorage: false,
    pinStorage: false,
    passphraseStorage: false,
    clipboardAutoClearSupported:
      typeof navigator !== "undefined" &&
      Boolean(navigator.clipboard),
    persistentSensitiveStorage: false,
  };
}

export function getPrivacySummary() {
  return [
    "Passwords are processed locally in the browser.",
    "Generated passwords are not intentionally persisted by the privacy layer.",
    "Generated PINs are not intentionally persisted by the privacy layer.",
    "Generated passphrases are not intentionally persisted by the privacy layer.",
    "The privacy layer does not transmit sensitive values to a server.",
    "Clipboard contents can be automatically cleared after a configurable period.",
    "Sensitive fields can be cleared when the page is hidden or unloaded.",
  ];
}

export function createPrivacySettingsSnapshot(settings = {}) {
  return Object.freeze({
    ...sanitizeSettings(settings),
  });
}