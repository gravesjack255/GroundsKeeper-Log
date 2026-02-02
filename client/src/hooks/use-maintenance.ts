import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertMaintenanceLog } from "@shared/schema";

export function useMaintenanceLogs(equipmentId?: number) {
  return useQuery({
    queryKey: [api.maintenance.list.path, equipmentId],
    queryFn: async () => {
      const url = equipmentId 
        ? `${api.maintenance.list.path}?equipmentId=${equipmentId}`
        : api.maintenance.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch maintenance logs");
      return api.maintenance.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMaintenanceLog) => {
      const res = await fetch(api.maintenance.create.path, {
        method: api.maintenance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create log");
      return api.maintenance.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path], exact: false });
      queryClient.invalidateQueries({ queryKey: [api.equipment.list.path], exact: false }); // Update equipment hours
      if (data.equipmentId) {
        queryClient.invalidateQueries({ queryKey: [api.equipment.get.path, data.equipmentId] });
      }
      toast({
        title: "Log Added",
        description: "Maintenance record saved successfully.",
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

export function useDeleteMaintenanceLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.maintenance.delete.path, { id });
      const res = await fetch(url, { method: api.maintenance.delete.method });
      if (!res.ok) throw new Error("Failed to delete log");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.equipment.get.path] });
      toast({
        title: "Deleted",
        description: "Maintenance log removed.",
      });
    },
  });
}
