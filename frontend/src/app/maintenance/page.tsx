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
                    onChange={(e) => handleIncidentChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
                  >
                    {incidents.map(inc => (
                      <option key={inc.incidentId} value={inc.incidentId}>{inc.incidentId}: {inc.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">Severity: <strong className="text-red-600 font-bold">{activeRCA.severity}</strong></span>
                  <span className="text-gray-400">Status: <strong className="text-[#2563EB] font-bold">{activeRCA.status}</strong></span>
                </div>
              </div>

              {/* Ishikawa Fishbone Diagram (SVG-rendered) */}
              <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle flex flex-col h-[280px] shrink-0">
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-4">Ishikawa Fishbone (Cause & Effect) Diagram</span>
                
                <div className="flex-1 min-h-0 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet">
                    {/* Main backbone horizontal line */}
                    <line x1="20" y1="90" x2="520" y2="90" stroke="#111827" strokeWidth="2.5" />
                    
                    {/* Failure head card box */}
                    <rect x="520" y="70" width="70" height="40" rx="4" fill="#DC2626" />
                    <text x="555" y="90" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" dy="3">FAILURE</text>
                    
                    {/* Upper ribs (Man, Machine, Material) */}
                    {/* Man */}
                    <line x1="120" y1="20" x2="180" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="120" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">MAN</text>
                    
                    {/* Machine */}
                    <line x1="280" y1="20" x2="340" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="280" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">MACHINE</text>
                    
                    {/* Material */}
                    <line x1="440" y1="20" x2="500" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="440" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">MATERIAL</text>

                    {/* Lower ribs (Method, Measurement, Environment) */}
                    {/* Method */}
                    <line x1="120" y1="160" x2="180" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="120" y="172" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">METHOD</text>

                    {/* Measurement */}
                    <line x1="280" y1="160" x2="340" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="280" y="172" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">MEASUREMENT</text>

                    {/* Environment */}
                    <line x1="440" y1="160" x2="500" y2="90" stroke="#6B7280" strokeWidth="1.5" />
                    <text x="440" y="172" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">ENVIRONMENT</text>

                    {/* Rib cause text details */}
                    <text x="145" y="48" fontSize="8" fill="#DC2626" fontWeight="semibold">Overdue strainer wash</text>
                    <text x="290" y="48" fontSize="8" fill="#DC2626" fontWeight="semibold">{activeRCA.incidentId === "INC-402" ? "Cracked valve plate" : "Cavitation pitting"}</text>
                    <text x="430" y="48" fontSize="8" fill="#DC2626" fontWeight="semibold">Fluid vaporisation</text>
                    <text x="135" y="132" fontSize="8" fill="#DC2626" fontWeight="semibold">Low NPSH operation</text>
                    <text x="290" y="132" fontSize="8" fill="#DC2626" fontWeight="semibold">RTD thermal lag</text>
                  </svg>
                </div>
              </div>

              {/* Fault Tree Diagram (SVG-rendered) */}
              <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle flex flex-col h-[280px] shrink-0">
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-4">Hierarchical Fault Tree analysis</span>
                
                <div className="flex-1 min-h-0 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet">
                    {/* Tree Links */}
                    <line x1="300" y1="30" x2="300" y2="70" stroke="#9CA3AF" strokeWidth="1.5" />
                    <line x1="300" y1="70" x2="160" y2="110" stroke="#9CA3AF" strokeWidth="1.5" />
                    <line x1="300" y1="70" x2="440" y2="110" stroke="#9CA3AF" strokeWidth="1.5" />

                    {/* Level 1: Root Failure Card */}
                    <rect x="220" y="10" width="160" height="24" rx="4" fill="#DC2626" />
                    <text x="300" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="bold">Boiler Feedwater Loss</text>

                    {/* Level 2: Logical Gate (AND) */}
                    <rect x="285" y="60" width="30" height="20" rx="3" fill="#111827" />
                    <text x="300" y="73" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">AND</text>

                    {/* Level 3: Base Events (Vibration, Permit Hold) */}
                    <rect x="80" y="110" width="160" height="28" rx="4" fill="#F59E0B" />
                    <text x="160" y="123" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">P-101A Radial Vibration</text>
                    <text x="160" y="133" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontStyle="italic">(Prob: 88%)</text>

                    <rect x="360" y="110" width="160" height="28" rx="4" fill="#9CA3AF" />
                    <text x="440" y="123" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Expired Safety Permits</text>
                    <text x="440" y="133" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontStyle="italic">(HWP-089 expired)</text>
                  </svg>
                </div>
              </div>

            </div>

            {/* Right Side: RCA Details inspector */}
            <div className="w-80 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
              
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Investigation Report</span>
                <span className="text-[10px] font-mono text-gray-400">RCA Case</span>
              </div>

              {/* Inspector Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                
                {/* AI Explanation block */}
                <div className="border border-blue-200 rounded-sharp p-3.5 bg-blue-50/50 flex flex-col gap-2">
                  <span className="font-bold text-[#2563EB] block uppercase text-[10px]">AI Core Diagnostics Summary</span>
                  <p className="text-gray-700 leading-relaxed font-medium text-[11px]">
                    {activeRCA.aiExplanation}
                  </p>
                </div>

                {/* Event sequence timeline */}
                <div className="space-y-3">
                  <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Sequence Timeline</span>
                  <div className="relative border-l border-gray-200 pl-3 space-y-3.5 ml-2">
                    {activeRCA.timeline.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-5 top-0.5 h-3 w-3 rounded-full border border-white ${
                          evt.type === "anomaly" ? "bg-[#DC2626]" :
                          evt.type === "action" ? "bg-[#2563EB]" : "bg-gray-400"
                        }`} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{evt.time} - {evt.event}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preventive Actions lists */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Required Preventive Actions</span>
                  <div className="space-y-1.5">
                    {activeRCA.preventiveActions.map((act, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-gray-700 bg-gray-50 p-2 border border-gray-200 rounded leading-normal">
                        <CheckCircle className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Historical Outages */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Historical Outages Comparison</span>
                  <div className="space-y-2">
                    {activeRCA.historicalIncidents.map((inc) => (
                      <div key={inc.id} className="p-2 border border-gray-200 rounded bg-white space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-900">
                          <span>{inc.id}: {inc.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{(inc.similarity * 100).toFixed(0)}% sim</span>
                        </div>
                        <p className="text-gray-500 text-[10px] leading-relaxed">
                          Resolution: {inc.resolution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Report generator action footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => alert(`Downloading unified PDF report for Incident ${activeRCA.incidentId} containing Ishikawa fishbones, fault trees, and chronological SCADA timelines...`)}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Incident Report</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function MaintenanceIntelligencePage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-gray-500 p-6 animate-pulse">Loading Maintenance...</div>}>
      <MaintenanceIntelligenceContent />
    </React.Suspense>
  );
}
