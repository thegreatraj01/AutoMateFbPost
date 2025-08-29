"use client";
// import { useAppSelector } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FullPageLoader } from "./ui/loader";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // const loginUser = useAppSelector((state) => state.user.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const isLogedIn = localStorage.getItem("isLogedIn");
  // console.log(isLogedIn);

  useEffect(() => {
    if (isLogedIn != "true") {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
