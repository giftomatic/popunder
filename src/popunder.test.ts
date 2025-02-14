import { describe, beforeEach, afterEach, expect, test, vi } from "vitest";
import "./popunder";

describe("Popunder", () => {
  function setupElements() {
    const anchor = document.createElement("a");
    anchor.href = "https://example.com/";

    document.body.appendChild(anchor);
    return anchor;
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("Regular links should not trigger popunder", () => {
    const anchor = setupElements();

    anchor.click();
    expect(document.location.href).toBe("https://example.com/");
  });
});
