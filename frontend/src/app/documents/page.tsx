"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api-client";
import { Document, ExtractedMetadata, DocumentVersion } from "@/services/types";
import { 
  FileText, Upload, Plus, Trash2, CheckCircle, Clock, 
  ChevronRight, Search, FileSpreadsheet, FileCode, Tag, 
  HelpCircle, Eye, GitCompare, RefreshCw, X, Download, ShieldAlert
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const pipelineStages = [
  { name: "Upload", desc: "Binary validation" },
  { name: "OCR", desc: "Text extraction" },
  { name: "Entities", desc: "NER matching" },
  { name: "Relations", desc: "Relation maps" },
  { name: "Graph", desc: "Neo4j updates" },
  { name: "Embedding", desc: "Vector indexing" },
  { name: "Ready", desc: "Copilot active" }
];

function DocumentCenterContent() {
  const searchParams = useSearchParams();
  const { user, addNotification } = useApp();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [compareVersion, setCompareVersion] = useState<DocumentVersion | null>(null);
  
  // Ingestion Pipeline Simulation State
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number>(-1);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents
  const loadDocs = async () => {
    const list = await apiService.getDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Handle URL command palette triggers
  useEffect(() => {
    if (searchParams.get("action") === "upload") {
      fileInputRef.current?.click();
    }
  }, [searchParams]);

  // Handle Drag & Drop Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    triggerPipelineSimulation(file);
  };

  const triggerPipelineSimulation = async (file: File) => {
    setUploadingFile(file.name);
    setPipelineStep(0);
    setPipelineProgress(10);
    
    // Simulate step changes
    for (let i = 1; i <= 6; i++) {
      await new Promise(r => setTimeout(r, 900));
      setPipelineStep(i);
      setPipelineProgress(Math.floor((i / 6) * 100));
    }

    // Call service to add document
    const type = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") ? "Excel" :
                 file.name.endsWith(".dwg") || file.name.endsWith(".dxf") ? "Drawing" : "PDF";
    
    try {
      const newDoc = await apiService.uploadDocument({ name: file.name, size: file.size }, type, user.name);
      await loadDocs();
      setSelectedDoc(newDoc);
    } catch (err) {
      console.error(err);
    } finally {
      // Clear pipeline simulation
      await new Promise(r => setTimeout(r, 1000));
      setUploadingFile(null);
      setPipelineStep(-1);
      setPipelineProgress(0);
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    if (confirm("Are you sure you want to delete this document from the enterprise registry? This will prune connected vector embeddings and graph relations.")) {
      await apiService.deleteDocument(id);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setCompareVersion(null);
      }
      loadDocs();
      addNotification({
        severity: "Medium",
        type: "Document",
        message: "Document deleted from vector indexes.",
        details: `Registry record ID ${id} was purged successfully.`
      });
    }
  };

  // Version bump simulation
  const handleVersionBump = async (docId: string) => {
    const comment = prompt("Enter brief changes changelog details:");
    if (!comment) return;
    const updated = await apiService.updateDocumentVersion(docId, comment, user.name);
    await loadDocs();
    setSelectedDoc(updated);
    addNotification({
      severity: "Information",
      type: "Document",
      message: `Document version bumped to ${updated.version}`,
      details: `${updated.name} updated by ${user.name}.`
    });
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.extractedMetadata.equipmentIds.some(id => id.toLowerCase().includes(search.toLowerCase())) ||
                          doc.complianceTags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "All" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Excel":
        return FileSpreadsheet;
      case "Drawing":
        return FileCode;
      default:
        return FileText;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* OCR PIPELINE STEPS VISUALIZATION (Visible only during active upload) */}
      {uploadingFile && (
        <div className="bg-white border border-blue-200 rounded-sharp p-4 shadow-panel flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[#2563EB] animate-spin" />
              <span className="font-semibold text-gray-900">Ingestion Pipeline Active: <span className="font-mono text-[#2563EB]">{uploadingFile}</span></span>
            </div>
            <span className="font-mono text-gray-500 font-semibold">{pipelineProgress}%</span>
          </div>

          {/* Stepper progress track */}
          <div className="grid grid-cols-7 gap-2 relative">
            {pipelineStages.map((stage, idx) => {
              const isActive = idx === pipelineStep;
              const isCompleted = idx < pipelineStep;
              return (
                <div key={stage.name} className="flex flex-col items-center relative z-10 text-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all-custom border ${
                    isActive ? "bg-[#2563EB] text-white border-[#2563EB]" :
                    isCompleted ? "bg-[#16A34A] text-white border-[#16A34A]" :
                    "bg-gray-50 text-gray-400 border-gray-200"
                  }`}>
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-900 mt-1">{stage.name}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5 max-w-[80px] hidden md:inline">{stage.desc}</span>
                </div>
              );
            })}
            
            {/* Progress line background */}
            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-100 -z-10" />
            <div 
              className="absolute top-3.5 left-6 h-0.5 bg-[#2563EB] -z-10 transition-all-custom" 
              style={{ width: `${(pipelineStep / 6) * 88}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: Left Documents Table, Right Detail Inspector */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Table & Filters */}
        <div className="flex-1 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col min-w-0">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by filename or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="All">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="SOP">SOP</option>
                <option value="Excel">Excel</option>
                <option value="Drawing">Engineering Drawing</option>
              </select>
            </div>

            {/* Ingestion Upload Trigger */}
            <div className="w-full md:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.docx,.xlsx,.xls,.dwg,.dwx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded px-3 py-1.5 text-xs font-semibold shadow-sm transition-all-custom focus:outline-none"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>

          {/* Documents Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Format</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">OCR status</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Indexed Assets</th>
                  <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="p-3 font-semibold text-gray-500 text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocs.map((doc) => {
                  const DocIcon = getIcon(doc.type);
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <tr 
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setCompareVersion(null);
                      }}
                      className={`hover:bg-gray-50 cursor-pointer transition-all-custom ${isSelected ? "bg-blue-50/50 border-l-4 border-l-[#2563EB]" : ""}`}
                    >
                      <td className="p-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <DocIcon className="h-4.5 w-4.5 text-[#2563EB] shrink-0" />
                          <span className="truncate max-w-[240px]">{doc.name}</span>
                          <span className="text-[10px] text-gray-400 ml-1">({doc.version})</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500 font-mono">{doc.type}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                          {doc.ocrStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-gray-700">{ (doc.confidence * 100).toFixed(0) }%</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {doc.linkedAssets.length === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            doc.linkedAssets.map(asset => (
                              <span key={asset} className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-800">
                                {asset}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoc(doc.id);
                          }}
                          title="Purge Document"
                          className="text-gray-400 hover:text-[#DC2626] p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Metadata Inspector */}
        {selectedDoc && (
          <div className="w-96 bg-white border border-gray-200 rounded-sharp shadow-subtle flex flex-col overflow-hidden shrink-0">
            {/* Inspector Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2563EB]" />
                <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Metadata Inspector</span>
              </div>
              <button 
                onClick={() => { setSelectedDoc(null); setCompareVersion(null); }} 
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inspector Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-gray-900 truncate">{selectedDoc.name}</h3>
                <div className="mt-1 text-gray-500 flex items-center justify-between">
                  <span>Author: {selectedDoc.author}</span>
                  <span>Ver: {selectedDoc.version}</span>
                </div>
              </div>

              {/* Version History Tab */}
              <div className="border border-gray-200 rounded p-3 bg-gray-50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Document Version History</span>
                  <button 
                    onClick={() => handleVersionBump(selectedDoc.id)}
                    className="text-[10px] text-[#2563EB] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Bump Version
                  </button>
                </div>
                <div className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                  {selectedDoc.versions.map((ver, idx) => (
                    <div 
                      key={ver.version} 
                      onClick={() => idx > 0 ? setCompareVersion(ver) : setCompareVersion(null)}
                      className={`p-1.5 border rounded cursor-pointer transition-all-custom flex items-center justify-between ${
                        compareVersion?.version === ver.version ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900">{ver.version}</span>
                        <span className="text-[10px] text-gray-500 truncate">{ver.comment}</span>
                      </div>
                      <div className="text-right text-[9px] text-gray-400 shrink-0">
                        <span>{new Date(ver.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Diff Viewer Trigger */}
                {compareVersion && (
                  <div className="mt-2.5 p-2 bg-yellow-50 border border-yellow-200 rounded text-[11px]">
                    <div className="flex justify-between items-center font-bold text-yellow-800">
                      <span>Diff Mode: {selectedDoc.version} vs {compareVersion.version}</span>
                      <button onClick={() => setCompareVersion(null)} className="text-gray-400 hover:text-gray-900">×</button>
                    </div>
                    <div className="mt-1 space-y-1 text-gray-700 font-mono">
                      <div className="text-red-700">- Previous version clearance limits: Max Temp: 165°C</div>
                      <div className="text-green-700">+ Updated limits: Max Temp: 180°C (Section 2.1)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Entity Tags */}
              <div className="space-y-3.5">
                <span className="font-bold text-gray-900 uppercase tracking-wider block text-[10px]">Extracted Entities (Interactive)</span>
                
                {/* Equipment IDs */}
                <div className="space-y-1">
                  <span className="text-gray-500 block text-[10px]">Equipment IDs</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedDoc.extractedMetadata.equipmentIds.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-mono cursor-pointer hover:bg-blue-100">
                        {tag}
                      </span>
                    ))}
                    {selectedDoc.extractedMetadata.equipmentIds.length === 0 && <span className="text-gray-400 italic">None</span>}
                  </div>
                </div>

                {/* Regulations */}
                <div className="space-y-1">
                  <span className="text-gray-500 block text-[10px]">Compliance Codes & Regulations</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedDoc.extractedMetadata.regulations.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 cursor-pointer hover:bg-purple-100">
                        {tag}
                      </span>
                    ))}
                    {selectedDoc.extractedMetadata.regulations.length === 0 && <span className="text-gray-400 italic">None</span>}
                  </div>
                </div>

                {/* Operating Limits */}
                <div className="space-y-1">
                  <span className="text-gray-500 block text-[10px]">Extracted Operating Limits</span>
                  <div className="space-y-1">
                    {selectedDoc.extractedMetadata.operatingLimits.map(tag => (
                      <div key={tag} className="px-2 py-1 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono">
                        {tag}
                      </div>
                    ))}
                    {selectedDoc.extractedMetadata.operatingLimits.length === 0 && <span className="text-gray-400 italic">None</span>}
                  </div>
                </div>

                {/* Safety Instructions */}
                <div className="space-y-1">
                  <span className="text-gray-500 block text-[10px]">Extracted Safety Instructions</span>
                  <div className="space-y-1.5">
                    {selectedDoc.extractedMetadata.safetyInstructions.map((tag, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-gray-700 bg-gray-50 p-2 border border-gray-200 rounded">
                        <ShieldAlert className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>{tag}</span>
                      </div>
                    ))}
                    {selectedDoc.extractedMetadata.safetyInstructions.length === 0 && <span className="text-gray-400 italic">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
              <Link 
                href="/copilot"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded py-1.5 text-xs font-semibold shadow-sm focus:outline-none"
              >
                <span>Ask Copilot</span>
              </Link>
              <button 
                onClick={() => alert("Downloading document pdf binary file from secure S3 bucket...")}
                className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded p-1.5"
                title="Download Document"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DocumentCenterPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-gray-500 p-6 animate-pulse">Loading Document Center...</div>}>
      <DocumentCenterContent />
    </React.Suspense>
  );
}
