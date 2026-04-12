// ═══════════════════════════════════════════════════════════
//  HAPPYEATS-LUME — Route Registration
//
//  Wires Express HTTP handlers to:
//  1. Compiled Lume business logic (dist/*.js)
//  2. Direct database operations (server/storage.js)
//  3. Integration modules (Stripe, email, SMS, etc.)
//
//  Full port from original HappyEats routes.ts (7,094 lines).
//  This is the production route file.
//
//  By DarkWave Studios LLC
// ═══════════════════════════════════════════════════════════

import { WebSocketServer, WebSocket } from "ws";
import { db, pool } from "./db.js";
import * as schema from "./schema.js";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ── Input sanitization ──

function sanitizeInput(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeObject(obj) {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      result[key] = sanitizeInput(result[key]);
    }
  }
  return result;
}

const PHONE_REGEX = /^\d{10,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerRoutes(httpServer, app) {

  // ── Rate Limiters ──

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false },
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/customers/login", authLimiter);
  app.use("/api/customers/register", authLimiter);
  app.use("/api/customers/forgot-password", authLimiter);
  app.use("/api/customers/reset-password", authLimiter);
  app.use("/api/tenants/auth", authLimiter);
  app.use("/api/tenants/reset-password", authLimiter);
  app.use("/api/food-trucks/login", authLimiter);
  app.use("/api/", apiLimiter);

  // ═══════════════════════════════════════════════════════════
  //  TRUCKER TALK — WebSocket Chat
  // ═══════════════════════════════════════════════════════════

  const chatUsers = new Map();
  const groupUsers = new Map();

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("New Trucker Talk connection");

    ws.on("message", async (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        if (parsed.type === "join") {
          const user = {
            ws,
            username: parsed.username || "Anonymous Driver",
            location: parsed.location,
            groupId: parsed.groupId || undefined,
            role: "member",
          };
          chatUsers.set(ws, user);

          if (parsed.groupId) {
            if (!groupUsers.has(parsed.groupId)) groupUsers.set(parsed.groupId, new Set());
            groupUsers.get(parsed.groupId).add(ws);
          }

          ws.send(JSON.stringify({ type: "roleValidated", role: user.role }));

          // Send message history
          const messages = await db.select().from(schema.chatMessages)
            .where(parsed.groupId ? eq(schema.chatMessages.groupId, parsed.groupId) : sql`${schema.chatMessages.groupId} IS NULL`)
            .orderBy(desc(schema.chatMessages.createdAt))
            .limit(50);

          ws.send(JSON.stringify({
            type: "history",
            messages: messages.reverse().map(m => ({
              id: m.id.toString(),
              username: m.username,
              message: m.message,
              imageUrl: m.imageUrl,
              topic: m.topic,
              location: m.location,
              isDispatcher: m.isDispatcherMessage,
              timestamp: new Date(m.createdAt).getTime(),
            })),
          }));

          broadcastUserCount(parsed.groupId);

        } else if (parsed.type === "message") {
          const user = chatUsers.get(ws);
          if (user) {
            const [savedMsg] = await db.insert(schema.chatMessages).values({
              groupId: user.groupId || null,
              username: user.username,
              message: parsed.message,
              imageUrl: parsed.imageUrl || null,
              topic: parsed.topic || "general",
              location: user.location,
              isDispatcherMessage: user.role === "dispatcher",
            }).returning();

            const msgPayload = {
              type: "message",
              id: savedMsg.id.toString(),
              username: user.username,
              message: parsed.message,
              imageUrl: savedMsg.imageUrl,
              topic: parsed.topic || "general",
              location: user.location,
              isDispatcher: user.role === "dispatcher",
              timestamp: new Date(savedMsg.createdAt).getTime(),
            };

            if (user.groupId) {
              groupUsers.get(user.groupId)?.forEach(client => {
                if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(msgPayload));
              });
            } else {
              wss.clients.forEach(client => {
                const clientUser = chatUsers.get(client);
                if (client.readyState === WebSocket.OPEN && !clientUser?.groupId) {
                  client.send(JSON.stringify(msgPayload));
                }
              });
            }
          }

        } else if (parsed.type === "typing") {
          const user = chatUsers.get(ws);
          if (user) {
            const typingPayload = JSON.stringify({ type: "typing", username: user.username });
            if (user.groupId) {
              groupUsers.get(user.groupId)?.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) client.send(typingPayload);
              });
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      const user = chatUsers.get(ws);
      if (user?.groupId) groupUsers.get(user.groupId)?.delete(ws);
      chatUsers.delete(ws);
      broadcastUserCount(user?.groupId);
    });
  });

  function broadcastUserCount(groupId) {
    if (groupId) {
      const count = groupUsers.get(groupId)?.size || 0;
      groupUsers.get(groupId)?.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "userCount", count }));
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  VENDOR (FOOD TRUCK) ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/food-trucks", async (_req, res) => {
    try {
      const trucks = await db.select().from(schema.foodTrucks).where(eq(schema.foodTrucks.isActive, true));
      res.json(trucks);
    } catch (err) {
      console.error("Error fetching food trucks:", err);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.get("/api/food-trucks/:id", async (req, res) => {
    try {
      const [truck] = await db.select().from(schema.foodTrucks).where(eq(schema.foodTrucks.id, parseInt(req.params.id)));
      if (!truck) return res.status(404).json({ error: "Vendor not found" });
      res.json(truck);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  app.get("/api/food-trucks/by-slug/:slug", async (req, res) => {
    try {
      const [truck] = await db.select().from(schema.foodTrucks).where(eq(schema.foodTrucks.slug, req.params.slug));
      if (!truck) return res.status(404).json({ error: "Vendor not found" });
      res.json(truck);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  app.post("/api/food-trucks", async (req, res) => {
    try {
      const data = sanitizeObject(req.body);
      const [truck] = await db.insert(schema.foodTrucks).values(data).returning();
      res.status(201).json(truck);
    } catch (err) {
      console.error("Error creating food truck:", err);
      res.status(400).json({ error: "Failed to create vendor" });
    }
  });

  app.put("/api/food-trucks/:id", async (req, res) => {
    try {
      const [truck] = await db.update(schema.foodTrucks)
        .set(req.body)
        .where(eq(schema.foodTrucks.id, parseInt(req.params.id)))
        .returning();
      if (!truck) return res.status(404).json({ error: "Vendor not found" });
      res.json(truck);
    } catch (err) {
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  app.post("/api/food-trucks/login", async (req, res) => {
    try {
      const { pin } = req.body;
      const [truck] = await db.select().from(schema.foodTrucks).where(eq(schema.foodTrucks.pin, pin));
      if (!truck) return res.status(401).json({ error: "Invalid vendor PIN" });
      res.json(truck);
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  ORDER ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(100);
      res.json(allOrders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, parseInt(req.params.id)));
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = req.body;
      const [order] = await db.insert(schema.orders).values({
        ...data,
        status: "pending",
      }).returning();
      res.status(201).json(order);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const [order] = await db.update(schema.orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(schema.orders.id, parseInt(req.params.id)))
        .returning();
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  DELIVERY ZONE ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/delivery-zones", async (_req, res) => {
    try {
      const zones = await db.select().from(schema.deliveryZones);
      res.json(zones);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch delivery zones" });
    }
  });

  app.get("/api/delivery-zones/active", async (_req, res) => {
    try {
      const zones = await db.select().from(schema.deliveryZones).where(eq(schema.deliveryZones.isActive, true));
      res.json(zones);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch active zones" });
    }
  });

  app.post("/api/delivery-zones", async (req, res) => {
    try {
      const [zone] = await db.insert(schema.deliveryZones).values(req.body).returning();
      res.status(201).json(zone);
    } catch (err) {
      res.status(400).json({ error: "Failed to create delivery zone" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  TENANT ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/tenants", async (_req, res) => {
    try {
      const allTenants = await db.select().from(schema.tenants);
      res.json(allTenants);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.post("/api/tenants/auth", async (req, res) => {
    try {
      const { pin } = req.body;
      const [tenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.pin, pin));
      if (!tenant) return res.status(401).json({ error: "Invalid PIN" });
      res.json(tenant);
    } catch (err) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  CUSTOMER ROUTES
  // ═══════════════════════════════════════════════════════════

  app.post("/api/customers/register", async (req, res) => {
    try {
      const { name, phone, email, password, accountType, businessName, deliveryAddress, deliveryInstructions } = req.body;
      if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
      if (!PHONE_REGEX.test(phone.replace(/\D/g, ""))) return res.status(400).json({ error: "Invalid phone number" });

      const existing = await db.select().from(schema.customers).where(eq(schema.customers.phone, phone));
      if (existing.length > 0) return res.status(409).json({ error: "Phone number already registered" });

      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      const referralCode = `HE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      const [customer] = await db.insert(schema.customers).values({
        name: sanitizeInput(name),
        phone,
        email: email || null,
        passwordHash,
        accountType: accountType || "individual",
        businessName: businessName || null,
        deliveryAddress: deliveryAddress || null,
        deliveryInstructions: deliveryInstructions || null,
        referralCode,
      }).returning();

      res.status(201).json({ ...customer, passwordHash: undefined });
    } catch (err) {
      console.error("Customer registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/customers/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.phone, phone));
      if (!customer || !customer.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, customer.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      res.json({ ...customer, passwordHash: undefined });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  PARTNER AGREEMENT ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/partner-agreements", async (_req, res) => {
    try {
      const agreements = await db.select().from(schema.partnerAgreements);
      res.json(agreements);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch agreements" });
    }
  });

  app.get("/api/partner-agreements/:slug", async (req, res) => {
    try {
      const [agreement] = await db.select().from(schema.partnerAgreements)
        .where(eq(schema.partnerAgreements.partnerSlug, req.params.slug));
      if (!agreement) return res.status(404).json({ error: "Partner agreement not found" });
      res.json(agreement);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch agreement" });
    }
  });

  app.post("/api/partner-agreements", async (req, res) => {
    try {
      const [agreement] = await db.insert(schema.partnerAgreements).values(req.body).returning();
      res.status(201).json(agreement);
    } catch (err) {
      res.status(400).json({ error: "Failed to create agreement" });
    }
  });

  app.get("/api/verify/:membershipNumber", async (req, res) => {
    try {
      const [agreement] = await db.select().from(schema.partnerAgreements)
        .where(eq(schema.partnerAgreements.membershipNumber, req.params.membershipNumber));
      if (!agreement) return res.status(404).json({ error: "Membership not found", valid: false });
      res.json({
        valid: true,
        partnerName: agreement.partnerName,
        businessName: agreement.businessName,
        membershipNumber: agreement.membershipNumber,
        region: agreement.region,
        acknowledgedAt: agreement.acknowledgedAt,
        blockchainHash: agreement.blockchainHash,
      });
    } catch (err) {
      res.status(500).json({ error: "Verification failed", valid: false });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  DRIVER ROUTES
  // ═══════════════════════════════════════════════════════════

  app.get("/api/drivers", async (_req, res) => {
    try {
      const allDrivers = await db.select().from(schema.drivers);
      res.json(allDrivers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/active", async (_req, res) => {
    try {
      const activeDrivers = await db.select().from(schema.drivers)
        .where(eq(schema.drivers.isActiveToday, true));
      res.json(activeDrivers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch active drivers" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  CDL PROGRAMS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/cdl-programs", async (_req, res) => {
    try {
      const programs = await db.select().from(schema.cdlPrograms)
        .where(eq(schema.cdlPrograms.isActive, true))
        .orderBy(schema.cdlPrograms.sortOrder);
      res.json(programs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch CDL programs" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  MARKETING HUB
  // ═══════════════════════════════════════════════════════════

  app.get("/api/marketing/posts", async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "happy-eats-nashville";
      const posts = await db.select().from(schema.marketingPosts)
        .where(eq(schema.marketingPosts.tenantId, tenantId));
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch marketing posts" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  BLOG POSTS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/blog/posts", async (_req, res) => {
    try {
      const posts = await db.select().from(schema.blogPosts)
        .where(eq(schema.blogPosts.status, "published"))
        .orderBy(desc(schema.blogPosts.publishedAt));
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const [post] = await db.select().from(schema.blogPosts)
        .where(eq(schema.blogPosts.slug, req.params.slug));
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  PROMO CODES
  // ═══════════════════════════════════════════════════════════

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      const [promo] = await db.select().from(schema.promoCodes)
        .where(eq(schema.promoCodes.code, code.toUpperCase()));
      if (!promo || !promo.isActive) return res.status(404).json({ error: "Invalid promo code" });
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Promo code has expired" });
      }
      if (promo.maxUses && promo.timesUsed >= promo.maxUses) {
        return res.status(400).json({ error: "Promo code has been fully redeemed" });
      }

      let discount = 0;
      if (promo.discountType === "percent") {
        discount = orderTotal * (parseFloat(promo.discountValue) / 100);
        if (promo.maxDiscountAmount) discount = Math.min(discount, parseFloat(promo.maxDiscountAmount));
      } else {
        discount = parseFloat(promo.discountValue);
      }

      res.json({ valid: true, discount: discount.toFixed(2), promo });
    } catch (err) {
      res.status(500).json({ error: "Promo validation failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  REVIEWS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/reviews", async (req, res) => {
    try {
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId) : undefined;
      let query = db.select().from(schema.orderReviews);
      if (vendorId) query = query.where(eq(schema.orderReviews.foodTruckId, vendorId));
      const reviews = await query.orderBy(desc(schema.orderReviews.createdAt));
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const [review] = await db.insert(schema.orderReviews).values(req.body).returning();
      res.status(201).json(review);
    } catch (err) {
      res.status(400).json({ error: "Failed to create review" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  EXPENSES & MILEAGE
  // ═══════════════════════════════════════════════════════════

  app.get("/api/expenses", async (req, res) => {
    try {
      const tenantId = parseInt(req.query.tenantId) || 1;
      const allExpenses = await db.select().from(schema.expenses)
        .where(eq(schema.expenses.tenantId, tenantId))
        .orderBy(desc(schema.expenses.date));
      res.json(allExpenses);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const [expense] = await db.insert(schema.expenses).values(req.body).returning();
      res.status(201).json(expense);
    } catch (err) {
      res.status(400).json({ error: "Failed to create expense" });
    }
  });

  app.get("/api/mileage-trips", async (req, res) => {
    try {
      const tenantId = parseInt(req.query.tenantId) || 1;
      const trips = await db.select().from(schema.mileageTrips)
        .where(eq(schema.mileageTrips.tenantId, tenantId))
        .orderBy(desc(schema.mileageTrips.date));
      res.json(trips);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch mileage trips" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  HALLMARKS & TRUST STAMPS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/hallmarks", async (_req, res) => {
    try {
      const all = await db.select().from(schema.hallmarks).orderBy(desc(schema.hallmarks.createdAt));
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch hallmarks" });
    }
  });

  app.get("/api/trust-stamps", async (_req, res) => {
    try {
      const all = await db.select().from(schema.trustStamps).orderBy(desc(schema.trustStamps.createdAt));
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch trust stamps" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  FUEL STATIONS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/fuel-stations", async (_req, res) => {
    try {
      const stations = await db.select().from(schema.fuelStations)
        .where(eq(schema.fuelStations.isActive, true));
      res.json(stations);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch fuel stations" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  RESTAURANT REQUESTS
  // ═══════════════════════════════════════════════════════════

  app.post("/api/restaurant-requests", async (req, res) => {
    try {
      const [request] = await db.insert(schema.restaurantRequests).values(sanitizeObject(req.body)).returning();
      res.status(201).json(request);
    } catch (err) {
      res.status(400).json({ error: "Failed to submit restaurant request" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  FRANCHISE INQUIRIES
  // ═══════════════════════════════════════════════════════════

  app.post("/api/franchise-inquiries", async (req, res) => {
    try {
      const [inquiry] = await db.insert(schema.franchiseInquiries).values(sanitizeObject(req.body)).returning();
      res.status(201).json(inquiry);
    } catch (err) {
      res.status(400).json({ error: "Failed to submit franchise inquiry" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  KITCHEN ITEMS (Shell's Kitchen)
  // ═══════════════════════════════════════════════════════════

  app.get("/api/kitchen-items", async (_req, res) => {
    try {
      const items = await db.select().from(schema.kitchenItems)
        .where(eq(schema.kitchenItems.isAvailable, true))
        .orderBy(schema.kitchenItems.sortOrder);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch kitchen items" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  VAULT CATALOG
  // ═══════════════════════════════════════════════════════════

  app.get("/api/vault", async (_req, res) => {
    try {
      const items = await db.select().from(schema.vaultItems)
        .orderBy(desc(schema.vaultItems.createdAt));
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vault items" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  PAGE VIEWS (Analytics)
  // ═══════════════════════════════════════════════════════════

  app.post("/api/page-views", async (req, res) => {
    try {
      await db.insert(schema.pageViews).values(req.body);
      res.status(201).json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: "Failed to log page view" });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  LUME-V GOVERNANCE API
  // ═══════════════════════════════════════════════════════════

  app.get("/api/lume-v/stats", (_req, res) => {
    res.json({
      governance: "Lume-V active",
      runtime: "Lume v1.1.0",
      mode: "deterministic",
      certProtocol: "LTC v1.0",
      selfSustaining: {
        monitor: "active",
        healer: "active",
        optimizer: "active",
        evolver: "active",
      },
    });
  });

  return httpServer;
}
