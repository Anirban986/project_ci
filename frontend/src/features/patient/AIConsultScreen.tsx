"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  Bot,
  AlertTriangle,
  CheckCircle,
  Info,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Avatar } from "@/src/components/ui/Avatar";
import { SYMPTOM_CHIPS } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";
import type { AIConsultMessage, RiskLevel } from "@/src/types";

const DEMO_RESPONSE = {
  text: "Based on the symptoms you've described — fever, headache, and body ache — these are commonly associated with viral infections such as the flu or a seasonal cold. Your symptoms seem mild to moderate at this stage.",
  conditions: [
    { name: "Viral Fever / Influenza", probability: 72 },
    { name: "Dengue Fever", probability: 15 },
    { name: "COVID-19", probability: 8 },
  ],
  riskLevel: "medium" as RiskLevel,
  recommendations: [
    "Rest and stay well-hydrated",
    "Take Paracetamol for fever (as directed)",
    "Monitor temperature every 4–6 hours",
    "Seek in-person care if fever > 103°F or persists beyond 3 days",
  ],
  urgency: "soon" as const,
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; icon: React.ElementType }> = {
  low:    { label: "Low Risk",    color: "bg-success-50 text-success-600 border-success-100", icon: CheckCircle },
  medium: { label: "Moderate",   color: "bg-warning-50 text-warning-500 border-warning-100", icon: AlertTriangle },
  high:   { label: "High Risk",  color: "bg-danger-50  text-danger-600  border-danger-100",  icon: AlertTriangle },
};

export function AIConsultScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<AIConsultMessage[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hi! I'm your AI health assistant. Tell me how you're feeling or select your symptoms below. I'll help assess your condition.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<typeof DEMO_RESPONSE | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toggleSymptom = (id: string) =>
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSend = async () => {
    const text = inputText.trim() || `I have: ${selectedSymptoms.join(", ")}`;
    if (!text || isLoading) return;

    const userMsg: AIConsultMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInputText("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1800));

    const aiMsg: AIConsultMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: DEMO_RESPONSE.text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, aiMsg]);
    setResult(DEMO_RESPONSE);
    setIsLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, result]);

  const riskInfo = result ? RISK_CONFIG[result.riskLevel] : null;
  const RiskIcon = riskInfo?.icon;

  return (
    <div className="flex flex-col h-[calc(100dvh-128px)]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-neutral-100 bg-white flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-neutral-900 font-display text-sm">AI Health Assistant</p>
          <p className="text-xs text-success-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
            Online · Not a substitute for medical advice
          </p>
        </div>
      </div>

      {/* Scrollable area */}
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

        {/* Selected symptoms summary */}
        {selectedSymptoms.length > 0 && !result && (
          <div className="bg-brand-50 rounded-2xl p-3 flex flex-wrap gap-1.5">
            {selectedSymptoms.map((id) => {
              const chip = SYMPTOM_CHIPS.find((c) => c.id === id);
              return chip ? (
                <Badge key={id} variant="brand">
                  {chip.label}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-brand-500" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white shadow-card text-neutral-800 rounded-tl-sm"
                  : "bg-brand-500 text-white rounded-tr-sm"
              )}
            >
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
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Result */}
        {result && riskInfo && RiskIcon && (
          <div className="space-y-3">
            {/* Risk indicator */}
            <div className={cn("rounded-2xl border p-4", riskInfo.color)}>
              <div className="flex items-center gap-2 mb-2">
                <RiskIcon className="w-5 h-5" />
                <span className="font-semibold font-display">{riskInfo.label}</span>
              </div>
              <p className="text-xs opacity-80">
                Seek care: {result.urgency === "soon" ? "Within 24–48 hours" : result.urgency}
              </p>
            </div>

            {/* Possible conditions */}
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
                      <div
                        className="bg-brand-400 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${c.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
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

            {/* Disclaimer */}
            <div className="flex gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>This is AI-generated guidance. Always consult a qualified doctor for diagnosis and treatment.</span>
            </div>

            {/* Book doctor CTA */}
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
          <button
            className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors flex-shrink-0"
            title="Voice input"
          >
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
  );
}
