/**
 * Thin wrappers around the browser Web Crypto API.
 * No cryptographic primitive is implemented here — all work is done by crypto.subtle.
 */
import type { CipherBlob } from "@/types/simulation";

export const AES_ALGORITHM = "AES-GCM";
export const KEY_BITS = 256;
export const IV_BYTES = 12;
export const TAG_BITS = 128;

/** Raised when AES-GCM authentication fails (wrong key or modified ciphertext). */
export class DecryptionError extends Error {
  constructor(message = "Authentication tag check failed") {
    super(message);
    this.name = "DecryptionError";
  }
}

/** Raised when decrypted data does not have the expected structure. */
export class MalformedDataError extends Error {
  constructor(message = "Decrypted data has an unexpected format") {
    super(message);
    this.name = "MalformedDataError";
  }
}

export function isWebCryptoAvailable(): boolean {
  return (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function" &&
    typeof globalThis.crypto.subtle !== "undefined" &&
    typeof globalThis.crypto.subtle.encrypt === "function"
  );
}

function subtle(): SubtleCrypto {
  if (!isWebCryptoAvailable()) {
    throw new Error("Web Crypto API is not available in this browser context.");
  }
  return globalThis.crypto.subtle;
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

const HEX_RE = /^(?:[0-9a-f]{2})*$/i;

export function isHex(value: string, byteLength?: number): boolean {
  if (!HEX_RE.test(value)) return false;
  return byteLength === undefined || value.length === byteLength * 2;
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!isHex(hex)) throw new MalformedDataError("Invalid hexadecimal value");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Random 256-bit key as hex — used for default long-term keys. */
export function randomKeyHex(): string {
  return bytesToHex(randomBytes(KEY_BITS / 8));
}

/** Imports a raw 256-bit AES-GCM key. Long-term keys are imported as non-extractable. */
export async function importAesKey(hex: string, extractable = false): Promise<CryptoKey> {
  if (!isHex(hex, KEY_BITS / 8)) throw new MalformedDataError("A key must be exactly 64 hexadecimal characters");
  return subtle().importKey("raw", hexToBytes(hex), { name: AES_ALGORITHM }, extractable, ["encrypt", "decrypt"]);
}

/** Generates a fresh random AES-256-GCM key and returns it with its raw hex form. */
export async function generateAesKey(): Promise<{ key: CryptoKey; hex: string }> {
  const key = await subtle().generateKey({ name: AES_ALGORITHM, length: KEY_BITS }, true, ["encrypt", "decrypt"]);
  const raw = new Uint8Array(await subtle().exportKey("raw", key));
  return { key, hex: bytesToHex(raw) };
}

export async function encryptBytes(key: CryptoKey, plaintext: Uint8Array<ArrayBuffer>): Promise<CipherBlob> {
  const iv = randomBytes(IV_BYTES);
  const ct = await subtle().encrypt({ name: AES_ALGORITHM, iv, tagLength: TAG_BITS }, key, plaintext);
  return { iv: bytesToHex(iv), ciphertext: bytesToHex(new Uint8Array(ct)) };
}

export async function decryptBytes(key: CryptoKey, blob: CipherBlob): Promise<Uint8Array> {
  if (!isHex(blob.iv, IV_BYTES) || !isHex(blob.ciphertext) || blob.ciphertext.length < (TAG_BITS / 8) * 2) {
    throw new MalformedDataError("Ciphertext is malformed");
  }
  try {
    const pt = await subtle().decrypt(
      { name: AES_ALGORITHM, iv: hexToBytes(blob.iv), tagLength: TAG_BITS },
      key,
      hexToBytes(blob.ciphertext),
    );
    return new Uint8Array(pt);
  } catch {
    // Web Crypto throws an OperationError on tag mismatch.
    throw new DecryptionError();
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export function encryptText(key: CryptoKey, text: string): Promise<CipherBlob> {
  return encryptBytes(key, encoder.encode(text));
}

export async function decryptText(key: CryptoKey, blob: CipherBlob): Promise<string> {
  const bytes = await decryptBytes(key, blob);
  try {
    return decoder.decode(bytes);
  } catch {
    throw new MalformedDataError("Decrypted bytes are not valid UTF-8 text");
  }
}

/** Serialises a structured protocol message as JSON and encrypts it. */
export function encryptJson(key: CryptoKey, value: unknown): Promise<CipherBlob> {
  return encryptText(key, JSON.stringify(value));
}

/** Decrypts and parses a structured message, validating its shape with `guard`. */
export async function decryptJson<T>(key: CryptoKey, blob: CipherBlob, guard: (v: unknown) => v is T): Promise<T> {
  const text = await decryptText(key, blob);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new MalformedDataError("Decrypted data is not a valid protocol message");
  }
  if (!guard(parsed)) throw new MalformedDataError("Decrypted message is missing required fields");
  return parsed;
}

/** Returns a copy of the blob with a single bit of the ciphertext flipped. */
export function flipOneBit(blob: CipherBlob): CipherBlob {
  const bytes = hexToBytes(blob.ciphertext);
  const index = Math.floor(bytes.length / 3);
  bytes[index] ^= 0x01;
  return { iv: blob.iv, ciphertext: bytesToHex(bytes) };
}

export function blobByteLength(blob: CipherBlob): number {
  return blob.ciphertext.length / 2;
}
