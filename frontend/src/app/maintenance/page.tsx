"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api-client";
import { AssetTwin, RootCauseAnalysis } from "@/services/types";
import { 
  Wrench, AlertTriangle, ShieldAlert, Cpu, 
  Clock, DollarSign, ChevronRight, HelpCircle, 
  Activity, CheckCircle, ListTodo, Plus, Info, Download
} from "lucide-react";
import Link from "next/link";

function MaintenanceIntelligenceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "predictive";
  const incidentId = searchParams.get("incidentId") || "INC-401";
  
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [assets, setAssets] = useState<AssetTwin[]>([]);
  const [incidents, setIncidents] = useState<RootCauseAnalysis[]>([]);
  const [activeRCA, setActiveRCA] = useState<RootCauseAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // Load datasets
  const loadData = async () => {
    const assetList = await apiService.getAssets();
    const incidentList = await apiService.getIncidentsList();
    setAssets(assetList);
    setIncidents(incidentList);
    
    const foundRca = incidentList.find(i => i.incidentId === incidentId || i.id === incidentId) || incidentList[0];
    setActiveRCA(foundRca);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  useEffect(() => {
    // Keep tab synced with query parameter
    if (tab) setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/maintenance?tab=${newTab}&incidentId=${incidentId}`);
  };

  const handleIncidentChange = (id: string) => {
    router.push(`/maintenance?tab=rca&incidentId=${id}`);
  };

  if (loading || !activeRCA) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="h-96 bg-gray-200 rounded-sharp" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Top Navigation Workspace Header */}
      <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-[#2563EB]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Maintenance & Root Cause Intelligence</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Diagnose plant outages, track failure trees, and review predictive RUL telemetry recommendations.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 border border-gray-200 p-0.5 rounded bg-gray-50 text-xs font-semibold">
          <button
            onClick={() => handleTabChange("predictive")}
            className={`px-3 py-1.5 rounded transition-all-custom focus:outline-none ${
              activeTab === "predictive"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Predictive Maintenance
          </button>
          <button
            onClick={() => handleTabChange("rca")}
            className={`px-3 py-1.5 rounded transition-all-custom focus:outline-none ${
              activeTab === "rca"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            RCA investigation Explorer
          </button>
        </div>
      </div>

      {/* Main Tab Viewports */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Tab 1: Predictive Maintenance Grid */}
        {activeTab === "predictive" && (
          <div className="flex-1 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Predictive Telemetry Asset Registry</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map((asset) => {
                  const healthColor = 
                    asset.healthScore >= 80 ? "text-green-600 bg-green-50 border-green-200" :
                    asset.healthScore >= 70 ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-red-600 bg-red-50 border-red-200";
                  
                  return (
                    <div key={asset.id} className="p-4 border border-gray-200 rounded-sharp bg-white hover:bg-gray-50 transition-all-custom flex flex-col justify-between gap-4">
                      {/* Title & Tag */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{asset.name}</h3>
                          <span className="text-[10px] text-gray-400 font-mono">TAG: {asset.tag}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${healthColor}`}>
                          Health: {asset.healthScore}%
                        </span>
                      </div>

                      {/* Diagnostic details */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2.5 rounded border border-gray-150">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 uppercase font-semibold">Remaining Life</span>
                          <span className="font-bold text-gray-900 font-mono mt-0.5">{asset.remainingUsefulLife} hrs</span>
                        </div>
                        <div className="flex flex-col border-x border-gray-200">
                          <span className="text-[9px] text-gray-400 uppercase font-semibold">Failure Prob.</span>
                          <span className={`font-bold font-mono mt-0.5 ${asset.failureProbability > 0.5 ? "text-red-600" : "text-gray-900"}`}>
                            {(asset.failureProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 uppercase font-semibold">Est. Fail Cost</span>
                          <span className="font-bold text-gray-900 font-mono mt-0.5">${asset.maintenanceCostEstimate.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <p className="text-[11px] text-gray-600 line-clamp-2 italic leading-relaxed border-l-2 border-[#2563EB] pl-2">
                        "{asset.aiRecommendation}"
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/twin?id=${asset.id}`}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded py-1.5 text-xs font-semibold focus:outline-none"
                        >
                          <span>Open Digital Twin</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        {asset.openIncidentsCount > 0 && (
                          <button
                            onClick={() => handleIncidentChange(asset.id === "C-302" ? "RCA-402" : "RCA-401")}
                            className="bg-[#2563EB] hover:bg-blue-700 text-white rounded px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
                          >
                            Investigate RCA
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: RCA Explorer (Fishbone & Fault Tree) */}
        {activeTab === "rca" && (
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            
            {/* Left: Incident selector and Diagrams */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              
              {/* Incident Selector Toolbar */}
              <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Incident Case:</span>
                  <select
                    value={activeRCA.incidentId}
