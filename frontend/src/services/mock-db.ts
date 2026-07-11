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
