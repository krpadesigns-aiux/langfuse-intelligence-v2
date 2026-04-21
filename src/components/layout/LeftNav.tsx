"use client";

import { LayoutList, FlaskConical, MessageSquare, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TOP_ITEMS = [
  { id: "traces",    icon: LayoutList,    label: "Traces"    },
  { id: "evals",     icon: FlaskConical,  label: "Evals"     },
  { id: "prompts",   icon: MessageSquare, label: "Prompts"   },
  { id: "analytics", icon: BarChart2,     label: "Analytics" },
] as const;

type NavId = (typeof TOP_ITEMS)[number]["id"] | "settings";

interface LeftNavProps {
  activeId?: NavId;
  onNavigate?: (id: NavId) => void;
}

function NavButton({
  id,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  id: NavId;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition-colors",
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-400 hover:bg-muted hover:text-gray-600",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

export function LeftNav({ activeId = "traces", onNavigate }: LeftNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="flex w-[68px] shrink-0 flex-col items-center gap-0.5 border-r border-border bg-white px-2 py-2"
    >
      {TOP_ITEMS.map(({ id, icon, label }) => (
        <NavButton
          key={id}
          id={id}
          icon={icon}
          label={label}
          active={activeId === id}
          onClick={() => onNavigate?.(id)}
        />
      ))}

      <div className="mt-auto">
        <NavButton
          id="settings"
          icon={Settings}
          label="Settings"
          active={activeId === "settings"}
          onClick={() => onNavigate?.("settings")}
        />
      </div>
    </nav>
  );
}
