"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { GraphNode, GraphEdge, NodeType } from "@/services/types";
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize, X, 
  HelpCircle, Settings, Layers, Database, Shield,
  Activity, Users, FileText, FileSpreadsheet, BarChart, AlertTriangle
} from "lucide-react";
import Link from "next/link";

// Pre-calculated coordinates for a clean hierarchical/plant layout
const initialPositions: Record<string, { x: number; y: number }> = {
  "Plant-TX": { x: 300, y: 220 },
  "P-101A": { x: 160, y: 140 },
  "P-101B": { x: 160, y: 300 },
  "C-302": { x: 440, y: 140 },
  "FCV-204": { x: 100, y: 220 },
  "GT-401": { x: 440, y: 300 },
  "Elena": { x: 230, y: 60 },
  "Marcus": { x: 370, y: 60 },
  "Siddharth": { x: 300, y: 370 },
  "doc-1": { x: 60, y: 80 },
  "doc-2": { x: 80, y: 370 },
  "doc-3": { x: 540, y: 80 },
  "doc-4": { x: 60, y: 180 },
  "INC-401": { x: 230, y: 180 },
  "INC-402": { x: 370, y: 180 },
  "HWP-089": { x: 160, y: 50 },
  "Risk-Cavitation": { x: 300, y: 130 }
};

const nodeColors: Record<string, { bg: string; text: string; iconColor: string }> = {
  Plant: { bg: "bg-blue-600", text: "text-white", iconColor: "#FFFFFF" },
  Equipment: { bg: "bg-amber-600", text: "text-white", iconColor: "#FFFFFF" },
  Valve: { bg: "bg-orange-500", text: "text-white", iconColor: "#FFFFFF" },
  Pump: { bg: "bg-amber-500", text: "text-white", iconColor: "#FFFFFF" },
  Turbine: { bg: "bg-cyan-600", text: "text-white", iconColor: "#FFFFFF" },
  Engineer: { bg: "bg-green-600", text: "text-white", iconColor: "#FFFFFF" },
  Document: { bg: "bg-blue-500", text: "text-white", iconColor: "#FFFFFF" },
  Incident: { bg: "bg-red-600", text: "text-white", iconColor: "#FFFFFF" },
  Permit: { bg: "bg-purple-600", text: "text-white", iconColor: "#FFFFFF" },
  Risk: { bg: "bg-red-800", text: "text-white", iconColor: "#FFFFFF" },
  Inspection: { bg: "bg-teal-600", text: "text-white", iconColor: "#FFFFFF" },
  Maintenance: { bg: "bg-orange-600", text: "text-white", iconColor: "#FFFFFF" }
};

export default function KnowledgeGraphPage() {
  const { currentPlant, addNotification } = useApp();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [search, setSearch] = useState("");
  const [filterTypes, setFilterTypes] = useState<Record<NodeType, boolean>>({
    Plant: true, Equipment: true, Valve: true, Pump: true, Engineer: true,
    Document: true, Incident: true, Permit: true, Risk: true, Inspection: true,
    Maintenance: true
  } as any);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);
  
  // Canvas Viewport Transforms
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: 20, y: 10 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Dragging Nodes
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(initialPositions);

  useEffect(() => {
    async function loadGraphData() {
      try {
        const data = await apiService.getGraph();
        setNodes(data.nodes);
        setEdges(data.edges);

        // Dynamically add positions for any nodes that don't have preset coordinates
        const updatedPos = { ...initialPositions };
        data.nodes.forEach((n, idx) => {
          if (!updatedPos[n.id]) {
            updatedPos[n.id] = {
              x: 100 + (idx * 50) % 500,
              y: 100 + (idx * 60) % 400
            };
          }
        });
        setNodePositions(updatedPos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGraphData();
  }, []);

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.4, Math.min(2.5, prev * factor)));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 50, y: 30 });
  };

  // Panning SVG
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target instanceof SVGSVGElement) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (dragNodeId) {
      // Scale clients coords with zoom factor
      const svgRect = e.currentTarget.getBoundingClientRect();
      const clickX = (e.clientX - svgRect.left - pan.x) / zoom;
      const clickY = (e.clientY - svgRect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [dragNodeId]: { x: Math.max(20, Math.min(680, clickX)), y: Math.max(20, Math.min(480, clickY)) }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragNodeId(null);
  };

  // Double click collapses/expands children in the visualization
  const handleNodeDoubleClick = (nodeId: string) => {
    if (collapsedNodes.includes(nodeId)) {
      setCollapsedNodes(prev => prev.filter(id => id !== nodeId));
      addNotification({
        severity: "Information",
        type: "Agent",
        message: "Knowledge Graph branch expanded",
        details: `Sub-graph children for node '${nodeId}' restored in viewport.`
      });
    } else {
      setCollapsedNodes(prev => [...prev, nodeId]);
      addNotification({
        severity: "Information",
        type: "Agent",
        message: "Knowledge Graph branch collapsed",
        details: `Sub-graph children for node '${nodeId}' hidden to reduce visual density.`
      });
    }
  };

  // Node filtering
  const isNodeVisible = (node: GraphNode) => {
    // Filter by type check
    const matchesType = filterTypes[node.type] || filterTypes[node.type === "Turbine" ? "Equipment" : node.type];
    
    // Filter by search match
    const matchesSearch = node.label.toLowerCase().includes(search.toLowerCase()) || 
                          node.type.toLowerCase().includes(search.toLowerCase());
    
    // Filter out if a parent node is collapsed
    const parentEdges = edges.filter(e => e.target === node.id);
    const isCollapsedParent = parentEdges.some(e => collapsedNodes.includes(e.source));
    
    return matchesType && matchesSearch && !isCollapsedParent;
  };

  // Filter edges where both source and target are visible
  const visibleEdges = edges.filter(edge => {
    const srcNode = nodes.find(n => n.id === edge.source);
    const tgtNode = nodes.find(n => n.id === edge.target);
    return srcNode && tgtNode && isNodeVisible(srcNode) && isNodeVisible(tgtNode);
  });

  // Check if edge is connected to selected node for path highlighting
  const isEdgeHighlighted = (edge: GraphEdge) => {
    if (!selectedNode) return false;
    return edge.source === selectedNode.id || edge.target === selectedNode.id;
  };

  // Node stats
  const visibleNodes = nodes.filter(isNodeVisible);
  const totalEquipment = visibleNodes.filter(n => n.type === "Equipment" || n.type === "Pump" || n.type === "Valve" || n.type === "Turbine").length;
  const totalIncidents = visibleNodes.filter(n => n.type === "Incident").length;
  const totalDocuments = visibleNodes.filter(n => n.type === "Document").length;

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case "Equipment":
      case "Pump":
      case "Valve":
        return Activity;
      case "Engineer":
        return Users;
      case "Document":
        return FileText;
      case "Incident":
        return AlertTriangle;
      case "Permit":
        return Shield;
      case "Risk":
        return AlertTriangle;
      default:
        return Database;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Page Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-[#2563EB]" />
            <span>Neo4j Knowledge Graph Workspace</span>
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Explore real-time semantic connections between equipment, incident reports, safety permits, and engineering documents.</p>
        </div>

        {/* Node stats counts */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 divide-x divide-gray-200">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold">Total Nodes</span>
            <span className="text-gray-900">{visibleNodes.length}</span>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-[10px] uppercase text-gray-400 font-bold">Equipment</span>
            <span className="text-amber-600">{totalEquipment}</span>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-[10px] uppercase text-gray-400 font-bold">Documents</span>
            <span className="text-blue-600">{totalDocuments}</span>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-[10px] uppercase text-gray-400 font-bold">Incidents</span>
            <span className="text-red-600">{totalIncidents}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Filter Sidebar */}
        <div className="w-56 bg-white border border-gray-200 rounded-sharp shadow-subtle p-4 flex flex-col gap-4 shrink-0">
          {/* Node Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="h-px bg-gray-200" />

          {/* Node Type Filter Checks */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Filter Node Types</span>
            {Object.keys(filterTypes).map((type) => {
              const count = nodes.filter(n => n.type === type || (type === "Equipment" && ["Pump", "Valve", "Turbine"].includes(n.type))).length;
              return (
                <label key={type} className="flex items-center justify-between text-xs cursor-pointer hover:text-gray-900 text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterTypes[type as NodeType]}
                      onChange={(e) => setFilterTypes(prev => ({ ...prev, [type]: e.target.checked }))}
                      className="rounded text-[#2563EB] focus:ring-0 cursor-pointer h-3.5 w-3.5 border-gray-300"
                    />
                    <span>{type}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-1 rounded">{count}</span>
                </label>
              );
            })}
          </div>

          {/* Double Click Tip */}
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-500 leading-normal">
            💡 <strong>Double-click</strong> a node to collapse/expand its relational branches. Click and drag to reposition nodes.
          </div>
        </div>

        {/* Center: Graph Canvas Viewport */}
        <div className="flex-1 bg-white border border-gray-200 rounded-sharp shadow-subtle relative overflow-hidden flex flex-col">
          {/* Canvas Controls header overlay */}
          <div className="absolute top-3 left-3 flex gap-1 bg-white/95 border border-gray-200 rounded p-1 shadow-sm z-10 backdrop-blur-xs">
            <button onClick={() => handleZoom(1.15)} title="Zoom In" className="p-1 hover:bg-gray-100 rounded text-gray-600 focus:outline-none">
              <ZoomIn className="h-4.5 w-4.5" />
            </button>
            <button onClick={() => handleZoom(0.85)} title="Zoom Out" className="p-1 hover:bg-gray-100 rounded text-gray-600 focus:outline-none">
              <ZoomOut className="h-4.5 w-4.5" />
            </button>
            <button onClick={handleResetZoom} title="Fit to Screen" className="p-1 hover:bg-gray-100 rounded text-gray-600 focus:outline-none">
              <Maximize className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* SVG Viewport */}
          <svg
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              
              {/* Edges Link Lines */}
              {visibleEdges.map((edge) => {
                const srcPos = nodePositions[edge.source];
                const tgtPos = nodePositions[edge.target];
                if (!srcPos || !tgtPos) return null;

                const isHighlighted = isEdgeHighlighted(edge);
                
                return (
                  <g key={edge.id}>
                    {/* Background line for click hit-box & thickness */}
                    <line
                      x1={srcPos.x}
                      y1={srcPos.y}
                      x2={tgtPos.x}
                      y2={tgtPos.y}
                      stroke={isHighlighted ? "#2563EB" : "#E5E7EB"}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      className="transition-all-custom"
                    />

                    {/* Animated Pulsing traversal dot along path if highlighted */}
                    {isHighlighted && (
                      <circle r="3.5" fill="#2563EB">
                        <animateMotion
                          path={`M ${srcPos.x} ${srcPos.y} L ${tgtPos.x} ${tgtPos.y}`}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Nodes Circles & Labels */}
              {visibleNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isSelected = selectedNode?.id === node.id;
                const isCollapsed = collapsedNodes.includes(node.id);
                const colors = nodeColors[node.type] || { bg: "bg-gray-600", text: "text-white", iconColor: "#FFFFFF" };
                const Icon = getNodeIcon(node.type);

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer"
                    onDoubleClick={() => handleNodeDoubleClick(node.id)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragNodeId(node.id);
                      setSelectedNode(node);
                    }}
                  >
                    {/* Ring selection pulse highlight */}
                    {isSelected && (
                      <circle r="22" fill="none" stroke="#2563EB" strokeWidth="2" className="animate-pulse" />
                    )}

                    {/* Collapsed branch outer indicator */}
                    {isCollapsed && (
                      <circle r="20" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}

                    {/* Main Node Circle */}
                    <circle 
                      r="16" 
                      className={`fill-current ${colors.bg} stroke-white`} 
                      strokeWidth="1.5" 
                    />

                    {/* Centered Icon Overlay inside SVG node */}
                    <g transform="translate(-7, -7)">
                      <Icon size={14} color="#FFFFFF" strokeWidth={2.5} />
                    </g>

                    {/* Node Text Label Card */}
                    <text
                      y="26"
                      textAnchor="middle"
                      className={`text-[9px] font-semibold bg-white select-none ${isSelected ? "fill-[#2563EB] font-bold" : "fill-gray-700"}`}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}

            </g>
          </svg>

          {/* Corner Mini Map Indicator */}
          <div className="absolute bottom-3 right-3 w-32 h-24 bg-gray-50 border border-gray-200 rounded p-1 shadow-sm opacity-80 pointer-events-none select-none hidden md:block">
            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mini Map</div>
            <div className="relative w-full h-full bg-white border border-gray-100 overflow-hidden flex items-center justify-center">
              {/* Scaled-down SVG dots representing graph overview */}
              <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute h-1 w-1 rounded-full bg-amber-600 top-4 left-6" />
              <div className="absolute h-1 w-1 rounded-full bg-amber-600 top-16 left-6" />
              <div className="absolute h-1 w-1 rounded-full bg-green-600 top-12 left-18" />
              <div className="absolute h-1 w-1 rounded-full bg-red-600 top-10 left-24" />
            </div>
          </div>
        </div>

        {/* Right Side: Metadata inspector panel */}
        {selectedNode && (
          <div className="w-80 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
            {/* Inspector Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Node Inspector</span>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-white ${
                  nodeColors[selectedNode.type]?.bg || "bg-gray-600"
                }`}>
                  {selectedNode.type}
                </span>
                <span className="text-[10px] font-mono text-gray-400">Node ID: {selectedNode.id}</span>
              </div>

              {/* Node Title */}
              <div>
                <h3 className="font-bold text-gray-900">{selectedNode.label}</h3>
              </div>

              <div className="h-px bg-gray-200" />

              {/* Properties Grid */}
              <div className="space-y-3">
                <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Properties</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border border-gray-150">
                  {Object.entries(selectedNode.properties).map(([key, val]) => (
                    <React.Fragment key={key}>
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-gray-800 font-semibold truncate text-right">
                        {typeof val === "number" ? val.toString() : val}
                      </span>
                    </React.Fragment>
                  ))}
                  {Object.keys(selectedNode.properties).length === 0 && (
                    <span className="col-span-2 text-gray-400 italic text-center">No attributes configured.</span>
                  )}
                </div>
              </div>

              {/* Active Sub-relations */}
              <div className="space-y-3">
                <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Direct Semantic Edges</span>
                <div className="space-y-1.5">
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((e) => {
                    const isSource = e.source === selectedNode.id;
                    const neighborId = isSource ? e.target : e.source;
                    const neighbor = nodes.find(n => n.id === neighborId);
                    if (!neighbor) return null;
                    return (
                      <div 
                        key={e.id} 
                        onClick={() => setSelectedNode(neighbor)}
                        className="p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 transition-all-custom cursor-pointer flex justify-between items-center"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-bold text-[#2563EB] tracking-wide uppercase">{e.type}</span>
                          <span className="text-gray-900 font-medium truncate">{neighbor.label}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase bg-gray-50 px-1 border border-gray-150 rounded">{neighbor.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspector Action Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
              {["Equipment", "Pump", "Valve", "Turbine"].includes(selectedNode.type) && (
                <Link
                  href={`/twin?id=${selectedNode.id}`}
                  className="w-full flex items-center justify-center bg-[#2563EB] hover:bg-blue-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
                >
                  <span>Open Digital Twin</span>
                </Link>
              )}
              {selectedNode.type === "Incident" && (
                <Link
                  href={`/maintenance?tab=rca&incidentId=${selectedNode.id}`}
                  className="w-full flex items-center justify-center bg-[#2563EB] hover:bg-blue-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
                >
                  <span>Open Incident RCA</span>
                </Link>
              )}
              <Link 
                href="/copilot"
                className="w-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 text-gray-700 rounded py-1.5 text-xs font-semibold focus:outline-none"
              >
                <span>Query Copilot</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
