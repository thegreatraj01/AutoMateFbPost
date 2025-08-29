"use client";

import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const isLogedIn = localStorage.getItem("isLogedIn");

    if (isLogedIn === "true") {
      // redirect to home
      router.push("/");
    } else {
      // show login/register page
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    // 👇 blank page (or you can replace with loader if you want)
    return <div></div>;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
