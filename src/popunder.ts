let loaded = false;
let refreshDelay = 3;
let activePopunderUrl: string | undefined;
let timoutId: number | undefined;
let useOnvisibilityChange = true;

const validHttpUrlPattern = new RegExp(
  "^(https?:\\/\\/)?" +
    "(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}" +
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
    "(\\?[;&a-z\\d%_.~+=-]*)?" +
    "(\\#[-a-z\\d_]*)?$",
  "i"
);

function onClick(e: MouseEvent) {
  const element = getParentAnchor(e.target);
  if (!element) {
    return;
  }

  const popunder = element.getAttribute("data-popunder");
  if (!!popunder && validHttpUrlPattern.test(popunder)) {
    e.preventDefault();
    activePopunderUrl = popunder;

    if (element.getAttribute("data-refresh-delay")) {
      refreshDelay = parseInt(element.getAttribute("data-refresh-delay"), 10);
    }

    if (!useOnvisibilityChange) {
      redirectToPopunder();
    }
    window.open(element.href, "_blank");
  }
}

function getParentAnchor(
  element: EventTarget | HTMLElement | null
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
    timoutId = setTimeout(() => {
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
  document.body.addEventListener("click", onClick);

  if ("hidden" in document) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    useOnvisibilityChange = true;
  } else {
    useOnvisibilityChange = false;
  }
  loaded = true;
}

export function detachPopunder() {
  document.body.removeEventListener("click", onClick);
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
