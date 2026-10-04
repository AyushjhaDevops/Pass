import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");

const INDEX_HTML = resolve(
  PROJECT_ROOT,
  "index.html",
);

const HIBP_ORIGIN =
  "https://api.pwnedpasswords.com";

function readIndexHtml() {
  return readFileSync(INDEX_HTML, "utf8");
}

function extractCspPolicies(html) {
  const policies = [];

  /*
   * Support normal quoted CSP meta tags:
   *
   * <meta
   *   http-equiv="Content-Security-Policy"
   *   content="default-src 'self'; connect-src 'self' ..."
   * >
   *
   * Also support single quotes around attributes.
   */
  const metaPattern =
    /<meta\b[\s\S]*?>/gi;

  const metaTags =
    html.match(metaPattern) ?? [];

  for (const metaTag of metaTags) {
    const httpEquivMatch =
      metaTag.match(
        /\bhttp-equiv\s*=\s*["']Content-Security-Policy["']/i,
      );

    if (!httpEquivMatch) {
      continue;
    }

    const contentMatch =
      metaTag.match(
        /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i,
      );

    if (!contentMatch) {
      continue;
    }

    policies.push(
      contentMatch[2]
        .replace(/\s+/g, " ")
        .trim(),
    );
  }

  return policies;
}

function extractConnectSrc(csp) {
  const directives = csp
    .split(";")
    .map((directive) =>
      directive.trim(),
    )
    .filter(Boolean);

  return (
    directives.find((directive) => {
      const name =
        directive
          .split(/\s+/)[0]
          ?.toLowerCase();

      return name === "connect-src";
    }) ?? ""
  );
}

function getDirectiveValues(directive) {
  const parts =
    directive
      .trim()
      .split(/\s+/);

  return parts.slice(1);
}

describe("CSP network policy", () => {
  it("restricts outbound connections to approved destinations", () => {
    const html = readIndexHtml();

    const policies =
      extractCspPolicies(html);

    expect(policies.length).toBeGreaterThan(0);

    const csp =
      policies.join("; ");

    expect(csp).toContain(
      "connect-src",
    );

    const connectSrc =
      extractConnectSrc(csp);

    expect(connectSrc).not.toBe("");

    const destinations =
      getDirectiveValues(connectSrc);

    expect(destinations).toContain(
      "'self'",
    );

    expect(destinations).toContain(
      HIBP_ORIGIN,
    );

    expect(destinations).not.toContain(
      "*",
    );

    for (const destination of destinations) {
      expect(
        destination === "'self'" ||
          destination === HIBP_ORIGIN,
      ).toBe(true);
    }
  });
});