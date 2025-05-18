"use client";
import GetLoginUser from "@/components/GetLoginUser";
import Header from "@/components/Header";
import HomePage from "@/components/HomePage";
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
        <HomePage />
      </ProtectedRoute>
    </>
  );
}
