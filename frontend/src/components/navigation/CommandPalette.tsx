"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Search, FileText, Activity, Shield, AlertTriangle, 
  HelpCircle, Settings, Laptop, ArrowRight 
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  category: "Actions" | "Navigation" | "Assets" | "Documents";
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setExecutiveMode } = useApp();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command items catalog
  const commands: CommandItem[] = [
    {
      id: "action-upload",
      category: "Actions",
      title: "Upload Document",
      subtitle: "Ingest a new engineering PDF/DWG, run OCR and vector embeddings",
      icon: FileText,
      action: () => {
        router.push("/documents?action=upload");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "action-ai",
      category: "Actions",
      title: "Run AI Analysis (Copilot)",
      subtitle: "Open Copilot workspace to run complex RAG & Graph queries",
      icon: HelpCircle,
      action: () => {
        router.push("/copilot");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "action-compliance",
      category: "Actions",
      title: "Run Compliance Audit",
      subtitle: "Analyze missing permits and audit readiness scores",
      icon: Shield,
      action: () => {
        router.push("/compliance");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-p101a",
      category: "Assets",
      title: "Open Digital Twin: Boiler Feed Pump P-101A",
      subtitle: "View real-time vibration metrics, degradation curves, and RUL",
      icon: Activity,
      action: () => {
        router.push("/twin?id=P-101A");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-c302",
      category: "Assets",
      title: "Open Digital Twin: Gas Compressor C-302",
      subtitle: "Inspect Stage 2 valve trip details and active RCA trees",
      icon: Activity,
      action: () => {
        router.push("/twin?id=C-302");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-dashboard",
      category: "Navigation",
      title: "Go to Executive Dashboard",
      subtitle: "Executive KPI summaries, asset health, and ROI metrics",
      icon: Laptop,
      action: () => {
        router.push("/");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-graph",
      category: "Navigation",
      title: "Open Neo4j Knowledge Graph Workspace",
      subtitle: "Interact with equipment node relationships and permissions",
      icon: Laptop,
      action: () => {
        router.push("/graph");
        setCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Open Enterprise Settings",
      subtitle: "Configure AI models, users, integrations and alerts",
      icon: Settings,
      action: () => {
        router.push("/settings");
        setCommandPaletteOpen(false);
      }
    }
  ];

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCommandPaletteOpen(false);
      }
    }
    if (commandPaletteOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Filter commands
  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase()) ||
    (cmd.subtitle && cmd.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, filtered, selectedIndex, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#101418]/60 flex justify-center pt-24 z-50 px-4 backdrop-blur-xs">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-sharp shadow-panel h-[420px] flex flex-col overflow-hidden"
      >
        {/* Input */}
        <div className="p-3.5 border-b border-gray-200 flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          <span className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0 select-none">
            ESC to close
          </span>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No matching commands or assets found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  className={`p-3 rounded-sharp flex items-center justify-between cursor-pointer transition-all-custom ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded bg-gray-50 text-gray-600 ${isSelected ? "bg-white border border-gray-200" : ""}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-semibold text-gray-900 truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="h-4 w-4 text-[#2563EB]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard navigation helper footer */}
        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-[10px] text-gray-400 select-none">
          <div className="flex items-center gap-1.5">
            <span>Use</span>
            <kbd className="bg-white border border-gray-300 rounded px-1 shadow-xs">↑↓</kbd>
            <span>to navigate</span>
            <span className="mx-1">|</span>
            <kbd className="bg-white border border-gray-300 rounded px-1 shadow-xs">Enter</kbd>
            <span>to select</span>
          </div>
          <div>
            <span>IndustrialGPT OS Command Suite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
