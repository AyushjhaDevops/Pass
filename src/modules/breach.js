const HIBP_API_BASE =
  "https://api.pwnedpasswords.com/range";

const HASH_PREFIX_LENGTH = 5;
const REQUEST_TIMEOUT_MS = 8000;

function validatePassword(password) {
  if (typeof password !== "string") {
    throw new TypeError("Password must be a string.");
  }

  if (password.length === 0) {
    throw new Error("Password cannot be empty.");
  }
}

function getCrypto() {
  if (
    typeof crypto === "undefined" ||
    !crypto.subtle
  ) {
    throw new Error(
      "Web Crypto API is not available.",
    );
  }

  return crypto;
}

function bytesToHex(buffer) {
  return Array.from(
    new Uint8Array(buffer),
    (byte) =>
      byte.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * Hash a password locally using SHA-1.
 *
 * The password itself never leaves this function.
 */
export async function hashPassword(password) {
  validatePassword(password);

  const cryptoApi = getCrypto();

  const encoded = new TextEncoder().encode(password);

  const digest = await cryptoApi.subtle.digest(
    "SHA-1",
    encoded,
  );

  return bytesToHex(digest).toUpperCase();
}

/**
 * Split a SHA-1 hash into the five-character
 * HIBP prefix and the remaining suffix.
 */
export function splitHash(hash) {
  if (typeof hash !== "string") {
    throw new TypeError("Hash must be a string.");
  }

  const normalized = hash.trim().toUpperCase();

  if (!/^[A-F0-9]{40}$/.test(normalized)) {
    throw new Error(
      "Invalid SHA-1 hash.",
    );
  }

  return {
    prefix: normalized.slice(
      0,
      HASH_PREFIX_LENGTH,
    ),
    suffix: normalized.slice(
      HASH_PREFIX_LENGTH,
    ),
  };
}

/**
 * Parse the HIBP range response.
 *
 * Expected format:
 *
 * ABCDEF123...:42
 * 123456789...:7
 */
export function parseBreachResponse(responseText) {
  if (typeof responseText !== "string") {
    throw new TypeError(
      "Breach response must be a string.",
    );
  }

  const results = [];

  for (const line of responseText.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const separatorIndex =
      trimmed.indexOf(":");

    if (separatorIndex <= 0) {
      continue;
    }

    const suffix = trimmed
      .slice(0, separatorIndex)
      .trim()
      .toUpperCase();

    const countText = trimmed
      .slice(separatorIndex + 1)
      .trim();

    if (
      !/^[A-F0-9]{35}$/.test(suffix) ||
      !/^\d+$/.test(countText)
    ) {
      continue;
    }

    results.push({
      suffix,
      count: Number(countText),
    });
  }

  return results;
}

/**
 * Look up a hash prefix against HIBP.
 *
 * IMPORTANT:
 * Only the first five characters of the SHA-1 hash
 * are sent over the network.
 */
export async function queryBreachRange(
  prefix,
  options = {},
) {
  if (typeof prefix !== "string") {
    throw new TypeError(
      "Hash prefix must be a string.",
    );
  }

  const normalizedPrefix =
    prefix.trim().toUpperCase();

  if (
    !/^[A-F0-9]{5}$/.test(
      normalizedPrefix,
    )
  ) {
    throw new Error(
      "Invalid hash prefix.",
    );
  }

  if (
    typeof fetch !== "function"
  ) {
    throw new Error(
      "Fetch API is not available.",
    );
  }

  const timeout =
    Number.isFinite(options.timeout)
      ? Math.max(1, options.timeout)
      : REQUEST_TIMEOUT_MS;

  const controller =
    typeof AbortController !== "undefined"
      ? new AbortController()
      : null;

  let timeoutId = null;

  if (controller) {
    timeoutId = setTimeout(
      () => controller.abort(),
      timeout,
    );
  }

  try {
    const response = await fetch(
      `${HIBP_API_BASE}/${normalizedPrefix}`,
      {
        method: "GET",
        headers: {
          "Add-Padding": "true",
        },
        cache: "no-store",
        credentials: "omit",
        signal: controller?.signal,
      },
    );

    if (response.status === 404) {
      return [];
    }

    if (response.status === 429) {
      throw new Error(
        "Breach service rate limit reached.",
      );
    }

    if (!response.ok) {
      throw new Error(
        `Breach service returned HTTP ${response.status}.`,
      );
    }

    const text = await response.text();

    return parseBreachResponse(text);
  } catch (error) {
    if (
      error?.name === "AbortError"
    ) {
      throw new Error(
        "Breach lookup timed out.",
      );
    }

    throw error;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Perform a complete privacy-preserving
 * breach lookup.
 *
 * The plaintext password is never sent.
 */
export async function checkPasswordBreach(
  password,
  options = {},
) {
  validatePassword(password);

  const hash =
    await hashPassword(password);

  const {
    prefix,
    suffix,
  } = splitHash(hash);

  const matches =
    await queryBreachRange(
      prefix,
      options,
    );

  const match = matches.find(
    (entry) =>
      entry.suffix === suffix,
  );

  return {
    breached: Boolean(match),
    count: match?.count ?? 0,
    prefix,
  };
}

export function getBreachServiceInfo() {
  return {
    provider:
      "Have I Been Pwned - Pwned Passwords",
    hashAlgorithm: "SHA-1",
    prefixLength: HASH_PREFIX_LENGTH,
    sendsFullPassword: false,
    sendsFullHash: false,
    responsePadding: true,
    storesResults: false,
  };
}

export function isBreachCheckingSupported() {
  return (
    typeof crypto !== "undefined" &&
    Boolean(crypto.subtle) &&
    typeof fetch === "function"
  );
}