let loaded = false;
let refreshDelay = 3;
let activePopunderUrl: string | undefined;
let timoutId: number | undefined;
let useOnvisibilityChange = true;
const mobileUserAgentPattern =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;

const validHttpUrlPattern = new RegExp(
  "^(https?:\\/\\/)?" +
    "(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}" +
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
    "(\\?[;&a-z\\d%_.~+=-]*)?" +
    "(\\#[-a-z\\d_]*)?$",
  "i",
);

function onClick(e: MouseEvent) {
  const element = getParentAnchor(e.target);
  if (!element) {
    return;
  }

  const popunder = element.getAttribute("data-popunder");
  if (!!popunder && validHttpUrlPattern.test(popunder)) {
    e.preventDefault();
    if (shouldShowNotification(element)) {
      showNotification(() => {
        openPopunder(element, popunder);
      });
      return;
    }

    openPopunder(element, popunder);
  }
}

function openPopunder(element: HTMLAnchorElement, popunder: string) {
  activePopunderUrl = popunder;

  if (element.getAttribute("data-refresh-delay")) {
    refreshDelay = parseInt(element.getAttribute("data-refresh-delay")!, 10);
  }

  if (!useOnvisibilityChange) {
    redirectToPopunder();
  }
  window.open(element.href, "_blank");
}

function shouldShowNotification(element: HTMLAnchorElement) {
  return (
    isMobileUserAgent() &&
    element.getAttribute("data-show-notification") === "true"
  );
}

function isMobileUserAgent() {
  return mobileUserAgentPattern.test(navigator.userAgent);
}

function showNotification(onComplete: () => void) {
  hideNotification();

  const notification = document.createElement("div");
  notification.id = "popunder-notification";
  notification.setAttribute("role", "dialog");
  notification.setAttribute("aria-modal", "true");
  notification.setAttribute("aria-live", "polite");
  notification.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,0.56);padding:20px;";

  const message = document.createElement("div");
  message.textContent =
    "The original link will open in a new tab. This tab will load the related page shortly.";
  message.style.cssText =
    "max-width:320px;background:#ffffff;color:#111827;padding:20px;border-radius:8px;font:16px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:0 18px 48px rgba(0,0,0,0.32);";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "OK";
  button.style.cssText =
    "display:block;width:100%;margin-top:16px;border:0;border-radius:6px;background:#111827;color:#ffffff;padding:12px 16px;font:600 16px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;";
  button.addEventListener("click", () => {
    hideNotification();
    onComplete();
  });

  notification.appendChild(message);
  message.appendChild(button);
  document.body.appendChild(notification);
}

function hideNotification() {
  const notification = document.getElementById("popunder-notification");
  if (notification) {
    notification.remove();
  }
}

function getParentAnchor(
  element: EventTarget | HTMLElement | null,
): HTMLAnchorElement | null {
  while (element && element instanceof HTMLElement) {
    if (element instanceof HTMLAnchorElement) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    redirectToPopunder();
  } else {
    reset();
  }
}

function redirectToPopunder() {
  if (activePopunderUrl !== undefined) {
    timoutId = window.setTimeout(() => {
      document.location.href = activePopunderUrl!;
    }, refreshDelay * 1000);
  }
}

function reset() {
  activePopunderUrl = undefined;
  refreshDelay = 3;
  clearTimeout(timoutId);
  hideNotification();
}

export function attachPopunder() {
  if (loaded) {
    return;
  }
  document.body.addEventListener("click", onClick, true);

  if ("hidden" in document) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    useOnvisibilityChange = true;
  } else {
    useOnvisibilityChange = false;
  }
  loaded = true;
}

export function detachPopunder() {
  document.body.removeEventListener("click", onClick, true);
  if (useOnvisibilityChange) {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }
  reset();
  loaded = false;
}

export function install() {
  // for Google Tag Manager
  window.addEventListener("load", attachPopunder);
  if (document.readyState === "complete") {
    attachPopunder();
  }
}
