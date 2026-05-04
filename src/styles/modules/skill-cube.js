/**
 * components/skill-cube.js
 * ───────────────────────────────────────────────────────────────
 * <skill-cube> — Single node in the skill tree grid.
 *
 * Attributes
 * ──────────
 *   topic-id   string   Unique topic identifier
 *   name       string   Display name (truncated if needed)
 *   icon       string   Emoji icon
 *   status     string   'done' | 'active' | 'locked'
 *   active     boolean  Whether this cube is currently selected
 *
 * Events dispatched
 * ─────────────────
 *   cube-select   CustomEvent (bubbles)
 *                 detail: { topicId: string }
 */

export class SkillCube extends HTMLElement {
  static get observedAttributes() {
    return ['topic-id', 'name', 'icon', 'status', 'active'];
  }

  connectedCallback()            { this._render(); }
  attributeChangedCallback()     { this._render(); }

  /* ── private ── */

  _render() {
    const id       = this.getAttribute('topic-id') ?? '';
    const name     = this.getAttribute('name')     ?? '';
    const icon     = this.getAttribute('icon')     ?? '◈';
    const status   = this.getAttribute('status')   ?? 'locked';
    const isActive = this.hasAttribute('active');
    const isDone   = status === 'done';
    const isLocked = status === 'locked';

    this.innerHTML = this._template({ id, name, icon, status, isActive, isDone, isLocked });

    if (!isLocked) {
      this.querySelector('.cube-btn').addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('cube-select', {
            bubbles: true,
            composed: true,          // crosses shadow-DOM boundaries if needed later
            detail: { topicId: id },
          })
        );
      });
    }
  }

  _template({ id, name, icon, status, isActive, isDone, isLocked }) {
    const classes = ['cube-btn', status, isActive ? 'active' : '']
      .filter(Boolean)
      .join(' ');

    return /* html */ `
      <div class="cube-wrapper">
        <button
          class="${classes}"
          data-topic-id="${id}"
          title="${name}"
          ${isLocked ? 'disabled' : ''}
          aria-label="Nodo: ${name}"
          aria-pressed="${isActive}"
        >
          <div class="cube-scan"></div>
          ${isDone ? '<span class="cube-status-tick">✓</span>' : ''}
          <span class="cube-icon">${icon}</span>
          <span class="cube-label">${name}</span>
        </button>
      </div>
    `;
  }
}

customElements.define('skill-cube', SkillCube);
