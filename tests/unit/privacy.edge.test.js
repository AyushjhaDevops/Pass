import { describe, expect, it } from "vitest";

import {
  getDefaultPrivacySettings,
  validatePrivacySettings,
  sanitizePrivacySettings,
  getPrivacyStatus,
  getPrivacySummary,
  createPrivacySettingsSnapshot,
} from "../../src/modules/privacy.js";

describe("Privacy regression tests", () => {
  it("keeps privacy defaults enabled", () => {
    const settings = getDefaultPrivacySettings();

    expect(settings.autoClearClipboard).toBe(true);
    expect(settings.clearOnPageHide).toBe(true);
    expect(settings.clearSensitiveFieldsOnUnload).toBe(true);
    expect(settings.localOnlyMode).toBe(true);
  });

  it("rejects malformed settings", () => {
    expect(validatePrivacySettings(null)).toBe(false);
    expect(validatePrivacySettings({})).toBe(false);
  });

  it("sanitizes invalid clipboard timeout", () => {
    const settings = sanitizePrivacySettings({
      clipboardClearSeconds: 999999,
    });

    expect(settings.clipboardClearSeconds).toBe(30);
  });

  it("does not claim persistent sensitive storage", () => {
    const status = getPrivacyStatus();

    expect(status.passwordStorage).toBe(false);
    expect(status.pinStorage).toBe(false);
    expect(status.passphraseStorage).toBe(false);
    expect(status.persistentSensitiveStorage).toBe(false);
  });

  it("returns a privacy summary", () => {
    const summary = getPrivacySummary();

    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBeGreaterThan(0);
  });

  it("creates an immutable settings snapshot", () => {
    const snapshot = createPrivacySettingsSnapshot();

    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});