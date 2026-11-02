import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const TOKEN_VERSION = 1;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const REFERENCE_NONCE_LENGTH = 8;

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encryptPaymentEmail(email: string, secret: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(email, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([
    Buffer.from([TOKEN_VERSION]),
    iv,
    authTag,
    encrypted,
  ]).toString("base64url");
}

export function decryptPaymentEmail(token: string, secret: string) {
  try {
    const payload = Buffer.from(token, "base64url");
    const minimumLength = 1 + IV_LENGTH + AUTH_TAG_LENGTH + 1;

    if (payload.length < minimumLength || payload[0] !== TOKEN_VERSION) {
      return undefined;
    }

    const iv = payload.subarray(1, 1 + IV_LENGTH);
    const authTag = payload.subarray(
      1 + IV_LENGTH,
      1 + IV_LENGTH + AUTH_TAG_LENGTH,
    );
    const encrypted = payload.subarray(1 + IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return undefined;
  }
}

// Mercado Pago limits external_reference to 64 characters. The webhook and
// subsequent Order lookup authenticate its source, so a compact AES-CTR token
// can safely carry the recipient while remaining within that limit.
export function encryptPaymentEmailReference(email: string, secret: string) {
  const nonce = randomBytes(REFERENCE_NONCE_LENGTH);
  const counter = Buffer.concat([nonce, Buffer.alloc(8)]);
  const cipher = createCipheriv("aes-256-ctr", deriveKey(secret), counter);
  const encrypted = Buffer.concat([
    cipher.update(email, "utf8"),
    cipher.final(),
  ]);

  return Buffer.concat([nonce, encrypted]).toString("base64url");
}

export function decryptPaymentEmailReference(
  token: string,
  secret: string,
) {
  try {
    const payload = Buffer.from(token, "base64url");
    if (payload.length <= REFERENCE_NONCE_LENGTH) return undefined;

    const nonce = payload.subarray(0, REFERENCE_NONCE_LENGTH);
    const encrypted = payload.subarray(REFERENCE_NONCE_LENGTH);
    const counter = Buffer.concat([nonce, Buffer.alloc(8)]);
    const decipher = createDecipheriv("aes-256-ctr", deriveKey(secret), counter);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return undefined;
  }
}
