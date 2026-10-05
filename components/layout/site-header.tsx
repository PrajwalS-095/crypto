import { MobileNav } from "@/components/layout/mobile-nav";
import { EXPERIMENT_TITLE } from "@/lib/sections";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <MobileNav />
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="hidden h-7 w-7 shrink-0 place-items-center rounded bg-accent font-mono text-xs font-medium text-canvas sm:grid"
          >
            K
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Cryptography Virtual Lab
            </p>
            <p className="truncate text-sm font-semibold text-ink sm:text-[0.95rem]">{EXPERIMENT_TITLE}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
