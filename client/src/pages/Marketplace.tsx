import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { useMarketplaceListings } from "@/hooks/use-marketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart, Calendar, Wrench, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: listings, isLoading } = useMarketplaceListings({
    search: debouncedSearch,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    distance: maxDistance,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounce search
    setTimeout(() => setDebouncedSearch(value), 300);
  };

  const getMyLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
          toast({
            title: "Location detected",
            description: "Now showing distance to listings",
          });
        },
        (error) => {
          setLocationLoading(false);
          toast({
            title: "Location unavailable",
            description: "Could not get your location. Please try again.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
    }
  };

  const handleDistanceChange = (value: string) => {
    if (value === "any") {
      setMaxDistance(undefined);
    } else {
      setMaxDistance(parseInt(value));
      // Auto-get location if filtering by distance
      if (!userLocation) {
        getMyLocation();
      }
    }
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, make, model, or location..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                data-testid="input-marketplace-search"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={getMyLocation}
                disabled={locationLoading}
                data-testid="button-get-location"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span className="ml-2">{userLocation ? "Location Set" : "Use My Location"}</span>
              </Button>
              <Select
                value={maxDistance?.toString() || "any"}
                onValueChange={handleDistanceChange}
              >
                <SelectTrigger className="w-36" data-testid="select-distance">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Distance</SelectItem>
                  <SelectItem value="50">Within 50 mi</SelectItem>
                  <SelectItem value="100">Within 100 mi</SelectItem>
                  <SelectItem value="250">Within 250 mi</SelectItem>
                  <SelectItem value="500">Within 500 mi</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                          src={listing.equipment.imageUrl.startsWith('/objects/uploads/') ? listing.equipment.imageUrl : `/objects/uploads/${listing.equipment.imageUrl.replace(/^.*uploads\//, '')}`}
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
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4" />
                            <span>{listing.equipment.currentHours} hrs</span>
                          </div>
                          {listing.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-24">{listing.location}</span>
                            </div>
                          )}
                        </div>
                        {listing.distance !== undefined && (
                          <Badge variant="outline" className="w-fit">
                            {listing.distance} miles away
                          </Badge>
                        )}
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
