import { db } from "./db";
import { 
  userProfiles, products, orders, commissions, 
  type UserProfile, type InsertUserProfile, 
  type Product, type Order, type Commission 
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<typeof users.$inferSelect | undefined>;
  getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(data: typeof users.$inferInsert): Promise<typeof users.$inferSelect>;

  // User Profile
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  getAllAmbassadors(): Promise<(UserProfile & { email: string | null })[]>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Orders
  createOrder(order: any): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getZoneSales(zone: string): Promise<number>;
  
  // Commissions
  getCommissionsByAmbassador(ambassadorId: string): Promise<Commission[]>;
  createCommission(commission: any): Promise<Commission>;
  getUnpaidCommissions(): Promise<Commission[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: typeof users.$inferInsert) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updated] = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getAllAmbassadors(): Promise<(UserProfile & { email: string | null })[]> {
    const result = await db.select({
      id: userProfiles.id,
      userId: userProfiles.userId,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      role: userProfiles.role,
      zone: userProfiles.zone,
      phoneNumber: userProfiles.phoneNumber,
      isApproved: userProfiles.isApproved,
      country: userProfiles.country,
      acceptedTerms: userProfiles.acceptedTerms,
      acceptedNoResale: userProfiles.acceptedNoResale,
      quotaUsed: userProfiles.quotaUsed,
      createdAt: userProfiles.createdAt,
      email: users.email
    })
    .from(userProfiles)
    .leftJoin(users, eq(userProfiles.userId, users.id))
    .where(eq(userProfiles.role, "ambassador"));
    
    return result;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createOrder(orderData: any): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getZoneSales(zone: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.zone, zone), eq(orders.status, "completed")));
    return Number(result[0]?.count || 0);
  }

  async getCommissionsByAmbassador(ambassadorId: string): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.ambassadorId, ambassadorId));
  }

  async createCommission(commissionData: any): Promise<Commission> {
    const [commission] = await db.insert(commissions).values(commissionData).returning();
    return commission;
  }

  async getUnpaidCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.status, "pending"));
  }
}

export const storage = new DatabaseStorage();
