import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string; // optional for accessibility
}

// ✅ Reusable Spinner Component
export const Loader = ({ size = 24, className, label }: LoaderProps) => {
  return (
    <Loader2
      role="status"
      aria-label={label || "Loading"}
      className={cn("animate-spin text-muted-foreground", className)}
      style={{ width: size, height: size }}
    />
  );
};

// ✅ Full Page Loader with "Loading..."
export const FullPageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Loader size={48} className="mb-4 text-primary" label="Page loading" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

// ✅ Cold Start / Server Connection Loader
export function ConnectToServerLoader() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
        <Loader
          size={40}
          className="text-primary"
          label="Connecting to server"
        />
        <p className="text-sm text-muted-foreground text-center max-w-md">
          ⚡ This is a free Render server with cold start. Please wait around{" "}
          <span className="font-semibold">15 seconds</span>.
          <br />
          <p className="text-xl text-red-400 font-semibold">
            In the meantime, you can explore the codebase{" "}
            <a
              href="https://github.com/thegreatraj01/AutoMateFbPost"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:opacity-80"
            >
              here
            </a>
            .
          </p>
        </p>
        <p className="text-lg font-medium animate-pulse">
          Connecting to server...
        </p>
      </div>
    </div>
  );
}
