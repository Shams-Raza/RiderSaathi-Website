const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getAdmin, writeJSON, writeJSONAtomic } = require('./data');

const SESSION_SECRET = process.env.SESSION_SECRET || 'ridersaathi_secure_session_secret_2026_super_key_9821';
const ADMIN_EMAIL_ENV = process.env.ADMIN_EMAIL || 'admin@ridersaathi.in';
const ADMIN_PASSWORD_ENV = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_COOKIE_NAME = 'admin_session';

const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // local development and production local execution
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

function getAdminSession(cookieStore) {
  if (!cookieStore) return null;
  const token = typeof cookieStore.get === 'function'
    ? cookieStore.get(ADMIN_COOKIE_NAME)?.value
    : cookieStore[ADMIN_COOKIE_NAME];
  return verifySession(token);
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
  bcrypt,
};
