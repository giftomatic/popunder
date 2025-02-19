import { describe, beforeEach, expect, test, vi } from "vitest";
import { install } from "./popunder";

describe("Popunder", () => {
  function setupElements() {
    document.location.href = "http://localhost/";

    const anchor = document.createElement("a");
    anchor.href = "https://example.com/";
    document.body.appendChild(anchor);

    const anchor2 = document.createElement("a");
    anchor2.href = "https://example.com/";
    anchor2.setAttribute("data-popunder", "https://example.com/popunder");
    document.body.appendChild(anchor2);

    install();

    return { anchor, anchor2 };
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "open").mockImplementation((url, target) => {
      return {
        location: { href: url },
      } as Window;
    });
  });

  test("Regular links should not trigger popunder", () => {
    const { anchor } = setupElements();

    expect(document.location.href).toContain("localhost");
    anchor.click();
    expect(document.location.href).toBe("https://example.com/");
    expect(window.open).not.toHaveBeenCalled();
  });

  test("Links with data-popunder should trigger popunder", () => {
    const { anchor2 } = setupElements();

    expect(document.location.href).toContain("localhost");
    anchor2.click();
    expect(document.location.href).contain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(3000);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Links with data-popunder and data-refresh-delay should trigger popunder after delay", () => {
    const { anchor2 } = setupElements();
    anchor2.setAttribute("data-refresh-delay", "5");

    expect(document.location.href).toContain("localhost");
    anchor2.click();
    expect(document.location.href).toContain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");

    vi.advanceTimersByTime(4000);
    expect(document.location.href).toContain("localhost");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(5000);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Links with data-popunder should not trigger popunder when visibility changes", () => {
    const { anchor2 } = setupElements();

    expect(document.location.href).toContain("localhost");
    anchor2.click();
    expect(document.location.href).toContain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(5000);
    expect(document.location.href).toContain("localhost");
  });

  test("click on element nested in an anchor element should trigger popunder", () => {
    const { anchor2 } = setupElements();

    const span = document.createElement("span");
    anchor2.appendChild(span);

    expect(document.location.href).toContain("localhost");
    span.click();
    expect(document.location.href).toContain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");
  });

  test("click on element in the document body should not trigger popunder", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.click();
    expect(window.open).not.toHaveBeenCalled();
  });
});
