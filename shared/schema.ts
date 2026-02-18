import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Export auth models so they are included in migrations
export * from "./models/auth";
import { users } from "./models/auth";

// Extend the users table with application-specific fields via a separate table or just assume these fields exist if we could modify auth.ts (but we shouldn't modify auth.ts too much). 
// However, since we can't easily ALTER the blueprint table without migration issues in this environment, 
// we will create a `user_profiles` table linked to the auth `users` table.

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role", { enum: ["admin", "ambassador", "customer"] }).default("customer").notNull(),
  zone: text("zone", { enum: ["zone1", "zone2"] }),
  phoneNumber: text("phone_number"),
  isApproved: boolean("is_approved").default(false),
  country: text("country"),
  acceptedTerms: boolean("accepted_terms").default(false),
  acceptedNoResale: boolean("accepted_no_resale").default(false),
  quotaUsed: integer("quota_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // oignon, piment vert, etc.
  description: text("description").notNull(),
  price: numeric("price").notNull(), // 500 FCFA
  fileUrl: text("file_url").notNull(), // Path to PDF
  coverImageUrl: text("cover_image_url"),
  isActive: boolean("is_active").default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id), // Can be null for guest checkout if we allowed it, but req says "compte obligatoire" for ambassadors. Let's assume customers might be guests or signed up. 
  // User prompt says: "Les utilisateurs non ambassadeurs peuvent acheter sans créer de compte ambassadeur" - implies they might need a customer account or guest. 
  // We'll link to user if logged in, or store email if guest.
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  productId: integer("product_id").notNull().references(() => products.id),
  amount: numeric("amount").notNull(),
  currency: text("currency").default("XOF"),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending"),
  paymentMethod: text("payment_method"), // flutterwave, paystack, etc.
  transactionId: text("transaction_id"),
  ambassadorId: text("ambassador_id").references(() => users.id), // Who referred this sale
  zone: text("zone"), // zone1 or zone2
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  ambassadorId: text("ambassador_id").notNull().references(() => users.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  amount: numeric("amount").notNull(), // 70% of sale
  status: text("status", { enum: ["pending", "paid"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  ambassador: one(users, {
    fields: [orders.ambassadorId],
    references: [users.id],
    relationName: "ambassador_sales"
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  ambassador: one(users, {
    fields: [commissions.ambassadorId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [commissions.orderId],
    references: [orders.id],
  }),
}));

// Zod Schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, createdAt: true });

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Commission = typeof commissions.$inferSelect;

// Application specific types
export type AmbassadorStats = {
  totalSales: number;
  totalCommission: number;
  quotaUsed: number;
};
