/**
 * components/skill-grid.js
 * ───────────────────────────────────────────────────────────────
 * <skill-grid> — Renders the 3-column cube grid for a single phase.
 * Each cell is a <skill-cube> component.
 *
 * Attributes
 * ──────────
 *   phase-id      string   ID of the phase to render
 *   active-topic  string   ID of the currently selected topic (optional)
 *
 * Dependencies
 * ────────────
 *   courseData from data.js   (passed in via static setter)
 *   <skill-cube>              (must be registered before this component)
 */

import { courseData } from '../data.js';

export class SkillGrid extends HTMLElement {
  static get observedAttributes() {
    return ['phase-id', 'active-topic'];
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  /* ── private ── */

  _render() {
    const phaseId     = this.getAttribute('phase-id');
    const activeTopic = this.getAttribute('active-topic') ?? '';

    const phase = courseData.phases.find(p => p.id === phaseId);
    if (!phase) { this.innerHTML = ''; return; }

    this.innerHTML = this._template(phase, activeTopic);
  }

  _template(phase, activeTopic) {
    const cubes = phase.topics
      .map(t => /* html */ `
        <skill-cube
          topic-id="${t.id}"
          name="${t.name}"
          icon="${t.icon}"
          status="${t.status}"
          ${t.id === activeTopic ? 'active' : ''}
        ></skill-cube>
      `)
      .join('');

    return /* html */ `
      <div class="sg-phase-section">
        <div class="sg-phase-title">${phase.name.toUpperCase()}</div>
        <div class="sg-grid">
          ${cubes}
        </div>
      </div>
    `;
  }
}

customElements.define('skill-grid', SkillGrid);