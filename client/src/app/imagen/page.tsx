import Header from "@/components/Header";
import ImagenGenrator from "@/components/ImagenGenrator";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

function page() {
  return (
    <div>
      <ProtectedRoute>
        <Header />
        <ImagenGenrator />
      </ProtectedRoute>
    </div>
  );
}

export default page;
