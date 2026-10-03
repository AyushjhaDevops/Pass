import {
  describe,
  expect,
  it,
} from "vitest";


import {
  getDefaultPrivacySettings,
  validatePrivacySettings,
  sanitizePrivacySettings,
  getPrivacyStatus,
  getPrivacySummary,
} from "../src/modules/privacy.js";

describe("Privacy module", () => {
  describe("getDefaultPrivacySettings", () => {
    it("returns secure privacy defaults", () => {
      const settings =
        getDefaultPrivacySettings();

      expect(
        settings.autoClearClipboard,
      ).toBe(true);

      expect(
        settings.clipboardClearSeconds,
      ).toBe(30);

      expect(
        settings.clearOnPageHide,
      ).toBe(true);

      expect(
        settings.clearSensitiveFieldsOnUnload,
      ).toBe(true);

      expect(
        settings.localOnlyMode,
      ).toBe(true);
    });
  });

  describe("validatePrivacySettings", () => {
    it("accepts valid settings", () => {
      expect(
        validatePrivacySettings(
          getDefaultPrivacySettings(),
        ),
      ).toBe(true);
    });

    it("rejects null", () => {
      expect(
        validatePrivacySettings(null),
      ).toBe(false);
    });

    it("rejects invalid clipboard timeout", () => {
      expect(
        validatePrivacySettings({
          ...getDefaultPrivacySettings(),
          clipboardClearSeconds: 999,
        }),
      ).toBe(false);
    });

    it("rejects invalid boolean values", () => {
      expect(
        validatePrivacySettings({
          ...getDefaultPrivacySettings(),
          localOnlyMode: "yes",
        }),
      ).toBe(false);
    });
  });

  describe("sanitizePrivacySettings", () => {
    it("restores secure defaults for invalid values", () => {
      const settings =
        sanitizePrivacySettings({
          clipboardClearSeconds: 999,
          autoClearClipboard: false,
        });

      expect(
        settings.clipboardClearSeconds,
      ).toBe(30);

      expect(
        settings.autoClearClipboard,
      ).toBe(false);

      expect(
        settings.clearOnPageHide,
      ).toBe(true);
    });

    it("accepts supported clipboard timeout", () => {
      const settings =
        sanitizePrivacySettings({
          clipboardClearSeconds: 60,
        });

      expect(
        settings.clipboardClearSeconds,
      ).toBe(60);
    });
  });

  describe("getPrivacyStatus", () => {
    it("reports local processing", () => {
      const status =
        getPrivacyStatus();

      expect(status.localOnly).toBe(true);
      expect(
        status.networkTransmission,
      ).toBe(false);

      expect(
        status.passwordStorage,
      ).toBe(false);

      expect(
        status.pinStorage,
      ).toBe(false);

      expect(
        status.passphraseStorage,
      ).toBe(false);

      expect(
        status.persistentSensitiveStorage,
      ).toBe(false);
    });
  });

  describe("getPrivacySummary", () => {
    it("returns privacy explanations", () => {
      const summary =
        getPrivacySummary();

      expect(
        Array.isArray(summary),
      ).toBe(true);

      expect(summary.length).toBeGreaterThan(0);

      expect(
        summary.some((item) =>
          item.toLowerCase().includes("local"),
        ),
      ).toBe(true);

      expect(
        summary.some((item) =>
          item.toLowerCase().includes("clipboard"),
        ),
      ).toBe(true);
    });
  });
});