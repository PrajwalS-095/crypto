import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";
import { Simulation } from "@/components/simulation/simulation";

export const metadata: Metadata = {
  title: "Simulation",
  description:
    "Interactive step-by-step simulation of key exchange through a Key Distribution Center, using real AES-GCM encryption in the browser.",
};

export default function SimulationPage() {
  return (
    <SectionPage
      slug="simulation"
      wide
      intro="Step through a simplified KDC key exchange. All encryption and decryption runs in your browser; nothing is sent to a server."
    >
      <Simulation />
    </SectionPage>
  );
}
