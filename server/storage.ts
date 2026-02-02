import { db } from "./db";
import {
  equipment,
  maintenanceLogs,
  type Equipment,
  type InsertEquipment,
  type UpdateEquipmentRequest,
  type MaintenanceLog,
  type InsertMaintenanceLog,
} from "@shared/schema";
import { eq, desc, ilike, or, and, SQL } from "drizzle-orm";

export interface IStorage {
  // Equipment
  getEquipmentList(search?: string, status?: string): Promise<Equipment[]>;
  getEquipment(id: number): Promise<(Equipment & { logs: MaintenanceLog[] }) | undefined>;
  createEquipment(data: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, updates: UpdateEquipmentRequest): Promise<Equipment>;
  deleteEquipment(id: number): Promise<void>;

  // Maintenance
  getMaintenanceLogs(equipmentId?: number): Promise<MaintenanceLog[]>;
  createMaintenanceLog(data: InsertMaintenanceLog): Promise<MaintenanceLog>;
  deleteMaintenanceLog(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getEquipmentList(search?: string, status?: string): Promise<Equipment[]> {
    const conditions: SQL[] = [];
    
    if (status) {
      conditions.push(eq(equipment.status, status));
    }
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(equipment.name, searchPattern),
          ilike(equipment.make, searchPattern),
          ilike(equipment.model, searchPattern)
        )!
      );
    }
    
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      return await db.select().from(equipment).where(whereClause).orderBy(desc(equipment.createdAt));
    }
    
    return await db.select().from(equipment).orderBy(desc(equipment.createdAt));
  }

  async getEquipment(id: number): Promise<(Equipment & { logs: MaintenanceLog[] }) | undefined> {
    const item = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
    if (item.length === 0) return undefined;

    const logs = await db
      .select()
      .from(maintenanceLogs)
      .where(eq(maintenanceLogs.equipmentId, id))
      .orderBy(desc(maintenanceLogs.date));

    return { ...item[0], logs };
  }

  async createEquipment(data: InsertEquipment): Promise<Equipment> {
    const [item] = await db.insert(equipment).values(data).returning();
    return item;
  }

  async updateEquipment(id: number, updates: UpdateEquipmentRequest): Promise<Equipment> {
    const [item] = await db
      .update(equipment)
      .set(updates)
      .where(eq(equipment.id, id))
      .returning();
    return item;
  }

  async deleteEquipment(id: number): Promise<void> {
    await db.delete(maintenanceLogs).where(eq(maintenanceLogs.equipmentId, id));
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  async getMaintenanceLogs(equipmentId?: number): Promise<MaintenanceLog[]> {
    if (equipmentId) {
      return await db
        .select()
        .from(maintenanceLogs)
        .where(eq(maintenanceLogs.equipmentId, equipmentId))
        .orderBy(desc(maintenanceLogs.date));
    }
    return await db.select().from(maintenanceLogs).orderBy(desc(maintenanceLogs.date));
  }

  async createMaintenanceLog(data: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const [log] = await db.insert(maintenanceLogs).values(data).returning();
    return log;
  }

  async deleteMaintenanceLog(id: number): Promise<void> {
    await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, id));
  }
}

export const storage = new DatabaseStorage();
