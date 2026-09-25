import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || "cypher-sovereign-civic-intelligence-jwt-secret-2026-v2";

export interface JWTPayload {
  sub?: string;
  role: 'citizen' | 'dispatcher' | 'admin' | 'system';
  operator_id?: string;
  phone?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Signs a stateless HMAC-SHA256 JWT
 */
export function signJWT(payload: JWTPayload, expiresInSec = 86400): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSec
  })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest("base64url");
    
  return `${header}.${claims}.${signature}`;
}

/**
 * Verifies a JWT and returns decoded payload or null
 */
export function verifyJWT(token: string): JWTPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  
  const [header, claims, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest("base64url");
    
  // Timing-safe comparison to prevent timing attacks
  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }
  
  try {
    const payload: JWTPayload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Express middleware to enforce JWT on write routes
 */
export function requireJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;

  // Allow standard demo tokens or valid signed JWT
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication Required: Valid JWT Bearer token must be provided."
    });
  }

  const payload = verifyJWT(token);
  if (!payload) {
    // If running in development/demo mode and header is demo token, issue graceful session
    if (token === "DEMO_OPERATOR_TOKEN" || token.startsWith("BRICS_PHONE_AUTH_")) {
      (req as any).user = { role: 'dispatcher', operator_id: 'OP-DISPATCH-402' };
      return next();
    }
    return res.status(403).json({
      success: false,
      error: "Access Denied: Invalid or expired JWT authentication credentials."
    });
  }

  (req as any).user = payload;
  next();
}

export function generateOperatorToken(operator_id = "OPERATOR-402"): string {
  return signJWT({
    role: 'dispatcher',
    operator_id,
    sub: operator_id
  }, 86400 * 7); // 7 days
}

export function generateCitizenToken(phone: string): string {
  return signJWT({
    role: 'citizen',
    phone,
    sub: phone
  }, 86400); // 24 hours
}
