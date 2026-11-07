const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getAdmin, writeJSON } = require('./data');

const SESSION_SECRET = process.env.SESSION_SECRET || 'ridersaathi_secure_session_secret_2026_super_key_9821';
const ADMIN_EMAIL_ENV = process.env.ADMIN_EMAIL || 'admin@ridersaathi.in';
const ADMIN_PASSWORD_ENV = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_COOKIE_NAME = 'admin_session';

const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 24 * 60 * 60, // 24 hours in seconds
};

function initAdminCredentials() {
  let admin = getAdmin();
  if (!admin || !admin.passwordHash) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD_ENV, 10);
    admin = {
      email: ADMIN_EMAIL_ENV,
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    };
    writeJSON('admin.json', admin);
  }
  return admin;
}

function signSession(email) {
  const payload = {
    email: email.trim().toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getAdminSession(source) {
  let token = null;

  // 1. Check passed source (Request, NextRequest, cookies(), object, or string)
  if (source) {
    if (typeof source === 'string') {
      if (source.includes('.')) {
        token = source.trim();
      } else {
        const m = source.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
        if (m) token = decodeURIComponent(m[1].trim());
      }
    } else if (source.headers && typeof source.headers.get === 'function') {
      // 1A. Check Authorization: Bearer <token>
      const auth = source.headers.get('authorization') || '';
      if (auth.toLowerCase().startsWith('bearer ')) {
        token = auth.slice(7).trim();
      }
      // 1B. Check x-admin-token header
      if (!token) {
        const xToken = source.headers.get('x-admin-token');
        if (xToken) token = xToken.trim();
      }
      // 1C. Check Cookie header
      if (!token) {
        const h = source.headers.get('cookie') || '';
        const m = h.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
        if (m) token = decodeURIComponent(m[1].trim());
      }
    } else if (source.cookies && typeof source.cookies.get === 'function') {
      // NextRequest
      token = source.cookies.get(ADMIN_COOKIE_NAME)?.value;
    } else if (typeof source.get === 'function') {
      // ReadonlyRequestCookies from cookies()
      const got = source.get(ADMIN_COOKIE_NAME);
      token = typeof got === 'object' && got !== null ? got.value : got;
    } else if (source[ADMIN_COOKIE_NAME]) {
      const got = source[ADMIN_COOKIE_NAME];
      token = typeof got === 'object' && got !== null ? got.value : got;
    }
  }

  // 2. If token extracted, verify
  if (token) {
    const verified = verifySession(token);
    if (verified) return verified;
  }

  // 3. Fallback: try Next.js next/headers headers() (Authorization, x-admin-token, or cookie)
  try {
    const { headers: nextHeaders } = require('next/headers');
    const hStore = nextHeaders();
    const auth = hStore?.get?.('authorization') || '';
    if (auth.toLowerCase().startsWith('bearer ')) {
      const verified = verifySession(auth.slice(7).trim());
      if (verified) return verified;
    }
    const xToken = hStore?.get?.('x-admin-token');
    if (xToken) {
      const verified = verifySession(xToken.trim());
      if (verified) return verified;
    }
    const rawCookie = hStore?.get?.('cookie') || '';
    const m = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    if (m) {
      const verified = verifySession(decodeURIComponent(m[1].trim()));
      if (verified) return verified;
    }
  } catch {}

  // 4. Fallback: try Next.js next/headers cookies()
  try {
    const { cookies: nextCookies } = require('next/headers');
    const cStore = nextCookies();
    const cVal = cStore?.get?.(ADMIN_COOKIE_NAME)?.value;
    if (cVal) {
      const verified = verifySession(cVal);
      if (verified) return verified;
    }
  } catch {}

  return null;
}

// In-Memory rate limiting for brute force protection
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_TIME_MS = 15 * 60 * 1000;

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.blockedUntil && now < record.blockedUntil) {
    const minutesLeft = Math.ceil((record.blockedUntil - now) / 60000);
    return { allowed: false, message: `Too many failed login attempts. Locked for ${minutesLeft} minute(s).` };
  }
  if (record.blockedUntil && now >= record.blockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0 };
  record.count += 1;
  record.lastAttempt = now;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.blockedUntil = now + LOGIN_BLOCK_TIME_MS;
  }
  loginAttempts.set(ip, record);
}

function resetLoginRateLimit(ip) {
  loginAttempts.delete(ip);
}

// General in-memory IP rate limiter for public forms
const generalRateLimits = new Map();
function checkGeneralRateLimit(ip, maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const record = generalRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }
  generalRateLimits.set(ip, record);
  return record.count <= maxRequests;
}

// XSS and input sanitization helpers
function sanitizeInput(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLength)
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF]/g, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}

function sanitizePhone(phone) {
  if (typeof phone !== 'string' && typeof phone !== 'number') return '';
  return String(phone).replace(/\D/g, '').slice(-10);
}

function sanitizeUtr(utr) {
  if (typeof utr !== 'string') return '';
  return utr.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30).trim();
}

module.exports = {
  SESSION_SECRET,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
  initAdminCredentials,
  signSession,
  verifySession,
  getAdminSession,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
  checkGeneralRateLimit,
  sanitizeInput,
  sanitizePhone,
  sanitizeUtr,
  bcrypt,
};
