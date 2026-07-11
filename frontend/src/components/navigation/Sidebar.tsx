"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, FolderTree, Network, BrainCircuit, 
  Activity, Shield, AlertTriangle, BarChart3, Settings, 
  BookOpen, Building, Cpu, Database, LogOut
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
  const { currentPlant, setCurrentPlant, user, logout } = useApp();

  return (
    <aside className="w-64 bg-[#101418] text-gray-300 flex flex-col h-screen shrink-0 border-r border-[#1E2631]">
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-[#1E2631] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-[#2563EB]" />
          <span className="font-semibold text-white tracking-wide text-sm">IndustrialGPT OS</span>
        </div>
        <div className="mt-2 relative">
          <select
            value={currentPlant}
            onChange={(e) => setCurrentPlant(e.target.value)}
            className="w-full bg-[#1A212B] text-white border border-[#263040] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2563EB] cursor-pointer appearance-none"
          >
            <option value="TX-ALPHA">Texas Plant Alpha</option>
            <option value="DE-MUNICH">Munich Factory 3</option>
            <option value="SG-UTILITY">Singapore Utility Block</option>
          </select>
          <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all-custom ${
