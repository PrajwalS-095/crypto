/**
 * Simplified KDC protocol engine (Needham–Schroeder style, with a timestamped ticket).
 *
 *   1. A → KDC : A, B, N1
 *   2. KDC     : generate K_AB
 *   3. KDC     : Ticket = E(K_B, [A ‖ K_AB ‖ T])
 *   4. KDC → A : E(K_A, [N1 ‖ B ‖ K_AB ‖ Ticket])
 *   5. A       : decrypt with K_A, check N1 and B, recover K_AB
 *   6. A → B   : Ticket;  B decrypts with K_B, checks T, recovers K_AB
 *   7. A, B    : share K_AB
 *   8. A → B   : E(K_AB, message);  B decrypts
 *
 * Each step is a pure async function of (config, secrets, data) → new secrets/data.
 * Presentation code never touches CryptoKey objects.
 */
import {
  DecryptionError,
  MalformedDataError,
  bytesToHex,
  decryptJson,
  decryptText,
  encryptJson,
  encryptText,
  flipOneBit,
  generateAesKey,
  importAesKey,
  isHex,
  randomBytes,
} from "@/lib/crypto";
import type {
  CipherBlob,
  KdcResponsePlaintext,
  ProtocolData,
  ProtocolSecrets,
  SimConfig,
  StepNumber,
  TicketPlaintext,
} from "@/types/simulation";

export const TOTAL_STEPS = 8;

/** Bob accepts tickets created at most this long ago. */
export const TICKET_LIFETIME_MS = 10 * 60 * 1000;
/** Tolerated clock skew for tickets that appear to come from the future. */
const CLOCK_SKEW_MS = 60 * 1000;

export interface StepResult {
  secrets: ProtocolSecrets;
  data: ProtocolData;
  /** Set when a participant rejects a message; the run cannot continue. */
  rejection?: string;
}

/** Thrown for violations of the step order — indicates a programming error. */
export class ProtocolStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolStateError";
  }
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new ProtocolStateError(`Missing ${what}`);
  return value;
}

export async function createSecrets(config: SimConfig): Promise<ProtocolSecrets> {
  const [kA, kB] = await Promise.all([importAesKey(config.aliceKeyHex), importAesKey(config.bobKeyHex)]);
  return { kA, kB };
}

// ---- type guards for decrypted structures --------------------------------

function isCipherBlob(v: unknown): v is CipherBlob {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.iv === "string" && typeof o.ciphertext === "string";
}

function isTicket(v: unknown): v is TicketPlaintext {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.initiator === "string" &&
    typeof o.sessionKey === "string" &&
    isHex(o.sessionKey, 32) &&
    typeof o.timestamp === "number" &&
    Number.isFinite(o.timestamp)
  );
}

function isKdcResponse(v: unknown): v is KdcResponsePlaintext {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.nonce === "string" &&
    typeof o.responder === "string" &&
    typeof o.sessionKey === "string" &&
    isHex(o.sessionKey, 32) &&
    isCipherBlob(o.ticket)
  );
}

// ---- steps ---------------------------------------------------------------

type StepFn = (config: SimConfig, secrets: ProtocolSecrets, data: ProtocolData) => Promise<StepResult>;

const STEP_FUNCTIONS: Record<StepNumber, StepFn> = {
  /** Alice → KDC: REQUEST(Alice, Bob, N1). Sent in the clear. */
  async 1(config, secrets, data) {
    const request = {
      type: "REQUEST" as const,
      initiator: config.aliceName,
      responder: config.bobName,
      nonce: bytesToHex(randomBytes(8)),
    };
    return { secrets, data: { ...data, request } };
  },

  /** KDC generates a fresh random session key K_AB. */
  async 2(_config, secrets, data) {
    need(data.request, "request");
    const { key, hex } = await generateAesKey();
    return { secrets: { ...secrets, kdcSessionKey: key }, data: { ...data, sessionKeyHex: hex } };
  },

  /** KDC builds the ticket for Bob: E(K_B, [Alice ‖ K_AB ‖ T]). */
  async 3(_config, secrets, data) {
    const request = need(data.request, "request");
    const ticketPlaintext: TicketPlaintext = {
      initiator: request.initiator,
      sessionKey: need(data.sessionKeyHex, "session key"),
      timestamp: Date.now(),
    };
    const ticket = await encryptJson(secrets.kB, ticketPlaintext);
    return { secrets, data: { ...data, ticketPlaintext, ticket } };
  },

  /** KDC → Alice: E(K_A, [N1 ‖ Bob ‖ K_AB ‖ Ticket]). */
  async 4(_config, secrets, data) {
    const request = need(data.request, "request");
    const responsePlaintext: KdcResponsePlaintext = {
      nonce: request.nonce,
      responder: request.responder,
      sessionKey: need(data.sessionKeyHex, "session key"),
      ticket: need(data.ticket, "ticket"),
    };
    const response = await encryptJson(secrets.kA, responsePlaintext);
    return { secrets, data: { ...data, responsePlaintext, response } };
  },

  /** Alice decrypts the KDC response with K_A and checks N1 and Bob's name. */
  async 5(config, secrets, data) {
    const response = need(data.response, "KDC response");
    const request = need(data.request, "request");
    let plain: KdcResponsePlaintext;
    try {
      plain = await decryptJson(secrets.kA, response, isKdcResponse);
    } catch (err) {
      return { secrets, data, rejection: rejectionText(err, `${config.aliceName} could not decrypt the KDC response`) };
    }
    const alice = {
      sessionKeyHex: plain.sessionKey,
      ticket: plain.ticket,
      nonceMatches: plain.nonce === request.nonce,
      responderMatches: plain.responder === request.responder,
    };
    const next = { ...data, alice };
    if (!alice.nonceMatches) {
      return { secrets, data: next, rejection: "The nonce in the reply does not match N₁; the reply may be a replay." };
    }
    if (!alice.responderMatches) {
      return { secrets, data: next, rejection: "The reply names a different responder than the one requested." };
    }
    const aliceSessionKey = await importAesKey(plain.sessionKey);
    return { secrets: { ...secrets, aliceSessionKey }, data: next };
  },

  /** Alice → Bob: Ticket. Bob decrypts it with K_B and checks the timestamp. */
  async 6(config, secrets, data) {
    const original = need(data.alice, "Alice's copy of the ticket").ticket;
    const forwardedTicket = config.tamperTicket ? flipOneBit(original) : original;
    const base = { ...data, forwardedTicket, ticketTampered: config.tamperTicket };

    let ticket: TicketPlaintext;
    try {
      ticket = await decryptJson(secrets.kB, forwardedTicket, isTicket);
    } catch (err) {
      const reason = rejectionText(err, `${config.bobName} could not decrypt the ticket`);
      return { secrets, data: { ...base, bob: { accepted: false, reason } }, rejection: reason };
    }

    const ageMs = Date.now() - ticket.timestamp;
    if (ageMs > TICKET_LIFETIME_MS || ageMs < -CLOCK_SKEW_MS) {
      const reason = `The ticket timestamp is outside the ${TICKET_LIFETIME_MS / 60000}-minute validity window, so ${config.bobName} treats it as a possible replay.`;
      return { secrets, data: { ...base, bob: { accepted: false, reason } }, rejection: reason };
    }

    const bobSessionKey = await importAesKey(ticket.sessionKey);
    return {
      secrets: { ...secrets, bobSessionKey },
      data: {
        ...base,
        bob: {
          accepted: true,
          initiator: ticket.initiator,
          sessionKeyHex: ticket.sessionKey,
          timestamp: ticket.timestamp,
          ageMs,
        },
      },
    };
  },

  /** Both parties now hold K_AB. No message is exchanged in this step. */
  async 7(_config, secrets, data) {
    need(secrets.aliceSessionKey, "Alice's session key");
    need(secrets.bobSessionKey, "Bob's session key");
    return { secrets, data };
  },

  /** Alice → Bob: E(K_AB, message). Bob decrypts with his own copy of K_AB. */
  async 8(config, secrets, data) {
    const aliceKey = need(secrets.aliceSessionKey, "Alice's session key");
    const bobKey = need(secrets.bobSessionKey, "Bob's session key");
    const encrypted = await encryptText(aliceKey, config.message);
    let decrypted: string;
    try {
      decrypted = await decryptText(bobKey, encrypted);
    } catch (err) {
      return { secrets, data, rejection: rejectionText(err, `${config.bobName} could not decrypt the message`) };
    }
    return { secrets, data: { ...data, message: { plaintext: config.message, encrypted, decrypted } } };
  },
};

export function runStep(
  step: StepNumber,
  config: SimConfig,
  secrets: ProtocolSecrets,
  data: ProtocolData,
): Promise<StepResult> {
  return STEP_FUNCTIONS[step](config, secrets, data);
}

function rejectionText(err: unknown, prefix: string): string {
  if (err instanceof DecryptionError) {
    return `${prefix}: AES-GCM authentication failed. The data was modified in transit or encrypted under a different key.`;
  }
  if (err instanceof MalformedDataError) {
    return `${prefix}: ${err.message}.`;
  }
  throw err;
}

/** Converts unexpected errors into a sentence suitable for the UI. */
export function describeError(err: unknown): string {
  if (err instanceof ProtocolStateError) {
    return "The simulation reached an inconsistent state. Please restart the simulation.";
  }
  if (err instanceof MalformedDataError) return err.message + ".";
  if (err instanceof DOMException) {
    return `The browser's cryptography engine reported an error (${err.name}). Please restart the simulation.`;
  }
  if (err instanceof Error && /Web Crypto/.test(err.message)) return err.message;
  return "An unexpected error occurred while running this step. Please restart the simulation.";
}
