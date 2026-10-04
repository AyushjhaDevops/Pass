import {
  checkPasswordBreach,
  isBreachCheckingSupported,
} from "../modules/breach.js";

import {
  showNotification,
} from "./notifications.js";

let initialized = false;

function getElement(selector) {
  return document.querySelector(selector);
}

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function setHidden(element, hidden) {
  if (element) {
    element.hidden = hidden;
  }
}

function getPasswordInput() {
  return getElement("#passwordInput");
}

function getConsentCheckbox() {
  return getElement(
    "#breachCheckConsent",
  );
}

function getCheckButton() {
  return getElement(
    "#checkBreachButton",
  );
}

function getStatusElement() {
  return getElement(
    "#breachCheckStatus",
  );
}

function getResultElement() {
  return getElement(
    "#breachCheckResult",
  );
}

function getPrefixElement() {
  return getElement(
    "#breachHashPrefix",
  );
}

function resetResult() {
  const result = getResultElement();

  setHidden(result, true);

  setText(
    getStatusElement(),
    "No breach lookup performed.",
  );

  setText(
    getPrefixElement(),
    "Not sent yet",
  );
}

function showResult(result) {
  const resultElement =
    getResultElement();

  if (!resultElement) {
    return;
  }

  resultElement.hidden = false;

  if (result.breached) {
    resultElement.dataset.status =
      "breached";

    resultElement.textContent =
      `Warning: this password appeared in known breach data ${result.count.toLocaleString()} time${
        result.count === 1 ? "" : "s"
      }. Do not use it.`;
  } else {
    resultElement.dataset.status =
      "safe";

    resultElement.textContent =
      "No match was found in the queried breach dataset.";
  }
}

async function performBreachCheck() {
  const passwordInput =
    getPasswordInput();

  const consent =
    getConsentCheckbox();

  const button =
    getCheckButton();

  if (!passwordInput) {
    return;
  }

  if (!consent?.checked) {
    showNotification(
      "Enable breach-check consent before performing a network lookup.",
      "warning",
    );

    return;
  }

  const password =
    passwordInput.value;

  if (!password) {
    showNotification(
      "Enter a password before checking for breaches.",
      "warning",
    );

    return;
  }

  if (
    !isBreachCheckingSupported()
  ) {
    showNotification(
      "Privacy-preserving breach checking is unavailable in this browser.",
      "error",
    );

    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent =
      "Checking…";
  }

  setHidden(
    getResultElement(),
    true,
  );

  setText(
    getStatusElement(),
    "Hashing locally and querying the breach service…",
  );

  setText(
    getPrefixElement(),
    "Generating locally",
  );

  try {
    const result =
      await checkPasswordBreach(
        password,
      );

    setText(
      getPrefixElement(),
      `${result.prefix}••••••••••••••••••••••••••••••••••••••`,
    );

    showResult(result);

    setText(
      getStatusElement(),
      result.breached
        ? "Breach match found."
        : "Lookup completed. No match found.",
    );
  } catch (error) {
    console.error(
      "Breach lookup failed:",
      error,
    );

    setText(
      getStatusElement(),
      "Breach lookup failed.",
    );

    setHidden(
      getResultElement(),
      false,
    );

    const resultElement =
      getResultElement();

    if (resultElement) {
      resultElement.dataset.status =
        "error";

      resultElement.textContent =
        error instanceof Error
          ? error.message
          : "Unable to perform breach lookup.";
    }

    showNotification(
      "Unable to complete breach lookup.",
      "error",
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        "Check for Breach";
    }
  }
}

function createBreachSection() {
  if (
    document.querySelector(
      "#breachCheckSection",
    )
  ) {
    return;
  }

  const main =
    document.querySelector("main");

  if (!main) {
    return;
  }

  const section =
    document.createElement("section");

  section.id =
    "breachCheckSection";

  section.className =
    "card breach-check-section";

  section.innerHTML = `
    <div class="section-header">
      <div>
        <span class="section-eyebrow">
          PHASE 13
        </span>

        <h2>
          Privacy-Preserving Breach Check
        </h2>

        <p>
          Check whether a password appears in
          known breach data without sending the
          password or full hash.
        </p>
      </div>
    </div>

    <div class="breach-security-notice">
      <strong>
        Privacy protection
      </strong>

      <p>
        Your password is hashed locally using
        Web Crypto. Only the first five characters
        of the SHA-1 hash are sent to the breach
        service. The exact comparison happens
        inside your browser.
      </p>
    </div>

    <label class="breach-consent">
      <input
        id="breachCheckConsent"
        type="checkbox"
      />

      <span>
        <strong>
          Allow a one-time network lookup
        </strong>

        <small>
          This is disabled by default. Enabling
          it allows this password to be checked
          against the external breach service.
        </small>
      </span>
    </label>

    <div class="breach-actions">
      <button
        id="checkBreachButton"
        class="button button-primary"
        type="button"
      >
        Check for Breach
      </button>
    </div>

    <div
      id="breachCheckStatus"
      class="breach-status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      No breach lookup performed.
    </div>

    <div class="breach-technical-details">
      <div>
        <span>
          Hash prefix sent
        </span>

        <strong id="breachHashPrefix">
          Not sent yet
        </strong>
      </div>

      <div>
        <span>
          Full password sent
        </span>

        <strong>
          Never
        </strong>
      </div>

      <div>
        <span>
          Full hash sent
        </span>

        <strong>
          Never
        </strong>
      </div>
    </div>

    <div
      id="breachCheckResult"
      class="breach-result"
      role="alert"
      hidden
    ></div>
  `;

  main.appendChild(section);
}

export function initializeBreachUI() {
  if (
    initialized ||
    typeof document === "undefined"
  ) {
    return;
  }

  initialized = true;

  createBreachSection();

  const button =
    getCheckButton();

  button?.addEventListener(
    "click",
    performBreachCheck,
  );

  const passwordInput =
    getPasswordInput();

  passwordInput?.addEventListener(
    "input",
    resetResult,
  );

  getConsentCheckbox()
    ?.addEventListener(
      "change",
      resetResult,
    );
}