import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth schema for users and sessions
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Owner of this equipment
  name: text("name").notNull(), // e.g., "Fairway Mower #1"
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  serialNumber: text("serial_number"),
  currentHours: decimal("current_hours", { precision: 10, scale: 1 }).default("0").notNull(),
  status: text("status").default("active").notNull(), // active, maintenance, retired
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Owner of this log
  equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
  date: date("date").defaultNow().notNull(),
  type: text("type").notNull(), // Routine, Repair, Inspection
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  hoursAtService: decimal("hours_at_service", { precision: 10, scale: 1 }),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
  sellerId: text("seller_id").notNull(), // User who listed the equipment
  sellerName: text("seller_name"), // Display name for the seller
  askingPrice: decimal("asking_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"), // Additional listing notes
  contactInfo: text("contact_info"), // How buyers can reach the seller
  status: text("status").default("active").notNull(), // active, sold, removed
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const equipmentRelations = relations(equipment, ({ many }) => ({
  logs: many(maintenanceLogs),
  listings: many(marketplaceListings),
}));

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceLogs.equipmentId],
    references: [equipment.id],
  }),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  equipment: one(equipment, {
    fields: [marketplaceListings.equipmentId],
    references: [equipment.id],
  }),
}));

// === BASE SCHEMAS ===
// Omit userId as it's set server-side from authenticated user
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true, userId: true, createdAt: true });
export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).omit({ id: true, userId: true, createdAt: true });
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true, sellerId: true, createdAt: true, status: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;

// Request types
export type CreateEquipmentRequest = InsertEquipment;
export type UpdateEquipmentRequest = Partial<InsertEquipment>;
export type CreateMaintenanceLogRequest = InsertMaintenanceLog;
export type CreateMarketplaceListingRequest = InsertMarketplaceListing;

// Response types
export type EquipmentResponse = Equipment & { logs?: MaintenanceLog[] };
export type MaintenanceLogResponse = MaintenanceLog & { equipmentName?: string };
export type MarketplaceListingResponse = MarketplaceListing & { 
  equipment: Equipment;
  maintenanceLogs: MaintenanceLog[];
};

// Query params
export interface EquipmentQueryParams {
  status?: string;
  search?: string;
}
