import {
  clearSensitiveElements,
  getDefaultPrivacySettings,
  getPrivacyStatus,
  getPrivacySummary,
  sanitizePrivacySettings,
} from "../modules/privacy.js";

import {
  clearClipboard,
  getRemainingClipboardSeconds,
} from "../modules/clipboard.js";

import { showNotification } from "./notifications.js";

let privacySettings = getDefaultPrivacySettings();

let clipboardCountdownTimer = null;

function getElement(id) {
  return document.getElementById(id);
}

function updateLocalOnlyIndicator() {
  const indicator = getElement("localOnlyIndicator");

  if (!indicator) {
    return;
  }

  const status = getPrivacyStatus();

  if (status.localOnly && !status.networkTransmission) {
    indicator.textContent = "🔒 Local-only";
    indicator.className =
      "privacy-indicator privacy-indicator-secure";
    indicator.setAttribute(
      "title",
      "Sensitive analysis runs locally in your browser.",
    );
  } else {
    indicator.textContent = "⚠️ Privacy mode";
    indicator.className =
      "privacy-indicator privacy-indicator-warning";
  }
}

function updatePrivacyStatus() {
  const status = getPrivacyStatus();

  const networkValue = getElement(
    "privacyNetworkStatus",
  );

  const storageValue = getElement(
    "privacyStorageStatus",
  );

  const clipboardValue = getElement(
    "privacyClipboardStatus",
  );

  if (networkValue) {
    networkValue.textContent = status.networkTransmission
      ? "Network transmission enabled"
      : "Local processing only";
  }

  if (storageValue) {
    storageValue.textContent =
      status.persistentSensitiveStorage
        ? "Persistent sensitive storage detected"
        : "No persistent sensitive storage";
  }

  if (clipboardValue) {
    clipboardValue.textContent =
      status.clipboardAutoClearSupported
        ? "Clipboard protection available"
        : "Clipboard API unavailable";
  }
}

function updatePrivacySummary() {
  const list = getElement("privacySummaryList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  getPrivacySummary().forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function updateClipboardCountdown() {
  const element = getElement(
    "clipboardCountdown",
  );

  if (!element) {
    return;
  }

  const remaining =
    getRemainingClipboardSeconds();

  if (remaining <= 0) {
    element.textContent = "Clipboard clear: inactive";
    return;
  }

  element.textContent =
    `Clipboard clear: ${remaining}s`;
}

function startClipboardCountdown() {
  if (clipboardCountdownTimer !== null) {
    window.clearInterval(
      clipboardCountdownTimer,
    );
  }

  clipboardCountdownTimer =
    window.setInterval(
      updateClipboardCountdown,
      1000,
    );

  updateClipboardCountdown();
}

function readSettingsFromUI() {
  const autoClearClipboard =
    getElement("privacyAutoClearClipboard");

  const clipboardSeconds =
    getElement("privacyClipboardSeconds");

  const clearOnPageHide =
    getElement("privacyClearOnPageHide");

  const clearOnUnload =
    getElement(
      "privacyClearSensitiveOnUnload",
    );

  const localOnly =
    getElement("privacyLocalOnly");

  return sanitizePrivacySettings({
    autoClearClipboard:
      autoClearClipboard?.checked ?? true,

    clipboardClearSeconds:
      Number(
        clipboardSeconds?.value ?? 30,
      ),

    clearOnPageHide:
      clearOnPageHide?.checked ?? true,

    clearSensitiveFieldsOnUnload:
      clearOnUnload?.checked ?? true,

    localOnlyMode:
      localOnly?.checked ?? true,
  });
}

function applySettingsToUI() {
  const settings = privacySettings;

  const autoClearClipboard =
    getElement("privacyAutoClearClipboard");

  const clipboardSeconds =
    getElement("privacyClipboardSeconds");

  const clearOnPageHide =
    getElement("privacyClearOnPageHide");

  const clearOnUnload =
    getElement(
      "privacyClearSensitiveOnUnload",
    );

  const localOnly =
    getElement("privacyLocalOnly");

  if (autoClearClipboard) {
    autoClearClipboard.checked =
      settings.autoClearClipboard;
  }

  if (clipboardSeconds) {
    clipboardSeconds.value =
      String(
        settings.clipboardClearSeconds,
      );
  }

  if (clearOnPageHide) {
    clearOnPageHide.checked =
      settings.clearOnPageHide;
  }

  if (clearOnUnload) {
    clearOnUnload.checked =
      settings.clearSensitiveFieldsOnUnload;
  }

  if (localOnly) {
    localOnly.checked =
      settings.localOnlyMode;
  }
}

function handleSettingsChange() {
  privacySettings = readSettingsFromUI();

  /*
   * Settings deliberately live only in memory.
   *
   * Reloading the application resets them to secure defaults.
   */
  showNotification(
    "Privacy settings updated for this session.",
    "success",
  );
}

async function handleManualClipboardClear() {
  const cleared = await clearClipboard();

  if (cleared) {
    showNotification(
      "Clipboard cleared.",
      "success",
    );
  } else {
    showNotification(
      "Unable to clear the clipboard.",
      "error",
    );
  }

  updateClipboardCountdown();
}

function handlePageHide() {
  if (privacySettings.clearOnPageHide) {
    clearSensitiveElements();
  }
}

function handleBeforeUnload() {
  if (
    privacySettings.clearSensitiveFieldsOnUnload
  ) {
    clearSensitiveElements();
  }
}

export function getCurrentPrivacySettings() {
  return { ...privacySettings };
}

export function initializePrivacyUI() {
  privacySettings =
    getDefaultPrivacySettings();

  applySettingsToUI();

  updateLocalOnlyIndicator();
  updatePrivacyStatus();
  updatePrivacySummary();
  startClipboardCountdown();

  const settingIds = [
    "privacyAutoClearClipboard",
    "privacyClipboardSeconds",
    "privacyClearOnPageHide",
    "privacyClearSensitiveOnUnload",
    "privacyLocalOnly",
  ];

  settingIds.forEach((id) => {
    const element = getElement(id);

    element?.addEventListener(
      "change",
      handleSettingsChange,
    );
  });

  getElement("clearClipboardButton")
    ?.addEventListener(
      "click",
      handleManualClipboardClear,
    );

  window.addEventListener(
    "pagehide",
    handlePageHide,
  );

  window.addEventListener(
    "beforeunload",
    handleBeforeUnload,
  );
}