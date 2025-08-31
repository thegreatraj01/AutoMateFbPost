import Header from "@/components/Header";
import MysticGenrator from "@/components/MysticGenrator";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

function page() {
  return (
    <ProtectedRoute>
      <Header />
      <MysticGenrator />
    </ProtectedRoute>
  );
}

export default page;
