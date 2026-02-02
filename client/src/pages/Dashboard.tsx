import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useEquipment } from "@/hooks/use-equipment";
import { useMaintenanceLogs } from "@/hooks/use-maintenance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subMonths, startOfYear } from "date-fns";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";

type TimePeriod = 'ytd' | '6months' | 'monthly';

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6months');
  const { data: equipment, isLoading: equipLoading } = useEquipment();
  const { data: logs, isLoading: logsLoading } = useMaintenanceLogs();

  const activeCount = equipment?.filter(e => e.status === 'active').length || 0;
  const maintenanceCount = equipment?.filter(e => e.status === 'maintenance').length || 0;
  const totalCost = logs?.reduce((sum, log) => sum + Number(log.cost), 0) || 0;

  // Chart Data Preparation based on selected time period
  const getChartData = () => {
    if (!logs) return [];
    
    const now = new Date();
    
    if (timePeriod === 'ytd') {
      // Year-to-date: show each month from January to current month
      const yearStart = startOfYear(now);
      const currentMonth = now.getMonth();
      return Array.from({ length: currentMonth + 1 }).map((_, i) => {
        const date = new Date(now.getFullYear(), i, 1);
        const monthKey = format(date, 'MMM');
        const monthLogs = logs.filter(log => {
          const logDate = new Date(log.date);
          return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() === i;
        });
        const monthCost = monthLogs.reduce((sum, log) => sum + Number(log.cost), 0);
        return { name: monthKey, cost: monthCost };
      });
    } else if (timePeriod === '6months') {
      // Last 6 months
      return Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, i);
        const monthKey = format(date, 'MMM');
        const monthLogs = logs.filter(log => format(new Date(log.date), 'MMM yyyy') === format(date, 'MMM yyyy'));
        const monthCost = monthLogs.reduce((sum, log) => sum + Number(log.cost), 0);
        return { name: monthKey, cost: monthCost };
      }).reverse();
    } else {
      // Monthly: show current month breakdown by week
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const weeksData = [
        { name: 'Week 1', start: 1, end: 7 },
        { name: 'Week 2', start: 8, end: 14 },
        { name: 'Week 3', start: 15, end: 21 },
        { name: 'Week 4', start: 22, end: 31 }
      ];
      
      return weeksData.map(week => {
        const weekLogs = logs.filter(log => {
          const logDate = new Date(log.date);
          const day = logDate.getDate();
          return logDate.getMonth() === currentMonth && 
                 logDate.getFullYear() === currentYear &&
                 day >= week.start && day <= week.end;
        });
        const weekCost = weekLogs.reduce((sum, log) => sum + Number(log.cost), 0);
        return { name: week.name, cost: weekCost };
      });
    }
  };

  const chartData = getChartData();
  
  const getChartTitle = () => {
    switch (timePeriod) {
      case 'ytd': return 'Maintenance Costs (Year-to-Date)';
      case '6months': return 'Maintenance Costs (6 Months)';
      case 'monthly': return `Maintenance Costs (${format(new Date(), 'MMMM yyyy')})`;
    }
  };

  if (equipLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-8">
           <Skeleton className="h-12 w-48 mb-6" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
           </div>
           <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="text-muted-foreground">Overview of golf course fleet operations.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/equipment">
               <Button variant="outline">View All Equipment</Button>
             </Link>
             <AddEquipmentDialog />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Fleet</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeCount}</h3>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{maintenanceCount}</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
             <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Maintenance Spend</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalCost.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 shadow-sm">
             <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Services</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{logs?.slice(0, 30).length}</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{getChartTitle()}</CardTitle>
                  <CardDescription>Spending trends across the fleet.</CardDescription>
                </div>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  <Button 
                    variant={timePeriod === 'ytd' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setTimePeriod('ytd')}
                    data-testid="button-period-ytd"
                  >
                    YTD
                  </Button>
                  <Button 
                    variant={timePeriod === '6months' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setTimePeriod('6months')}
                    data-testid="button-period-6months"
                  >
                    6 Months
                  </Button>
                  <Button 
                    variant={timePeriod === 'monthly' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setTimePeriod('monthly')}
                    data-testid="button-period-monthly"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'hsl(var(--primary))' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest maintenance logs recorded.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pr-2">
              <div className="space-y-6">
                {logs?.slice(0, 5).map((log) => {
                  const equip = equipment?.find(e => e.id === log.equipmentId);
                  return (
                    <div key={log.id} className="flex gap-4 items-start">
                       <div className={
                         `mt-1 h-2 w-2 rounded-full flex-shrink-0
                          ${log.type === 'Repair' ? 'bg-red-500' : 'bg-emerald-500'}
                         `
                       } />
                       <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {equip?.name || 'Unknown Equipment'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.type} - {format(new Date(log.date), 'MMM d')}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {log.description}
                          </p>
                       </div>
                    </div>
                  );
                })}
                {logs?.length === 0 && (
                   <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                )}
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t mt-auto bg-muted/20">
              <Link href="/maintenance" className="w-full">
                <Button variant="ghost" className="w-full justify-between mt-2 text-primary hover:text-primary hover:bg-primary/10 group">
                  View All Logs 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
