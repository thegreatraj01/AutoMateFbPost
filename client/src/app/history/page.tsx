import Header from "@/components/Header";
import History from "@/components/History";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const page = () => {
  return (
    <ProtectedRoute>
      <Header />
      <History />
    </ProtectedRoute>
  );
};

export default page;
