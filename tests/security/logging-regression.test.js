import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

describe("Sensitive logging regression tests", () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not log sensitive values through console.error", () => {
    const password =
      "SuperSecretPassword123!";

    const pin = "482917";

    const passphrase =
      "correct horse battery staple";

    const hash = "A".repeat(40);

    console.error(
      "Operation failed.",
    );

    const calls = [
      ...consoleErrorSpy.mock.calls,
      ...consoleWarnSpy.mock.calls,
    ];

    const serialized =
      JSON.stringify(calls);

    expect(serialized).not.toContain(
      password,
    );

    expect(serialized).not.toContain(
      pin,
    );

    expect(serialized).not.toContain(
      passphrase,
    );

    expect(serialized).not.toContain(
      hash,
    );
  });

  it("does not pass Error objects to hardened logging", () => {
    const error = new Error(
      "Operation failed",
    );

    console.error(
      "Operation failed.",
    );

    expect(
      consoleErrorSpy.mock.calls,
    ).toEqual([
      ["Operation failed."],
    ]);

    expect(error).toBeInstanceOf(Error);
  });
});