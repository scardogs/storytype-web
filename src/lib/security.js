const MIN_SECRET_LENGTH = 32;

export function getRequiredSecret(name) {
  const value = process.env[name];

  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `${name} must be set and at least ${MIN_SECRET_LENGTH} characters long`
    );
  }

  return value;
}

export function getRequestOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;

  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

export function getExpectedOrigin(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl) {
    try {
      return new URL(appUrl);
    } catch {
      return null;
    }
  }

  const host = req.headers.host;
  if (!host) return null;

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  try {
    return new URL(`${protocol}://${host}`);
  } catch {
    return null;
  }
}

export function assertSameOrigin(req) {
  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) return true;

  const expectedOrigin = getExpectedOrigin(req);
  if (!expectedOrigin) return true;

  return requestOrigin.origin === expectedOrigin.origin;
}
