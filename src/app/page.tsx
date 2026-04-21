"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Lightbulb, Send, ChevronRight, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LeftNav } from "@/components/layout/LeftNav";
import { Sidebar, type TraceRow } from "@/components/layout/Sidebar";
import { RootCauseCard } from "@/components/trace/RootCauseCard";
import { EvidencePanel } from "@/components/trace/EvidencePanel";
import { ActionList } from "@/components/trace/ActionList";
import { ConfidenceBadge } from "@/components/trace/ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { riskTokens, type Severity, type Confidence } from "@/lib/tokens";
import { useTraces } from "@/hooks/useTraces";
import type { Trace } from "@/lib/langfuse";

// ── Types ──────────────────────────────────────────────────────────────────

interface PipelineStep {
  name: string;
  latency: number;
  status: "ok" | "warning" | "failed";
}

interface TraceDetail {
  id: string;
  severity: Severity;
  confidence: Confidence;
  confidenceValue: number;
  title: string;
  description: string;
  status: "FAILED" | "WARNING" | "SUCCESS";
  evidence: string[];
  actionLabels: string[];
  steps: PipelineStep[];
  whyActions: string;
  impact: { resolutionTime: string; affectedCalls: string; confidenceBoost: string };
}

interface ClaudeSuggestion {
  actions: string[];
  reasoning: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// ── Static data ────────────────────────────────────────────────────────────

const TRACES: TraceDetail[] = [
  {
    id: "intent-detection-v2",
    severity: "critical",
    confidence: "low",
    confidenceValue: 28,
    title: "Intent misclassification",
    description:
      "Intent classifier returned 'billing_inquiry' for a clear appointment scheduling request, routing the call to the wrong department.",
    status: "FAILED",
    evidence: [
      "6 consecutive misclassifications detected",
      "Confidence score dropped from 71% → 28% over 3 days",
      "Wrong department routing confirmed in call logs",
      "Average handle time increased by 4 minutes",
      "3 customer escalations linked to this failure",
    ],
    actionLabels: ["Retrain intent classifier", "Adjust similarity threshold", "Send to Call Supervisor →"],
    steps: [
      { name: "Input Preprocessing", latency: 45, status: "ok" },
      { name: "Embedding Generation", latency: 112, status: "ok" },
      { name: "Intent Classification", latency: 234, status: "failed" },
      { name: "Response Routing", latency: 89, status: "failed" },
    ],
    whyActions:
      "Retraining the classifier addresses the root cause directly. Adjusting the similarity threshold provides an immediate safety margin while retraining is in progress.",
    impact: { resolutionTime: "2–4 hrs", affectedCalls: "47 calls", confidenceBoost: "+34%" },
  },
  {
    id: "sentiment-analysis",
    severity: "high",
    confidence: "medium",
    confidenceValue: 54,
    title: "Sentiment detection failure",
    description:
      "Sentiment model scored a distressed customer interaction as neutral, suppressing the escalation trigger and delaying supervisor involvement.",
    status: "FAILED",
    evidence: [
      "Customer expressed frustration across 3 consecutive turns",
      "CSAT score retroactively marked as 1/5",
      "Escalation not triggered despite negative sentiment markers",
      "Call duration exceeded average by 8 minutes",
    ],
    actionLabels: ["Review sentiment thresholds", "Flag for manual review", "Dismiss"],
    steps: [
      { name: "Input Tokenization", latency: 23, status: "ok" },
      { name: "Feature Extraction", latency: 67, status: "ok" },
      { name: "Sentiment Scoring", latency: 178, status: "warning" },
      { name: "Escalation Check", latency: 34, status: "warning" },
    ],
    whyActions:
      "The model has a neutral bias stemming from imbalanced training data. Threshold adjustment provides immediate relief while a retrain is scheduled.",
    impact: { resolutionTime: "1–2 hrs", affectedCalls: "12 calls", confidenceBoost: "+28%" },
  },
  {
    id: "appointment-scheduler",
    severity: "critical",
    confidence: "low",
    confidenceValue: 31,
    title: "Scheduling conflict error",
    description:
      "Scheduler attempted to book a slot already occupied, creating a double-booking that required manual resolution within 10 minutes.",
    status: "FAILED",
    evidence: [
      "Double-booking confirmed in calendar system",
      "Conflict detection logic returned false negative",
      "2 customers received conflicting appointment confirmations",
      "Manual cancellation required within 10 minutes",
    ],
    actionLabels: ["Fix conflict detection logic", "Audit recent bookings", "Notify affected customers"],
    steps: [
      { name: "Date Extraction", latency: 38, status: "ok" },
      { name: "Slot Query", latency: 156, status: "ok" },
      { name: "Conflict Check", latency: 445, status: "failed" },
      { name: "Booking Commit", latency: 0, status: "failed" },
    ],
    whyActions:
      "The conflict detection race condition is a known issue in the scheduling layer. An audit ensures no live double-bookings remain unresolved.",
    impact: { resolutionTime: "3–6 hrs", affectedCalls: "8 bookings", confidenceBoost: "+41%" },
  },
  {
    id: "call-summary-generator",
    severity: "medium",
    confidence: "high",
    confidenceValue: 82,
    title: "Incomplete summary output",
    description:
      "Summary generator truncated output before capturing the resolution step, leaving agents without a complete record of the interaction.",
    status: "WARNING",
    evidence: [
      "Summary cut off at 87% of expected length",
      "Resolution outcome missing in 12 of last 50 summaries",
      "Token limit reached before completion in all affected calls",
    ],
    actionLabels: ["Increase output token limit", "Review truncation logic", "Dismiss"],
    steps: [
      { name: "Transcript Load", latency: 67, status: "ok" },
      { name: "Chunk Splitting", latency: 34, status: "ok" },
      { name: "Summarization", latency: 892, status: "warning" },
      { name: "Output Validation", latency: 45, status: "ok" },
    ],
    whyActions:
      "Increasing the token limit resolves truncation in 94% of cases based on call length distribution. Truncation logic review prevents edge cases.",
    impact: { resolutionTime: "30 min", affectedCalls: "58 summaries", confidenceBoost: "+19%" },
  },
  {
    id: "escalation-detector",
    severity: "critical",
    confidence: "low",
    confidenceValue: 22,
    title: "Missed escalation signal",
    description:
      "Escalation detector failed to flag a high-priority complaint, resulting in a missed SLA and an unresolved customer issue.",
    status: "FAILED",
    evidence: [
      "SLA breach confirmed — response time exceeded 2-hour threshold",
      "Escalation keywords present in 4 turns without triggering",
      "Keyword list was last updated 47 days ago",
      "Same failure pattern observed in 3 prior incidents",
    ],
    actionLabels: ["Update escalation keyword list", "Lower detection threshold", "Send to Call Supervisor →"],
    steps: [
      { name: "Signal Scan", latency: 89, status: "ok" },
      { name: "Keyword Match", latency: 23, status: "failed" },
      { name: "Priority Scoring", latency: 0, status: "failed" },
      { name: "Routing", latency: 0, status: "failed" },
    ],
    whyActions:
      "Keyword list staleness is the root cause. The detection threshold adjustment provides an interim fix while the full keyword list update is deployed.",
    impact: { resolutionTime: "1 hr", affectedCalls: "23 calls", confidenceBoost: "+52%" },
  },
  {
    id: "hallucination-detector",
    severity: "high",
    confidence: "medium",
    confidenceValue: 61,
    title: "Hallucination in response",
    description:
      "Model asserted a specific policy detail that does not exist in the knowledge base, providing factually incorrect information to a customer.",
    status: "FAILED",
    evidence: [
      "Asserted policy not found in any knowledge base document",
      "Customer cited the hallucinated detail in a follow-up complaint",
      "RAG retrieval returned 0 relevant documents for this query",
      "Response confidence score was 0.91 despite the hallucination",
    ],
    actionLabels: ["Add grounding check", "Flag response for review", "Update knowledge base"],
    steps: [
      { name: "Query Embedding", latency: 78, status: "ok" },
      { name: "Vector Retrieval", latency: 234, status: "warning" },
      { name: "Context Assembly", latency: 56, status: "ok" },
      { name: "LLM Generation", latency: 1456, status: "failed" },
    ],
    whyActions:
      "Adding a grounding check prevents generation when no supporting documents are found, eliminating the hallucination pathway at the source.",
    impact: { resolutionTime: "4–8 hrs", affectedCalls: "6 calls", confidenceBoost: "+67%" },
  },
  {
    id: "rag-pipeline",
    severity: "medium",
    confidence: "high",
    confidenceValue: 78,
    title: "Low retrieval relevance",
    description:
      "RAG pipeline retrieved documents with low semantic similarity, causing the model to generate responses with insufficient factual grounding.",
    status: "WARNING",
    evidence: [
      "Average retrieval similarity score: 0.31 (threshold: 0.65)",
      "Top-3 retrieved chunks were from unrelated product categories",
      "Query embedding appears to use outdated model weights",
    ],
    actionLabels: ["Re-index knowledge base", "Tune retrieval top-k", "Dismiss"],
    steps: [
      { name: "Query Parsing", latency: 12, status: "ok" },
      { name: "Embedding", latency: 89, status: "ok" },
      { name: "Vector Search", latency: 567, status: "warning" },
      { name: "Chunk Reranking", latency: 234, status: "warning" },
    ],
    whyActions:
      "The embedding model weights are outdated by 3 months. Re-indexing with the current model restores retrieval quality for the affected query types.",
    impact: { resolutionTime: "6–12 hrs", affectedCalls: "134 queries", confidenceBoost: "+45%" },
  },
  {
    id: "prompt-injection-guard",
    severity: "critical",
    confidence: "low",
    confidenceValue: 19,
    title: "Prompt injection bypass",
    description:
      "A crafted user input successfully overrode system prompt constraints, causing the model to ignore safety guidelines and leak internal instructions.",
    status: "FAILED",
    evidence: [
      "System prompt override confirmed in model output",
      "Injected instruction bypassed content filtering layer",
      "Input matched known jailbreak pattern variant #7",
      "Guard returned 'safe' classification for malicious input",
      "Incident affects 2 other models sharing the same guard version",
    ],
    actionLabels: ["Update injection detection patterns", "Escalate to security team", "Isolate affected model"],
    steps: [
      { name: "Input Scan", latency: 34, status: "ok" },
      { name: "Guard Evaluation", latency: 156, status: "failed" },
      { name: "Safety Filter", latency: 23, status: "failed" },
      { name: "Response Gate", latency: 0, status: "failed" },
    ],
    whyActions:
      "This injection pattern emerged after the guard's last update. The pattern update is critical and must be deployed immediately to all models sharing this guard version.",
    impact: { resolutionTime: "Immediate", affectedCalls: "2 models", confidenceBoost: "+78%" },
  },
  {
    id: "chat-assistant",
    severity: "high",
    confidence: "medium",
    confidenceValue: 58,
    title: "Off-topic response generation",
    description:
      "Chat assistant responded to a billing query with unrelated product documentation, failing to address the customer's issue and increasing handle time.",
    status: "FAILED",
    evidence: [
      "Response topic mismatch detected in 9 of last 30 sessions",
      "Customer re-asked the same question in the following turn",
      "Context window contained correct billing docs but were not referenced",
      "Average session length increased by 6 minutes on affected calls",
      "CSAT score for affected sessions: 2.1 / 5",
    ],
    actionLabels: [
      "Tune system prompt constraints",
      "Add topic classification guard",
      "Review context injection logic",
      "Flag conversation for QA",
      "Dismiss",
    ],
    steps: [
      { name: "Input Received", latency: 18, status: "ok" },
      { name: "Context Retrieval", latency: 143, status: "warning" },
      { name: "Response Planning", latency: 67, status: "warning" },
      { name: "LLM Generation", latency: 1102, status: "failed" },
      { name: "Output Filtering", latency: 29, status: "ok" },
    ],
    whyActions:
      "The system prompt lacks topic-boundary enforcement. A classification guard provides immediate protection while a deeper prompt revision is prepared.",
    impact: { resolutionTime: "2–3 hrs", affectedCalls: "27 sessions", confidenceBoost: "+31%" },
  },
  {
    id: "embedding-search",
    severity: "high",
    confidence: "medium",
    confidenceValue: 63,
    title: "Semantic similarity threshold failure",
    description:
      "Embedding search returned results below the acceptance threshold, surfacing irrelevant documents to downstream consumers and degrading answer quality.",
    status: "FAILED",
    evidence: [
      "Mean similarity score: 0.27 — acceptance threshold is 0.60",
      "Top-5 results all from unrelated product category",
      "Embedding model version mismatch between indexer and query encoder",
      "18% increase in 'no relevant answer' fallback responses",
    ],
    actionLabels: [
      "Recalibrate similarity threshold",
      "Rebuild embedding index",
      "Audit query normalisation",
      "Sync model versions",
    ],
    steps: [
      { name: "Query Encoding", latency: 55, status: "ok" },
      { name: "Index Lookup", latency: 312, status: "warning" },
      { name: "Similarity Ranking", latency: 88, status: "failed" },
      { name: "Result Filtering", latency: 14, status: "failed" },
      { name: "Response Assembly", latency: 22, status: "ok" },
    ],
    whyActions:
      "The version mismatch between the indexer and query encoder is the root cause. Re-indexing with a consistent model version should restore similarity scores immediately.",
    impact: { resolutionTime: "4–6 hrs", affectedCalls: "89 queries", confidenceBoost: "+38%" },
  },
  {
    id: "summarizer-v1",
    severity: "medium",
    confidence: "medium",
    confidenceValue: 71,
    title: "Summary factual inconsistency",
    description:
      "Summarizer attributed a resolution step to an agent who was not part of the interaction, producing a factually incorrect summary that misled QA reviewers.",
    status: "WARNING",
    evidence: [
      "Attribution error confirmed against transcript ground truth",
      "Affected 7 of 40 summaries in the last 24 hours",
      "Hallucinated agent name not present anywhere in source transcript",
      "QA team flagged 2 downstream escalations based on incorrect summaries",
    ],
    actionLabels: [
      "Enable post-generation fact checking",
      "Reduce summarisation temperature",
      "Add source attribution tracking",
      "Hold summaries for manual review",
    ],
    steps: [
      { name: "Transcript Ingestion", latency: 44, status: "ok" },
      { name: "Sentence Segmentation", latency: 31, status: "ok" },
      { name: "Key Point Extraction", latency: 198, status: "warning" },
      { name: "Summary Generation", latency: 743, status: "warning" },
      { name: "Fact Check", latency: 0, status: "failed" },
    ],
    whyActions:
      "The fact-check step is not yet implemented — it was scaffolded but never wired in. Enabling it will catch attribution errors before summaries are delivered.",
    impact: { resolutionTime: "1–2 hrs", affectedCalls: "40 summaries", confidenceBoost: "+24%" },
  },
  {
    id: "qa-pipeline-test",
    severity: "medium",
    confidence: "high",
    confidenceValue: 76,
    title: "Benchmark assertion mismatch",
    description:
      "QA pipeline returned incorrect answers on 3 of 10 benchmark questions, indicating model drift since the last evaluation checkpoint two weeks ago.",
    status: "WARNING",
    evidence: [
      "3/10 benchmark assertions failed (was 0/10 two weeks ago)",
      "Failed questions cluster around date-arithmetic and policy lookups",
      "Model version rolled over on 2026-04-14 without re-baselining",
      "Downstream production pipeline uses the same model version",
    ],
    actionLabels: [
      "Run full regression suite",
      "Compare against baseline checkpoint",
      "Adjust evaluation prompts",
      "Pin model version until investigation complete",
    ],
    steps: [
      { name: "Test Case Load", latency: 12, status: "ok" },
      { name: "Prompt Formatting", latency: 28, status: "ok" },
      { name: "Model Inference", latency: 867, status: "ok" },
      { name: "Answer Extraction", latency: 45, status: "warning" },
      { name: "Assertion Check", latency: 19, status: "failed" },
    ],
    whyActions:
      "The model version bump was not accompanied by a re-baseline. Running the full regression suite will confirm whether this is isolated to these 3 questions or a broader drift.",
    impact: { resolutionTime: "3–4 hrs", affectedCalls: "10 benchmarks", confidenceBoost: "+22%" },
  },
];

// ── API mapping ────────────────────────────────────────────────────────────

function severityFromName(name: string | null): Severity {
  const n = (name ?? "").toLowerCase();
  if (n.includes("escalation") || n.includes("injection")) return "critical";
  if (n.includes("hallucination") || n.includes("sentiment")) return "high";
  return "medium";
}

function severityFromTrace(trace: Trace): Severity {
  const lower = trace.tags.map((t) => t.toLowerCase());
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium")) return "medium";
  return severityFromName(trace.name);
}

function confidenceFromTrace(trace: Trace): { level: Confidence; value: number } {
  function toLevel(pct: number): { level: Confidence; value: number } {
    if (pct >= 70) return { level: "high", value: pct };
    if (pct >= 40) return { level: "medium", value: pct };
    return { level: "low", value: pct };
  }

  const FALLBACK_CONFIDENCE: Record<string, number> = {
    "appointment-scheduler": 31,
    "chat-assistant": 45,
  };

  // 1. metadata.confidenceScore (set by seed script — most reliable)
  const meta = trace.metadata as Record<string, unknown> | null;
  const metaScore = meta?.confidenceScore;
  if (typeof metaScore === "number" && metaScore > 0) {
    const pct = metaScore > 1 ? Math.round(metaScore) : Math.round(metaScore * 100);
    return toLevel(pct);
  }

  // 2. scores array (included on some Langfuse responses)
  const scoreEntry = trace.scores?.find((s) => s.name === "confidence");
  if (scoreEntry != null && scoreEntry.value > 0) {
    const pct = scoreEntry.value > 1
      ? Math.round(scoreEntry.value)
      : Math.round(scoreEntry.value * 100);
    return toLevel(pct);
  }

  // 3. per-trace fallback for known zero-score traces
  const name = trace.name ?? "";
  if (FALLBACK_CONFIDENCE[name] != null) return toLevel(FALLBACK_CONFIDENCE[name]);

  // 4. tag-based last resort
  const lower = trace.tags.map((t) => t.toLowerCase());
  if (lower.includes("high-confidence")) return { level: "high", value: 80 };
  if (lower.includes("medium-confidence")) return { level: "medium", value: 45 };
  if (lower.includes("low-confidence")) return { level: "low", value: 25 };
  return toLevel(40);
}

function statusFromTags(tags: string[]): TraceDetail["status"] {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes("warning")) return "WARNING";
  if (lower.includes("success")) return "SUCCESS";
  return "FAILED";
}

function failureTypeFromName(name: string | null): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("escalation")) return "Missed escalation signal";
  if (n.includes("injection")) return "Prompt injection bypass";
  if (n.includes("hallucination")) return "Hallucination in response";
  if (n.includes("sentiment")) return "Sentiment detection failure";
  if (n.includes("intent")) return "Intent misclassification";
  if (n.includes("scheduler") || n.includes("appointment")) return "Scheduling conflict error";
  if (n.includes("summary")) return "Incomplete summary output";
  if (n.includes("rag") || n.includes("retrieval")) return "Low retrieval relevance";
  return "Trace evaluation failure";
}

function apiTraceToRow(trace: Trace): TraceRow {
  const severity = severityFromTrace(trace);
  const { level: confidence, value: confidenceValue } = confidenceFromTrace(trace);
  return {
    id: trace.id,
    name: trace.name ?? trace.id,
    severity,
    failureType:
      (trace.metadata as Record<string, string>)?.failureType ??
      failureTypeFromName(trace.name),
    confidence,
    confidenceValue,
    status: statusFromTags(trace.tags),
  };
}

function resolveStaticId(trace: Trace): string {
  const n = (trace.name ?? "").toLowerCase().replace(/\s+/g, "-");
  const match = TRACES.find((t) => n.includes(t.id) || t.id.includes(n) || n === t.id);
  return match?.id ?? trace.id;
}

function apiTraceToDetail(trace: Trace): TraceDetail {
  const severity = severityFromTrace(trace);
  const { level: confidence, value: confidenceValue } = confidenceFromTrace(trace);
  const outputStr =
    typeof trace.output === "string"
      ? trace.output
      : JSON.stringify(trace.output ?? "");
  return {
    id: trace.id,
    severity,
    confidence,
    confidenceValue,
    title: trace.name ?? trace.id,
    description: outputStr.slice(0, 200) || "No description available.",
    status: statusFromTags(trace.tags),
    evidence: [],
    actionLabels: ["Review trace", "Mark as resolved"],
    steps: [],
    whyActions: "Review the full trace to determine the appropriate action.",
    impact: { resolutionTime: "Unknown", affectedCalls: "1 trace", confidenceBoost: "Unknown" },
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STEP_DOT: Record<PipelineStep["status"], string> = {
  ok: "bg-green-500",
  warning: "bg-amber-400",
  failed: "bg-red-500",
};

const STEP_LABEL: Record<PipelineStep["status"], string> = {
  ok: "text-green-600",
  warning: "text-amber-600",
  failed: "text-red-600",
};


// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: apiTraces, loading, error } = useTraces();

  // Use static TRACES for rich detail (steps/evidence/actions), but patch in real
  // confidence values from API scores so sidebar and main panel always agree.
  const liveDetails: TraceDetail[] = (() => {
    if (!apiTraces || apiTraces.length === 0) return TRACES;
    return TRACES.map((t) => {
      const apiTrace = apiTraces.find((a) => resolveStaticId(a) === t.id);
      if (!apiTrace) return t;
      const { level, value } = confidenceFromTrace(apiTrace);
      return { ...t, confidence: level, confidenceValue: value };
    });
  })();

  const SIDEBAR_ORDER = [
    "hallucination-detector",
    "escalation-detector",
    "intent-detection-v2",
    "prompt-injection-guard",
    "sentiment-analysis",
    "appointment-scheduler",
    "call-summary-generator",
    "rag-pipeline",
  ];

  const sidebarRows: TraceRow[] = apiTraces && apiTraces.length > 0
    ? apiTraces
        .map((t) => ({ ...apiTraceToRow(t), id: resolveStaticId(t) }))
        .sort((a, b) => {
          const ai = SIDEBAR_ORDER.indexOf(a.id);
          const bi = SIDEBAR_ORDER.indexOf(b.id);
          if (ai === -1 && bi === -1) return 0;
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        })
    : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [askExpanded, setAskExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestion, setSuggestion] = useState<ClaudeSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const suggestionCache = useRef<Map<string, ClaudeSuggestion>>(new Map());

  const fetchSuggestion = useCallback(async (detail: TraceDetail) => {
    const cached = suggestionCache.current.get(detail.id);
    if (cached) {
      setSuggestion(cached);
      return;
    }
    setSuggestionLoading(true);
    setSuggestion(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traceName: detail.id,
          severity: detail.severity,
          failureType: detail.title,
          confidenceScore: detail.confidenceValue,
          description: detail.description,
        }),
      });
      const data = (await res.json()) as ClaudeSuggestion;
      if (Array.isArray(data.actions)) {
        suggestionCache.current.set(detail.id, data);
        setSuggestion(data);
      }
    } catch {
      // fall back to static data silently
    } finally {
      setSuggestionLoading(false);
    }
  }, []);

  // Set initial selection once data loads and fetch first suggestion
  useEffect(() => {
    if (!loading && selectedId === null) {
      const firstId = liveDetails[0]?.id ?? TRACES[0].id;
      setSelectedId(firstId);
      const firstDetail = liveDetails.find((t) => t.id === firstId) ?? liveDetails[0];
      if (firstDetail) fetchSuggestion(firstDetail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Auto-scroll messages to bottom when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traceName: trace.id,
          severity: trace.severity,
          failureType: trace.title,
          confidenceScore: trace.confidenceValue,
          description: trace.description,
          question: text,
        }),
      });
      const data = await res.json() as { answer?: string; error?: string };
      if (!res.ok || !data.answer) {
        throw new Error(data.error ?? "Empty response");
      }
      setChatMessages((prev) => [...prev, { role: "assistant", text: data.answer! }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get a response.";
      setChatMessages((prev) => [...prev, { role: "assistant", text: msg }]);
    } finally {
      setChatLoading(false);
    }
  }

  const resolvedId = selectedId ?? liveDetails[0]?.id ?? TRACES[0].id;
  const trace = liveDetails.find((t) => t.id === resolvedId) ?? liveDetails[0] ?? TRACES[0];
  const risk = riskTokens[trace.severity];

  const actionLabels = suggestion?.actions ?? trace.actionLabels;
  const actions = actionLabels.map((label, i) => ({
    id: `${trace.id}-${i}`,
    label,
    onClick: () => {},
  }));
  const whyText = suggestion?.reasoning ?? trace.whyActions;

  function handleTraceSelect(id: string) {
    setSelectedId(id);
    setEvidenceExpanded(true);
    setWhyExpanded(false);
    setChatMessages([]);
    setChatInput("");
    const detail = liveDetails.find((t) => t.id === id) ?? liveDetails[0];
    if (detail) fetchSuggestion(detail);
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Loading traces…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {error && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Could not load live data ({error}) — showing sample traces.
        </div>
      )}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <Sidebar activeTraceId={resolvedId} onTraceSelect={handleTraceSelect} traces={sidebarRows} />

        {/* ── Content area: unified header + two-column body ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Unified header — spans both main panel and right panel */}
          <div className="shrink-0 border-b border-border bg-white px-8 py-4">
            <nav className="mb-2.5 flex items-center gap-1 text-xs text-gray-400">
              <span>Traces</span>
              <ChevronRight className="size-3" />
              <span className="font-medium text-gray-700">{trace.id}</span>
            </nav>
            <div className="flex items-center justify-between gap-6">
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="shrink-0 text-xl font-bold text-gray-900">{trace.title}</h1>
                <span
                  className={cn(
                    "shrink-0 rounded border px-2 py-0.5 text-[11px] font-bold uppercase",
                    risk.bg,
                    risk.border,
                    risk.text,
                  )}
                >
                  {trace.severity}
                </span>
                <ConfidenceBadge level={trace.confidence} value={trace.confidenceValue} />
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {trace.confidenceValue > 0 ? "IN REVIEW" : "NEW"}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm">
                  Quarantine
                </Button>
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  Rerun Evaluation
                </Button>
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div className="flex flex-1 overflow-hidden">

            {/* ── Main panel ── */}
            <main className="flex-1 overflow-y-auto bg-white">
              <div className="space-y-6 px-8 py-6">

                {/* ── TRACE TIMELINE ── */}
                <section>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Trace Timeline
                  </p>
                  {trace.steps.length === 0 ? (
                    <div className="flex items-center justify-center rounded-xl border border-border bg-white px-5 py-8">
                      <p className="text-sm text-gray-400">No timeline data available</p>
                    </div>
                  ) : (
                    <ol className="overflow-hidden rounded-xl border border-border bg-white px-5 py-4">
                      {trace.steps.map((step, i) => {
                        const isLast = i === trace.steps.length - 1;
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <div className="flex shrink-0 flex-col items-center self-stretch">
                              <span
                                className={cn(
                                  "mt-0.5 size-2.5 rounded-full ring-2 ring-white",
                                  STEP_DOT[step.status],
                                )}
                              />
                              {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200" />}
                            </div>
                            <div
                              className={cn(
                                "flex min-w-0 flex-1 items-baseline justify-between gap-4",
                                !isLast ? "pb-5" : "pb-0",
                              )}
                            >
                              <span className="text-sm leading-tight text-gray-800">
                                {step.name}
                              </span>
                              <div className="flex shrink-0 items-center gap-3">
                                <span className="text-xs text-gray-400">{step.latency}ms</span>
                                <span
                                  className={cn(
                                    "w-14 text-right text-[11px] font-semibold uppercase tracking-wide",
                                    STEP_LABEL[step.status],
                                  )}
                                >
                                  {step.status}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>

                {/* ── ROOT CAUSE DETECTED ── */}
                <section>
                  <RootCauseCard
                    severity={trace.severity}
                    title={trace.title}
                    description={trace.description}
                  />
                </section>

                {/* ── EVIDENCE ── */}
                <section>
                  <EvidencePanel
                    evidence={trace.evidence}
                    expanded={evidenceExpanded}
                    onToggle={() => setEvidenceExpanded((v) => !v)}
                  />
                </section>

              </div>
            </main>

            {/* ── Right panel ── */}
            <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-gray-50">

              {/* Scrollable content */}
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

                {/* SUGGESTED ACTIONS */}
                <section>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Suggested Actions
                  </p>
                  {suggestionLoading ? (
                    <div className="flex flex-col gap-2">
                      {[72, 88, 64].map((w, i) => (
                        <div
                          key={i}
                          className="h-[46px] animate-pulse rounded-md border border-gray-200 bg-gray-100"
                          style={{ width: "100%" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ActionList actions={actions} />
                  )}
                </section>

                {/* Why these actions */}
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    <p className="text-xs font-semibold text-gray-700">Why these actions?</p>
                  </div>
                  {suggestionLoading ? (
                    <div className="space-y-1.5">
                      <div className="h-3 w-full animate-pulse rounded bg-amber-100" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-amber-100" />
                      <div className="h-3 w-4/6 animate-pulse rounded bg-amber-100" />
                    </div>
                  ) : (
                    <>
                      <p className={cn("text-xs leading-relaxed text-gray-700", !whyExpanded && "line-clamp-2")}>
                        {whyText}
                      </p>
                      <button
                        type="button"
                        onClick={() => setWhyExpanded((v) => !v)}
                        className="mt-1.5 text-[11px] font-medium text-amber-600 hover:text-amber-700"
                      >
                        {whyExpanded ? "Show less" : "Show more"}
                      </button>
                    </>
                  )}
                </div>

                {/* ESTIMATED IMPACT */}
                <section>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Estimated Impact
                  </p>
                  <div className="divide-y divide-border">
                    {[
                      { label: "Resolution time", value: trace.impact.resolutionTime },
                      { label: "Affected calls", value: trace.impact.affectedCalls },
                      { label: "Confidence boost", value: trace.impact.confidenceBoost },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Ask — pinned to bottom */}
              <div className="shrink-0 border-t border-border bg-gray-50 pb-3 pt-2">
                <div className="mx-3 rounded-lg border border-t-2 border-gray-200 border-t-blue-500 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Ask about this failure</p>
                    <button
                      type="button"
                      onClick={() => setAskExpanded((v) => !v)}
                      className="flex size-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <ChevronDown className={cn("size-4 transition-transform", askExpanded ? "rotate-0" : "-rotate-90")} />
                    </button>
                  </div>

                  {/* Collapsible body */}
                  {askExpanded && (
                    <>
                      {/* Conversation history */}
                      {chatMessages.length > 0 && (
                        <div className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto">
                          {chatMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={cn(
                                "rounded-lg px-3 py-2 text-sm",
                                msg.role === "user"
                                  ? "self-end bg-blue-50 text-blue-900"
                                  : "self-start bg-gray-100 text-gray-700",
                              )}
                            >
                              {msg.text}
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="self-start rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-400">
                              Thinking…
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}

                      {/* Input */}
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        placeholder={`e.g. Why did ${trace.id} fail with ${trace.title}?`}
                        className="w-full resize-none rounded-md border border-gray-200 p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        style={{ minHeight: "80px" }}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={sendChatMessage}
                          disabled={chatLoading || !chatInput.trim()}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send className="size-3.5" />
                          Ask
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </aside>

          </div>
        </div>

      </div>
    </div>
  );
}
