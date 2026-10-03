const DEFAULT_CLEAR_DELAY = 30_000;

let clearTimer = null;
let clipboardState = {
  active: false,
  expiresAt: null,
};

function validateText(text) {
  if (typeof text !== "string") {
    throw new TypeError("Clipboard content must be a string.");
  }
}

function getClipboardApi() {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard
  ) {
    throw new Error("Clipboard API is not available.");
  }

  return navigator.clipboard;
}

export async function copyToClipboard(
  text,
  options = {},
) {
  validateText(text);

  const clipboard = getClipboardApi();

  const clearAfter =
    Number.isFinite(options.clearAfter)
      ? Math.max(0, options.clearAfter)
      : DEFAULT_CLEAR_DELAY;

  await clipboard.writeText(text);

  cancelClipboardClear();

  if (clearAfter > 0) {
    clipboardState = {
      active: true,
      expiresAt: Date.now() + clearAfter,
    };

    clearTimer = window.setTimeout(
      async () => {
        await clearClipboard();
      },
      clearAfter,
    );
  }

  return {
    clearedAutomatically: clearAfter > 0,
    clearAfter,
  };
}

export async function clearClipboard() {
  if (!navigator.clipboard) {
    cancelClipboardClear();

    return false;
  }

  try {
    /*
     * Clipboard API cannot guarantee that another application
     * has not replaced our clipboard contents.
     *
     * We therefore clear the clipboard by writing an empty string.
     */
    await navigator.clipboard.writeText("");

    clipboardState = {
      active: false,
      expiresAt: null,
    };

    cancelClipboardTimerOnly();

    return true;
  } catch {
    cancelClipboardTimerOnly();

    clipboardState = {
      active: false,
      expiresAt: null,
    };

    return false;
  }
}

function cancelClipboardTimerOnly() {
  if (clearTimer !== null) {
    window.clearTimeout(clearTimer);
    clearTimer = null;
  }
}

export function cancelClipboardClear() {
  cancelClipboardTimerOnly();

  clipboardState = {
    active: false,
    expiresAt: null,
  };
}

export function getClipboardState() {
  return {
    active: clipboardState.active,
    expiresAt: clipboardState.expiresAt,
  };
}

export function getRemainingClipboardSeconds() {
  if (!clipboardState.active || !clipboardState.expiresAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(
      (clipboardState.expiresAt - Date.now()) / 1000,
    ),
  );
}

export function isClipboardApiAvailable() {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard)
  );
}