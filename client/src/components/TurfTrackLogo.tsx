import { cn } from "@/lib/utils";

interface TurfTrackLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TurfTrackLogo({ className, size = "md" }: TurfTrackLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  return (
    <div className={cn(
      "rounded-md bg-primary flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"
        )}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Triplex mower body - simplified top-down view */}
        <rect x="8" y="6" width="8" height="6" rx="1" className="fill-primary-foreground/20" />
        
        {/* Three cutting reels */}
        <circle cx="6" cy="16" r="3" className="fill-primary-foreground" />
        <circle cx="12" cy="18" r="3" className="fill-primary-foreground" />
        <circle cx="18" cy="16" r="3" className="fill-primary-foreground" />
        
        {/* Connecting arms to reels */}
        <line x1="9" y1="12" x2="6" y2="13" className="stroke-primary-foreground" />
        <line x1="12" y1="12" x2="12" y2="15" className="stroke-primary-foreground" />
        <line x1="15" y1="12" x2="18" y2="13" className="stroke-primary-foreground" />
        
        {/* Small wrench/gear accent on body */}
        <circle cx="12" cy="9" r="1.5" className="stroke-primary-foreground fill-none" strokeWidth="1" />
        <line x1="12" y1="7.5" x2="12" y2="6.5" className="stroke-primary-foreground" strokeWidth="1" />
        <line x1="12" y1="10.5" x2="12" y2="11.5" className="stroke-primary-foreground" strokeWidth="1" />
        <line x1="10.5" y1="9" x2="9.5" y2="9" className="stroke-primary-foreground" strokeWidth="1" />
        <line x1="13.5" y1="9" x2="14.5" y2="9" className="stroke-primary-foreground" strokeWidth="1" />
      </svg>
    </div>
  );
}
