import {
  analyzePin,
  generatePin,
  getDefaultPinOptions,
} from "../modules/pin.js";

import {
  copyToClipboard,
} from "../modules/clipboard.js";

import {
  showNotification,
} from "./notifications.js";

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString();
}

function formatEntropy(value) {
  if (!Number.isFinite(value)) {
    return "0 bits";
  }

  return `${value.toFixed(2)} bits`;
}

function updateAnalysis(pin) {
  const options = {
    noRepeats:
      document.querySelector("#pinNoRepeats")?.checked ?? true,

    avoidSequential:
      document.querySelector(
        "#pinAvoidSequential",
      )?.checked ?? true,

    avoidCommon:
      document.querySelector(
        "#pinAvoidCommon",
      )?.checked ?? true,
  };

  const result = analyzePin(
    pin,
    options,
  );

  const scoreElement =
    document.querySelector("#pinScoreValue");

  const strengthElement =
    document.querySelector("#pinStrengthLabel");

  const entropyElement =
    document.querySelector("#pinEntropyValue");

  const searchSpaceElement =
    document.querySelector("#pinSearchSpaceValue");

  const crackTimeElement =
    document.querySelector("#pinCrackTimeValue");

  const repeatedElement =
    document.querySelector("#pinRepeatedValue");

  const sequentialElement =
    document.querySelector("#pinSequentialValue");

  const commonElement =
    document.querySelector("#pinCommonValue");

  if (scoreElement) {
    scoreElement.textContent = String(result.score);
  }

  if (strengthElement) {
    strengthElement.textContent =
      result.strength;
  }

  if (entropyElement) {
    entropyElement.textContent =
      formatEntropy(result.entropy);
  }

  if (searchSpaceElement) {
    searchSpaceElement.textContent =
      formatNumber(result.searchSpace);
  }

  if (crackTimeElement) {
    crackTimeElement.textContent =
      result.crackTime.label;
  }

  if (repeatedElement) {
    repeatedElement.textContent =
      result.checks.repeatedDigits
        ? "Detected"
        : "None";
  }

  if (sequentialElement) {
    sequentialElement.textContent =
      result.checks.sequentialPattern
        ? "Detected"
        : "None";
  }

  if (commonElement) {
    commonElement.textContent =
      result.checks.commonPin
        ? "Common"
        : "Not common";
  }

  const suggestionsList =
    document.querySelector(
      "#pinSuggestionsList",
    );

  if (suggestionsList) {
    suggestionsList.innerHTML = "";

    result.suggestions.forEach(
      (suggestion) => {
        const item =
          document.createElement("li");

        item.textContent = suggestion;

        suggestionsList.appendChild(item);
      },
    );
  }
}

function getOptions() {
  return {
    length:
      Number(
        document.querySelector(
          "#pinLength",
        )?.value ?? 6,
      ),

    noRepeats:
      document.querySelector(
        "#pinNoRepeats",
      )?.checked ?? true,

    avoidSequential:
      document.querySelector(
        "#pinAvoidSequential",
      )?.checked ?? true,

    avoidCommon:
      document.querySelector(
        "#pinAvoidCommon",
      )?.checked ?? true,
  };
}

function updateLengthLabel() {
  const input =
    document.querySelector("#pinLength");

  const label =
    document.querySelector(
      "#pinLengthValue",
    );

  if (input && label) {
    label.textContent = input.value;
  }
}

function generateAndDisplayPin() {
  try {
    const options = getOptions();

    const pin = generatePin(options);

    const output =
      document.querySelector(
        "#generatedPin",
      );

    if (output) {
      output.value = pin;
      output.textContent = pin;
    }

    updateAnalysis(pin);

    showNotification(
      "Secure PIN generated.",
      "success",
    );
  } catch (error) {
    showNotification(
      error instanceof Error
        ? error.message
        : "Unable to generate PIN.",
      "error",
    );
  }
}

async function copyGeneratedPin() {
  const output =
    document.querySelector(
      "#generatedPin",
    );

  if (!output) {
    return;
  }

  const pin =
    output.value ||
    output.textContent ||
    "";

  if (!pin) {
    showNotification(
      "Generate a PIN first.",
      "error",
    );

    return;
  }

  try {
    await copyToClipboard(pin);

    showNotification(
      "PIN copied to clipboard.",
      "success",
    );
  } catch {
    showNotification(
      "Unable to copy the PIN.",
      "error",
    );
  }
}

function analyzeManualPin() {
  const output =
    document.querySelector(
      "#generatedPin",
    );

  if (!output) {
    return;
  }

  const pin =
    output.value ||
    output.textContent ||
    "";

  updateAnalysis(pin);
}

export function initializePinUI() {
  const defaults =
    getDefaultPinOptions();

  const lengthInput =
    document.querySelector("#pinLength");

  const noRepeats =
    document.querySelector(
      "#pinNoRepeats",
    );

  const avoidSequential =
    document.querySelector(
      "#pinAvoidSequential",
    );

  const avoidCommon =
    document.querySelector(
      "#pinAvoidCommon",
    );

  if (lengthInput) {
    lengthInput.value =
      defaults.length;

    updateLengthLabel();

    lengthInput.addEventListener(
      "input",
      updateLengthLabel,
    );
  }

  if (noRepeats) {
    noRepeats.checked =
      defaults.noRepeats;
  }

  if (avoidSequential) {
    avoidSequential.checked =
      defaults.avoidSequential;
  }

  if (avoidCommon) {
    avoidCommon.checked =
      defaults.avoidCommon;
  }

  document
    .querySelector("#generatePin")
    ?.addEventListener(
      "click",
      generateAndDisplayPin,
    );

  document
    .querySelector("#copyPin")
    ?.addEventListener(
      "click",
      copyGeneratedPin,
    );

  document
    .querySelector("#generatedPin")
    ?.addEventListener(
      "input",
      analyzeManualPin,
    );

  [
    "#pinNoRepeats",
    "#pinAvoidSequential",
    "#pinAvoidCommon",
  ].forEach((selector) => {
    document
      .querySelector(selector)
      ?.addEventListener(
        "change",
        analyzeManualPin,
      );
  });

  generateAndDisplayPin();
}