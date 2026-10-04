import { describe, expect, it, beforeEach, vi } from "vitest";

const mockCheckPasswordBreach = vi.fn();
const mockIsBreachCheckingSupported = vi.fn();

vi.mock("../../src/modules/breach.js", () => ({
  checkPasswordBreach: mockCheckPasswordBreach,
  isBreachCheckingSupported:
    mockIsBreachCheckingSupported,
}));

describe("Breach UI security contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    document.body.innerHTML = `
      <main>
        <input
          id="passwordInput"
          type="password"
          value=""
        />
      </main>
    `;

    mockIsBreachCheckingSupported.mockReturnValue(
      true,
    );
  });

  it("does not perform a breach check while typing", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    expect(passwordInput).not.toBeNull();

    passwordInput.value = "password";

    passwordInput.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );

    passwordInput.dispatchEvent(
      new KeyboardEvent("keyup", {
        bubbles: true,
        key: "a",
      }),
    );

    passwordInput.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        key: "a",
      }),
    );

    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();
  });

  it("requires explicit consent before checking", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    expect(passwordInput).not.toBeNull();
    expect(button).not.toBeNull();

    passwordInput.value = "password";

    button.click();

    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();
  });

  it("does not perform a lookup when the password is empty", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    expect(consent).not.toBeNull();
    expect(button).not.toBeNull();

    consent.checked = true;

    button.click();

    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();
  });

  it("requires breach checking support", async () => {
    mockIsBreachCheckingSupported.mockReturnValue(
      false,
    );

    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    consent.checked = true;
    passwordInput.value = "password";

    button.click();

    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();
  });

  it("requires the user to explicitly click the breach button", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    expect(passwordInput).not.toBeNull();
    expect(consent).not.toBeNull();

    passwordInput.value = "password";
    consent.checked = true;

    passwordInput.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();
  });

  it("does not persist breach results to localStorage", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    mockCheckPasswordBreach.mockResolvedValue(
      {
        breached: true,
        count: 123,
        prefix: "5BAA6",
      },
    );

    consent.checked = true;
    passwordInput.value = "password";

    button.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(
      localStorage.getItem(
        "breachResult",
      ),
    ).toBeNull();

    expect(
      localStorage.getItem(
        "password",
      ),
    ).toBeNull();

    expect(
      localStorage.getItem(
        "passwordHash",
      ),
    ).toBeNull();
  });

  it("does not expose the full password hash in the DOM", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    mockCheckPasswordBreach.mockResolvedValue(
      {
        breached: true,
        count: 10,
        prefix: "5BAA6",
      },
    );

    consent.checked = true;
    passwordInput.value = "password";

    button.click();

    await Promise.resolve();
    await Promise.resolve();

    const bodyText =
      document.body.textContent;

    expect(bodyText).not.toContain(
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );

    expect(bodyText).toContain(
      "5BAA6",
    );
  });

  it("uses the breach service only after explicit user action", async () => {
    const {
      initializeBreachUI,
    } = await import(
      "../../src/ui/breach-ui.js"
    );

    initializeBreachUI();

    const passwordInput =
      document.querySelector(
        "#passwordInput",
      );

    const consent =
      document.querySelector(
        "#breachCheckConsent",
      );

    const button =
      document.querySelector(
        "#checkBreachButton",
      );

    mockCheckPasswordBreach.mockResolvedValue(
      {
        breached: false,
        count: 0,
        prefix: "5BAA6",
      },
    );

    passwordInput.value = "password";
    consent.checked = true;

    expect(
      mockCheckPasswordBreach,
    ).not.toHaveBeenCalled();

    button.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(
      mockCheckPasswordBreach,
    ).toHaveBeenCalledTimes(1);
  });
});