import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyListings, useUpdateListingStatus, useRemoveMarketplaceListing } from "@/hooks/use-marketplace";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Package, 
  DollarSign, 
  MapPin, 
  CheckCircle, 
  Trash2, 
  Eye,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
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

export default function MyListings() {
  const { data: listings, isLoading } = useMyListings();
  const updateStatus = useUpdateListingStatus();
  const removeListing = useRemoveMarketplaceListing();
  const { toast } = useToast();

  const handleMarkSold = (id: number) => {
    updateStatus.mutate({ id, status: 'sold' }, {
      onSuccess: () => {
        toast({ title: "Listing marked as sold" });
      },
      onError: () => {
        toast({ title: "Failed to update listing", variant: "destructive" });
      },
    });
  };

  const handleReactivate = (id: number) => {
    updateStatus.mutate({ id, status: 'active' }, {
      onSuccess: () => {
        toast({ title: "Listing reactivated" });
      },
      onError: () => {
        toast({ title: "Failed to reactivate listing", variant: "destructive" });
      },
    });
  };

  const handleDelete = (id: number) => {
    removeListing.mutate(id, {
      onSuccess: () => {
        toast({ title: "Listing deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete listing", variant: "destructive" });
      },
    });
  };

  const activeListings = listings?.filter(l => l.status === 'active') || [];
  const soldListings = listings?.filter(l => l.status === 'sold') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">My Marketplace Listings</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't posted any equipment to the marketplace.
            </p>
            <Link href="/equipment">
              <Button data-testid="button-go-to-equipment">View My Equipment</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {activeListings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <span>{activeListings.length} listing{activeListings.length !== 1 ? 's' : ''}</span>
                </h2>
                <div className="space-y-4">
                  {activeListings.map((listing) => (
                    <Card key={listing.id} data-testid={`listing-card-${listing.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {listing.equipment.imageUrl ? (
                            <img
                              src={listing.equipment.imageUrl.startsWith('/objects/uploads/') ? listing.equipment.imageUrl : `/objects/uploads/${listing.equipment.imageUrl.replace(/^.*uploads\//, '')}`}
                              alt={listing.equipment.name}
                              className="w-full md:w-32 h-24 object-cover aspect-video rounded-lg bg-muted"
                              style={{ aspectRatio: '16/9' }}
                            />
                          ) : (
                            <div className="w-full md:w-32 h-24 bg-muted rounded-md flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{listing.equipment.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {listing.equipment.make} {listing.equipment.model} • {listing.equipment.year}
                                </p>
                              </div>
                              <div className="text-lg font-bold text-primary flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {Number(listing.askingPrice).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {listing.location && (
                                <Badge variant="secondary" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {listing.location}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Listed {format(new Date(listing.createdAt!), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-2">
                            <Link href={`/marketplace/${listing.id}`}>
                              <Button variant="outline" size="sm" data-testid={`button-view-${listing.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkSold(listing.id)}
                              disabled={updateStatus.isPending}
                              data-testid={`button-mark-sold-${listing.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Sold
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" data-testid={`button-delete-${listing.id}`}>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove this listing from the marketplace. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(listing.id)}
                                    data-testid={`button-confirm-delete-${listing.id}`}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {soldListings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="secondary">Sold</Badge>
                  <span>{soldListings.length} listing{soldListings.length !== 1 ? 's' : ''}</span>
                </h2>
                <div className="space-y-4">
                  {soldListings.map((listing) => (
                    <Card key={listing.id} className="opacity-75" data-testid={`listing-card-sold-${listing.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {listing.equipment.imageUrl ? (
                            <img
                              src={listing.equipment.imageUrl.startsWith('/objects/uploads/') ? listing.equipment.imageUrl : `/objects/uploads/${listing.equipment.imageUrl.replace(/^.*uploads\//, '')}`}
                              alt={listing.equipment.name}
                              className="w-full md:w-32 h-24 object-cover aspect-video rounded-lg bg-muted grayscale"
                              style={{ aspectRatio: '16/9' }}
                            />
                          ) : (
                            <div className="w-full md:w-32 h-24 bg-muted rounded-md flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{listing.equipment.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {listing.equipment.make} {listing.equipment.model} • {listing.equipment.year}
                                </p>
                              </div>
                              <div className="text-lg font-bold text-muted-foreground flex items-center gap-1 line-through">
                                <DollarSign className="h-4 w-4" />
                                {Number(listing.askingPrice).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sold
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivate(listing.id)}
                              disabled={updateStatus.isPending}
                              data-testid={`button-reactivate-${listing.id}`}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Relist
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" data-testid={`button-delete-sold-${listing.id}`}>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove this listing. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(listing.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
