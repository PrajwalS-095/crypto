import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";

export const metadata: Metadata = {
  title: "Objective",
  description: "Learning objectives for the KDC key exchange experiment.",
};

const OBJECTIVES = [
  "Understand the role of a Trusted Third Party in symmetric key management.",
  "Understand how a Key Distribution Center generates and distributes session keys.",
  "Distinguish between long-term (master) keys and short-lived session keys.",
  "Understand how a ticket lets the KDC deliver a key to Bob through Alice, without Alice being able to read it.",
  "Understand how authentication follows from knowledge of a shared secret, and how a nonce and timestamp provide freshness.",
  "Observe real authenticated encryption (AES-GCM) protecting each protocol message.",
  "Experiment with different participant names, messages and keys, and observe how a modified ticket is rejected.",
];

export default function ObjectivePage() {
  return (
    <SectionPage slug="objective" intro="After performing this experiment, the student should be able to:">
      <ul className="-mt-3 divide-y divide-line border-b border-line">
        {OBJECTIVES.map((text, i) => (
          <li key={i} className="flex gap-3 py-3 text-[0.975rem] text-ink-soft">
            <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
