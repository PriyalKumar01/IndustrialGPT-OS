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
