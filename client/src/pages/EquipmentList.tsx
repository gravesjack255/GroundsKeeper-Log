import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useEquipment } from "@/hooks/use-equipment";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function EquipmentList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: equipment, isLoading } = useEquipment({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Equipment Fleet</h1>
            <p className="text-muted-foreground mt-1">Manage your golf course machinery and assets.</p>
          </div>
          <AddEquipmentDialog />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, model, or serial..." 
              className="pl-10 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-card">
                <SlidersHorizontal className="h-4 w-4" />
                Filter: {statusFilter === 'all' ? 'All Status' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">All Equipment</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="maintenance">In Maintenance</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="retired">Retired</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : equipment?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-2">No equipment found</h3>
            <p className="text-muted-foreground mb-6">
              {search || statusFilter !== 'all' 
                ? "Try adjusting your filters or search terms." 
                : "Get started by adding your first machine."}
            </p>
            {!search && statusFilter === 'all' && <AddEquipmentDialog />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipment?.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
