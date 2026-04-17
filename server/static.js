/**
 * HappyEats Lume — Static File Server
 * Serves public/ assets and branded catch-all for any route
 * not handled by the API.
 */
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import expressModule from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#10b981">
  <meta name="description" content="HappyEats — Lume-native food truck ordering platform. Nashville I-24 Corridor.">
  <title>HappyEats — Food Truck Ordering</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/icons/icon-192.png" type="image/png">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{height:100%}
    body{
      background:#040a06;
      color:#fff;
      font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;
      display:flex;align-items:center;justify-content:center;
      min-height:100vh;text-align:center;padding:24px;
    }
    .card{max-width:440px;width:100%}
    .logo{width:80px;height:80px;border-radius:22px;
      background:linear-gradient(135deg,#065f46,#10b981);
      display:flex;align-items:center;justify-content:center;
      font-size:40px;margin:0 auto 28px;
      box-shadow:0 0 60px rgba(16,185,129,0.25)}
    h1{font-size:32px;font-weight:800;letter-spacing:-0.02em;margin-bottom:12px}
    .sub{font-size:16px;color:rgba(255,255,255,0.45);line-height:1.65;margin-bottom:36px;max-width:340px;margin-left:auto;margin-right:auto}
    .status{display:inline-flex;align-items:center;gap:10px;
      padding:10px 22px;border-radius:999px;
      background:rgba(16,185,129,0.08);
      border:1px solid rgba(16,185,129,0.2);
      color:#6ee7b7;font-size:13px;font-weight:700;margin-bottom:20px}
    .dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
    .meta{font-size:11px;color:rgba(255,255,255,0.18);margin-top:28px;line-height:1.6}
    .meta a{color:rgba(16,185,129,0.5);text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍔</div>
    <h1>HappyEats</h1>
    <p class="sub">
      Lume-native food truck ordering platform.<br>
      Nashville I-24 Corridor. Daily cutoff 11 AM.
    </p>
    <div class="status">
      <div class="dot"></div>
      API Online &mdash; Lume-V Governance Active
    </div>
    <div class="meta">
      Built on <a href="https://lume-lang.org" target="_blank" rel="noopener">Lume v1.1.0</a>
      &middot; Deployed on <a href="https://trusthub.tlid.io" target="_blank" rel="noopener">Trust Layer</a>
    </div>
  </div>
</body>
</html>`;

/**
 * Wire static file serving onto an Express app.
 * Called in production after all API routes are registered.
 */
export function serveStatic(app) {
  // Serve files from server/public/ (manifest.json, icons, etc.)
  if (fs.existsSync(publicDir)) {
    app.use(expressModule.static(publicDir, {
      maxAge: "7d",
      etag: true,
      index: false, // don't auto-serve index.html for directory requests
    }));
  }

  // SPA / catch-all: serve index.html if it exists, else branded landing
  app.get("/{*path}", (_req, res) => {
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(LANDING_HTML);
    }
  });
}
