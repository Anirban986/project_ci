"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Share2,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MOCK_DOCUMENTS } from "@/src/services/mock-data";
import { DOCUMENT_CATEGORY_LABELS } from "@/src/lib/constants";
import { formatDate, formatFileSize, cn } from "@/src/lib/utils";
import type { DocumentCategory, MedicalDocument } from "@/src/types";

const CATEGORIES: { id: DocumentCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prescription", label: "Prescriptions" },
  { id: "report", label: "Reports" },
  { id: "scan", label: "Scans" },
  { id: "certificate", label: "Certificates" },
];

const DOC_COLORS: Record<DocumentCategory, string> = {
  prescription: "bg-brand-50 text-brand-500",
  report:       "bg-success-50 text-success-600",
  scan:         "bg-purple-50 text-purple-500",
  certificate:  "bg-amber-50 text-amber-500",
  other:        "bg-neutral-100 text-neutral-500",
};

function DocumentCard({ doc }: { doc: MedicalDocument }) {
  return (
    <div className="card card-hover">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            DOC_COLORS[doc.category]
          )}
        >
          {doc.fileType === "image" ? (
            <ImageIcon className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm font-display leading-tight truncate">
            {doc.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="neutral">{DOCUMENT_CATEGORY_LABELS[doc.category]}</Badge>
            <span className="text-xs text-neutral-400">{formatFileSize(doc.fileSize)}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">{formatDate(doc.uploadedAt)}</p>
        </div>
        <button className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors flex-shrink-0">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      {doc.sharedWith && doc.sharedWith.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-2.5 h-2.5 text-success-600" />
          </span>
          <p className="text-xs text-success-600">Shared with your doctor</p>
        </div>
      )}
    </div>
  );
}

function UploadCard() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setProgress(0);
          }, 500);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors",
        uploading
          ? "border-brand-300 bg-brand-50"
          : "border-neutral-200 hover:border-brand-300 hover:bg-brand-50/50"
      )}
      onClick={!uploading ? simulateUpload : undefined}
    >
      {uploading ? (
        <>
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-neutral-600 mb-1.5">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-800 text-sm font-display">
              Upload Document
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PDF, JPG, PNG up to 20MB
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Choose File
          </Button>
        </>
      )}
    </div>
  );
}

export function MedicalVaultScreen() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_DOCUMENTS
      : MOCK_DOCUMENTS.filter((d) => d.category === activeCategory);

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 font-display">Medical Vault</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {MOCK_DOCUMENTS.length} documents stored securely
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all snap-start",
              activeCategory === cat.id
                ? "bg-brand-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload card */}
      <UploadCard />

      {/* Documents */}
      <div>
        <p className="section-title mb-3">
          {activeCategory === "all" ? "All Documents" : DOCUMENT_CATEGORY_LABELS[activeCategory]}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No documents here"
            description="Upload your first document to get started"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
