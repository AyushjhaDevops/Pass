import {
  checkPasswordBreach,
  isBreachCheckingSupported,
} from "../modules/breach.js";

import {
  showNotification,
} from "./notifications.js";

import {
  createElement,
  appendText,
} from "../modules/dom-security.js";

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
    console.error("Breach lookup failed.");

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
  if (document.querySelector("#breachCheckSection")) {
    return;
  }

  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const section = createElement("section", {
    id: "breachCheckSection",
    className: "card breach-check-section",
  });

  const header = createElement("div", {
    className: "section-header",
  });

  const headerContent = createElement("div");

  appendText(
    headerContent,
    "span",
    "PHASE 13",
    {
      className: "section-eyebrow",
    },
  );

  appendText(
    headerContent,
    "h2",
    "Privacy-Preserving Breach Check",
  );

  appendText(
    headerContent,
    "p",
    "Check whether a password appears in known breach data without sending the password or full hash.",
  );

  header.appendChild(headerContent);
  section.appendChild(header);

  const securityNotice = createElement("div", {
    className: "breach-security-notice",
  });

  appendText(
    securityNotice,
    "strong",
    "Privacy protection",
  );

  appendText(
    securityNotice,
    "p",
    "Your password is hashed locally using Web Crypto. Only the first five characters of the SHA-1 hash are sent to the breach service. The exact comparison happens inside your browser.",
  );

  section.appendChild(securityNotice);

  const consentLabel = createElement("label", {
    className: "breach-consent",
  });

  const consentInput = createElement("input", {
    id: "breachCheckConsent",
    attributes: {
      type: "checkbox",
    },
  });

  const consentText = createElement("span");

  appendText(
    consentText,
    "strong",
    "Allow a one-time network lookup",
  );

  appendText(
    consentText,
    "small",
    "This is disabled by default. Enabling it allows this password to be checked against the external breach service.",
  );

  consentLabel.appendChild(consentInput);
  consentLabel.appendChild(consentText);

  section.appendChild(consentLabel);

  const actions = createElement("div", {
    className: "breach-actions",
  });

  const checkButton = createElement("button", {
    id: "checkBreachButton",
    className: "button button-primary",
    textContent: "Check for Breach",
    attributes: {
      type: "button",
    },
  });

  actions.appendChild(checkButton);
  section.appendChild(actions);

  const status = createElement("div", {
    id: "breachCheckStatus",
    className: "breach-status",
    textContent: "No breach lookup performed.",
    attributes: {
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
    },
  });

  section.appendChild(status);

  const technicalDetails = createElement("div", {
    className: "breach-technical-details",
  });

  const prefixContainer = createElement("div");

  appendText(
    prefixContainer,
    "span",
    "Hash prefix sent",
  );

  appendText(
    prefixContainer,
    "strong",
    "Not sent yet",
    {
      id: "breachHashPrefix",
    },
  );

  const passwordContainer = createElement("div");

  appendText(
    passwordContainer,
    "span",
    "Full password sent",
  );

  appendText(
    passwordContainer,
    "strong",
    "Never",
  );

  const hashContainer = createElement("div");

  appendText(
    hashContainer,
    "span",
    "Full hash sent",
  );

  appendText(
    hashContainer,
    "strong",
    "Never",
  );

  technicalDetails.appendChild(prefixContainer);
  technicalDetails.appendChild(passwordContainer);
  technicalDetails.appendChild(hashContainer);

  section.appendChild(technicalDetails);

  const result = createElement("div", {
    id: "breachCheckResult",
    className: "breach-result",
    attributes: {
      role: "alert",
    },
  });

  result.hidden = true;

  section.appendChild(result);

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