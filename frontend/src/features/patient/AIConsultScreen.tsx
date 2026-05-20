"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Mic, Bot, AlertTriangle, CheckCircle, Info,
  Stethoscope, Paperclip, X, FileText, Image, ChevronRight,
  Download, FlaskConical, Pill, Loader2,
} from "lucide-react";
import { Badge }  from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { SYMPTOM_CHIPS } from "@/src/lib/constants";
import { cn }    from "@/src/lib/utils";
import type { AIConsultMessage, RiskLevel } from "@/src/types";
import api from "@/src/utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadCategory = "health_report" | "prescription" | "scan_or_imaging";

interface UploadOption {
  id:          UploadCategory;
  label:       string;
  description: string;
  icon:        React.ElementType;
  accept:      string;
  color:       string;
  iconColor:   string;
}

interface UploadModalProps {
  onClose:          () => void;
  onUploadComplete: (fileId: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_OPTIONS: UploadOption[] = [
  {
    id:          "health_report",
    label:       "Lab Report",
    description: "Blood tests, CBC, lipid panel, thyroid, and other lab results",
    icon:        FlaskConical,
    accept:      "application/pdf,image/*",
    color:       "bg-blue-50 border-blue-100 hover:border-blue-300 hover:bg-blue-50",
    iconColor:   "bg-blue-100 text-blue-600",
  },
  {
    id:          "prescription",
    label:       "Prescription",
    description: "Handwritten or printed doctor prescriptions",
    icon:        Pill,
    accept:      "application/pdf,image/*",
    color:       "bg-violet-50 border-violet-100 hover:border-violet-300 hover:bg-violet-50",
    iconColor:   "bg-violet-100 text-violet-600",
  },
  {
    id:          "scan_or_imaging",
    label:       "Scan / Imaging",
    description: "MRI, X-ray, CT scan, ultrasound reports",
    icon:        Image,
    accept:      "application/pdf,image/*",
    color:       "bg-teal-50 border-teal-100 hover:border-teal-300 hover:bg-teal-50",
    iconColor:   "bg-teal-100 text-teal-600",
  },
];

const DEMO_RESPONSE = {
  text: "Based on the symptoms you've described — fever, headache, and body ache — these are commonly associated with viral infections such as the flu or a seasonal cold. Your symptoms seem mild to moderate at this stage.",
  conditions: [
    { name: "Viral Fever / Influenza", probability: 72 },
    { name: "Dengue Fever",            probability: 15 },
    { name: "COVID-19",                probability: 8  },
  ],
  riskLevel:       "medium" as RiskLevel,
  recommendations: [
    "Rest and stay well-hydrated",
    "Take Paracetamol for fever (as directed)",
    "Monitor temperature every 4–6 hours",
    "Seek in-person care if fever > 103°F or persists beyond 3 days",
  ],
  urgency: "soon" as const,
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; icon: React.ElementType }> = {
  low:    { label: "Low Risk",  color: "bg-success-50 text-success-600 border-success-100", icon: CheckCircle  },
  medium: { label: "Moderate", color: "bg-warning-50 text-warning-500 border-warning-100", icon: AlertTriangle },
  high:   { label: "High Risk", color: "bg-danger-50  text-danger-600  border-danger-100",  icon: AlertTriangle },
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────
// Only handles: file selection, upload, polling for analysis ready
// Does NOT manage chat messages or analysis data — that stays in AIConsultScreen

function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [selected,       setSelected]       = useState<UploadCategory | null>(null);
  const [file,           setFile]           = useState<File | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [uploaded,       setUploaded]       = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [analysisReady,  setAnalysisReady]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const selectedOption                      = UPLOAD_OPTIONS.find((o) => o.id === selected);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setError(null); }
  };

  const startPolling = (fileId: string) => {
    let attempts   = 0;
    const maxAttempts = 24; // 2 min at 5s intervals

    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/api/files/${fileId}/analysis`);
        if (res.data.success) {
          clearInterval(poll);
          setAnalysisReady(true);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          clearInterval(poll); // unexpected error — stop
        }
        // 404 = still processing, keep going
      }

      if (attempts >= maxAttempts) {
        clearInterval(poll);
        setError("Analysis is taking longer than expected. Please try again later.");
      }
    }, 5000);
  };

  const handleUpload = async () => {
    if (!file || !selected) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file",     file as File);
      formData.append("category", selected);

      const res    = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": undefined },
      });
      const fileId = res.data.data.id;

      setUploadedFileId(fileId);
      setUploaded(true);
      startPolling(fileId);

    } catch (err: any) {
      console.error("[upload] Failed:", err);
      if      (err.response?.status === 413) setError("File too large. Maximum size is 20MB.");
      else if (err.response?.status === 415) setError("Unsupported file type. Use PDF, JPG, PNG, or WEBP.");
      else if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else                                   setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-neutral-100">
          <div>
            <p className="font-semibold text-neutral-900 text-base">Upload Document</p>
            <p className="text-xs text-neutral-500 mt-0.5">Select what you're uploading</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">

          {/* ── Upload form (before upload) ── */}
          {!uploaded && (
            <>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Step 1 — What are you uploading?
              </p>
              <div className="space-y-2">
                {UPLOAD_OPTIONS.map((opt) => {
                  const Icon     = opt.icon;
                  const isActive = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setSelected(opt.id); setFile(null); setError(null); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left",
                        isActive ? "border-brand-500 bg-brand-50" : `border-neutral-100 ${opt.color}`
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", opt.iconColor)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{opt.description}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all",
                        isActive ? "border-brand-500 bg-brand-500" : "border-neutral-300"
                      )}>
                        {isActive && <CheckCircle className="w-full h-full text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-1">
                    Step 2 — Choose file
                  </p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-all",
                      file
                        ? "border-brand-400 bg-brand-50"
                        : "border-neutral-200 hover:border-brand-300 hover:bg-neutral-50"
                    )}
                  >
                    {file ? (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-brand-600" />
                        </div>
                        <p className="text-sm font-medium text-neutral-800 text-center break-all">{file.name}</p>
                        <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB · tap to change</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                          <Paperclip className="w-5 h-5 text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-700">Tap to select a file</p>
                        <p className="text-xs text-neutral-400 text-center">PDF, JPG, PNG, WEBP · max 20MB</p>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                        <Image className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-neutral-700">Take a photo</p>
                        <p className="text-xs text-neutral-400">Use camera to capture document</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedOption?.accept}
                    className="hidden"
                    onChange={handleFileChange}
                    capture="environment"
                  />

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={cn(
                      "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                      file && !uploading
                        ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                    ) : (
                      <><Paperclip className="w-4 h-4" />Upload {selectedOption?.label}</>
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {/* ── Success / Processing state (after upload) ── */}
          {uploaded && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-success-100 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-success-600" />
              </div>
              <p className="font-semibold text-neutral-900">Uploaded successfully!</p>

              {analysisReady ? (
                <>
                  <p className="text-sm text-success-600 text-center font-medium">
                    Analysis is ready!
                  </p>
                  <button
                    onClick={() => {
                      onUploadComplete(uploadedFileId!);
                      onClose();
                    }}
                    className="w-full py-3 rounded-2xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors"
                  >
                    View Analysis
                  </button>
                </>
              ) : error ? (
                <p className="text-sm text-red-500 text-center">{error}</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    Analysing your document...
                  </div>
                  <p className="text-xs text-neutral-400 text-center">
                    This usually takes 20–40 seconds
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

async function exportToPDF(result: typeof DEMO_RESPONSE) {
  const { default: jsPDF } = await import("jspdf");
  const doc   = new jsPDF({ unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  let   y     = 20;

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, width, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("AI Health Consultation Report", 14, 9.5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString("en-IN", { dateStyle: "long" }), width - 14, 9.5, { align: "right" });
  y = 24;

  const riskColors: Record<RiskLevel, [number, number, number]> = {
    low: [220, 252, 231], medium: [254, 243, 199], high: [254, 226, 226],
  };
  const riskTextColors: Record<RiskLevel, [number, number, number]> = {
    low: [22, 163, 74], medium: [217, 119, 6], high: [220, 38, 38],
  };
  doc.setFillColor(...riskColors[result.riskLevel]);
  doc.roundedRect(14, y, width - 28, 12, 3, 3, "F");
  doc.setTextColor(...riskTextColors[result.riskLevel]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Level: ${RISK_CONFIG[result.riskLevel].label}`, 20, y + 7.5);
  y += 18;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Assessment Summary", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const summaryLines = doc.splitTextToSize(result.text, width - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Possible Conditions", 14, y);
  y += 6;
  result.conditions.forEach((c) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`${c.name}`, 14, y);
    doc.setTextColor(120, 120, 120);
    doc.text(`${c.probability}%`, width - 14, y, { align: "right" });
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(14, y + 2, width - 28, 2.5, 1, 1, "F");
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(14, y + 2, ((width - 28) * c.probability) / 100, 2.5, 1, 1, "F");
    y += 10;
  });
  y += 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Recommendations", 14, y);
  y += 6;
  result.recommendations.forEach((r) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(`• ${r}`, width - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 2;
  });
  y += 6;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, y, width - 28, 14, 3, 3, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  const disc = doc.splitTextToSize(
    "This report is AI-generated and intended for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.",
    width - 36
  );
  doc.text(disc, 21, y + 4.5);
  doc.save("ai-health-report.pdf");
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function AIConsultScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [inputText,        setInputText]        = useState("");
  const [messages,         setMessages]         = useState<AIConsultMessage[]>([
    {
      id:        "0",
      role:      "assistant",
      content:   "Hi! I'm your AI health assistant. Tell me how you're feeling or select your symptoms below. I'll help assess your condition.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [result,         setResult]         = useState<typeof DEMO_RESPONSE | null>(null);
  const [showUpload,     setShowUpload]     = useState(false);
  const [exportingPDF,   setExportingPDF]   = useState(false);
  const [analysis,       setAnalysis]       = useState<any>(null);
  const [fetchingResult, setFetchingResult] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Called by UploadModal once analysis is confirmed ready
  const fetchAnalysis = async (fileId: string) => {
    setFetchingResult(true);
    try {
      const res = await api.get(`/api/files/${fileId}/analysis`);
      setAnalysis(res.data.data.findings_json);

      // push a natural message into chat
      setMessages((m) => [
        ...m,
        {
          id:        Date.now().toString(),
          role:      "assistant" as const,
          content:   "I've finished analyzing your report. Here's what I found 👇",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      console.error("[fetchAnalysis] failed:", err.message);
    } finally {
      setFetchingResult(false);
    }
  };

  const toggleSymptom = (id: string) =>
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSend = async () => {
    const text = inputText.trim() || (selectedSymptoms.length > 0 ? `I have: ${selectedSymptoms.join(", ")}` : "");
    if (!text || isLoading) return;

    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: text, timestamp: new Date().toISOString() }]);
    setInputText("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: DEMO_RESPONSE.text, timestamp: new Date().toISOString() }]);
    setResult(DEMO_RESPONSE);
    setIsLoading(false);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setExportingPDF(true);
    await exportToPDF(result);
    setExportingPDF(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, result, analysis]);

  const riskInfo = result ? RISK_CONFIG[result.riskLevel] : null;
  const RiskIcon = riskInfo?.icon;

  return (
    <>
      <div className="flex flex-col h-[calc(100dvh-128px)]">

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-100 bg-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-neutral-900 font-display text-sm">AI Health Assistant</p>
            <p className="text-xs text-success-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
              Online · Not a substitute for medical advice
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 hover:bg-brand-100 transition-colors text-xs font-semibold"
          >
            <Paperclip className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Symptom chips */}
          {selectedSymptoms.length === 0 && messages.length <= 1 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2.5">Common symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => toggleSymptom(chip.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedSymptoms.includes(chip.id)
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected symptoms */}
          {selectedSymptoms.length > 0 && !result && (
            <div className="bg-brand-50 rounded-2xl p-3 flex flex-wrap gap-1.5">
              {selectedSymptoms.map((id) => {
                const chip = SYMPTOM_CHIPS.find((c) => c.id === id);
                return chip ? <Badge key={id} variant="brand">{chip.label}</Badge> : null;
              })}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-brand-500" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white shadow-card text-neutral-800 rounded-tl-sm"
                  : "bg-brand-500 text-white rounded-tr-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand-500" />
              </div>
              <div className="bg-white shadow-card rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Report Analysis Result — appears inline after upload */}
          {fetchingResult && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 px-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              Loading your report analysis...
            </div>
          )}

          {analysis && (
            <div className="rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
              {/* Report header */}
              <div className="px-4 py-3 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-brand-600" />
                  <p className="font-semibold text-sm text-neutral-900">{analysis.report_title || "Lab Report"}</p>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  analysis.urgency_level === "low"      ? "bg-green-100 text-green-700"  :
                  analysis.urgency_level === "moderate" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {analysis.urgency_level?.toUpperCase()}
                </span>
              </div>

              <div className="px-4 py-3 space-y-3">
                {/* Summary */}
                <p className="text-sm text-neutral-700 leading-relaxed">{analysis.layman_summary || analysis.summary}</p>

                {/* Sections */}
                {analysis.sections?.map((section: any) => (
                  <div key={section.section_name}>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{section.section_name}</p>
                    <div className="space-y-1.5">
                      {section.findings?.map((f: any) => (
                        <div key={f.parameter} className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-sm border",
                          f.status === "normal"   ? "bg-green-50 border-green-100"  :
                          f.status === "critical" ? "bg-red-50 border-red-100"      :
                          f.status === "low" || f.status === "high" ? "bg-yellow-50 border-yellow-100" :
                          "bg-neutral-50 border-neutral-100"
                        )}>
                          <span className="font-medium text-neutral-800 truncate mr-2">{f.parameter}</span>
                          <span className={cn(
                            "text-xs font-bold flex-shrink-0",
                            f.status === "normal"   ? "text-green-600"  :
                            f.status === "critical" ? "text-red-600"    :
                            f.status === "low" || f.status === "high" ? "text-yellow-600" :
                            "text-neutral-500"
                          )}>
                            {f.value} {f.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Recommendations */}
                {analysis.recommendations?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Recommendations</p>
                    <ul className="space-y-1.5">
                      {analysis.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                          <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex gap-2 text-xs text-neutral-400 bg-neutral-50 rounded-xl p-3">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{analysis.disclaimer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Symptom check AI Result */}
          {result && riskInfo && RiskIcon && (
            <div className="space-y-3">
              <div className={cn("rounded-2xl border p-4", riskInfo.color)}>
                <div className="flex items-center gap-2 mb-2">
                  <RiskIcon className="w-5 h-5" />
                  <span className="font-semibold font-display">{riskInfo.label}</span>
                </div>
                <p className="text-xs opacity-80">
                  Seek care: {result.urgency === "soon" ? "Within 24–48 hours" : result.urgency}
                </p>
              </div>

              <div className="card">
                <p className="text-xs font-medium text-neutral-500 mb-3">Possible Conditions</p>
                <div className="space-y-2.5">
                  {result.conditions.map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-neutral-800">{c.name}</span>
                        <span className="text-neutral-500">{c.probability}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div className="bg-brand-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${c.probability}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <p className="text-xs font-medium text-neutral-500 mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-600 font-semibold text-sm hover:bg-brand-100 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {exportingPDF ? <><Loader2 className="w-4 h-4 animate-spin" />Generating PDF...</> : <><Download className="w-4 h-4" />Download Report as PDF</>}
              </button>

              <div className="flex gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>This is AI-generated guidance. Always consult a qualified doctor for diagnosis and treatment.</span>
              </div>

              <Button variant="primary" fullWidth icon={<Stethoscope className="w-4 h-4" />}>
                Book a Doctor Now
              </Button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 bg-white border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <input
              className="input flex-1 !py-2.5"
              placeholder="Describe your symptoms…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors flex-shrink-0" title="Voice input">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading && !inputText}
              className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white hover:bg-brand-600 transition-colors flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal — rendered outside main div so it overlays everything */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploadComplete={(fileId) => fetchAnalysis(fileId)}
        />
      )}
    </>
  );
}