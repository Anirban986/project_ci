"use client";

import { useState } from "react";
import {
  Send,
  FileText,
  Plus,
  Trash2,
  Download,
  Video,
  Mic,
  MicOff,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { MOCK_PATIENT, MOCK_DOCUMENTS, MOCK_PRESCRIPTIONS } from "@/src/services/mock-data";

interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const CHAT_MESSAGES = [
  { role: "patient" as const, text: "Doctor, I've been having fever and headache for 2 days.", time: "10:32 AM" },
  { role: "doctor"  as const, text: "When did it start? Any chills or body ache?", time: "10:33 AM" },
  { role: "patient" as const, text: "Yes, started yesterday. Body ache too. Temperature is 101°F.", time: "10:34 AM" },
];

export function ConsultationScreen() {
  const patient = MOCK_PATIENT;
  const prescription = MOCK_PRESCRIPTIONS[0];
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [items, setItems] = useState<PrescriptionItem[]>(
    prescription.items.map((i) => ({
      medicine: i.medicineName,
      dosage: i.dosage,
      frequency: i.frequency,
      duration: i.duration,
    }))
  );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { medicine: "", dosage: "", frequency: "Twice daily", duration: "5 days" },
    ]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Patient info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={patient.name} size="lg" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 font-display">{patient.name}</p>
            <p className="text-xs text-neutral-500">33y · Blood: {patient.bloodGroup}</p>
            {patient.allergies && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="warning">⚠ {a}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setMuted(!muted)}
              className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 hover:bg-brand-100 transition-colors">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live consultation notice */}
        <div className="flex items-center gap-2 bg-success-50 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs font-medium text-success-700">
            Video consultation in progress · 12:34
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Chat */}
        <div>
          <p className="section-title mb-3">Consultation Chat</p>
          <div className="card">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {CHAT_MESSAGES.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "doctor" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "doctor"
                        ? "bg-brand-500 text-white rounded-tr-sm"
                        : "bg-neutral-100 text-neutral-800 rounded-tl-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.role === "doctor" ? "text-brand-200" : "text-neutral-400"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-neutral-100 pt-3">
              <button className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                className="input flex-1 !py-2"
                placeholder="Type a message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shared documents */}
          <div className="mt-4">
            <p className="section-title mb-3">Patient Documents</p>
            <div className="space-y-2">
              {MOCK_DOCUMENTS.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200">
                  <FileText className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span className="text-sm text-neutral-700 flex-1 truncate">{doc.name}</span>
                  <button className="text-brand-500 hover:text-brand-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prescription editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Prescription</p>
            <Button size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />} onClick={addItem}>
              Add
            </Button>
          </div>
          <div className="card space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    className="input !bg-white text-sm flex-1"
                    placeholder="Medicine name"
                    value={item.medicine}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, medicine: e.target.value } : it))
                      )
                    }
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    className="w-9 h-9 rounded-xl bg-danger-50 flex items-center justify-center text-danger-500 flex-shrink-0 hover:bg-danger-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="input !bg-white text-xs"
                    placeholder="Dosage"
                    value={item.dosage}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, dosage: e.target.value } : it))
                      )
                    }
                  />
                  <input
                    className="input !bg-white text-xs"
                    placeholder="Frequency"
                    value={item.frequency}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, frequency: e.target.value } : it))
                      )
                    }
                  />
                  <input
                    className="input !bg-white text-xs"
                    placeholder="Duration"
                    value={item.duration}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, duration: e.target.value } : it))
                      )
                    }
                  />
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">
                No medicines added yet
              </p>
            )}

            <div className="pt-2 border-t border-neutral-100">
              <textarea
                className="input resize-none text-sm"
                rows={2}
                placeholder="Doctor's notes (optional)…"
                defaultValue={prescription.notes}
              />
            </div>

            <Button
              variant="primary"
              fullWidth
              icon={
                saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )
              }
              onClick={handleSave}
            >
              {saved ? "Prescription Saved!" : "Save & Send Prescription"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
