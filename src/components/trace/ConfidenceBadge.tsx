import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { confidenceTokens, type Confidence } from "@/lib/tokens";

interface ConfidenceBadgeProps {
  level: Confidence;
  value: number;
}

export function ConfidenceBadge({ level, value }: ConfidenceBadgeProps) {
  const tokens = confidenceTokens[level];

  return (
    <Badge
      variant="ghost"
      className={cn("gap-1 px-0 hover:bg-transparent", tokens.text)}
    >
      <span className="font-semibold">{value}%</span>
      <span className="font-normal opacity-80">{tokens.label}</span>
    </Badge>
  );
}
