import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  copyToClipboard,
  clearClipboard,
  cancelClipboardClear,
  getClipboardState,
  getRemainingClipboardSeconds,
  isClipboardApiAvailable,
} from "../../src/modules/clipboard.js";

describe("Clipboard integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cancelClipboardClear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("detects clipboard support", () => {
    expect(isClipboardApiAvailable()).toBe(true);
  });

  it("copies text to the clipboard", async () => {
    await copyToClipboard("TestPassword123!");

    expect(
      navigator.clipboard.writeText,
    ).toHaveBeenCalledWith("TestPassword123!");
  });

  it("starts an automatic clear timer", async () => {
    await copyToClipboard("Secret123!", {
      clearAfter: 30000,
    });

    const state = getClipboardState();

    expect(state.active).toBe(true);
    expect(state.expiresAt).toBeGreaterThan(Date.now());

    vi.advanceTimersByTime(30000);

    await Promise.resolve();

    expect(
      navigator.clipboard.writeText,
    ).toHaveBeenLastCalledWith("");
  });

  it("reports remaining clipboard time", async () => {
    await copyToClipboard("Secret123!", {
      clearAfter: 30000,
    });

    vi.advanceTimersByTime(10000);

    const remaining = getRemainingClipboardSeconds();

    expect(remaining).toBeLessThanOrEqual(20);
    expect(remaining).toBeGreaterThanOrEqual(19);
  });

  it("can clear the clipboard manually", async () => {
    const result = await clearClipboard();

    expect(result).toBe(true);
    expect(
      navigator.clipboard.writeText,
    ).toHaveBeenCalledWith("");
  });

  it("handles clipboard failures", async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(
      new Error("Clipboard denied"),
    );

    await expect(
      copyToClipboard("secret"),
    ).rejects.toThrow("Clipboard denied");
  });
});