function assertDocumentAvailable() {
  if (typeof document === "undefined") {
    throw new Error("DOM is not available.");
  }
}

export function createElement(
  tagName,
  {
    className = "",
    id = "",
    textContent = "",
    attributes = {},
  } = {},
) {
  assertDocumentAvailable();

  if (
    typeof tagName !== "string" ||
    !/^[a-z][a-z0-9-]*$/i.test(tagName)
  ) {
    throw new TypeError("Invalid element tag name.");
  }

  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (id) {
    element.id = id;
  }

  if (textContent !== "") {
    element.textContent = textContent;
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (
      typeof name !== "string" ||
      !/^[a-zA-Z_:][a-zA-Z0-9:_.-]*$/.test(name)
    ) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    element.setAttribute(name, String(value));
  }

  return element;
}

export function setSafeText(element, value) {
  if (!element || typeof element.textContent === "undefined") {
    throw new TypeError("A valid DOM element is required.");
  }

  element.textContent = String(value ?? "");

  return element;
}

export function clearElement(element) {
  if (!element || typeof element.replaceChildren !== "function") {
    throw new TypeError("A valid DOM element is required.");
  }

  element.replaceChildren();

  return element;
}

export function appendText(
  parent,
  tagName,
  textContent,
  options = {},
) {
  if (
    !parent ||
    typeof parent.appendChild !== "function"
  ) {
    throw new TypeError("A valid parent element is required.");
  }

  const element = createElement(tagName, {
    ...options,
    textContent,
  });

  parent.appendChild(element);

  return element;
}

export function setSafeAttribute(
  element,
  name,
  value,
) {
  if (
    !element ||
    typeof element.setAttribute !== "function"
  ) {
    throw new TypeError("A valid DOM element is required.");
  }

  if (
    typeof name !== "string" ||
    !/^[a-zA-Z_:][a-zA-Z0-9:_.-]*$/.test(name)
  ) {
    throw new Error("Invalid attribute name.");
  }

  element.setAttribute(name, String(value));

  return element;
}