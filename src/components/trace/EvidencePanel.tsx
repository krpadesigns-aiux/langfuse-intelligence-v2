"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EvidencePanelProps {
  evidence: string[];
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function EvidencePanel({
  evidence,
  expanded,
  onToggle,
  className,
}: EvidencePanelProps) {
  const count = evidence.length;
  const hiddenCount = count - 1;

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-sm shadow-sm",
        className,
      )}
    >
      {expanded ? (
        <>
          {/* Gray-50 header — matches Figma expanded state */}
          <div className="flex h-11 items-center justify-between border-b border-[#e5eaed] bg-gray-50 px-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-gray-700">
                EVIDENCE
              </span>
              <span className="rounded-full bg-[#e5eaed] px-1.5 py-0.5 text-[11px] font-bold text-gray-500">
                {count}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              ▲ Hide
            </button>
          </div>

          {/* Scrollable item list */}
          <ScrollArea className="max-h-48">
            <ul className="flex flex-col gap-[5px] px-5 py-3">
              {evidence.map((item, i) => (
                <li key={i} className="flex items-center gap-[5px]">
                  <span className="size-[5px] shrink-0 rounded-full bg-gray-700" />
                  <span className="text-[13px] text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </>
      ) : (
        /* Collapsed: first item + show-more toggle */
        <div className="flex flex-col gap-3 px-6 py-6">
          <li className="flex list-none items-center gap-[5px]">
            <span className="size-[5px] shrink-0 rounded-full bg-gray-700" />
            <span className="text-[13px] text-gray-700">{evidence[0]}</span>
          </li>

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={onToggle}
              className="self-start text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              ▼ Show {hiddenCount} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
