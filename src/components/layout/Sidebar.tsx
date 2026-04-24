"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { riskTokens, confidenceTokens, type Severity, type Confidence } from "@/lib/tokens";

export interface TraceRow {
  id: string;
  name: string;
  severity: Severity;
  failureType: string;
  confidence: Confidence;
  confidenceValue: number;
  status: string;
  timestamp?: string;
}

const STATIC_TRACES: TraceRow[] = [
  {
    id: "hallucination-detector",
    name: "hallucination-detector",
    severity: "high",
    failureType: "Hallucination in response",
    confidence: "medium",
    confidenceValue: 61,
    status: "FAILED",
  },
  {
    id: "prompt-injection-guard",
    name: "prompt-injection-guard",
    severity: "critical",
    failureType: "Prompt injection bypass",
    confidence: "low",
    confidenceValue: 19,
    status: "FAILED",
  },
  {
    id: "escalation-detector",
    name: "escalation-detector",
    severity: "critical",
    failureType: "Missed escalation signal",
    confidence: "low",
    confidenceValue: 22,
    status: "FAILED",
  },
  {
    id: "intent-detection-v2",
    name: "intent-detection-v2",
    severity: "critical",
    failureType: "Intent misclassification",
    confidence: "low",
    confidenceValue: 28,
    status: "FAILED",
  },
  {
    id: "sentiment-analysis",
    name: "sentiment-analysis",
    severity: "high",
    failureType: "Sentiment detection failure",
    confidence: "medium",
    confidenceValue: 54,
    status: "FAILED",
  },
  {
    id: "appointment-scheduler",
    name: "appointment-scheduler",
    severity: "critical",
    failureType: "Scheduling conflict error",
    confidence: "low",
    confidenceValue: 31,
    status: "FAILED",
  },
  {
    id: "rag-pipeline",
    name: "rag-pipeline",
    severity: "medium",
    failureType: "Low retrieval relevance",
    confidence: "high",
    confidenceValue: 78,
    status: "WARNING",
  },
  {
    id: "call-summary-generator",
    name: "call-summary-generator",
    severity: "medium",
    failureType: "Incomplete summary output",
    confidence: "high",
    confidenceValue: 82,
    status: "WARNING",
  },
];

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SEVERITY_FILTERS = ["all", "critical", "high", "medium"] as const;
type SeverityFilter = (typeof SEVERITY_FILTERS)[number];

interface SidebarProps {
  activeTraceId?: string;
  onTraceSelect?: (id: string) => void;
  traces?: TraceRow[];
  isDrawer?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ activeTraceId, onTraceSelect, traces, isDrawer, onClose, className }: SidebarProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const rawTraces = traces && traces.length > 0 ? traces : STATIC_TRACES;
  const dedupedTraces = rawTraces.filter(
    (trace, index, self) => index === self.findIndex((t) => t.id === trace.id),
  );
  const displayTraces =
    severityFilter === "all"
      ? dedupedTraces
      : dedupedTraces.filter((t) => t.severity === severityFilter);

  const criticalCount = dedupedTraces.filter((t) => t.severity === "critical").length;
  const validScores = dedupedTraces.filter(
    (t) => typeof t.confidenceValue === "number" && !isNaN(t.confidenceValue),
  );
  const avgConfidence =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, t) => sum + t.confidenceValue, 0) / validScores.length)
      : null;

  return (
    <aside
      className={cn(
        "flex w-[280px] shrink-0 flex-col border-r border-border bg-white",
        isDrawer && "fixed inset-y-0 left-0 z-40 shadow-xl",
        className,
      )}
    >
      {/* Stats header */}
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <div className="flex items-start justify-between">
          <p className="leading-none text-gray-900">
            <span className="text-[2.5rem] font-bold">{dedupedTraces.length}</span>
            {" "}
            <span className="text-base font-normal">failures today</span>
          </p>
          {isDrawer && (
            <button
              type="button"
              onClick={onClose}
              className="mt-1 flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {criticalCount} critical · avg {avgConfidence !== null ? `${avgConfidence}% ↓` : "—%"}
        </p>
      </div>

      {/* Section label */}
      <div className="shrink-0 px-4 pb-1.5 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
          Failed Evaluations
        </p>
      </div>

      {/* Severity filter */}
      <div className="flex shrink-0 gap-1 px-4 pb-2">
        {SEVERITY_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setSeverityFilter(f)}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors",
              severityFilter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trace list */}
      <ul className="flex-1 divide-y divide-border overflow-y-auto">
        {displayTraces.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-gray-400">
            No {severityFilter} severity traces
          </li>
        ) : (
          displayTraces.map((trace) => {
            const risk = riskTokens[trace.severity];
            const conf = confidenceTokens[trace.confidence];
            const isActive = trace.id === activeTraceId;

            return (
              <li key={trace.id}>
                <button
                  type="button"
                  onClick={() => {
                    onTraceSelect?.(trace.id);
                    onClose?.();
                  }}
                  className={cn(
                    "w-full py-3 text-left transition-colors hover:bg-gray-50",
                    isActive
                      ? "border-l-2 border-blue-500 bg-blue-50 pl-[14px] pr-4"
                      : "border-l-2 border-transparent pl-[14px] pr-4",
                  )}
                >
                  {/* Row 1: name + severity badge */}
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-gray-900">
                      {trace.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded border px-1.5 py-px text-[9px] font-bold uppercase leading-4",
                        risk.bg,
                        risk.border,
                        risk.text,
                      )}
                    >
                      {trace.severity}
                    </span>
                  </div>

                  {/* Row 2: failure type */}
                  <p className="mb-1 truncate text-[11px] text-gray-700">
                    {trace.failureType}
                  </p>

                  {/* Row 3: confidence + status */}
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[11px] font-medium", conf.text)}>
                      {trace.confidenceValue}%{" "}
                      {trace.confidence.charAt(0).toUpperCase() +
                        trace.confidence.slice(1)}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      {typeof trace.confidenceValue === "number" && !isNaN(trace.confidenceValue) && trace.confidenceValue > 0
                        ? "IN REVIEW"
                        : "NEW"}
                    </span>
                  </div>

                  {/* Row 4: timestamp */}
                  {trace.timestamp && (
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {formatRelativeTime(trace.timestamp)}
                    </p>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
