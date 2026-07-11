"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Cpu, Database, Award, HelpCircle } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

// Analytics Seed Data
const queryUtilizationData = [
  { day: "Mon", Queries: 120, Latency: 320 },
  { day: "Tue", Queries: 150, Latency: 340 },
  { day: "Wed", Queries: 180, Latency: 350 },
  { day: "Thu", Queries: 210, Latency: 310 },
  { day: "Fri", Queries: 190, Latency: 330 },
  { day: "Sat", Queries: 80, Latency: 280 },
  { day: "Sun", Queries: 60, Latency: 290 }
];

const docGrowthData = [
  { month: "Jan", Pages: 800, Embeddings: 2400 },
  { month: "Feb", Pages: 1200, Embeddings: 3600 },
  { month: "Mar", Pages: 1500, Embeddings: 4500 },
  { month: "Apr", Pages: 1800, Embeddings: 5400 },
  { month: "May", Pages: 2200, Embeddings: 6600 },
  { month: "Jun", Pages: 2500, Embeddings: 7500 }
];

const failureModesData = [
  { name: "Impeller Cavitation", value: 38, color: "#DC2626" },
  { name: "Cylinder Valve Plate Crack", value: 25, color: "#F59E0B" },
  { name: "FCV Stiction & Hunting", value: 18, color: "#2563EB" },
  { name: "RTD Temperature Drift", value: 12, color: "#10B981" },
  { name: "Turbine Exhaust Spread Deviation", value: 7, color: "#8B5CF6" }
];

const accuracyMetricsData = [
  { week: "Wk 1", Actual: 12, Predicted: 10 },
  { week: "Wk 2", Actual: 14, Predicted: 13 },
  { week: "Wk 3", Actual: 15, Predicted: 15 },
  { week: "Wk 4", Actual: 18, Predicted: 17 },
  { week: "Wk 5", Actual: 16, Predicted: 16 },
  { week: "Wk 6", Actual: 19, Predicted: 19 }
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-sharp" />
          <div className="h-80 bg-gray-200 rounded-sharp" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#2563EB]" />
          <span>Executive System Analytics</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review operational performance metrics, model utilization, and predictive failure diagnostics accuracy.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Knowledge Index Coverage */}
        <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Knowledge Coverage Index</span>
            <Database className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-28 font-bold text-gray-900">95.4%</span>
            <span className="text-xs text-green-600 font-medium">+1.8%</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            94 manuals fully vectorized into vector DB
          </div>
        </div>

        {/* KPI 2: AI Query Accuracy */}
        <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Response Accuracy Rate</span>
            <Award className="h-5 w-5 text-[#16A34A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-28 font-bold text-gray-900">93.8%</span>
            <span className="text-xs text-green-600 font-medium">93% threshold met</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Based on 1,420 user-reviewed citations
          </div>
        </div>

        {/* KPI 3: Avg Query Latency */}
        <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Avg Orchestration Latency</span>
            <Cpu className="h-5 w-5 text-[#0EA5E9]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-28 font-bold text-gray-900">340ms</span>
            <span className="text-xs text-gray-400 font-medium">-18ms (Optimized)</span>
          </div>
