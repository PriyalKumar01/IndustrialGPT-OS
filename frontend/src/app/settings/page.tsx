"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { SystemIntegration, AIModelConfig, UserRole } from "@/services/types";
import { 
  Settings, Database, Cpu, Users, Shield, 
  RefreshCw, CheckCircle, HelpCircle, Save, ToggleLeft, ToggleRight
} from "lucide-react";

interface PermissionRow {
  permission: string;
  desc: string;
  roles: UserRole[];
}

const permissionsMatrix: PermissionRow[] = [
  { permission: "View Telemetry", desc: "Access live SCADA telemetry & digital twins", roles: ["Plant Operator", "Maintenance Engineer", "Compliance Officer", "Operations Manager", "Plant Administrator", "Executive"] },
  { permission: "Trigger OCR Ingest", desc: "Upload manuals, P&IDs & SOPs to vector database", roles: ["Maintenance Engineer", "Operations Manager", "Plant Administrator"] },
  { permission: "Renew Permits", desc: "Apply and renew hot work or static vessel safety permits", roles: ["Compliance Officer", "Operations Manager", "Plant Administrator"] },
  { permission: "Run RCA Audits", desc: "Modify fishbone/fault trees and confirm root causes", roles: ["Maintenance Engineer", "Operations Manager", "Plant Administrator"] },
  { permission: "Manage AI Models", desc: "Switch primary LLMs, modify temperature or contexts", roles: ["Plant Administrator"] },
  { permission: "View Cost Metrics", desc: "Inspect financial ROI charts and carbon emission ratings", roles: ["Operations Manager", "Executive", "Plant Administrator"] }
];

export default function SettingsPage() {
  const { modelConfig, updateModelConfig, addNotification } = useApp();
  const [integrations, setIntegrations] = useState<SystemIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Form states
  const [tempConfig, setTempConfig] = useState<AIModelConfig>({ ...modelConfig });

  const loadSettingsData = async () => {
    const list = await apiService.getIntegrations();
    setIntegrations(list);
    setLoading(false);
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  // Sync Integration
  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      const updated = await apiService.syncIntegration(id);
      setIntegrations(prev => prev.map(int => int.id === id ? updated : int));
      addNotification({
        severity: "Information",
        type: "Agent",
        message: `Database synchronized: ${updated.name}`,
        details: `Imported ${updated.recordsSynced.toLocaleString()} active entries.`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  // Connect/Disconnect Toggle
  const handleToggleConnect = async (id: string, currentlyConnected: boolean) => {
    const nextConnected = !currentlyConnected;
    const updated = await apiService.toggleIntegrationConnection(id, nextConnected);
    setIntegrations(prev => prev.map(int => int.id === id ? updated : int));
    addNotification({
      severity: nextConnected ? "Information" : "Low",
      type: "Agent",
      message: `${updated.name} connection status modified`,
      details: nextConnected ? "Enterprise pipeline established." : "Security bridge closed."
    });
  };

  // Save AI model changes
  const handleSaveModelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateModelConfig(tempConfig);
    addNotification({
      severity: "Information",
      type: "Agent",
      message: "AI Model config updated",
      details: `Active model switched to ${tempConfig.currentModel}.`
    });
    alert("AI Model configurations saved and synced to LangGraph agent executor cluster.");
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="h-96 bg-gray-200 rounded-sharp" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#2563EB]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Enterprise Settings Console</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Control data integrations, adjust model hyperparameters, and review role-based access rights.</p>
          </div>
        </div>
      </div>

      {/* Main split viewport */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Integrations & AI Configs */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          
          {/* Integrations Hub */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle shrink-0">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Integrations Hub</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((int) => {
                const isSyncing = syncingId === int.id;
                
                return (
                  <div key={int.id} className="p-3 border border-gray-200 rounded-sharp bg-white flex flex-col justify-between gap-3 hover:bg-gray-50 transition-all-custom">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <Database className="h-4.5 w-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-xs">{int.name}</span>
                          <span className="text-[9px] text-gray-400 font-semibold">{int.type} Connector</span>
                        </div>
                      </div>
                      
                      {/* Toggle Connection button */}
                      <button 
                        onClick={() => handleToggleConnect(int.id, int.connected)}
                        className="text-gray-400 hover:text-gray-900 focus:outline-none"
                      >
                        {int.connected ? (
                          <ToggleRight className="h-6 w-6 text-[#16A34A]" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="text-[10px] text-gray-500 space-y-1 bg-gray-50 p-2 border border-gray-150 rounded font-semibold">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={int.status === "Active" || int.status === "Syncing" ? "text-green-600" : "text-gray-400"}>{int.status}</span>
