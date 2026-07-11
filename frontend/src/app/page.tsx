"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { AssetTwin, Document, RootCauseAnalysis } from "@/services/types";
import { 
  Activity, Shield, AlertTriangle, FileText, 
  TrendingUp, PiggyBank, Leaf, CheckCircle, 
  Clock, Thermometer, Gauge, ChevronRight,
  TrendingDown, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

// Mock Chart Data
const complianceTrendsData = [
  { month: "Jan", Score: 82, Target: 90 },
  { month: "Feb", Score: 84, Target: 90 },
  { month: "Mar", Score: 85, Target: 90 },
  { month: "Apr", Score: 89, Target: 90 },
  { month: "May", Score: 87, Target: 90 },
  { month: "Jun", Score: 88, Target: 90 }
];

const roiSavingsData = [
  { month: "Jan", Savings: 12000, Losses: 4500 },
  { month: "Feb", Savings: 18000, Losses: 3000 },
  { month: "Mar", Savings: 22000, Losses: 1500 },
  { month: "Apr", Savings: 28000, Losses: 800 },
  { month: "May", Savings: 32000, Losses: 0 },
  { month: "Jun", Savings: 35000, Losses: 1200 }
];

const docAccessData = [
  { name: "P-101A Manual", count: 242 },
  { name: "Shutdown SOP", count: 185 },
  { name: "Boiler P&ID", count: 130 },
  { name: "C-302 Log", count: 98 },
  { name: "ISO 14001 Guide", count: 42 }
];

const riskDistributionData = [
  { name: "Critical Risks", value: 2, color: "#DC2626" },
  { name: "High Risks", value: 3, color: "#F59E0B" },
  { name: "Medium Risks", value: 6, color: "#2563EB" },
  { name: "Low Risks", value: 12, color: "#16A34A" }
];

export default function DashboardPage() {
  const { executiveMode, currentPlant } = useApp();
  const [assets, setAssets] = useState<AssetTwin[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [incidents, setIncidents] = useState<RootCauseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const a = await apiService.getAssets();
        const d = await apiService.getDocuments();
        const i = await apiService.getIncidentsList();
        setAssets(a);
        setDocs(d);
        setIncidents(i);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-gray-200 rounded-sharp" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-200 rounded-sharp lg:col-span-2" />
          <div className="h-80 bg-gray-200 rounded-sharp" />
        </div>
      </div>
    );
  }

  // Filter values
  const activeAlertsCount = assets.reduce((sum, a) => sum + a.alerts.length, 0);
  const totalOpenIncidents = incidents.filter(i => i.status === "Under Investigation").length;
  const criticalAssets = assets.filter(a => a.healthScore < 70);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plant Operational Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Site: <strong className="text-gray-700">{currentPlant === "TX-ALPHA" ? "Texas Plant Alpha" : currentPlant}</strong> | Operational Status: <span className="text-[#16A34A] font-semibold">NORMAL</span>
          </p>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI SECTION (Dynamic based on Executive Mode) */}
      {executiveMode === "operator" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Operator Card 1: Asset Health */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Critical Assets</span>
              <Activity className="h-5 w-5 text-[#DC2626]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">{criticalAssets.length}</span>
              <span className="text-xs text-red-600 font-medium">Needs Attention</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              Lowest: Pump P-101A (Health {assets.find(a => a.id === "P-101A")?.healthScore}%)
            </div>
          </div>

          {/* Operator Card 2: Open Alerts */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active telemetry Alerts</span>
              <Thermometer className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">{activeAlertsCount}</span>
              <span className="text-xs text-amber-600 font-medium">Exceeds Limit</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              Vibration anomalies in Sector 1 feed line
            </div>
          </div>

          {/* Operator Card 3: Active Incidents */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Unresolved Incidents</span>
              <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">{totalOpenIncidents}</span>
              <span className="text-xs text-gray-400 font-medium">Under Investigation</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              INC-401: Boiler Feedwater Vibration
            </div>
          </div>

          {/* Operator Card 4: Live Telemetry Status */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">System Telemetry Feed</span>
              <Gauge className="h-5 w-5 text-[#16A34A]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-[#16A34A]">Nominal</span>
              <span className="text-xs text-gray-400 font-medium">94.2% stability</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              1,240 events/sec synced from OPC MES
            </div>
          </div>
        </div>
      )}

      {executiveMode === "manager" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Manager Card 1: Documents Vectorized */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Indexed Knowledge Base</span>
              <FileText className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">{docs.length}</span>
              <span className="text-xs text-green-600 font-medium">Vectorized</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              4 manuals, P&IDs & SOPs parsed via OCR
            </div>
          </div>

          {/* Manager Card 2: Digital Twins */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Assets Monitored</span>
              <Activity className="h-5 w-5 text-[#0EA5E9]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">{assets.length}</span>
              <span className="text-xs text-gray-400 font-medium">Digital Twins</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              Pumps, compressors, control valves, turbines
            </div>
          </div>

          {/* Manager Card 3: Compliance Index */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Compliance Readiness</span>
              <Shield className="h-5 w-5 text-[#16A34A]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">88%</span>
              <span className="text-xs text-red-600 font-medium">-6% (Permit Expired)</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              PESO rules & Factory Act requirements
            </div>
          </div>

          {/* Manager Card 4: Open Incidents */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Open Work Orders</span>
              <Clock className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">3</span>
              <span className="text-xs text-amber-600 font-medium">Pending Action</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              2 corrective compliance audits outstanding
            </div>
          </div>
        </div>
      )}

      {executiveMode === "executive" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Executive Card 1: Cost Savings */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Downtime Prevention Value</span>
              <PiggyBank className="h-5 w-5 text-[#16A34A]" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-28 font-bold text-gray-900">$142,500</span>
              <span className="text-xs text-[#16A34A] font-semibold flex items-center"><ArrowUpRight className="h-3 w-3" />12%</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              2 major catastrophic pump failures averted
            </div>
          </div>

          {/* Executive Card 2: Downtime Hours prevented */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Downtime Avoided</span>
              <Clock className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">72 hrs</span>
              <span className="text-xs text-green-600 font-medium">Saved</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              Equivalent to 1.8% refinery uptime gain
            </div>
          </div>

          {/* Executive Card 3: AI Copilot Adoption */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">AI Copilot Adoption Rate</span>
              <TrendingUp className="h-5 w-5 text-[#0EA5E9]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-gray-900">94.2%</span>
              <span className="text-xs text-gray-400 font-medium">Staff active</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              440 queries answered with 93% confidence
            </div>
          </div>

          {/* Executive Card 4: Environmental & Carbon Impact */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Energy Loss Avoided</span>
              <Leaf className="h-5 w-5 text-[#16A34A]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-28 font-bold text-[#16A34A]">-18.4%</span>
              <span className="text-xs text-green-600 font-medium">Wastage cut</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              CO₂ emissions reduced by 12.2 tons
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC DASHBOARD CHART PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Chart */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle lg:col-span-2 flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              {executiveMode === "executive" ? "ROI savings from AI anomaly detection ($)" : "Regulatory Compliance Index Trends (%)"}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Real-time SCADA telemetry correlation</span>
          </div>
          
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {executiveMode === "executive" ? (
                <AreaChart data={roiSavingsData}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLosses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="Savings" stroke="#16A34A" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} name="Cost Savings" />
                  <Area type="monotone" dataKey="Losses" stroke="#DC2626" fillOpacity={1} fill="url(#colorLosses)" strokeWidth={2} name="Unavoided Downtime Cost" />
                </AreaChart>
              ) : (
                <AreaChart data={complianceTrendsData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                  <YAxis domain={[50, 100]} stroke="#9CA3AF" fontSize={11} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="Score" stroke="#2563EB" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} name="Actual Compliance Score" />
                  <Area type="monotone" dataKey="Target" stroke="#9CA3AF" strokeDasharray="4 4" fill="none" strokeWidth={1} name="Regulator Minimum (90%)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Analytics Chart */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              {executiveMode === "operator" ? "Plant Risk distribution" : "Manuals & SOPs Query Frequency"}
            </span>
          </div>

          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              {executiveMode === "operator" ? (
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              ) : (
                <BarChart data={docAccessData} layout="vertical">
                  <CartesianGrid stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={80} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} name="Access Frequency" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED & ACTIVE CRITICAL TELEMETRY MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed (Audit Trail) */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle lg:col-span-2 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3.5 border-b border-gray-100 pb-2">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">System Audit Trail & Live Activity Feed</span>
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-ping" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            <div className="flex gap-3 border-l-2 border-red-500 pl-3">
              <span className="text-gray-400 font-mono tracking-tight">13:45:00</span>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Predictive Anomaly Detected: P-101A vibration exceeded 7.2 mm/s</span>
                <span className="text-gray-500 text-[11px] mt-0.5">Calculated RUL drops to 42 hrs. Action recommendation routed to Maintenance Engineer Elena Rostova.</span>
              </div>
            </div>
            <div className="flex gap-3 border-l-2 border-yellow-500 pl-3">
              <span className="text-gray-400 font-mono tracking-tight">12:30:15</span>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Safety Interlock Breach Alert: Boiler Sector 1</span>
                <span className="text-gray-500 text-[11px] mt-0.5">Hot Work Permit HWP-2026-089 has expired. Auto shutdown sequence override flagged.</span>
              </div>
            </div>
            <div className="flex gap-3 border-l-2 border-[#2563EB] pl-3">
              <span className="text-gray-400 font-mono tracking-tight">10:00:22</span>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Knowledge Ingest: OISD Fire Protection Std parsed via OCR</span>
                <span className="text-gray-500 text-[11px] mt-0.5">Created 22 new vector embeddings. Appended 14 equipment-permit nodes in Knowledge Graph.</span>
              </div>
            </div>
            <div className="flex gap-3 border-l-2 border-gray-300 pl-3">
              <span className="text-gray-400 font-mono tracking-tight">09:15:40</span>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">System Sync: IBM Maximo & SAP S/4HANA Database Sync Complete</span>
                <span className="text-gray-500 text-[11px] mt-0.5">Synchronized 208,800 active maintenance records and billing items. Latency: 42ms.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Links / Active Equipment Alert List */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Critical Equipment Status</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5">
            {assets.map((asset) => {
              const statusColor = 
                asset.status === "Running" && asset.healthScore >= 80 ? "bg-[#16A34A]" :
                asset.status === "Running" ? "bg-[#F59E0B]" : "bg-[#DC2626]";
              return (
                <div key={asset.id} className="p-2.5 border border-gray-200 rounded-sharp flex flex-col gap-1.5 hover:bg-gray-50 transition-all-custom">
                  <div className="flex items-center justify-between">
                    <Link href={`/twin?id=${asset.id}`} className="text-xs font-semibold text-gray-900 hover:text-[#2563EB] hover:underline">
                      {asset.name} ({asset.id})
                    </Link>
                    <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} title={`Status: ${asset.status}`} />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Health Index:</span>
                    <span className={`font-semibold ${asset.healthScore < 70 ? "text-red-600" : "text-gray-900"}`}>
                      {asset.healthScore}%
                    </span>
                  </div>
                  {asset.alerts.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 font-semibold uppercase">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{asset.alerts.length} Warnings Active</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
