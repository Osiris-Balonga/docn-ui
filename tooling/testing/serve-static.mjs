import httpServer from "http-server";
import {
  cacheControlForPath,
  staticSecurityHeaders,
} from "../deployment/static-policy.mjs";

const [root = "apps/www/out", host = "127.0.0.1", rawPort = "4173"] =
  process.argv.slice(2);
const port = Number.parseInt(rawPort, 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535)
  throw new Error(`Invalid static server port: ${rawPort}`);

const server = httpServer.createServer({
  root,
  cache: cacheControlForPath,
  headers: staticSecurityHeaders,
});

server.listen(port, host, () => {
  process.stdout.write(`Serving ${root} at http://${host}:${port}\n`);
});
