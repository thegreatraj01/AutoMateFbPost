"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { ConnectToServerLoader } from "./ui/loader";

type ConnectToServerProps = {
  children: React.ReactNode;
};

function ConnectToServer({ children }: ConnectToServerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let interval: NodeJS.Timeout;

    const tryConnect = async () => {
      try {
        const res = await api.get("/healthcheck");
        if (res.status === 200) {
          setIsConnected(true);
          clearInterval(interval);
        } else {
          retryCount++;
          if (retryCount >= maxRetries) {
            setHasError(true);
            clearInterval(interval);
          }
        }
      } catch (err) {
        retryCount++;
        console.error("Healthcheck failed:", err);
        if (retryCount >= maxRetries) {
          setHasError(true);
          clearInterval(interval);
        }
      }
    };

    // Initial call
    tryConnect();

    // Retry every 3 seconds
    interval = setInterval(tryConnect, 3000);

    return () => clearInterval(interval);
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-center p-4">
        <p className="text-red-600 text-lg font-semibold">
          Unable to connect to the server. Please try again later.
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectToServerLoader />;
  }

  return <>{children}</>;
}

export default ConnectToServer;
