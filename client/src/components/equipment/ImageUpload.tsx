import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }

      const data = await res.json();
      onChange(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-image-file"
      />

      {value ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
          <img
            src={value}
            alt="Equipment"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
            data-testid="button-remove-image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full aspect-video rounded-lg border-2 border-dashed border-border",
            "flex flex-col items-center justify-center gap-2",
            "bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
            "text-muted-foreground hover:text-foreground",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
          data-testid="button-upload-image"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Camera className="h-8 w-8" />
              <span className="text-sm font-medium">Add Photo</span>
              <span className="text-xs">Click to select from your library</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
