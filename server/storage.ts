import { db } from "./db";
import {
  equipment,
  maintenanceLogs,
  marketplaceListings,
  type Equipment,
  type InsertEquipment,
  type UpdateEquipmentRequest,
  type MaintenanceLog,
  type InsertMaintenanceLog,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type MarketplaceListingResponse,
} from "@shared/schema";
import { eq, desc, ilike, or, and, SQL } from "drizzle-orm";

export interface IStorage {
  // Equipment - all operations scoped by userId
  getEquipmentList(userId: string, search?: string, status?: string): Promise<Equipment[]>;
  getEquipment(userId: string, id: number): Promise<(Equipment & { logs: MaintenanceLog[] }) | undefined>;
  createEquipment(userId: string, data: InsertEquipment): Promise<Equipment>;
  updateEquipment(userId: string, id: number, updates: UpdateEquipmentRequest): Promise<Equipment | undefined>;
  deleteEquipment(userId: string, id: number): Promise<void>;

  // Maintenance - all operations scoped by userId
  getMaintenanceLogs(userId: string, equipmentId?: number): Promise<MaintenanceLog[]>;
  createMaintenanceLog(userId: string, data: InsertMaintenanceLog): Promise<MaintenanceLog>;
  deleteMaintenanceLog(userId: string, id: number): Promise<void>;

  // Marketplace - public listings visible to all, but create/remove scoped by userId
  getMarketplaceListings(search?: string): Promise<(MarketplaceListing & { equipment: Equipment })[]>;
  getMarketplaceListing(id: number): Promise<MarketplaceListingResponse | undefined>;
  createMarketplaceListing(sellerId: string, sellerName: string, data: InsertMarketplaceListing): Promise<MarketplaceListing>;
  removeMarketplaceListing(sellerId: string, id: number): Promise<boolean>;
  getActiveListingForEquipment(equipmentId: number): Promise<MarketplaceListing | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getEquipmentList(userId: string, search?: string, status?: string): Promise<Equipment[]> {
    const conditions: SQL[] = [eq(equipment.userId, userId)];
    
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
    
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    return await db.select().from(equipment).where(whereClause).orderBy(desc(equipment.createdAt));
  }

  async getEquipment(userId: string, id: number): Promise<(Equipment & { logs: MaintenanceLog[] }) | undefined> {
    const item = await db.select().from(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)))
      .limit(1);
    if (item.length === 0) return undefined;

    const logs = await db
      .select()
      .from(maintenanceLogs)
      .where(and(eq(maintenanceLogs.equipmentId, id), eq(maintenanceLogs.userId, userId)))
      .orderBy(desc(maintenanceLogs.date));

    return { ...item[0], logs };
  }

  async createEquipment(userId: string, data: InsertEquipment): Promise<Equipment> {
    const [item] = await db.insert(equipment).values({ ...data, userId }).returning();
    return item;
  }

  async updateEquipment(userId: string, id: number, updates: UpdateEquipmentRequest): Promise<Equipment | undefined> {
    const [item] = await db
      .update(equipment)
      .set(updates)
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)))
      .returning();
    return item;
  }

  async deleteEquipment(userId: string, id: number): Promise<void> {
    // First delete any marketplace listings
    await db.delete(marketplaceListings)
      .where(and(eq(marketplaceListings.equipmentId, id), eq(marketplaceListings.sellerId, userId)));
    // Then delete related maintenance logs for this user's equipment
    await db.delete(maintenanceLogs)
      .where(and(eq(maintenanceLogs.equipmentId, id), eq(maintenanceLogs.userId, userId)));
    // Then delete the equipment
    await db.delete(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)));
  }

  async getMaintenanceLogs(userId: string, equipmentId?: number): Promise<MaintenanceLog[]> {
    const conditions: SQL[] = [eq(maintenanceLogs.userId, userId)];
    
    if (equipmentId) {
      conditions.push(eq(maintenanceLogs.equipmentId, equipmentId));
    }
    
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    return await db.select().from(maintenanceLogs).where(whereClause).orderBy(desc(maintenanceLogs.date));
  }

  async createMaintenanceLog(userId: string, data: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const [log] = await db.insert(maintenanceLogs).values({ ...data, userId }).returning();
    return log;
  }

  async deleteMaintenanceLog(userId: string, id: number): Promise<void> {
    await db.delete(maintenanceLogs)
      .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.userId, userId)));
  }

  // Marketplace methods - listings are public
  async getMarketplaceListings(search?: string): Promise<(MarketplaceListing & { equipment: Equipment })[]> {
    const conditions: SQL[] = [eq(marketplaceListings.status, 'active')];
    
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
    
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    
    const results = await db
      .select({
        listing: marketplaceListings,
        equipment: equipment,
      })
      .from(marketplaceListings)
      .innerJoin(equipment, eq(marketplaceListings.equipmentId, equipment.id))
      .where(whereClause)
      .orderBy(desc(marketplaceListings.createdAt));
    
    return results.map(r => ({ ...r.listing, equipment: r.equipment }));
  }

  async getMarketplaceListing(id: number): Promise<MarketplaceListingResponse | undefined> {
    const results = await db
      .select({
        listing: marketplaceListings,
        equipment: equipment,
      })
      .from(marketplaceListings)
      .innerJoin(equipment, eq(marketplaceListings.equipmentId, equipment.id))
      .where(eq(marketplaceListings.id, id))
      .limit(1);
    
    if (results.length === 0) return undefined;
    
    const { listing, equipment: equip } = results[0];
    
    // Get maintenance logs for this equipment (public view)
    const logs = await db
      .select()
      .from(maintenanceLogs)
      .where(eq(maintenanceLogs.equipmentId, equip.id))
      .orderBy(desc(maintenanceLogs.date));
    
    return { ...listing, equipment: equip, maintenanceLogs: logs };
  }

  async createMarketplaceListing(sellerId: string, sellerName: string, data: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [listing] = await db
      .insert(marketplaceListings)
      .values({ ...data, sellerId, sellerName, status: 'active' })
      .returning();
    return listing;
  }

  async removeMarketplaceListing(sellerId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(marketplaceListings)
      .where(and(eq(marketplaceListings.id, id), eq(marketplaceListings.sellerId, sellerId)))
      .returning();
    return result.length > 0;
  }

  async getActiveListingForEquipment(equipmentId: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(and(eq(marketplaceListings.equipmentId, equipmentId), eq(marketplaceListings.status, 'active')))
      .limit(1);
    return listing;
  }
}

export const storage = new DatabaseStorage();
