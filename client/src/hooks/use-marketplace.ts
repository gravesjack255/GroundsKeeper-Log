import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MarketplaceListing, Equipment, MaintenanceLog, InsertMarketplaceListing } from "@shared/schema";

export type MarketplaceListingWithEquipment = MarketplaceListing & { equipment: Equipment };
export type MarketplaceListingDetail = MarketplaceListing & { equipment: Equipment; maintenanceLogs: MaintenanceLog[] };

export function useMarketplaceListings(search?: string) {
  const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
  return useQuery<MarketplaceListingWithEquipment[]>({
    queryKey: ['/api/marketplace', search],
    queryFn: () => fetch(`/api/marketplace${queryParams}`).then(res => res.json()),
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
