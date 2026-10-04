
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  checkPasswordBreach,
  getBreachServiceInfo,
  hashPassword,
  isBreachCheckingSupported,
  parseBreachResponse,
  queryBreachRange,
  splitHash,
} from "../../src/modules/breach.js";

describe("Breach checking", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("hashes passwords locally with SHA-1", async () => {
    await expect(
      hashPassword("password"),
    ).resolves.toBe(
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );
  });

  it("rejects non-string passwords", async () => {
    await expect(
      hashPassword(null),
    ).rejects.toThrow(
      "Password must be a string.",
    );

    await expect(
      hashPassword(12345),
    ).rejects.toThrow(
      "Password must be a string.",
    );
  });

  it("rejects empty passwords", async () => {
    await expect(
      hashPassword(""),
    ).rejects.toThrow(
      "Password cannot be empty.",
    );
  });

  it("splits a SHA-1 hash into prefix and suffix", () => {
    const hash =
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8";

    const result = splitHash(hash);

    expect(result).toEqual({
      prefix: "5BAA6",
      suffix:
        "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
    });
  });

  it("rejects invalid hashes", () => {
    expect(() => splitHash("")).toThrow(
      "Invalid SHA-1 hash.",
    );

    expect(() =>
      splitHash("12345"),
    ).toThrow(
      "Invalid SHA-1 hash.",
    );

    expect(() =>
      splitHash(
        "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
      ),
    ).toThrow(
      "Invalid SHA-1 hash.",
    );
  });

  it("parses valid HIBP response lines", () => {
    const response = [
      "1E4C9B93F3F0682250B6CF8331B7EE68FD8:123456",
      "ABCDEF1234567890ABCDEF1234567890ABC:5",
    ].join("\n");

    expect(
      parseBreachResponse(response),
    ).toEqual([
      {
        suffix:
          "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
        count: 123456,
      },
      {
        suffix:
          "ABCDEF1234567890ABCDEF1234567890ABC",
        count: 5,
      },
    ]);
  });

  it("ignores malformed response lines", () => {
    const response = [
      "",
      "INVALID",
      "1234:5",
      "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ:10",
      "ABCDEF1234567890ABCDEF1234567890ABC:NOT_A_NUMBER",
      "ABCDEF1234567890ABCDEF1234567890ABCD:5",
      "ABCDEF1234567890ABCDEF1234567890ABC:5",
    ].join("\n");

    expect(
      parseBreachResponse(response),
    ).toEqual([
      {
        suffix:
          "ABCDEF1234567890ABCDEF1234567890ABC",
        count: 5,
      },
    ]);
  });

  it("rejects non-string breach responses", () => {
    expect(() =>
      parseBreachResponse(null),
    ).toThrow(
      "Breach response must be a string.",
    );

    expect(() =>
      parseBreachResponse(123),
    ).toThrow(
      "Breach response must be a string.",
    );
  });

  it("queries exactly one five-character prefix", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5baa6");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestUrl =
      fetchMock.mock.calls[0][0];

    expect(requestUrl).toBe(
      "https://api.pwnedpasswords.com/range/5BAA6",
    );
  });

  it("sends only the five-character SHA-1 prefix", async () => {
    const password = "password";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await checkPasswordBreach(password);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestUrl =
      fetchMock.mock.calls[0][0];

    expect(requestUrl).toBe(
      "https://api.pwnedpasswords.com/range/5BAA6",
    );

    const requestPath =
      new URL(requestUrl).pathname;

    expect(requestPath).toBe(
      "/range/5BAA6",
    );

    expect(requestPath).not.toContain(
      password,
    );
  });

  it("never sends the full SHA-1 hash", async () => {
    const password = "password";

    const fullHash =
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await checkPasswordBreach(password);

    const requestUrl =
      fetchMock.mock.calls[0][0];

    expect(requestUrl).not.toContain(
      fullHash,
    );

    expect(requestUrl).toBe(
      "https://api.pwnedpasswords.com/range/5BAA6",
    );
  });

  it("does not send the plaintext password in the URL path", async () => {
    const password =
      "SuperSecretPassword123!";

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await checkPasswordBreach(password);

    const requestUrl =
      fetchMock.mock.calls[0][0];

    const requestPath =
      new URL(requestUrl).pathname;

    expect(requestPath).not.toContain(
      password,
    );
  });

  it("does not send credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5BAA6");

    const requestOptions =
      fetchMock.mock.calls[0][1];

    expect(
      requestOptions.credentials,
    ).toBe("omit");
  });

  it("does not cache breach requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5BAA6");

    const requestOptions =
      fetchMock.mock.calls[0][1];

    expect(requestOptions.cache).toBe(
      "no-store",
    );
  });

  it("requests padded HIBP responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5BAA6");

    const requestOptions =
      fetchMock.mock.calls[0][1];

    expect(
      requestOptions.headers["Add-Padding"],
    ).toBe("true");
  });

  it("does not send a request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5BAA6");

    const requestOptions =
      fetchMock.mock.calls[0][1];

    expect(requestOptions.body).toBeUndefined();
  });

  it("uses GET requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(""),
    });

    vi.stubGlobal("fetch", fetchMock);

    await queryBreachRange("5BAA6");

    const requestOptions =
      fetchMock.mock.calls[0][1];

    expect(requestOptions.method).toBe(
      "GET",
    );
  });

  it("returns not breached when the suffix is absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(
        [
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:5",
          "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB:10",
        ].join("\n"),
      ),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result =
      await checkPasswordBreach("password");

    expect(result).toEqual({
      breached: false,
      count: 0,
      prefix: "5BAA6",
    });
  });

  it("returns breached when the exact suffix matches", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: vi.fn().mockResolvedValue(
        [
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:5",
          "1E4C9B93F3F0682250B6CF8331B7EE68FD8:42",
        ].join("\n"),
      ),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result =
      await checkPasswordBreach("password");

    expect(result).toEqual({
      breached: true,
      count: 42,
      prefix: "5BAA6",
    });
  });

  it("returns an empty result for HTTP 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
      text: vi.fn(),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      queryBreachRange("5BAA6"),
    ).resolves.toEqual([]);
  });

  it("handles rate limiting", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 429,
      ok: false,
      text: vi.fn(),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      queryBreachRange("5BAA6"),
    ).rejects.toThrow(
      "Breach service rate limit reached.",
    );
  });

  it("handles unexpected HTTP errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      text: vi.fn(),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      queryBreachRange("5BAA6"),
    ).rejects.toThrow(
      "Breach service returned HTTP 500.",
    );
  });

  it("times out aborted requests", async () => {
    const fetchMock = vi.fn(
      (_url, options) =>
        new Promise((_, reject) => {
          options.signal.addEventListener(
            "abort",
            () => {
              const error = new Error(
                "Aborted",
              );

              error.name = "AbortError";

              reject(error);
            },
          );
        }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      queryBreachRange("5BAA6", {
        timeout: 5,
      }),
    ).rejects.toThrow(
      "Breach lookup timed out.",
    );
  });

  it("reports the privacy-safe service contract", () => {
    expect(
      getBreachServiceInfo(),
    ).toEqual({
      provider:
        "Have I Been Pwned - Pwned Passwords",
      hashAlgorithm: "SHA-1",
      prefixLength: 5,
      sendsFullPassword: false,
      sendsFullHash: false,
      sendsOnlyHashPrefix: true,
      requestMethod: "GET",
      credentials: "omit",
      cache: "no-store",
      responsePadding: true,
      storesResults: false,
    });
  });

  it("reports browser support correctly", () => {
    expect(
      isBreachCheckingSupported(),
    ).toBe(true);
  });
});
