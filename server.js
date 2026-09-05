// Custom server entry point for hosts that require an HTTP server they can
// require() directly instead of running `next start` (e.g. cPanel's Node.js
// Selector, built on Phusion Passenger). Not used by `next dev`/`next start`
// or by platforms that run Next.js natively (Vercel, etc.) — see README.md.
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, not bundled by Next */
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Server listening on port ${port} (${dev ? "development" : "production"})`);
  });
});
