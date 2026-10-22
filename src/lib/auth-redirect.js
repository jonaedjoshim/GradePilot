const ALLOWED_ROUTES = new Set([
  "/",
  "/calculator",
  "/prediction",
  "/improvement",
  "/insights",
  "/about",
]);

export function getSafeRedirect(value) {
  if (typeof value !== "string") {
    return "/";
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(path, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    if (!ALLOWED_ROUTES.has(url.pathname)) {
      return "/";
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

export function getAuthRedirect(search) {
  const params = new URLSearchParams(search);

  return getSafeRedirect(params.get("redirect"));
}

export function createAuthLink(page, redirect = "/") {
  const safeRedirect = getSafeRedirect(redirect);

  return safeRedirect === "/"
    ? page
    : `${page}?redirect=${encodeURIComponent(safeRedirect)}`;
}
