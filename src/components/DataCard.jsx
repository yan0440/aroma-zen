import React, { memo, useCallback, useMemo } from 'react';
import { getLocationLabel } from '../utils/locationLabel';
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

  .app-data-card .card-meta {
    margin-top: 10px;
    overflow-wrap: anywhere;
    color: var(--card-muted);
    font-size: 13px;
    line-height: 1.9;
  }

  .app-data-card .card-meta-label {
    margin-right: 8px;
    color: var(--card-accent);
    font-weight: 600;
  }

  .app-data-card .card-location {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    color: var(--card-muted);
    font-size: 13px;
    line-height: 1.8;
  }

  .app-data-card .card-location::before {
    content: "";
    display: block;
    width: 12px;
    height: 1px;
    flex-shrink: 0;
    background: var(--card-border);
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

const getCategoryType = (category) => {
  const value = String(category || '').trim();

  return {
    isOil: value === '精油',
    isAcupuncture:
      value === '穴道' ||
      value === '穴位' ||
      value === '腧穴',
    isChineseMedicine:
      value === '中藥' ||
      value === '中医' ||
      value === '藥材' ||
      value === '药材',
  };
};

const firstValue = (item, keys) => {
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((current, part) => current?.[part], item);

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
};

const DataCard = memo(function DataCard({
  item = {},
  onSelectItem,
}) {
  const {
    isOil,
    isAcupuncture,
    isChineseMedicine,
  } = useMemo(
    () => getCategoryType(item.category),
    [item.category]
  );

  const resolvedCategory = isOil
    ? '精油'
    : isAcupuncture
      ? '穴道'
      : isChineseMedicine
        ? '中藥'
        : item.category;

  const theme = getCategoryTheme(resolvedCategory);

  const cardStyle = {
    '--cat-deep': theme?.deep || '#527565',
    '--cat-mid': theme?.mid || '#9AAE9F',
    '--cat-tint': theme?.tint || '#EEF2EA',
  };

  const englishName = String(
    firstValue(item, [
      'englishName',
      'english',
      '英文名',
      '英文名稱',
      'latin',
    ]) || ''
  ).trim();

  const indications = String(
    firstValue(item, [
      'indications',
      'effect',
      '主治',
      '主治功效',
      '功效',
    ]) || ''
  ).trim();

  const meridian = String(
    firstValue(item, [
      'meridian',
      'acuTable.meridian',
    ]) || ''
  ).trim();

  const rawLocation = String(
    firstValue(item, [
      'acuDetails.location',
      'acuTable.location',
      'location',
    ]) || ''
  ).trim();

  const locationLabel = isAcupuncture
    ? getLocationLabel(rawLocation)
    : '';

  const acupunctureCode = isAcupuncture
    ? String(item.acuTable?.code || '').trim()
    : '';

  const categoryLabel =
    resolvedCategory === '其他' ||
    resolvedCategory === '名詞材料'
      ? '名詞材料'
      : String(resolvedCategory || '').trim();

  const tags = useMemo(() => {
    const values = [
      item.tag,
      item.type,
      item.constitutionTag,
      item.chemicalTag,
    ];

    if (isAcupuncture) {
      values.push(
        item.meridian,
        item.acuTable?.meridian
      );
    }

    return values
      .flatMap((value) =>
        Array.isArray(value) ? value : [value]
      )
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      );
  }, [
    item.tag,
    item.type,
    item.constitutionTag,
    item.chemicalTag,
    item.meridian,
    item.acuTable?.meridian,
    isAcupuncture,
  ]);

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

  const subtitle = isOil
    ? englishName
    : isAcupuncture
      ? acupunctureCode
      : item.category === '其他'
        ? item.type || item.alias || ''
        : item.alias || '';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`查看${item.name || '未命名'}的詳細內容`}
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
            {tags.map((tag, index) => (
              <span
                key={`tag-${index}-${tag}`}
                className="card-tag"
              >
                {tag}
              </span>
            ))}

            {acupunctureCode && (
              <span className="card-tag card-code">
                <span className="sr-only">
                  國際代碼：
                </span>

                {acupunctureCode}
              </span>
            )}

            {tags.length === 0 &&
              !acupunctureCode && (
                <span className="card-tag">
                  本草與芳香
                </span>
              )}
          </div>

          {categoryLabel && (
            <span className="card-category">
              {categoryLabel}
            </span>
          )}
        </div>

        <div>
          <h3
            className="card-title"
            style={TITLE_FONT}
          >
            {item.name || '未命名'}
          </h3>

          {isOil && (
            <div>
              {englishName && (
                <div className="card-english">
                  {englishName}
                </div>
              )}

              {indications && (
                <div className="card-meta">
                  {indications}
                </div>
              )}
            </div>
          )}

          {isAcupuncture && (
            <div>
              {englishName && (
                <div className="card-english">
                  {englishName}
                </div>
              )}

              {locationLabel && (
                <div className="card-location">
                  {locationLabel}
                </div>
              )}
            </div>
          )}

          {isChineseMedicine && (
            <div>
              {englishName && (
                <div className="card-english">
                  {englishName}
                </div>
              )}

              {meridian && (
                <div className="card-meta">
                  <span className="card-meta-label">
                    歸經
                  </span>

                  {meridian}
                </div>
              )}
            </div>
          )}

          {!isOil &&
            !isAcupuncture &&
            !isChineseMedicine &&
            subtitle && (
              <div className="card-english">
                {subtitle}
              </div>
            )}
        </div>

        <div className="card-footer">
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
        </div>
      </div>
    </div>
  );
});

export default DataCard;