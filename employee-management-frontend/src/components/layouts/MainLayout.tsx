import React from "react";
import { Outlet } from "react-router";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import { Toaster } from "@/components/ui/sonner";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content min-h-[85vh] container mx-auto flex max-w-screen-xl">
        <Outlet />
        {children}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default MainLayout;
