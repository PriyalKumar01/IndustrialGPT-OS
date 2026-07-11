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

