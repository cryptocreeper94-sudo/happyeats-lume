// ═══════════════════════════════════════════════════════════
//  HAPPYEATS-LUME — Full Database Schema
//
//  Complete 1:1 port of the original HappyEats schema.
//  30+ tables: tenants, vendors, orders, zones, customers,
//  chat, marketing, affiliates, SSO, hallmarks, etc.
//
//  By DarkWave Studios LLC
// ═══════════════════════════════════════════════════════════

import { pgTable, text, serial, integer, timestamp, boolean, decimal, jsonb, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ============ TENANTS (Multi-Tenant Architecture) ============

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email"),
  ownerPhone: text("owner_phone"),
  pin: text("pin").notNull(),
  passwordHash: text("password_hash"),
  passwordChangedAt: timestamp("password_changed_at"),
  region: text("region"),
  isActive: boolean("is_active").default(true),
  stripeAccountId: text("stripe_account_id"),
  settings: jsonb("settings"),
  plannedZonesForTomorrow: jsonb("planned_zones_for_tomorrow").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });

// ============ SYSTEM SETTINGS ============

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ EXPENSES ============

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  category: text("category").notNull(),
  merchant: text("merchant"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  isTaxDeductible: boolean("is_tax_deductible").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });

// ============ MILEAGE TRIPS ============

export const mileageTrips = pgTable("mileage_trips", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  startLocation: text("start_location"),
  endLocation: text("end_location"),
  startLat: decimal("start_lat", { precision: 10, scale: 7 }),
  startLng: decimal("start_lng", { precision: 10, scale: 7 }),
  endLat: decimal("end_lat", { precision: 10, scale: 7 }),
  endLng: decimal("end_lng", { precision: 10, scale: 7 }),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  purpose: text("purpose"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMileageTripSchema = createInsertSchema(mileageTrips).omit({ id: true, createdAt: true });

// ============ DRIVERS ============

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  driverNumber: text("driver_number"),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: text("status").default("active"),
  role: text("role").default("driver"),
  isActiveToday: boolean("is_active_today").default(false),
  linkedUserId: integer("linked_user_id"),
  currentLocation: text("current_location").notNull(),
  currentLat: decimal("current_lat", { precision: 10, scale: 7 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 7 }),
  breakEndTime: timestamp("break_end_time"),
  photoUrl: text("photo_url"),
  totalDeliveries: integer("total_deliveries").default(0),
  totalTipsEarned: decimal("total_tips_earned", { precision: 10, scale: 2 }).default("0"),
  avgDeliveryMinutes: decimal("avg_delivery_minutes", { precision: 6, scale: 1 }),
  lastActiveAt: timestamp("last_active_at"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, createdAt: true });

// ============ FAVORITES ============

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  name: text("name").notNull(),
  itemName: text("item_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// ============ LOCATIONS ============

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  isOpen: boolean("is_open").default(true),
  imageUrl: text("image_url"),
  tags: jsonb("tags"),
  deliveryFee: decimal("delivery_fee", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });

// ============ DELIVERY ZONES ============

export const deliveryZones = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  bounds: jsonb("bounds"),
  exits: jsonb("exits"),
  cutoffTime: text("cutoff_time").default("11:00"),
  dinnerCutoffTime: text("dinner_cutoff_time"),
  lunchDeliveryTime: text("lunch_delivery_time").default("12:00"),
  dinnerDeliveryTime: text("dinner_delivery_time").default("18:00"),
  batchWindows: jsonb("batch_windows"),
  deliveryMode: text("delivery_mode").default("batch"),
  operatingHoursStart: text("operating_hours_start").default("08:00"),
  operatingHoursEnd: text("operating_hours_end").default("20:00"),
  color: text("color").default("#22c55e"),
  isActive: boolean("is_active").default(false),
  tenantId: integer("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliveryZoneSchema = createInsertSchema(deliveryZones).omit({ id: true, createdAt: true });

// ============ FOOD TRUCKS (Vendors) ============

export const foodTrucks = pgTable("food_trucks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  businessType: text("business_type").default("food-truck"),
  description: text("description"),
  cuisine: text("cuisine"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  website: text("website"),
  imageUrl: text("image_url"),
  logoUrl: text("logo_url"),
  healthInspectionScore: decimal("health_inspection_score", { precision: 5, scale: 1 }),
  healthInspectionGrade: text("health_inspection_grade"),
  healthInspectionCertUrl: text("health_inspection_cert_url"),
  healthInspectionDate: text("health_inspection_date"),
  isApproved: boolean("is_approved").default(false),
  isActive: boolean("is_active").default(true),
  locationType: text("location_type").default("mobile"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  zoneIds: jsonb("zone_ids").default([]),
  menu: jsonb("menu").default([]),
  tenantId: integer("tenant_id").references(() => tenants.id),
  pin: text("pin"),
  tosAcceptedAt: timestamp("tos_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  vendorAgreementAcceptedAt: timestamp("vendor_agreement_accepted_at"),
  agreementVersion: text("agreement_version").default("1.0"),
  agreementIp: text("agreement_ip"),
  agreementUserAgent: text("agreement_user_agent"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectOnboardingComplete: boolean("stripe_connect_onboarding_complete").default(false),
  stripeConnectPayoutsEnabled: boolean("stripe_connect_payouts_enabled").default(false),
  operatingHoursStart: text("operating_hours_start"),
  operatingHoursEnd: text("operating_hours_end"),
  trustLayerId: text("trust_layer_id"),
  isTestVendor: boolean("is_test_vendor").default(false),
  pageContent: jsonb("page_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFoodTruckSchema = createInsertSchema(foodTrucks).omit({ id: true, createdAt: true });

// ============ TRUCK AVAILABILITY ============

export const truckAvailability = pgTable("truck_availability", {
  id: serial("id").primaryKey(),
  foodTruckId: integer("food_truck_id").notNull().references(() => foodTrucks.id),
  date: text("date").notNull(),
  zoneId: integer("zone_id").references(() => deliveryZones.id),
  status: text("status").notNull().default("pending"),
  locationAddress: text("location_address"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  notes: text("notes"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTruckAvailabilitySchema = createInsertSchema(truckAvailability).omit({ id: true, createdAt: true });

// ============ ORDERS ============

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  driverId: integer("driver_id").references(() => drivers.id),
  locationId: integer("location_id").references(() => locations.id),
  foodTruckId: integer("food_truck_id").references(() => foodTrucks.id),
  zoneId: integer("zone_id").references(() => deliveryZones.id),
  locationName: text("location_name").notNull(),
  items: jsonb("items"),
  orderDescription: text("order_description"),
  vendorStatus: text("vendor_status").default("pending"),
  vendorPrepTime: integer("vendor_prep_time"),
  vendorStatusUpdatedAt: timestamp("vendor_status_updated_at"),
  batchId: text("batch_id"),
  isSandbox: boolean("is_sandbox").default(false),
  menuTotal: decimal("menu_total", { precision: 8, scale: 2 }),
  serviceFee: decimal("service_fee", { precision: 8, scale: 2 }),
  tax: decimal("tax", { precision: 8, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 8, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 5, scale: 2 }).notNull(),
  total: decimal("total", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  deliveryInstructions: text("delivery_instructions"),
  runnerName: text("runner_name"),
  runnerPhone: text("runner_phone"),
  estimatedDelivery: timestamp("estimated_delivery"),
  orderType: text("order_type").default("batch"),
  fulfillmentType: text("fulfillment_type").default("delivery"),
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  receiptHtml: text("receipt_html"),
  customerId: integer("customer_id"),
  tipAmount: decimal("tip_amount", { precision: 8, scale: 2 }).default("0"),
  promoCodeId: integer("promo_code_id"),
  promoDiscount: decimal("promo_discount", { precision: 8, scale: 2 }).default("0"),
  scheduledDeliveryTime: timestamp("scheduled_delivery_time"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });

// ============ USERS (Auth) ============

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });

// ============ AI CHAT CONVERSATIONS ============

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// ============ TRUCKER TALK — CHAT GROUPS ============

export const chatGroups = pgTable("chat_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("public"),
  creatorId: integer("creator_id"),
  tenantId: integer("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatGroupSchema = createInsertSchema(chatGroups).omit({ id: true, createdAt: true });

export const chatGroupMembers = pgTable("chat_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => chatGroups.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertChatGroupMemberSchema = createInsertSchema(chatGroupMembers).omit({ id: true, joinedAt: true });

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => chatGroups.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  topic: text("topic").default("general"),
  location: text("location"),
  isDispatcherMessage: boolean("is_dispatcher_message").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// ============ PARTNER AGREEMENTS ============

export const partnerAgreements = pgTable("partner_agreements", {
  id: serial("id").primaryKey(),
  partnerSlug: text("partner_slug").notNull().unique(),
  partnerName: text("partner_name").notNull(),
  businessName: text("business_name").notNull(),
  membershipNumber: text("membership_number").notNull().unique(),
  region: text("region").notNull(),
  deliveryShare: integer("delivery_share").notNull().default(100),
  subscriptionShare: integer("subscription_share").notNull().default(25),
  blockchainHash: text("blockchain_hash"),
  acknowledgedAt: timestamp("acknowledged_at"),
  agreementVersion: text("agreement_version").default("1.0"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  growthLevel: text("growth_level").default("territory_partner"),
  notes: text("notes"),
  username: text("username"),
  passwordHash: text("password_hash"),
  credentialsSetAt: timestamp("credentials_set_at"),
  w9LegalName: text("w9_legal_name"),
  w9BusinessName: text("w9_business_name"),
  w9BusinessType: text("w9_business_type"),
  w9Ein: text("w9_ein"),
  w9Address: text("w9_address"),
  w9City: text("w9_city"),
  w9State: text("w9_state"),
  w9Zip: text("w9_zip"),
  w9SignedAt: timestamp("w9_signed_at"),
  w9SignatureData: text("w9_signature_data"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPartnerAgreementSchema = createInsertSchema(partnerAgreements).omit({ id: true, createdAt: true, updatedAt: true });

// ============ PARTNER DOCUMENTS ============

export const partnerDocuments = pgTable("partner_documents", {
  id: serial("id").primaryKey(),
  partnerSlug: text("partner_slug").notNull(),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: text("uploaded_by"),
  notes: text("notes"),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
});

export const insertPartnerDocumentSchema = createInsertSchema(partnerDocuments).omit({ id: true, uploadedAt: true, verified: true, verifiedAt: true, verifiedBy: true });

// ============ RESTAURANT REQUESTS ============

export const restaurantRequests = pgTable("restaurant_requests", {
  id: serial("id").primaryKey(),
  restaurantName: text("restaurant_name").notNull(),
  location: text("location"),
  cuisineType: text("cuisine_type"),
  requesterName: text("requester_name"),
  requesterEmail: text("requester_email"),
  requesterPhone: text("requester_phone"),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRestaurantRequestSchema = createInsertSchema(restaurantRequests).omit({ id: true, createdAt: true, status: true });

// ============ REVIEWS ============

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => locations.id),
  reviewType: text("review_type").notNull(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  reviewerName: text("reviewer_name"),
  reviewerEmail: text("reviewer_email"),
  isVerifiedOrder: boolean("is_verified_order").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, isVerifiedOrder: true });

// ============ MARKETING HUB ============

export const marketingPosts = pgTable("marketing_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  content: text("content").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  hashtags: text("hashtags").array(),
  imageFilename: varchar("image_filename", { length: 255 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingPostSchema = createInsertSchema(marketingPosts).omit({ id: true, createdAt: true });

export const marketingImages = pgTable("marketing_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingImageSchema = createInsertSchema(marketingImages).omit({ id: true, createdAt: true });

// ============ SOCIAL MEDIA INTEGRATIONS ============

export const metaIntegrations = pgTable("meta_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().unique(),
  platforms: text("platforms"),
  adAccountId: varchar("ad_account_id", { length: 100 }),
  facebookPageId: varchar("facebook_page_id", { length: 100 }),
  facebookPageName: varchar("facebook_page_name", { length: 255 }),
  facebookPageAccessToken: text("facebook_page_access_token"),
  facebookConnected: boolean("facebook_connected").default(false),
  instagramAccountId: varchar("instagram_account_id", { length: 100 }),
  instagramUsername: varchar("instagram_username", { length: 100 }),
  instagramConnected: boolean("instagram_connected").default(false),
  twitterApiKey: varchar("twitter_api_key", { length: 255 }),
  twitterApiSecret: varchar("twitter_api_secret", { length: 255 }),
  twitterAccessToken: varchar("twitter_access_token", { length: 255 }),
  twitterAccessTokenSecret: varchar("twitter_access_token_secret", { length: 255 }),
  twitterUsername: varchar("twitter_username", { length: 100 }),
  twitterConnected: boolean("twitter_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMetaIntegrationSchema = createInsertSchema(metaIntegrations).omit({ id: true, createdAt: true, updatedAt: true });

// ============ SCHEDULED POSTS ============

export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  scheduledFor: timestamp("scheduled_for").notNull(),
  postedAt: timestamp("posted_at"),
  externalPostId: varchar("external_post_id", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({ id: true, createdAt: true });

// ============ BLOG POSTS ============

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array().default(sql`'{}'::text[]`),
  featuredImageUrl: text("featured_image_url"),
  status: text("status").notNull().default("draft"),
  authorType: text("author_type").notNull().default("ai"),
  authorName: text("author_name").default("Happy Eats"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });

// ============ APP USERS (Admin/Staff) ============

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("admin"),
  needsPasswordSetup: boolean("needs_password_setup").default(true),
  tenantId: integer("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppUserSchema = createInsertSchema(appUsers).omit({ id: true, createdAt: true });

// ============ CDL PROGRAMS ============

export const cdlPrograms = pgTable("cdl_programs", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  programType: text("program_type").notNull(),
  category: text("category").default("trucking"),
  companyType: text("company_type").default("mega_carrier"),
  description: text("description"),
  shortDescription: text("short_description"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  payRange: text("pay_range"),
  averageCpm: text("average_cpm"),
  trainingLength: text("training_length"),
  tuitionCost: text("tuition_cost"),
  tuitionReimbursement: boolean("tuition_reimbursement").default(false),
  signOnBonus: text("sign_on_bonus"),
  referralBonus: text("referral_bonus"),
  location: text("location"),
  headquarters: text("headquarters"),
  state: text("state"),
  operatingStates: text("operating_states"),
  isNationwide: boolean("is_nationwide").default(false),
  website: text("website"),
  applyUrl: text("apply_url"),
  phone: text("phone"),
  logoUrl: text("logo_url"),
  freightTypes: text("freight_types"),
  cdlClassRequired: text("cdl_class_required").default("Class A"),
  experienceRequired: text("experience_required").default("none"),
  homeTime: text("home_time"),
  soloTeam: text("solo_team").default("both"),
  hazmatRequired: boolean("hazmat_required").default(false),
  endorsementsRequired: text("endorsements_required"),
  fleetSize: text("fleet_size"),
  yearFounded: text("year_founded"),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  safetyRating: text("safety_rating"),
  equipmentType: text("equipment_type"),
  fuelCardProvided: boolean("fuel_card_provided").default(false),
  healthInsurance: boolean("health_insurance").default(false),
  retirementPlan: boolean("retirement_plan").default(false),
  paidTimeOff: boolean("paid_time_off").default(false),
  petPolicy: boolean("pet_policy").default(false),
  riderPolicy: boolean("rider_policy").default(false),
  tags: text("tags"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  isHiring: boolean("is_hiring").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCdlProgramSchema = createInsertSchema(cdlPrograms).omit({ id: true, createdAt: true, updatedAt: true });

export const cdlReferrals = pgTable("cdl_referrals", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => cdlPrograms.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  cdlClassInterest: text("cdl_class_interest"),
  experience: text("experience"),
  message: text("message"),
  status: text("status").default("submitted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCdlReferralSchema = createInsertSchema(cdlReferrals).omit({ id: true, createdAt: true, status: true });

export const franchiseInquiries = pgTable("franchise_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  message: text("message"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFranchiseInquirySchema = createInsertSchema(franchiseInquiries).omit({ id: true, createdAt: true, status: true });

// ============ SIGNAL CHAT & TRUST LAYER SSO ============

export const signalChatUsers = pgTable("signal_chat_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#06b6d4"),
  role: text("role").notNull().default("member"),
  trustLayerId: text("trust_layer_id").unique(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSignalChatUserSchema = createInsertSchema(signalChatUsers).omit({ id: true, isOnline: true, lastSeen: true, createdAt: true });

export const signalChatChannels = pgTable("signal_chat_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("ecosystem"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSignalChatChannelSchema = createInsertSchema(signalChatChannels).omit({ id: true, createdAt: true });

export const signalChatMessages = pgTable("signal_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => signalChatChannels.id),
  userId: varchar("user_id").notNull().references(() => signalChatUsers.id),
  content: text("content").notNull(),
  replyToId: varchar("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSignalChatMessageSchema = createInsertSchema(signalChatMessages).omit({ id: true, createdAt: true });

export const ecosystemApps = pgTable("ecosystem_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appName: varchar("app_name").notNull().unique(),
  appDisplayName: varchar("app_display_name").notNull(),
  appDescription: varchar("app_description"),
  appUrl: varchar("app_url").notNull(),
  callbackUrl: varchar("callback_url").notNull(),
  apiKey: varchar("api_key").notNull().unique(),
  apiSecret: varchar("api_secret").notNull(),
  logoUrl: varchar("logo_url"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ssoSessions = pgTable("sso_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  ssoToken: varchar("sso_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAppConnections = pgTable("user_app_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  connectedAt: timestamp("connected_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  revokedAt: timestamp("revoked_at"),
});

// ============ PAGE VIEWS (Analytics) ============

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id"),
  page: text("page").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  sessionId: text("session_id"),
  deviceType: text("device_type"),
  browser: text("browser"),
  country: text("country"),
  city: text("city"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, createdAt: true });

// ============ KITCHEN ITEMS ============

export const kitchenItems = pgTable("kitchen_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  category: text("category").notNull(),
  section: text("section").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  sortOrder: integer("sort_order").default(0),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKitchenItemSchema = createInsertSchema(kitchenItems).omit({ id: true, createdAt: true });

// ============ AFFILIATES ============

export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  trustLayerId: text("trust_layer_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  source: text("source").default("dwtl"),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  totalReferrals: integer("total_referrals").default(0),
  totalEarnings: integer("total_earnings").default(0),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({ id: true, createdAt: true, totalReferrals: true, totalEarnings: true, verifiedAt: true });

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  referredType: text("referred_type").notNull(),
  referredName: text("referred_name"),
  referredEmail: text("referred_email"),
  referredEntityId: integer("referred_entity_id"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true, status: true });

export const rewardsLedger = pgTable("rewards_ledger", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  referralId: integer("referral_id").references(() => referrals.id),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRewardSchema = createInsertSchema(rewardsLedger).omit({ id: true, createdAt: true, status: true });

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  perkType: text("perk_type").notNull(),
  perkValue: text("perk_value").notNull(),
  perkDescription: text("perk_description").notNull(),
  maxUses: integer("max_uses"),
  timesUsed: integer("times_used").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({ id: true, createdAt: true, timesUsed: true });

// ============ CUSTOMERS ============

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"),
  accountType: text("account_type").notNull().default("individual"),
  businessName: text("business_name"),
  uniqueHash: text("unique_hash").unique(),
  deliveryAddress: text("delivery_address"),
  deliveryInstructions: text("delivery_instructions"),
  referralCode: text("referral_code").unique(),
  referredByCustomerId: integer("referred_by_customer_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  adFreeSubscription: boolean("ad_free_subscription").default(false),
  adFreeExpiresAt: timestamp("ad_free_expires_at"),
  mediaStudioSubscription: boolean("media_studio_subscription").default(false),
  mediaStudioSubscriptionId: text("media_studio_subscription_id"),
  mediaStudioExpiresAt: timestamp("media_studio_expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, isActive: true });

// ============ CUSTOMER REFERRALS ============

export const customerReferrals = pgTable("customer_referrals", {
  id: serial("id").primaryKey(),
  referrerCustomerId: integer("referrer_customer_id").notNull().references(() => customers.id),
  referredCustomerId: integer("referred_customer_id").notNull().references(() => customers.id),
  referredOrderId: integer("referred_order_id").references(() => orders.id),
  referrerCreditAmount: decimal("referrer_credit_amount", { precision: 8, scale: 2 }).notNull().default("5.00"),
  referredCreditAmount: decimal("referred_credit_amount", { precision: 8, scale: 2 }).notNull().default("5.00"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerReferralSchema = createInsertSchema(customerReferrals).omit({ id: true, createdAt: true, status: true });

// ============ PUSH SUBSCRIPTIONS ============

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true });

// ============ PROMO CODES ============

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: decimal("discount_value", { precision: 8, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 8, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 8, scale: 2 }),
  maxUses: integer("max_uses"),
  timesUsed: integer("times_used").default(0),
  isActive: boolean("is_active").default(true),
  isFirstOrderOnly: boolean("is_first_order_only").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, timesUsed: true });

// ============ ORDER REVIEWS ============

export const orderReviews = pgTable("order_reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  customerId: integer("customer_id").references(() => customers.id),
  foodTruckId: integer("food_truck_id").references(() => foodTrucks.id),
  vendorRating: integer("vendor_rating").notNull(),
  driverRating: integer("driver_rating"),
  platformRating: integer("platform_rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderReviewSchema = createInsertSchema(orderReviews).omit({ id: true, createdAt: true });

// ============ CUSTOMER REWARDS ============

export const customerRewards = pgTable("customer_rewards", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id).unique(),
  orderCount: integer("order_count").notNull().default(0),
  orderCountSinceLastReward: integer("order_count_since_last_reward").notNull().default(0),
  runningTotal: decimal("running_total", { precision: 10, scale: 2 }).notNull().default("0"),
  avgOrderValue: decimal("avg_order_value", { precision: 8, scale: 2 }).notNull().default("0"),
  rewardBalance: decimal("reward_balance", { precision: 8, scale: 2 }).notNull().default("0"),
  totalRewardsEarned: integer("total_rewards_earned").notNull().default(0),
  lastEarnedAt: timestamp("last_earned_at"),
  lastRedeemedAt: timestamp("last_redeemed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerRewardSchema = createInsertSchema(customerRewards).omit({ id: true, updatedAt: true });

// ============ FUEL STATIONS ============

export const fuelStations = pgTable("fuel_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  stationType: text("station_type").notNull().default("gas"),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  hasDiesel: boolean("has_diesel").default(false),
  hasTruckParking: boolean("has_truck_parking").default(false),
  hasShowers: boolean("has_showers").default(false),
  hasRestaurant: boolean("has_restaurant").default(false),
  hasScales: boolean("has_scales").default(false),
  amenities: jsonb("amenities").default([]),
  regularPrice: decimal("regular_price", { precision: 5, scale: 3 }),
  dieselPrice: decimal("diesel_price", { precision: 5, scale: 3 }),
  priceUpdatedAt: timestamp("price_updated_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFuelStationSchema = createInsertSchema(fuelStations).omit({ id: true, createdAt: true });

// ============ VAULT CATALOG ============

export const vaultItems = pgTable("vault_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id"),
  vendorId: integer("vendor_id"),
  ownerType: text("owner_type").notNull().default("platform"),
  category: text("category").notNull().default("flyer"),
  title: text("title").notNull(),
  description: text("description"),
  language: text("language").default("en"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  fileUrl: text("file_url"),
  fileType: text("file_type").default("image/png"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").default(false),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVaultItemSchema = createInsertSchema(vaultItems).omit({ id: true, createdAt: true, updatedAt: true });

// ============ HALLMARKS & TRUST STAMPS ============

export const hallmarks = pgTable("hallmarks", {
  id: serial("id").primaryKey(),
  thId: text("th_id").notNull().unique(),
  userId: text("user_id"),
  appId: text("app_id"),
  appName: text("app_name"),
  productName: text("product_name"),
  releaseType: text("release_type"),
  metadata: jsonb("metadata"),
  dataHash: text("data_hash").notNull(),
  txHash: text("tx_hash"),
  blockHeight: text("block_height"),
  qrCodeSvg: text("qr_code_svg"),
  verificationUrl: text("verification_url"),
  hallmarkId: integer("hallmark_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHallmarkSchema = createInsertSchema(hallmarks).omit({ id: true, createdAt: true });

export const trustStamps = pgTable("trust_stamps", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  category: text("category").notNull(),
  data: jsonb("data"),
  dataHash: text("data_hash").notNull(),
  txHash: text("tx_hash"),
  blockHeight: text("block_height"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrustStampSchema = createInsertSchema(trustStamps).omit({ id: true, createdAt: true });

export const hallmarkCounters = pgTable("hallmark_counters", {
  id: text("id").primaryKey(),
  currentSequence: text("current_sequence").notNull().default("0"),
});

// ============ AFFILIATE REFERRALS & COMMISSIONS ============

export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id"),
  referralHash: text("referral_hash").notNull(),
  platform: text("platform").notNull().default("happyeats"),
  status: text("status").notNull().default("pending"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals).omit({ id: true, createdAt: true, status: true, convertedAt: true });

export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referralId: integer("referral_id"),
  amount: text("amount").notNull(),
  currency: text("currency").default("SIG"),
  tier: text("tier").default("base"),
  status: text("status").default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions).omit({ id: true, createdAt: true, status: true, paidAt: true });

// ============ CUSTOMER PASSWORD RESET TOKENS ============

export const customerPasswordResetTokens = pgTable("customer_password_reset_tokens", {
  id: serial("id").primaryKey(),
  phone: text("phone"),
  email: text("email"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerPasswordResetTokenSchema = createInsertSchema(customerPasswordResetTokens).omit({ id: true, createdAt: true });

// ============ ZONE DAILY SCHEDULES ============

export const zoneDailySchedules = pgTable("zone_daily_schedules", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  zoneIds: jsonb("zone_ids").notNull(),
  publishedBy: text("published_by"),
  notifiedVendors: boolean("notified_vendors").default(false),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertZoneDailyScheduleSchema = createInsertSchema(zoneDailySchedules).omit({ id: true, createdAt: true, updatedAt: true });
