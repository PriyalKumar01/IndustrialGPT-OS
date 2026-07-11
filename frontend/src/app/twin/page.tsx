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
