// Custom server entry point for hosts (like cPanel's "Setup Node.js App",
// which runs on Phusion Passenger) that expect an application startup file
// listening on process.env.PORT, rather than running `next start` directly.
//
// Set this file as the "Application startup file" in cPanel's Node.js App
// manager. Local development and `npm start` are unaffected — they still
// use the Next.js CLI directly.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`CMS ready on port ${port}`);
  });
});
