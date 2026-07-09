import { describe, beforeEach, afterEach, expect, test, vi } from "vitest";
import { install, detachPopunder } from "./popunder";

describe("Popunder", () => {
  function setupElements() {
    document.location.href = "http://localhost/";
    document.body.innerHTML = "";

    const regularAnchor = document.createElement("a");
    regularAnchor.href = "https://example.com/";
    document.body.appendChild(regularAnchor);

    const anchorWithPopUnder = document.createElement("a");
    anchorWithPopUnder.href = "https://example.com/";
    anchorWithPopUnder.setAttribute("data-popunder", "https://example.com/popunder");
    document.body.appendChild(anchorWithPopUnder);

    install();

    return { regularAnchor, anchorWithPopUnder };
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    document.location.href = "http://localhost/";

    vi.spyOn(window, "open").mockImplementation((url) => {
      return {
        location: { href: url as string },
      } as Window;
    });
  });

  afterEach(() => {
    detachPopunder();
    vi.clearAllTimers();
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  test("Regular links should not trigger popunder", () => {
    const { regularAnchor } = setupElements();

    expect(document.location.href).toContain("localhost");
    regularAnchor.click();
    expect(document.location.href).toBe("https://example.com/");
    expect(window.open).not.toHaveBeenCalled();
  });

  test("Links with data-popunder should trigger popunder", () => {
    const { anchorWithPopUnder } = setupElements();

    expect(document.location.href).toContain("localhost");
    anchorWithPopUnder.click();
    expect(document.location.href).toContain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(3000);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Unsafe links (non-HTTPS) shouldn't trigger popunder", () => {
    const { anchorWithPopUnder } = setupElements();
    anchorWithPopUnder.setAttribute("data-popunder", "http://example.com/");
    anchorWithPopUnder.click();
    expect(window.open).not.toHaveBeenCalled();
  });

  test("Links with data-popunder and data-refresh-delay should trigger popunder after delay", () => {
    const { anchorWithPopUnder } = setupElements();
    anchorWithPopUnder.setAttribute("data-refresh-delay", "5");

    expect(document.location.href).toContain("localhost");
    anchorWithPopUnder.click();
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

  test("Links with data-refresh-delay-mobile should use mobile delay on mobile devices", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    );
    const { anchorWithPopUnder } = setupElements();
    anchorWithPopUnder.setAttribute("data-refresh-delay", "5");
    anchorWithPopUnder.setAttribute("data-refresh-delay-mobile", "1");

    anchorWithPopUnder.click();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    vi.advanceTimersByTime(999);
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(1);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Mobile devices should fall back to data-refresh-delay when mobile delay is not set", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
    );
    const { anchorWithPopUnder } = setupElements();
    anchorWithPopUnder.setAttribute("data-refresh-delay", "5");

    anchorWithPopUnder.click();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    vi.advanceTimersByTime(4999);
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(1);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Desktop devices should ignore data-refresh-delay-mobile", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
    );
    const { anchorWithPopUnder } = setupElements();
    anchorWithPopUnder.setAttribute("data-refresh-delay", "5");
    anchorWithPopUnder.setAttribute("data-refresh-delay-mobile", "1");

    anchorWithPopUnder.click();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    vi.advanceTimersByTime(4999);
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(1);
    expect(document.location.href).toBe("https://example.com/popunder");
  });

  test("Android in-app browsers should ignore the popunder link", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UP1A.231005.007; wv) AppleWebKit/537.36 Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 Gmail",
    );
    const { anchorWithPopUnder } = setupElements();

    anchorWithPopUnder.click();

    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");
    expect(document.location.href).toContain("localhost");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(3000);
    expect(document.location.href).toContain("localhost");
  });

  test("iOS in-app browsers should ignore the popunder link", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Gmail",
    );
    const { anchorWithPopUnder } = setupElements();

    anchorWithPopUnder.click();

    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");
    expect(document.location.href).toContain("localhost");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(3000);
    expect(document.location.href).toContain("localhost");
  });

  test("Links with data-popunder should not trigger popunder when visibility changes", () => {
    const { anchorWithPopUnder } = setupElements();

    expect(document.location.href).toContain("localhost");
    anchorWithPopUnder.click();
    expect(document.location.href).toContain("localhost");
    expect(window.open).toHaveBeenCalledWith("https://example.com/", "_blank");

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.location.href).toContain("localhost");
    vi.advanceTimersByTime(5000);
    expect(document.location.href).toContain("localhost");
  });

  test("click on element nested in an anchor element should trigger popunder", () => {
    const { anchorWithPopUnder } = setupElements();

    const span = document.createElement("span");
    anchorWithPopUnder.appendChild(span);

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
