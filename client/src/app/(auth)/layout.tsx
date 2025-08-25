"use client";

import Header from "@/components/Header";
// import { useAppSelector } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FullPageLoader } from "@/components/ui/loader";
// import { User } from "@/types/redux";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isLogedIn = localStorage.getItem("isLogedIn");


  useEffect(() => {
    console.log("islogedin form login" , isLogedIn);
    if (isLogedIn === "true") {
      router.push("/");
    }
  }, []);

  return (
    <>
      <Header />
      {children}
    </>
  );
}
