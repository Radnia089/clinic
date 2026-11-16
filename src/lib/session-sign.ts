import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

let cachedSecret: string | null = null;

function loadSessionSecret() {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 16) return fromEnv;

  const file = path.join(process.cwd(), ".data", "session-secret");
  if (existsSync(file)) {
    const stored = readFileSync(file, "utf8").trim();
    if (stored.length >= 16) return stored;
  }

  const created = randomBytes(32).toString("hex");
  mkdirSync(path.dirname(file), { recursive: true });
  try {
    writeFileSync(file, created, { mode: 0o600, flag: "wx" });
    return created;
  } catch {
    const stored = readFileSync(file, "utf8").trim();
    if (stored.length >= 16) return stored;
    throw new Error("session secret unavailable");
  }
}

export function getSessionSecret() {
  if (!cachedSecret) cachedSecret = loadSessionSecret();
  return cachedSecret;
}

export function signPayload(payload: string) {
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function readSignedPayload(token: string) {
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]+$/.test(body) || !/^[A-Za-z0-9_-]+$/.test(signature)) {
    return null;
  }

  const expected = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return null;
  }

  try {
    return Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
