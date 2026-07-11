"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, SystemNotification, AIModelConfig } from "../services/types";
import { apiService } from "../services/api-client";

interface AppContextType {
  // Auth & RBAC
  user: User;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<User>;
  
  // Workspace / View Toggle
  currentPlant: string;
  setCurrentPlant: (plant: string) => void;
  executiveMode: "operator" | "manager" | "executive";
  setExecutiveMode: (mode: "operator" | "manager" | "executive") => void;

  // Notifications
  notifications: SystemNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: Omit<SystemNotification, "id" | "timestamp" | "isRead">) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // AI Configuration
  modelConfig: AIModelConfig;
  updateModelConfig: (config: Partial<AIModelConfig>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isAuthenticated") === "true";
    }
    return false;
  });

  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser");
      if (stored) return JSON.parse(stored);
    }
    return {
      id: "u-4",
      name: "David Chen",
      email: "d.chen@industrialgpt.os",
      role: "Operations Manager",
      plantId: "TX-ALPHA"
    };
  });
  
  // Workspace & Executive Mode
  const [currentPlant, setCurrentPlant] = useState("TX-ALPHA");
  const [executiveMode, setExecutiveMode] = useState<"operator" | "manager" | "executive">("manager");

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // AI Model Config
  const [modelConfig, setModelConfig] = useState<AIModelConfig>({
    currentModel: "Gemini 1.5 Pro (Enterprise)",
    embeddingModel: "Text-Embedding-004 (Google)",
    temperature: 0.15,
    contextWindow: "1,048,576 Tokens",
    promptVersion: "v4.1.8-production",
    agentVersion: "LangGraph-Orchestration-v2.1",
    latencyMs: 340,
    costPerMillionTokens: 2.50,
    tokenUsage: { input: 14250800, output: 4890300 }
  });

  // Init Data
  useEffect(() => {
    async function loadData() {
      const u = await apiService.getCurrentUser();
      setUser(u);
      
      const notifs = await apiService.getNotifications();
      setNotifications(notifs);
      
      const config = await apiService.getAIConfig();
      setModelConfig(config);
    }
    loadData();
  }, []);

  // Sync Unread Count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  // Auth Switch Role
  const switchRole = async (role: UserRole) => {
    const updatedUser = await apiService.setCurrentUser(role);
    setUser(updatedUser);
    
    // Automatically adjust Executive Mode to align with role
    if (role === "Executive") {
      setExecutiveMode("executive");
    } else if (role === "Plant Operator" || role === "Maintenance Engineer") {
      setExecutiveMode("operator");
    } else {
