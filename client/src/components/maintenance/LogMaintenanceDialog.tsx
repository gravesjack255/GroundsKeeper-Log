import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMaintenanceLogSchema, type InsertMaintenanceLog, type Equipment } from "@shared/schema";
import { useCreateMaintenanceLog } from "@/hooks/use-maintenance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface LogMaintenanceDialogProps {
  equipment: Equipment;
  trigger?: React.ReactNode;
}

export function LogMaintenanceDialog({ equipment, trigger }: LogMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const createLog = useCreateMaintenanceLog();
  
  const form = useForm<InsertMaintenanceLog>({
    resolver: zodResolver(insertMaintenanceLogSchema),
    defaultValues: {
      equipmentId: equipment.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: "Routine",
      description: "",
      cost: "0.00",
      hoursAtService: equipment.currentHours,
      performedBy: "",
    },
  });

  function onSubmit(data: InsertMaintenanceLog) {
    createLog.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset({
           ...data,
           description: "",
           cost: "0.00",
           performedBy: "",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/10">
            <Plus className="h-4 w-4" /> Log Maintenance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Maintenance</DialogTitle>
          <DialogDescription>
            Record service for <span className="font-semibold text-foreground">{equipment.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Routine">Routine</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Sharpening">Sharpening</SelectItem>
                        <SelectItem value="Oil Change">Oil Change</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Work</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Changed oil filter, sharpened blades..." 
                      className="resize-none min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hoursAtService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="performedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performed By</FormLabel>
                  <FormControl>
                    <Input placeholder="Technician name" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLog.isPending}>
                {createLog.isPending ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
