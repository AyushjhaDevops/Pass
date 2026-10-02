import "./styles/main.css";
import "./styles/responsive.css";
import "./styles/themes.css";


import {
  analyzePassword,
} from "./modules/checker.js";

import {
  generatePassword,
  getDefaultOptions,
} from "./modules/generator.js";

import {
  calculatePassphraseEntropy,
  generatePassphrase,
} from "./modules/passphrase.js";

import {
  copyToClipboard,
} from "./modules/clipboard.js";

import {
  initializeTheme,
} from "./ui/theme.js";

import {
  showNotification,
} from "./ui/notifications.js";


// ============================================================
// THEME
// ============================================================

initializeTheme();


// ============================================================
// PASSWORD CHECKER ELEMENTS
// ============================================================

const passwordInput = document.querySelector("#passwordInput");
const togglePasswordVisibility = document.querySelector(
  "#togglePasswordVisibility",
);

const strengthLabel = document.querySelector("#strengthLabel");
const strengthBar = document.querySelector("#strengthBar");
const scoreValue = document.querySelector("#scoreValue");

const entropyValue = document.querySelector("#entropyValue");
const poolSizeValue = document.querySelector("#poolSizeValue");
const searchSpaceValue = document.querySelector("#searchSpaceValue");
const crackTimeValue = document.querySelector("#crackTimeValue");

const suggestionsList = document.querySelector("#suggestionsList");


// Basic checks

const lengthCheck = document.querySelector("#lengthCheck");
const uppercaseCheck = document.querySelector("#uppercaseCheck");
const lowercaseCheck = document.querySelector("#lowercaseCheck");
const numberCheck = document.querySelector("#numberCheck");
const specialCheck = document.querySelector("#specialCheck");
const commonPasswordCheck = document.querySelector(
  "#commonPasswordCheck",
);


// Advanced pattern checks

const repeatedCharactersValue = document.querySelector(
  "#repeatedCharactersValue",
);

const repeatedBlocksValue = document.querySelector(
  "#repeatedBlocksValue",
);

const sequentialValue = document.querySelector(
  "#sequentialValue",
);

const keyboardValue = document.querySelector(
  "#keyboardValue",
);

const leetspeakValue = document.querySelector(
  "#leetspeakValue",
);

const yearValue = document.querySelector(
  "#yearValue",
);

const dateValue = document.querySelector(
  "#dateValue",
);

const fragmentValue = document.querySelector(
  "#fragmentValue",
);


// ============================================================
// PASSWORD GENERATOR ELEMENTS
// ============================================================

const generatedPassword = document.querySelector(
  "#generatedPassword",
);

const copyPasswordButton = document.querySelector(
  "#copyPassword",
);

const passwordLength = document.querySelector(
  "#passwordLength",
);

const passwordLengthValue = document.querySelector(
  "#passwordLengthValue",
);

const includeUppercase = document.querySelector(
  "#includeUppercase",
);

const includeLowercase = document.querySelector(
  "#includeLowercase",
);

const includeNumbers = document.querySelector(
  "#includeNumbers",
);

const includeSymbols = document.querySelector(
  "#includeSymbols",
);

const excludeSimilar = document.querySelector(
  "#excludeSimilar",
);

const excludeAmbiguous = document.querySelector(
  "#excludeAmbiguous",
);

const noDuplicates = document.querySelector(
  "#noDuplicates",
);

const generatePasswordButton = document.querySelector(
  "#generatePassword",
);


// ============================================================
// PASSPHRASE GENERATOR ELEMENTS — PHASE 5
// ============================================================

const passphraseOutput = document.querySelector(
  "#passphraseOutput",
);

const passphraseWordCount = document.querySelector(
  "#passphraseWordCount",
);

const passphraseWordCountValue = document.querySelector(
  "#passphraseWordCountValue",
);

const passphraseSeparator = document.querySelector(
  "#passphraseSeparator",
);

const passphraseCapitalize = document.querySelector(
  "#passphraseCapitalize",
);

const passphraseNumber = document.querySelector(
  "#passphraseNumber",
);

const passphraseSymbol = document.querySelector(
  "#passphraseSymbol",
);

const generatePassphraseButton = document.querySelector(
  "#generatePassphrase",
);

const copyPassphraseButton = document.querySelector(
  "#copyPassphrase",
);

const passphraseEntropy = document.querySelector(
  "#passphraseEntropy",
);

const passphraseWords = document.querySelector(
  "#passphraseWords",
);


// ============================================================
// PASSWORD GENERATOR DEFAULTS
// ============================================================

const generatorDefaults = getDefaultOptions();


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}


function setCheckState(element, passed) {
  if (!element) {
    return;
  }

  const icon = element.querySelector(".check-icon");

  element.classList.toggle("passed", passed);
  element.classList.toggle("failed", !passed);

  if (icon) {
    icon.textContent = passed ? "✓" : "○";
  }
}


function formatLargeNumber(value) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  if (value < 1000) {
    return String(Math.round(value));
  }

  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  if (value < 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value < 1_000_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value < 1_000_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(1)}T`;
  }

  return value.toExponential(2);
}


function formatBoolean(value) {
  return value ? "Yes" : "No";
}


function formatFragments(fragments) {
  if (!Array.isArray(fragments) || fragments.length === 0) {
    return "No";
  }

  return fragments.join(", ");
}


// ============================================================
// PASSWORD CHECKER
// ============================================================

function updatePasswordAnalysis() {
  if (!passwordInput) {
    return;
  }

  const password = passwordInput.value;

  const result = analyzePassword(password);

  // ----------------------------------------------------------
  // Score
  // ----------------------------------------------------------

  setText(scoreValue, result.score);
  setText(strengthLabel, result.strength);

  if (strengthBar) {
    strengthBar.style.width = `${result.score}%`;
    strengthBar.setAttribute("aria-valuenow", String(result.score));
  }

  // ----------------------------------------------------------
  // Basic checks
  // ----------------------------------------------------------

  setCheckState(
    lengthCheck,
    result.checks.length >= 12,
  );

  setCheckState(
    uppercaseCheck,
    result.checks.hasUppercase,
  );

  setCheckState(
    lowercaseCheck,
    result.checks.hasLowercase,
  );

  setCheckState(
    numberCheck,
    result.checks.hasNumber,
  );

  setCheckState(
    specialCheck,
    result.checks.hasSpecial,
  );

  setCheckState(
    commonPasswordCheck,
    !result.checks.commonPassword,
  );

  // ----------------------------------------------------------
  // Entropy
  // ----------------------------------------------------------

  setText(
    entropyValue,
    `${result.entropy.toFixed(1)} bits`,
  );

  setText(
    poolSizeValue,
    result.characterPoolSize,
  );

  setText(
    searchSpaceValue,
    formatLargeNumber(result.searchSpace),
  );

  setText(
    crackTimeValue,
    result.crackTime.label,
  );

  // ----------------------------------------------------------
  // Pattern analysis
  // ----------------------------------------------------------

  setText(
    repeatedCharactersValue,
    formatBoolean(result.patterns.repeatedCharacters),
  );

  setText(
    repeatedBlocksValue,
    formatBoolean(result.patterns.repeatedBlocks),
  );

  setText(
    sequentialValue,
    formatBoolean(result.patterns.sequential),
  );

  setText(
    keyboardValue,
    formatBoolean(result.patterns.keyboard),
  );

  setText(
    leetspeakValue,
    formatBoolean(result.patterns.leetspeak),
  );

  setText(
    yearValue,
    formatBoolean(result.patterns.year),
  );

  setText(
    dateValue,
    formatBoolean(result.patterns.date),
  );

  setText(
    fragmentValue,
    formatFragments(result.patterns.commonFragments),
  );

  // ----------------------------------------------------------
  // Suggestions
  // ----------------------------------------------------------

  if (suggestionsList) {
    suggestionsList.replaceChildren();

    result.suggestions.forEach((suggestion) => {
      const item = document.createElement("li");

      item.textContent = suggestion;

      suggestionsList.appendChild(item);
    });
  }
}


// ============================================================
// PASSWORD VISIBILITY
// ============================================================

function togglePasswordVisibilityHandler() {
  if (!passwordInput) {
    return;
  }

  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";

  if (togglePasswordVisibility) {
    togglePasswordVisibility.textContent = isPassword
      ? "🙈"
      : "👁️";

    togglePasswordVisibility.setAttribute(
      "aria-label",
      isPassword
        ? "Hide password"
        : "Show password",
    );
  }
}


// ============================================================
// PASSWORD GENERATOR OPTIONS
// ============================================================

function getPasswordGeneratorOptions() {
  return {
    length: Number(passwordLength?.value ?? generatorDefaults.length),

    includeUppercase:
      includeUppercase?.checked ??
      generatorDefaults.includeUppercase,

    includeLowercase:
      includeLowercase?.checked ??
      generatorDefaults.includeLowercase,

    includeNumbers:
      includeNumbers?.checked ??
      generatorDefaults.includeNumbers,

    includeSymbols:
      includeSymbols?.checked ??
      generatorDefaults.includeSymbols,

    excludeSimilar:
      excludeSimilar?.checked ??
      generatorDefaults.excludeSimilar,

    excludeAmbiguous:
      excludeAmbiguous?.checked ??
      generatorDefaults.excludeAmbiguous,

    noDuplicates:
      noDuplicates?.checked ??
      generatorDefaults.noDuplicates,
  };
}


// ============================================================
// PASSWORD GENERATOR
// ============================================================

function updatePasswordLengthLabel() {
  if (!passwordLength) {
    return;
  }

  setText(
    passwordLengthValue,
    passwordLength.value,
  );
}


function generateNewPassword() {
  try {
    const options = getPasswordGeneratorOptions();

    const password = generatePassword(options);

    setText(
      generatedPassword,
      password,
    );

    return password;
  } catch (error) {
    console.error("Password generation failed:", error);

    showNotification(
      error.message || "Unable to generate password.",
      "error",
    );

    return null;
  }
}


// ============================================================
// COPY PASSWORD
// ============================================================

async function copyGeneratedPassword() {
  if (!generatedPassword) {
    return;
  }

  const password = generatedPassword.textContent;

  if (
    !password ||
    password === "Click generate to create a password"
  ) {
    showNotification(
      "Generate a password before copying.",
      "warning",
    );

    return;
  }

  try {
    await copyToClipboard(password);

    showNotification(
      "Password copied to clipboard.",
      "success",
    );
  } catch (error) {
    console.error("Password copy failed:", error);

    showNotification(
      "Unable to copy password.",
      "error",
    );
  }
}


// ============================================================
// PASSPHRASE GENERATOR — PHASE 5
// ============================================================

function getPassphraseOptions() {
  return {
    wordCount: Number(
      passphraseWordCount?.value ?? 5,
    ),

    separator:
      passphraseSeparator?.value ?? "-",

    capitalize:
      passphraseCapitalize?.checked ?? false,

    addNumber:
      passphraseNumber?.checked ?? false,

    addSymbol:
      passphraseSymbol?.checked ?? false,
  };
}


function updatePassphraseLabels(wordCount) {
  setText(
    passphraseWordCountValue,
    wordCount,
  );

  setText(
    passphraseWords,
    wordCount,
  );
}


function generateNewPassphrase() {
  try {
    const options = getPassphraseOptions();

    const passphrase = generatePassphrase(options);

    setText(
      passphraseOutput,
      passphrase,
    );

    updatePassphraseLabels(options.wordCount);

    const entropy = calculatePassphraseEntropy(
      options.wordCount,
    );

    setText(
      passphraseEntropy,
      `${entropy.toFixed(1)} bits`,
    );

    return passphrase;
  } catch (error) {
    console.error(
      "Passphrase generation failed:",
      error,
    );

    showNotification(
      error.message || "Unable to generate passphrase.",
      "error",
    );

    return null;
  }
}


// ============================================================
// COPY PASSPHRASE
// ============================================================

async function copyGeneratedPassphrase() {
  if (!passphraseOutput) {
    return;
  }

  const passphrase = passphraseOutput.textContent;

  if (
    !passphrase ||
    passphrase === "Click generate to create a passphrase"
  ) {
    showNotification(
      "Generate a passphrase before copying.",
      "warning",
    );

    return;
  }

  try {
    await copyToClipboard(passphrase);

    showNotification(
      "Passphrase copied to clipboard.",
      "success",
    );
  } catch (error) {
    console.error(
      "Passphrase copy failed:",
      error,
    );

    showNotification(
      "Unable to copy passphrase.",
      "error",
    );
  }
}


// ============================================================
// EVENT LISTENERS — PASSWORD CHECKER
// ============================================================

passwordInput?.addEventListener(
  "input",
  updatePasswordAnalysis,
);

togglePasswordVisibility?.addEventListener(
  "click",
  togglePasswordVisibilityHandler,
);


// ============================================================
// EVENT LISTENERS — PASSWORD GENERATOR
// ============================================================

passwordLength?.addEventListener(
  "input",
  updatePasswordLengthLabel,
);

generatePasswordButton?.addEventListener(
  "click",
  generateNewPassword,
);

copyPasswordButton?.addEventListener(
  "click",
  copyGeneratedPassword,
);


// Regenerate when generator options change.

[
  includeUppercase,
  includeLowercase,
  includeNumbers,
  includeSymbols,
  excludeSimilar,
  excludeAmbiguous,
  noDuplicates,
].forEach((element) => {
  element?.addEventListener(
    "change",
    generateNewPassword,
  );
});


// ============================================================
// EVENT LISTENERS — PASSPHRASE GENERATOR
// ============================================================

passphraseWordCount?.addEventListener(
  "input",
  () => {
    const wordCount = Number(
      passphraseWordCount.value,
    );

    updatePassphraseLabels(wordCount);

    generateNewPassphrase();
  },
);


passphraseSeparator?.addEventListener(
  "change",
  generateNewPassphrase,
);


passphraseCapitalize?.addEventListener(
  "change",
  generateNewPassphrase,
);


passphraseNumber?.addEventListener(
  "change",
  generateNewPassphrase,
);


passphraseSymbol?.addEventListener(
  "change",
  generateNewPassphrase,
);


generatePassphraseButton?.addEventListener(
  "click",
  generateNewPassphrase,
);


copyPassphraseButton?.addEventListener(
  "click",
  copyGeneratedPassphrase,
);


// ============================================================
// INITIALIZE APPLICATION
// ============================================================

function initializePasswordGenerator() {
  if (passwordLength) {
    passwordLength.value = String(
      generatorDefaults.length ?? 16,
    );
  }

  if (includeUppercase) {
    includeUppercase.checked =
      generatorDefaults.includeUppercase ?? true;
  }

  if (includeLowercase) {
    includeLowercase.checked =
      generatorDefaults.includeLowercase ?? true;
  }

  if (includeNumbers) {
    includeNumbers.checked =
      generatorDefaults.includeNumbers ?? true;
  }

  if (includeSymbols) {
    includeSymbols.checked =
      generatorDefaults.includeSymbols ?? true;
  }

  if (excludeSimilar) {
    excludeSimilar.checked =
      generatorDefaults.excludeSimilar ?? false;
  }

  if (excludeAmbiguous) {
    excludeAmbiguous.checked =
      generatorDefaults.excludeAmbiguous ?? false;
  }

  if (noDuplicates) {
    noDuplicates.checked =
      generatorDefaults.noDuplicates ?? false;
  }

  updatePasswordLengthLabel();
}


function initializePassphraseGenerator() {
  if (passphraseWordCount) {
    passphraseWordCount.value = "5";
  }

  if (passphraseSeparator) {
    passphraseSeparator.value = "-";
  }

  if (passphraseCapitalize) {
    passphraseCapitalize.checked = false;
  }

  if (passphraseNumber) {
    passphraseNumber.checked = false;
  }

  if (passphraseSymbol) {
    passphraseSymbol.checked = false;
  }

  const wordCount = Number(
    passphraseWordCount?.value ?? 5,
  );

  updatePassphraseLabels(wordCount);

  setText(
    passphraseEntropy,
    `${calculatePassphraseEntropy(wordCount).toFixed(1)} bits`,
  );
}


function initializeApplication() {
  initializePasswordGenerator();

  initializePassphraseGenerator();

  updatePasswordAnalysis();

  generateNewPassword();

  generateNewPassphrase();
}


initializeApplication();