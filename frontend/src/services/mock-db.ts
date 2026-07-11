import { Document, AssetTwin, AIAgent, GraphNode, GraphEdge, RootCauseAnalysis, ComplianceScoreCard, AIModelConfig, SystemIntegration, SystemNotification, User } from "./types";

export const mockUsers: User[] = [
  { id: "u-1", name: "Marcus Vance", email: "m.vance@industrialgpt.os", role: "Plant Operator", plantId: "TX-ALPHA" },
  { id: "u-2", name: "Elena Rostova", email: "e.rostova@industrialgpt.os", role: "Maintenance Engineer", plantId: "TX-ALPHA" },
  { id: "u-3", name: "Siddharth Mehta", email: "s.mehta@industrialgpt.os", role: "Compliance Officer", plantId: "TX-ALPHA" },
  { id: "u-4", name: "David Chen", email: "d.chen@industrialgpt.os", role: "Operations Manager", plantId: "TX-ALPHA" },
  { id: "u-5", name: "Thomas Mueller", email: "t.mueller@industrialgpt.os", role: "Plant Administrator", plantId: "TX-ALPHA" },
  { id: "u-6", name: "Sarah Jenkins", email: "s.jenkins@industrialgpt.os", role: "Executive", plantId: "TX-ALPHA" }
];

export const mockNotifications: SystemNotification[] = [
  {
    id: "n-1",
    severity: "Critical",
    type: "Failure",
    message: "Predictive Failure Alert: Feed Water Pump P-101A",
    details: "Vibration threshold exceeded 7.2 mm/s. Cavitation probability high (88%). Estimated RUL: 42 hours.",
    timestamp: "2026-07-10T13:45:00Z",
    isRead: false,
    actionUrl: "/twin?id=P-101A",
    actionLabel: "Open Digital Twin"
  },
  {
    id: "n-2",
    severity: "High",
    type: "Compliance",
    message: "Compliance Violation: Expired Hot Work Permit",
    details: "Permit #HWP-2026-089 for Boiler Tube Inspection in Sector 4 has expired. Work must be suspended.",
    timestamp: "2026-07-10T12:30:00Z",
    isRead: false,
    actionUrl: "/compliance",
    actionLabel: "View Permits"
  },
  {
    id: "n-3",
    severity: "Medium",
    type: "Incident",
    message: "Incident Logged: Reciprocating Compressor C-302 Discharge Pressure Drop",
    details: "Discharge pressure dropped below 4.5 MPa. Maintenance log #INC-402 created automatically.",
    timestamp: "2026-07-10T11:15:00Z",
    isRead: true,
    actionUrl: "/maintenance?tab=rca&incidentId=INC-402",
    actionLabel: "Open RCA"
  },
  {
    id: "n-4",
    severity: "Information",
    type: "Document",
    message: "Document Processing Complete: OISD-STD-117 Revision",
    details: "Successfully parsed. Extracted 14 Equipment IDs, 8 regulations, and generated 22 vector embeddings.",
    timestamp: "2026-07-10T10:00:00Z",
    isRead: false,
    actionUrl: "/documents",
    actionLabel: "Open Document Center"
  },
  {
    id: "n-5",
    severity: "High",
    type: "Audit",
    message: "Upcoming Regulatory Audit Reminder: PESO Compliance",
    details: "Annual Petroleum and Explosives Safety Organisation compliance audit is scheduled in 5 days.",
    timestamp: "2026-07-10T08:00:00Z",
    isRead: false,
    actionUrl: "/compliance",
    actionLabel: "Check Audit Readiness"
  }
];

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Feed_Water_Pump_P101A_Vendor_Manual.pdf",
    type: "PDF",
    size: "18.4 MB",
    uploadDate: "2026-03-12T14:22:00Z",
    status: "Vectorized",
    ocrStatus: "Completed",
    confidence: 0.98,
    version: "v2.1",
    author: "Elena Rostova",
    approvalStatus: "Approved",
    linkedAssets: ["P-101A", "P-101B"],
    complianceTags: ["API 610", "ISO 13709"],
    extractedMetadata: {
      equipmentIds: ["P-101A", "P-101B", "FCV-204"],
      plantLocations: ["Sector 1 - Boiler Feed Area", "Main Pump House"],
      engineers: ["Elena Rostova", "Marcus Vance"],
      dates: ["2022-04-15", "2026-03-12"],
      regulations: ["API Standard 610", "ISO 13709 centrifugal pump standards"],
      assetTypes: ["Centrifugal Pump", "Control Valve"],
      failureCodes: ["C-01 (Cavitation)", "B-04 (Bearing Failure)", "S-02 (Seal Leak)"],
      operatingLimits: ["Max Temperature: 180°C", "Max Discharge Pressure: 6.2 MPa", "NPSHr: 4.5m"],
      maintenanceSchedule: ["Bearing Lubrication: Every 3,000 hrs", "Vibration Analysis: Monthly", "Seal Inspection: Bi-annual"],
      safetyInstructions: ["Isolate electrical breaker prior to maintenance.", "Ensure casing pressure is fully vented before bolt removal."]
    },
    versions: [
      { version: "v2.1", date: "2026-03-12T14:22:00Z", author: "Elena Rostova", comment: "Updated with field service clearances for bearing spacer modification.", status: "Approved", changesCount: 4 },
      { version: "v2.0", date: "2024-05-18T09:00:00Z", author: "Thomas Mueller", comment: "Initial index of original vendor documentation.", status: "Approved", changesCount: 0 }
    ]
  },
  {
    id: "doc-2",
    name: "SOP_Boiler_Feed_Water_Emergency_Shutdown.pdf",
    type: "SOP",
    size: "1.2 MB",
    uploadDate: "2026-05-20T10:15:00Z",
    status: "Vectorized",
    ocrStatus: "Completed",
    confidence: 0.99,
    version: "v4.0",
    author: "David Chen",
    approvalStatus: "Approved",
    linkedAssets: ["P-101A", "Boiler-B1"],
    complianceTags: ["Factory Act Section 21", "OSHA 1910"],
    extractedMetadata: {
      equipmentIds: ["Boiler-B1", "P-101A", "FCV-204"],
      plantLocations: ["Boiler Deck", "Control Room"],
      engineers: ["David Chen", "Siddharth Mehta"],
      dates: ["2026-05-20"],
      regulations: ["Factory Act 1948 - Safety of Machinery", "OSHA 1910.119 Process Safety Management"],
      assetTypes: ["High Pressure Steam Boiler", "Feed Pump"],
      failureCodes: ["F-08 (Loss of Feedwater)", "O-03 (Overpressure)"],
      operatingLimits: ["Boiler Design Pressure: 10.5 MPa", "Low Water Cutoff Level: -150mm"],
      maintenanceSchedule: ["Safety Valve Test: Weekly", "Level Transmitter Calib: Monthly"],
      safetyInstructions: ["Trip fuel feed immediately upon low-low water level warning.", "Start auxiliary feed pump P-101B manually if auto-start fails."]
    },
    versions: [
      { version: "v4.0", date: "2026-05-20T10:15:00Z", author: "David Chen", comment: "Revised safety interlocks schema to match the PLC upgrade.", status: "Approved", changesCount: 12 },
      { version: "v3.1", date: "2025-01-10T11:30:00Z", author: "Elena Rostova", comment: "Minor clarification on bypass switch operations.", status: "Approved", changesCount: 2 }
    ]
  },
  {
    id: "doc-3",
    name: "Reciprocating_Compressor_C302_Maintenance_Log.xlsx",
    type: "Excel",
    size: "4.5 MB",
    uploadDate: "2026-07-01T08:30:00Z",
    status: "Vectorized",
    ocrStatus: "Completed",
    confidence: 0.94,
    version: "v1.12",
    author: "Marcus Vance",
    approvalStatus: "Approved",
    linkedAssets: ["C-302"],
    complianceTags: ["ISO 9001"],
    extractedMetadata: {
      equipmentIds: ["C-302"],
      plantLocations: ["Sector 3 - Gas Compression Station"],
      engineers: ["Marcus Vance", "Elena Rostova"],
      dates: ["2026-06-15", "2026-06-28"],
      regulations: ["ISO 9001 Quality Management System"],
      assetTypes: ["Reciprocating Compressor"],
      failureCodes: ["V-02 (Valve Leak)", "R-05 (Rider Ring Wear)"],
      operatingLimits: ["Discharge Temperature Limit: 135°C", "Max Speed: 740 RPM"],
      maintenanceSchedule: ["Valve Swap: Every 8,000 hrs", "Piston Ring Inspection: Every 16,000 hrs"],
      safetyInstructions: ["Depressurize and purge casing with nitrogen prior to flange opening."]
    },
    versions: [
      { version: "v1.12", date: "2026-07-01T08:30:00Z", author: "Marcus Vance", comment: "Logged valve replacement and cylinder head gasket inspection.", status: "Approved", changesCount: 5 }
    ]
  },
  {
    id: "doc-4",
    name: "Boiler_House_Sector1_Piping_And_Instrumentation_Diagram.dwg",
    type: "Drawing",
    size: "45.2 MB",
    uploadDate: "2026-06-18T16:40:00Z",
    status: "Vectorized",
    ocrStatus: "Completed",
    confidence: 0.89,
    version: "v3.0",
    author: "Elena Rostova",
    approvalStatus: "Approved",
    linkedAssets: ["P-101A", "FCV-204", "Boiler-B1"],
    complianceTags: ["OISD-STD-117", "PESO Rules"],
    extractedMetadata: {
      equipmentIds: ["P-101A", "FCV-204", "Boiler-B1", "PT-104", "LT-102"],
      plantLocations: ["Sector 1 - Utility Block"],
      engineers: ["Elena Rostova", "Thomas Mueller"],
      dates: ["2026-06-18"],
      regulations: ["OISD Standard 117 - Fire Protection Facilities for Petroleum Depots"],
      assetTypes: ["P&ID Engineering Drawing"],
      failureCodes: [],
      operatingLimits: ["Line Design pressure: 8.0 MPa", "Pipe Schedule: 80S Carbon Steel"],
      maintenanceSchedule: [],
      safetyInstructions: []
    },
    versions: [
      { version: "v3.0", date: "2026-06-18T16:40:00Z", author: "Elena Rostova", comment: "As-built drawing updates for feedwater manifold modification.", status: "Approved", changesCount: 22 }
    ]
  }
];

export const mockAssets: AssetTwin[] = [
  {
    id: "P-101A",
    name: "Boiler Feed Water Pump A",
    tag: "TX-ALPHA-BFP-101A",
    type: "Pump",
    status: "Running",
    healthScore: 68,
    failureProbability: 0.88,
    remainingUsefulLife: 42,
    location: "Sector 1 - Boiler Feed Area",
    manufacturer: "Sulzer Pumps",
    model: "MDS 150-350 / 8 Stages",
    installDate: "2021-06-15",
    runtimeHours: 32410,
    lastMaintenance: "2026-05-12",
    nextMaintenance: "2026-08-10",
    alerts: [
      "High Vibration (Radial DE): 7.2 mm/s (Alarm Limit: 4.5 mm/s)",
      "High Bearing Temperature (NDE): 86.4°C (Alarm Limit: 80°C)",
      "Fluctuating Suction Pressure (NPSHa Margin Critical)"
    ],
    openIncidentsCount: 1,
    relatedDocuments: ["doc-1", "doc-2", "doc-4"],
    complianceStatus: "Compliant",
    aiRecommendation: "Perform urgent cavitation check. Restrict pump flow by 5% to increase NPSHa margin, or switch feed duty to auxiliary pump P-101B and inspect P-101A suction strainer for debris fouling.",
    maintenanceCostEstimate: 14500,
    downtimeEstimateHours: 8,
    severityClass: "Critical",
    telemetry: {
      temperature: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 72 + Math.random() * 5 + (i > 18 ? 8 + Math.random() * 3 : 0) })),
      pressure: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 5.8 - Math.random() * 0.2 - (i > 18 ? 0.6 : 0) })),
      vibration: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 3.2 + Math.random() * 0.4 + (i > 18 ? 3.0 + Math.random() * 0.8 : 0) })),
      oilContamination: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 42 + Math.random() * 2 + (i > 20 ? 5 : 0) }))
    },
    degradationCurve: Array.from({ length: 20 }).map((_, i) => {
      const hours = i * 20;
      return {
        hours,
        normal: Math.max(100 - i * 1, 80),
        predicted: Math.max(100 - i * 1.5 - (i > 10 ? (i - 10) * 4 : 0), 10)
      };
    })
  },
  {
    id: "C-302",
    name: "Main Reciprocating Gas Compressor",
    tag: "TX-ALPHA-RGC-302",
    type: "Compressor",
    status: "Fault",
    healthScore: 45,
