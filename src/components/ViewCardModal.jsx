import React, {
  memo,
  useMemo,
} from 'react';
import { getCardContent } from '../utils/cardContent';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const VIEW_CARD_STYLES = `
  .view-card {
    --vc-bg-from: #f1ece0;
    --vc-bg-to: #fffdf8;
    --vc-border: var(--app-border, #dce2d7);
    --vc-text: var(--app-text, #283c32);
    --vc-muted: var(--app-muted, #657565);
    --vc-chip-bg: var(--app-surface-soft, #f0f3eb);
    --vc-chip-border: var(--app-border, #dce2d7);
    --vc-chip-text: var(--app-muted, #657565);
    --vc-code-bg: var(--app-accent, #405e4c);
    --vc-code-text: #fff;
    --vc-line: var(--app-border, #dce2d7);
    --vc-leaf: rgb(64 94 76 / 28%);
    --vc-accent: var(--app-accent, #405e4c);

    position: relative;
    width: 100%;
    max-width: 512px;
    max-height: 85vh;
    max-height: 85dvh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--vc-border);
    border-radius: 24px;
    background: linear-gradient(
      135deg,
      var(--vc-bg-from) 0%,
      var(--vc-bg-to) 70%
    );
    box-shadow: 0 18px 44px -26px rgb(20 33 28 / 45%);
    color: var(--vc-text);
  }

  :root[data-app-theme='dark'] .view-card {
    --vc-bg-from: #5d7565;
    --vc-bg-to: #223229;
    --vc-border: rgb(190 220 200 / 35%);
    --vc-text: #f4f7f1;
    --vc-muted: #b4c4b8;
    --vc-chip-bg: #1f2e26;
    --vc-chip-border: #4a5f52;
    --vc-chip-text: #d6e2d8;
    --vc-code-bg: #b7d1b6;
    --vc-code-text: #1f3326;
    --vc-line: rgb(190 220 200 / 22%);
    --vc-leaf: rgb(200 225 205 / 26%);
    --vc-accent: #b7d1b6;
  }

  .view-card,
  .view-card *,
  .view-card *::before,
  .view-card *::after {
    box-sizing: border-box;
  }

  .view-card .vc-leaf {
    position: absolute;
    right: 18px;
    bottom: 18px;
    width: 64px;
    height: 120px;
    color: var(--vc-leaf);
    pointer-events: none;
  }

  .view-card .vc-body {
    position: relative;
    padding: 24px 28px 32px;
  }

  .view-card .vc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .view-card .vc-chips {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .view-card .vc-chip {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    border: 1px solid var(--vc-chip-border);
    border-radius: 8px;
    padding: 4px 10px;
    background: var(--vc-chip-bg);
    color: var(--vc-chip-text);
    font-size: 12px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .view-card .vc-chip.is-code {
    border-color: transparent;
    background: var(--vc-code-bg);
    color: var(--vc-code-text);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .view-card .vc-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 10px;
  }

  .view-card .vc-category {
    color: var(--vc-muted);
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .view-card .vc-close {
    display: inline-flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--vc-line);
    border-radius: 10px;
    background: transparent;
    color: var(--vc-muted);
    font-size: 13px;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      color 160ms ease;
  }

  .view-card .vc-close:hover {
    background: var(--vc-chip-bg);
    color: var(--vc-text);
  }

  .view-card .vc-close:focus-visible {
    outline: 2px solid var(--vc-accent);
    outline-offset: 3px;
  }

  .view-card .vc-name {
    margin: 0;
    color: var(--vc-text);
    font-size: 40px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .view-card .vc-english {
    margin: 6px 0 0;
    color: var(--vc-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .view-card .vc-plain {
    margin: 6px 0 0;
    color: var(--vc-muted);
    font-size: 16px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .view-card .vc-note {
    margin: 14px 0 0;
    color: var(--vc-muted);
    font-size: 14px;
    line-height: 1.9;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .view-card .vc-note-label {
    margin-right: 8px;
    color: var(--vc-accent);
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .view-card .vc-body {
      padding: 20px 20px 28px;
    }

    .view-card .vc-name {
      font-size: 34px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .view-card .vc-close {
      transition: none;
    }
  }
`;

function LeafDecoration() {
  return (
    <svg
      className="vc-leaf"
      viewBox="0 0 64 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M34 118 C34 80 38 40 50 6" />
      <path d="M36 98 C22 94 14 84 12 72 C26 74 34 84 36 98Z" />
      <path d="M37 78 C50 74 58 64 60 52 C46 54 38 64 37 78Z" />
      <path d="M40 58 C28 54 20 44 18 32 C32 34 40 44 40 58Z" />
      <path d="M44 38 C56 34 62 24 62 14 C50 16 44 26 44 38Z" />
    </svg>
  );
}

function ViewCardModal({
  item,
  onClose,
}) {
  const content = useMemo(
    () => (item ? getCardContent(item) : null),
    [item]
  );

  if (!item || !content) {
    return null;
  }

  return (
    <div
      className="view-card"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <style>{VIEW_CARD_STYLES}</style>

      <LeafDecoration />

      <div className="vc-body">
        <div className="vc-top">
          <div className="vc-chips">
            {content.tags.map((tag) => (
              <span
                key={`${tag.variant}-${tag.text}`}
                className={`vc-chip ${
                  tag.variant === 'code' ? 'is-code' : ''
                }`}
              >
                {tag.text}
              </span>
            ))}
          </div>

          <div className="vc-actions">
            {content.categoryLabel && (
              <span className="vc-category">
                {content.categoryLabel}
              </span>
            )}

            <button
              type="button"
              className="vc-close"
              onClick={onClose}
              aria-label="關閉圖卡"
            >
              ✕
            </button>
          </div>
        </div>

        <h3
          className="vc-name"
          style={TITLE_FONT}
        >
          {content.name}
        </h3>

        {content.lines.map((line, index) => {
          const key = `${line.type}-${index}`;

          if (line.type === 'english') {
            return (
              <p key={key} className="vc-english">
                {line.text}
              </p>
            );
          }

          if (line.type === 'plain') {
            return (
              <p key={key} className="vc-plain">
                {line.text}
              </p>
            );
          }

          return (
            <p key={key} className="vc-note">
              {line.label && (
                <span className="vc-note-label">
                  {line.label}
                </span>
              )}

              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ViewCardModal);