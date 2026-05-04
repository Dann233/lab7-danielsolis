/**
 * components/topic-view.js
 * ───────────────────────────────────────────────────────────────
 * <topic-view> — Renders the full content panel for a selected topic:
 *   header card, main video, highlights list, and (optional) chapters grid.
 *
 * Attributes
 * ──────────
 *   topic-id   string   ID of the topic to display
 *
 * Public functions consumed by inline onclick handlers
 * ─────────────────────────────────────────────────────
 *   window.openVideoAt(youtubeId, timeString, title)
 *   window.openVideoAtSeconds(youtubeId, startSeconds, title)
 *   These are provided by modal.js and attached to window by app.js.
 */

import { findTopicById } from '../data.js';

export class TopicView extends HTMLElement {
  static get observedAttributes() { return ['topic-id']; }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  /* ── private ── */

  _render() {
    const topicId = this.getAttribute('topic-id');
    if (!topicId) return;

    const topic = findTopicById(topicId);
    if (!topic) return;

    this.innerHTML = this._template(topic);
  }

  /* ── template helpers ── */

  _highlightItem(h, videoId) {
    return /* html */ `
      <div
        class="tv-highlight-item"
        onclick="openVideoAt('${videoId}', '${h.time}', '${h.label}')"
      >
        <span class="tv-hl-time">${h.time}</span>
        <div style="flex:1">
          <div class="tv-hl-title">${h.label}</div>
          ${h.desc ? `<div class="tv-hl-desc">${h.desc}</div>` : ''}
        </div>
        <span class="tv-hl-play">▶</span>
      </div>
    `;
  }

  _chapterHighlightItem(h, videoId) {
    return /* html */ `
      <div
        class="tv-ch-hl-item"
        onclick="openVideoAt('${videoId}', '${h.time}', '${h.label}')"
      >
        <span class="tv-ch-hl-time">${h.time}</span>
        <span>${h.label}</span>
      </div>
    `;
  }

  _chapterCard(ch) {
    const hlItems = (ch.highlights ?? [])
      .map(h => this._chapterHighlightItem(h, ch.youtubeId))
      .join('');

    return /* html */ `
      <div class="tv-chapter-card">
        <iframe
          class="tv-ch-thumb"
          src="https://www.youtube.com/embed/${ch.youtubeId}?start=${ch.startAt}&rel=0&modestbranding=1"
          allowfullscreen
          loading="lazy"
        ></iframe>

        <div
          class="tv-ch-overlay"
          onclick="openVideoAtSeconds('${ch.youtubeId}', ${ch.startAt}, '${ch.title}')"
        >
          <div class="tv-ch-play-btn">▶</div>
        </div>

        <div class="tv-ch-info">
          <div class="tv-ch-title">${ch.title}</div>
          <div class="tv-ch-meta">
            <span class="tv-ch-duration">⏱ ${ch.duration}</span>
            ${ch.highlights
              ? `<span class="tv-ch-highlights-count">${ch.highlights.length} NODES</span>`
              : ''}
          </div>
          ${ch.highlights
            ? `<div class="tv-ch-highlights-list">${hlItems}</div>`
            : ''}
        </div>
      </div>
    `;
  }

  _template(topic) {
    const hasChapters = Array.isArray(topic.chapters) && topic.chapters.length > 0;

    const highlightsHTML = topic.highlights
      .map(h => this._highlightItem(h, topic.mainVideo.youtubeId))
      .join('');

    const chaptersHTML = hasChapters
      ? topic.chapters.map(ch => this._chapterCard(ch)).join('')
      : '';

    return /* html */ `
      <!-- Breadcrumb -->
      <div class="tv-breadcrumb">
        //${topic.phase}
        <span class="bc-sep">›</span>
        <span class="bc-current">${topic.name}</span>
      </div>

      <!-- Header card -->
      <div class="tv-header">
        <div class="tv-icon-big">${topic.icon}</div>
        <div class="tv-meta">
          <div class="tv-phase-badge">${topic.phase.toUpperCase()}</div>
          <div class="tv-topic-name">${topic.name}</div>
          <div class="tv-desc">${topic.desc}</div>
        </div>
      </div>

      <!-- Main video -->
      <div class="tv-section-title">STREAM_COMPLETO</div>
      <div class="tv-main-video">
        <iframe
          class="tv-video-frame"
          src="https://www.youtube.com/embed/${topic.mainVideo.youtubeId}?rel=0&modestbranding=1"
          allowfullscreen
          loading="lazy"
        ></iframe>
        <div class="tv-video-info">
          <div class="tv-video-title">${topic.mainVideo.title}</div>
          <div class="tv-video-duration">⏱ ${topic.mainVideo.duration}</div>
        </div>
      </div>

      <!-- Highlights -->
      <div class="tv-section-title">DATA_NODES</div>
      <div class="tv-highlights-grid">
        ${highlightsHTML}
      </div>

      <!-- Chapters (optional) -->
      ${hasChapters ? /* html */ `
        <div class="tv-section-title">SEGMENTOS</div>
        <div class="tv-chapters-grid">
          ${chaptersHTML}
        </div>
      ` : ''}
    `;
  }
}

customElements.define('topic-view', TopicView);