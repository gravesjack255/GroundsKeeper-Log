import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, Wrench, LogOut, ShoppingCart, MessageSquare, Package, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadMessageCount } from "@/hooks/use-marketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TurfTrackLogo } from "@/components/TurfTrackLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: unreadData } = useUnreadMessageCount();
  const unreadCount = unreadData?.count || 0;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/equipment", label: "Equipment", icon: PenTool },
    { href: "/maintenance", label: "Logs", icon: Wrench },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
    { href: "/messages", label: "Inbox", icon: Inbox, badge: unreadCount },
  ];

  const userInitials = user 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
    : 'U';

  const userName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'
    : 'User';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <TurfTrackLogo size="md" />
          <span className="hidden font-display text-xl font-bold text-primary md:inline-block">
            TurfTrack
          </span>
        </Link>
        <nav className="flex items-center space-x-1 md:space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const showBadge = 'badge' in item && item.badge && item.badge > 0;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:text-primary",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs px-1"
                    data-testid="badge-unread-messages"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2" data-testid="button-user-menu">
                <div className="text-xs text-muted-foreground hidden md:block text-right">
                  <div className="font-medium text-foreground">{userName}</div>
                </div>
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={userName}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-primary/10 border border-border flex items-center justify-center">
                    <span className="font-bold text-xs text-primary">{userInitials}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg backdrop-blur-none">
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{userName}</div>
                {user?.email && (
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my-listings" className="flex items-center gap-2 cursor-pointer" data-testid="link-my-listings">
                  <Package className="h-4 w-4" />
                  My Listings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="flex items-center gap-2 cursor-pointer" data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
