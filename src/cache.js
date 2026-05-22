import fs from 'fs';
import path from 'path';

const CACHE_DIR = './data';
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');

export function initCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));
  }
}

export function getCache(key) {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const cached = data[key];
    
    if (!cached) return null;
    
    const ttlHours = parseInt(process.env.CACHE_TTL_HOURS || '24');
    const age = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
    
    if (age > ttlHours) {
      const updatedData = Object.keys(data)
        .filter(k => k !== key)
        .reduce((obj, k) => ({ ...obj, [k]: data[k] }), {});
      fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedData, null, 2));
      return null;
    }
    
    return cached.value;
  } catch (err) {
    return null;
  }
}

export function setCache(key, value) {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    data[key] = {
      value,
      timestamp: Date.now()
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Cache write error:', err.message);
  }
}

export function clearCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));
    console.log('✓ Cache cleared');
  } catch (err) {
    console.error('Cache clear error:', err.message);
  }
}
