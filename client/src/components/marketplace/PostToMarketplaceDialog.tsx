import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMarketplaceListing } from "@/hooks/use-marketplace";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";

const postToMarketplaceSchema = z.object({
  askingPrice: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Price must be a positive number"
  ),
  description: z.string().optional(),
  contactInfo: z.string().min(1, "Contact information is required"),
});

type PostToMarketplaceFormData = z.infer<typeof postToMarketplaceSchema>;

interface PostToMarketplaceDialogProps {
  equipmentId: number;
  equipmentName: string;
  trigger?: React.ReactNode;
}

export function PostToMarketplaceDialog({
  equipmentId,
  equipmentName,
  trigger,
}: PostToMarketplaceDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createListing = useCreateMarketplaceListing();

  const form = useForm<PostToMarketplaceFormData>({
    resolver: zodResolver(postToMarketplaceSchema),
    defaultValues: {
      askingPrice: "",
      description: "",
      contactInfo: "",
    },
  });

  const onSubmit = async (data: PostToMarketplaceFormData) => {
    try {
      await createListing.mutateAsync({
        equipmentId,
        askingPrice: data.askingPrice,
        description: data.description || null,
        contactInfo: data.contactInfo || null,
        sellerName: null,
      });
      toast({
        title: "Listed successfully",
        description: `${equipmentName} has been posted to the marketplace.`,
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to create listing",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid={`button-post-to-marketplace-${equipmentId}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Post to Marketplace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post to Marketplace</DialogTitle>
          <DialogDescription>
            List "{equipmentName}" for sale on the marketplace with full maintenance history visible to potential buyers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="askingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asking Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      data-testid="input-listing-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email or phone number"
                      {...field}
                      data-testid="input-listing-contact"
                    />
                  </FormControl>
                  <FormDescription>
                    How buyers can reach you about this listing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about the equipment condition, reason for selling, etc."
                      {...field}
                      data-testid="input-listing-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-listing"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createListing.isPending}
                data-testid="button-submit-listing"
              >
                {createListing.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Post Listing
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
