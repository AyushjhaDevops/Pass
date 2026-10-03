import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
  isServiceWorkerSupported,
  isOnline,
  getInstallPromptState,
  initializePwa,
} from "../../src/ui/pwa.js";

describe("PWA coverage tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports service worker support", () => {
    expect(typeof isServiceWorkerSupported()).toBe("boolean");
  });

  it("reports online status", () => {
    expect(typeof isOnline()).toBe("boolean");
  });

  it("starts without an install prompt", () => {
    expect(getInstallPromptState()).toEqual({
      available: false,
    });
  });

  it("initializes the PWA UI", () => {
    const addEventListenerSpy = vi.spyOn(
      window,
      "addEventListener",
    );

    initializePwa();

    expect(
      document.querySelector("#pwaContainer"),
    ).not.toBeNull();

    expect(addEventListenerSpy).toHaveBeenCalled();
  });

  it("creates the offline indicator", () => {
    initializePwa();

    const indicator = document.querySelector(
      "#pwaOfflineIndicator",
    );

    expect(indicator).not.toBeNull();
    expect(indicator.getAttribute("role")).toBe("status");
    expect(indicator.getAttribute("aria-live")).toBe("polite");
  });

  it("updates the connection status", () => {
  initializePwa();

  const indicator = document.querySelector(
    "#pwaOfflineIndicator",
  );

  const onlineState = vi
    .spyOn(navigator, "onLine", "get");

  onlineState.mockReturnValue(true);

  window.dispatchEvent(new Event("online"));

  expect(
    indicator.classList.contains("pwa-status-online"),
  ).toBe(true);

  expect(indicator.textContent).toContain("Online");

  onlineState.mockReturnValue(false);

  window.dispatchEvent(new Event("offline"));

  expect(
    indicator.classList.contains("pwa-status-offline"),
  ).toBe(true);

  expect(indicator.textContent).toContain("Offline");

  onlineState.mockRestore();
});

  it("does not duplicate the offline indicator", () => {
    initializePwa();
    initializePwa();

    expect(
      document.querySelectorAll(
        "#pwaOfflineIndicator",
      ).length,
    ).toBe(1);
  });

  it("does not duplicate the PWA container", () => {
    initializePwa();
    initializePwa();

    expect(
      document.querySelectorAll("#pwaContainer").length,
    ).toBe(1);
  });
});