"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { KeyLabel } from "@/components/ui/key-label";
import { HexValue } from "@/components/simulation/hex-value";
import { Block, CheckList, Explanation, FieldBox, Notation, OpArrow, TechDetails } from "@/components/simulation/blocks";
import { TICKET_LIFETIME_MS } from "@/lib/kdc-protocol";
import { blobByteLength } from "@/lib/crypto";
import type { CipherBlob, ProtocolData, SimConfig, StepNumber } from "@/types/simulation";

interface StepContentProps {
  step: StepNumber;
  config: SimConfig;
  data: ProtocolData;
  /** Reason, if this step was rejected by a participant. */
  rejection: string | null;
}

export function StepContent(props: StepContentProps) {
  switch (props.step) {
    case 1:
      return <Step1 {...props} />;
    case 2:
      return <Step2 {...props} />;
    case 3:
      return <Step3 {...props} />;
    case 4:
      return <Step4 {...props} />;
    case 5:
      return <Step5 {...props} />;
    case 6:
      return <Step6 {...props} />;
    case 7:
      return <Step7 {...props} />;
    case 8:
      return <Step8 {...props} />;
  }
}

// ---------------------------------------------------------------------------

const AES = "AES-256-GCM";

function Who({ name, party }: { name: string; party: "alice" | "bob" }) {
  return <span className={`font-semibold ${party === "alice" ? "text-alice" : "text-bob"}`}>{name}</span>;
}

function cipherDetails(blob: CipherBlob, extra: { label: string; value: React.ReactNode }[] = []) {
  const total = blobByteLength(blob);
  return [
    { label: "Algorithm", value: `${AES} (authenticated encryption)` },
    { label: "IV (96-bit, random)", value: blob.iv.toUpperCase() },
    { label: "Output size", value: `${total} bytes = ${total - 16} bytes ciphertext + 16 bytes authentication tag` },
    ...extra,
  ];
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** JSON as it was encrypted, with the session key shortened for readability. */
function serialised(value: unknown): string {
  return JSON.stringify(value, (k, v) =>
    k === "sessionKey" && typeof v === "string" ? `${v.slice(0, 8)}…(K_AB)` : k === "ciphertext" && typeof v === "string" ? `${v.slice(0, 16)}…` : v,
  );
}

function Missing() {
  return <p className="text-sm text-muted">This step has not produced any data yet.</p>;
}

function Rejected({ title, reason }: { title: string; reason: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded border border-bad/40 bg-bad-soft px-3 py-2.5">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-bad" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-semibold text-bad">{title}</p>
        <p className="mt-0.5 text-ink-soft">{reason}</p>
      </div>
    </div>
  );
}

// ---- Step 1 ---------------------------------------------------------------

function Step1({ config, data }: StepContentProps) {
  const req = data.request;
  if (!req) return <Missing />;
  const A = config.aliceName;
  const B = config.bobName;
  return (
    <>
      <Block title="Message" tag="notation">
        <Notation>
          {A} → KDC : REQUEST({A}, {B}, N₁)
        </Notation>
      </Block>
      <Block title="Message contents" tag="browser">
        <FieldBox
          caption="Sent in the clear (not encrypted)"
          fields={[
            { name: "Type", value: req.type },
            { name: "Initiator", value: req.initiator },
            { name: "Responder", value: req.responder },
            { name: "Nonce N₁", value: req.nonce.toUpperCase() },
          ]}
        />
        <p className="text-xs text-muted">
          N₁ is 64 random bits from <code className="font-mono">crypto.getRandomValues()</code>.
        </p>
      </Block>
      <Explanation>
        <p>
          <Who name={A} party="alice" /> wants to talk to <Who name={B} party="bob" />, but the two share no key. Each of
          them shares a key only with the KDC, so <Who name={A} party="alice" /> asks the KDC to set up a session.
        </p>
        <p>
          The request contains nothing secret: an eavesdropper only learns who wants to talk to whom. The{" "}
          <strong>nonce N₁</strong> is a random number used once; when the KDC&apos;s reply comes back containing N₁,{" "}
          {A} will know the reply was made for this request and is not a replay of an old one.
        </p>
      </Explanation>
    </>
  );
}

// ---- Step 2 ---------------------------------------------------------------

function Step2({ config, data }: StepContentProps) {
  if (!data.sessionKeyHex) return <Missing />;
  return (
    <>
      <Block title="Action" tag="notation">
        <Notation>
          KDC : <KeyLabel id="AB" /> ← random 256-bit key
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <OpArrow api='crypto.subtle.generateKey({ name: "AES-GCM", length: 256 })'>
          Generate a fresh random session key
        </OpArrow>
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">
            Session key <KeyLabel id="AB" /> (temporary, for this session only)
          </p>
          <HexValue hex={data.sessionKeyHex} label="Session key K_AB" secret tone="kdc" previewBytes={32} />
        </div>
      </Block>
      <Explanation>
        <p>
          The KDC creates a brand-new key, <KeyLabel id="AB" />, for this conversation between {config.aliceName} and{" "}
          {config.bobName}. It is generated by the browser&apos;s cryptographically secure random number generator, so it
          cannot be predicted from previous keys.
        </p>
        <p>
          Unlike the long-term keys <KeyLabel id="A" /> and <KeyLabel id="B" />, <KeyLabel id="AB" /> is ephemeral: it
          is used for one session and then discarded. Restarting the simulation always produces a different session key.
          At this moment only the KDC knows it.
        </p>
      </Explanation>
      <TechDetails
        items={[
          { label: "Algorithm", value: `${AES}, 256-bit key` },
          { label: "Source of randomness", value: "Browser CSPRNG via Web Crypto" },
          { label: "Lifetime", value: "This simulation run only" },
        ]}
      />
    </>
  );
}

// ---- Step 3 ---------------------------------------------------------------

function Step3({ config, data }: StepContentProps) {
  const t = data.ticketPlaintext;
  if (!t || !data.ticket) return <Missing />;
  return (
    <>
      <Block title="Action" tag="notation">
        <Notation>
          Ticket = E(<KeyLabel id="B" />, [ {t.initiator} ‖ <KeyLabel id="AB" /> ‖ T ])
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <FieldBox
          caption="Ticket plaintext"
          fields={[
            { name: "Initiator", value: t.initiator },
            { name: <>Session key <KeyLabel id="AB" /></>, value: <HexValue hex={t.sessionKey} label="Session key K_AB" secret tone="kdc" previewBytes={32} /> },
            { name: "Timestamp T", value: formatTime(t.timestamp) },
          ]}
        />
        <OpArrow api="crypto.subtle.encrypt({ name: &quot;AES-GCM&quot;, iv }, K_B, plaintext)">
          Encrypt using {config.bobName}&apos;s long-term key <KeyLabel id="B" />
        </OpArrow>
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Encrypted ticket</p>
          <HexValue hex={data.ticket.ciphertext} label="Encrypted ticket" tone="bob" />
        </div>
      </Block>
      <Explanation>
        <p>
          The KDC packages the session key for {config.bobName} into a <strong>ticket</strong> and locks it with{" "}
          <KeyLabel id="B" />, the key only {config.bobName} and the KDC know. {config.aliceName} will carry the ticket
          to {config.bobName} but cannot read or alter it.
        </p>
        <p>
          The ticket says <em>who</em> the key is shared with ({t.initiator}) and <em>when</em> it was issued (T). When{" "}
          {config.bobName} opens it, the timestamp lets {config.bobName} reject an old ticket that an attacker might try to replay.
        </p>
      </Explanation>
      <TechDetails
        items={cipherDetails(data.ticket, [{ label: "Serialised plaintext", value: serialised(t) }])}
      />
    </>
  );
}

// ---- Step 4 ---------------------------------------------------------------

function Step4({ config, data }: StepContentProps) {
  const r = data.responsePlaintext;
  if (!r || !data.response) return <Missing />;
  const A = config.aliceName;
  return (
    <>
      <Block title="Message" tag="notation">
        <Notation>
          KDC → {A} : E(<KeyLabel id="A" />, [ N₁ ‖ {r.responder} ‖ <KeyLabel id="AB" /> ‖ Ticket ])
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <FieldBox
          caption="Response plaintext"
          fields={[
            { name: "Nonce N₁", value: r.nonce.toUpperCase() },
            { name: "Responder", value: r.responder },
            { name: <>Session key <KeyLabel id="AB" /></>, value: <HexValue hex={r.sessionKey} label="Session key K_AB" secret tone="kdc" previewBytes={32} /> },
            {
              name: "Ticket",
              value: (
                <span className="text-ink-soft">
                  encrypted under <KeyLabel id="B" /> ({blobByteLength(r.ticket)} bytes, opaque to {A})
                </span>
              ),
            },
          ]}
        />
        <OpArrow api="crypto.subtle.encrypt({ name: &quot;AES-GCM&quot;, iv }, K_A, plaintext)">
          Encrypt using {A}&apos;s long-term key <KeyLabel id="A" />
        </OpArrow>
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Encrypted response sent to {A}</p>
          <HexValue hex={data.response.ciphertext} label="Encrypted KDC response" tone="alice" />
        </div>
      </Block>
      <Explanation>
        <p>
          The KDC replies to {A} with everything needed, encrypted under <KeyLabel id="A" />: the nonce N₁, the name of
          the party the key is for, the session key itself and the ticket for {config.bobName}.
        </p>
        <p>
          Notice that the ticket is now encrypted <strong>twice</strong>: its contents under <KeyLabel id="B" />, and the
          whole response under <KeyLabel id="A" />. Anyone watching the network sees only ciphertext; the session key
          never travels in the clear.
        </p>
      </Explanation>
      <TechDetails items={cipherDetails(data.response, [{ label: "Serialised plaintext", value: serialised(r) }])} />
    </>
  );
}

// ---- Step 5 ---------------------------------------------------------------

function Step5({ config, data, rejection }: StepContentProps) {
  const A = config.aliceName;
  const B = config.bobName;
  if (!data.response) return <Missing />;
  const alice = data.alice;
  return (
    <>
      <Block title="Action" tag="notation">
        <Notation>
          {A} : D(<KeyLabel id="A" />, response) → N₁, {B}, <KeyLabel id="AB" />, Ticket
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Encrypted response received</p>
          <HexValue hex={data.response.ciphertext} label="Encrypted KDC response" tone="alice" previewBytes={12} />
        </div>
        <OpArrow api="crypto.subtle.decrypt({ name: &quot;AES-GCM&quot;, iv }, K_A, ciphertext)">
          Decrypt using {A}&apos;s long-term key <KeyLabel id="A" />
        </OpArrow>
        {alice ? (
          <>
            <FieldBox
              caption={`Recovered by ${A}`}
              fields={[
                { name: <>Session key <KeyLabel id="AB" /></>, value: <HexValue hex={alice.sessionKeyHex} label={`${A}'s copy of K_AB`} secret tone="alice" previewBytes={32} /> },
                { name: "Ticket for " + B, value: <span className="text-ink-soft">kept unopened; {A} does not know <KeyLabel id="B" /></span> },
              ]}
            />
            <CheckList
              items={[
                { ok: true, text: <>Authentication tag verified: the reply was produced by someone holding <KeyLabel id="A" />, i.e. the KDC.</> },
                { ok: alice.nonceMatches, text: <>Nonce N₁ matches the one {A} sent: the reply is fresh, not replayed.</> },
                { ok: alice.responderMatches, text: <>Responder is {B}: the key is for the party {A} asked for.</> },
              ]}
            />
          </>
        ) : null}
        {rejection && <Rejected title={`${A} rejects the response`} reason={rejection} />}
      </Block>
      <Explanation>
        <p>
          Only {A} and the KDC know <KeyLabel id="A" />, so when the reply decrypts and its authentication tag checks out,{" "}
          {A} knows it genuinely came from the KDC. This is <strong>authentication through a shared secret</strong>.
        </p>
        <p>
          {A} now holds the session key <KeyLabel id="AB" />. {A} cannot read the ticket, and does not need to: the
          job is just to deliver it to {B}.
        </p>
      </Explanation>
    </>
  );
}

// ---- Step 6 ---------------------------------------------------------------

function Step6({ config, data, rejection }: StepContentProps) {
  const A = config.aliceName;
  const B = config.bobName;
  const ticket = data.forwardedTicket;
  if (!ticket) return <Missing />;
  const bob = data.bob;
  return (
    <>
      <Block title="Message" tag="notation">
        <Notation>
          {A} → {B} : Ticket = E(<KeyLabel id="B" />, [ {A} ‖ <KeyLabel id="AB" /> ‖ T ])
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Ticket received by {B}</p>
          <HexValue hex={ticket.ciphertext} label="Ticket received by Bob" tone="bob" previewBytes={12} />
          {data.ticketTampered && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-warn">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Tamper option enabled: one bit of this ticket was flipped in transit.
            </p>
          )}
        </div>
        <OpArrow api="crypto.subtle.decrypt({ name: &quot;AES-GCM&quot;, iv }, K_B, ciphertext)">
          Decrypt using {B}&apos;s long-term key <KeyLabel id="B" />
        </OpArrow>
        {bob?.accepted ? (
          <>
            <FieldBox
              caption={`Recovered by ${B}`}
              fields={[
                { name: "Initiator", value: bob.initiator },
                { name: <>Session key <KeyLabel id="AB" /></>, value: <HexValue hex={bob.sessionKeyHex} label={`${B}'s copy of K_AB`} secret tone="bob" previewBytes={32} /> },
                { name: "Timestamp T", value: `${formatTime(bob.timestamp)} (${Math.max(0, Math.round(bob.ageMs / 1000))} s ago)` },
              ]}
            />
            <CheckList
              items={[
                { ok: true, text: <>Authentication tag verified: the ticket was created with <KeyLabel id="B" />, so it came from the KDC and was not modified.</> },
                { ok: true, text: <>Timestamp is within the {TICKET_LIFETIME_MS / 60000}-minute validity window: not an old, replayed ticket.</> },
                { ok: true, text: <>The ticket names {bob.initiator} as the other party.</> },
              ]}
            />
          </>
        ) : (
          rejection && <Rejected title={`${B} rejects the ticket`} reason={rejection} />
        )}
      </Block>
      <Explanation>
        {bob?.accepted || !rejection ? (
          <>
            <p>
              {A} forwards the ticket exactly as it was received. {B} opens it with <KeyLabel id="B" /> and obtains the
              same session key <KeyLabel id="AB" /> that the KDC gave {A}, along with the name of the party on the other
              end.
            </p>
            <p>
              {B} never contacted the KDC, yet can still trust the ticket: only the KDC could have produced something that
              decrypts correctly under <KeyLabel id="B" />.
            </p>
          </>
        ) : (
          <p>
            AES-GCM detected that the ticket is not exactly what the KDC produced, so {B} refuses to use it and the
            session is not established. Without the authentication tag, the change would have silently produced a wrong
            key. Restart the simulation with the tamper option off to complete the exchange.
          </p>
        )}
      </Explanation>
      <TechDetails items={cipherDetails(ticket)} />
    </>
  );
}

// ---- Step 7 ---------------------------------------------------------------

function Step7({ config, data }: StepContentProps) {
  const A = config.aliceName;
  const B = config.bobName;
  const alice = data.alice;
  const bob = data.bob;
  if (!alice || !bob?.accepted) return <Missing />;
  const same = alice.sessionKeyHex === bob.sessionKeyHex;
  return (
    <>
      <div className="flex items-center gap-3 rounded border border-ok/40 bg-ok-soft px-4 py-3">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-ok" aria-hidden="true" />
        <div>
          <p className="font-semibold text-ok">Secure session established</p>
          <p className="text-sm text-ink-soft">
            <Who name={A} party="alice" /> ↔ <Who name={B} party="bob" /> now share session key <KeyLabel id="AB" />
          </p>
        </div>
      </div>
      <Block title="State" tag="browser">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-alice">{A}&apos;s copy of K_AB (from step 5)</p>
            <HexValue hex={alice.sessionKeyHex} label={`${A}'s copy of K_AB`} secret tone="alice" previewBytes={32} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-bob">{B}&apos;s copy of K_AB (from step 6)</p>
            <HexValue hex={bob.sessionKeyHex} label={`${B}'s copy of K_AB`} secret tone="bob" previewBytes={32} />
          </div>
        </div>
        <CheckList
          items={[
            { ok: same, text: same ? "Both copies are identical." : "The two copies differ." },
            { ok: true, text: <>The session key never crossed the network unencrypted.</> },
            { ok: true, text: <>Neither <KeyLabel id="A" /> nor <KeyLabel id="B" /> ever left its owner and the KDC.</> },
          ]}
        />
      </Block>
      <Explanation>
        <p>
          Two parties who started with no shared secret now share a fresh key, obtained with the KDC&apos;s help. From
          here on they do not need the KDC: all their traffic is protected with <KeyLabel id="AB" />.
        </p>
        <p className="text-xs text-muted">
          In a full protocol, {B} would also send {A} a challenge encrypted under <KeyLabel id="AB" /> to confirm that {A}
          really holds the key. That handshake is omitted here to keep the exchange simple.
        </p>
      </Explanation>
    </>
  );
}

// ---- Step 8 ---------------------------------------------------------------

function Step8({ config, data, rejection }: StepContentProps) {
  const A = config.aliceName;
  const B = config.bobName;
  const m = data.message;
  if (!m) return rejection ? <Rejected title={`${B} could not read the message`} reason={rejection} /> : <Missing />;
  const match = m.decrypted === m.plaintext;
  return (
    <>
      <Block title="Message" tag="notation">
        <Notation>
          {A} → {B} : E(<KeyLabel id="AB" />, message)
        </Notation>
      </Block>
      <Block title="Cryptographic operation" tag="browser">
        <FieldBox caption={`Plaintext written by ${A}`} fields={[{ name: "Message", value: `“${m.plaintext}”` }]} />
        <OpArrow api="crypto.subtle.encrypt({ name: &quot;AES-GCM&quot;, iv }, K_AB, message)">
          {A} encrypts using {A}&apos;s copy of <KeyLabel id="AB" />
        </OpArrow>
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Ciphertext on the network</p>
          <HexValue hex={m.encrypted.ciphertext} label="Encrypted message" tone="kdc" />
        </div>
        <OpArrow api="crypto.subtle.decrypt({ name: &quot;AES-GCM&quot;, iv }, K_AB, ciphertext)">
          {B} decrypts using {B}&apos;s copy of <KeyLabel id="AB" />
        </OpArrow>
        <FieldBox caption={`Plaintext recovered by ${B}`} fields={[{ name: "Message", value: `“${m.decrypted}”` }]} />
        <CheckList
          items={[
            { ok: true, text: "Authentication tag verified: the message was not modified." },
            { ok: match, text: match ? `${B}'s plaintext is identical to what ${A} sent.` : "The decrypted text differs." },
          ]}
        />
      </Block>
      <Explanation>
        <p>
          This is the payoff of the exchange. {A} and {B} communicate directly, and an eavesdropper sees only the
          ciphertext above. The KDC took part only in setting up the key and is not involved in the conversation itself.
        </p>
      </Explanation>
      <TechDetails items={cipherDetails(m.encrypted, [{ label: "Plaintext size", value: `${new TextEncoder().encode(m.plaintext).length} bytes (UTF-8)` }])} />
    </>
  );
}
