export const AUTH_COOKIE = "tandis_session";

export type AuthUser = {
  username: string;
  name: string;
  role: "reception" | "management";
};

function toBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(token, "base64url").toString("utf8");
  }
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export function encodeSession(user: AuthUser): string {
  return toBase64Url(JSON.stringify(user));
}

export function decodeSession(token?: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as AuthUser;
    if (!parsed?.username || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}
