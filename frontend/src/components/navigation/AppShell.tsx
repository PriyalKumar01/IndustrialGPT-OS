"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import { Building, Cpu, RefreshCw, ShieldAlert } from "lucide-react";
import { UserRole } from "@/services/types";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout, users } = useApp();
  const [email, setEmail] = useState("d.chen@industrialgpt.os");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Operations Manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate security handshakes
    await new Promise(r => setTimeout(r, 1000));
    
    const success = await login(email, selectedRole);
    setLoading(false);
    if (!success) {
      setError("Authentication failed. Invalid email credentials or role mismatch.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#F7F8FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-250 rounded-sharp shadow-panel overflow-hidden flex flex-col">
          {/* Logo Brand Header */}
          <div className="bg-[#101418] p-6 text-center border-b border-[#1E2631] flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-[#2563EB]" />
              <span className="font-bold text-lg text-white tracking-wide">IndustrialGPT OS</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enterprise Authentication Gate</span>
          </div>

          {/* Form container */}
          <form onSubmit={handleSignIn} className="p-6 flex flex-col gap-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] rounded-sharp font-semibold">
                {error}
              </div>
            )}

            {/* Email input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-medium">Enterprise Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-[#2563EB] bg-white text-gray-900"
                placeholder="e.g. name@industrialgpt.os"
              />
            </div>

            {/* Role select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-medium">Designated Session Role (RBAC):</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as UserRole);
                  const found = users.find(u => u.role === e.target.value);
                  if (found) setEmail(found.email);
                }}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-[#2563EB] bg-white text-gray-950 cursor-pointer font-semibold"
              >
                {users.map(u => (
                  <option key={u.id} value={u.role}>{u.role}</option>
                ))}
              </select>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded py-2.5 font-bold shadow-sm focus:outline-none flex items-center justify-center gap-2 cursor-pointer transition-all-custom"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Establishing secure connection...</span>
                </>
              ) : (
                <span>Authenticate & Establish Session</span>
              )}
            </button>
          </form>

          {/* Footer security labels */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400 select-none">
            This terminal is protected by JWT access tokens. Authorized access only.
            <div className="font-bold text-gray-500 mt-1 uppercase tracking-wider">Audit logging is active</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header />
        
        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] p-6">
          {children}
        </main>
      </div>
      
      {/* Command Palette Overlay */}
      <CommandPalette />
    </div>
  );
}
