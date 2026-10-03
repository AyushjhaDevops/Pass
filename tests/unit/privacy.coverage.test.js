import { beforeEach, describe, expect, it } from "vitest";

import {
  getDefaultPrivacySettings,
  getPrivacySettings,
  validatePrivacySettings,
  sanitizePrivacySettings,
  isSensitiveElement,
  clearSensitiveElement,
  clearSensitiveElements,
  clearSensitiveStorage,
  getPrivacyStatus,
  getPrivacySummary,
  createPrivacySettingsSnapshot,
} from "../../src/modules/privacy.js";

describe("Privacy module coverage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the default privacy settings", () => {
    const settings = getDefaultPrivacySettings();

    expect(settings).toEqual({
      autoClearClipboard: true,
      clipboardClearSeconds: 30,
      clearOnPageHide: true,
      clearSensitiveFieldsOnUnload: true,
      localOnlyMode: true,
    });
  });

  it("returns fresh privacy settings objects", () => {
    const first = getPrivacySettings();
    const second = getPrivacySettings();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it("rejects invalid privacy settings", () => {
    expect(validatePrivacySettings(null)).toBe(false);
    expect(validatePrivacySettings(undefined)).toBe(false);
    expect(validatePrivacySettings("invalid")).toBe(false);

    expect(
      validatePrivacySettings({
        autoClearClipboard: "yes",
        clipboardClearSeconds: 30,
        clearOnPageHide: true,
        clearSensitiveFieldsOnUnload: true,
        localOnlyMode: true,
      }),
    ).toBe(false);

    expect(
      validatePrivacySettings({
        autoClearClipboard: true,
        clipboardClearSeconds: 999,
        clearOnPageHide: true,
        clearSensitiveFieldsOnUnload: true,
        localOnlyMode: true,
      }),
    ).toBe(false);
  });

  it("accepts valid privacy settings", () => {
    expect(
      validatePrivacySettings({
        autoClearClipboard: true,
        clipboardClearSeconds: 60,
        clearOnPageHide: false,
        clearSensitiveFieldsOnUnload: true,
        localOnlyMode: true,
      }),
    ).toBe(true);
  });

  it("sanitizes invalid and missing settings", () => {
    expect(
      sanitizePrivacySettings({
        autoClearClipboard: false,
        clipboardClearSeconds: 999,
        clearOnPageHide: false,
        clearSensitiveFieldsOnUnload: false,
        localOnlyMode: false,
      }),
    ).toEqual({
      autoClearClipboard: false,
      clipboardClearSeconds: 30,
      clearOnPageHide: false,
      clearSensitiveFieldsOnUnload: false,
      localOnlyMode: false,
    });
  });

  it("accepts every supported clipboard timeout", () => {
    for (const seconds of [10, 15, 30, 60, 120]) {
      expect(
        sanitizePrivacySettings({
          clipboardClearSeconds: seconds,
        }).clipboardClearSeconds,
      ).toBe(seconds);
    }
  });

  it("detects sensitive elements", () => {
    expect(isSensitiveElement(null)).toBe(false);
    expect(isSensitiveElement(undefined)).toBe(false);
    expect(isSensitiveElement({})).toBe(false);

    const sensitiveData = document.createElement("div");
    sensitiveData.dataset.sensitive = "true";

    expect(isSensitiveElement(sensitiveData)).toBe(true);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";

    expect(isSensitiveElement(passwordInput)).toBe(true);

    const attributeElement = document.createElement("div");
    attributeElement.setAttribute("data-sensitive", "");

    expect(isSensitiveElement(attributeElement)).toBe(true);

    const normalElement = document.createElement("div");

    expect(isSensitiveElement(normalElement)).toBe(false);
  });

  it("clears sensitive input values", () => {
    const input = document.createElement("input");
    input.type = "password";
    input.value = "SecretPassword123!";

    clearSensitiveElement(input);

    expect(input.value).toBe("");
  });

  it("clears generated sensitive text", () => {
    const element = document.createElement("div");

    element.dataset.sensitive = "true";
    element.dataset.generatedSensitive = "true";
    element.textContent = "GeneratedSecret123!";

    clearSensitiveElement(element);

    expect(element.textContent).toBe("");
  });

  it("does nothing for non-sensitive elements", () => {
    const element = document.createElement("div");
    element.textContent = "normal content";

    clearSensitiveElement(element);

    expect(element.textContent).toBe("normal content");
  });

  it("clears sensitive elements from a root", () => {
    document.body.innerHTML = `
      <input
        id="password"
        type="password"
        value="secret"
      />

      <input
        id="token"
        data-sensitive="true"
        value="token"
      />

      <div id="normal">normal</div>
    `;

    const count = clearSensitiveElements();

    expect(count).toBe(2);
    expect(document.querySelector("#password").value).toBe("");
    expect(document.querySelector("#token").value).toBe("");
    expect(document.querySelector("#normal").textContent).toBe("normal");
  });

  it("returns zero for an invalid root", () => {
    expect(clearSensitiveElements(null)).toBe(0);
    expect(clearSensitiveElements({})).toBe(0);
  });

  it("does not count already-empty sensitive elements", () => {
    document.body.innerHTML = `
      <input
        type="password"
        value=""
      />
    `;

    expect(clearSensitiveElements()).toBe(0);
  });

  it("returns safe storage clearing status", () => {
    localStorage.setItem("theme", "dark");

    expect(clearSensitiveStorage()).toEqual({
      localStorageCleared: false,
      sessionStorageCleared: false,
      indexedDBCleared: false,
      cookiesCleared: false,
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("reports privacy status", () => {
    const status = getPrivacyStatus();

    expect(status.localOnly).toBe(true);
    expect(status.networkTransmission).toBe(false);
    expect(status.passwordStorage).toBe(false);
    expect(status.pinStorage).toBe(false);
    expect(status.passphraseStorage).toBe(false);
    expect(status.persistentSensitiveStorage).toBe(false);
    expect(typeof status.clipboardAutoClearSupported).toBe("boolean");
  });

  it("returns the privacy summary", () => {
    const summary = getPrivacySummary();

    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBe(7);
    expect(summary.join(" ")).toContain(
      "Passwords are processed locally",
    );
  });

  it("creates immutable privacy snapshots", () => {
    const snapshot = createPrivacySettingsSnapshot({
      autoClearClipboard: false,
      clipboardClearSeconds: 60,
    });

    expect(snapshot.autoClearClipboard).toBe(false);
    expect(snapshot.clipboardClearSeconds).toBe(60);

    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});