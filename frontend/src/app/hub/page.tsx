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
