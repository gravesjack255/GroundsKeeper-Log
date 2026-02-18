import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useMaintenanceLogs, useDeleteMaintenanceLog } from "@/hooks/use-maintenance";
import { useEquipment } from "@/hooks/use-equipment";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function MaintenanceLogs() {
  const { data: logs, isLoading: logsLoading } = useMaintenanceLogs();
  const { data: equipment, isLoading: equipLoading } = useEquipment();
  const deleteLog = useDeleteMaintenanceLog();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: string; date: string } | null>(null);

  const equipmentMap = new Map(equipment?.map(e => [e.id, e.name]));

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 pt-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Maintenance Logs</h1>
        <p className="text-muted-foreground mb-8">Comprehensive history of all service performed.</p>

        <Card>
          <CardContent className="p-0">
            {logsLoading || equipLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[35%]">Description</TableHead>
                    <TableHead>Tech</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id} className="group">
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Link href={`/equipment/${log.equipmentId}`} className="hover:text-primary hover:underline font-medium">
                           {equipmentMap.get(log.equipmentId) || `ID: ${log.equipmentId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs border-border">
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate group-hover:whitespace-normal group-hover:text-foreground transition-all">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.performedBy || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${Number(log.cost).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget({ id: log.id, type: log.type, date: format(new Date(log.date), 'MMM d, yyyy') })}
                          data-testid={`button-delete-log-${log.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!logs?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No maintenance logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type} log from {deleteTarget?.date}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteLog.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
