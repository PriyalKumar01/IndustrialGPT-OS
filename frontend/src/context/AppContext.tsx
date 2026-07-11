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
      setExecutiveMode("manager");
    }

    return updatedUser;
  };

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    const list = [
      { id: "u-1", name: "Marcus Vance", email: "m.vance@industrialgpt.os", role: "Plant Operator" as const, plantId: "TX-ALPHA" },
      { id: "u-2", name: "Elena Rostova", email: "e.rostova@industrialgpt.os", role: "Maintenance Engineer" as const, plantId: "TX-ALPHA" },
      { id: "u-3", name: "Siddharth Mehta", email: "s.mehta@industrialgpt.os", role: "Compliance Officer" as const, plantId: "TX-ALPHA" },
      { id: "u-4", name: "David Chen", email: "d.chen@industrialgpt.os", role: "Operations Manager" as const, plantId: "TX-ALPHA" },
      { id: "u-5", name: "Thomas Mueller", email: "t.mueller@industrialgpt.os", role: "Plant Administrator" as const, plantId: "TX-ALPHA" },
      { id: "u-6", name: "Sarah Jenkins", email: "s.jenkins@industrialgpt.os", role: "Executive" as const, plantId: "TX-ALPHA" }
    ];
    const matched = list.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (matched) {
      setUser(matched);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(matched));
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
    }
  };

  // Notification Operations
  const markNotificationRead = async (id: string) => {
    const updated = await apiService.markNotificationRead(id);
    setNotifications(updated);
  };

  const clearAllNotifications = async () => {
    const updated = await apiService.clearAllNotifications();
    setNotifications(updated);
  };

  const addNotification = (notif: Omit<SystemNotification, "id" | "timestamp" | "isRead">) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `n-gen-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // AI Config update
  const updateModelConfig = async (config: Partial<AIModelConfig>) => {
    const updated = await apiService.updateAIConfig(config);
    setModelConfig(updated);
  };

  // Keyboard shortcut listener for Command Palette (CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        users: [
          { id: "u-1", name: "Marcus Vance", email: "m.vance@industrialgpt.os", role: "Plant Operator", plantId: "TX-ALPHA" },
          { id: "u-2", name: "Elena Rostova", email: "e.rostova@industrialgpt.os", role: "Maintenance Engineer", plantId: "TX-ALPHA" },
          { id: "u-3", name: "Siddharth Mehta", email: "s.mehta@industrialgpt.os", role: "Compliance Officer", plantId: "TX-ALPHA" },
          { id: "u-4", name: "David Chen", email: "d.chen@industrialgpt.os", role: "Operations Manager", plantId: "TX-ALPHA" },
          { id: "u-5", name: "Thomas Mueller", email: "t.mueller@industrialgpt.os", role: "Plant Administrator", plantId: "TX-ALPHA" },
          { id: "u-6", name: "Sarah Jenkins", email: "s.jenkins@industrialgpt.os", role: "Executive", plantId: "TX-ALPHA" }
        ],
        isAuthenticated,
        login,
        logout,
        switchRole,
        currentPlant,
        setCurrentPlant,
        executiveMode,
        setExecutiveMode,
        notifications,
        unreadCount,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        commandPaletteOpen,
        setCommandPaletteOpen,
        modelConfig,
        updateModelConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// JSDoc: AppContext manages state for active plant and role-based access control.