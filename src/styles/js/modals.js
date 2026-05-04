/**
 * modal.js
 * ───────────────────────────────────────────────────────────────
 * Manages the YouTube video modal overlay.
 *
 * Exports
 * ───────
 *   initModal()           Attach all modal event listeners. Call once on DOMContentLoaded.
 *   openVideoAt()         Open modal at a timestamp string ("1:23:45")
 *   openVideoAtSeconds()  Open modal at a raw seconds offset
 *   closeModal()          Close and clear the modal
 *
 * These three functions are also attached to `window` by app.js so that
 * inline onclick handlers inside web component innerHTML can reach them.
 */

/* ── DOM references (resolved lazily once) ── */
let _modal   = null;
let _iframe  = null;
let _titleEl = null;

function _getEls() {
  if (!_modal) {
    _modal   = document.getElementById('video-modal');
    _iframe  = document.getElementById('modal-iframe');
    _titleEl = document.getElementById('modal-title');
  }
}

/* ── Public API ── */

/**
 * Open the modal at a human-readable timestamp string.
 * @param {string} youtubeId   YouTube video ID
 * @param {string} timeStr     Timestamp string, e.g. "1:23:45" or "45:10"
 * @param {string} title       Label shown below the video
 */
export function openVideoAt(youtubeId, timeStr, title) {
  const parts   = timeStr.split(':').map(Number);
  let   seconds = 0;

  if (parts.length === 3)      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) seconds = parts[0] * 60   + parts[1];

  openVideoAtSeconds(youtubeId, seconds, title);
}

/**
 * Open the modal at a raw seconds offset.
 * @param {string} youtubeId     YouTube video ID
 * @param {number} startSeconds  Start position in seconds
 * @param {string} title         Label shown below the video
 */
export function openVideoAtSeconds(youtubeId, startSeconds, title) {
  _getEls();
  _iframe.src          = `https://www.youtube.com/embed/${youtubeId}?start=${startSeconds}&autoplay=1&rel=0&modestbranding=1`;
  _titleEl.textContent = `// ${title}`;
  _modal.classList.add('open');
}

/**
 * Close the modal and stop the video.
 */
export function closeModal() {
  _getEls();
  _modal.classList.remove('open');
  _iframe.src = '';   // stops playback
}

/**
 * Attach event listeners to the modal.
 * Must be called after the DOM is ready.
 */
export function initModal() {
  _getEls();

  /* click outside inner panel → close */
  _modal.addEventListener('click', e => {
    if (e.target === _modal) closeModal();
  });

  /* Escape key → close */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* close button */
  document.getElementById('modal-close-btn')
    ?.addEventListener('click', closeModal);
}
