import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { db } from "./db";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `cover_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});
import { eq } from "drizzle-orm";

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

async function isAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ message: "Non authentifié" });
  const profile = await storage.getUserProfile(req.session.userId);
  if (profile?.role !== "admin") return res.status(403).json({ message: "Accès interdit" });
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({ pool: pgPool, tableName: "sessions" }),
      secret: process.env.SESSION_SECRET || "paspa-tech-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false, sameSite: "lax" },
    })
  );

  // Serve uploaded files
  const express = await import("express");
  app.use("/uploads", express.default.static(uploadDir));

  // ============================================
  // FILE UPLOAD
  // ============================================

  app.post("/api/upload/cover", isAuthenticated, upload.single("cover"), async (req: any, res) => {
    const profile = await storage.getUserProfile(req.session.userId);
    if (profile?.role !== "admin") return res.status(403).json({ message: "Accès interdit" });
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé ou format non supporté" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // ============================================
  // AUTH ROUTES
  // ============================================

  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const input = registerSchema.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await storage.createUser({ email: input.email, firstName: input.firstName, lastName: input.lastName, passwordHash });
      await storage.createUserProfile({ userId: user.id, firstName: input.firstName, lastName: input.lastName, role: "customer" });
      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error("Register error:", err);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const input = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || !user.passwordHash) return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
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
        acceptedContract: z.boolean().refine(v => v, "Vous devez accepter le contrat"),
      });
      const input = ambassadorSchema.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await storage.createUser({ email: input.email, firstName: input.firstName, lastName: input.lastName, passwordHash });
      await storage.createUserProfile({
        userId: user.id, firstName: input.firstName, lastName: input.lastName,
        role: "ambassador", zone: input.zone, phoneNumber: input.phoneNumber,
        country: input.country, isApproved: false,
        acceptedTerms: input.acceptedTerms, acceptedNoResale: input.acceptedNoResale,
      });
      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error("Ambassador register error:", err);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Non authentifié" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnecté" });
    });
  });

  // ============================================
  // PROFILE ROUTES
  // ============================================

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    const profile = await storage.getUserProfile(req.session.userId);
    if (!profile) return res.status(404).json({ message: "Profil introuvable" });
    res.json(profile);
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.updateUserProfile(req.session.userId, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Erreur de mise à jour" });
    }
  });

  // ============================================
  // USER DASHBOARD - Orders & History
  // ============================================

  app.get("/api/user/orders", isAuthenticated, async (req: any, res) => {
    const userOrders = await storage.getOrdersByUser(req.session.userId);
    res.json(userOrders);
  });

  // ============================================
  // PRODUCTS
  // ============================================

  app.get("/api/products", async (req, res) => {
    const prods = await storage.getProducts();
    res.json(prods);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  });

  // ============================================
  // ORDERS
  // ============================================

  app.post("/api/orders", async (req: any, res) => {
    try {
      const input = z.object({
        productId: z.number(),
        amount: z.number(),
        paymentMethod: z.string(),
        guestEmail: z.string().optional(),
        guestPhone: z.string().optional(),
        ambassadorId: z.string().optional(),
      }).parse(req.body);

      let zone = "zone1";
      if (input.ambassadorId) {
        const ambassadorProfile = await storage.getUserProfile(input.ambassadorId);
        if (ambassadorProfile?.zone) zone = ambassadorProfile.zone;
      }
      const salesInZone = await storage.getZoneSales(zone);
      if (salesInZone >= 50000) return res.status(400).json({ message: "Quota de zone dépassé" });

      const order = await storage.createOrder({
        userId: req.session?.userId || null,
        productId: input.productId,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        ambassadorId: input.ambassadorId,
        zone, status: "completed"
      });

      if (input.ambassadorId) {
        await storage.createCommission({
          ambassadorId: input.ambassadorId,
          orderId: order.id,
          amount: (input.amount * 0.70).toString(),
          status: "pending"
        });
      }

      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Impossible de créer la commande" });
    }
  });

  // ============================================
  // ADMIN ROUTES - Full Management
  // ============================================

  app.get("/api/admin/dashboard", isAdmin, async (req: any, res) => {
    const [zone1Sales, zone2Sales, totalUsers, todayOrders, totalRevenue, allOrders, ambassadors, unpaidCommissions, allCommissions] = await Promise.all([
      storage.getZoneSales("zone1"),
      storage.getZoneSales("zone2"),
      storage.getTotalUsersCount(),
      storage.getTodayOrdersCount(),
      storage.getTotalRevenue(),
      storage.getAllOrders(),
      storage.getAllAmbassadors(),
      storage.getUnpaidCommissions(),
      storage.getAllCommissions(),
    ]);

    const totalCommissions = allCommissions.reduce((s, c) => s + Number(c.amount), 0);
    const paidCommissions = allCommissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
    const pendingCommissions = allCommissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);

    const ambassadorDetails = await Promise.all(ambassadors.map(async (amb) => {
      const referralCount = await storage.getReferralCountByAmbassador(amb.userId);
      const ambCommissions = await storage.getCommissionsByAmbassador(amb.userId);
      const totalEarned = ambCommissions.reduce((s, c) => s + Number(c.amount), 0);
      return { ...amb, referralCount, totalEarned };
    }));

    res.json({
      totalSales: zone1Sales + zone2Sales,
      zone1Sales,
      zone2Sales,
      totalUsers,
      todayOrders,
      totalRevenue,
      totalOrders: allOrders.length,
      ambassadorsCount: ambassadors.length,
      approvedAmbassadors: ambassadors.filter(a => a.isApproved).length,
      pendingAmbassadors: ambassadors.filter(a => !a.isApproved).length,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      ambassadors: ambassadorDetails,
    });
  });

  app.get("/api/admin/ambassadors", isAdmin, async (req: any, res) => {
    const ambassadors = await storage.getAllAmbassadors();
    const details = await Promise.all(ambassadors.map(async (amb) => {
      const referralCount = await storage.getReferralCountByAmbassador(amb.userId);
      const ambCommissions = await storage.getCommissionsByAmbassador(amb.userId);
      const totalEarned = ambCommissions.reduce((s, c) => s + Number(c.amount), 0);
      return { ...amb, referralCount, totalEarned };
    }));
    res.json(details);
  });

  app.post("/api/admin/ambassadors/:id/approve", isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    const profile = await storage.getUserProfileById(id);
    if (!profile) return res.status(404).json({ message: "Ambassadeur introuvable" });
    await db.update(schema.userProfiles).set({ isApproved: true }).where(eq(schema.userProfiles.id, id));
    res.json({ success: true });
  });

  app.post("/api/admin/ambassadors/:id/reject", isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    await db.update(schema.userProfiles).set({ isApproved: false }).where(eq(schema.userProfiles.id, id));
    res.json({ success: true });
  });

  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    const allUsers = await storage.getAllUserProfiles();
    res.json(allUsers);
  });

  app.get("/api/admin/orders", isAdmin, async (req: any, res) => {
    const allOrders = await storage.getAllOrders();
    res.json(allOrders);
  });

  app.get("/api/admin/products", isAdmin, async (req: any, res) => {
    const allProducts = await storage.getAllProducts();
    res.json(allProducts);
  });

  app.post("/api/admin/products", isAdmin, async (req: any, res) => {
    try {
      const input = z.object({
        name: z.string().min(1, "Nom requis"),
        description: z.string().min(1, "Description requise"),
        price: z.string(),
        fileUrl: z.string().default("/pdfs/default.pdf"),
        coverImageUrl: z.string().optional(),
      }).parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Erreur de création" });
    }
  });

  app.put("/api/admin/products/:id", isAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Erreur de mise à jour" });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erreur de suppression" });
    }
  });

  app.get("/api/admin/commissions", isAdmin, async (req: any, res) => {
    const all = await storage.getAllCommissions();
    res.json(all);
  });

  app.post("/api/admin/commissions/:id/pay", isAdmin, async (req: any, res) => {
    const id = Number(req.params.id);
    await db.update(schema.commissions).set({ status: "paid" }).where(eq(schema.commissions.id, id));
    res.json({ success: true });
  });

  // ============================================
  // AMBASSADOR ROUTES
  // ============================================

  app.get("/api/ambassador/stats", isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const profile = await storage.getUserProfile(userId);
    if (profile?.role !== "ambassador") return res.status(403).json({ message: "Accès interdit" });

    const [commissionsList, referrals, referralCount, zoneQuota] = await Promise.all([
      storage.getCommissionsByAmbassador(userId),
      storage.getReferralsByAmbassador(userId),
      storage.getReferralCountByAmbassador(userId),
      storage.getZoneSales(profile.zone || "zone1"),
    ]);

    const totalCommission = commissionsList.reduce((sum, c) => sum + Number(c.amount), 0);
    const paidCommission = commissionsList.filter(c => c.status === "paid").reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingCommission = commissionsList.filter(c => c.status === "pending").reduce((sum, c) => sum + Number(c.amount), 0);

    const referralCountries: Record<string, number> = {};
    for (const ref of referrals) {
      if (ref.userId) {
        const refProfile = await storage.getUserProfile(ref.userId);
        if (refProfile?.country) {
          referralCountries[refProfile.country] = (referralCountries[refProfile.country] || 0) + 1;
        }
      }
    }

    res.json({
      totalSales: referrals.length,
      totalCommission,
      paidCommission,
      pendingCommission,
      referralCount,
      referrals: referrals.length,
      referralCountries,
      zoneQuota: 50000 - zoneQuota,
      isApproved: profile.isApproved,
    });
  });

  // ============================================
  // SEED DATA
  // ============================================

  setTimeout(async () => {
    const prods = await storage.getProducts();
    if (prods.length === 0) {
      const seedProducts = [
        { name: "Guide Culture Oignon", description: "Tout savoir sur la culture de l'oignon en Afrique. Techniques de semis, irrigation, récolte et conservation. Ce guide couvre les variétés adaptées au climat africain, les meilleures pratiques pour la préparation du sol, les calendriers de semis optimaux, et les techniques post-récolte pour maximiser la durée de conservation.", price: "500", fileUrl: "/pdfs/oignon.pdf", coverImageUrl: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800" },
        { name: "Guide Culture Tomate", description: "Techniques modernes pour la culture de la tomate en Afrique. Du semis à la commercialisation. Découvrez les variétés résistantes, la gestion de l'irrigation goutte à goutte, la lutte intégrée contre les ravageurs, et les stratégies de commercialisation pour maximiser vos revenus.", price: "500", fileUrl: "/pdfs/tomate.pdf", coverImageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800" },
        { name: "Guide Culture Piment", description: "Produire le meilleur piment d'Afrique. Variétés adaptées et techniques de production intensives. Ce guide détaille le choix des variétés (piment fort, doux), les techniques de pépinière, la fertilisation organique, et les méthodes de séchage pour l'export.", price: "500", fileUrl: "/pdfs/piment.pdf", coverImageUrl: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800" },
        { name: "Guide Culture Manioc", description: "Maîtriser la culture du manioc de A à Z. Plantation, entretien et transformation industrielle. Apprenez les techniques de bouturage, la gestion des maladies (mosaïque), la transformation en gari, attiéké et farine, et la chaîne de valeur complète.", price: "500", fileUrl: "/pdfs/manioc.pdf", coverImageUrl: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800" },
        { name: "Guide Culture Gingembre", description: "Cultiver le gingembre en Afrique. Guide complet du semis à la récolte et la transformation. Techniques de multiplication, gestion des sols, fertilisation, récolte au bon stade de maturité, et préparation pour les marchés locaux et l'exportation.", price: "500", fileUrl: "/pdfs/gingembre.pdf", coverImageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800" },
      ];
      for (const p of seedProducts) await db.insert(schema.products).values(p);
      console.log("Seeded products");
    }
  }, 3000);

  return httpServer;
}
