"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { AIAgent, UserRole } from "@/services/types";
import { 
  BrainCircuit, Send, ArrowRight, FileText, Cpu, 
  HelpCircle, AlertTriangle, ShieldCheck, RefreshCw, 
  ChevronRight, Sparkles, BookOpen, Compass, Activity, CheckCircle
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isProcessing?: boolean;
  citations?: { text: string; source: string; link: string }[];
  confidence?: number;
  relatedAssets?: string[];
  relatedIncidents?: string[];
  kgPath?: { nodes: string[]; edges: string[] };
  alternativeActions?: string[];
  complianceImpact?: string;
}

interface AgentStep {
  agentId: string;
  agentName: string;
  status: string;
  thinking: string;
  completed: boolean;
  activeNode?: string;
}

export default function AIWorkspacePage() {
  const { user, modelConfig } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      role: "assistant",
      content: `### Welcome to IndustrialGPT Copilot
I am connected to the Texas Plant Alpha knowledge base. I have indexed:
* **4 Core Manuals & SOPs** (API 610, Emergency shutdown SOP, boiler P&ID, etc.)
* **4 Asset Digital Twins** (P-101A, C-302, FCV-204, GT-401)
* **2 Historical Incident RCA registries** (INC-401, INC-402)

Choose one of the suggestions below or enter a custom query to start the LangGraph multi-agent diagnostic runner.`
    }
  ]);

  const [input, setInput] = useState("");
  const [activeRightTab, setActiveRightTab] = useState<"citations" | "explain" | "subgraph">("citations");
  const [activeCaseId, setActiveCaseId] = useState<string>("case-new");
  
  // Agent Stream State
  const [activeAgentStep, setActiveAgentStep] = useState<AgentStep | null>(null);
  const [agentThinkingLogs, setAgentThinkingLogs] = useState<string[]>([]);
  const [activeExecutionNode, setActiveExecutionNode] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions list
  const suggestions = [
    "Explain current alert on P-101A and draft preventive actions",
    "Analyze compressor C-302 automatic trip and failure causes"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Add User Message
    const userMsg: Message = { id: `m-usr-${Date.now()}`, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAgentThinkingLogs([]);
    setActiveExecutionNode("Request");
    
    // Add Placeholder Assistant Message
    const assistantMsgId = `m-ast-${Date.now()}`;
    const placeholderMsg: Message = { 
      id: assistantMsgId, 
      role: "assistant", 
      content: "", 
      isProcessing: true 
    };
    setMessages(prev => [...prev, placeholderMsg]);

    try {
      // Trigger API query streaming callback
      const result = await apiService.askAICopilot(
        text, 
        messages.map(m => ({ role: m.role, content: m.content })),
        user.role,
        (step) => {
          setActiveAgentStep(step);
          setAgentThinkingLogs(prev => [...prev, `${step.agentName.toUpperCase()}: ${step.thinking}`]);
          if (step.activeNode) {
            setActiveExecutionNode(step.activeNode);
          }
        }
      );

      // Update Assistant Message with final outputs
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { 
              ...m, 
              content: result.answer, 
              isProcessing: false,
              citations: result.citations,
              confidence: result.confidence,
              relatedAssets: result.relatedAssets,
              relatedIncidents: result.relatedIncidents,
              kgPath: result.kgPath,
              alternativeActions: result.alternativeActions,
              complianceImpact: result.complianceImpact
            }
          : m
      ));
      
      setActiveExecutionNode("Completed");
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: "Error: Failed to retrieve answer from LangGraph orchestrator.", isProcessing: false }
          : m
      ));
      setActiveExecutionNode("Failed");
    } finally {
      setActiveAgentStep(null);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentThinkingLogs]);

  // Selected assistant response (always inspector values of the latest assistant message)
  const assistantMessages = messages.filter(m => m.role === "assistant" && !m.isProcessing);
  const activeInspectorMsg = assistantMessages[assistantMessages.length - 1];

  const getAgentNodeClass = (nodeName: string) => {
    if (activeExecutionNode === "Completed") return "bg-green-100 text-green-800 border-green-300";
    if (activeExecutionNode === "Failed") return "bg-red-100 text-red-800 border-red-300";
    return activeExecutionNode === nodeName 
      ? "bg-blue-100 text-blue-800 border-blue-500 font-bold animate-pulse" 
      : "bg-gray-50 text-gray-400 border-gray-200";
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)] overflow-hidden">
      
      {/* 1. Left Panel: Conversation History & Cases */}
      <div className="w-56 bg-white border border-gray-200 rounded-sharp shadow-subtle p-4 flex flex-col gap-4 shrink-0">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Historical Investigations</span>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveCaseId("case-new")}
              className={`w-full text-left p-2 rounded text-xs transition-all-custom flex items-center gap-2 ${
                activeCaseId === "case-new" ? "bg-gray-100 font-semibold text-gray-900" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Current Session</span>
            </button>
            <button 
              onClick={() => {
                setActiveCaseId("case-p101a");
                handleSend("Explain current alert on P-101A and draft preventive actions");
              }}
              className="w-full text-left p-2 rounded text-xs hover:bg-gray-50 text-gray-600 truncate flex items-center gap-2"
            >
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              <span>Case #1: P-101A Cavitation</span>
            </button>
            <button 
              onClick={() => {
                setActiveCaseId("case-c302");
                handleSend("Analyze compressor C-302 automatic trip and failure causes");
              }}
              className="w-full text-left p-2 rounded text-xs hover:bg-gray-50 text-gray-600 truncate flex items-center gap-2"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              <span>Case #2: C-302 Thermal Trip</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="flex-1 text-[11px] text-gray-500 leading-normal space-y-2">
          <span className="font-bold text-gray-700">Copilot Parameters</span>
          <div>
            <span>Model:</span>
            <span className="block font-mono text-gray-900">{modelConfig.currentModel}</span>
          </div>
          <div>
            <span>Temperature:</span>
            <span className="block font-mono text-gray-900">{modelConfig.temperature}</span>
          </div>
          <div>
            <span>Prompt:</span>
            <span className="block font-mono text-gray-900">{modelConfig.promptVersion}</span>
          </div>
        </div>
      </div>

      {/* 2. Center Panel: AI Conversation Pane */}
      <div className="flex-1 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden min-w-0">
        
        {/* Chat Header */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-[#2563EB]" />
            <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Enterprise Copilot Workspace</span>
          </div>
