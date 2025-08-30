"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { setUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/ui/loader";
import { isAxiosError } from "axios";
import { clearUser } from "@/store/slices/userSlice";

function GetLoginUser({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLogedIn = localStorage.getItem("isLogedIn") === "true";

    // If user is not logged in, directly push to login page
    if (!isLogedIn) {
      router.push("/login");
      setLoading(false);
      return;
    }

    // Otherwise fetch user details
    const fetchLoginUser = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.status === 200 && res.data?.data?.user) {
          dispatch(setUser(res.data.data.user));
        }
      } catch (err) {
        if (isAxiosError(err) && err?.response?.data) {
          if (
            err.response.data?.message === "Unauthorized: No token provided"
          ) {
            localStorage.setItem("isLogedIn", "false");
            dispatch(clearUser());
            router.push("/login");
          }
          console.error("Failed to fetch login user:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoginUser();
  }, [dispatch, router]);

  if (loading) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}

export default GetLoginUser;
