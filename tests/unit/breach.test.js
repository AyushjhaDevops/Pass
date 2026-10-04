import {
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

describe("breach module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hashes a password locally", async () => {
    const hash =
      await hashPassword("password");

    expect(hash).toBe(
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );
  });

  it("rejects non-string passwords", async () => {
    await expect(
      hashPassword(null),
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

  it("splits a valid SHA-1 hash", () => {
    const result = splitHash(
      "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );

    expect(result.prefix).toBe(
      "5BAA6",
    );

    expect(result.suffix).toBe(
      "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
    );
  });

  it("rejects invalid SHA-1 hashes", () => {
    expect(() =>
      splitHash("12345"),
    ).toThrow(
      "Invalid SHA-1 hash.",
    );
  });

  it("parses breach responses", () => {
    const response = [
      "1E4C9B93F3F0682250B6CF8331B7EE68FD8:123",
      "ABCDEFABCDEFABCDEFABCDEFABCDEFABCDE:4",
      "",
      "invalid",
    ].join("\n");

    const result =
      parseBreachResponse(response);

    expect(result).toEqual([
      {
        suffix:
          "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
        count: 123,
      },
      {
        suffix:
          "ABCDEFABCDEFABCDEFABCDEFABCDEFABCDE",
        count: 4,
      },
    ]);
  });

  it("ignores malformed response entries", () => {
    const result =
      parseBreachResponse(
        "NOT-A-HASH:10\nABC:wrong",
      );

    expect(result).toEqual([]);
  });

  it("rejects invalid prefixes", async () => {
    await expect(
      queryBreachRange("123"),
    ).rejects.toThrow(
      "Invalid hash prefix.",
    );
  });

  it("returns an empty list for a 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
      }),
    );

    const result =
      await queryBreachRange(
        "ABCDE",
      );

    expect(result).toEqual([]);
  });

  it("parses successful API responses", async () => {
    const fetchMock =
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        text: vi.fn().mockResolvedValue(
          "12345678901234567890123456789012345:42",
        ),
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const result =
      await queryBreachRange(
        "ABCDE",
      );

    expect(result).toEqual([
      {
        suffix:
          "12345678901234567890123456789012345",
        count: 42,
      },
    ]);

    expect(
      fetchMock,
    ).toHaveBeenCalledWith(
      "https://api.pwnedpasswords.com/range/ABCDE",
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        headers: {
          "Add-Padding": "true",
        },
      }),
    );
  });

  it("handles rate limiting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 429,
        ok: false,
      }),
    );

    await expect(
      queryBreachRange("ABCDE"),
    ).rejects.toThrow(
      "Breach service rate limit reached.",
    );
  });

  it("does not send the plaintext password", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    status: 200,
    ok: true,
    text: vi.fn().mockResolvedValue(""),
  });

  vi.stubGlobal("fetch", fetchMock);

  await checkPasswordBreach("password");

  const requestUrl =
    fetchMock.mock.calls[0][0];

  // The password must never appear as a URL path/query value.
  expect(requestUrl).toBe(
    "https://api.pwnedpasswords.com/range/5BAA6",
  );

  // Only the first five SHA-1 characters are sent.
  expect(requestUrl).toContain("/range/5BAA6");

  // Verify the request does not contain the actual plaintext
  // outside the fixed service hostname.
  const requestPath = new URL(requestUrl).pathname;

  expect(requestPath).not.toContain("password");
});

  it("detects a matching breached password", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        text: vi.fn().mockResolvedValue(
          "1E4C9B93F3F0682250B6CF8331B7EE68FD8:1000",
        ),
      }),
    );

    const result =
      await checkPasswordBreach(
        "password",
      );

    expect(result.breached).toBe(
      true,
    );

    expect(result.count).toBe(
      1000,
    );

    expect(result.prefix).toBe(
      "5BAA6",
    );
  });

  it("detects a password with no breach match", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        text: vi.fn().mockResolvedValue(
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:10",
        ),
      }),
    );

    const result =
      await checkPasswordBreach(
        "password",
      );

    expect(result.breached).toBe(
      false,
    );

    expect(result.count).toBe(0);
  });

  it("exposes privacy properties", () => {
    const info =
      getBreachServiceInfo();

    expect(
      info.hashAlgorithm,
    ).toBe("SHA-1");

    expect(
      info.prefixLength,
    ).toBe(5);

    expect(
      info.sendsFullPassword,
    ).toBe(false);

    expect(
      info.sendsFullHash,
    ).toBe(false);

    expect(
      info.responsePadding,
    ).toBe(true);

    expect(
      info.storesResults,
    ).toBe(false);
  });

  it("reports browser support", () => {
    expect(
      isBreachCheckingSupported(),
    ).toBe(true);
  });
});