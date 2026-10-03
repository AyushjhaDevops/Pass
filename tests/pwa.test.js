import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  initializePwa,
  isOnline,
  isServiceWorkerSupported,
  getInstallPromptState,
} from "../src/ui/pwa.js";

describe("PWA utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes without throwing", () => {
    expect(() => {
      initializePwa();
    }).not.toThrow();
  });

  it("reports service worker support correctly", () => {
    const supported =
      isServiceWorkerSupported();

    expect(typeof supported).toBe("boolean");
  });

  it("reports the browser online state", () => {
    expect(typeof isOnline()).toBe("boolean");
  });

  it("starts without an install prompt", () => {
    const state =
      getInstallPromptState();

    expect(state).toEqual({
      available: false,
    });
  });

  it("creates the PWA status container", () => {
    initializePwa();

    const container =
      document.querySelector(
        "#pwaContainer",
      );

    expect(container).not.toBeNull();
  });

  it("creates the offline status indicator", () => {
    initializePwa();

    const indicator =
      document.querySelector(
        "#pwaOfflineIndicator",
      );

    expect(indicator).not.toBeNull();

    expect(
      indicator?.getAttribute("role"),
    ).toBe("status");

    expect(
      indicator?.getAttribute("aria-live"),
    ).toBe("polite");
  });

  it("does not create duplicate PWA containers", () => {
    initializePwa();
    initializePwa();

    const containers =
      document.querySelectorAll(
        "#pwaContainer",
      );

    expect(containers).toHaveLength(1);
  });
});