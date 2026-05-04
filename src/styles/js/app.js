/**
 * app.js
 * ───────────────────────────────────────────────────────────────
 * Root application controller and ESM entry point.
 *
 * Boot sequence
 * ─────────────
 *   1. Fetch course-data.json via loadData().
 *   2. Register web components (side-effect imports).
 *   3. Expose modal helpers on window (needed by inline onclicks).
 *   4. Wire events and do the initial render.
 */

/* ── Web components (register as side-effects) ── */
import './components/skill-cube.js';
import './components/skill-grid.js';
import './components/topic-view.js';

/* ── Data ── */
import { loadData, findTopicById, findPhaseByTopicId } from './data.js';

/* ── Modal ── */
import { initModal, openVideoAt, openVideoAtSeconds, closeModal } from './modal.js';

/* Expose modal helpers to window — inline onclicks inside component
   innerHTML cannot use module-scoped variables, so they need globals. */
window.openVideoAt        = openVideoAt;
window.openVideoAtSeconds = openVideoAtSeconds;
window.closeModal         = closeModal;

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */

let courseData    = null;   // populated after loadData()
let currentPhase  = null;
let currentTopic  = null;

/* ═══════════════════════════════════════════════════════════════
   RENDER HELPERS
   ═══════════════════════════════════════════════════════════════ */

function renderPhaseTabs() {
  const container = document.getElementById('phase-tabs');
  container.innerHTML = courseData.phases
    .map(p => /* html */ `
      <button
        class="phase-tab ${p.id === currentPhase ? 'active' : ''}"
        data-phase-id="${p.id}"
      >${p.short}</button>
    `)
    .join('');

  container.querySelectorAll('.phase-tab').forEach(btn =>
    btn.addEventListener('click', () => selectPhase(btn.dataset.phaseId))
  );
}

function renderSkillGrid() {
  document.getElementById('skill-grid-container').innerHTML = /* html */ `
    <skill-grid
      phase-id="${currentPhase}"
      ${currentTopic ? `active-topic="${currentTopic}"` : ''}
    ></skill-grid>
  `;
  _updatePhaseName();
  _updateProgress();
}

function renderTopicView(topicId) {
  document.getElementById('main-content').innerHTML =
    `<topic-view topic-id="${topicId}"></topic-view>`;
}

function _updatePhaseName() {
  const phase = courseData.phases.find(p => p.id === currentPhase);
  document.getElementById('current-phase-name').textContent =
    phase ? phase.name.toUpperCase() : '';
}

function _updateProgress() {
  const all  = courseData.phases.flatMap(p => p.topics);
  const done = all.filter(t => t.status === 'done').length;
  const pct  = Math.round((done / all.length) * 100);
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-bar').style.width  = `${pct}%`;
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */

function selectPhase(phaseId) {
  currentPhase = phaseId;
  renderPhaseTabs();
  renderSkillGrid();
}

function selectTopic(topicId) {
  const topic = findTopicById(topicId);
  if (!topic || topic.status === 'locked') return;

  currentTopic = topicId;

  const ownerPhase = findPhaseByTopicId(topicId);
  if (ownerPhase && ownerPhase.id !== currentPhase) {
    currentPhase = ownerPhase.id;
    renderPhaseTabs();
  }

  renderSkillGrid();
  renderTopicView(topicId);
}

/* ═══════════════════════════════════════════════════════════════
   BOOTSTRAP  (async — waits for JSON before first render)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('cube-select', e => selectTopic(e.detail.topicId));

async function init() {
  courseData   = await loadData();          // ← fetch course-data.json
  currentPhase = courseData.phases[0].id;   // start on first phase

  initModal();
  renderPhaseTabs();
  renderSkillGrid();
}

init().catch(err => {
  console.error('[app.js] Boot failed:', err);
  document.getElementById('main-content').innerHTML =
    `<div style="padding:40px;font-family:monospace;color:#ff2a6d">
       ERROR: ${err.message}<br>
       Asegúrate de servir el proyecto desde un servidor HTTP (no file://).
     </div>`;
});
