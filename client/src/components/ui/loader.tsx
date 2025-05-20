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


export function ConnectToServerLoader() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium animate-pulse">Connecting to server...</p>
      </div>
    </div>
  );
}
