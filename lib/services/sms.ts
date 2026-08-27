// Mock SMS verification service. Simulates sending / verifying an OTP with
// realistic latency, expiry and resend cooldown. Swap the bodies for real API
// calls later — the signatures and returned states stay the same.
import { mockDelay, jitter } from "./mockDelay";

export const OTP_LENGTH = 6;
export const OTP_TTL_SEC = 120; // code lifetime
export const RESEND_COOLDOWN_SEC = 45; // wait before a resend is allowed
// Demo code — real backend will actually deliver an SMS. Kept obvious so the
// flow can be tested without a phone.
export const DEMO_CODE = "123456";

type Record = { code: string; expiresAt: number; attempts: number };
const STORE = new Map<string, Record>();

export type SendResult = { ok: true; ttl: number } | { ok: false; message: string };
export type VerifyResult = "verified" | "incorrect" | "expired" | "locked";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendCode(phone: string): Promise<SendResult> {
  await mockDelay(jitter(850));
  const key = normalizePhone(phone);
  if (key.length < 9) return { ok: false, message: "invalid_phone" };
  STORE.set(key, {
    code: DEMO_CODE,
    expiresAt: Date.now() + OTP_TTL_SEC * 1000,
    attempts: 0,
  });
  // eslint-disable-next-line no-console
  console.info(`[mock SMS] verification code for +${key}: ${DEMO_CODE}`);
  return { ok: true, ttl: OTP_TTL_SEC };
}

export async function verifyCode(
  phone: string,
  code: string,
): Promise<VerifyResult> {
  await mockDelay(jitter(750));
  const key = normalizePhone(phone);
  const rec = STORE.get(key);
  if (!rec || Date.now() > rec.expiresAt) return "expired";
  if (rec.attempts >= 5) return "locked";
  if (code.trim() !== rec.code) {
    rec.attempts += 1;
    return "incorrect";
  }
  STORE.delete(key);
  return "verified";
}

export function resendCode(phone: string): Promise<SendResult> {
  return sendCode(phone);
}
