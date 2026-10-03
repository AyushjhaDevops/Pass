// ============================================================
// ACCESSIBILITY & UI HARDENING — PHASE 8
// ============================================================

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getElement(selector) {
  return document.querySelector(selector);
}


function createElementIfMissing(
  selector,
  tagName,
  attributes = {},
) {
  let element = getElement(selector);

  if (element) {
    return element;
  }

  element = document.createElement(tagName);

  Object.entries(attributes).forEach(
    ([name, value]) => {
      element.setAttribute(name, value);
    },
  );

  return element;
}


// ============================================================
// SKIP LINK
// ============================================================

function initializeSkipLink() {
  const main = getElement("main");

  if (!main) {
    return;
  }

  if (!main.id) {
    main.id = "main-content";
  }

  let skipLink = getElement("#skipToContent");

  if (!skipLink) {
    skipLink = document.createElement("a");

    skipLink.id = "skipToContent";
    skipLink.href = `#${main.id}`;
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to main content";

    document.body.prepend(skipLink);
  }

  if (!main.hasAttribute("tabindex")) {
    main.setAttribute("tabindex", "-1");
  }
}


// ============================================================
// PASSWORD VISIBILITY
// ============================================================

function initializePasswordVisibility() {
  const input = getElement("#passwordInput");
  const button = getElement("#togglePasswordVisibility");

  if (!input || !button) {
    return;
  }

  function updateState() {
    const visible = input.type === "text";

    button.setAttribute(
      "aria-label",
      visible
        ? "Hide password"
        : "Show password",
    );

    button.setAttribute(
      "title",
      visible
        ? "Hide password"
        : "Show password",
    );

    button.setAttribute(
      "aria-pressed",
      String(visible),
    );

    button.textContent = visible
      ? "🙈"
      : "👁️";
  }

  updateState();

  button.addEventListener(
    "click",
    () => {
      const visible = input.type === "text";

      input.type = visible
        ? "password"
        : "text";

      updateState();

      input.focus();
    },
  );
}


// ============================================================
// RANGE INPUT ACCESSIBILITY
// ============================================================

function initializeRangeAccessibility() {
  const ranges = document.querySelectorAll(
    "input[type='range']",
  );

  ranges.forEach((range) => {
    if (!range.hasAttribute("aria-valuemin")) {
      range.setAttribute(
        "aria-valuemin",
        range.min || "0",
      );
    }

    if (!range.hasAttribute("aria-valuemax")) {
      range.setAttribute(
        "aria-valuemax",
        range.max || "100",
      );
    }

    function updateRange() {
      range.setAttribute(
        "aria-valuenow",
        range.value,
      );

      if (
        range.id === "passwordLength"
      ) {
        range.setAttribute(
          "aria-label",
          "Password length",
        );
      }

      if (
        range.id === "passphraseWordCount"
      ) {
        range.setAttribute(
          "aria-label",
          "Passphrase word count",
        );
      }

      const outputId =
        range.id === "passwordLength"
          ? "passwordLengthValue"
          : range.id === "passphraseWordCount"
            ? "passphraseWordCountValue"
            : null;

      if (outputId) {
        range.setAttribute(
          "aria-valuetext",
          `${range.value}`,
        );

        const output =
          getElement(`#${outputId}`);

        if (output) {
          output.setAttribute(
            "aria-live",
            "polite",
          );
        }
      }
    }

    updateRange();

    range.addEventListener(
      "input",
      updateRange,
    );
  });
}


// ============================================================
// CHECKBOX ACCESSIBILITY
// ============================================================

function initializeCheckboxes() {
  const checkboxes =
    document.querySelectorAll(
      "input[type='checkbox']",
    );

  checkboxes.forEach((checkbox) => {
    if (
      !checkbox.hasAttribute("aria-checked")
    ) {
      checkbox.setAttribute(
        "aria-checked",
        String(checkbox.checked),
      );
    }

    checkbox.addEventListener(
      "change",
      () => {
        checkbox.setAttribute(
          "aria-checked",
          String(checkbox.checked),
        );
      },
    );
  });
}


// ============================================================
// GENERATED VALUE ACCESSIBILITY
// ============================================================

function initializeGeneratedValues() {
  const generatedElements =
    document.querySelectorAll(
      "[data-generated-sensitive='true']",
    );

  generatedElements.forEach(
    (element) => {
      element.setAttribute(
        "aria-live",
        "polite",
      );

      element.setAttribute(
        "aria-atomic",
        "true",
      );

      element.setAttribute(
        "role",
        "status",
      );
    },
  );
}


// ============================================================
// BUTTON HARDENING
// ============================================================

function initializeButtonAccessibility() {
  const buttons =
    document.querySelectorAll("button");

  buttons.forEach((button) => {
    if (!button.type) {
      button.type = "button";
    }

    if (
      !button.hasAttribute("aria-disabled") &&
      button.disabled
    ) {
      button.setAttribute(
        "aria-disabled",
        "true",
      );
    }
  });
}


// ============================================================
// PASSWORD INPUT ACCESSIBILITY
// ============================================================

function initializePasswordInput() {
  const passwordInput =
    getElement("#passwordInput");

  if (!passwordInput) {
    return;
  }

  passwordInput.setAttribute(
    "autocomplete",
    "off",
  );

  passwordInput.setAttribute(
    "spellcheck",
    "false",
  );

  passwordInput.setAttribute(
    "autocapitalize",
    "off",
  );

  passwordInput.setAttribute(
    "autocorrect",
    "off",
  );

  passwordInput.setAttribute(
    "aria-label",
    "Password to analyze",
  );
}


// ============================================================
// GENERATED PASSWORD ACCESSIBILITY
// ============================================================

function initializeGeneratedPassword() {
  const output =
    getElement("#generatedPassword");

  if (!output) {
    return;
  }

  output.setAttribute(
    "aria-label",
    "Generated password",
  );

  output.setAttribute(
    "role",
    "status",
  );

  output.setAttribute(
    "aria-live",
    "polite",
  );

  output.setAttribute(
    "aria-atomic",
    "true",
  );
}


// ============================================================
// PASSPHRASE ACCESSIBILITY
// ============================================================

function initializePassphrase() {
  const output =
    getElement("#passphraseOutput");

  if (!output) {
    return;
  }

  output.setAttribute(
    "aria-label",
    "Generated passphrase",
  );

  output.setAttribute(
    "role",
    "status",
  );

  output.setAttribute(
    "aria-live",
    "polite",
  );

  output.setAttribute(
    "aria-atomic",
    "true",
  );
}


// ============================================================
// PIN ACCESSIBILITY
// ============================================================

function initializePinAccessibility() {
  const pin =
    getElement("#generatedPin");

  if (!pin) {
    return;
  }

  pin.setAttribute(
    "autocomplete",
    "off",
  );

  pin.setAttribute(
    "spellcheck",
    "false",
  );

  pin.setAttribute(
    "inputmode",
    "numeric",
  );

  pin.setAttribute(
    "aria-label",
    "Generated PIN",
  );

  pin.setAttribute(
    "aria-describedby",
    "pinAccessibilityHelp",
  );

  let help =
    getElement("#pinAccessibilityHelp");

  if (!help) {
    help = document.createElement("span");

    help.id = "pinAccessibilityHelp";
    help.className = "visually-hidden";
    help.textContent =
      "This PIN is generated locally in your browser.";

    pin.parentElement?.appendChild(help);
  }
}


// ============================================================
// STRENGTH ACCESSIBILITY
// ============================================================

function initializeStrengthAccessibility() {
  const strengthBar =
    getElement("#strengthBar");

  if (strengthBar) {
    strengthBar.setAttribute(
      "role",
      "progressbar",
    );

    strengthBar.setAttribute(
      "aria-label",
      "Password strength",
    );

    strengthBar.setAttribute(
      "aria-valuemin",
      "0",
    );

    strengthBar.setAttribute(
      "aria-valuemax",
      "100",
    );

    if (!strengthBar.hasAttribute("aria-valuenow")) {
      strengthBar.setAttribute(
        "aria-valuenow",
        "0",
      );
    }
  }

  const score =
    getElement("#scoreValue");

  if (score) {
    score.setAttribute(
      "aria-live",
      "polite",
    );
  }

  const strength =
    getElement("#strengthLabel");

  if (strength) {
    strength.setAttribute(
      "aria-live",
      "polite",
    );
  }
}


// ============================================================
// SECURITY CHECK ACCESSIBILITY
// ============================================================

function initializeSecurityChecks() {
  const checks =
    document.querySelectorAll(
      ".check-item, .pattern-item",
    );

  checks.forEach((check) => {
    if (!check.hasAttribute("role")) {
      check.setAttribute(
        "role",
        "status",
      );
    }
  });
}


// ============================================================
// FOCUS MANAGEMENT
// ============================================================

function initializeFocusManagement() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Tab") {
        return;
      }

      document.body.classList.add(
        "keyboard-navigation",
      );
    },
  );

  document.addEventListener(
    "mousedown",
    () => {
      document.body.classList.remove(
        "keyboard-navigation",
      );
    },
  );
}


// ============================================================
// ESCAPE KEY HANDLING
// ============================================================

function initializeEscapeHandling() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") {
        return;
      }

      const active =
        document.activeElement;

      if (
        active &&
        active.matches(
          "input[type='text'], input[type='password']",
        )
      ) {
        active.blur();
      }
    },
  );
}


// ============================================================
// FORM VALIDATION FEEDBACK
// ============================================================

function initializeValidationFeedback() {
  const passwordInput =
    getElement("#passwordInput");

  if (!passwordInput) {
    return;
  }

  passwordInput.addEventListener(
    "invalid",
    () => {
      passwordInput.setAttribute(
        "aria-invalid",
        "true",
      );
    },
  );

  passwordInput.addEventListener(
    "input",
    () => {
      passwordInput.setAttribute(
        "aria-invalid",
        "false",
      );
    },
  );
}


// ============================================================
// NOTIFICATION ACCESSIBILITY
// ============================================================

function initializeNotifications() {
  const container =
    createElementIfMissing(
      "#notificationContainer",
      "div",
      {
        id: "notificationContainer",
        "class": "notification-container",
        "aria-live": "polite",
        "aria-atomic": "true",
      },
    );

  if (!container.parentElement) {
    document.body.appendChild(container);
  }

  container.setAttribute(
    "aria-live",
    "polite",
  );

  container.setAttribute(
    "aria-atomic",
    "true",
  );
}


// ============================================================
// REDUCED MOTION
// ============================================================

function initializeReducedMotion() {
  const mediaQuery =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );

  if (!mediaQuery) {
    return;
  }

  function updatePreference() {
    document.documentElement.dataset.reducedMotion =
      mediaQuery.matches
        ? "true"
        : "false";
  }

  updatePreference();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener(
      "change",
      updatePreference,
    );
  }
}


// ============================================================
// HIGH CONTRAST / FORCED COLORS
// ============================================================

function initializeDisplayPreferences() {
  const contrastQuery =
    window.matchMedia?.(
      "(prefers-contrast: more)",
    );

  if (contrastQuery) {
    document.documentElement.dataset.highContrast =
      contrastQuery.matches
        ? "true"
        : "false";

    if (
      typeof contrastQuery.addEventListener ===
      "function"
    ) {
      contrastQuery.addEventListener(
        "change",
        (event) => {
          document.documentElement.dataset.highContrast =
            event.matches
              ? "true"
              : "false";
        },
      );
    }
  }

  const forcedColors =
    window.matchMedia?.(
      "(forced-colors: active)",
    );

  if (forcedColors) {
    document.documentElement.dataset.forcedColors =
      forcedColors.matches
        ? "true"
        : "false";

    if (
      typeof forcedColors.addEventListener ===
      "function"
    ) {
      forcedColors.addEventListener(
        "change",
        (event) => {
          document.documentElement.dataset.forcedColors =
            event.matches
              ? "true"
              : "false";
        },
      );
    }
  }
}


// ============================================================
// TAB ORDER SAFETY
// ============================================================

function initializeTabOrderSafety() {
  const focusable =
    document.querySelectorAll(
      FOCUSABLE_SELECTOR,
    );

  focusable.forEach((element) => {
    const tabindex =
      element.getAttribute("tabindex");

    if (
      tabindex &&
      Number(tabindex) < -1
    ) {
      element.setAttribute(
        "tabindex",
        "-1",
      );
    }
  });
}


// ============================================================
// PAGE LANGUAGE
// ============================================================

function initializeDocumentLanguage() {
  if (!document.documentElement.lang) {
    document.documentElement.lang = "en";
  }
}


// ============================================================
// ACCESSIBILITY INITIALIZATION
// ============================================================

export function initializeAccessibility() {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  initializeDocumentLanguage();
  initializeSkipLink();
  initializePasswordVisibility();
  initializeRangeAccessibility();
  initializeCheckboxes();
  initializeGeneratedValues();
  initializeButtonAccessibility();
  initializePasswordInput();
  initializeGeneratedPassword();
  initializePassphrase();
  initializePinAccessibility();
  initializeStrengthAccessibility();
  initializeSecurityChecks();
  initializeFocusManagement();
  initializeEscapeHandling();
  initializeValidationFeedback();
  initializeNotifications();
  initializeReducedMotion();
  initializeDisplayPreferences();
  initializeTabOrderSafety();
}