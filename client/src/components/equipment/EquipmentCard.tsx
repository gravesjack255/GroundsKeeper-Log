import { Equipment } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  equipment: Equipment;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20';
      case 'maintenance': return 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20';
      case 'retired': return 'bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Link href={`/equipment/${equipment.id}`}>
      <Card className="card-hover h-full cursor-pointer border-border/50 bg-card overflow-hidden group">
        <div className="aspect-video w-full bg-secondary/50 relative overflow-hidden">
          {equipment.imageUrl ? (
            <img 
              src={equipment.imageUrl} 
              alt={equipment.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="text-4xl font-display font-bold text-muted-foreground/20">
                {equipment.make.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
             <Badge variant="outline" className={cn("capitalize backdrop-blur-sm", getStatusColor(equipment.status))}>
               {equipment.status}
             </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {equipment.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {equipment.make} {equipment.model}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
             <div className="flex items-center gap-1.5 text-muted-foreground">
               <Clock className="h-3.5 w-3.5" />
               <span>{Number(equipment.currentHours).toLocaleString()} hrs</span>
             </div>
             <div className="flex items-center gap-1.5 text-muted-foreground">
               <Calendar className="h-3.5 w-3.5" />
               <span>{equipment.year}</span>
             </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 border-t bg-muted/20 p-4">
           <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-full">
             <Hash className="h-3 w-3 opacity-50" />
             <span className="font-mono">{equipment.serialNumber || 'N/A'}</span>
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
