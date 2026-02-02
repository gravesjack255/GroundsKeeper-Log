import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MarketplaceListing, Equipment, MaintenanceLog, InsertMarketplaceListing } from "@shared/schema";

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
    },
  });
}
