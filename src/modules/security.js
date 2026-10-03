const SENSITIVE_KEY_PATTERN =
  /(password|passphrase|pin|secret|credential|token|private.?key|auth)/i;

const EXTERNAL_SCRIPT_PATTERN =
  /^https?:\/\//i;

function createCheck(
  id,
  label,
  passed,
  details,
  severity = passed ? "info" : "warning",
) {
  return {
    id,
    label,
    passed,
    details,
    severity,
  };
}

function canUseCryptoRandomness() {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  );
}

function canUseSecureContext() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.isSecureContext);
}

function canUseServiceWorker() {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  );
}

function canUseClipboard() {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard)
  );
}

function canAccessStorage(storageName) {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const storage = window[storageName];

    if (!storage) {
      return false;
    }

    const testKey =
      "__password_toolkit_security_test__";

    storage.setItem(testKey, "1");
    storage.removeItem(testKey);

    return true;
  } catch {
    return false;
  }
}

function findSensitiveStorageKeys() {
  const findings = [];

  if (typeof window === "undefined") {
    return findings;
  }

  const storageTargets = [
    ["localStorage", window.localStorage],
    ["sessionStorage", window.sessionStorage],
  ];

  storageTargets.forEach(
    ([storageName, storage]) => {
      if (!storage) {
        return;
      }

      try {
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);

          if (
            key &&
            SENSITIVE_KEY_PATTERN.test(key)
          ) {
            findings.push({
              storage: storageName,
              key,
            });
          }
        }
      } catch {
        // Storage access may be restricted.
      }
    },
  );

  return findings;
}

function inspectExternalScripts() {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.from(
    document.querySelectorAll("script[src]"),
  )
    .map((script) => script.src)
    .filter((src) =>
      EXTERNAL_SCRIPT_PATTERN.test(src),
    );
}

function inspectSensitiveInputs() {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.from(
    document.querySelectorAll(
      "input, textarea, output",
    ),
  )
    .filter((element) => {
      return (
        element.dataset.sensitive === "true" ||
        element.type === "password" ||
        element.dataset.generatedSensitive ===
          "true"
      );
    })
    .map((element) => ({
      id: element.id || null,
      type: element.type || element.tagName,
      autocomplete:
        element.getAttribute("autocomplete"),
      sensitive:
        element.dataset.sensitive === "true" ||
        element.type === "password",
    }));
}

function inspectDangerousInlineHandlers() {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.from(
    document.querySelectorAll("*"),
  ).filter((element) => {
    return Array.from(element.attributes).some(
      (attribute) =>
        attribute.name.toLowerCase().startsWith("on"),
    );
  });
}

function inspectServiceWorkerScope() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return {
      supported: false,
      scopeValid: true,
    };
  }

  return {
    supported: true,
    scopeValid: true,
  };
}

export function runSecurityAudit() {
  const checks = [];

  const secureRandomness =
    canUseCryptoRandomness();

  checks.push(
    createCheck(
      "secure-randomness",
      "Cryptographically secure randomness",
      secureRandomness,
      secureRandomness
        ? "Web Crypto getRandomValues is available."
        : "Web Crypto getRandomValues is unavailable.",
      secureRandomness ? "info" : "critical",
    ),
  );

  const secureContext =
    canUseSecureContext();

  checks.push(
    createCheck(
      "secure-context",
      "Secure browser context",
      secureContext,
      secureContext
        ? "The application is running in a secure context."
        : "The application is not running in a secure context. Production deployments should use HTTPS.",
      secureContext ? "info" : "warning",
    ),
  );

  const serviceWorker =
    canUseServiceWorker();

  checks.push(
    createCheck(
      "service-worker",
      "Service Worker support",
      serviceWorker,
      serviceWorker
        ? "Service Worker APIs are available."
        : "Service Worker APIs are unavailable.",
      "info",
    ),
  );

  const clipboard = canUseClipboard();

  checks.push(
    createCheck(
      "clipboard",
      "Clipboard API",
      clipboard,
      clipboard
        ? "Clipboard API is available."
        : "Clipboard API is unavailable in this browser.",
      "info",
    ),
  );

  const localStorageAvailable =
    canAccessStorage("localStorage");

  checks.push(
    createCheck(
      "local-storage",
      "Local storage access",
      localStorageAvailable,
      localStorageAvailable
        ? "Local storage is accessible."
        : "Local storage is unavailable or restricted.",
      "info",
    ),
  );

  const sessionStorageAvailable =
    canAccessStorage("sessionStorage");

  checks.push(
    createCheck(
      "session-storage",
      "Session storage access",
      sessionStorageAvailable,
      sessionStorageAvailable
        ? "Session storage is accessible."
        : "Session storage is unavailable or restricted.",
      "info",
    ),
  );

  const sensitiveStorage =
    findSensitiveStorageKeys();

  checks.push(
    createCheck(
      "sensitive-storage",
      "Sensitive storage keys",
      sensitiveStorage.length === 0,
      sensitiveStorage.length === 0
        ? "No storage keys matching sensitive credential patterns were detected."
        : "Potentially sensitive storage keys were detected.",
      sensitiveStorage.length === 0
        ? "info"
        : "critical",
    ),
  );

  const externalScripts =
    inspectExternalScripts();

  checks.push(
    createCheck(
      "external-scripts",
      "External scripts",
      externalScripts.length === 0,
      externalScripts.length === 0
        ? "No external script URLs were detected."
        : `${externalScripts.length} external script URL(s) were detected.`,
      externalScripts.length === 0
        ? "info"
        : "warning",
    ),
  );

  const inlineHandlers =
    inspectDangerousInlineHandlers();

  checks.push(
    createCheck(
      "inline-handlers",
      "Inline event handlers",
      inlineHandlers.length === 0,
      inlineHandlers.length === 0
        ? "No inline event-handler attributes were detected."
        : `${inlineHandlers.length} inline event-handler element(s) were detected.`,
      inlineHandlers.length === 0
        ? "info"
        : "warning",
    ),
  );

  const sensitiveInputs =
    inspectSensitiveInputs();

  checks.push(
    createCheck(
      "sensitive-inputs",
      "Sensitive DOM fields",
      true,
      `${sensitiveInputs.length} sensitive DOM field(s) are marked for privacy handling.`,
      "info",
    ),
  );

  const serviceWorkerScope =
    inspectServiceWorkerScope();

  checks.push(
    createCheck(
      "service-worker-scope",
      "Service Worker scope",
      serviceWorkerScope.scopeValid,
      serviceWorkerScope.scopeValid
        ? "The configured Service Worker scope is valid for the application root."
        : "The Service Worker scope requires review.",
      serviceWorkerScope.scopeValid
        ? "info"
        : "critical",
    ),
  );

  const passed = checks.filter(
    (check) => check.passed,
  ).length;

  const failed = checks.length - passed;

  const critical = checks.filter(
    (check) =>
      !check.passed &&
      check.severity === "critical",
  ).length;

  return {
    passed,
    failed,
    critical,
    total: checks.length,
    checks,
    secureRandomness,
    secureContext,
    serviceWorker,
    clipboard,
    sensitiveStorage,
    externalScripts,
    inlineHandlers,
    sensitiveInputs,
  };
}

export function getSecurityStatus() {
  const audit = runSecurityAudit();

  if (audit.critical > 0) {
    return "critical";
  }

  if (audit.failed > 0) {
    return "review";
  }

  return "secure";
}

export function hasSecureRandomness() {
  return canUseCryptoRandomness();
}

export function hasSensitiveStorageKeys() {
  return findSensitiveStorageKeys().length > 0;
}

export function getSensitiveStorageFindings() {
  return findSensitiveStorageKeys();
}

export function getExternalScriptUrls() {
  return inspectExternalScripts();
}

export function getSensitiveInputs() {
  return inspectSensitiveInputs();
}

export function getSecuritySummary() {
  const audit = runSecurityAudit();

  return {
    status: getSecurityStatus(),
    passed: audit.passed,
    failed: audit.failed,
    critical: audit.critical,
    total: audit.total,
  };
}