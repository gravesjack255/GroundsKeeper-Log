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
import { eq, desc, like, or } from "drizzle-orm";

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
    let query = db.select().from(equipment);
    
    // Simple filtering - could be improved with dynamic where clauses
    if (search || status) {
       // Note: complex filtering is often better handled by building the where clause array
       // For this simple MVP, we return all and let filters happen or add basic logic if needed
       // But let's do a basic search implementation
       const conditions = [];
       if (status) conditions.push(eq(equipment.status, status));
       if (search) {
         const searchLower = `%${search.toLowerCase()}%`;
         conditions.push(or(
           like(equipment.name, searchLower),
           like(equipment.make, searchLower),
           like(equipment.model, searchLower)
         ));
       }
       
       if (conditions.length > 0) {
         // @ts-ignore - simple condition combining for MVP
         return await db.select().from(equipment).where(conditions.reduce((acc, c) => (acc ? and(acc, c) : c), undefined)); 
       }
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
