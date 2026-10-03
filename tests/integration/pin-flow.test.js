import { describe, expect, it } from "vitest";

import {
  generatePin,
} from "../../src/modules/pin.js";

describe("PIN integration", () => {
  it("generates a four-digit PIN", () => {
    const pin = generatePin({
      length: 4,
    });

    expect(pin).toMatch(/^\d{4}$/);
  });

  it("generates an eight-digit PIN", () => {
    const pin = generatePin({
      length: 8,
    });

    expect(pin).toMatch(/^\d{8}$/);
  });

  it("generates unique PINs across multiple samples", () => {
    const pins = new Set();

    for (let index = 0; index < 100; index += 1) {
      pins.add(
        generatePin({
          length: 8,
        }),
      );
    }

    expect(pins.size).toBeGreaterThan(90);
  });
});