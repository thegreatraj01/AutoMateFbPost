import Header from "@/components/Header";
import HistoryAdminPage from "@/components/HistoryAdmin";
import ProtectedRoute from "@/components/ProtectedRoute";
import CheckAdmin from "@/components/ui/CheckAdmin";
import React from "react";

const page = () => {
  return (
    <ProtectedRoute>
      <CheckAdmin>
        <Header />
        <HistoryAdminPage />
      </CheckAdmin>
    </ProtectedRoute>
  );
};

export default page;
