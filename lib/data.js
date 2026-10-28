const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

// Mutex queues per filename to serialize writes and prevent concurrent races
const fileWriteQueues = new Map();

function enqueueFileOp(filename, operation) {
  const previousOp = fileWriteQueues.get(filename) || Promise.resolve();
  const currentOp = previousOp.then(operation, operation);
  fileWriteQueues.set(filename, currentOp);
  return currentOp;
}

// Safe synchronous read for Server Components
function readJSON(filename, fallback = {}) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return fallback;
  }
}

// Safe asynchronous read
async function readJSONAsync(filename, fallback = {}) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    try {
      await fsp.access(filePath);
    } catch {
      return fallback;
    }
    const content = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading async ${filename}:`, err);
    return fallback;
  }
}

// Helper to reliably rename on Windows with short retries
async function safeRename(src, dest, retries = 5, delay = 20) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await fsp.rename(src, dest);
      return;
    } catch (err) {
      if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// Atomic file write using temporary file + rename with mutex queue
async function writeJSONAtomic(filename, data) {
  return enqueueFileOp(filename, async () => {
    const filePath = path.join(DATA_DIR, filename);
    const tmpPath = path.join(
      DATA_DIR,
      `${filename}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    );
    const jsonString = JSON.stringify(data, null, 2);

    try {
      await fsp.writeFile(tmpPath, jsonString, 'utf8');
      await safeRename(tmpPath, filePath);
      return true;
    } catch (err) {
      console.error(`Error in atomic write for ${filename}:`, err);
      try {
        await fsp.unlink(tmpPath);
      } catch (_) {}
      throw err;
    }
  });
}

// Read-Modify-Write helper: guarantees safe serialized mutation without races
async function updateJSON(filename, updateFn, fallback = {}) {
  return enqueueFileOp(filename, async () => {
    const currentData = await readJSONAsync(filename, fallback);
    const updatedData = await updateFn(currentData);
    
    const filePath = path.join(DATA_DIR, filename);
    const tmpPath = path.join(
      DATA_DIR,
      `${filename}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    );
    const jsonString = JSON.stringify(updatedData, null, 2);

    try {
      await fsp.writeFile(tmpPath, jsonString, 'utf8');
      await safeRename(tmpPath, filePath);
      return updatedData;
    } catch (err) {
      console.error(`Error in updateJSON for ${filename}:`, err);
      try {
        await fsp.unlink(tmpPath);
      } catch (_) {}
      throw err;
    }
  });
}

// Sync fallback write (atomic rename)
function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tmpPath = path.join(
    DATA_DIR,
    `${filename}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  );
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error in sync write for ${filename}:`, err);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_) {}
    return false;
  }
}

// Getters for individual collections
function getSettings() {
  return readJSON('settings.json', {});
}

function getPlans() {
  return readJSON('plans.json', []);
}

function getFaqs() {
  return readJSON('faqs.json', []);
}

function getGuides() {
  return readJSON('guides.json', []);
}

function getUpdates() {
  return readJSON('updates.json', []);
}

function getInquiries() {
  return readJSON('inquiries.json', []);
}

function getOrders() {
  return readJSON('orders.json', []);
}

function getStats() {
  return readJSON('stats.json', { visitors: 0, downloads: 0, orders: 0, inquiries: 0 });
}

function getDrivers() {
  return readJSON('drivers.json', []);
}

function getRides() {
  return readJSON('rides.json', []);
}

function getAdmin() {
  return readJSON('admin.json', null);
}

/**
 * Robust Bilingual Helper:
 * 1. t(obj, lang)
 *    - Strings: returned as-is
 *    - Objects {hi, en}: picks by lang with 'en' fallback (or 'hi' fallback)
 *    - Missing keys: returns empty string '', never throws
 * 2. t(lang, enText, hiText)
 *    - Backward-compatible helper for explicit strings
 */
function t(first, second, third) {
  if (first === null || first === undefined) {
    return '';
  }

  // Case 1: First argument is an object with bilingual keys: t(obj, lang)
  if (typeof first === 'object') {
    const lang = second === 'en' ? 'en' : 'hi';
    if (lang === 'en') {
      if (first.en !== undefined && first.en !== null && first.en !== '') return first.en;
      if (first.hi !== undefined && first.hi !== null && first.hi !== '') return first.hi;
    } else {
      if (first.hi !== undefined && first.hi !== null && first.hi !== '') return first.hi;
      if (first.en !== undefined && first.en !== null && first.en !== '') return first.en;
    }
    return '';
  }

  // Case 2: Explicit t('en' | 'hi', enText, hiText)
  if (first === 'en' || first === 'hi') {
    const lang = first;
    const enText = second;
    const hiText = third;
    if (lang === 'en') {
      return enText !== undefined && enText !== null && enText !== '' ? enText : (hiText || '');
    } else {
      return hiText !== undefined && hiText !== null && hiText !== '' ? hiText : (enText || '');
    }
  }

  // Case 3: Simple string value passed
  if (typeof first === 'string') {
    // If called as t(enText, hiText) without lang
    if (second !== undefined && typeof second === 'string') {
      // Default to hindi or first if neither matches
      return first;
    }
    return first;
  }

  return String(first);
}

// Business Numbers helper
function num(settings, key, fallback = '') {
  if (settings && settings.numbers && settings.numbers[key] !== undefined && settings.numbers[key] !== null) {
    return settings.numbers[key];
  }
  return fallback;
}

module.exports = {
  DATA_DIR,
  readJSON,
  readJSONAsync,
  writeJSON,
  writeJSONAtomic,
  updateJSON,
  getSettings,
  getPlans,
  getFaqs,
  getGuides,
  getUpdates,
  getInquiries,
  getOrders,
  getStats,
  getDrivers,
  getRides,
  getAdmin,
  t,
  num,
};
