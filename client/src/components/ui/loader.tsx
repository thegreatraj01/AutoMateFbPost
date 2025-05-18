import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
}

// ✅ Reusable Spinner Component
export const Loader = ({ size = 24, className }: LoaderProps) => {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      style={{ width: size, height: size }}
    />
  );
};

// ✅ Full Page Loader with "Loading..."
export const FullPageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Loader size={48} className="mb-4 text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};
