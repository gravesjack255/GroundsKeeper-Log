import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";
import MaintenanceLogs from "@/pages/MaintenanceLogs";
import Landing from "@/pages/Landing";
import Marketplace from "@/pages/Marketplace";
import MarketplaceDetail from "@/pages/MarketplaceDetail";
import MyListings from "@/pages/MyListings";
import Messages from "@/pages/Messages";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/equipment" component={EquipmentList} />
      <Route path="/equipment/:id" component={EquipmentDetail} />
      <Route path="/maintenance" component={MaintenanceLogs} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={MarketplaceDetail} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
