// Production entry point: runs Next.js and serves runtime uploads.
// `next start` only serves files that were in public/ when the server booted,
// so images uploaded later are streamed from disk here.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import nextModule from "next";

const createNextApp = nextModule.default ?? nextModule;

// HOSTNAME is set to the container ID by Docker, so a dedicated variable is used.
const host = process.env.BIND_HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const uploadRoot = path.join(process.cwd(), "public", "uploads");

const UPLOAD_PATH =
  /^\/uploads\/(about|articles|avatars|champions|promos)\/([A-Za-z0-9][A-Za-z0-9._-]*\.(jpe?g|png|webp))$/i;
const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

async function serveUpload(req, res, match) {
  const [, category, fileName, ext] = match;
  const filePath = path.join(uploadRoot, category, fileName);
  let info;
  try {
    info = await stat(filePath);
  } catch {
    info = null;
  }
  if (!info?.isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not Found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": CONTENT_TYPES[ext.toLowerCase()],
    "Content-Length": info.size,
    "Cache-Control": "public, max-age=2592000, immutable",
    "Last-Modified": info.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(filePath)
    .on("error", () => res.destroy())
    .pipe(res);
}

const app = createNextApp({ dev: false, dir: process.cwd(), hostname: host, port });
const handle = app.getRequestHandler();
await app.prepare();

const server = createServer((req, res) => {
  // The app defines no Server Actions, so any Next-Action header is a scanner
  // probe (e.g. CVE-2025-55182 sweeps); reject it before it reaches Next.js.
  if (req.headers["next-action"] !== undefined) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not Found");
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    const pathname = (req.url || "/").split("?")[0];
    const match = UPLOAD_PATH.exec(pathname);
    if (match) {
      void serveUpload(req, res, match);
      return;
    }
  }
  handle(req, res).catch((error) => {
    console.error("[server] request failed", error);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  });
});

server.keepAliveTimeout = 65_000;
server.listen(port, host, () => {
  console.log(`[server] Ready on http://${host}:${port}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  server.closeIdleConnections?.();
  setTimeout(() => process.exit(0), 25_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
