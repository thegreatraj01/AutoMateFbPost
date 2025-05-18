"use client";

import Header from "@/components/Header";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FullPageLoader } from "@/components/ui/loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (user) {
      router.push("/");
    } else {
      setCheckingAuth(false);
    }
  }, [user, router]);

  if (checkingAuth) {
    return <FullPageLoader />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
