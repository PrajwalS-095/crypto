import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";
import { KeyTopology } from "@/components/content/key-topology";
import { KeyLabel } from "@/components/ui/key-label";

export const metadata: Metadata = {
  title: "Theory",
  description:
    "Theory of key distribution using a trusted third party (KDC): entities, shared keys, and step-by-step key exchange.",
};

export default function TheoryPage() {
  return (
    <SectionPage slug="theory">
      <div className="prose-lab space-y-6">
        <p className="text-[1.05rem] leading-relaxed text-ink">
          A <strong>Key Distribution Center (KDC)</strong> is a trusted third party responsible for generating, managing, and distributing secret keys to communicating entities. It is commonly used in symmetric-key cryptographic systems to establish secure communication between users.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-ink mb-3">System Entities</h2>
          <p className="mb-3 text-ink">The system consists of three main entities:</p>
          <ul className="list-disc pl-6 space-y-2 text-ink">
            <li>
              <strong>Alice (Sender):</strong> The user who wants to communicate securely with Bob.
            </li>
            <li>
              <strong>Bob (Receiver):</strong> The user who receives the encrypted message from Alice.
            </li>
            <li>
              <strong>KDC (Trusted Third Party):</strong> The central authority that generates and distributes the session key.
            </li>
          </ul>
        </div>

        <p className="text-[1.05rem] leading-relaxed text-ink">
          Initially, Alice shares a secret key <KeyLabel id="A" /> with the KDC, and Bob shares a secret key <KeyLabel id="B" /> with the KDC. When Alice wants to communicate with Bob, the KDC generates a fresh session key <KeyLabel id="AB" /> and securely distributes it to both parties.
        </p>

        <KeyTopology />

        <div>
          <h2 className="text-xl font-semibold text-ink mb-3">Key Exchange Steps</h2>
          <p className="mb-3 text-ink">The key exchange process involves the following steps:</p>
          <ol className="list-decimal pl-6 space-y-2 text-ink">
            <li>
              <strong>Request:</strong> Alice sends a request to the KDC to establish secure communication with Bob.
            </li>
            <li>
              <strong>Session key generation:</strong> The KDC generates a new session key <KeyLabel id="AB" />.
            </li>
            <li>
              <strong>Key distribution:</strong> The KDC sends the session key to Alice, encrypted using <KeyLabel id="A" />, along with a ticket intended for Bob, encrypted using <KeyLabel id="B" />.
            </li>
            <li>
              <strong>Ticket forwarding:</strong> Alice forwards Bob&apos;s encrypted ticket to Bob.
            </li>
            <li>
              <strong>Secure communication:</strong> Both Alice and Bob obtain the session key and use it to encrypt and decrypt messages securely.
            </li>
          </ol>
        </div>
      </div>
    </SectionPage>
  );
}
