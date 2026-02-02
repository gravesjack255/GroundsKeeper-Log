import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Equipment Routes
  app.get(api.equipment.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const items = await storage.getEquipmentList(search, status);
    res.json(items);
  });

  app.get(api.equipment.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const item = await storage.getEquipment(id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(item);
  });

  app.post(api.equipment.create.path, async (req, res) => {
    try {
      const input = api.equipment.create.input.parse(req.body);
      const item = await storage.createEquipment(input);
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

  app.patch(api.equipment.update.path, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.equipment.update.input.parse(req.body);
      const item = await storage.updateEquipment(id, input);
      if (!item) return res.status(404).json({ message: "Equipment not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error" });
      }
      throw err;
    }
  });

  app.delete(api.equipment.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteEquipment(id);
    res.status(204).send();
  });

  // Maintenance Routes
  app.get(api.maintenance.list.path, async (req, res) => {
    const equipmentId = req.query.equipmentId ? Number(req.query.equipmentId) : undefined;
    const logs = await storage.getMaintenanceLogs(equipmentId);
    res.json(logs);
  });

  app.post(api.maintenance.create.path, async (req, res) => {
    try {
      const input = api.maintenance.create.input.parse(req.body);
      const log = await storage.createMaintenanceLog(input);
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

  app.delete(api.maintenance.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteMaintenanceLog(id);
    res.status(204).send();
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getEquipmentList();
  if (existing.length > 0) return;

  console.log("Seeding database...");

  const mower = await storage.createEquipment({
    name: "Fairway Master 5000",
    make: "Toro",
    model: "Reelmaster 5010-H",
    year: 2022,
    currentHours: "450.5",
    serialNumber: "TR-5010-22-001",
    status: "active",
    notes: "Primary fairway mower. Check reels weekly.",
  });

  const cart = await storage.createEquipment({
    name: "Beverage Cart #2",
    make: "Club Car",
    model: "Carryall 500",
    year: 2020,
    currentHours: "1200.0",
    serialNumber: "CC-500-20-882",
    status: "active",
    notes: "New tires installed Jan 2024",
  });

  const tractor = await storage.createEquipment({
    name: "Utility Tractor",
    make: "John Deere",
    model: "4066R",
    year: 2019,
    currentHours: "2150.2",
    serialNumber: "JD-4066-19-445",
    status: "maintenance",
    notes: "Awaiting hydraulic pump part",
  });

  // Logs for mower
  await storage.createMaintenanceLog({
    equipmentId: mower.id,
    date: "2024-01-15",
    type: "Routine",
    description: "Oil change and filter replacement",
    cost: "85.50",
    hoursAtService: "430.0",
    performedBy: "Mike T.",
  });

  await storage.createMaintenanceLog({
    equipmentId: mower.id,
    date: "2024-02-01",
    type: "Inspection",
    description: "Reel sharpening and height adjustment",
    cost: "150.00",
    hoursAtService: "445.0",
    performedBy: "External Service",
  });

  // Logs for tractor
  await storage.createMaintenanceLog({
    equipmentId: tractor.id,
    date: "2024-02-10",
    type: "Repair",
    description: "Hydraulic leak diagnosis - ordered pump",
    cost: "0.00",
    hoursAtService: "2150.2",
    performedBy: "Mike T.",
  });
  
  console.log("Seeding complete!");
}
