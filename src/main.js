import "./styles/main.css";
import "./styles/responsive.css";
import "./styles/themes.css";

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