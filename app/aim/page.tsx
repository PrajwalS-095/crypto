import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";

export const metadata: Metadata = {
  title: "Aim",
  description: "Aim of the experiment on key exchange using a trusted third party (KDC).",
};

export default function AimPage() {
  return (
    <SectionPage slug="aim">
      <div className="prose-lab">
        <p className="text-[1.05rem] leading-relaxed text-ink">
          To understand and simulate secure key exchange between two communicating parties using a Trusted Third Party,
          the <strong>Key Distribution Center (KDC)</strong>, and to observe how a fresh shared session key is
          established between them without the two parties ever having shared a secret directly.
        </p>
        <p>
          In this experiment you will step through a simplified symmetric-key protocol in which Alice obtains a session
          key and a ticket from the KDC, passes the ticket to Bob, and then uses the session key to send Bob an encrypted
          message. Every encryption and decryption in the simulation is performed by your browser using AES-256-GCM.
        </p>
      </div>
    </SectionPage>
  );
}
