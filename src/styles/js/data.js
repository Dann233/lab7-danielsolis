/**
 * data.js
 * ───────────────────────────────────────────────────────────────
 * Loads course data from course-data.json and exposes utility fns.
 *
 * All course content lives in course-data.json at the project root.
 * This module is the only place that touches that file — everything
 * else imports from here.
 *
 * Usage
 * ─────
 *   import { loadData, findTopicById, findPhaseByTopicId } from './data.js';
 *   const courseData = await loadData();
 */

/** @type {object|null} In-memory cache — only one fetch ever happens. */
let _cache = null;

/**
 * Fetch and cache course-data.json.
 * Returns the cached object on subsequent calls (no extra requests).
 * @returns {Promise<object>} Full courseData object.
 */
export async function loadData() {
  if (_cache) return _cache;
  const res = await fetch('./course-data.json');
  if (!res.ok) throw new Error(`[data.js] Failed to load course-data.json — HTTP ${res.status}`);
  _cache = await res.json();
  return _cache;
}

/**
 * Find a topic by id across all phases.
 * loadData() must have resolved before calling this.
 * @param {string} id
 * @returns {object|null}
 */
export function findTopicById(id) {
  if (!_cache) throw new Error('[data.js] Call loadData() before findTopicById()');
  for (const phase of _cache.phases) {
    const topic = phase.topics.find(t => t.id === id);
    if (topic) return topic;
  }
  return null;
}

/**
 * Find the phase that owns a given topic id.
 * loadData() must have resolved before calling this.
 * @param {string} topicId
 * @returns {object|null}
 */
export function findPhaseByTopicId(topicId) {
  if (!_cache) throw new Error('[data.js] Call loadData() before findPhaseByTopicId()');
  return _cache.phases.find(p => p.topics.some(t => t.id === topicId)) ?? null;
}
