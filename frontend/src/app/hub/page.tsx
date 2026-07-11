"use client";

import React from "react";
import { BookOpen, FileText, Bookmark, ExternalLink, ShieldCheck, Settings2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface StandardItem {
  code: string;
  name: string;
  domain: "Mechanical" | "Safety" | "Electrical" | "Quality";
  description: string;
  applicability: string;
  linkedDocsCount: number;
  criticalRules: string[];
}

const standardsCatalog: StandardItem[] = [
  {
    code: "API Standard 610",
    name: "Centrifugal Pumps for Petroleum, Petrochemical, and Natural Gas Industries",
    domain: "Mechanical",
    description: "Defines minimum requirements for centrifugal pumps, including design clearances, casing pressure thresholds, and bearing lubrication schedules.",
    applicability: "Boiler Feed Pumps P-101A/B",
    linkedDocsCount: 1,
    criticalRules: [
      "DE/NDE Bearing temperatures must not exceed 80°C under continuous load.",
      "Vibration radial threshold alarm limits set to 4.5 mm/s."
    ]
  },
  {
    code: "OISD Standard 117",
    name: "Fire Protection Facilities for Petroleum Depots and Terminals",
    domain: "Safety",
    description: "Outlines regulatory criteria for fire-fighting deluge systems, safety permit boundaries, and hydrocarbon gas detector calibration frequencies.",
    applicability: "Main Storage Manifold Sector 1",
    linkedDocsCount: 1,
    criticalRules: [
      "Deluge valve manifold inspections required bi-weekly.",
      "Requires active lock-out tag-out safety overrides on all main line valve maintenance."
    ]
  },
  {
    code: "Factory Act 1948 (Section 21)",
    name: "Safety of Machinery & High Pressure Vessels",
    domain: "Safety",
    description: "Specifies safety enclosure requirements, automatic low-cutoff switches, and hydrostatic testing intervals for high-pressure boilers and feed lines.",
    applicability: "High Pressure Boiler B1 & Feed line FCV-204",
    linkedDocsCount: 1,
    criticalRules: [
      "Low feedwater level cutoff interlock must trigger PLC motor trip automatically.",
      "Steam drums require hydrostatic testing every 12 months."
    ]
  },
  {
    code: "ISO 14001:2015",
    name: "Environmental Management Systems",
    domain: "Quality",
    description: "Sets standards for air discharge limits, heavy elements oil disposal tracking, and stack smoke opacity monitors.",
    applicability: "Plant Stack Exhaust & Oil Drainage pits",
    linkedDocsCount: 1,
    criticalRules: [
      "Stack sulfur oxide discharge must not exceed 150 mg/Nm³.",
      "Disposed lubrication oil must be cataloged in the environmental registry."
    ]
  }
];

export default function KnowledgeHubPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#2563EB]" />
          <span>Plant Knowledge Hub</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review governing regulatory standards, engineering design codes, and safety interlock guidelines.</p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standardsCatalog.map((std) => (
          <div key={std.code} className="bg-white border border-gray-200 rounded-sharp p-5 shadow-subtle flex flex-col justify-between gap-4">
            <div className="space-y-2">
              {/* Badges Row */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  std.domain === "Mechanical" ? "bg-amber-100 text-amber-800 border-amber-200 border" :
                  std.domain === "Safety" ? "bg-purple-100 text-purple-800 border-purple-200 border" :
                  "bg-blue-100 text-blue-800 border-blue-200 border"
                }`}>
                  {std.domain} Standard
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-semibold">{std.code}</span>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-gray-900 text-sm leading-tight mt-1">{std.name}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mt-2">{std.description}</p>
            </div>

            {/* Critical Rules list */}
            <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2.5">
              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-[#DC2626]" /> Critical Operations Safeguards
              </span>
              <div className="space-y-1.5 text-xs text-gray-600">
                {std.criticalRules.map((rule, idx) => (
                  <div key={idx} className="flex gap-2 items-start leading-normal">
                    <span className="text-gray-400 shrink-0 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingestion status footer */}
            <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3 mt-1 text-gray-400">
              <span>Governing applicability: <strong className="text-gray-700 font-semibold">{std.applicability}</strong></span>
              <Link 
                href="/documents" 
                className="text-[#2563EB] hover:underline font-bold text-[11px] flex items-center gap-0.5"
              >
                <span>{std.linkedDocsCount} manuals</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
