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
                      </div>
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span className="font-mono">{int.recordsSynced.toLocaleString()} logs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Synced:</span>
                        <span className="font-mono">{int.syncDate === "Never" ? "Never" : new Date(int.syncDate).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Sync Trigger */}
                    {int.connected && (
                      <button
                        onClick={() => handleSync(int.id)}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center gap-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-1 rounded text-[11px] font-semibold focus:outline-none"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                        <span>{isSyncing ? "Syncing..." : "Sync Database"}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Model Hyperparameter Manager */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle shrink-0">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">AI Model hyperparameter Manager</span>
            
            <form onSubmit={handleSaveModelConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Model Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium">Core Reasoning Model (LLM):</label>
                  <select
                    value={tempConfig.currentModel}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, currentModel: e.target.value }))}
                    className="border border-gray-300 rounded p-2 focus:outline-none focus:border-[#2563EB] bg-white cursor-pointer"
                  >
                    <option value="Gemini 1.5 Pro (Enterprise)">Gemini 1.5 Pro (Enterprise)</option>
                    <option value="Gemini 1.5 Flash (Fast)">Gemini 1.5 Flash (Fast)</option>
                    <option value="GPT-4o (OpenAI Cloud)">GPT-4o (OpenAI Cloud)</option>
                  </select>
                </div>

                {/* Embedding Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium">Vector Embedding Model:</label>
                  <select
                    value={tempConfig.embeddingModel}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, embeddingModel: e.target.value }))}
                    className="border border-gray-300 rounded p-2 focus:outline-none focus:border-[#2563EB] bg-white cursor-pointer"
                  >
                    <option value="Text-Embedding-004 (Google)">Text-Embedding-004 (Google)</option>
                    <option value="text-embedding-3-large (OpenAI)">text-embedding-3-large (OpenAI)</option>
                  </select>
                </div>

              </div>

              {/* Temperature Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-medium">
                  <label className="text-gray-500">Model Temperature (Creativity vs Safety):</label>
                  <span className="font-mono font-bold text-gray-900">{tempConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={tempConfig.temperature}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              {/* Model Billing Rates */}
              <div className="grid grid-cols-2 gap-4 text-[11px] bg-gray-50 border border-gray-150 p-2.5 rounded font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Context limit:</span>
                  <span className="font-mono text-gray-900">1.04M tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Prompt schema:</span>
                  <span className="font-mono text-gray-900">{tempConfig.promptVersion}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold shadow-sm focus:outline-none"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Configs</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side: RBAC Matrix */}
        <div className="w-96 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#2563EB]" />
              <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">RBAC permissions Matrix</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Security Rule Mapping</span>
            
            <div className="space-y-3.5">
              {permissionsMatrix.map((row) => (
                <div key={row.permission} className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-950">{row.permission}</span>
                    <span className="text-[10.5px] text-gray-500 leading-normal mt-0.5">{row.desc}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {row.roles.map(role => (
                      <span key={role} className="bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                        {role.split(" ").map(w => w[0]).join("")} {/* Abbreviated roles */}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-500 leading-normal">
              ℹ️ Role abbreviation legend:
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 font-bold font-mono">
                <div>PO: Operator</div>
                <div>ME: Engineer</div>
                <div>CO: Compliance</div>
                <div>OM: Manager</div>
                <div>PA: Admin</div>
                <div>EX: Executive</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
