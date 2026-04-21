import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { riskTokens, type Severity } from "@/lib/tokens";

interface RootCauseCardProps {
  severity: Severity;
  title: string;
  description: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  className?: string;
}

export function RootCauseCard({
  severity,
  title,
  description,
  onThumbsUp,
  onThumbsDown,
  className,
}: RootCauseCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border border-l-2 bg-white shadow-sm",
        riskTokens[severity].border,
        className,
      )}
    >
      {/* Header row — label + thumbs inside the card */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-1.5">
          <TriangleAlert className="size-3.5 text-amber-500" />
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Root Cause Detected
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onThumbsUp}
            className="flex size-7 items-center justify-center rounded-lg text-base transition-colors hover:bg-gray-100"
          >
            👍
          </button>
          <button
            type="button"
            onClick={onThumbsDown}
            className="flex size-7 items-center justify-center rounded-lg text-base transition-colors hover:bg-gray-100"
          >
            👎
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-5 py-4">
        <p className="text-sm font-semibold leading-5 text-gray-900">{title}</p>
        <p className="text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}
