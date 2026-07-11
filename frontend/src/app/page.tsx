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
