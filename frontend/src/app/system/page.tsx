"use client";

import React, { useState, useEffect } from "react";
import { Laptop, Cpu, Database, HardDrive, RefreshCw, Radio, CheckCircle, Activity } from "lucide-react";

interface ServiceStatus {
  name: string;
  type: "Database" | "Service" | "Worker" | "Model";
  status: "Active" | "Warning" | "Inactive";
  latency: string;
  details: string;
}

const initialServices: ServiceStatus[] = [
  { name: "FastAPI Gateway", type: "Service", status: "Active", latency: "14ms", details: "Uptime: 45 days. Handling 120 req/sec." },
  { name: "LangGraph Orchestrator", type: "Service", status: "Active", latency: "82ms", details: "Prompt v4.1.8. 8 agents active in pool." },
  { name: "PostgreSQL Database", type: "Database", status: "Active", latency: "8ms", details: "Pool size: 20 connections active." },
  { name: "Neo4j Graph Database", type: "Database", status: "Active", latency: "18ms", details: "Node count: 142,500. Edge count: 420,800." },
  { name: "ChromaDB Vector Store", type: "Database", status: "Active", latency: "22ms", details: "Index count: 24,000 document embeddings." },
  { name: "Redis Cache & PubSub", type: "Database", status: "Active", latency: "2ms", details: "Event broker: normal payload size." },
  { name: "Celery Worker Pool", type: "Worker", status: "Active", latency: "110ms", details: "2 concurrency processes active for OCR & Ingest." },
  { name: "Gemini Pro / Flash API", type: "Model", status: "Active", latency: "310ms", details: "Quota usage: 12% monthly capacity remaining." }
];

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [cpuUsage, setCpuUsage] = useState(12);
  const [memoryUsage, setMemoryUsage] = useState(42);
  const [tick, setTick] = useState(0);

  // Fluctuating system metrics every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
      setCpuUsage(Number((10 + Math.random() * 5).toFixed(0)));
      setMemoryUsage(Number((41 + Math.random() * 2).toFixed(1)));
      
      setServices(prev => prev.map(s => {
        // Fluctuate latency slightly
        const currentLat = parseFloat(s.latency.replace("ms", ""));
        const delta = currentLat * (Math.random() - 0.5) * 0.1;
        return {
          ...s,
          latency: `${(currentLat + delta).toFixed(0)}ms`
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Laptop className="h-6 w-6 text-[#2563EB]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>System Health & Architecture Diagram</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Monitor server CPU limits, database latencies, background Celery pipelines, and Gemini API quotas.</p>
          </div>
        </div>

        {/* System summary */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span>OPC MES Stream: <strong className="text-gray-900 font-mono">Syncing</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Status Panel, Right Architecture SVG */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Services Status & System Monitors */}
        <div className="w-96 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Service Registry Status</span>
            <span className="text-[10px] text-gray-400 font-mono">Uptime: 100%</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* CPU & Memory gauges */}
            <div className="grid grid-cols-2 gap-3 border border-gray-200 p-3 rounded-sharp bg-gray-50">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Node CPU Usage</span>
                <span className="text-16 font-bold text-gray-900 font-mono">{cpuUsage}%</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${cpuUsage}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Node RAM Allocation</span>
                <span className="text-16 font-bold text-gray-900 font-mono">{memoryUsage}%</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#16A34A] h-full" style={{ width: `${memoryUsage}%` }} />
                </div>
              </div>
            </div>

            {/* Ingestion queues */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Processing Queues</span>
              <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 border border-gray-150 p-2 rounded text-[11px] font-semibold">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400">OCR Queue</span>
                  <span className="text-gray-900 font-mono">0 active</span>
                </div>
                <div className="flex flex-col border-x border-gray-200">
                  <span className="text-[9px] text-gray-400">Embed Queue</span>
                  <span className="text-gray-900 font-mono">0 active</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400">Agent Queue</span>
                  <span className="text-gray-900 font-mono">0 active</span>
                </div>
              </div>
            </div>

            {/* List of services status */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Active Service list</span>
