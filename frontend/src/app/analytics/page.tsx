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
          <div className="mt-2 text-[11px] text-gray-500">
            LangGraph sub-routing execution overhead
          </div>
        </div>

        {/* KPI 4: Prediction Accuracy */}
        <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Prediction Precision Index</span>
            <TrendingUp className="h-5 w-5 text-[#16A34A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-28 font-bold text-gray-900">98.2%</span>
            <span className="text-xs text-green-600 font-medium">+0.4%</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Telemetry anomaly-to-fault alignment
          </div>
        </div>

      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: AI Utilization & Latency */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[320px] flex flex-col">
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Copilot Utilization & Latency Trend</span>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={11} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line yAxisId="left" type="monotone" dataKey="Queries" stroke="#2563EB" strokeWidth={2} name="AI Queries Handled" />
                <Line yAxisId="right" type="monotone" dataKey="Latency" stroke="#F59E0B" strokeWidth={2} name="Avg Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Knowledge Ingest & Growth */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[320px] flex flex-col">
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Vector Knowledge Ingestion Growth</span>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docGrowthData}>
                <CartesianGrid stroke="#F3F4F6" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Pages" fill="#2563EB" name="Document Pages Processed" />
                <Bar dataKey="Embeddings" fill="#10B981" name="Vector Embeddings Created" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Prediction Accuracy (Actual vs Predicted) */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[320px] flex flex-col">
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Telemetry Prediction vs Actual Outages</span>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyMetricsData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="Actual" stroke="#2563EB" fillOpacity={1} fill="url(#colorActual)" strokeWidth={1.5} name="Actual Outages Logged" />
                <Area type="monotone" dataKey="Predicted" stroke="#16A34A" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={1.5} name="Predictive Anomaly Warnings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Failure Causes Distribution */}
        <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[320px] flex flex-col">
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Operational Failure Modes Breakdown</span>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureModesData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {failureModesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "9px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
