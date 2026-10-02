import "./styles/main.css";
import "./styles/responsive.css";
import "./styles/themes.css";
import {
  generatePassword,
} from "./modules/generator.js";
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