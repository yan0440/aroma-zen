import React, { useState, useRef } from 'react';

const LEVEL_TYPES = ['篇', '章', '節', '目', '子目'];
const CONTENT_TYPE = '內文';
const INTRODUCTION_TYPE = '簡介';
const INTRODUCTION_ID = '__book_introduction__';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const BOOK_STYLES = `
  .book-detail {
    --book-bg: var(--app-bg, #fdfbf7);
    --book-surface: var(--app-surface, #fffdf8);
    --book-soft: var(--app-surface-soft, #f0f3eb);
    --book-text: var(--app-text, #283c32);
    --book-muted: var(--app-muted, #657565);
    --book-border: var(--app-border, #dce2d7);
    --book-accent: var(--app-accent, #405e4c);
    --book-selected: var(--app-selected, #e3ebdf);
    --book-selected-text: var(--app-selected-text, #2f4c3b);
    --book-mark-bg: #efe3c9;
    --book-mark-text: #4b432c;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--book-bg);
    color: var(--book-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .book-detail {
    --book-mark-bg: #4a4430;
    --book-mark-text: #eee0b5;

    color-scheme: dark;
  }

  .book-detail .book-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--book-border);
    background: var(--book-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .book-detail .book-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .book-detail .book-eyebrow {
    color: var(--book-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .book-detail .book-header-name {
    margin-top: 3px;
    overflow: hidden;
    color: var(--book-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-detail .book-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--book-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--book-surface);
    color: var(--book-text);
    font-size: 13px;
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .book-detail .book-back:hover {
    border-color: var(--book-accent);
    background: var(--book-soft);
  }

  .book-detail .book-back:focus-visible {
    outline: 2px solid var(--book-accent);
    outline-offset: 3px;
  }

  .book-detail .book-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 24px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 28px 24px;
    padding-bottom: max(48px, env(safe-area-inset-bottom, 0px));
  }

  .book-detail .book-panel {
    min-width: 0;
    border: 1px solid var(--book-border);
    border-radius: 24px;
    background: var(--book-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .book-detail .book-directory {
    overflow: hidden;
  }

  .book-detail .book-directory-head {
    border-bottom: 1px solid var(--book-border);
    padding: 24px 24px 20px;
  }

  .book-detail .book-directory-title {
    margin: 0;
    color: var(--book-text);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .book-detail .book-directory-list {
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
  }

  .book-detail .book-item {
    width: 100%;
  }

  .book-detail .book-item-row {
    display: flex;
    align-items: stretch;
    gap: 6px;
    width: 100%;
  }

  .book-detail .book-item-button {
    position: relative;
    min-width: 0;
    flex: 1;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 10px 12px;
    background: transparent;
    color: var(--book-muted);
    text-align: left;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }

  .book-detail .book-item-button:hover {
    border-color: var(--book-border);
    background: var(--book-surface);
    color: var(--book-text);
  }

  .book-detail .book-item-button.is-active {
    border-color: var(--book-accent);
    background: var(--book-accent);
    color: #fff;
  }

  .book-detail .book-item-button:focus-visible,
  .book-detail .book-toggle:focus-visible {
    outline: 2px solid var(--book-accent);
    outline-offset: 2px;
  }

  .book-detail .book-item-main {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .book-detail .book-type {
    flex-shrink: 0;
    border-radius: 6px;
    padding: 2px 7px;
    background: var(--book-soft);
    color: var(--book-accent);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .book-detail .is-active .book-type {
    background: rgb(255 255 255 / 18%);
    color: #fff;
  }

  .book-detail .book-item-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 500;
  }

  .book-detail .book-toggle {
    display: flex;
    width: 34px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--book-accent);
    font-size: 12px;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .book-detail .book-toggle:hover {
    border-color: var(--book-border);
    background: var(--book-surface);
  }

  .book-detail .book-toggle.is-active {
    border-color: var(--book-accent);
    background: var(--book-accent);
    color: #fff;
  }

  .book-detail .book-children {
    margin-top: 6px;
    padding-left: 14px;
    border-left: 1px solid var(--book-border);
  }

  .book-detail .book-reader {
    min-width: 0;
    padding: 8px 32px;
  }

  .book-detail .book-reader-head {
    border-bottom: 1px solid var(--book-border);
    padding: 20px 0 22px;
  }

  .book-detail .book-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--book-muted);
    font-size: 12px;
  }

  .book-detail .book-title {
    margin: 0;
    color: var(--book-text);
    font-size: 32px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .book-detail .book-alias {
    display: inline-flex;
    align-items: center;
    margin-top: 10px;
    border: 1px solid var(--book-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--book-soft);
    color: var(--book-muted);
    font-size: 11px;
    line-height: 1.6;
  }

  .book-detail .book-article {
    padding: 28px 0;
    color: var(--book-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .book-detail .book-line + .book-line {
    margin-top: 6px;
  }

  .book-detail .book-blank {
    height: 10px;
  }

  .book-detail .book-numbered,
  .book-detail .book-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .book-detail .book-number {
    color: var(--book-text);
    font-weight: 600;
  }

  .book-detail .book-bullet-dot {
    color: var(--book-accent);
  }

  .book-detail strong {
    color: var(--book-text);
    font-weight: 600;
  }

  .book-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--book-mark-bg);
    color: var(--book-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .book-detail .book-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 24px 0 14px;
    color: var(--book-text);
    font-size: 17px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .book-detail .book-heading::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--book-accent);
    content: "";
  }

  .book-detail .book-table-wrap {
    margin: 20px 0;
    overflow: hidden;
    border: 1px solid var(--book-border);
    border-radius: 16px;
    background: var(--book-surface);
  }

  .book-detail .book-table-scroll {
    overflow-x: auto;
  }

  .book-detail .book-table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    font-size: 13px;
    text-align: left;
  }

  .book-detail .book-table td {
    border-top: 1px solid var(--book-border);
    padding: 12px 14px;
    vertical-align: top;
    color: var(--book-muted);
    line-height: 1.9;
    white-space: pre-wrap;
  }

  .book-detail .book-table tr:first-child td {
    border-top: 0;
    background: var(--book-soft);
    color: var(--book-text);
    font-weight: 600;
  }

  .book-detail .book-table td + td {
    border-left: 1px solid var(--book-border);
  }

  .book-detail .book-empty {
    color: var(--book-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .book-detail .book-empty-state {
    display: flex;
    min-height: 420px;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--book-border);
    border-radius: 20px;
    background: var(--book-soft);
    padding: 32px 24px;
    text-align: center;
  }

  .book-detail .book-empty-title {
    margin: 12px 0 0;
    color: var(--book-text);
    font-size: 20px;
    font-weight: 600;
  }

  .book-detail .book-empty-text {
    margin: 8px 0 0;
    color: var(--book-muted);
    font-size: 14px;
    line-height: 1.9;
  }

  .book-detail .book-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 24px;
    color: var(--book-muted);
    font-size: 12px;
  }

  .book-detail .book-footer-line {
    width: 40px;
    height: 1px;
    background: var(--book-border);
  }

  @media (min-width: 1024px) {
    .book-detail .book-layout {
      grid-template-columns: 330px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .book-detail .book-directory {
      position: sticky;
      top: 28px;
      max-height: calc(100dvh - 160px);
      display: flex;
      flex-direction: column;
    }
  }

  @media (max-width: 640px) {
    .book-detail .book-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .book-detail .book-layout {
      gap: 18px;
      padding: 20px 16px 40px;
    }

    .book-detail .book-directory-head {
      padding: 20px 20px 16px;
    }

    .book-detail .book-directory-list {
      padding: 12px;
    }

    .book-detail .book-reader {
      padding: 4px 22px;
    }

    .book-detail .book-title {
      font-size: 28px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .book-detail .book-back,
    .book-detail .book-item-button,
    .book-detail .book-toggle {
      transition: none;
    }
  }
`;

function normalizeType(type, level = 0) {
  if (type === 'folder') {
    return LEVEL_TYPES[Math.min(level, LEVEL_TYPES.length - 1)];
  }

  if (type === 'content') {
    return CONTENT_TYPE;
  }

  if (LEVEL_TYPES.includes(type) || type === CONTENT_TYPE) {
    return type;
  }

  return level === 0
    ? '篇'
    : LEVEL_TYPES[Math.min(level, LEVEL_TYPES.length - 1)];
}

function getLevelLabel(type, level = 0) {
  if (type === INTRODUCTION_TYPE) {
    return INTRODUCTION_TYPE;
  }

  if (type === CONTENT_TYPE) {
    return CONTENT_TYPE;
  }

  return LEVEL_TYPES[Math.min(level, LEVEL_TYPES.length - 1)];
}

function getRawTitle(fullTitle = '') {
  const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
  return match ? match[1].trim() : fullTitle;
}

function getAliasTitle(fullTitle = '') {
  const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
  return match ? match[2].trim() : '';
}

function asText(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join('\n');
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '';
}

function renderInline(text) {
  return asText(text)
    .split(/(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g)
    .map((part, index) => {
      if (!part) return null;

      if (part.startsWith('==') && part.endsWith('==')) {
        return (
          <mark key={`inline-${index}`}>
            {part.slice(2, -2)}
          </mark>
        );
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`inline-${index}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        (part.startsWith('《') && part.endsWith('》')) ||
        (part.startsWith('【') && part.endsWith('】'))
      ) {
        return (
          <strong key={`inline-${index}`}>
            {part}
          </strong>
        );
      }

      return part;
    });
}

function FormattedText({ value }) {
  const text = asText(value).replace(/\r\n?/g, '\n');

  if (!text.trim()) {
    return <span className="book-empty">無記載</span>;
  }

  return (
    <div className="book-article">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="book-blank"
              aria-hidden="true"
            />
          );
        }

        const numbered = trimmed.match(
          /^(\d+[.、．]|[一二三四五六七八九十百]+[、.．])\s*(.*)$/
        );

        if (numbered) {
          return (
            <div
              key={index}
              className="book-line book-numbered"
            >
              <span className="book-number">
                {numbered[1]}
              </span>

              <div>
                {renderInline(numbered[2])}
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('●')) {
          return (
            <div
              key={index}
              className="book-line book-bullet"
            >
              <span className="book-bullet-dot">
                ●
              </span>

              <div>
                {renderInline(trimmed.slice(1).trim())}
              </div>
            </div>
          );
        }

        const heading = trimmed.match(/^【([^】]+)】$/);

        if (heading) {
          return (
            <h3
              key={index}
              className="book-heading"
            >
              {heading[1].trim()}
            </h3>
          );
        }

        return (
          <div key={index} className="book-line">
            {renderInline(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

function BookTable({ rows }) {
  const tableRows = rows
    .map((row) =>
      String(row || '')
        .split('|')
        .map((cell) => cell.trim())
        .filter(
          (cell, index, array) =>
            !(index === 0 && cell === '') &&
            !(index === array.length - 1 && cell === '')
        )
    )
    .filter(
      (cells) =>
        cells.length > 0 &&
        !cells.every((cell) => /^:?-{3,}:?$/.test(cell))
    );

  if (!tableRows.length) {
    return null;
  }

  return (
    <div className="book-table-wrap">
      <div className="book-table-scroll">
        <table className="book-table">
          <tbody>
            {tableRows.map((cells, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {cells.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`}>
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BookModal({
  item,
  onClose,
  onBack,
  backLabel = '返回列表',
}) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [expandedDirectories, setExpandedDirectories] = useState(
    () => new Set()
  );

  const contentRef = useRef(null);

  if (!item) return null;

  const handleBack =
    typeof onClose === 'function' ? onClose : onBack;

  const restoreArray = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    if (typeof value !== 'object') return [];

    return Object.keys(value)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  };

  const deepRestore = (node, level = 0) => {
    if (!node) return node;

    return {
      ...node,
      type: normalizeType(node.type, level),
      children: restoreArray(node.children).map((child) =>
        deepRestore(child, level + 1)
      ),
    };
  };

  const processedChapters = restoreArray(
    item.bookDetails?.chapters
  ).map((node) => deepRestore(node, 0));

  const bookDescription = String(
    item.description || item.knowledgeDetails?.introduction || ''
  ).trim();

  const bookAuthor = String(item.bookDetails?.author || '').trim();
  const bookEnglishName = String(item.englishName || '').trim();

  const introductionItem = {
    id: INTRODUCTION_ID,
    title: '簡介',
    type: INTRODUCTION_TYPE,
    text: bookDescription,
    children: [],
  };

  const directoryItems = [
    ...(bookDescription ? [introductionItem] : []),
    ...processedChapters,
  ];

  const renderDirectory = (items, level = 0) => (
    <div className="book-directory-list-inner">
      {items.map((directoryItem) => {
        if (!directoryItem || !directoryItem.id) return null;

        const children = Array.isArray(directoryItem.children)
          ? directoryItem.children
          : [];

        const hasChildren = children.length > 0;
        const isIntroduction =
          directoryItem.id === INTRODUCTION_ID;
        const isContent =
          isIntroduction || directoryItem.type === CONTENT_TYPE;
        const hasOwnText = Boolean(
          String(directoryItem.text || '').trim()
        );
        const canRead =
          isIntroduction || isContent || hasOwnText;
        const isExpandable = hasChildren;
        const isActive =
          selectedContent?.id === directoryItem.id;
        const isExpanded = expandedDirectories.has(
          directoryItem.id
        );

        const toggleExpanded = (event) => {
          event.stopPropagation();

          setExpandedDirectories((previous) => {
            const next = new Set(previous);

            if (next.has(directoryItem.id)) {
              next.delete(directoryItem.id);
            } else {
              next.add(directoryItem.id);
            }

            return next;
          });
        };

        const handleDirectoryClick = () => {
          if (canRead) {
            setSelectedContent(directoryItem);

            requestAnimationFrame(() => {
              contentRef.current?.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            });

            return;
          }

          if (isExpandable) {
            toggleExpanded({ stopPropagation() {} });
          }
        };

        const typeLabel = isIntroduction
          ? INTRODUCTION_TYPE
          : isContent
            ? CONTENT_TYPE
            : directoryItem.type ||
              LEVEL_TYPES[
                Math.min(level, LEVEL_TYPES.length - 1)
              ];

        const icon = isIntroduction
          ? '📖'
          : isExpandable
            ? isExpanded
              ? '📂'
              : '📁'
            : '📄';

        return (
          <div
            key={directoryItem.id}
            className="book-item"
          >
            <div className="book-item-row">
              <button
                type="button"
                onClick={handleDirectoryClick}
                className={`book-item-button ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <div className="book-item-main">
                  <span>{icon}</span>

                  <span className="book-type">
                    {typeLabel}
                  </span>

                  <span className="book-item-title">
                    {getRawTitle(
                      directoryItem.title || '無標題內容'
                    )}
                  </span>
                </div>
              </button>

              {isExpandable && (
                <button
                  type="button"
                  onClick={toggleExpanded}
                  className={`book-toggle ${
                    isActive ? 'is-active' : ''
                  }`}
                  aria-label={
                    isExpanded ? '收合子內容' : '展開子內容'
                  }
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              )}
            </div>

            {isExpandable && isExpanded && (
              <div className="book-children">
                {renderDirectory(children, level + 1)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const selectedIsIntroduction =
    selectedContent?.id === INTRODUCTION_ID;

  const selectedTitle = getRawTitle(
    selectedContent?.title || ''
  );

  const selectedAlias = getAliasTitle(
    selectedContent?.title || ''
  );

  return (
    <div className="book-detail">
      <style>{BOOK_STYLES}</style>

      <header className="book-header">
        <div className="book-header-inner">
          <div className="min-w-0">
            <p className="book-eyebrow">
              本草百科 / BOOK READER
            </p>

            <h1 className="book-header-name">
              {item.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              typeof handleBack === 'function' && handleBack()
            }
            className="book-back"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>

            {backLabel}
          </button>
        </div>
      </header>

      <main className="book-scroll">
        <div className="book-layout">
          <aside className="book-panel book-directory">
            <div className="book-directory-head">
              <p className="book-eyebrow">
                CONTENTS
              </p>

              <h2 className="book-directory-title">
                目錄
              </h2>
            </div>

            <div className="book-directory-list">
              {directoryItems.length > 0 ? (
                renderDirectory(directoryItems)
              ) : (
                <div className="book-empty-state">
                  <div>
                    <div>📚</div>

                    <p className="book-empty-text">
                      目前沒有目錄內容
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section
            ref={contentRef}
            className="book-panel book-reader"
          >
            {selectedContent ? (
              <div>
                <div className="book-reader-head">
                  <div className="book-breadcrumb">
                    <span>目錄</span>
                    <span>/</span>
                    <span>
                      {getLevelLabel(
                        selectedContent.type,
                        0
                      )}
                    </span>
                  </div>

                  <h2
                    className="book-title"
                    style={TITLE_FONT}
                  >
                    {selectedTitle || '無標題內容'}
                  </h2>

                  {selectedAlias && (
                    <span className="book-alias">
                      別名：{selectedAlias}
                    </span>
                  )}
                </div>

                {selectedIsIntroduction ? (
                  <div className="book-article">
                    {(bookEnglishName || bookAuthor) && (
                      <div
                        style={{
                          marginBottom: 18,
                          paddingBottom: 16,
                          borderBottom:
                            '1px solid var(--book-border)',
                        }}
                      >
                        {bookEnglishName && (
                          <p
                            style={{
                              margin: '0 0 6px',
                              color: 'var(--book-muted)',
                              fontStyle: 'italic',
                            }}
                          >
                            {bookEnglishName}
                          </p>
                        )}

                        {bookAuthor && (
                          <p
                            style={{
                              margin: 0,
                              color: 'var(--book-accent)',
                              fontWeight: 600,
                            }}
                          >
                            作者／編著：{bookAuthor}
                          </p>
                        )}
                      </div>
                    )}

                    {bookDescription ? (
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {renderInline(bookDescription)}
                      </div>
                    ) : (
                      <span className="book-empty">
                        尚無書籍簡介。
                      </span>
                    )}
                  </div>
                ) : selectedContent.text ? (
                  <FormattedText
                    value={selectedContent.text}
                  />
                ) : (
                  <div className="book-empty-state">
                    <div>
                      <div>✦</div>

                      <h3 className="book-empty-title">
                        尚無內容
                      </h3>

                      <p className="book-empty-text">
                        此章節目前還沒有編輯內容。
                      </p>
                    </div>
                  </div>
                )}

                <div className="book-footer">
                  <span className="book-footer-line" />
                  <span>本草與芳香數位百科</span>
                  <span className="book-footer-line" />
                </div>
              </div>
            ) : (
              <div className="book-empty-state">
                <div>
                  <div>📖</div>

                  <h3 className="book-empty-title">
                    開始閱讀
                  </h3>

                  <p className="book-empty-text">
                    請從左側目錄選擇一個篇章
                    <br />
                    閱讀完整百科內容
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}