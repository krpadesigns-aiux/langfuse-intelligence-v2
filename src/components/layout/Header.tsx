export function Header() {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-white px-4">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">TI</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold text-gray-900">Trace Intel</span>
          <span className="text-[11px] text-gray-400">Making AI behavior readable</span>
        </div>
      </div>

      {/* User identity */}
      <div className="flex items-center gap-2.5">
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
