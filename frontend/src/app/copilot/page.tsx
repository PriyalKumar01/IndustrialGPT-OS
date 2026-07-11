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
          <span className="text-[10px] text-gray-400 font-mono">Agent Version: {modelConfig.agentVersion}</span>
        </div>

        {/* Chat Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] p-4 rounded-sharp border text-xs leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#2563EB] text-white border-[#2563EB]" 
                    : "bg-white text-gray-900 border-gray-200 shadow-sm"
                }`}
              >
                {/* Render structured markdown elements */}
                <div className="space-y-3 whitespace-pre-wrap select-text">
                  {msg.content.split("\n\n").map((block, idx) => {
                    if (block.startsWith("### ")) {
                      return <h4 key={idx} className="font-bold text-gray-900 mt-2 border-b border-gray-100 pb-1 uppercase text-[10px] tracking-wider">{block.replace("### ", "")}</h4>;
                    }
                    if (block.startsWith("* ")) {
                      return (
                        <ul key={idx} className="list-disc pl-4 space-y-1">
                          {block.split("\n").map((li, lidx) => (
                            <li key={lidx}>{li.replace("* ", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{block}</p>;
                  })}
                </div>
              </div>

              {/* Message metadata under assistant bubbles */}
              {msg.role === "assistant" && msg.confidence && (
                <div className="pl-2 text-[10px] text-gray-400 flex items-center gap-2">
                  <span>Confidence: <strong className="text-gray-800 font-mono">{ (msg.confidence * 100).toFixed(0) }%</strong></span>
                  <span>|</span>
                  <span>Citations: <strong className="text-[#2563EB]">{msg.citations?.length || 0} references</strong></span>
                </div>
              )}
            </div>
          ))}

          {/* Dynamic multi-agent execution timeline (Visible only while processing) */}
          {activeAgentStep && (
            <div className="border border-blue-200 rounded-sharp p-4 bg-blue-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#2563EB] animate-spin" />
                  <span className="text-xs font-semibold text-gray-900">LangGraph Active Runner: <strong className="text-[#2563EB]">{activeAgentStep.agentName}</strong></span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{activeAgentStep.status}</span>
              </div>

              {/* Graph nodes flow chart */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold text-gray-400">
                <div className={`p-1.5 border rounded ${getAgentNodeClass("Planner")}`}>Planner</div>
                <div className={`p-1.5 border rounded ${getAgentNodeClass("Retriever")}`}>RAG Vector</div>
                <div className={`p-1.5 border rounded ${getAgentNodeClass("Knowledge Graph")}`}>Neo4j Graph</div>
                <div className={`p-1.5 border rounded ${getAgentNodeClass("Maintenance") || getAgentNodeClass("Compliance") || getAgentNodeClass("RCA")}`}>Specialists</div>
                <div className={`p-1.5 border rounded ${getAgentNodeClass("Evidence Generator")}`}>Synthesizer</div>
              </div>

              {/* Dynamic console log stream of agent thinking */}
              <div className="bg-gray-900 rounded p-2.5 font-mono text-[9px] text-[#10B981] h-28 overflow-y-auto space-y-1">
                {agentThinkingLogs.map((log, idx) => (
                  <div key={idx} className="leading-normal">{log}</div>
                ))}
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-[#10B981] rounded-full animate-ping" />
                  <span className="text-gray-500">_</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3 shrink-0">
          {/* Quick Suggestions tags */}
          {messages.length === 1 && (
            <div className="flex gap-2 flex-wrap">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 hover:border-[#2563EB] hover:text-[#2563EB] rounded text-[11px] text-gray-600 font-medium transition-all-custom text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask Copilot about asset metrics, safety SOPs, compliance tags..."
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#2563EB] bg-white text-gray-900"
            />
            <button
              onClick={() => handleSend(input)}
              className="absolute right-1.5 top-1.5 p-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded focus:outline-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Right Panel: Evidence & Explainability */}
      <div className="w-80 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
        {/* Right Header Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider">
          {(["citations", "explain", "subgraph"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`flex-1 py-3 text-center border-r border-gray-200 last:border-r-0 focus:outline-none ${
                activeRightTab === tab 
                  ? "bg-white text-gray-900 border-b-2 border-b-[#2563EB]" 
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab === "citations" ? "Evidence Sources" : tab === "explain" ? "Explainability" : "Traversed Path"}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {!activeInspectorMsg ? (
            <div className="h-full flex items-center justify-center text-center text-gray-400 p-6 leading-normal">
              No evidence loaded. Submit a query to trigger LangGraph evidence retrieval.
            </div>
          ) : (
            <React.Fragment>
              
              {/* Tab 1: Source Citations */}
              {activeRightTab === "citations" && (
                <div className="space-y-4">
                  <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">RAG Vector Citations</span>
                  {activeInspectorMsg.citations?.map((cit, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/documents?id=${cit.link.split("#")[0]}`}
                          className="font-bold text-[#2563EB] hover:underline flex items-center gap-1 truncate max-w-[80%]"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{cit.source}</span>
                        </Link>
                        <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                          {(activeInspectorMsg.confidence! * 100 - idx * 2).toFixed(0)}% sim
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed italic border-l-2 border-gray-300 pl-2">
                        "... {cit.text} ..."
                      </p>
                    </div>
                  ))}

                  {/* Compliance Impact */}
                  {activeInspectorMsg.complianceImpact && (
                    <div className="p-3 border border-purple-200 rounded bg-purple-50/50 space-y-1">
                      <span className="font-bold text-purple-700 uppercase text-[9px] block">Compliance Standard Audit Impact</span>
                      <p className="text-gray-700 font-medium text-[11px] leading-relaxed">
                        {activeInspectorMsg.complianceImpact}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Explainability Path */}
              {activeRightTab === "explain" && (
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Why this answer?</span>
                    <p className="text-gray-600 leading-relaxed mt-1">
                      The model verified the mechanical telemetry anomalies on the asset and correlated them with the maintenance logs and piping schematics retrieved by the sub-agents.
                    </p>
                  </div>

                  {/* Confidence Breakdown Gauge */}
                  <div className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2">
                    <span className="font-bold text-gray-700 block">Confidence Core Metrics</span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span>Vector Coverage:</span>
                        <span className="font-mono text-gray-900 font-semibold">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neo4j Graph Consensus:</span>
                        <span className="font-mono text-gray-900 font-semibold">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Historical Consistency:</span>
                        <span className="font-mono text-gray-900 font-semibold">88%</span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Actions */}
                  {activeInspectorMsg.alternativeActions && (
                    <div className="space-y-2">
                      <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Alternative AI Recommendations</span>
                      <div className="space-y-1.5">
                        {activeInspectorMsg.alternativeActions.map((act, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-gray-700 bg-gray-50 p-2 border border-gray-200 rounded leading-normal">
                            <Compass className="h-4 w-4 text-[#0EA5E9] shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Traversed Path (Sub-graph SVG) */}
              {activeRightTab === "subgraph" && (
                <div className="space-y-4">
                  <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Traversed Neo4j Path</span>
                  <p className="text-[11px] text-gray-500">Nodes and relationships evaluated during multi-agent Cypher retrieval.</p>
                  
                  {/* Small sub-graph schematic */}
                  <div className="h-40 border border-gray-200 rounded bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-full h-full">
                      {/* Lines */}
                      <line x1="50" y1="80" x2="130" y2="40" stroke="#2563EB" strokeWidth={1.5} />
                      <line x1="130" y1="40" x2="210" y2="80" stroke="#2563EB" strokeWidth={1.5} />
                      <line x1="130" y1="40" x2="130" y2="120" stroke="#2563EB" strokeWidth={1.5} />

                      {/* Nodes */}
                      <circle cx="50" cy="80" r="10" fill="#F59E0B" />
                      <text x="50" y="98" textAnchor="middle" fontSize={8} fontWeight="bold" fill="#374151">P-101A</text>
                      
                      <circle cx="130" cy="40" r="12" fill="#2563EB" />
                      <text x="130" y="24" textAnchor="middle" fontSize={8} fontWeight="bold" fill="#374151">INC-401</text>

                      <circle cx="210" cy="80" r="10" fill="#DC2626" />
                      <text x="210" y="98" textAnchor="middle" fontSize={8} fontWeight="bold" fill="#374151">Risk</text>

                      <circle cx="130" cy="120" r="10" fill="#8B5CF6" />
                      <text x="130" y="138" textAnchor="middle" fontSize={8} fontWeight="bold" fill="#374151">HWP-089</text>
                    </svg>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>Query latency:</span>
                      <span className="font-mono font-semibold">18ms</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>Evaluated relations:</span>
                      <span className="font-mono font-semibold">12 edges</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Assets / Incidents list footer */}
              <div className="border-t border-gray-200 mt-6 pt-4 space-y-3">
                <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Connected Entities</span>
                
                {/* Related Assets */}
                {activeInspectorMsg.relatedAssets && activeInspectorMsg.relatedAssets.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-gray-500 block text-[10px]">Linked Equipment</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {activeInspectorMsg.relatedAssets.map(assetId => (
                        <Link 
                          key={assetId}
                          href={`/twin?id=${assetId}`}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded font-mono font-bold"
                        >
                          {assetId}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Incidents */}
                {activeInspectorMsg.relatedIncidents && activeInspectorMsg.relatedIncidents.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    <span className="text-gray-500 block text-[10px]">Related Incidents (RCA)</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {activeInspectorMsg.relatedIncidents.map(incId => (
                        <Link 
                          key={incId}
                          href={`/maintenance?tab=rca&incidentId=${incId}`}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded font-bold"
                        >
                          {incId}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </React.Fragment>
          )}
        </div>

        {/* Right Footer Download Report */}
        {activeInspectorMsg && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => alert("Generating unified PDF document containing full multi-agent diagnostic trace, RAG citations, and Cypher paths...")}
              className="w-full flex items-center justify-center gap-1.5 bg-[#16A34A] hover:bg-green-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
            >
              <span>Download Diagnostic Report</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
