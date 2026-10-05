import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";
import { KeyLabel } from "@/components/ui/key-label";

export const metadata: Metadata = {
  title: "Procedure",
  description: "Step-by-step procedure for performing the KDC key exchange simulation.",
};

export default function ProcedurePage() {
  return (
    <SectionPage slug="procedure">
      <div className="prose-lab">
        <h2 className="!mt-0">Setting up</h2>
        <ol>
          <li>
            Open the <strong>Simulation</strong> section. The three participants (Alice, the KDC and Bob) are shown with a
            preview of the message flow, and the <strong>Simulation settings</strong> panel is filled with defaults.
          </li>
          <li>
            Optionally change the names of the <strong>Initiator (Alice)</strong> and <strong>Responder (Bob)</strong>,
            and the <strong>message</strong> Alice will send. Names must be different and cannot be &ldquo;KDC&rdquo;.
          </li>
          <li>
            Optionally expand <strong>Advanced: long-term keys and tampering</strong>. Here you can view the long-term keys{" "}
            <KeyLabel id="A" /> and <KeyLabel id="B" />, generate new ones with <strong>New</strong>, or paste your own
            (64 hexadecimal characters each). You can also enable <strong>Tamper with the ticket in transit</strong>.
          </li>
          <li>
            Click <strong>Start simulation</strong>. The simulation runs Step 1 immediately.
          </li>
        </ol>

        <h2>Performing the exchange</h2>
        <p>
          Press <strong>Next step</strong> to advance through the protocol. For each step, observe the highlighted row in
          the message-flow diagram, the keys each participant holds (shown under their names), the message or action in
          protocol notation, the cryptographic operation performed by the browser, and the explanation.
        </p>
        <ol>
          <li>
            <strong>Alice requests a session key.</strong> Observe the plaintext request REQUEST(Alice, Bob, N₁) travelling
            from Alice to the KDC, and the random nonce N₁.
          </li>
          <li>
            <strong>KDC generates a session key.</strong> Observe the new 256-bit session key <KeyLabel id="AB" />. Use the
            eye icon to reveal its value.
          </li>
          <li>
            <strong>KDC creates a ticket for Bob.</strong> Observe the ticket plaintext (Alice, <KeyLabel id="AB" />,
            timestamp T) and the ciphertext obtained by encrypting it under <KeyLabel id="B" />.
          </li>
          <li>
            <strong>KDC sends the response to Alice.</strong> Observe that the response containing N₁, Bob&apos;s name,{" "}
            <KeyLabel id="AB" /> and the ticket is encrypted under <KeyLabel id="A" />.
          </li>
          <li>
            <strong>Alice decrypts the KDC response.</strong> Observe Alice recovering <KeyLabel id="AB" /> using{" "}
            <KeyLabel id="A" />, and the checks on the authentication tag, the nonce and the responder&apos;s name.
          </li>
          <li>
            <strong>Alice forwards the ticket to Bob.</strong> Observe Bob decrypting the ticket with{" "}
            <KeyLabel id="B" />, recovering <KeyLabel id="AB" />, and checking the timestamp.
          </li>
          <li>
            <strong>Secure session established.</strong> Compare Alice&apos;s and Bob&apos;s copies of{" "}
            <KeyLabel id="AB" />.
          </li>
          <li>
            <strong>Secure communication.</strong> Observe your message being encrypted under <KeyLabel id="AB" /> by
            Alice and decrypted by Bob, followed by a summary of the completed exchange.
          </li>
        </ol>

        <h2>Reviewing and repeating</h2>
        <ol>
          <li>
            Use <strong>Previous</strong> and <strong>Next</strong> at any time to revisit completed steps. Expand{" "}
            <strong>Technical details</strong> under a step to see the IV, the output size and the serialised plaintext.
          </li>
          <li>
            Click <strong>Restart simulation</strong> to run the exchange again with the same settings. Note that the
            session key, nonce and ciphertexts change on every run, while the long-term keys stay the same.
          </li>
          <li>
            Click <strong>Change settings</strong>, enable <strong>Tamper with the ticket in transit</strong>, and start
            again. At Step 6, observe that Bob rejects the modified ticket and the session is not established.
          </li>
        </ol>
      </div>
    </SectionPage>
  );
}
