"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { ComplianceScoreCard, MissingPermit, CorrectiveAction } from "@/services/types";
import { 
  Shield, AlertTriangle, CheckCircle, Clock, 
  Download, Plus, X, PlusCircle, ExternalLink, RefreshCw 
} from "lucide-react";

export default function CompliancePage() {
  const { user, addNotification } = useApp();
  const [data, setData] = useState<ComplianceScoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCellIncidents, setActiveCellIncidents] = useState<string[]>([]);
  const [activeCellCoords, setActiveCellCoords] = useState<{ l: number; s: number } | null>(null);
  
  // Corrective action form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    action: "",
    regulation: "Factory Act Sec 21",
    priority: "Medium" as const,
    assignee: ""
  });

  const loadComplianceData = async () => {
    const res = await apiService.getCompliance();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const handleUpdateStatus = async (id: string, status: CorrectiveAction["status"]) => {
    const updated = await apiService.updateCorrectiveActionStatus(id, status);
    setData(updated);
    addNotification({
      severity: "Information",
      type: "Compliance",
      message: `Corrective Action updated to ${status}`,
      details: `Action ID ${id} was set to ${status}.`
    });
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.action || !newAction.assignee) return;
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now
    
    const updated = await apiService.addCorrectiveAction({
      action: newAction.action,
      regulation: newAction.regulation,
      priority: newAction.priority,
      assignee: newAction.assignee,
      deadline: deadline.toISOString().split("T")[0]
    });
    
    setData(updated);
    setShowAddForm(false);
    setNewAction({ action: "", regulation: "Factory Act Sec 21", priority: "Medium", assignee: "" });
    addNotification({
      severity: "High",
      type: "Compliance",
      message: "New Corrective Action Logged",
      details: `Assigned to ${newAction.assignee} to satisfy regulation standard.`
    });
  };

  const handleRenewPermit = (permitName: string) => {
    alert(`Initiating renewal workflow for: ${permitName}. Requesting electronic authorization from PESO safety council portal...`);
    addNotification({
      severity: "Information",
      type: "Compliance",
      message: `Permit renewal filed: ${permitName}`,
      details: "Electronic authorization forms submitted."
    });
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="h-80 bg-gray-200 rounded-sharp" />
      </div>
    );
  }

  // Get cell bg color for risk heatmap
  const getHeatmapColor = (l: number, s: number) => {
    const score = l * s;
    if (score >= 16) return "bg-red-600 text-white hover:bg-red-700";
    if (score >= 9) return "bg-amber-500 text-white hover:bg-amber-600";
    if (score >= 4) return "bg-blue-500 text-white hover:bg-blue-600";
    return "bg-green-600 text-white hover:bg-green-700";
  };

  const handleHeatmapCellClick = (l: number, s: number) => {
    const cell = data.riskHeatmap.find(c => c.likelihood === l && c.severity === s);
    if (cell && cell.count > 0) {
      setActiveCellIncidents(cell.incidents);
      setActiveCellCoords({ l, s });
    } else {
      setActiveCellIncidents([]);
      setActiveCellCoords(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Top Title & Score Summary */}
      <div className="bg-white border border-gray-200 p-4 rounded-sharp shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#2563EB]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Compliance & Safety Intelligence</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Validate audit readiness, track expired safety permits, and check regulatory compliance actions.</p>
          </div>
        </div>

        {/* Global Audit readiness score badge */}
        <div className="flex items-center gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center shrink-0">
            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Audit Readiness</span>
            <span className="text-18 font-bold text-gray-900 font-mono">{data.overallScore}%</span>
          </div>
          <button
            onClick={() => alert("Downloading encrypted compliance PDF audit pack containing copies of current hot work permits, OISD registers, and open corrective work logs...")}
            className="flex items-center gap-1.5 bg-[#16A34A] hover:bg-green-700 text-white rounded px-3 py-2 text-xs font-semibold shadow-sm transition-all-custom focus:outline-none"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Package</span>
          </button>
        </div>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Standard Scores, Heatmaps, and Permits */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          
          {/* Top Row: Standards scorecards & Risk Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
            
            {/* Standards List card */}
            <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3.5">Standard Scorecards</span>
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {data.standards.map((std) => {
                  const barColor = 
                    std.status === "Compliant" ? "bg-[#16A34A]" :
                    std.status === "Warning" ? "bg-[#F59E0B]" : "bg-[#DC2626]";
                  return (
                    <div key={std.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700 font-semibold">{std.name}</span>
                        <span className="text-gray-900 font-mono font-bold">{std.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${std.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Heatmap (5x5 grid) */}
            <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Enterprise Risk Heatmap</span>
                <span className="text-[10px] text-gray-400 font-mono">Likelihood vs Severity</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-6 gap-1 w-full max-w-[280px]">
                  
                  {/* Heatmap cells */}
                  {Array.from({ length: 5 }).map((_, rIdx) => {
                    const l = 5 - rIdx; // Likelihood: 5 down to 1
                    return (
                      <React.Fragment key={l}>
                        {/* Y-axis label */}
                        <div className="flex items-center justify-center text-[9px] font-bold text-gray-400 font-mono">{l}</div>
                        {Array.from({ length: 5 }).map((_, cIdx) => {
                          const s = cIdx + 1; // Severity: 1 to 5
                          const cell = data.riskHeatmap.find(c => c.likelihood === l && c.severity === s);
                          const count = cell ? cell.count : 0;
                          const cellBg = getHeatmapColor(l, s);
                          const isSelected = activeCellCoords?.l === l && activeCellCoords?.s === s;

                          return (
                            <div
                              key={s}
                              onClick={() => handleHeatmapCellClick(l, s)}
                              className={`h-7 w-full flex items-center justify-center text-[10px] font-bold rounded cursor-pointer transition-all-custom ${
                                count > 0 ? cellBg : "bg-gray-50 hover:bg-gray-100 text-gray-300"
                              } ${isSelected ? "ring-2 ring-[#2563EB] ring-offset-1 border border-white" : ""}`}
                              title={`L:${l} S:${s} (${count} incidents)`}
                            >
                              {count > 0 ? count : ""}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* X-axis labels */}
                  <div /> {/* spacing offset */}
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="text-center text-[9px] font-bold text-gray-400 font-mono mt-1">{idx + 1}</div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Incidents popup from Heatmap click */}
          {activeCellIncidents.length > 0 && activeCellCoords && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-sharp text-xs shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-[#F59E0B] shrink-0" />
                <span>
                  Risks categorized in matrix quadrant **L:{activeCellCoords.l} S:{activeCellCoords.s}**:
                  <strong className="text-gray-900 font-semibold ml-1.5">{activeCellIncidents.join(", ")}</strong>
                </span>
              </div>
              <button onClick={() => { setActiveCellIncidents([]); setActiveCellCoords(null); }} className="text-gray-400 hover:text-gray-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Missing / Expired Permits Table */}
          <div className="bg-white border border-gray-200 rounded-sharp p-4 shadow-subtle shrink-0">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider block mb-3">Vulnerable Permits & Expirations</span>
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-2.5 font-semibold text-gray-500 uppercase tracking-wider">Permit Name</th>
                  <th className="p-2.5 font-semibold text-gray-500 uppercase tracking-wider">Required For</th>
                  <th className="p-2.5 font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-2.5 font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="p-2.5 font-semibold text-gray-500 text-right uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {data.missingPermits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-semibold text-gray-900">{permit.name}</td>
                    <td className="p-2.5 text-gray-600 font-mono text-[11px]">{permit.requiredFor}</td>
                    <td className="p-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        permit.status === "Expired" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {permit.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-500 font-mono">{permit.dueDate}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleRenewPermit(permit.name)}
                        className="text-[#2563EB] hover:underline font-bold text-[11px]"
                      >
                        Renew Permit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Side: Corrective Actions lists */}
        <div className="w-96 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#2563EB]" />
              <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Corrective Action Tracker</span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[#2563EB] hover:text-blue-700 focus:outline-none"
              title="Add Corrective Action"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Add form overlay */}
            {showAddForm && (
              <form onSubmit={handleAddAction} className="border border-gray-200 rounded p-3 bg-gray-50 space-y-3.5 text-xs">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span className="font-bold text-gray-900">New Corrective Action DTO</span>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-900">×</button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-500 text-[10px]">Action Detail:</label>
                  <input
                    type="text"
                    required
                    value={newAction.action}
                    onChange={(e) => setNewAction(prev => ({ ...prev, action: e.target.value }))}
                    className="border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#2563EB] bg-white"
                    placeholder="e.g. Clean suction filters..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">Regulation:</label>
                    <select
                      value={newAction.regulation}
                      onChange={(e) => setNewAction(prev => ({ ...prev, regulation: e.target.value }))}
                      className="border border-gray-300 rounded p-1.5 focus:outline-none bg-white"
                    >
                      <option value="Factory Act Sec 21">Factory Act Sec 21</option>
                      <option value="OISD-STD-117">OISD-STD-117</option>
                      <option value="PESO Rules">PESO Rules</option>
                      <option value="ISO 14001">ISO 14001</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-[10px]">Assignee:</label>
                    <input
                      type="text"
                      required
                      value={newAction.assignee}
                      onChange={(e) => setNewAction(prev => ({ ...prev, assignee: e.target.value }))}
                      className="border border-gray-300 rounded p-1.5 focus:outline-none bg-white"
                      placeholder="Name"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#2563EB] text-white font-semibold py-1.5 rounded hover:bg-blue-700"
                >
                  Create Action Item
                </button>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              {data.correctiveActions.map((action) => {
                const priorityColor = 
                  action.priority === "High" ? "text-red-700 bg-red-50 border-red-200" :
                  action.priority === "Medium" ? "text-amber-700 bg-amber-50 border-amber-200" :
                  "text-blue-700 bg-blue-50 border-blue-200";

                return (
                  <div key={action.id} className="p-3 border border-gray-200 rounded-sharp bg-white flex flex-col gap-2 hover:bg-gray-50 transition-all-custom">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-gray-950 leading-normal">{action.action}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${priorityColor}`}>
                        {action.priority}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-500 flex justify-between">
                      <span>Standard: {action.regulation}</span>
                      <span>Owner: {action.assignee}</span>
                    </div>

                    <div className="h-px bg-gray-100 my-1" />

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-gray-400">Due: {action.deadline}</span>
                      
                      {/* Status toggle buttons */}
                      <div className="flex gap-1.5">
                        {action.status === "Open" && (
                          <button
                            onClick={() => handleUpdateStatus(action.id, "In Progress")}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-300 font-semibold"
                          >
                            Start Action
                          </button>
                        )}
                        {action.status === "In Progress" && (
                          <button
                            onClick={() => handleUpdateStatus(action.id, "Completed")}
                            className="bg-blue-50 hover:bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded border border-blue-200 font-semibold"
                          >
                            Resolve Item
                          </button>
                        )}
                        {action.status === "Completed" && (
                          <span className="text-[#16A34A] font-bold flex items-center gap-0.5">
                            <CheckCircle className="h-3.5 w-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
