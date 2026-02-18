import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Non authentifié" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({ pool: pgPool, tableName: "sessions" }),
      secret: process.env.SESSION_SECRET || "paspa-tech-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  // ============================================
  // AUTH ROUTES
  // ============================================

  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const input = registerSchema.parse(req.body);

      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await storage.createUser({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
      });

      await storage.createUserProfile({
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "customer",
      });

      req.session.userId = user.id;

      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Register error:", err);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const input = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      req.session.userId = user.id;

      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  app.post("/api/auth/register-ambassador", async (req: any, res) => {
    try {
      const ambassadorSchema = registerSchema.extend({
        phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
        country: z.string().min(1, "Pays requis"),
        zone: z.enum(["zone1", "zone2"]),
        acceptedTerms: z.boolean().refine(v => v, "Vous devez accepter les conditions"),
        acceptedNoResale: z.boolean().refine(v => v, "Vous devez accepter la clause"),
      });

      const input = ambassadorSchema.parse(req.body);

      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await storage.createUser({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
      });

      await storage.createUserProfile({
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "ambassador",
        zone: input.zone,
        phoneNumber: input.phoneNumber,
        country: input.country,
        isApproved: false,
        acceptedTerms: input.acceptedTerms,
        acceptedNoResale: input.acceptedNoResale,
      });

      req.session.userId = user.id;

      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Ambassador register error:", err);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnecté" });
    });
  });

  // ============================================
  // PROFILE ROUTES
  // ============================================

  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.profile.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const existing = await storage.getUserProfile(userId);
      if (existing) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const input = api.profile.create.input.parse({ ...req.body, userId });
      const profile = await storage.createUserProfile(input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.profile.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const input = api.profile.update.input.parse(req.body);
    const updated = await storage.updateUserProfile(userId, input);
    res.json(updated);
  });

  // ============================================
  // PRODUCTS
  // ============================================

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // ============================================
  // ORDERS
  // ============================================

  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      
      let zone = "zone1"; 
      if (input.ambassadorId) {
        const ambassadorProfile = await storage.getUserProfile(input.ambassadorId);
        if (ambassadorProfile?.zone) {
          zone = ambassadorProfile.zone;
        }
      }

      const salesInZone = await storage.getZoneSales(zone);
      if (salesInZone >= 50000) {
        return res.status(400).json({ message: "Zone quota exceeded" });
      }

      const order = await storage.createOrder({
        userId: req.session?.userId || null,
        productId: input.productId,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        ambassadorId: input.ambassadorId,
        zone: zone,
        status: "completed"
      });

      if (input.ambassadorId) {
        const commissionAmount = input.amount * 0.70;
        await storage.createCommission({
          ambassadorId: input.ambassadorId,
          orderId: order.id,
          amount: commissionAmount.toString(),
          status: "pending"
        });
      }

      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // ============================================
  // ADMIN ROUTES
  // ============================================

  app.get(api.admin.dashboard.path, isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    
    if (profile?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const zone1Sales = await storage.getZoneSales("zone1");
    const zone2Sales = await storage.getZoneSales("zone2");
    const totalSales = zone1Sales + zone2Sales;
    const unpaidCommissions = await storage.getUnpaidCommissions();
    const ambassadors = await storage.getAllAmbassadors();

    res.json({
      totalSales,
      zone1Sales,
      zone2Sales,
      commissionsPending: unpaidCommissions.length,
      ambassadorsCount: ambassadors.length
    });
  });

  app.get(api.admin.ambassadors.path, isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    
    if (profile?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const ambassadors = await storage.getAllAmbassadors();
    res.json(ambassadors);
  });

  app.post("/api/admin/ambassadors/:id/approve", isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    
    if (profile?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const ambassadorId = Number(req.params.id);
    await db.update(schema.userProfiles)
      .set({ isApproved: true })
      .where(schema.userProfiles.id === ambassadorId ? undefined as any : undefined as any);
    
    res.json({ success: true });
  });

  // ============================================
  // AMBASSADOR STATS
  // ============================================

  app.get(api.ambassador.stats.path, isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    
    if (profile?.role !== "ambassador") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const commissions = await storage.getCommissionsByAmbassador(userId);
    const totalCommission = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const zoneQuota = await storage.getZoneSales(profile.zone || "zone1");

    res.json({
      totalSales: commissions.length,
      commissionEarned: totalCommission,
      zoneQuota: 50000 - zoneQuota
    });
  });

  // ============================================
  // SEED DATA
  // ============================================
  
  setTimeout(async () => {
    const products = await storage.getProducts();
    if (products.length === 0) {
      const seedProducts = [
        { name: "Guide Culture Oignon", description: "Tout savoir sur la culture de l'oignon en Afrique. Techniques de semis, irrigation, récolte et conservation.", price: "500", fileUrl: "/pdfs/oignon.pdf", coverImageUrl: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400" },
        { name: "Guide Culture Tomate", description: "Techniques modernes pour la culture de la tomate. Du semis à la commercialisation.", price: "500", fileUrl: "/pdfs/tomate.pdf", coverImageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
        { name: "Guide Culture Piment", description: "Produire le meilleur piment. Variétés adaptées à l'Afrique et techniques de production.", price: "500", fileUrl: "/pdfs/piment.pdf", coverImageUrl: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400" },
        { name: "Guide Culture Manioc", description: "Maîtriser la culture du manioc. Plantation, entretien et transformation.", price: "500", fileUrl: "/pdfs/manioc.pdf", coverImageUrl: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=400" },
        { name: "Guide Culture Gingembre", description: "Cultiver le gingembre en Afrique. Guide complet du semis à la récolte.", price: "500", fileUrl: "/pdfs/gingembre.pdf", coverImageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400" },
      ];
      
      for (const p of seedProducts) {
        await db.insert(schema.products).values(p);
      }
      console.log("Seeded products");
    }
  }, 3000);

  return httpServer;
}
