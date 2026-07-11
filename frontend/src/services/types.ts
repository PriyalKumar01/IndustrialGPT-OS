// Type-Safe API Contracts representing FastAPI & LangGraph schemas

export type UserRole =
  | "Plant Operator"
  | "Maintenance Engineer"
  | "Compliance Officer"
  | "Operations Manager"
  | "Plant Administrator"
  | "Executive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  plantId: string;
}

export type DocumentStatus = "Processing" | "Vectorized" | "Failed";
export type OcrStatus = "Pending" | "Processing" | "Completed" | "Failed";
export type DocumentApprovalStatus = "Draft" | "Pending Review" | "Approved";

export interface ExtractedMetadata {
  equipmentIds: string[];
  plantLocations: string[];
  engineers: string[];
  dates: string[];
  regulations: string[];
  assetTypes: string[];
  failureCodes: string[];
  operatingLimits: string[];
  maintenanceSchedule: string[];
  safetyInstructions: string[];
}

export interface DocumentVersion {
  version: string;
  date: string;
  author: string;
  comment: string;
  status: DocumentApprovalStatus;
  changesCount: number;
}

export interface Document {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "PPT" | "Excel" | "Drawing" | "SOP" | "Log";
  size: string;
  uploadDate: string;
  status: DocumentStatus;
  ocrStatus: OcrStatus;
  confidence: number; // 0.0 to 1.0
  version: string;
  author: string;
  approvalStatus: DocumentApprovalStatus;
  extractedMetadata: ExtractedMetadata;
  versions: DocumentVersion[];
  linkedAssets: string[];
  complianceTags: string[];
}

// Knowledge Graph
export type NodeType =
  | "Equipment"
  | "Valve"
  | "Pump"
  | "Turbine"
  | "Engineer"
  | "Inspection"
  | "Permit"
  | "Document"
  | "Incident"
  | "Maintenance"
  | "Plant"
  | "Risk";

export type EdgeType =
  | "Connected To"
  | "Maintained By"
  | "Located At"
  | "Affected By"
  | "Related Incident"
  | "Manufacturer"
  | "Requires Permit";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  properties: {
    status?: string;
    health?: number;
    location?: string;
    engineerName?: string;
    role?: string;
    date?: string;
    severity?: string;
    standard?: string;
    complianceScore?: number;
    description?: string;
    [key: string]: any;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
}

// Asset Digital Twin
export type AssetStatus = "Running" | "Idle" | "Fault";

export interface TelemetryMetric {
  timestamp: string;
  value: number;
}

export interface TelemetryData {
  temperature: TelemetryMetric[];
  pressure: TelemetryMetric[];
  vibration: TelemetryMetric[];
  oilContamination: TelemetryMetric[];
}

export interface AssetTwin {
  id: string;
  name: string;
  tag: string;
  type: "Pump" | "Compressor" | "Valve" | "Turbine";
  status: AssetStatus;
  healthScore: number; // 0-100
  failureProbability: number; // 0.0 - 1.0
  remainingUsefulLife: number; // in hours
  location: string;
  manufacturer: string;
  model: string;
  installDate: string;
  runtimeHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  telemetry: TelemetryData;
  degradationCurve: { hours: number; normal: number; predicted: number }[];
  alerts: string[];
  openIncidentsCount: number;
  relatedDocuments: string[];
  complianceStatus: "Compliant" | "Non-Compliant" | "Pending Review";
  aiRecommendation: string;
  maintenanceCostEstimate: number;
  downtimeEstimateHours: number;
  severityClass: "Critical" | "High" | "Medium" | "Low";
}

// AI Agent Tracking
export type AgentStatus = "Idle" | "Thinking" | "Processing";

export interface AgentExecution {
  taskId: string;
  runtimeMs: number;
  status: "Success" | "Failed";
  timestamp: string;
  taskDescription: string;
}

export interface AIAgent {
  id: string;
  name: string;
  status: AgentStatus;
  currentTask: string;
  queueLength: number;
  tokensProcessed: number;
  runtimeMs: number;
  successRate: number; // 0 to 100
  dependencies: string[];
  processingTimeline: number[]; // array of last runtimes
  previousExecutions: AgentExecution[];
  thinkingLog: string[];
}

// Notifications
export type NotificationSeverity = "Critical" | "High" | "Medium" | "Low" | "Information";
export type NotificationType =
  | "Maintenance"
  | "Compliance"
  | "Incident"
  | "Agent"
  | "Document"
  | "Failure"
  | "Audit";

export interface SystemNotification {
  id: string;
  severity: NotificationSeverity;
  type: NotificationType;
  message: string;
  details?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Incident & Root Cause Analysis
export interface RCAEvent {
  time: string;
  event: string;
  type: "anomaly" | "action" | "system" | "external";
  details?: string;
}

export interface FishboneCategory {
  category: "Man" | "Machine" | "Material" | "Method" | "Measurement" | "Environment";
  causes: string[];
}

export interface FaultTreeNode {
  id: string;
  label: string;
  type: "AND" | "OR" | "EVENT" | "ROOT_CAUSE";
  probability?: number;
  children?: string[];
}

export interface HistoricalIncident {
  id: string;
  title: string;
  date: string;
  similarity: number; // 0 to 1.0
  resolution: string;
}

export interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  title: string;
  assetId: string;
  severity: "Critical" | "High" | "Medium";
  date: string;
  status: "Under Investigation" | "Resolved" | "Mitigated";
  timeline: RCAEvent[];
  fishbone: FishboneCategory[];
  faultTree: Record<string, FaultTreeNode>;
  contributingFactors: string[];
  historicalIncidents: HistoricalIncident[];
  aiExplanation: string;
  preventiveActions: string[];
}

// Compliance
export interface MissingPermit {
  id: string;
  name: string;
  requiredFor: string;
  status: "Expired" | "Missing" | "Overdue";
  dueDate: string;
}

export interface CorrectiveAction {
  id: string;
  action: string;
  regulation: string;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  deadline: string;
  status: "Open" | "In Progress" | "Completed";
}

export interface ComplianceScoreCard {
  overallScore: number; // 0-100
  standards: {
    name: string; // Factory Act, OISD, PESO, ISO 14001, etc.
    score: number;
    status: "Compliant" | "Non-Compliant" | "Warning";
  }[];
  missingPermits: MissingPermit[];
  correctiveActions: CorrectiveAction[];
  riskHeatmap: {
    likelihood: 1 | 2 | 3 | 4 | 5;
    severity: 1 | 2 | 3 | 4 | 5;
    count: number;
    incidents: string[];
  }[];
}

// AI Model Configurations
export interface AIModelConfig {
  currentModel: string;
  embeddingModel: string;
  temperature: number;
  contextWindow: string;
  promptVersion: string;
  agentVersion: string;
  latencyMs: number;
  costPerMillionTokens: number;
  tokenUsage: {
    input: number;
    output: number;
  };
}

// Integrations
export interface SystemIntegration {
  id: string;
  name: string;
  type: "ERP" | "CMMS" | "SCADA" | "Cloud" | "IAM" | "Collab";
  connected: boolean;
  status: "Active" | "Inactive" | "Syncing" | "Error";
  syncDate: string;
  icon: string;
  recordsSynced: number;
}
