import { cn } from "@/lib/utils";

interface Action {
  id: string;
  label: string;
  onClick: () => void;
}

interface ActionListProps {
  actions: Action[];
  className?: string;
}

export function ActionList({ actions, className }: ActionListProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
