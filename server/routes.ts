import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";
import { db } from "./db";
import * as schema from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile Routes
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.profile.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
    const userId = req.user.claims.sub;
    const input = api.profile.update.input.parse(req.body);
    const updated = await storage.updateUserProfile(userId, input);
    res.json(updated);
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Orders
  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      
      // Determine zone based on ambassador or default to zone1 if not provided?
      // Logic: If ambassador provided, get their zone.
      let zone = "zone1"; 
      if (input.ambassadorId) {
        const ambassadorProfile = await storage.getUserProfile(input.ambassadorId);
        if (ambassadorProfile?.zone) {
          zone = ambassadorProfile.zone;
        }
      }

      // Check quota
      const salesInZone = await storage.getZoneSales(zone);
      if (salesInZone >= 50000) {
        return res.status(400).json({ message: "Zone quota exceeded" });
      }

      const order = await storage.createOrder({
        userId: req.user?.claims?.sub || null, // Optional if guest
        productId: input.productId,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        ambassadorId: input.ambassadorId,
        zone: zone,
        status: "completed" // Simulating immediate payment success for MVP
      });

      // Calculate commission if ambassador exists
      if (input.ambassadorId) {
        const commissionAmount = input.amount * 0.70; // 70% commission
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

  // Admin Routes
  app.get(api.admin.dashboard.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
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

  // Ambassador Stats
  app.get(api.ambassador.stats.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    
    if (profile?.role !== "ambassador") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const commissions = await storage.getCommissionsByAmbassador(userId);
    const totalCommission = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const zoneQuota = await storage.getZoneSales(profile.zone || "zone1");

    res.json({
      totalSales: commissions.length, // approximation
      commissionEarned: totalCommission,
      zoneQuota: 50000 - zoneQuota
    });
  });

  // SEED DATA
  setTimeout(async () => {
    const products = await storage.getProducts();
    if (products.length === 0) {
      // Seed PDFs
      const seedProducts = [
        { name: "Guide Culture Oignon", description: "Tout savoir sur la culture de l'oignon.", price: "500", fileUrl: "/pdfs/oignon.pdf" },
        { name: "Guide Culture Tomate", description: "Techniques modernes pour la tomate.", price: "500", fileUrl: "/pdfs/tomate.pdf" },
        { name: "Guide Culture Piment", description: "Produire le meilleur piment.", price: "500", fileUrl: "/pdfs/piment.pdf" },
      ];
      
      // We can't insert directly via storage because createProduct isn't there, let's use db directly for seed
      for (const p of seedProducts) {
        await db.insert(schema.products).values(p);
      }
      console.log("Seeded products");
    }
  }, 5000);

  return httpServer;
}
