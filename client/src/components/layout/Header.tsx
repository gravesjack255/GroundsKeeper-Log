import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/equipment", label: "Equipment Fleet", icon: PenTool },
    { href: "/maintenance", label: "Maintenance Logs", icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-display text-xl font-bold text-primary md:inline-block">
            TurfTrack
          </span>
        </Link>
        <nav className="flex items-center space-x-1 md:space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:text-primary",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-xs text-muted-foreground hidden md:block">
            Superintendent View
          </div>
          <div className="size-8 rounded-full bg-secondary border border-border flex items-center justify-center">
             <span className="font-bold text-xs text-secondary-foreground">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
