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

