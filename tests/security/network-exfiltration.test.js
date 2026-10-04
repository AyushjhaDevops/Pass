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
} from "../../src/modules/breach.js";

describe("Network data-exfiltration regression tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("allows only the HIBP range request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    await checkPasswordBreach(
      "Correct Horse Battery Staple",
    );

    expect(fetchMock).toHaveBeenCalledTimes(
      1,
    );

    const [
      url,
      options,
    ] = fetchMock.mock.calls[0];

    expect(url).toMatch(
      /^https:\/\/api\.pwnedpasswords\.com\/range\/[A-F0-9]{5}$/,
    );

    expect(options.method).toBe(
      "GET",
    );

    expect(options.body).toBeUndefined();

    expect(options.credentials).toBe(
      "omit",
    );

    expect(options.cache).toBe(
      "no-store",
    );
  });

  it("does not place sensitive data in the URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const password =
      "SuperSecretPassword123!";

    await checkPasswordBreach(
      password,
    );

    const [
      url,
      options,
    ] = fetchMock.mock.calls[0];

    expect(url).not.toContain(
      password,
    );

    const requestPath = new URL(url).pathname;

    expect(requestPath).not.toMatch(
    /password|passphrase|secret|pin|token/i,
    );

    expect(
      JSON.stringify(options),
    ).not.toContain(
      password,
    );
  });

  it("does not send a full SHA-1 hash", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const password =
      "SuperSecretPassword123!";

    await checkPasswordBreach(
      password,
    );

    const [
      url,
      options,
    ] = fetchMock.mock.calls[0];

    const fullHashPattern =
      /^[A-F0-9]{40}$/;

    const hashCandidate =
      url.split("/").pop();

    expect(
      fullHashPattern.test(
        hashCandidate,
      ),
    ).toBe(false);

    expect(
      JSON.stringify(options),
    ).not.toMatch(
      /[A-F0-9]{40}/,
    );
  });

  it("does not send a request body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    await checkPasswordBreach(
      "example-password",
    );

    const options =
      fetchMock.mock.calls[0][1];

    expect(
      Object.prototype.hasOwnProperty.call(
        options,
        "body",
      ),
    ).toBe(false);
  });

  it("does not send cookies or credentials", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    await checkPasswordBreach(
      "example-password",
    );

    const options =
      fetchMock.mock.calls[0][1];

    expect(
      options.credentials,
    ).toBe("omit");

    expect(
      options.headers.Cookie,
    ).toBeUndefined();

    expect(
      options.headers.cookie,
    ).toBeUndefined();
  });

  it("uses response padding", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue(""),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    await checkPasswordBreach(
      "example-password",
    );

    const options =
      fetchMock.mock.calls[0][1];

    expect(
      options.headers,
    ).toEqual({
      "Add-Padding": "true",
    });
  });

  it("does not persist breach results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        status: 200,
        ok: true,
        text: vi.fn().mockResolvedValue(
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:10",
        ),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    localStorage.clear();
    sessionStorage.clear();

    await checkPasswordBreach(
      "example-password",
    );

    expect(
      localStorage.length,
    ).toBe(0);

    expect(
      sessionStorage.length,
    ).toBe(0);
  });
});