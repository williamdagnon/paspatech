import { db } from "./db";
import { 
  userProfiles, products, orders, commissions, 
  type UserProfile, type InsertUserProfile, 
  type Product, type Order, type Commission 
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, sql, and, desc, gte, count } from "drizzle-orm";

export interface IStorage {
  getUserById(id: string): Promise<typeof users.$inferSelect | undefined>;
  getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(data: typeof users.$inferInsert): Promise<typeof users.$inferSelect>;

  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  getAllAmbassadors(): Promise<(UserProfile & { email: string | null })[]>;
  getAllUserProfiles(): Promise<(UserProfile & { email: string | null })[]>;
  getUserProfileById(id: number): Promise<UserProfile | undefined>;
  getTotalUsersCount(): Promise<number>;

  getProducts(): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: any): Promise<Product>;
  updateProduct(id: number, data: any): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  createOrder(order: any): Promise<Order>;
  getOrdersByUser(userId: string): Promise<(Order & { productName: string })[]>;
  getAllOrders(): Promise<Order[]>;
  getZoneSales(zone: string): Promise<number>;
  getTodayOrdersCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;

  getCommissionsByAmbassador(ambassadorId: string): Promise<Commission[]>;
  createCommission(commission: any): Promise<Commission>;
  getUnpaidCommissions(): Promise<Commission[]>;
  getAllCommissions(): Promise<Commission[]>;

  getReferralsByAmbassador(ambassadorId: string): Promise<Order[]>;
  getReferralCountByAmbassador(ambassadorId: string): Promise<number>;
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

  async getUserProfileById(id: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
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

  async getAllUserProfiles(): Promise<(UserProfile & { email: string | null })[]> {
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
    .orderBy(desc(userProfiles.createdAt));
    
    return result;
  }

  async getTotalUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
    return Number(result[0]?.count || 0);
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: any): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: any): Promise<Product> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async createOrder(orderData: any): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrdersByUser(userId: string): Promise<(Order & { productName: string })[]> {
    const result = await db.select({
      id: orders.id,
      userId: orders.userId,
      guestEmail: orders.guestEmail,
      guestPhone: orders.guestPhone,
      productId: orders.productId,
      amount: orders.amount,
      currency: orders.currency,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      transactionId: orders.transactionId,
      ambassadorId: orders.ambassadorId,
      zone: orders.zone,
      createdAt: orders.createdAt,
      productName: products.name,
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
    
    return result.map(r => ({ ...r, productName: r.productName || "Produit inconnu" }));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getZoneSales(zone: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.zone, zone), eq(orders.status, "completed")));
    return Number(result[0]?.count || 0);
  }

  async getTodayOrdersCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    return Number(result[0]?.count || 0);
  }

  async getTotalRevenue(): Promise<number> {
    const result = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS numeric)), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    return Number(result[0]?.total || 0);
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

  async getAllCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions).orderBy(desc(commissions.createdAt));
  }

  async getReferralsByAmbassador(ambassadorId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.ambassadorId, ambassadorId))
      .orderBy(desc(orders.createdAt));
  }

  async getReferralCountByAmbassador(ambassadorId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(DISTINCT user_id)` })
      .from(orders)
      .where(eq(orders.ambassadorId, ambassadorId));
    return Number(result[0]?.count || 0);
  }
}

export const storage = new DatabaseStorage();
