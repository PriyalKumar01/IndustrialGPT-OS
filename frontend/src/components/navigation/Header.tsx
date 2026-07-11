"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Search, Laptop, Menu } from "lucide-react";
import Link from "next/link";
import NotificationCenter from "./NotificationCenter";
import { UserRole } from "@/services/types";

export default function Header() {
  const pathname = usePathname();
  const { 
    user, 
    users, 
    switchRole, 
    executiveMode, 
    setExecutiveMode, 
    setCommandPaletteOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useApp();

  // Convert pathname to breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(p => p);
    if (parts.length === 0) return ["Operations Console", "Dashboard"];
    
    return [
      "Operations Console",
      ...parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace("-", " "))
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-subtle z-10">
      {/* Mobile Hamburger & Breadcrumb Navigation */}
      <div className="flex items-center gap-2.5 text-xs min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer shrink-0 border-0 bg-transparent"
          title="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 min-w-0 overflow-hidden text-gray-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-400">/</span>}
                <span 
                  className={`truncate ${
                    isLast 
                      ? "font-semibold text-gray-900" 
                      : "hover:text-gray-900 transition-all duration-200 cursor-pointer"
                  }`}
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Command Bar / Search Input trigger (Hidden on mobile) */}
      <div 
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex w-64 lg:w-80 h-8 px-3 border border-gray-300 rounded bg-gray-50 hover:bg-white items-center justify-between text-gray-500 hover:text-gray-700 cursor-pointer transition-all duration-200 shrink-0 text-xs"
      >
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          <span>Search documents, tags, permits...</span>
        </div>
        <kbd className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[9px] font-mono shadow-sm">
          CTRL K
        </kbd>
      </div>

      {/* Controls & User Profile Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Executive Mode Selector Toggle (Hidden on mobile/tablet) */}
        <div className="hidden lg:flex items-center gap-1 border border-gray-200 rounded p-0.5 bg-gray-50 text-[11px] font-medium">
          {(["operator", "manager", "executive"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setExecutiveMode(mode)}
              className={`px-2 py-1 rounded capitalize transition-all duration-200 focus:outline-none ${
                executiveMode === mode
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* RBAC Role Switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-500 font-medium hidden sm:inline">RBAC Role:</span>
          <select
            value={user.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-white border border-gray-300 rounded px-1.5 py-1 font-semibold text-gray-800 focus:outline-none focus:border-[#2563EB] cursor-pointer text-xs max-w-[130px] sm:max-w-none"
          >
            {users.map(u => (
              <option key={u.id} value={u.role}>{u.role}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden xs:block" />

        {/* Notifications Bell */}
        <NotificationCenter />

        {/* System Health Status Page link */}
        <Link 
          href="/system" 
          title="System Health & Architecture"
          className={`p-1.5 rounded hover:bg-gray-100 transition-all duration-200 ${pathname === "/system" ? "text-[#2563EB] bg-blue-50" : "text-gray-500"}`}
        >
          <Laptop className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
