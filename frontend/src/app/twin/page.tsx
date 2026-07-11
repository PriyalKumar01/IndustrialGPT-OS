"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api-client";
import { AssetTwin, TelemetryMetric } from "@/services/types";
import { 
  Cpu, Thermometer, Gauge, Activity, ShieldCheck, 
  Wrench, AlertTriangle, FileText, ChevronRight, 
  Heart, Clock, TrendingDown, DollarSign
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from "recharts";

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assetId = searchParams.get("id") || "P-101A";
  
  const [assetList, setAssetList] = useState<AssetTwin[]>([]);
  const [activeAsset, setActiveAsset] = useState<AssetTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [telemetryTick, setTelemetryTick] = useState(0);

  // Load assets list
  const loadAssets = async () => {
    const list = await apiService.getAssets();
    setAssetList(list);
    const found = list.find(a => a.id === assetId) || list[0];
    setActiveAsset(found);
    setLoading(false);
  };

  useEffect(() => {
    loadAssets();
  }, [assetId]);

  // Telemetry real-time ticking simulator
  useEffect(() => {
    if (!activeAsset) return;
    
    const interval = setInterval(() => {
      setTelemetryTick(prev => prev + 1);
      
      setActiveAsset(prev => {
        if (!prev) return null;
        
        // Slightly fluctuate last metric values
        const updateMetrics = (metrics: TelemetryMetric[]) => {
          if (metrics.length === 0) return metrics;
          const copy = [...metrics];
          const lastVal = copy[copy.length - 1].value;
          // Normal fluctuation +- 1.5%
          const delta = lastVal * (Math.random() - 0.5) * 0.03;
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            value: Number((lastVal + delta).toFixed(2))
          };
          return copy;
        };

        return {
          ...prev,
          telemetry: {
            temperature: updateMetrics(prev.telemetry.temperature),
            pressure: updateMetrics(prev.telemetry.pressure),
            vibration: updateMetrics(prev.telemetry.vibration),
            oilContamination: updateMetrics(prev.telemetry.oilContamination)
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeAsset?.id]);

  if (loading || !activeAsset) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="h-[500px] bg-gray-200 rounded-sharp" />
      </div>
    );
  }

  // Live sensor values
  const getLatestVal = (metrics: TelemetryMetric[], fallback: number) => {
    if (metrics.length === 0) return fallback;
    return metrics[metrics.length - 1].value;
  };

  const currentTemp = getLatestVal(activeAsset.telemetry.temperature, 70);
  const currentPressure = getLatestVal(activeAsset.telemetry.pressure, 5.0);
  const currentVibration = getLatestVal(activeAsset.telemetry.vibration, 2.0);
  const currentOil = getLatestVal(activeAsset.telemetry.oilContamination, 20);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return activeAsset.healthScore >= 80 ? "text-[#16A34A] bg-green-50 border-green-200" : "text-[#F59E0B] bg-amber-50 border-amber-200";
      case "Fault":
        return "text-[#DC2626] bg-red-50 border-red-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "text-red-700 bg-red-50 border-red-200";
      case "High":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "Medium":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-green-700 bg-green-50 border-green-200";
    }
  };

  // Compile line chart data for current telemetry (combines last 10 points)
  const combinedTelemetryData = Array.from({ length: 15 }).map((_, i) => {
    const idx = Math.max(0, activeAsset.telemetry.temperature.length - 15 + i);
    const tempPoint = activeAsset.telemetry.temperature[idx];
    const vibPoint = activeAsset.telemetry.vibration[idx];
    const pressPoint = activeAsset.telemetry.pressure[idx];
    
    return {
      time: tempPoint ? tempPoint.timestamp : `${i}:00`,
      Temp: tempPoint ? tempPoint.value : 0,
      Vibration: vibPoint ? vibPoint.value : 0,
      Pressure: pressPoint ? pressPoint.value : 0
    };
  });

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Top Asset Navigator toolbar */}
      <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-[#2563EB]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Asset Digital Twin Workspace</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Explore telemetry sensors, real-time degradation predictions, and diagnostic action plans.</p>
          </div>
        </div>

        {/* Quick Twin switcher buttons */}
        <div className="flex items-center gap-1.5 border border-gray-200 p-0.5 rounded bg-gray-50 text-xs font-semibold">
          {assetList.map(asset => (
            <button
              key={asset.id}
              onClick={() => router.push(`/twin?id=${asset.id}`)}
              className={`px-2.5 py-1 rounded transition-all-custom focus:outline-none ${
                activeAsset.id === asset.id
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {asset.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Telemetry & Curves, Right Asset Details */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Telemetry readouts and curves */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          
          {/* Telemetry Sensor Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Sensor 1: Temperature */}
            <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Core Temp</span>
                <span className="text-20 font-bold text-gray-900 mt-1 font-mono">{currentTemp.toFixed(1)}°C</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Limit: {activeAsset.id === "GT-401" ? "520" : "80"}°C</span>
              </div>
              <Thermometer className={`h-8 w-8 ${currentTemp > (activeAsset.id === "GT-401" ? 490 : 80) ? "text-[#DC2626]" : "text-gray-400"}`} />
            </div>

            {/* Sensor 2: Vibration */}
            <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Vibration (Radial)</span>
                <span className="text-20 font-bold text-gray-900 mt-1 font-mono">{currentVibration.toFixed(2)} mm/s</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Alarm Limit: 4.5 mm/s</span>
              </div>
              <Activity className={`h-8 w-8 ${currentVibration > 4.5 ? "text-[#DC2626] animate-pulse" : "text-gray-400"}`} />
            </div>

            {/* Sensor 3: Pressure */}
            <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Discharge Press</span>
                <span className="text-20 font-bold text-gray-900 mt-1 font-mono">{currentPressure.toFixed(2)} MPa</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Limit: 8.0 MPa</span>
              </div>
              <Gauge className="h-8 w-8 text-gray-400" />
            </div>

            {/* Sensor 4: Oil Contamination */}
            <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Oil Quality</span>
                <span className="text-20 font-bold text-gray-900 mt-1 font-mono">{currentOil.toFixed(0)} ppm</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Fe elements index</span>
              </div>
              <Heart className={`h-8 w-8 ${currentOil > 40 ? "text-[#DC2626]" : "text-gray-400"}`} />
            </div>

          </div>

          {/* Telemetry charts Area */}
          <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[280px] shrink-0 flex flex-col">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3">Live SCADA Sensor Correlated Feed</span>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedTelemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={11} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line yAxisId="left" type="monotone" dataKey="Temp" stroke="#DC2626" strokeWidth={1.5} dot={false} name="Temperature (°C)" />
                  <Line yAxisId="left" type="monotone" dataKey="Vibration" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Vibration (mm/s)" />
                  <Line yAxisId="right" type="monotone" dataKey="Pressure" stroke="#2563EB" strokeWidth={1.5} dot={false} name="Pressure (MPa)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predicted Degradation Curve Panel */}
          <div className="bg-white border border-gray-200 rounded-sharp-lg p-5 shadow-subtle h-[280px] shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Remaining Useful Life (RUL) Degradation Curve</span>
              <span className="text-[10px] text-gray-500 font-mono">Algorithm: Particle Filtering Wear Estimator</span>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeAsset.degradationCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="hours" stroke="#9CA3AF" fontSize={11} name="Hours" label={{ value: 'Operational Hours', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={11} label={{ value: 'Health Score %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="normal" stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Nominal Degradation" />
                  <Line type="monotone" dataKey="predicted" stroke="#DC2626" strokeWidth={2.5} dot={false} name="Predicted Wear-out Curve" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Operational Scorecard Profile */}
        <div className="w-96 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
          {/* Inspector Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-900 uppercase tracking-wider">Asset Operational Profile</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">TAG: {activeAsset.tag}</span>
          </div>

          {/* Inspector Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div>
              <h2 className="text-16 font-bold text-gray-900">{activeAsset.name}</h2>
              <span className="text-gray-400 block mt-0.5">{activeAsset.manufacturer} | {activeAsset.model}</span>
            </div>

            {/* Status Badges Row */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-2 border rounded-sharp font-semibold ${getStatusColor(activeAsset.status)}`}>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-medium">Status</span>
                <span className="text-xs">{activeAsset.status}</span>
              </div>
              <div className={`p-2 border rounded-sharp font-semibold ${getSeverityColor(activeAsset.severityClass)}`}>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-medium">Severity Class</span>
                <span className="text-xs">{activeAsset.severityClass}</span>
              </div>
            </div>

            {/* Health & Failure RUL scores */}
            <div className="border border-gray-200 rounded-sharp p-3 bg-gray-50 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500">Asset Health Score:</span>
                <span className={`text-16 font-bold ${activeAsset.healthScore < 70 ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                  {activeAsset.healthScore} / 100
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${activeAsset.healthScore < 70 ? "bg-[#DC2626]" : "bg-[#16A34A]"}`} 
                  style={{ width: `${activeAsset.healthScore}%` }}
                />
              </div>

              <div className="h-px bg-gray-200 my-2" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Failure Probability</span>
                  <span className={`text-14 font-bold ${activeAsset.failureProbability > 0.5 ? "text-[#DC2626]" : "text-gray-900"}`}>
                    {(activeAsset.failureProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Remaining Useful Life</span>
                  <span className="text-14 font-bold text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {activeAsset.remainingUsefulLife} hrs
                  </span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Prescriptions */}
            <div className="border border-blue-200 rounded-sharp p-3.5 bg-blue-50/50 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                <Cpu className="h-4 w-4" />
                <span>AI Prescriptive Diagnostics</span>
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                {activeAsset.aiRecommendation}
              </p>
            </div>

            {/* Operational Parameters list */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Operational Metadata</span>
              <div className="space-y-1.5 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-150">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-800 font-semibold">{activeAsset.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Install Date:</span>
                  <span className="text-gray-800 font-semibold">{activeAsset.installDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Runtime:</span>
                  <span className="text-gray-800 font-semibold">{activeAsset.runtimeHours.toLocaleString()} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Maintenance:</span>
                  <span className="text-gray-800 font-semibold">{activeAsset.lastMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Next Scheduled:</span>
                  <span className="text-gray-800 font-semibold">{activeAsset.nextMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Repair Cost:</span>
                  <span className="text-gray-800 font-semibold">${activeAsset.maintenanceCostEstimate.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Related Documents links */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Related Reference Manuals</span>
              <div className="space-y-1.5">
                {activeAsset.relatedDocuments.map((docId) => (
                  <Link 
                    key={docId}
                    href={`/documents?id=${docId}`}
                    className="p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 transition-all-custom cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-gray-900 truncate">{docId} Manual Reference</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </Link>
                ))}
                {activeAsset.relatedDocuments.length === 0 && (
                  <span className="text-gray-400 italic">No reference documentation linked.</span>
                )}
              </div>
            </div>

          </div>

          {/* Inspector Action Buttons */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
            <Link
              href="/copilot"
              className="flex-1 flex items-center justify-center bg-[#2563EB] hover:bg-blue-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
            >
              <span>Query Copilot</span>
            </Link>
            {activeAsset.openIncidentsCount > 0 && (
              <Link
                href={`/maintenance?tab=rca&assetId=${activeAsset.id}`}
                className="flex-1 flex items-center justify-center bg-[#DC2626] hover:bg-red-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              >
                <span>Inspect RCA</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DigitalTwinPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-gray-500 p-6 animate-pulse">Loading Digital Twin...</div>}>
      <DigitalTwinContent />
    </React.Suspense>
  );
}
