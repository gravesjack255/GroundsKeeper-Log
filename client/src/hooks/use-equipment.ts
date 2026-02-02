import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  InsertEquipment, 
  UpdateEquipmentRequest 
} from "@shared/schema";

export function useEquipment(params?: { status?: string; search?: string }) {
  // Filter out undefined values from params for clean query key and URL
  const cleanParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
  ) : undefined;
  
  const hasParams = cleanParams && Object.keys(cleanParams).length > 0;
  
  return useQuery({
    queryKey: [api.equipment.list.path, hasParams ? cleanParams : undefined],
    queryFn: async () => {
      const url = hasParams
        ? `${api.equipment.list.path}?${new URLSearchParams(cleanParams as Record<string, string>)}`
        : api.equipment.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch equipment");
      return api.equipment.list.responses[200].parse(await res.json());
    },
  });
}

export function useEquipmentDetail(id: number) {
  return useQuery({
    queryKey: [api.equipment.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.equipment.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch equipment details");
      return api.equipment.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertEquipment) => {
      // Coerce number strings to numbers if needed (though zod usually handles)
      const res = await fetch(api.equipment.create.path, {
        method: api.equipment.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message || "Validation failed");
        }
        throw new Error("Failed to create equipment");
      }
      return api.equipment.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.equipment.list.path], exact: false });
      toast({
        title: "Success",
        description: "Equipment added to fleet.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateEquipmentRequest) => {
      const url = buildUrl(api.equipment.update.path, { id });
      const res = await fetch(url, {
        method: api.equipment.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update equipment");
      return api.equipment.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.equipment.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.equipment.get.path, data.id] });
      toast({
        title: "Updated",
        description: "Equipment details saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.equipment.delete.path, { id });
      const res = await fetch(url, { method: api.equipment.delete.method });
      if (!res.ok) throw new Error("Failed to delete equipment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.equipment.list.path] });
      toast({
        title: "Deleted",
        description: "Equipment removed from system.",
      });
    },
  });
}
