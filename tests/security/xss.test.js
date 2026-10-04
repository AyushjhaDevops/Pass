import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  appendText,
  clearElement,
  createElement,
  setSafeAttribute,
  setSafeText,
} from "../../src/modules/dom-security.js";

describe("DOM security", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates elements using textContent", () => {
    const element = createElement("div", {
      textContent:
        "<script>alert('xss')</script>",
    });

    expect(element.textContent).toBe(
      "<script>alert('xss')</script>",
    );

    expect(element.querySelector("script")).toBeNull();
  });

  it("does not interpret HTML supplied as text", () => {
    const element = createElement("div");

    setSafeText(
      element,
      '<img src="x" onerror="alert(1)">',
    );

    expect(element.textContent).toBe(
      '<img src="x" onerror="alert(1)">',
    );

    expect(element.querySelector("img")).toBeNull();
  });

  it("appends untrusted text safely", () => {
    const parent = document.createElement("div");

    appendText(
      parent,
      "p",
      "<svg onload=alert(1)>",
    );

    expect(parent.textContent).toBe(
      "<svg onload=alert(1)>",
    );

    expect(parent.querySelector("svg")).toBeNull();
  });

  it("does not execute HTML through text content", () => {
    const element = createElement("div", {
      textContent:
        '<img src=x onerror="window.__xss = true">',
    });

    document.body.appendChild(element);

    expect(window.__xss).toBeUndefined();
    expect(element.children).toHaveLength(0);
  });

  it("clears an element without parsing HTML", () => {
    const parent = document.createElement("div");

    const child = document.createElement("span");
    child.textContent = "secret";

    parent.appendChild(child);

    clearElement(parent);

    expect(parent.childNodes).toHaveLength(0);
  });

  it("sets attributes without interpreting values as HTML", () => {
    const element = createElement("div");

    setSafeAttribute(
      element,
      "data-test",
      '<script>alert(1)</script>',
    );

    expect(
      element.getAttribute("data-test"),
    ).toBe(
      '<script>alert(1)</script>',
    );

    expect(element.querySelector("script")).toBeNull();
  });

  it("rejects invalid element names", () => {
    expect(() =>
      createElement("<script>"),
    ).toThrow(
      "Invalid element tag name.",
    );
  });

  it("rejects invalid attribute names", () => {
    const element = createElement("div");

    expect(() =>
      setSafeAttribute(
        element,
        'onclick="alert(1)"',
        "test",
      ),
    ).toThrow(
      "Invalid attribute name.",
    );
  });

  it("rejects operations without a valid DOM element", () => {
    expect(() =>
      setSafeText(null, "test"),
    ).toThrow(
      "A valid DOM element is required.",
    );

    expect(() =>
      clearElement(null),
    ).toThrow(
      "A valid DOM element is required.",
    );
  });
});