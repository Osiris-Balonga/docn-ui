import httpServer from "http-server";

const [root = "apps/www/out", host = "127.0.0.1", rawPort = "4173"] =
  process.argv.slice(2);
const port = Number.parseInt(rawPort, 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535)
  throw new Error(`Invalid static server port: ${rawPort}`);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' blob:",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' blob: data:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join("; ");

const server = httpServer.createServer({
  root,
  cache: -1,
  headers: {
    "Content-Security-Policy": contentSecurityPolicy,
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  },
});

server.listen(port, host, () => {
  process.stdout.write(`Serving ${root} at http://${host}:${port}\n`);
});
