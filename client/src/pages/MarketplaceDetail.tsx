import { useState } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { useMarketplaceListing, useSendMessage, useMessages } from "@/hooks/use-marketplace";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  Wrench, 
  Clock, 
  User, 
  Mail, 
  DollarSign,
  FileText,
  MapPin,
  MessageSquare,
  Send
} from "lucide-react";
import { format } from "date-fns";

export default function MarketplaceDetail() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const { data: listing, isLoading, error } = useMarketplaceListing(listingId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const sendMessage = useSendMessage();
  
  const isOwnListing = !!(listing && user && listing.sellerId === user.id);
  const sellerId = listing?.sellerId || '';
  const shouldFetchMessages = !isOwnListing && !!listingId && !!sellerId;
  const { data: messages } = useMessages(
    shouldFetchMessages ? listingId : 0,
    shouldFetchMessages ? sellerId : ''
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !listing) return;
    
    sendMessage.mutate({
      listingId,
      receiverId: listing.sellerId,
      content: newMessage.trim(),
    }, {
      onSuccess: () => {
        setNewMessage('');
        toast({ title: "Message sent to seller" });
      },
      onError: () => {
        toast({ title: "Failed to send message", variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Listing not found</h3>
            <p className="text-muted-foreground mb-4">
              This listing may have been removed or sold.
            </p>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const totalMaintenanceCost = listing.maintenanceLogs.reduce(
    (sum, log) => sum + Number(log.cost || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-4" data-testid="button-back-to-marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {listing.equipment.imageUrl ? (
            <img
              src={listing.equipment.imageUrl.startsWith('/objects/uploads/') ? listing.equipment.imageUrl : `/objects/uploads/${listing.equipment.imageUrl.replace(/^.*uploads\//, '')}`}
              alt={listing.equipment.name}
              className="w-full h-80 object-cover aspect-video rounded-lg bg-muted"
              style={{ aspectRatio: '16/9' }}
            />
          ) : (
            <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
              <Wrench className="h-24 w-24 text-muted-foreground" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-listing-detail-name">
                {listing.equipment.name}
              </h1>
              <p className="text-muted-foreground">
                {listing.equipment.make} {listing.equipment.model} • {listing.equipment.year}
              </p>
            </div>

            <div className="text-3xl font-bold text-primary" data-testid="text-listing-detail-price">
              ${Number(listing.askingPrice).toLocaleString()}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {listing.equipment.currentHours} hours
              </Badge>
              {listing.location && (
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {listing.location}
                </Badge>
              )}
              {listing.equipment.serialNumber && (
                <Badge variant="outline">
                  SN: {listing.equipment.serialNumber}
                </Badge>
              )}
            </div>

            {listing.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Seller Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid="text-listing-description">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Seller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.sellerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.sellerName}</span>
                  </div>
                )}
                {listing.contactInfo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-listing-contact">{listing.contactInfo}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Listed on {format(new Date(listing.createdAt!), "MMMM d, yyyy")}
                </p>
                
                {!isOwnListing && (
                  <div className="pt-2 border-t space-y-2">
                    {messages && messages.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        You have an ongoing conversation with this seller.{" "}
                        <Link href="/messages" className="text-primary hover:underline">
                          View messages
                        </Link>
                      </div>
                    )}
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send a message to the seller..."
                      className="resize-none"
                      rows={3}
                      data-testid="input-contact-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessage.isPending}
                      className="w-full"
                      data-testid="button-send-to-seller"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                )}
                
                {isOwnListing && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      This is your listing.{" "}
                      <Link href="/my-listings" className="text-primary hover:underline">
                        Manage your listings
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Maintenance History
                </CardTitle>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total maintenance spent</div>
                  <div className="text-lg font-bold text-primary">
                    ${totalMaintenanceCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {listing.maintenanceLogs.length > 0 ? (
                <div className="space-y-4">
                  {listing.maintenanceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              log.type === "Repair"
                                ? "destructive"
                                : log.type === "Routine"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {log.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm">{log.description}</p>
                        {log.performedBy && (
                          <p className="text-xs text-muted-foreground">
                            By: {log.performedBy}
                          </p>
                        )}
                        {log.hoursAtService && (
                          <p className="text-xs text-muted-foreground">
                            At {log.hoursAtService} hours
                          </p>
                        )}
                        {log.createdAt && (
                          <p className="text-xs text-muted-foreground/60">
                            Logged {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          ${Number(log.cost || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-2" />
                  <p>No maintenance records available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
