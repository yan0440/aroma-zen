import React, { memo, useCallback, useMemo } from 'react';
import { getCardContent } from '../utils/cardContent';
import { getCategoryTheme } from '../config/categories';
import Sprig from './Sprig';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const DATA_CARD_STYLES = `
  .app-data-card {
    --card-bg: var(--app-surface, #fffdf8);
    --card-soft: var(--app-surface-soft, #f0f3eb);
    --card-text: var(--app-text, #283c32);
    --card-muted: var(--app-muted, #657565);
    --card-border: var(--app-border, #dce2d7);
    --card-accent: var(--app-accent, #405e4c);
    --card-selected: var(--app-selected, #e3ebdf);
    --card-selected-text: var(--app-selected-text, #2f4c3b);

    position: relative;
    isolation: isolate;
    display: flex;
    height: 100%;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--card-border);
    border-radius: 20px;
    background: var(--card-bg);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
    cursor: pointer;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .app-data-card:hover {
    border-color: var(--card-accent);
    box-shadow: 0 18px 42px -28px rgb(20 33 28 / 32%);
    transform: translateY(-2px);
  }

  .app-data-card:focus-visible {
    outline: 2px solid var(--card-accent);
    outline-offset: 4px;
  }

  .app-data-card .card-decoration {
    position: absolute;
    inset: 0 0 auto;
    z-index: 0;
    height: 128px;
    pointer-events: none;
    background: linear-gradient(
      150deg,
      var(--card-selected) 0%,
      transparent 75%
    );
    opacity: 0.55;
  }

  .app-data-card .card-sprig {
    position: absolute;
    top: 40px;
    right: -12px;
    z-index: 0;
    width: 80px;
    height: 112px;
    transform: rotate(12deg);
    color: var(--card-accent);
    opacity: 0.1;
    pointer-events: none;
  }

  .app-data-card .card-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 22px 22px 18px;
  }

  .app-data-card .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 8px;
  }

  .app-data-card .card-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .app-data-card .card-tag {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    border: 1px solid var(--card-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--card-soft);
    color: var(--card-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .app-data-card .card-code {
    border-color: transparent;
    background: var(--card-accent);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .app-data-card .card-category {
    flex-shrink: 0;
    padding-top: 4px;
    color: var(--card-muted);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .app-data-card .card-title {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--card-text);
    font-size: 25px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.06em;
  }

  .app-data-card .card-english {
    margin-top: 8px;
    overflow-wrap: anywhere;
    color: var(--card-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17px;
    font-style: italic;
    line-height: 1.8;
  }

  .app-data-card .card-alias {
    margin-top: 6px;
    overflow-wrap: anywhere;
    color: var(--card-muted);
    font-size: 15px;
    line-height: 1.8;
  }

  .app-data-card .card-meta {
    margin-top: 10px;
    overflow-wrap: anywhere;
    color: var(--card-muted);
    font-size: 13px;
    line-height: 1.9;
  }

  .app-data-card .card-meta.is-clamp {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .app-data-card .card-meta-label {
    margin-right: 8px;
    color: var(--card-accent);
    font-weight: 600;
  }

  .app-data-card .card-footer {
    margin-top: auto;
    padding-top: 22px;
  }

  .app-data-card .card-footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-top: 1px solid var(--card-border);
    padding-top: 14px;
  }

  .app-data-card .card-footer-actions {
    border-top: 1px solid var(--card-border);
    padding-top: 14px;
  }

  .app-data-card .card-action {
    color: var(--card-muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    transition: color 180ms ease;
  }

  .app-data-card:hover .card-action {
    color: var(--card-text);
  }

  .app-data-card .card-arrow {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid var(--card-border);
    border-radius: 999px;
    color: var(--card-accent);
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }

  .app-data-card:hover .card-arrow {
    border-color: var(--card-accent);
    background: var(--card-accent);
    color: #fff;
  }

  .app-data-card .card-arrow svg {
    width: 16px;
    height: 16px;
    transition: transform 180ms ease;
  }

  .app-data-card:hover .card-arrow svg {
    transform: translateX(2px);
  }

  @media (max-width: 640px) {
    .app-data-card .card-content {
      padding: 18px 18px 16px;
    }

    .app-data-card .card-title {
      font-size: 23px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-data-card,
    .app-data-card .card-arrow,
    .app-data-card .card-arrow svg,
    .app-data-card .card-action {
      transition: none;
    }
  }
`;

const THEME_CATEGORY = {
  oil: '精油',
  acupoint: '穴道',
  herb: '中藥',
};

const DataCard = memo(function DataCard({
  item = {},
  onSelectItem,
  actions = null,
}) {
  const hasActions = Boolean(actions);

  const content = useMemo(
    () => getCardContent(item),
    [item]
  );

  const theme = getCategoryTheme(
    THEME_CATEGORY[content.kind] || item.category
  );

  const cardStyle = {
    '--cat-deep': theme?.deep || '#527565',
    '--cat-mid': theme?.mid || '#9AAE9F',
    '--cat-tint': theme?.tint || '#EEF2EA',
  };

  const handleClick = useCallback(() => {
    onSelectItem?.(item);
  }, [item, onSelectItem]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        onSelectItem?.(item);
      }
    },
    [item, onSelectItem]
  );

  return (
    <div
      onClick={handleClick}
      role={hasActions ? undefined : 'button'}
      tabIndex={hasActions ? undefined : 0}
      onKeyDown={hasActions ? undefined : handleKeyDown}
      aria-label={
        hasActions
          ? undefined
          : `查看${content.name}的詳細內容`
      }
      style={cardStyle}
      className="app-data-card"
    >
      <style>{DATA_CARD_STYLES}</style>

      <div
        aria-hidden="true"
        className="card-decoration"
      />

      <Sprig
        aria-hidden="true"
        className="card-sprig"
      />

      <div className="card-content">
        <div className="card-top">
          <div className="card-tags">
            {content.tags.map((tag) =>
              tag.variant === 'code' ? (
                <span
                  key={`code-${tag.text}`}
                  className="card-tag card-code"
                >
                  <span className="sr-only">
                    國際代碼：
                  </span>

                  {tag.text}
                </span>
              ) : (
                <span
                  key={`tag-${tag.text}`}
                  className="card-tag"
                >
                  {tag.text}
                </span>
              )
            )}

            {content.tags.length === 0 && (
              <span className="card-tag">
                本草與芳香
              </span>
            )}
          </div>

          {content.categoryLabel && (
            <span className="card-category">
              {content.categoryLabel}
            </span>
          )}
        </div>

        <div>
          <h3
            className="card-title"
            style={TITLE_FONT}
          >
            {content.name}
          </h3>

          {content.lines.map((line, index) => {
            const key = `${line.type}-${index}`;

            if (line.type === 'english') {
              return (
                <div key={key} className="card-english">
                  {line.text}
                </div>
              );
            }

            if (line.type === 'plain') {
              return (
                <div key={key} className="card-alias">
                  {line.text}
                </div>
              );
            }

            return (
              <div key={key} className="card-meta is-clamp">
                {line.label && (
                  <span className="card-meta-label">
                    {line.label}
                  </span>
                )}

                {line.text}
              </div>
            );
          })}
        </div>

        <div className="card-footer">
          {hasActions ? (
            <div
              className="card-footer-actions"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {actions}
            </div>
          ) : (
            <div className="card-footer-inner">
              <span className="card-action">
                查看詳情
              </span>

              <span
                aria-hidden="true"
                className="card-arrow"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DataCard;