import {
  describe,
  expect,
  it,
  beforeEach,
} from "vitest";

import {
  initializeAccessibility,
} from "../src/ui/accessibility.js";


describe("Accessibility hardening", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header>
        <button
          id="themeToggle"
          type="button"
        >
          Theme
        </button>
      </header>

      <main class="container">
        <section>
          <input
            id="passwordInput"
            type="password"
          />

          <button
            id="togglePasswordVisibility"
            type="button"
          >
            👁️
          </button>

          <div
            id="strengthBar"
          ></div>

          <output
            id="generatedPassword"
            data-sensitive="true"
            data-generated-sensitive="true"
          >
            test
          </output>

          <output
            id="passphraseOutput"
            data-sensitive="true"
            data-generated-sensitive="true"
          >
            test-passphrase
          </output>

          <input
            id="generatedPin"
            type="text"
          />

          <input
            id="passwordLength"
            type="range"
            min="8"
            max="128"
            value="16"
          />

          <input
            id="passphraseWordCount"
            type="range"
            min="4"
            max="12"
            value="5"
          />
        </section>
      </main>
    `;
  });


  it("creates a skip link", () => {
    initializeAccessibility();

    const skipLink =
      document.querySelector("#skipToContent");

    expect(skipLink).not.toBeNull();

    expect(skipLink?.getAttribute("href"))
      .toBe("#main-content");
  });


  it("makes the main element focusable", () => {
    initializeAccessibility();

    const main =
      document.querySelector("main");

    expect(main?.id)
      .toBe("main-content");

    expect(main?.getAttribute("tabindex"))
      .toBe("-1");
  });


  it("configures generated passwords for screen readers", () => {
    initializeAccessibility();

    const output =
      document.querySelector(
        "#generatedPassword",
      );

    expect(
      output?.getAttribute("role"),
    ).toBe("status");

    expect(
      output?.getAttribute("aria-live"),
    ).toBe("polite");

    expect(
      output?.getAttribute("aria-atomic"),
    ).toBe("true");
  });


  it("configures the password input for privacy", () => {
    initializeAccessibility();

    const input =
      document.querySelector(
        "#passwordInput",
      );

    expect(
      input?.getAttribute("autocomplete"),
    ).toBe("off");

    expect(
      input?.getAttribute("spellcheck"),
    ).toBe("false");

    expect(
      input?.getAttribute("autocapitalize"),
    ).toBe("off");

    expect(
      input?.getAttribute("autocorrect"),
    ).toBe("off");
  });


  it("configures the strength bar as a progressbar", () => {
    initializeAccessibility();

    const strengthBar =
      document.querySelector(
        "#strengthBar",
      );

    expect(
      strengthBar?.getAttribute("role"),
    ).toBe("progressbar");

    expect(
      strengthBar?.getAttribute("aria-valuemin"),
    ).toBe("0");

    expect(
      strengthBar?.getAttribute("aria-valuemax"),
    ).toBe("100");

    expect(
      strengthBar?.getAttribute("aria-valuenow"),
    ).toBe("0");
  });


  it("configures range controls", () => {
    initializeAccessibility();

    const passwordLength =
      document.querySelector(
        "#passwordLength",
      );

    expect(
      passwordLength?.getAttribute(
        "aria-valuenow",
      ),
    ).toBe("16");

    expect(
      passwordLength?.getAttribute(
        "aria-valuemin",
      ),
    ).toBe("8");

    expect(
      passwordLength?.getAttribute(
        "aria-valuemax",
      ),
    ).toBe("128");
  });


  it("updates password visibility state", () => {
    initializeAccessibility();

    const input =
      document.querySelector(
        "#passwordInput",
      );

    const button =
      document.querySelector(
        "#togglePasswordVisibility",
      );

    expect(input?.type).toBe("password");

    button?.click();

    expect(input?.type).toBe("text");

    expect(
      button?.getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");

    button?.click();

    expect(input?.type).toBe("password");

    expect(
      button?.getAttribute(
        "aria-pressed",
      ),
    ).toBe("false");
  });


  it("configures generated PIN accessibility", () => {
    initializeAccessibility();

    const pin =
      document.querySelector(
        "#generatedPin",
      );

    expect(
      pin?.getAttribute("inputmode"),
    ).toBe("numeric");

    expect(
      pin?.getAttribute("autocomplete"),
    ).toBe("off");

    expect(
      pin?.getAttribute("spellcheck"),
    ).toBe("false");

    expect(
      pin?.getAttribute("aria-label"),
    ).toBe("Generated PIN");
  });


  it("initializes document language", () => {
    initializeAccessibility();

    expect(
      document.documentElement.lang,
    ).toBe("en");
  });
});