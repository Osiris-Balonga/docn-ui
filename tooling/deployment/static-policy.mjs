export const staticSecurityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' blob: https://eu.i.posthog.com",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' blob: data:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export function cacheControlForPath(pathname) {
  if (
    pathname.startsWith("/_next/static/") ||
    /^\/r\/v\d+\.\d+\.\d+\//.test(pathname)
  )
    return "public, max-age=31536000, immutable";
  if (pathname.startsWith("/r/dev/"))
    return "no-cache, no-store, must-revalidate";
  return "public, max-age=0, must-revalidate";
}
