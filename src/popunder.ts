let loaded = false;
let refreshDelay = 3;
let activePopunderUrl: string | undefined;
let timoutId: number | undefined;
let useOnvisibilityChange = true;
const mobileUserAgentPattern =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
const inAppBrowserUserAgentPattern =
  /; wv\)|\bwv\b|gmail|outlook|microsoft outlook|fban|fbav|instagram|line|linkedinapp|tiktok|twitter/i;

function onClick(e: MouseEvent) {
  const element = getParentAnchor(e.target);
  if (!element) {
    return;
  }

  // Check popunder URL defined
  const popunder = element.getAttribute("data-popunder");
  if (!popunder) {
    return;
  }

  // Check popunder URL is valid HTTPS URL
  try {
    const validUrl = new URL(popunder);
    if (validUrl.protocol !== "https:") {
      return;
    }
  } catch (e) {
    return;
  }

  e.preventDefault();

  if (isMobileInAppBrowser()) {
    window.open(element.href, "_blank");
    return;
  }

  activePopunderUrl = popunder;
  refreshDelay = getRefreshDelay(element);

  if (!useOnvisibilityChange) {
    redirectToPopunder();
  }
  window.open(element.href, "_blank");
}

function getRefreshDelay(element: HTMLAnchorElement) {
  const mobileRefreshDelay = element.getAttribute("data-refresh-delay-mobile");
  const defaultRefreshDelay = element.getAttribute("data-refresh-delay");
  const configuredRefreshDelay =
    isMobileUserAgent() && mobileRefreshDelay !== null
      ? mobileRefreshDelay
      : defaultRefreshDelay;

  return configuredRefreshDelay !== null
    ? parseInt(configuredRefreshDelay, 10)
    : 3;
}

function isMobileUserAgent() {
  return mobileUserAgentPattern.test(navigator.userAgent);
}

function isMobileInAppBrowser() {
  const userAgent = navigator.userAgent;

  return (
    isMobileUserAgent() &&
    (inAppBrowserUserAgentPattern.test(userAgent) ||
      isIosWebViewUserAgent(userAgent))
  );
}

function isIosWebViewUserAgent(userAgent: string) {
  return (
    /iphone|ipad|ipod/i.test(userAgent) &&
    /applewebkit/i.test(userAgent) &&
    !/safari/i.test(userAgent)
  );
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
  loaded = false;
}

export function install() {
  // for Google Tag Manager
  window.addEventListener("load", attachPopunder);
  if (document.readyState === "complete") {
    attachPopunder();
  }
}
