import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { useMarketplaceListings } from "@/hooks/use-marketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, Calendar, Wrench } from "lucide-react";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: listings, isLoading } = useMarketplaceListings(debouncedSearch);

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounce search
    setTimeout(() => setDebouncedSearch(value), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-marketplace-title">
                Equipment Marketplace
              </h1>
              <p className="text-sm text-muted-foreground">
                Browse quality used golf course equipment with verified maintenance history
              </p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, make, or model..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-marketplace-search"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                  <Card className="cursor-pointer hover-elevate h-full" data-testid={`card-listing-${listing.id}`}>
                    <CardContent className="p-4">
                      {listing.equipment.imageUrl ? (
                        <img
                          src={listing.equipment.imageUrl}
                          alt={listing.equipment.name}
                          className="h-40 w-full object-cover rounded-md mb-4"
                        />
                      ) : (
                        <div className="h-40 w-full bg-muted rounded-md mb-4 flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg truncate" data-testid={`text-listing-name-${listing.id}`}>
                          {listing.equipment.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.equipment.make} {listing.equipment.model} • {listing.equipment.year}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wrench className="h-4 w-4" />
                          <span>{listing.equipment.currentHours} hrs</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xl font-bold text-primary" data-testid={`text-listing-price-${listing.id}`}>
                            ${Number(listing.askingPrice).toLocaleString()}
                          </span>
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(listing.createdAt!).toLocaleDateString()}
                          </Badge>
                        </div>
                        {listing.sellerName && (
                          <p className="text-xs text-muted-foreground">
                            Listed by {listing.sellerName}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground">
                {search
                  ? "Try adjusting your search terms"
                  : "Be the first to list equipment for sale!"}
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
