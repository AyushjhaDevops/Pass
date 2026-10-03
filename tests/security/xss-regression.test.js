import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

describe("XSS regression tests", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not execute HTML when inserted as text", () => {
    const element = document.createElement("div");

    const payload =
      '<img src=x onerror="window.__xss=true">';

    element.textContent = payload;

    document.body.appendChild(element);

    expect(window.__xss).not.toBe(true);
    expect(element.textContent).toBe(payload);
  });

  it("does not execute script tags when treated as text", () => {
    const element = document.createElement("div");

    const payload =
      "<script>window.__xss=true</script>";

    element.textContent = payload;

    document.body.appendChild(element);

    expect(window.__xss).not.toBe(true);
  });

  it("handles malicious password strings safely", () => {
    const malicious =
      '<script>alert("xss")</script>';

    const output = document.createElement("div");

    output.textContent = malicious;

    expect(output.innerHTML).not.toContain("<script>");
  });
});