"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { setUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/ui/loader"; 

function GetLoginUser({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    const fetchLoginUser = async () => {
      try {
        const res = await api.get("/user/me");
        if (res.status === 200 && res.data?.data?.user) {
          dispatch(setUser(res.data.data.user));
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch login user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchLoginUser();
  }, [dispatch, router]);

  if (loading) {
    return <FullPageLoader />;
  }

  // if (!user) {
  //   return null; // or a fallback message if you don't want to redirect
  // }

  return <>{children}</>;
}

export default GetLoginUser;
