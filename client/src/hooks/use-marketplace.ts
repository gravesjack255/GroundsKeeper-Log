import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MarketplaceListing, Equipment, MaintenanceLog, InsertMarketplaceListing, Message, ConversationResponse } from "@shared/schema";

export type MarketplaceListingWithEquipment = MarketplaceListing & { equipment: Equipment; distance?: number };
export type MarketplaceListingDetail = MarketplaceListing & { equipment: Equipment; maintenanceLogs: MaintenanceLog[] };

interface MarketplaceSearchParams {
  search?: string;
  lat?: number;
  lng?: number;
  distance?: number;
}

export function useMarketplaceListings(params: MarketplaceSearchParams = {}) {
  const { search, lat, lng, distance } = params;
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (lat !== undefined) queryParams.set('lat', lat.toString());
  if (lng !== undefined) queryParams.set('lng', lng.toString());
  if (distance !== undefined) queryParams.set('distance', distance.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery<MarketplaceListingWithEquipment[]>({
    queryKey: ['/api/marketplace', search, lat, lng, distance],
    queryFn: () => fetch(`/api/marketplace${queryString}`, { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch listings');
      return res.json();
    }),
  });
}

export function useMarketplaceListing(id: number) {
  return useQuery<MarketplaceListingDetail>({
    queryKey: ['/api/marketplace', id],
    queryFn: () => fetch(`/api/marketplace/${id}`).then(res => res.json()),
    enabled: !!id,
  });
}

export function useCreateMarketplaceListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertMarketplaceListing) =>
      apiRequest("POST", "/api/marketplace", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
    },
  });
}

export function useRemoveMarketplaceListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/marketplace/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] });
    },
  });
}

export function useMyListings() {
  return useQuery<MarketplaceListingWithEquipment[]>({
    queryKey: ['/api/marketplace/my-listings'],
    queryFn: () => fetch('/api/marketplace/my-listings', { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch your listings');
      return res.json();
    }),
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/marketplace/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] });
    },
  });
}

// Messaging hooks
export function useConversations() {
  return useQuery<ConversationResponse[]>({
    queryKey: ['/api/messages/conversations'],
    queryFn: () => fetch('/api/messages/conversations', { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    }),
  });
}

export function useMessages(listingId: number, otherUserId: string) {
  return useQuery<Message[]>({
    queryKey: ['/api/messages', listingId, otherUserId],
    queryFn: () => fetch(`/api/messages/${listingId}/${otherUserId}`, { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    }),
    enabled: !!listingId && !!otherUserId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { listingId: number; receiverId: string; content: string }) =>
      apiRequest("POST", "/api/messages", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', variables.listingId, variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    queryFn: () => fetch('/api/messages/unread-count', { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch unread count');
      return res.json();
    }),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, senderId }: { listingId: number; senderId: string }) =>
      apiRequest("POST", `/api/messages/${listingId}/${senderId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
  });
}
