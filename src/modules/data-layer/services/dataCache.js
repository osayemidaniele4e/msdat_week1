/**
 * Persistent Data Cache using localStorage
 *
 * Caches large API reference data (indicators, locations, datasources, etc.)
 * in localStorage with a configurable TTL. This dramatically improves load times
 * on slow networks (3G) by avoiding re-downloading 5-15 MB of JSON on every
 * page load / refresh.
 *
 * Data flow:
 *   1. Check localStorage for cached data
 *   2. If valid (not expired), return immediately
 *   3. If expired or missing, fetch from API and cache
 */

const CACHE_PREFIX = 'msdat_cache_';
const CACHE_META_KEY = 'msdat_cache_meta';

// Default TTL: 2 hours (reference data changes infrequently)
const DEFAULT_TTL = 2 * 60 * 60 * 1000;

/**
 * Get cache metadata (timestamps for each cached key)
 */
function getCacheMeta() {
  try {
    const meta = localStorage.getItem(CACHE_META_KEY);
    return meta ? JSON.parse(meta) : {};
  } catch {
    return {};
  }
}

/**
 * Update cache metadata
 */
function setCacheMeta(meta) {
  try {
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
  } catch (e) {
    console.warn('Failed to write cache metadata:', e.message);
  }
}

/**
 * Check if a cached entry is still valid
 */
function isCacheValid(key, ttl = DEFAULT_TTL) {
  const meta = getCacheMeta();
  if (!meta[key]) return false;
  return (Date.now() - meta[key]) < ttl;
}

/**
 * Get data from localStorage cache
 * @param {string} key - Cache key
 * @param {number} ttl - Time-to-live in ms (default: 2 hours)
 * @returns {any|null} Parsed data or null if not cached/expired
 */
function getFromCache(key, ttl = DEFAULT_TTL) {
  try {
    if (!isCacheValid(key, ttl)) return null;

    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Cache read failed for ${key}:`, e.message);
    return null;
  }
}

/**
 * Store data in localStorage cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache (must be JSON-serializable)
 * @returns {boolean} Whether the write was successful
 */
function setInCache(key, data) {
  try {
    const serialized = JSON.stringify(data);

    // Check approximate size — localStorage limit is typically 5-10 MB
    const sizeInMB = (serialized.length * 2) / (1024 * 1024); // rough UTF-16 estimate
    if (sizeInMB > 4) {
      console.warn(`Cache item "${key}" is ${sizeInMB.toFixed(1)} MB — skipping to avoid quota`);
      return false;
    }

    localStorage.setItem(CACHE_PREFIX + key, serialized);

    const meta = getCacheMeta();
    meta[key] = Date.now();
    setCacheMeta(meta);

    return true;
  } catch (e) {
    // Likely QuotaExceededError — clear old caches and log
    console.warn(`Cache write failed for ${key}:`, e.message);
    clearOldestCache(); // eslint-disable-line no-use-before-define
    return false;
  }
}

/**
 * Clear the oldest cached item to free space
 */
function clearOldestCache() {
  try {
    const meta = getCacheMeta();
    const entries = Object.entries(meta);
    if (entries.length === 0) return;

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1] - b[1]);
    const [oldestKey] = entries[0];

    console.log(`Evicting oldest cache entry: ${oldestKey}`);
    // eslint-disable-next-line no-use-before-define
    removeFromCache(oldestKey);
  } catch {
    // Ignore
  }
}

/**
 * Remove a specific key from cache
 */
function removeFromCache(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
    const meta = getCacheMeta();
    delete meta[key];
    setCacheMeta(meta);
  } catch {
    // Ignore
  }
}

/**
 * Clear ALL cached data
 */
function clearAllCache() {
  try {
    const meta = getCacheMeta();
    Object.keys(meta).forEach((key) => {
      localStorage.removeItem(CACHE_PREFIX + key);
    });
    localStorage.removeItem(CACHE_META_KEY);
    console.log('All MSDAT caches cleared');
  } catch {
    // Ignore
  }
}

/**
 * Get cache stats for debugging
 */
function getCacheStats() {
  const meta = getCacheMeta();
  const stats = {};
  Object.entries(meta).forEach(([key, timestamp]) => {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    stats[key] = {
      cachedAt: new Date(timestamp).toLocaleString(),
      ageMinutes: Math.round((Date.now() - timestamp) / 60000),
      sizeKB: raw ? Math.round((raw.length * 2) / 1024) : 0,
      valid: isCacheValid(key),
    };
  });
  return stats;
}

export default {
  getFromCache,
  setInCache,
  removeFromCache,
  clearAllCache,
  isCacheValid,
  getCacheStats,
  DEFAULT_TTL,
};
