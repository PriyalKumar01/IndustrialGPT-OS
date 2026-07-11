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
    failureProbability: 0.95,
    remainingUsefulLife: 0,
    location: "Sector 3 - Gas Compression Station",
    manufacturer: "Dresser-Rand",
    model: "HOS 4-2 / 2-Throw",
    installDate: "2019-11-20",
    runtimeHours: 48900,
    lastMaintenance: "2026-06-15",
    nextMaintenance: "2026-07-15",
    alerts: [
      "Trip Active: Stage 2 Discharge Valve Temperature Exceeded Limit (142°C)",
      "Discharge Pressure Drop below 4.5 MPa"
    ],
    openIncidentsCount: 1,
    relatedDocuments: ["doc-3"],
    complianceStatus: "Pending Review",
    aiRecommendation: "Stage 2 discharge valve leakage detected. Replace valves on Cylinder B. Run a pressure safety valve (PSV) override check prior to restarting.",
    maintenanceCostEstimate: 28000,
    downtimeEstimateHours: 24,
    severityClass: "Critical",
    telemetry: {
      temperature: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 92 + Math.random() * 4 + (i > 12 ? 30 + Math.random() * 12 : 0) })),
      pressure: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 5.2 + Math.random() * 0.1 - (i > 14 ? 1.2 : 0) })),
      vibration: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 4.8 + Math.random() * 0.3 + (i > 12 ? 1.5 : 0) })),
      oilContamination: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 30 + Math.random() * 1 }))
    },
    degradationCurve: Array.from({ length: 20 }).map((_, i) => {
      const hours = i * 20;
      return {
        hours,
        normal: Math.max(100 - i * 0.8, 84),
        predicted: Math.max(100 - i * 2.5 - (i > 8 ? (i - 8) * 6 : 0), 0)
      };
    })
  },
  {
    id: "FCV-204",
    name: "Feedwater Flow Control Valve",
    tag: "TX-ALPHA-FCV-204",
    type: "Valve",
    status: "Running",
    healthScore: 92,
    failureProbability: 0.08,
    remainingUsefulLife: 4200,
    location: "Sector 1 - Boiler Feed Area",
    manufacturer: "Fisher Controls",
    model: "Easy-Drive ET Sliding Stem",
    installDate: "2024-03-10",
    runtimeHours: 18500,
    lastMaintenance: "2026-02-18",
    nextMaintenance: "2026-09-15",
    alerts: [],
    openIncidentsCount: 0,
    relatedDocuments: ["doc-1", "doc-2", "doc-4"],
    complianceStatus: "Compliant",
    aiRecommendation: "Operating normally. Routine packing gland check recommended during next scheduled plant shutdown.",
    maintenanceCostEstimate: 1200,
    downtimeEstimateHours: 2,
    severityClass: "Low",
    telemetry: {
      temperature: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 45 + Math.random() * 2 })),
      pressure: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 5.6 + Math.random() * 0.05 })),
      vibration: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 0.8 + Math.random() * 0.1 })),
      oilContamination: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 10 + Math.random() * 0.5 }))
    },
    degradationCurve: Array.from({ length: 20 }).map((_, i) => {
      const hours = i * 200;
      return {
        hours,
        normal: 100 - i * 0.5,
        predicted: 100 - i * 0.6
      };
    })
  },
  {
    id: "GT-401",
    name: "Gas Turbine Generator",
    tag: "TX-ALPHA-GTG-401",
    type: "Turbine",
    status: "Running",
    healthScore: 84,
    failureProbability: 0.18,
    remainingUsefulLife: 1800,
    location: "Sector 2 - Power Generation Block",
    manufacturer: "GE Power",
    model: "LM2500+ Aero-derivative",
    installDate: "2020-08-05",
    runtimeHours: 42100,
    lastMaintenance: "2026-04-10",
    nextMaintenance: "2026-10-10",
    alerts: ["Exhaust Gas Temperature Spread Warning - Deviation: 18°C (Limit: 22°C)"],
    openIncidentsCount: 0,
    relatedDocuments: [],
    complianceStatus: "Compliant",
    aiRecommendation: "Perform fuel nozzle inspection during next shutdown. The EGT (Exhaust Gas Temperature) spread is trending upwards, indicating possible fuel flow restriction in injector combustor cans #4 and #5.",
    maintenanceCostEstimate: 85000,
    downtimeEstimateHours: 48,
    severityClass: "Medium",
    telemetry: {
      temperature: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 480 + Math.random() * 8 + (i > 18 ? 12 : 0) })),
      pressure: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 1.8 + Math.random() * 0.02 })),
      vibration: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 1.5 + Math.random() * 0.1 })),
      oilContamination: Array.from({ length: 24 }).map((_, i) => ({ timestamp: `${i}:00`, value: 18 + Math.random() * 0.4 }))
    },
    degradationCurve: Array.from({ length: 20 }).map((_, i) => {
      const hours = i * 150;
      return {
        hours,
        normal: 100 - i * 0.3,
        predicted: 100 - i * 0.7
      };
    })
  }
];

export const mockAIAgents: AIAgent[] = [
  {
    id: "agent-planner",
    name: "Planner Agent",
    status: "Idle",
    currentTask: "None",
    queueLength: 0,
    tokensProcessed: 1245000,
    runtimeMs: 180,
    successRate: 99.4,
    dependencies: [],
    processingTimeline: [240, 180, 210, 190, 175, 180, 190, 182],
    previousExecutions: [
      { taskId: "task-1021", runtimeMs: 180, status: "Success", timestamp: "2026-07-10T13:40:02Z", taskDescription: "Deconstruct user request regarding C-302 compressor valve failure and orchestrate sub-agent routing." }
    ],
    thinkingLog: [
      "PLANNER: Received input 'Analyze current alert on P-101A and draft preventive actions'.",
      "PLANNER: Analyzing intent. Key assets identified: P-101A. Key domains: Maintenance, Root Cause, Compliance.",
      "PLANNER: Routing query to Retrieval Agent for P-101A datasheets and Emergency shutdown SOPs.",
      "PLANNER: Routing request to Knowledge Graph Agent for P-101A relationships.",
      "PLANNER: Scheduling Maintenance Agent to calculate RUL and current telemetry degradation.",
      "PLANNER: Output plans generated and sent to execution queue."
    ]
  },
  {
    id: "agent-retrieval",
    name: "Retrieval Agent (RAG)",
    status: "Idle",
    currentTask: "None",
    queueLength: 0,
    tokensProcessed: 4890000,
    runtimeMs: 420,
    successRate: 98.7,
    dependencies: ["agent-planner"],
    processingTimeline: [450, 480, 410, 460, 430, 420, 395, 412],
    previousExecutions: [
      { taskId: "task-1022", runtimeMs: 412, status: "Success", timestamp: "2026-07-10T13:40:03Z", taskDescription: "Retrieve relevant vector chunks for Fisher valve maintenance logs." }
    ],
    thinkingLog: [
      "RETRIEVAL: Query parameters: 'P-101A cavitation thresholds', 'Feedwater pump suction limits'.",
      "RETRIEVAL: Querying ChromaDB collection 'plant_manuals'. Target threshold: similarity > 0.72.",
      "RETRIEVAL: Found 4 candidate chunks inside Feed_Water_Pump_P101A_Vendor_Manual.pdf (doc-1).",
      "RETRIEVAL: Found 2 chunks inside SOP_Boiler_Feed_Water_Emergency_Shutdown.pdf (doc-2).",
      "RETRIEVAL: Performing re-ranking of results. Cross-Encoder score computed.",
      "RETRIEVAL: Extracted relevant evidence. Transmitting to Synthesizer and Evidence Panel."
    ]
  },
  {
    id: "agent-kg",
    name: "Knowledge Graph Agent",
    status: "Idle",
    currentTask: "None",
    queueLength: 0,
    tokensProcessed: 950000,
    runtimeMs: 310,
    successRate: 100.0,
    dependencies: ["agent-planner"],
    processingTimeline: [320, 350, 290, 310, 340, 305, 310, 308],
    previousExecutions: [
      { taskId: "task-1023", runtimeMs: 308, status: "Success", timestamp: "2026-07-10T13:40:03Z", taskDescription: "Execute Cypher query for C-302 downstream assets and active permits." }
    ],
    thinkingLog: [
      "KG_AGENT: Initializing Cypher query: MATCH (a:Asset {id: 'P-101A'})-[:LOCATED_AT]->(p:Plant) RETURN a, p...",
      "KG_AGENT: Query executed on Neo4j in 18ms.",
      "KG_AGENT: Found active links: P-101A is LOCATED_AT Sector 1, MAINTAINED_BY Elena Rostova, AFFECTED_BY Incident INC-401, REQUIRES_PERMIT HWP-2026-089.",
      "KG_AGENT: Extracting neighborhood sub-graph. 8 nodes and 12 relationships compiled.",
      "KG_AGENT: Pushing graph context to Planner for downstream agent visibility."
    ]
  },
  {
    id: "agent-maintenance",
    name: "Maintenance Agent",
    status: "Idle",
    currentTask: "None",
    queueLength: 0,
    tokensProcessed: 1850000,
    runtimeMs: 540,
    successRate: 97.2,
    dependencies: ["agent-planner", "agent-retrieval"],
    processingTimeline: [590, 560, 580, 520, 540, 535, 520, 542],
    previousExecutions: [
      { taskId: "task-1024", runtimeMs: 542, status: "Success", timestamp: "2026-07-10T13:40:04Z", taskDescription: "Estimate Remaining Useful Life (RUL) for Pump P-101A using particle filtering telemetry model." }
    ],
    thinkingLog: [
      "MAINTENANCE: Analyzing telemetry stream for P-101A.",
      "MAINTENANCE: Input metrics: Radial DE Vibration = 7.2 mm/s, NDE Bearing Temp = 86.4°C.",
      "MAINTENANCE: Computing exponential degradation path. Baseline alpha = 0.0024, drift = 0.045.",
      "MAINTENANCE: Critical threshold crossing predicted in 42 hours (95% CI: 36-48 hours).",
      "MAINTENANCE: Identifying failures: high probability of impeller cavitation and wear ring erosion.",
      "MAINTENANCE: Recommendation: Swap to auxiliary pump P-101B. Inspect suction strainer."
    ]
  },
  {
    id: "agent-compliance",
    name: "Compliance Agent",
    status: "Idle",
