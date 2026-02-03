import { db } from "./db";
import {
  equipment,
  maintenanceLogs,
  marketplaceListings,
  messages,
  type Equipment,
  type InsertEquipment,
  type UpdateEquipmentRequest,
  type MaintenanceLog,
  type InsertMaintenanceLog,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type MarketplaceListingResponse,
  type Message,
  type InsertMessage,
  type ConversationResponse,
} from "@shared/schema";
import { eq, desc, ilike, or, and, SQL, sql } from "drizzle-orm";

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

  // Marketplace - listings visible to authenticated users, create/remove scoped by userId
  getMarketplaceListings(search?: string, userLat?: number, userLng?: number, maxDistance?: number): Promise<(MarketplaceListing & { equipment: Equipment; distance?: number })[]>;
  getMarketplaceListing(id: number): Promise<MarketplaceListingResponse | undefined>;
  createMarketplaceListing(sellerId: string, sellerName: string, data: InsertMarketplaceListing): Promise<MarketplaceListing>;
  removeMarketplaceListing(sellerId: string, id: number): Promise<boolean>;
  getActiveListingForEquipment(equipmentId: number): Promise<MarketplaceListing | undefined>;
  getUserListings(userId: string): Promise<(MarketplaceListing & { equipment: Equipment })[]>;
  updateListingStatus(sellerId: string, id: number, status: string): Promise<MarketplaceListing | undefined>;

  // Messages - in-app messaging between buyers and sellers
  getMessages(userId: string, listingId: number, otherUserId: string): Promise<Message[]>;
  getConversations(userId: string): Promise<ConversationResponse[]>;
  createMessage(senderId: string, senderName: string, data: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: string, listingId: number, senderId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
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

  // Marketplace methods - listings visible to authenticated users
  async getMarketplaceListings(search?: string, userLat?: number, userLng?: number, maxDistance?: number): Promise<(MarketplaceListing & { equipment: Equipment; distance?: number })[]> {
    const conditions: SQL[] = [eq(marketplaceListings.status, 'active')];
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(equipment.name, searchPattern),
          ilike(equipment.make, searchPattern),
          ilike(equipment.model, searchPattern),
          ilike(marketplaceListings.location, searchPattern)
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
    
    // Calculate distances if user location provided
    let listingsWithDistance = results.map(r => {
      let distance: number | undefined;
      if (userLat && userLng && r.listing.latitude && r.listing.longitude) {
        const listingLat = parseFloat(String(r.listing.latitude));
        const listingLng = parseFloat(String(r.listing.longitude));
        distance = this.calculateDistance(userLat, userLng, listingLat, listingLng);
      }
      return { ...r.listing, equipment: r.equipment, distance };
    });
    
    // Filter by max distance if specified
    if (maxDistance && userLat && userLng) {
      listingsWithDistance = listingsWithDistance.filter(l => 
        l.distance === undefined || l.distance <= maxDistance
      );
      // Sort by distance when filtering by distance
      listingsWithDistance.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }
    
    return listingsWithDistance;
  }

  // Haversine formula to calculate distance in miles between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
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

  async getUserListings(userId: string): Promise<(MarketplaceListing & { equipment: Equipment })[]> {
    const results = await db
      .select({
        listing: marketplaceListings,
        equipment: equipment,
      })
      .from(marketplaceListings)
      .innerJoin(equipment, eq(marketplaceListings.equipmentId, equipment.id))
      .where(eq(marketplaceListings.sellerId, userId))
      .orderBy(desc(marketplaceListings.createdAt));
    
    return results.map(r => ({ ...r.listing, equipment: r.equipment }));
  }

  async updateListingStatus(sellerId: string, id: number, status: string): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .update(marketplaceListings)
      .set({ status })
      .where(and(eq(marketplaceListings.id, id), eq(marketplaceListings.sellerId, sellerId)))
      .returning();
    return listing;
  }

  // Messages
  async getMessages(userId: string, listingId: number, otherUserId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.listingId, listingId),
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
            and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<ConversationResponse[]> {
    // Get all messages where user is sender or receiver
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by listing and other user
    const conversationsMap = new Map<string, { listingId: number; otherUserId: string; otherUserName: string | null; lastMessage: Message; unreadCount: number }>();
    
    for (const msg of userMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.listingId}-${otherUserId}`;
      
      if (!conversationsMap.has(key)) {
        const unreadCount = userMessages.filter(m => 
          m.listingId === msg.listingId && 
          m.senderId === otherUserId && 
          m.receiverId === userId && 
          !m.isRead
        ).length;
        
        conversationsMap.set(key, {
          listingId: msg.listingId,
          otherUserId,
          otherUserName: msg.senderId === userId ? null : msg.senderName,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    // Fetch listing details for each conversation
    const conversations: ConversationResponse[] = [];
    for (const conv of Array.from(conversationsMap.values())) {
      const listingData = await db
        .select({
          listing: marketplaceListings,
          equipment: equipment,
        })
        .from(marketplaceListings)
        .innerJoin(equipment, eq(marketplaceListings.equipmentId, equipment.id))
        .where(eq(marketplaceListings.id, conv.listingId))
        .limit(1);

      if (listingData.length > 0) {
        conversations.push({
          listingId: conv.listingId,
          listing: { ...listingData[0].listing, equipment: listingData[0].equipment },
          otherUserId: conv.otherUserId,
          otherUserName: conv.otherUserName,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      }
    }

    return conversations;
  }

  async createMessage(senderId: string, senderName: string, data: InsertMessage): Promise<Message> {
    const [msg] = await db
      .insert(messages)
      .values({ ...data, senderId, senderName, isRead: false })
      .returning();
    return msg;
  }

  async markMessagesAsRead(userId: string, listingId: number, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.listingId, listingId),
          eq(messages.senderId, senderId),
          eq(messages.receiverId, userId)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
