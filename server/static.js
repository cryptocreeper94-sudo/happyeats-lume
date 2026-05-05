import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import expressModule from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../dist/public");

/**
 * Wire static file serving onto an Express app.
 * Called in production after all API routes are registered.
 */
export function serveStatic(app) {
  if (fs.existsSync(publicDir)) {
    app.use(expressModule.static(publicDir, {
      maxAge: "7d",
      etag: true,
      index: false,
    }));
  }

  app.get("/{*path}", (_req, res) => {
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("React frontend build missing or not found in dist/public.");
    }
  });
}
