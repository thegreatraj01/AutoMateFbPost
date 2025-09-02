"use client";
import { useAppSelector } from "@/hooks/reduxHooks";
import React from "react";

interface AdminProps {
  children: React.ReactNode;
}

function CheckAdmin({ children }: AdminProps) {
  const loginUser = useAppSelector((state) => state.user.user);
  //   console.log(loginUser);
  if (!loginUser || loginUser.email !== "rajballavkumar1432@gmail.com") {
    return (
      <div className="text-center text-2xl font-bold mt-20">Access Denied</div>
    );
  }

  return <div>{children}</div>;
}

export default CheckAdmin;
