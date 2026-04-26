export function GbuBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/gbu/logo.png" alt="Gautam Buddha University logo" className={compact ? "h-10 w-10" : "h-12 w-12"} />
      <div className="leading-tight">
        <p className={compact ? "text-sm font-bold" : "text-base font-bold"}>गौतम बुद्ध विश्वविद्यालय</p>
        <p className={compact ? "text-xs font-semibold uppercase tracking-wide" : "text-sm font-semibold uppercase tracking-wide"}>
          Gautam Buddha University
        </p>
        {!compact && <p className="text-xs text-muted-foreground">An Ultimate Destination for Higher Learning</p>}
      </div>
    </div>
  );
}
