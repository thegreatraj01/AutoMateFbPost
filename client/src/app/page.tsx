"use client";
import Header from "@/components/Header";
import ImageGeneratorPage from "@/components/HomePage/ImageGeneratorPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FullPageLoader } from "@/components/ui/loader";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setisLoading] = useState<boolean>(true);
  useEffect(() => {
    setisLoading(false);
  }, []);

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <>
      <ProtectedRoute>
        <Header />
        <ImageGeneratorPage />
      </ProtectedRoute>
    </>
  );
}
