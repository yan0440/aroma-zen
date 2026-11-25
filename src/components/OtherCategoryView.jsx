import React, {
  useMemo,
  useState,
} from 'react';

const OTHER_CATEGORY = '其他';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const OTHER_VIEW_STYLES = `
  .other-view {
    --view-bg: var(--app-bg, #fdfbf7);
    --view-surface: var(--app-surface, #fffdf8);
    --view-soft: var(--app-surface-soft, #f0f3eb);
    --view-text: var(--app-text, #283c32);
    --view-muted: var(--app-muted, #657565);
    --view-border: var(--app-border, #dce2d7);
    --view-accent: var(--app-accent, #405e4c);
    --view-selected: var(--app-selected, #e3ebdf);
    --view-selected-text: var(--app-selected-text, #2f4c3b);

    color: var(--view-text);
  }

  .other-view .view-title {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 0 24px;
  }

  .other-view .view-title-text {
    margin: 0;
    color: var(--view-text);
    font-size: 30px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
  }

  .other-view .view-title-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(
      to right,
      var(--view-border),
      transparent
    );
  }

  .other-view .view-search {
    margin-bottom: 24px;
    border: 1px solid var(--view-border);
    border-radius: 20px;
    background: var(--view-surface);
    padding: 14px;
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .other-view .view-input {
    width: 100%;
    border: 1px solid var(--view-border);
    border-radius: 12px;
    background: var(--view-bg);
    color: var(--view-text);
    padding: 12px 16px;
    font-size: 14px;
    outline: none;
    transition:
      border-color 160ms ease,
      background-color 160ms ease;
  }

  .other-view .view-input::placeholder {
    color: var(--view-muted);
    opacity: 0.85;
  }

  .other-view .view-input:focus-visible {
    border-color: var(--view-accent);
    outline: 2px solid var(--view-accent);
    outline-offset: 2px;
  }

  .other-view .view-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  @media (min-width: 768px) {
    .other-view .view-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
  }

  .other-view .entry-card {
    position: relative;
    isolation: isolate;
    display: flex;
    height: 100%;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--view-border);
    border-radius: 20px;
    background: var(--view-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
    padding: 0;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .other-view .entry-card:hover {
    border-color: var(--view-accent);
    box-shadow: 0 18px 42px -28px rgb(20 33 28 / 32%);
    transform: translateY(-2px);
  }

  .other-view .entry-card:focus-visible {
    outline: 2px solid var(--view-accent);
    outline-offset: 4px;
  }

  .other-view .entry-decoration {
    position: absolute;
    inset: 0 0 auto;
    z-index: 0;
    height: 112px;
    pointer-events: none;
    background: linear-gradient(
      150deg,
      var(--view-selected) 0%,
      transparent 75%
    );
    opacity: 0.55;
  }

  .other-view .entry-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 22px 22px 18px;
  }

  .other-view .entry-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }

  .other-view .entry-tag {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    border: 1px solid var(--view-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--view-soft);
    color: var(--view-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .other-view .entry-title {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--view-text);
    font-size: 25px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.06em;
  }

  .other-view .entry-type {
    margin: 10px 0 0;
    overflow-wrap: anywhere;
    color: var(--view-muted);
    font-size: 13px;
    line-height: 1.8;
  }

  .other-view .entry-description {
    margin: 12px 0 0;
    display: -webkit-box;
    overflow: hidden;
    color: var(--view-muted);
    font-size: 14px;
    line-height: 1.9;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .other-view .entry-footer {
    margin-top: auto;
    padding-top: 20px;
  }

  .other-view .entry-footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-top: 1px solid var(--view-border);
    padding-top: 14px;
  }

  .other-view .entry-action {
    color: var(--view-muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    transition: color 180ms ease;
  }

  .other-view .entry-card:hover .entry-action {
    color: var(--view-text);
  }

  .other-view .entry-arrow {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid var(--view-border);
    border-radius: 999px;
    color: var(--view-accent);
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }

  .other-view .entry-card:hover .entry-arrow {
    border-color: var(--view-accent);
    background: var(--view-accent);
    color: #fff;
  }

  .other-view .entry-arrow svg {
    width: 16px;
    height: 16px;
    transition: transform 180ms ease;
  }

  .other-view .entry-card:hover .entry-arrow svg {
    transform: translateX(2px);
  }

  .other-view .view-empty {
    border: 1px dashed var(--view-border);
    border-radius: 20px;
    background: var(--view-surface);
    color: var(--view-muted);
    padding: 56px 24px;
    text-align: center;
    font-size: 15px;
    line-height: 1.9;
  }

  @media (max-width: 640px) {
    .other-view .view-title-text {
      font-size: 26px;
    }

    .other-view .entry-content {
      padding: 18px 18px 16px;
    }

    .other-view .entry-title {
      font-size: 23px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .other-view .entry-card,
    .other-view .entry-arrow,
    .other-view .entry-arrow svg,
    .other-view .entry-action {
      transition: none;
    }
  }
`;

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getCreatedTime = (item) => {
  const value = item?.createdAt;

  if (typeof value === 'number') {
    return value;
  }

  if (
    value &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  }

  return 0;
};

const collectSearchText = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => collectSearchText(item))
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map((item) => collectSearchText(item))
      .filter(Boolean)
      .join(' ');
  }

  return '';
};

const getSearchText = (item) => {
  const fields = [
    item?.name,
    item?.type,
    item?.tag,
    item?.alias,
    item?.englishName,
    item?.description,
    item?.source,
    item?.effect,
    item?.indications,
    item?.literature,
    item?.contraindication,
    item?.note,
    item?.analysis,
    item?.discussion,
    item?.modernApp,
    item?.modernPharmacology,
    item?.property,
    item?.nature,
    item?.family,
    item?.traits,
    item?.directions,
    item?.knowledgeDetails,
  ];

  return normalizeText(
    fields
      .map((field) => collectSearchText(field))
      .filter(Boolean)
      .join(' ')
  );
};

function EntryCard({
  item,
  onClick,
}) {
  const tags = [
    item?.tag || item?.type,
    item?.alias,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className="entry-card"
      aria-label={`查看${item?.name || '未命名資料'}的詳細內容`}
    >
      <div
        aria-hidden="true"
        className="entry-decoration"
      />

      <div className="entry-content">
        <div className="entry-tags">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="entry-tag"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="entry-tag">
              名詞材料
            </span>
          )}
        </div>

        <h4
          className="entry-title"
          style={TITLE_FONT}
        >
          {item?.name || '未命名資料'}
        </h4>

        {item?.type && (
          <p className="entry-type">
            {item.type}
          </p>
        )}

        {item?.description && (
          <p className="entry-description">
            {item.description}
          </p>
        )}

        <div className="entry-footer">
          <div className="entry-footer-inner">
            <span className="entry-action">
              查看詳情
            </span>

            <span
              aria-hidden="true"
              className="entry-arrow"
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
    </button>
  );
}

export default function OtherCategoryView({
  allData,
  onSelectItem,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const otherItems = useMemo(() => {
    return (allData || [])
      .filter(
        (item) =>
          item &&
          item.category === OTHER_CATEGORY &&
          item.name
      )
      .sort((a, b) => {
        const timeA = getCreatedTime(a);
        const timeB = getCreatedTime(b);

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return String(a.name).localeCompare(
          String(b.name),
          'zh-Hant'
        );
      });
  }, [allData]);

  const filteredItems = useMemo(() => {
    const keyword = normalizeText(searchQuery);

    if (!keyword) {
      return otherItems;
    }

    return otherItems.filter((item) =>
      getSearchText(item).includes(keyword)
    );
  }, [otherItems, searchQuery]);

  return (
    <div className="other-view">
      <style>{OTHER_VIEW_STYLES}</style>

      <div className="view-title">
        <h3
          className="view-title-text"
          style={TITLE_FONT}
        >
          名詞材料總覽
        </h3>

        <div
          aria-hidden="true"
          className="view-title-line"
        />
      </div>

      <div className="view-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="搜尋名詞、用品或相關說明"
          className="view-input"
        />
      </div>

      {filteredItems.length > 0 ? (
        <div className="view-grid">
          {filteredItems.map((item, index) => (
            <EntryCard
              key={
                item.id ||
                item.entryKey ||
                `${item.category}-${item.name}-${index}`
              }
              item={item}
              onClick={() => {
                if (
                  typeof onSelectItem === 'function'
                ) {
                  onSelectItem(item);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="view-empty">
          {searchQuery
            ? '找不到符合的名詞或用品。'
            : '目前還沒有名詞材料資料。'}
        </div>
      )}
    </div>
  );
}