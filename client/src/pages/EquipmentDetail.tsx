import { useRoute } from "wouter";
import { Header } from "@/components/layout/Header";
import { useEquipmentDetail, useDeleteEquipment } from "@/hooks/use-equipment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Settings,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  History
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { LogMaintenanceDialog } from "@/components/maintenance/LogMaintenanceDialog";
import { EditEquipmentDialog } from "@/components/equipment/EditEquipmentDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EquipmentDetail() {
  const [, params] = useRoute("/equipment/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: equipment, isLoading } = useEquipmentDetail(id);
  const deleteEquipment = useDeleteEquipment();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 md:px-6 pt-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-20 text-center">
          <h1 className="text-2xl font-bold">Equipment not found</h1>
          <Button variant="ghost" onClick={() => setLocation('/equipment')}>Return to list</Button>
        </main>
      </div>
    );
  }

  const handleDelete = () => {
    deleteEquipment.mutate(id, {
      onSuccess: () => setLocation('/equipment')
    });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Link href="/equipment" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fleet
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-secondary/50 overflow-hidden border flex-shrink-0">
                {equipment.imageUrl ? (
                  <img src={equipment.imageUrl} alt={equipment.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                    {equipment.make.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold text-slate-900">{equipment.name}</h1>
                  <Badge variant="outline" className={cn("capitalize px-3 py-1 text-sm font-medium", 
                    equipment.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    equipment.status === 'maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  )}>
                    {equipment.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="h-4 w-4" /> {equipment.make} {equipment.model}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Year: {equipment.year}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-sm">
                    SN: {equipment.serialNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/5">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {equipment.name} and all its maintenance logs.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Equipment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <EditEquipmentDialog
                equipment={equipment}
                trigger={
                  <Button variant="outline" data-testid="button-edit-equipment">
                    <Settings className="h-4 w-4 mr-2" /> Edit Details
                  </Button>
                }
              />
              
              <LogMaintenanceDialog equipment={equipment} />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
             {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold font-display">{Number(equipment.currentHours).toLocaleString()}</div>
                    <span className="text-sm text-muted-foreground mb-1">hrs</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {equipment.status === 'active' ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    )}
                    <div className="text-lg font-semibold capitalize">{equipment.status}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{equipment.logs?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="history">Maintenance History</TabsTrigger>
                <TabsTrigger value="notes">Notes & Docs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Service Log
                    </CardTitle>
                    <CardDescription>
                      Complete history of maintenance performed on this machine.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!equipment.logs || equipment.logs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No maintenance records found.
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Timeline Connector */}
                        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border"></div>
                        
                        <div className="space-y-8 pl-10">
                          {equipment.logs.map((log) => (
                            <div key={log.id} className="relative group">
                              {/* Timeline Dot */}
                              <div className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors"></div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-foreground">{log.type}</h4>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                                      {format(new Date(log.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                                    {log.description}
                                  </p>
                                  {log.performedBy && (
                                    <p className="text-xs text-muted-foreground italic">
                                      Tech: {log.performedBy}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-mono text-sm font-medium">
                                    ${Number(log.cost).toFixed(2)}
                                  </div>
                                  {log.hoursAtService && (
                                    <div className="text-xs text-muted-foreground">
                                      @ {Number(log.hoursAtService).toLocaleString()} hrs
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {equipment.notes || "No notes available."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Next Service Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Based on current usage, routine maintenance is recommended in:
                </div>
                <div className="mt-2 text-2xl font-bold text-foreground">
                  45 hrs
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (Approx. 2 weeks)
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
