import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";

export const metadata: Metadata = {
  title: "Introduction",
  description: "Introduction to key exchange using a trusted third party (KDC).",
};

export default function AimPage() {
  return (
    <SectionPage slug="aim">
      <div className="prose-lab space-y-4">
        <p className="text-[1.05rem] leading-relaxed text-ink">
          Key exchange with a Trusted Third Party, known as a Key Distribution Center (KDC), is a cryptographic technique used to establish secure communication between two parties over an insecure network. The KDC acts as a trusted authority that helps two communicating users, such as Alice and Bob, obtain a common secret session key without directly sharing a secret key with each other beforehand.
        </p>
        <p className="text-[1.05rem] leading-relaxed text-ink">
          The KDC generates and distributes a temporary session key that both parties use to encrypt and decrypt messages. Each user shares a permanent secret key with the KDC, which is used to protect the session key during distribution. This method improves security and simplifies key management in symmetric-key cryptography.
        </p>
      </div>
    </SectionPage>
  );
}
