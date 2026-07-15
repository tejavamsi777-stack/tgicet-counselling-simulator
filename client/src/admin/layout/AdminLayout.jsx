import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // Changed to ./ since they are in the same folder
import Topbar from "./Topbar";   // Changed to ./ since they are in the same folder
import "./admin-theme.css";              // Keeps theme styles isolated in this layout folder

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    /* The wrapping class limits all Liquid Glass behavior to the admin tree */
    <div className="admin-theme relative min-h-screen overflow-x-hidden selection:bg-brand-500/30 selection:text-white">
      
      {/* Background ambient glows */}
      <div className="ambient-glow bg-blue-600/10 -top-[10%] -right-[10%]" />
      <div className="ambient-glow bg-brand-500/10 -bottom-[10%] -left-[10%]" />

      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="md:pl-64">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="relative z-10 p-6 max-w-7xl mx-auto">
          {/* This renders DashboardPage, CollegesPage, etc. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}