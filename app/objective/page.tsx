import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";

export const metadata: Metadata = {
  title: "Objective",
  description: "Learning objectives for the KDC key exchange experiment.",
};

const OBJECTIVES = [
  "To understand the concept of Key Distribution Center (KDC).",
  "To establish secure communication between two parties using a trusted third party.",
  "To generate and distribute a shared session key securely.",
  "To demonstrate the use of symmetric encryption for secure key exchange.",
  "To understand the role of encrypted tickets in authentication and key distribution.",
  "To ensure confidentiality during communication between the sender and receiver.",
];

export default function ObjectivePage() {
  return (
    <SectionPage slug="objective">
      <ul className="-mt-3 divide-y divide-line border-b border-line">
        {OBJECTIVES.map((text, i) => (
          <li key={i} className="flex gap-3 py-3 text-[0.975rem] text-ink">
            <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
