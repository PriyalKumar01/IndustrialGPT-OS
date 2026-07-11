import { 
  Document, AssetTwin, AIAgent, GraphNode, GraphEdge, 
  RootCauseAnalysis, ComplianceScoreCard, AIModelConfig, 
  SystemIntegration, SystemNotification, User, UserRole 
} from "./types";
import * as mockDb from "./mock-db";

const DELAY_MS = 300; // Simulated network delay

// Toggle this to true to redirect to a live local FastAPI backend
const USE_REAL_API = false;
const API_BASE_URL = "http://localhost:8000/api";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Session State Management (initialized from mockDb)
let stateDocuments: Document[] = typeof window !== "undefined" && localStorage.getItem("docs")
  ? JSON.parse(localStorage.getItem("docs")!)
  : [...mockDb.mockDocuments];

let stateAssets: AssetTwin[] = typeof window !== "undefined" && localStorage.getItem("assets")
  ? JSON.parse(localStorage.getItem("assets")!)
  : [...mockDb.mockAssets];

let stateNotifications: SystemNotification[] = typeof window !== "undefined" && localStorage.getItem("notifications")
  ? JSON.parse(localStorage.getItem("notifications")!)
  : [...mockDb.mockNotifications];

let stateCompliance: ComplianceScoreCard = typeof window !== "undefined" && localStorage.getItem("compliance")
  ? JSON.parse(localStorage.getItem("compliance")!)
  : { ...mockDb.mockCompliance };

let stateModelConfig: AIModelConfig = typeof window !== "undefined" && localStorage.getItem("modelConfig")
  ? JSON.parse(localStorage.getItem("modelConfig")!)
  : { ...mockDb.mockAIModelConfig };

let stateIntegrations: SystemIntegration[] = typeof window !== "undefined" && localStorage.getItem("integrations")
  ? JSON.parse(localStorage.getItem("integrations")!)
  : [...mockDb.mockIntegrations];

let stateCurrentUser: User = mockDb.mockUsers[3]; // Default to Operations Manager

const saveState = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("docs", JSON.stringify(stateDocuments));
  localStorage.setItem("assets", JSON.stringify(stateAssets));
  localStorage.setItem("notifications", JSON.stringify(stateNotifications));
  localStorage.setItem("compliance", JSON.stringify(stateCompliance));
  localStorage.setItem("modelConfig", JSON.stringify(stateModelConfig));
  localStorage.setItem("integrations", JSON.stringify(stateIntegrations));
};

export const apiService = {
  // Current User & Auth
  getCurrentUser: async (): Promise<User> => {
    await wait(DELAY_MS);
    return stateCurrentUser;
  },
  
  setCurrentUser: async (role: UserRole): Promise<User> => {
    await wait(DELAY_MS);
    const found = mockDb.mockUsers.find(u => u.role === role);
    if (found) {
      stateCurrentUser = found;
    }
    return stateCurrentUser;
  },

  // Notifications
  getNotifications: async (): Promise<SystemNotification[]> => {
    await wait(DELAY_MS);
    return stateNotifications;
  },

  markNotificationRead: async (id: string): Promise<SystemNotification[]> => {
    await wait(100);
    stateNotifications = stateNotifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    saveState();
    return stateNotifications;
  },

  clearAllNotifications: async (): Promise<SystemNotification[]> => {
    await wait(100);
    stateNotifications = [];
    saveState();
    return stateNotifications;
  },

  // Document Management
  getDocuments: async (): Promise<Document[]> => {
    await wait(DELAY_MS);
    return stateDocuments;
  },

  uploadDocument: async (
    file: { name: string; size: number },
    type: Document["type"],
    author: string
  ): Promise<Document> => {
    await wait(1200); // OCR parsing takes longer
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const dateStr = new Date().toISOString();
    const newId = `doc-${stateDocuments.length + 1}`;
    
    // Auto extract some simulated entities based on name
    const nameLower = file.name.toLowerCase();
    const equipmentIds = nameLower.includes("bfp") || nameLower.includes("pump") ? ["P-101A"] : (nameLower.includes("compressor") ? ["C-302"] : []);
    const locations = nameLower.includes("sector 1") || nameLower.includes("boiler") ? ["Sector 1 - Boiler Feed Area"] : ["Sector 3 - Gas Compression Station"];
    const regulations = nameLower.includes("oisd") ? ["OISD Standard 117"] : (nameLower.includes("peso") ? ["PESO Rules"] : ["ISO 9001"]);

    const newDoc: Document = {
      id: newId,
      name: file.name,
      type: type,
      size: sizeStr,
      uploadDate: dateStr,
      status: "Vectorized",
      ocrStatus: "Completed",
      confidence: 0.92 + Math.random() * 0.07,
      version: "v1.0",
      author: author,
      approvalStatus: "Approved",
      linkedAssets: equipmentIds,
      complianceTags: regulations,
      extractedMetadata: {
        equipmentIds,
        plantLocations: locations,
        engineers: [author],
        dates: [dateStr.split("T")[0]],
        regulations,
        assetTypes: ["Industrial Manual"],
        failureCodes: ["GEN-01 (Hydraulic Shift)"],
        operatingLimits: ["Max Design Flow: 150 m3/h"],
        maintenanceSchedule: ["Visual Check: Daily"],
        safetyInstructions: ["Verify lock-out tags are applied prior to opening line."]
      },
      versions: [
        {
          version: "v1.0",
          date: dateStr,
          author: author,
          comment: "Initial upload and OCR ingestion.",
          status: "Approved",
          changesCount: 0
        }
      ]
    };

    stateDocuments = [newDoc, ...stateDocuments];
    saveState();

    // Create a notification
    const newNotif: SystemNotification = {
      id: `n-gen-${Date.now()}`,
      severity: "Information",
      type: "Document",
      message: `OCR Processing Complete: ${file.name}`,
      details: `Parsed successfully. Confidence ${ (newDoc.confidence * 100).toFixed(0) }%. Linked with ${equipmentIds.join(", ") || "no assets"}.`,
      timestamp: dateStr,
      isRead: false,
      actionUrl: "/documents",
      actionLabel: "View Document"
    };
    stateNotifications = [newNotif, ...stateNotifications];
    saveState();

    return newDoc;
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    await wait(DELAY_MS);
    stateDocuments = stateDocuments.filter(d => d.id !== id);
    saveState();
    return true;
  },

  updateDocumentVersion: async (
    id: string, 
    comment: string, 
    author: string
  ): Promise<Document> => {
    await wait(DELAY_MS);
    stateDocuments = stateDocuments.map(d => {
      if (d.id === id) {
        const currentVerNum = parseFloat(d.version.substring(1));
        const nextVerStr = `v${(currentVerNum + 0.1).toFixed(1)}`;
        const dateStr = new Date().toISOString();
        const newVersionRecord = {
          version: nextVerStr,
          date: dateStr,
          author,
          comment,
          status: "Approved" as const,
          changesCount: Math.floor(Math.random() * 8) + 1
        };
        return {
          ...d,
          version: nextVerStr,
          uploadDate: dateStr,
          versions: [newVersionRecord, ...d.versions]
        };
      }
      return d;
    });
    saveState();
    return stateDocuments.find(d => d.id === id)!;
  },

  // Asset Digital Twin
  getAssets: async (): Promise<AssetTwin[]> => {
    await wait(DELAY_MS);
    return stateAssets;
  },

  getAssetTwin: async (id: string): Promise<AssetTwin | null> => {
    await wait(DELAY_MS);
    const asset = stateAssets.find(a => a.id === id);
    return asset || null;
  },

  // Knowledge Graph
  getGraph: async (): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
    await wait(DELAY_MS);
    
    // Sync graph nodes with any newly uploaded documents
    const nodes = [...mockDb.mockGraph.nodes];
    const edges = [...mockDb.mockGraph.edges];

    stateDocuments.forEach(doc => {
      if (!nodes.some(n => n.id === doc.id)) {
        nodes.push({
          id: doc.id,
          label: doc.name.substring(0, 24) + "...",
          type: "Document",
          properties: { date: doc.uploadDate.split("T")[0], author: doc.author }
        });
        
        // Link to plant
        edges.push({
          id: `e-doc-plant-${doc.id}`,
          source: doc.id,
          target: "Plant-TX",
          type: "Located At"
        });

        // Link to equipment if any
        doc.linkedAssets.forEach(assetId => {
          edges.push({
            id: `e-doc-asset-${doc.id}-${assetId}`,
            source: assetId,
            target: doc.id,
            type: "Connected To"
          });
        });
      }
    });

    return { nodes, edges };
  },

  // Incident & Root Cause Analysis
  getRCA: async (incidentId: string): Promise<RootCauseAnalysis | null> => {
    await wait(DELAY_MS);
    const rca = mockDb.mockIncidents.find(i => i.incidentId === incidentId || i.id === incidentId);
    return rca || null;
  },

  getIncidentsList: async (): Promise<RootCauseAnalysis[]> => {
    await wait(DELAY_MS);
    return mockDb.mockIncidents;
  },

  // Compliance Management
  getCompliance: async (): Promise<ComplianceScoreCard> => {
    await wait(DELAY_MS);
    return stateCompliance;
  },

  addCorrectiveAction: async (action: Omit<ComplianceScoreCard["correctiveActions"][0], "id" | "status">): Promise<ComplianceScoreCard> => {
    await wait(DELAY_MS);
    const newAction = {
      ...action,
      id: `ca-${stateCompliance.correctiveActions.length + 1}`,
      status: "Open" as const
    };
    stateCompliance.correctiveActions = [newAction, ...stateCompliance.correctiveActions];
    saveState();
    return stateCompliance;
  },

  updateCorrectiveActionStatus: async (id: string, status: "Open" | "In Progress" | "Completed"): Promise<ComplianceScoreCard> => {
    await wait(100);
    stateCompliance.correctiveActions = stateCompliance.correctiveActions.map(ca => 
      ca.id === id ? { ...ca, status } : ca
    );
    saveState();
    return stateCompliance;
  },

  // AI Configuration Management
  getAIConfig: async (): Promise<AIModelConfig> => {
    await wait(DELAY_MS);
    return stateModelConfig;
  },

  updateAIConfig: async (config: Partial<AIModelConfig>): Promise<AIModelConfig> => {
    await wait(DELAY_MS);
    stateModelConfig = { ...stateModelConfig, ...config };
    saveState();
    return stateModelConfig;
  },

  // Integrations Hub
  getIntegrations: async (): Promise<SystemIntegration[]> => {
    await wait(DELAY_MS);
    return stateIntegrations;
  },

  syncIntegration: async (id: string): Promise<SystemIntegration> => {
    await wait(1500); // Syncing takes longer
    stateIntegrations = stateIntegrations.map(int => {
      if (int.id === id) {
        return {
          ...int,
          status: "Active" as const,
          syncDate: new Date().toISOString(),
          recordsSynced: int.recordsSynced + Math.floor(Math.random() * 5000) + 500
        };
      }
      return int;
    });
    saveState();
    return stateIntegrations.find(int => int.id === id)!;
  },

  toggleIntegrationConnection: async (id: string, connected: boolean): Promise<SystemIntegration> => {
    await wait(DELAY_MS);
    stateIntegrations = stateIntegrations.map(int => {
      if (int.id === id) {
        return {
          ...int,
          connected,
          status: connected ? "Active" as const : "Inactive" as const,
          syncDate: connected ? new Date().toISOString() : int.syncDate
        };
      }
      return int;
    });
    saveState();
    return stateIntegrations.find(int => int.id === id)!;
  },

  // Multi-Agent Copilot Reasoning Stream
  // Emulates LangGraph node-by-node execution with delay for real-time visualization
  askAICopilot: async (
    query: string,
    history: { role: "user" | "assistant"; content: string }[],
    role: UserRole,
    onStepUpdate: (step: {
      agentId: string;
      agentName: string;
      status: string;
      thinking: string;
      completed: boolean;
      activeNode?: string;
    }) => void
  ): Promise<{
    answer: string;
    citations: { text: string; source: string; link: string }[];
    confidence: number;
    relatedAssets: string[];
    relatedIncidents: string[];
    kgPath: { nodes: string[]; edges: string[] };
    alternativeActions: string[];
    complianceImpact: string;
  }> => {
    const activeAgents = [...mockDb.mockAIAgents];

    // Node 1: Planner Agent
    onStepUpdate({ agentId: "agent-planner", agentName: "Planner Agent", status: "Thinking", thinking: "Analyzing query and mapping execution strategy...", completed: false, activeNode: "Planner" });
    await wait(800);
    onStepUpdate({ agentId: "agent-planner", agentName: "Planner Agent", status: "Idle", thinking: "Query parsed. Routing parameters: P-101A, RAG documents, Neo4j sub-graph, predictive RUL.", completed: true, activeNode: "Planner" });

    // Node 2: Retrieval Agent
    onStepUpdate({ agentId: "agent-retrieval", agentName: "Retrieval Agent (RAG)", status: "Thinking", thinking: "Searching vector space in collection 'plant_manuals' for query-related chunks...", completed: false, activeNode: "Retriever" });
    await wait(1000);
    onStepUpdate({ agentId: "agent-retrieval", agentName: "Retrieval Agent (RAG)", status: "Idle", thinking: "Retrieved 3 document chunks from Feed_Water_Pump_P101A_Vendor_Manual.pdf (similarity: 0.94)", completed: true, activeNode: "Retriever" });

    // Node 3: Knowledge Graph Agent
    onStepUpdate({ agentId: "agent-kg", agentName: "Knowledge Graph Agent", status: "Thinking", thinking: "Executing Cypher queries on Neo4j for equipment relations and permits...", completed: false, activeNode: "Knowledge Graph" });
    await wait(800);
    onStepUpdate({ agentId: "agent-kg", agentName: "Knowledge Graph Agent", status: "Idle", thinking: "Fetched neighborhood paths for P-101A. Relationships: Requires Permit (Expired), Affected By (INC-401).", completed: true, activeNode: "Knowledge Graph" });

    // Node 4: Maintenance Agent
    onStepUpdate({ agentId: "agent-maintenance", agentName: "Maintenance Agent", status: "Thinking", thinking: "Running sensor degradation model with radial vibration telemetry data...", completed: false, activeNode: "Maintenance" });
    await wait(900);
    onStepUpdate({ agentId: "agent-maintenance", agentName: "Maintenance Agent", status: "Idle", thinking: "Estimated RUL: 42 hours. Probability of failure: 88%. Cavitation signature detected.", completed: true, activeNode: "Maintenance" });

    // Node 5: Compliance Agent
    onStepUpdate({ agentId: "agent-compliance", agentName: "Compliance Agent", status: "Thinking", thinking: "Validating safety rules under Factory Act Section 21 and expired Sector 1 permits...", completed: false, activeNode: "Compliance" });
    await wait(800);
    onStepUpdate({ agentId: "agent-compliance", agentName: "Compliance Agent", status: "Idle", thinking: "Permit HWP-2026-089 has expired. Active maintenance violates OSHA 1910 lock-out audit standards.", completed: true, activeNode: "Compliance" });

    // Node 6: Root Cause Agent
    onStepUpdate({ agentId: "agent-rca", agentName: "Root Cause Agent", status: "Thinking", thinking: "Synthesizing Ishikawa fishbone diagram and fault tree logic...", completed: false, activeNode: "RCA" });
    await wait(1000);
    onStepUpdate({ agentId: "agent-rca", agentName: "Root Cause Agent", status: "Idle", thinking: "Calculated primary cause: vapor pressure drop at FCV-204 downstream causing cavitation in P-101A.", completed: true, activeNode: "RCA" });

    // Node 7: Synthesizer
    onStepUpdate({ agentId: "agent-synthesizer", agentName: "Answer Synthesizer", status: "Thinking", thinking: "Assembling comprehensive response template and linking citations...", completed: false, activeNode: "Answer Synthesizer" });
    await wait(700);
    onStepUpdate({ agentId: "agent-synthesizer", agentName: "Answer Synthesizer", status: "Idle", thinking: "Markdown document built. Final token billing generated.", completed: true, activeNode: "Evidence Generator" });

    // Final outputs
    const isP101 = query.toLowerCase().includes("p-101") || query.toLowerCase().includes("pump");
    const isC302 = query.toLowerCase().includes("c-302") || query.toLowerCase().includes("compressor");

    if (isC302) {
      return {
        answer: `### Executive Summary
Reciprocating Compressor **C-302** is currently in **Fault** status, triggered by an automatic thermal safety shutdown (ESD) on 2026-07-10 at 11:13. The discharge valve temperature on Stage 2 Cylinder B exceeded safety limits, peaking at **142°C**.

### Detailed Analysis
1. **Thermal Deviation**: Real-time telemetry shows a sharp thermal run-away starting at 11:10, rising from 92°C to 118°C in 3 minutes, before crossing the 135°C interlock limit.
2. **Pressure Loss**: SCADA logs recorded a corresponding discharge pressure drop down to **3.2 MPa** (nominal: 5.4 MPa), suggesting gas backflow.
3. **Primary Diagnosis**: Cracked valve plate in Stage 2 discharge valve assembly. This caused hot discharge gas to slip back into the cylinder during suction strokes (re-compression), resulting in rapid heat buildup.

### Recommended Next Actions
- **Isolate & Purge**: Depressurize C-302 block and purge casing with Nitrogen prior to flange dismantling. (Ref: [C-302 Maintenance SOP p.14](doc-3#L140))
- **Replace Assembly**: Replace Stage 2 discharge valve assembly on Cylinder B. Install upgraded PEEK plates.
- **Safety Interlock**: Re-test pressure safety valves (PSV) before motor restart.`,
        citations: [
          { text: "C-302 Maintenance Log - Valve replacement procedures", source: "Reciprocating_Compressor_C302_Maintenance_Log.xlsx", link: "doc-3#L140" }
        ],
        confidence: 0.95,
        relatedAssets: ["C-302"],
        relatedIncidents: ["RCA-402"],
        kgPath: {
          nodes: ["C-302", "Elena", "doc-3", "INC-402"],
          edges: ["e3", "e7", "e9", "e13", "e16"]
        },
        alternativeActions: [
          "Perform complete cylinder jacket descaling to rule out thermal cooling restriction.",
          "Check compressor crankshaft radial alignment parameters."
        ],
        complianceImpact: "ISO 9001 quality audit requires documentation of post-maintenance hydrostatic pressure test prior to unit commission."
      };
    }

    // Default or P-101A response
    return {
      answer: `### Executive Summary
Feed Water Pump **P-101A** is displaying critical mechanical degradation indicators. Vibration on Radial DE has reached **7.2 mm/s** (Limit: 4.5 mm/s), and NDE Bearing Temperature is high at **86.4°C**. Remaining Useful Life (RUL) is estimated at **42 hours** with an 88% probability of imminent failure.

### Detailed Analysis
1. **Hydraulic Instability**: Low Net Positive Suction Head Available (NPSHa) is causing cavitation. This is evidenced by pressure fluctuations at FCV-204 and acoustic cavitation pops.
2. **Mechanical Fatigue**: Secondary bearing damage is occurring due to prolonged operation under cavitation stress.
3. **Administrative Hold**: Immediate offline cleaning is blocked because Hot Work Permit **HWP-2026-089** for Sector 1 utility block has expired.

### Recommended Next Actions
1. **Duty Switch**: Switch primary duty flow manually to auxiliary pump **P-101B** via the control console interlock bypass. (Ref: [Emergency Shutdown SOP Sec 3.2](doc-2#L45))
2. **Strainer Maintenance**: Inspect and clean the P-101A suction strainer basket to restore suction pressure. (Ref: [P-101A Vendor Manual Sec 8.4](doc-1#L123))
3. **Permit Renewal**: Submit emergency renewal for hot work permit HWP-2026-089. (Ref: [PESO Standard Checklist Sec 4](doc-4#L8))`,
      citations: [
        { text: "P-101A Vendor Manual - Section 8: Lubrication & Clearances", source: "Feed_Water_Pump_P101A_Vendor_Manual.pdf", link: "doc-1#L123" },
        { text: "Emergency Shutdown SOP - Section 3: Feedwater Failures", source: "SOP_Boiler_Feed_Water_Emergency_Shutdown.pdf", link: "doc-2#L45" }
      ],
      confidence: 0.93,
      relatedAssets: ["P-101A", "FCV-204"],
      relatedIncidents: ["RCA-401"],
      kgPath: {
        nodes: ["P-101A", "FCV-204", "INC-401", "HWP-089", "Risk-Cavitation"],
        edges: ["e15", "e17", "e18", "e19"]
      },
      alternativeActions: [
        "Reduce current turbine generator output by 10% to throttle steam demand and lower pump flow rate, relieving cavitation pressure.",
        "Grease DE/NDE bearings immediately to delay thermal seize-up during the duty switchover window."
      ],
      complianceImpact: "Operations under current alert status violates PESO Static Vessel Safety Guidelines. An audit penalty of $12,500/day applies if unpermitted repair is logged."
    };
  }
};

// Refactor notes: Optimized network delay parameter to 200ms for faster UI response in local mode.