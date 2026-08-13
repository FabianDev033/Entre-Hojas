import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "./http-error.js";

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;

export type AuthTokenPayload = {
  sub: string;
  usuario: string;
  iat: number;
  exp: number;
};

const encode = (value: string | object) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return value;
};

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export const createAuthToken = (user: { id: number; usuario: string | null }) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: String(user.id),
    usuario: user.usuario ?? "",
    iat: issuedAt,
    exp: issuedAt + TOKEN_LIFETIME_SECONDS,
  };
  const content = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
  return { token: `${content}.${sign(content)}`, maxAge: TOKEN_LIFETIME_SECONDS * 1000 };
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const [header, payload, signature, ...extra] = token.split(".");
  if (!header || !payload || !signature || extra.length > 0) throw new HttpError(401, "Sesión inválida.");

  const content = `${header}.${payload}`;
  const expectedSignature = Buffer.from(sign(content));
  const receivedSignature = Buffer.from(signature);
  if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) {
    throw new HttpError(401, "Sesión inválida.");
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthTokenPayload;
    if (!data.sub || !data.usuario || !Number.isInteger(data.exp) || data.exp <= Date.now() / 1000) {
      throw new Error("Invalid token payload");
    }
    return data;
  } catch {
    throw new HttpError(401, "Sesión inválida.");
  }
};

export const authCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api",
  ...(maxAge === undefined ? {} : { maxAge }),
});

export const getCookie = (cookieHeader: string | undefined, name: string) =>
  cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([key]) => key === name)
    ?.slice(1)
    .join("=");
