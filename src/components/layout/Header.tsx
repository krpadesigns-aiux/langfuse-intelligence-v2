import { Menu } from "lucide-react";

interface HeaderProps {
  onHamburgerClick?: () => void;
}

export function Header({ onHamburgerClick }: HeaderProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-white px-4">
      {/* Left: hamburger (mobile only) + logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onHamburgerClick}
          aria-label="Open navigation"
          className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xs font-bold text-white">TI</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-gray-900">Trace Intel</span>
            <span className="hidden text-[11px] text-gray-400 md:block">Making AI behavior readable</span>
          </div>
        </div>
      </div>

      {/* User identity — hidden on mobile */}
      <div className="hidden items-center gap-2.5 md:flex">
        <div className="flex flex-col items-end leading-none">
          <span className="text-xs font-medium text-gray-700">Jason</span>
          <span className="text-[11px] text-gray-400">AI Investigator</span>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-blue-600">
          <span className="text-xs font-semibold text-white">J</span>
        </div>
      </div>
    </header>
  );
}
