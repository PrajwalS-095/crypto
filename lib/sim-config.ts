import { isHex, randomKeyHex } from "@/lib/crypto";
import type { ConfigErrors, SimConfig } from "@/types/simulation";

export const NAME_MAX = 20;
export const MESSAGE_MAX = 500;
export const DEFAULT_MESSAGE = "Hello Bob, this is a secure message.";

const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u;

/** Defaults with freshly generated long-term keys (call on the client only). */
export function createDefaultConfig(): SimConfig {
  return {
    aliceName: "Alice",
    bobName: "Bob",
    message: DEFAULT_MESSAGE,
    aliceKeyHex: randomKeyHex(),
    bobKeyHex: randomKeyHex(),
    tamperTicket: false,
  };
}

function validateName(raw: string, label: string): string | undefined {
  const name = raw.trim();
  if (!name) return `${label} name cannot be empty.`;
  if (name.length > NAME_MAX) return `${label} name must be at most ${NAME_MAX} characters.`;
  if (!NAME_RE.test(name)) return `${label} name may contain letters, digits, spaces, '.', '-' and '_' only.`;
  if (name.toUpperCase() === "KDC") return `"KDC" is reserved for the Key Distribution Center.`;
  return undefined;
}

function validateKey(raw: string, label: string): string | undefined {
  const key = raw.trim();
  if (!key) return `${label} cannot be empty.`;
  if (!/^[0-9a-fA-F]*$/.test(key)) return `${label} must contain hexadecimal characters (0–9, a–f) only.`;
  if (!isHex(key, 32)) return `${label} must be exactly 64 hex characters (256 bits); it has ${key.length}.`;
  return undefined;
}

export function validateConfig(config: SimConfig): ConfigErrors {
  const errors: ConfigErrors = {};
  const alice = validateName(config.aliceName, "Initiator");
  const bob = validateName(config.bobName, "Responder");
  if (alice) errors.aliceName = alice;
  if (bob) errors.bobName = bob;
  if (!alice && !bob && config.aliceName.trim().toLowerCase() === config.bobName.trim().toLowerCase()) {
    errors.bobName = "The two parties must have different names.";
  }

  const message = config.message.trim();
  if (!message) errors.message = "Enter a message for Alice to send.";
  else if (config.message.length > MESSAGE_MAX) errors.message = `The message must be at most ${MESSAGE_MAX} characters.`;

  const kA = validateKey(config.aliceKeyHex, "Key K_A");
  const kB = validateKey(config.bobKeyHex, "Key K_B");
  if (kA) errors.aliceKeyHex = kA;
  if (kB) errors.bobKeyHex = kB;
  if (!kA && !kB && config.aliceKeyHex.trim().toLowerCase() === config.bobKeyHex.trim().toLowerCase()) {
    errors.bobKeyHex = "K_A and K_B must be different: each user has their own long-term key.";
  }
  return errors;
}

/** Trimmed, normalised copy used for a run. */
export function normaliseConfig(config: SimConfig): SimConfig {
  return {
    ...config,
    aliceName: config.aliceName.trim().replace(/\s+/g, " "),
    bobName: config.bobName.trim().replace(/\s+/g, " "),
    message: config.message.trim(),
    aliceKeyHex: config.aliceKeyHex.trim().toLowerCase(),
    bobKeyHex: config.bobKeyHex.trim().toLowerCase(),
  };
}
