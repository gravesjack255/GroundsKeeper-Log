import type { Express, Request } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Helper to extract user info from session
function getUserFromRequest(req: Request) {
  const user = req.user as any;
  return {
    id: user?.claims?.sub as string,
    email: user?.claims?.email as string | undefined,
    firstName: user?.claims?.first_name as string | undefined,
    lastName: user?.claims?.last_name as string | undefined,
  };
}

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `equipment-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup authentication FIRST (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploaded images
  app.use("/uploads", (await import("express")).default.static(uploadDir));

  // Image upload endpoint with error handling (protected)
  app.post("/api/upload", isAuthenticated, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
          }
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ message: err.message || "Invalid file type" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    });
  });

  // Equipment Routes (protected)
  app.get(api.equipment.list.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const items = await storage.getEquipmentList(userId, search, status);
    res.json(items);
  });

  app.get(api.equipment.get.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const id = Number(req.params.id);
    const item = await storage.getEquipment(userId, id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(item);
  });

  app.post(api.equipment.create.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    try {
      const input = api.equipment.create.input.parse(req.body);
      const item = await storage.createEquipment(userId, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.equipment.update.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const id = Number(req.params.id);
    try {
      const input = api.equipment.update.input.parse(req.body);
      const item = await storage.updateEquipment(userId, id, input);
      if (!item) return res.status(404).json({ message: "Equipment not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error" });
      }
      throw err;
    }
  });

  app.delete(api.equipment.delete.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const id = Number(req.params.id);
    await storage.deleteEquipment(userId, id);
    res.status(204).send();
  });

  // Maintenance Routes (protected)
  app.get(api.maintenance.list.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const equipmentId = req.query.equipmentId ? Number(req.query.equipmentId) : undefined;
    const logs = await storage.getMaintenanceLogs(userId, equipmentId);
    res.json(logs);
  });

  app.post(api.maintenance.create.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    try {
      const input = api.maintenance.create.input.parse(req.body);
      
      // Verify equipment belongs to user before creating log
      const equipmentItem = await storage.getEquipment(userId, input.equipmentId);
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      const log = await storage.createMaintenanceLog(userId, input);
      
      // Update equipment hours if hoursAtService is provided
      if (input.hoursAtService) {
        const newHours = parseFloat(String(input.hoursAtService));
        const currentHours = parseFloat(String(equipmentItem.currentHours));
        if (newHours > currentHours) {
          await storage.updateEquipment(userId, input.equipmentId, { 
            currentHours: String(newHours) 
          });
        }
      }
      
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.maintenance.delete.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const id = Number(req.params.id);
    await storage.deleteMaintenanceLog(userId, id);
    res.status(204).send();
  });

  // Marketplace Routes - all routes require authentication
  app.get(api.marketplace.list.path, isAuthenticated, async (req, res) => {
    const search = req.query.search as string | undefined;
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const maxDistance = req.query.distance ? parseInt(req.query.distance as string) : undefined;
    const listings = await storage.getMarketplaceListings(search, userLat, userLng, maxDistance);
    res.json(listings);
  });

  app.get(api.marketplace.get.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const listing = await storage.getMarketplaceListing(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  });

  app.post(api.marketplace.create.path, isAuthenticated, async (req, res) => {
    const { id: userId, firstName, lastName, email } = getUserFromRequest(req);
    const sellerName = `${firstName || ''} ${lastName || ''}`.trim() || email || 'Anonymous';
    try {
      const input = api.marketplace.create.input.parse(req.body);
      
      // Verify equipment belongs to user
      const equipmentItem = await storage.getEquipment(userId, input.equipmentId);
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      // Check if already listed
      const existingListing = await storage.getActiveListingForEquipment(input.equipmentId);
      if (existingListing) {
        return res.status(400).json({ message: "Equipment is already listed on marketplace" });
      }
      
      const listing = await storage.createMarketplaceListing(userId, sellerName, input);
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.marketplace.remove.path, isAuthenticated, async (req, res) => {
    const { id: userId } = getUserFromRequest(req);
    const id = Number(req.params.id);
    const removed = await storage.removeMarketplaceListing(userId, id);
    if (!removed) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(204).send();
  });

  return httpServer;
}
