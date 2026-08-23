import { pgTable, text, integer, boolean, serial, timestamp } from "drizzle-orm/pg-core";

// Helpers to keep the timestamp columns consistent across tables.
const createdAt = () =>
  timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow();

const updatedAt = () =>
  timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ===== USERS (from auth) =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  university: text("university"),
  campus: text("campus"),
  department: text("department"),
  // Stored as text to preserve fixed-precision values (e.g. "5.0").
  trustScore: text("trustScore").default("5.0"),
  role: text("role", { enum: ["user", "moderator", "admin"] }).default("user").notNull(),
  status: text("status", { enum: ["active", "suspended"] }).default("active").notNull(),
  moderationNote: text("moderationNote"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastSignInAt: timestamp("lastSignInAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== ITEMS (Rentals + Marketplace) =====
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  priceType: text("priceType", {
    enum: ["per_day", "per_week", "per_month", "fixed"],
  })
    .default("fixed")
    .notNull(),
  category: text("category", {
    enum: [
      "electronics", "books", "tools", "furniture",
      "sports", "fashion", "notes", "projects", "other",
    ],
  }).notNull(),
  type: text("type", { enum: ["rental", "sale"] }).default("rental").notNull(),
  image: text("image"),
  condition: text("condition", {
    enum: ["new", "like_new", "good", "fair", "poor"],
  }).default("good"),
  securityDeposit: text("securityDeposit").default("0.00"),
  tags: text("tags"),
  ownerId: integer("ownerId").notNull(),
  university: text("university"),
  campus: text("campus"),
  isAvailable: boolean("isAvailable").default(true),
  viewCount: integer("viewCount").default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

// ===== PROJECTS (Project Graveyard) =====
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("projectCategory", {
    enum: [
      "hardware", "software", "ai_ml", "web_dev",
      "mobile_app", "iot", "data_science", "other",
    ],
  }).notNull(),
  completion: integer("completion").default(50),
  price: text("price").notNull(),
  originalPrice: text("originalPrice"),
  techStack: text("techStack"),
  documentation: boolean("documentation").default(false),
  image: text("image"),
  sellerId: integer("sellerId").notNull(),
  university: text("university"),
  isSold: boolean("isSold").default(false),
  viewCount: integer("viewCount").default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ===== SUBSCRIPTIONS (Subscription Splitting) =====
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  serviceName: text("serviceName").notNull(),
  plan: text("plan").notNull(),
  totalCost: text("totalCost").notNull(),
  maxSlots: integer("maxSlots").notNull(),
  filledSlots: integer("filledSlots").default(0),
  costPerSlot: text("costPerSlot").notNull(),
  ownerId: integer("ownerId").notNull(),
  university: text("university"),
  isActive: boolean("isActive").default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ===== SUBSCRIPTION MEMBERS =====
export const subscriptionMembers = pgTable("subscriptionMembers", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscriptionId").notNull(),
  userId: integer("userId").notNull(),
  status: text("memberStatus", {
    enum: ["active", "pending", "left"],
  }).default("active"),
  joinedAt: timestamp("joinedAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type SubscriptionMember = typeof subscriptionMembers.$inferSelect;

// ===== TUTORS (Skill Sharing) =====
export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  subjects: text("subjects"),
  hourlyRate: text("hourlyRate").notNull(),
  rating: text("rating").default("5.0"),
  totalSessions: integer("totalSessions").default(0),
  availability: text("availability"),
  isAvailable: boolean("isAvailable").default(true),
  university: text("university"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = typeof tutors.$inferInsert;

// ===== MESSAGES =====
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId").notNull(),
  receiverId: integer("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: createdAt(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ===== DEALS (Escrow) =====
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyerId").notNull(),
  sellerId: integer("sellerId").notNull(),
  itemId: integer("itemId"),
  projectId: integer("projectId"),
  amount: text("amount").notNull(),
  status: text("dealStatus", {
    enum: ["pending", "in_escrow", "completed", "disputed", "cancelled"],
  })
    .default("pending")
    .notNull(),
  qrCode: text("qrCode"),
  meetupLocation: text("meetupLocation"),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

// ===== REVIEWS (Trust Scores) =====
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewerId").notNull(),
  revieweeId: integer("revieweeId").notNull(),
  dealId: integer("dealId"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: createdAt(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ===== MODERATION =====
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporterId").notNull(),
  targetType: text("targetType", { enum: ["user", "item", "project", "subscription", "tutor", "message", "deal"] }).notNull(),
  targetId: integer("targetId").notNull(),
  reason: text("reason").notNull(),
  status: text("reportStatus", { enum: ["open", "reviewing", "resolved", "dismissed"] }).default("open").notNull(),
  resolution: text("resolution"),
  reviewedBy: integer("reviewedBy"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  actorId: integer("actorId").notNull(),
  action: text("action").notNull(),
  targetType: text("targetType").notNull(),
  targetId: integer("targetId"),
  details: text("details"),
  createdAt: createdAt(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
