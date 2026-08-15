import { jwtVerify, SignJWT } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { ForbiddenError } from "../../shared/_core/errors";

function secretKey() {
  return new TextEncoder().encode(ENV.cookieSecret || "bexa-development-secret");
}

export async function createLocalSessionToken(openId: string, name: string) {
  return new SignJWT({ openId, appId: "bexa", name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secretKey());
}

async function verifyLocalSessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const openId = typeof payload.openId === "string" ? payload.openId : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    return openId && name ? { openId, name } : null;
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(req: Request): Promise<User> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies[COOKIE_NAME];
  const session = await verifyLocalSessionToken(token);
  if (!session || !session.openId.startsWith("email_")) {
    throw ForbiddenError("Please log in to Bexa");
  }
  const user = await db.getUserByOpenId(session.openId);
  if (!user || user.loginMethod !== "email") throw ForbiddenError("Email account not found");
  await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
  return user;
}
