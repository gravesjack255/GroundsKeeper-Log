import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth schema for users and sessions
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
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
  equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
  date: date("date").defaultNow().notNull(),
  type: text("type").notNull(), // Routine, Repair, Inspection
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  hoursAtService: decimal("hours_at_service", { precision: 10, scale: 1 }),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const equipmentRelations = relations(equipment, ({ many }) => ({
  logs: many(maintenanceLogs),
}));

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceLogs.equipmentId],
    references: [equipment.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true, createdAt: true });
export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;

// Request types
export type CreateEquipmentRequest = InsertEquipment;
export type UpdateEquipmentRequest = Partial<InsertEquipment>;
export type CreateMaintenanceLogRequest = InsertMaintenanceLog;

// Response types
export type EquipmentResponse = Equipment & { logs?: MaintenanceLog[] };
export type MaintenanceLogResponse = MaintenanceLog & { equipmentName?: string };

// Query params
export interface EquipmentQueryParams {
  status?: string;
  search?: string;
}
