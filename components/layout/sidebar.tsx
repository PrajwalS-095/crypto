import { NavLinks } from "@/components/layout/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-sidebar lg:block">
      <nav aria-label="Experiment sections" className="sticky top-14 py-6">
        <p className="mb-2 px-4 text-xs font-medium text-muted">Experiment</p>
        <NavLinks />
      </nav>
    </aside>
  );
}
