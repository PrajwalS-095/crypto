export interface LabSection {
  slug: "aim" | "theory" | "objective" | "procedure" | "simulation";
  title: string;
  href: string;
}

export const LAB_SECTIONS: readonly LabSection[] = [
  { slug: "aim", title: "Aim", href: "/aim" },
  { slug: "theory", title: "Theory", href: "/theory" },
  { slug: "objective", title: "Objective", href: "/objective" },
  { slug: "procedure", title: "Procedure", href: "/procedure" },
  { slug: "simulation", title: "Simulation", href: "/simulation" },
] as const;

export const EXPERIMENT_TITLE = "Key Exchange with Trusted Third Party (KDC)";
