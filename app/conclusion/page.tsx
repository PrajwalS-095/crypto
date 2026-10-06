import type { Metadata } from "next";
import { SectionPage } from "@/components/layout/section-page";
import { KeyLabel } from "@/components/ui/key-label";

export const metadata: Metadata = {
  title: "Conclusion",
  description: "Conclusion of the KDC key exchange experiment.",
};

export default function ConclusionPage() {
  return (
    <SectionPage slug="conclusion">
      <div className="prose-lab">
        <p>
          In this experiment, Alice and Bob started with no shared secret and, with the help of a trusted Key
          Distribution Center, established a fresh session key <KeyLabel id="AB" /> and used it to exchange an encrypted
          message.
        </p>
        <ul>
          <li>
            Each user needs only one long-term key shared with the KDC, instead of a separate key for every other user.
          </li>
          <li>
            The session key was never sent in the clear: it travelled only inside messages encrypted under{" "}
            <KeyLabel id="A" /> and <KeyLabel id="B" />.
          </li>
          <li>
            Successful decryption under a long-term key authenticated the KDC, while the nonce and timestamp guarded
            against replayed messages.
          </li>
          <li>Authenticated encryption (AES-GCM) caused any tampered ticket to be rejected.</li>
        </ul>
        <p>
          A KDC therefore solves the symmetric key distribution problem in a scalable way, and is the basis of
          practical systems such as Kerberos.
        </p>
      </div>
    </SectionPage>
  );
}
