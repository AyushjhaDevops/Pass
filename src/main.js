import "./styles/main.css";
import "./styles/responsive.css";
import "./styles/themes.css";
import {
  generatePassword,
} from "./modules/generator.js";
import {
  analyzePassword,
} from "./modules/checker.js";
const app = document.querySelector("#app");

app.innerHTML = `
  <main class="app">
    <header class="app-header">
      <div>
        <p class="eyebrow">CYBERSECURITY TOOLKIT</p>
        <h1>Password Security Toolkit</h1>
        <p class="subtitle">
          Generate and analyze passwords locally with privacy in mind.
        </p>
      </div>

      <button
        id="themeToggle"
        class="icon-button"
        type="button"
        aria-label="Toggle theme"
      >
        🌙
      </button>
    </header>

    <section class="dashboard">

      <article class="card">
        <div class="card-header">
          <div>
            <span class="card-icon">🔐</span>
            <h2>Password Checker</h2>
          </div>
        </div>

        <div class="password-input-wrapper">
          <input
            id="passwordInput"
            type="password"
            autocomplete="off"
            spellcheck="false"
            placeholder="Enter a password to analyze"
          />

          <button
            id="togglePassword"
            class="icon-button"
            type="button"
            aria-label="Show password"
          >
            👁
          </button>
        </div>

        <div class="strength">
          <div class="strength-header">
            <span>Strength</span>
            <strong id="strengthText">Not analyzed</strong>
          </div>

          <div
            class="strength-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
          >
            <div id="strengthProgress"></div>
          </div>
        </div>

        <div class="requirements">
          <div id="lengthCheck">○ At least 12 characters</div>
          <div id="uppercaseCheck">○ Uppercase letter</div>
          <div id="lowercaseCheck">○ Lowercase letter</div>
          <div id="numberCheck">○ Number</div>
          <div id="specialCheck">○ Special character</div>
        </div>
        <div class="analysis-summary">
          <div class="analysis-item">
            <span>Entropy</span>
            <strong id="entropyValue">0 bits</strong>
          </div>

          <div class="analysis-item">
            <span>Repeated characters</span>
            <strong id="repeatedValue">No</strong>
          </div>

          <div class="analysis-item">
            <span>Sequential pattern</span>
            <strong id="sequenceValue">No</strong>
          </div>

          <div class="analysis-item">
            <span>Keyboard pattern</span>
            <strong id="keyboardValue">No</strong>
          </div>

          <div class="analysis-item">
            <span>Common password</span>
            <strong id="commonValue">No</strong>
          </div>
        </div>

        <div class="suggestions">
          <h3>Security Recommendations</h3>
          <ul id="suggestionList"></ul>
        </div>
      </article>

      <article class="card">
        <div class="card-header">
          <div>
            <span class="card-icon">⚡</span>
            <h2>Password Generator</h2>
          </div>
        </div>

        <div class="generated-password">
          <input
            id="generatedPassword"
            type="text"
            readonly
            placeholder="Generate a secure password"
          />

          <button
            id="copyPassword"
            class="icon-button"
            type="button"
            aria-label="Copy password"
          >
            📋
          </button>
        </div>

        <label for="passwordLength">
          Password length:
          <strong id="lengthValue">20</strong>
        </label>

        <input
          id="passwordLength"
          type="range"
          min="8"
          max="128"
          value="20"
        />

        <div class="options">
          <label>
            <input id="uppercaseOption" type="checkbox" checked />
            Uppercase
          </label>

          <label>
            <input id="lowercaseOption" type="checkbox" checked />
            Lowercase
          </label>

          <label>
            <input id="numbersOption" type="checkbox" checked />
            Numbers
          </label>

          <label>
            <input id="symbolsOption" type="checkbox" checked />
            Symbols
          </label>
        </div>

        <button id="generatePassword" class="primary-button">
          Generate Password
        </button>
      </article>

    </section>

    <footer>
      <span>🔒 Passwords are processed locally.</span>
      <span>Web Crypto API</span>
    </footer>
  </main>
`;

console.log("Password Security Toolkit initialized.");
const passwordLength =
  document.querySelector("#passwordLength");

const lengthValue =
  document.querySelector("#lengthValue");

const generatedPassword =
  document.querySelector("#generatedPassword");

const generateButton =
  document.querySelector("#generatePassword");

const copyButton =
  document.querySelector("#copyPassword");

const uppercaseOption =
  document.querySelector("#uppercaseOption");

const lowercaseOption =
  document.querySelector("#lowercaseOption");

const numbersOption =
  document.querySelector("#numbersOption");

const symbolsOption =
  document.querySelector("#symbolsOption");

const passwordInput =
  document.querySelector("#passwordInput");

const strengthText =
  document.querySelector("#strengthText");

const strengthProgress =
  document.querySelector("#strengthProgress");

const strengthBar =
  document.querySelector(".strength-bar");

const lengthCheck =
  document.querySelector("#lengthCheck");

const uppercaseCheck =
  document.querySelector("#uppercaseCheck");

const lowercaseCheck =
  document.querySelector("#lowercaseCheck");

const numberCheck =
  document.querySelector("#numberCheck");

const specialCheck =
  document.querySelector("#specialCheck");

const entropyValue =
  document.querySelector("#entropyValue");

const repeatedValue =
  document.querySelector("#repeatedValue");

const sequenceValue =
  document.querySelector("#sequenceValue");

const keyboardValue =
  document.querySelector("#keyboardValue");

const commonValue =
  document.querySelector("#commonValue");

const suggestionList =
  document.querySelector("#suggestionList");

function updateRequirement(element, passed, text) {
  element.textContent = `${passed ? "✓" : "○"} ${text}`;

  element.dataset.valid = passed ? "true" : "false";
}


function updateStrengthUI(result) {
  strengthText.textContent = result.strength;

  strengthProgress.style.width =
    `${result.score}%`;

  const strengthClass = result.strength
    .toLowerCase()
    .replaceAll(" ", "-");

  strengthProgress.dataset.strength =
    strengthClass;

  strengthBar.setAttribute(
    "aria-valuenow",
    String(result.score)
  );
  updateRequirement(
    lengthCheck,
    result.checks.length >= 12,
    "At least 12 characters"
  );

  updateRequirement(
    uppercaseCheck,
    result.checks.hasUppercase,
    "Uppercase letter"
  );

  updateRequirement(
    lowercaseCheck,
    result.checks.hasLowercase,
    "Lowercase letter"
  );

  updateRequirement(
    numberCheck,
    result.checks.hasNumber,
    "Number"
  );

  updateRequirement(
    specialCheck,
    result.checks.hasSpecial,
    "Special character"
  );
  entropyValue.textContent =
  `${result.entropy.toFixed(1)} bits`;

  repeatedValue.textContent =
    result.checks.repeatedCharacters
      ? "Detected"
      : "No";

  sequenceValue.textContent =
    result.checks.sequentialPattern
      ? "Detected"
      : "No";

  keyboardValue.textContent =
    result.checks.keyboardPattern
      ? "Detected"
      : "No";

  commonValue.textContent =
    result.checks.commonPassword
      ? "Detected"
      : "No";

  suggestionList.innerHTML = "";

  for (const suggestion of result.suggestions) {
    const item = document.createElement("li");
    item.textContent = suggestion;

    suggestionList.appendChild(item);
  }
}


function checkPassword() {
  const password = passwordInput.value;

  const result = analyzePassword(password);

  updateStrengthUI(result);
}


passwordInput.addEventListener(
  "input",
  checkPassword
);
function generateFromUI() {
  try {
    const password = generatePassword({
      length: Number(passwordLength.value),

      uppercase: uppercaseOption.checked,
      lowercase: lowercaseOption.checked,
      numbers: numbersOption.checked,
      symbols: symbolsOption.checked,

      minimumUppercase: uppercaseOption.checked ? 1 : 0,
      minimumLowercase: lowercaseOption.checked ? 1 : 0,
      minimumNumbers: numbersOption.checked ? 1 : 0,
      minimumSymbols: symbolsOption.checked ? 1 : 0,

      allowDuplicates: true,
    });

    generatedPassword.value = password;
  } catch (error) {
    console.error("Password generation failed:", error);

    generatedPassword.value = "";

    window.alert(error.message);
  }
}


passwordLength.addEventListener("input", () => {
  lengthValue.textContent = passwordLength.value;
});


generateButton.addEventListener(
  "click",
  generateFromUI
);


generateFromUI();
copyButton.addEventListener("click", async () => {
  const password = generatedPassword.value;

  if (!password) {
    return;
  }

  try {
    await navigator.clipboard.writeText(password);

    const originalText = copyButton.textContent;

    copyButton.textContent = "✓";

    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1200);
  } catch (error) {
    console.error("Clipboard operation failed:", error);
  }
});