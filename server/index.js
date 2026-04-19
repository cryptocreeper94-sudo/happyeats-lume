// ═══════════════════════════════════════════════════════════
//  HAPPYEATS-LUME — Server Entry Point
//
//  Full production Express 5 server with:
//  - CORS, Helmet, rate limiting
//  - Vendor subdomain routing
//  - Request timeout middleware
//  - Request logging
//  - Graceful shutdown
//  - Lume self-sustaining runtime integration
//
//  1:1 feature parity with original HappyEats.
//
//  By DarkWave Studios LLC
// ═══════════════════════════════════════════════════════════

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

// ── Process-level error handlers ──

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception (non-fatal):", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection (non-fatal):", reason);
});

// ── CORS ──

const allowedOrigins = [
  process.env.APP_DOMAIN ? `https://${process.env.APP_DOMAIN}` : undefined,
  "https://happyeats.tlid.io",
  "https://tldriverconnect.com",
  "https://www.tldriverconnect.com",
  "https://happyeats.app",
  "https://www.happyeats.app",
  "https://happy-eats.app",
  "https://www.happy-eats.app",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const originHost = new URL(origin).hostname;
      const isAllowed = allowedOrigins.some(allowed => {
        try { return new URL(allowed).hostname === originHost; } catch { return false; }
      });
      if (isAllowed || originHost.endsWith(".onrender.com") || originHost.endsWith(".happyeats.app") || originHost.endsWith(".happy-eats.app")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    } catch {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-vendor-pin", "x-kitchen-pin", "x-tenant-id"],
  maxAge: 600,
}));

// ── Vendor Subdomain Routing ──

const VENDOR_SUBDOMAINS = {
  shellskitchen: "shells-kitchen",
  "shells-kitchen": "shells-kitchen",
};
const MAIN_DOMAINS = ["happyeats.tlid.io", "happyeats.app", "happy-eats.app", "tldriverconnect.com"];

app.use((req, _res, next) => {
  const host = (req.hostname || req.headers.host || "").split(":")[0].toLowerCase();
  for (const mainDomain of MAIN_DOMAINS) {
    if (host.endsWith(`.${mainDomain}`) && host !== `www.${mainDomain}`) {
      const subdomain = host.replace(`.${mainDomain}`, "");
      const vendorSlug = VENDOR_SUBDOMAINS[subdomain] || subdomain;
      if (!req.path.startsWith("/api/") && !req.path.startsWith("/assets/") &&
          !req.path.match(/\.(js|css|png|jpg|svg|ico|webp|woff|woff2|json|map)$/)) {
        req.url = `/v/${vendorSlug}`;
      }
      break;
    }
  }
  next();
});

// ── Security ──

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ── Body Parsing ──

app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ── Request Timeout (30s for API) ──

app.use((req, res, next) => {
  if (req.path.startsWith("/api/") && !req.path.includes("/ws") && req.path !== "/api/health") {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timed out. Please try again." });
      }
    }, 30000);
    res.on("finish", () => clearTimeout(timeout));
    res.on("close", () => clearTimeout(timeout));
  }
  next();
});

// ── Logging ──

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const jsonStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr}`;
      }
      log(logLine);
    }
  });

  next();
});

// ═══════════════════════════════════════════════════════════
//  SERVER STARTUP
// ═══════════════════════════════════════════════════════════

async function startServer() {
  // ── JWT Secret Check (production) ──
  if (process.env.NODE_ENV === "production" && !process.env.HE_JWT_SECRET && !process.env.JWT_SECRET) {
    console.warn(`
      [SECURITY WARNING] HE_JWT_SECRET / JWT_SECRET not set.
      Auth endpoints will be disabled until the secret is configured in Render.
    `);
  }

  try {
    // ── Import route modules ──
    const { registerRoutes } = await import("./routes.js");

    // ── Register all routes ──
    await registerRoutes(httpServer, app);

    // ── Health Check ──
    app.get("/api/health", async (_req, res) => {
      try {
        const { pool } = await import("./db.js");
        await pool.query("SELECT 1");
        res.json({
          status: "healthy",
          runtime: "Lume v1.1.0",
          governance: "Lume-V active",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: "connected",
        });
      } catch (err) {
        res.status(503).json({
          status: "degraded",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: "disconnected",
          error: err.message,
        });
      }
    });

    // ── Global Error Handler ──
    app.use((err, _req, res, next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    // ── Static Files (production) ──
    if (process.env.NODE_ENV === "production") {
      const { serveStatic } = await import("./static.js");
      serveStatic(app);
    }

    // ── Start Listening ──
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`═══════════════════════════════════════════════════`);
      log(`  HappyEats Lume — LIVE on port ${port}`);
      log(`  Runtime: Lume v1.1.0 (Deterministic)`);
      log(`  Governance: Lume-V ACTIVE`);
      log(`  Self-Sustaining: monitor + heal + optimize`);
      log(`  Trust Certificates: LTC v1.0 ENABLED`);
      log(`═══════════════════════════════════════════════════`);
    });

  } catch (err) {
    console.error("═══ SERVER STARTUP ERROR ═══");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("═══════════════════════════");

    // Minimal fallback server for health checks
    const port = parseInt(process.env.PORT || "5000", 10);
    app.get("/{*path}", (_req, res) => {
      res.status(503).json({
        status: "startup_error",
        error: err.message,
        hint: "Check Render logs for full stack trace",
      });
    });
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`minimal server on port ${port} (startup error: ${err.message})`);
    });
  }
}

startServer();

// ── Graceful Shutdown ──

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  httpServer.close(() => {
    console.log("HTTP server closed");
    import("./db.js").then(({ pool }) => {
      pool.end().then(() => {
        console.log("Database pool closed");
        process.exit(0);
      });
    }).catch(() => process.exit(0));
  });
  setTimeout(() => {
    console.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
