"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, FolderTree, Network, BrainCircuit, 
  Activity, Shield, BarChart3, Settings, 
  BookOpen, Building, Cpu, LogOut, ChevronLeft, ChevronRight, X
} from "lucide-react";

interface SidebarProps {}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Knowledge Hub", href: "/hub", icon: BookOpen },
  { name: "Document Center", href: "/documents", icon: FolderTree },
  { name: "Knowledge Graph", href: "/graph", icon: Network },
  { name: "AI Workspace", href: "/copilot", icon: BrainCircuit },
  { name: "Maintenance Intelligence", href: "/maintenance", icon: Activity },
  { name: "Compliance Center", href: "/compliance", icon: Shield },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings }
];

export default function Sidebar({}: SidebarProps) {
  const pathname = usePathname();
  const { 
    currentPlant, 
    setCurrentPlant, 
    user, 
    logout,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useApp();

  return (
    <aside className={`bg-[#101418] text-gray-300 flex flex-col h-screen shrink-0 border-r border-[#1E2631] transition-all duration-300 ease-in-out
      fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0
      ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      ${sidebarCollapsed ? "w-16" : "w-64"}
    `}>
      {/* Workspace Switcher & Title */}
      <div className="p-4 border-b border-[#1E2631] flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building className="h-5 w-5 text-[#2563EB] shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-semibold text-white tracking-wide text-sm truncate animate-fade-in">
                IndustrialGPT OS
              </span>
            )}
          </div>
          {/* Collapse/Expand button on Desktop */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded hover:bg-[#1A212B] text-gray-400 hover:text-white cursor-pointer transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Close button on Mobile */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden h-6 w-6 flex items-center justify-center rounded hover:bg-[#1A212B] text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Plant Switcher Dropdown */}
        {!sidebarCollapsed && (
          <div className="mt-2 relative animate-fade-in">
            <select
              value={currentPlant}
              onChange={(e) => setCurrentPlant(e.target.value)}
              className="w-full bg-[#1A212B] text-white border border-[#263040] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2563EB] cursor-pointer appearance-none"
            >
              <option value="TX-ALPHA">Texas Plant Alpha</option>
              <option value="DE-MUNICH">Munich Factory 3</option>
              <option value="SG-UTILITY">Singapore Utility Block</option>
            </select>
            <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400 text-[10px]">
              ▼
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)} // Auto-close sidebar drawer on mobile nav
              title={sidebarCollapsed ? item.name : undefined}
              className={`flex items-center rounded text-sm font-medium transition-all duration-200 ${
                sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-[#263040] text-white border-l-2 border-[#2563EB]"
                  : "hover:bg-[#1A212B] hover:text-white text-gray-400"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-[#2563EB]" : "text-gray-400"}`} />
              {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Live AI Agent Monitor Widget */}
      {!sidebarCollapsed && (
        <div className="p-3 mx-3 my-2 bg-[#1A212B] border border-[#263040] rounded flex flex-col gap-2 shrink-0 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#16A34A] animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-white tracking-wider">Multi-Agent Engine</span>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#16A34A]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#16A34A]">
              Active
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[11px] text-gray-400">
            <div className="flex justify-between">
              <span>Planner status:</span>
              <span className="text-white font-mono">IDLE</span>
            </div>
            <div className="flex justify-between">
              <span>Graph syncing:</span>
              <span className="text-white font-mono">100%</span>
            </div>
            <div className="w-full bg-[#263040] h-1 rounded overflow-hidden">
              <div className="bg-[#2563EB] h-full w-[100%]" />
            </div>
          </div>
        </div>
      )}

      {/* User Information Profile Footer */}
      <div className={`p-4 border-t border-[#1E2631] bg-[#0c0f12] flex items-center justify-between gap-3 shrink-0
        ${sidebarCollapsed ? "justify-center" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-[#263040] flex items-center justify-center font-bold text-white text-xs shrink-0 border border-[#2563EB]"
               title={`${user.name} (${user.role})`}>
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex flex-col animate-fade-in">
              <span className="text-xs font-semibold text-white truncate leading-tight">{user.name}</span>
              <span className="text-[10px] text-gray-500 truncate leading-none mt-1">{user.role}</span>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/settings" title="Open Settings" className="text-gray-500 hover:text-white shrink-0">
              <Settings className="h-4 w-4" />
            </Link>
            <button 
              onClick={logout} 
              title="Sign out of portal" 
              className="text-gray-500 hover:text-red-400 shrink-0 cursor-pointer focus:outline-none bg-transparent border-0 p-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}