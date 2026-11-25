import React from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const FORMULA_STYLES = `
  .formula-detail {
    --formula-bg: var(--app-bg, #fdfbf7);
    --formula-surface: var(--app-surface, #fffdf8);
    --formula-soft: var(--app-surface-soft, #f0f3eb);
    --formula-text: var(--app-text, #283c32);
    --formula-muted: var(--app-muted, #657565);
    --formula-border: var(--app-border, #dce2d7);
    --formula-accent: var(--app-accent, #405e4c);
    --formula-selected: var(--app-selected, #e3ebdf);
    --formula-selected-text: var(--app-selected-text, #2f4c3b);
    --formula-mark-bg: #efe3c9;
    --formula-mark-text: #4b432c;
    --formula-danger-bg: rgba(127, 29, 29, 0.08);
    --formula-danger-text: #9b2c2c;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--formula-bg);
    color: var(--formula-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .formula-detail {
    --formula-mark-bg: #4a4430;
    --formula-mark-text: #eee0b5;
    --formula-danger-bg: rgba(127, 29, 29, 0.22);
    --formula-danger-text: #fca5a5;

    color-scheme: dark;
  }

  .formula-detail .formula-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--formula-border);
    background: var(--formula-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .formula-detail .formula-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .formula-detail .formula-eyebrow {
    color: var(--formula-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .formula-detail .formula-header-name {
    margin-top: 3px;
    overflow: hidden;
    color: var(--formula-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .formula-detail .formula-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--formula-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--formula-surface);
    color: var(--formula-text);
    font-size: 13px;
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .formula-detail .formula-back:hover {
    border-color: var(--formula-accent);
    background: var(--formula-soft);
  }

  .formula-detail .formula-back:focus-visible {
    outline: 2px solid var(--formula-accent);
    outline-offset: 3px;
  }

  .formula-detail .formula-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--formula-border) var(--formula-bg);
  }

  .formula-detail .formula-layout {
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

  .formula-detail .formula-panel {
    min-width: 0;
    border: 1px solid var(--formula-border);
    border-radius: 24px;
    background: var(--formula-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .formula-detail .formula-overview {
    overflow: hidden;
  }

  .formula-detail .formula-identity {
    border-bottom: 1px solid var(--formula-border);
    padding: 28px;
    background:
      radial-gradient(
        ellipse at 100% 0%,
        rgb(107 144 128 / 10%),
        transparent 70%
      ),
      var(--formula-surface);
  }

  .formula-detail .formula-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .formula-detail .formula-tag {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--formula-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--formula-soft);
    color: var(--formula-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .formula-detail .formula-code {
    border-color: transparent;
    background: var(--formula-selected);
    color: var(--formula-selected-text);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .formula-detail .formula-name {
    margin: 0;
    color: var(--formula-text);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .formula-detail .formula-alias {
    margin-top: 8px;
    color: var(--formula-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .formula-detail .formula-overview-body {
    padding: 24px 28px 28px;
  }

  .formula-detail .formula-facts {
    margin: 0;
  }

  .formula-detail .formula-fact {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--formula-border);
    padding: 13px 0;
  }

  .formula-detail .formula-fact:first-child {
    padding-top: 0;
  }

  .formula-detail .formula-fact:last-child {
    border-bottom: 0;
  }

  .formula-detail .formula-fact dt {
    color: var(--formula-muted);
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.06em;
  }

  .formula-detail .formula-fact dd {
    min-width: 0;
    margin: 0;
    color: var(--formula-text);
    font-size: 14px;
    line-height: 1.9;
  }

  .formula-detail .formula-summary {
    margin-top: 0;
    border-top: 1px solid var(--formula-border);
    padding-top: 24px;
  }

  .formula-detail .formula-summary-title {
    margin: 0 0 12px;
    color: var(--formula-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .formula-detail .formula-summary-text {
    margin: 0;
    color: var(--formula-muted);
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .formula-detail .formula-reading {
    padding: 8px 32px;
  }

  .formula-detail .formula-section {
    min-width: 0;
    padding: 28px 0;
  }

  .formula-detail .formula-section + .formula-section {
    border-top: 1px solid var(--formula-border);
  }

  .formula-detail .formula-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
    color: var(--formula-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .formula-detail .formula-section-title::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--formula-accent);
    content: "";
  }

  .formula-detail .formula-body {
    color: var(--formula-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .formula-detail .formula-line + .formula-line {
    margin-top: 6px;
  }

  .formula-detail .formula-blank {
    height: 10px;
  }

  .formula-detail .formula-numbered,
  .formula-detail .formula-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .formula-detail .formula-number {
    color: var(--formula-text);
    font-weight: 600;
  }

  .formula-detail .formula-bullet-dot {
    color: var(--formula-accent);
  }

  .formula-detail strong {
    color: var(--formula-text);
    font-weight: 600;
  }

  .formula-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--formula-mark-bg);
    color: var(--formula-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .formula-detail .formula-empty {
    color: var(--formula-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .formula-detail .formula-inset {
    border: 1px solid var(--formula-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--formula-soft);
  }

  .formula-detail .formula-table-wrap {
    margin: 18px 0;
    overflow: hidden;
    border: 1px solid var(--formula-border);
    border-radius: 16px;
    background: var(--formula-surface);
  }

  .formula-detail .formula-table-scroll {
    overflow-x: auto;
  }

  .formula-detail .formula-table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    font-size: 13px;
    text-align: left;
  }

  .formula-detail .formula-table th {
    border-bottom: 1px solid var(--formula-border);
    padding: 12px 14px;
    background: var(--formula-soft);
    color: var(--formula-text);
    font-weight: 600;
    text-align: left;
  }

  .formula-detail .formula-table td {
    border-top: 1px solid var(--formula-border);
    padding: 12px 14px;
    vertical-align: top;
    color: var(--formula-muted);
    line-height: 1.9;
  }

  .formula-detail .formula-table td + td,
  .formula-detail .formula-table th + th {
    border-left: 1px solid var(--formula-border);
  }

  .formula-detail .formula-alert {
    margin-top: 28px;
    border: 1px solid rgba(155, 44, 44, 0.22);
    border-radius: 16px;
    background: var(--formula-danger-bg);
    padding: 18px 20px;
    color: var(--formula-danger-text);
    font-size: 13px;
    line-height: 1.9;
  }

  @media (min-width: 1024px) {
    .formula-detail .formula-layout {
      grid-template-columns: 400px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .formula-detail .formula-overview {
      position: sticky;
      top: 28px;
    }
  }

  @media (max-width: 640px) {
    .formula-detail .formula-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .formula-detail .formula-layout {
      gap: 18px;
      padding: 20px 12px 40px;
    }

    .formula-detail .formula-identity {
      padding: 24px;
    }

    .formula-detail .formula-overview-body {
      padding: 22px 16px;
    }

    .formula-detail .formula-reading {
      padding: 4px 22px;
    }

    .formula-detail .formula-section {
      padding: 24px 0;
    }

    .formula-detail .formula-inset {
      padding: 16px;
    }

    .formula-detail .formula-name {
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .formula-detail .formula-back {
      transition: none;
    }
  }
`;

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
    .split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g)
    .map((part, index) => {
      if (!part) return null;

      if (part.startsWith('==') && part.endsWith('==')) {
        return (
          <mark key={index}>
            {part.slice(2, -2)}
          </mark>
        );
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        (part.startsWith('《') && part.endsWith('》')) ||
        (part.startsWith('【') && part.endsWith('】'))
      ) {
        return (
          <strong key={index}>
            {part}
          </strong>
        );
      }

      return part;
    });
}

function FormattedText({
  value,
  emptyText = '無記載',
  emphasizeLabel = false,
}) {
  const text = asText(value).replace(/\r\n?/g, '\n');

  if (!text.trim()) {
    return (
      <span className="formula-empty">
        {emptyText}
      </span>
    );
  }

  const lines = text.split('\n');
  const tableBuffer = [];
  const result = [];

  const flushTable = (key) => {
    if (tableBuffer.length === 0) {
      return;
    }

    result.push(
      <div
        key={key}
        className="formula-table-wrap"
      >
        <div className="formula-table-scroll">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <table className="formula-table">
                  {children}
                </table>
              ),
            }}
          >
            {tableBuffer.join('\n')}
          </ReactMarkdown>
        </div>
      </div>
    );

    tableBuffer.length = 0;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    }

    flushTable(`table-${index}`);

    if (!trimmed) {
      result.push(
        <div
          key={index}
          className="formula-blank"
          aria-hidden="true"
        />
      );

      return;
    }

    const numbered = trimmed.match(
      /^(\d+[.、．]|[一二三四五六七八九十百]+[、.．])\s*(.*)$/
    );

    if (numbered) {
      result.push(
        <div
          key={index}
          className="formula-line formula-numbered"
        >
          <span className="formula-number">
            {numbered[1]}
          </span>

          <div>
            {renderInline(numbered[2])}
          </div>
        </div>
      );

      return;
    }

    if (trimmed.startsWith('●')) {
      result.push(
        <div
          key={index}
          className="formula-line formula-bullet"
        >
          <span className="formula-bullet-dot">
            ●
          </span>

          <div>
            {renderInline(trimmed.slice(1).trim())}
          </div>
        </div>
      );

      return;
    }

    const colonIndex = emphasizeLabel
      ? trimmed.search(/[：:]/)
      : -1;

    if (colonIndex > 0) {
      result.push(
        <div key={index} className="formula-line">
          <strong>
            {renderInline(
              trimmed.slice(0, colonIndex + 1)
            )}
          </strong>

          {' '}

          {renderInline(
            trimmed.slice(colonIndex + 1)
          )}
        </div>
      );

      return;
    }

    result.push(
      <div key={index} className="formula-line">
        {renderInline(trimmed)}
      </div>
    );
  });

  flushTable('final-table');

  return (
    <div className="formula-body">
      {result}
    </div>
  );
}

function DetailSection({
  title,
  value,
  inset = false,
  emphasizeLabel = false,
  emptyText = '無記載',
}) {
  return (
    <section className="formula-section">
      <h3 className="formula-section-title">
        {title}
      </h3>

      <div className={inset ? 'formula-inset' : undefined}>
        <FormattedText
          value={value}
          emptyText={emptyText}
          emphasizeLabel={emphasizeLabel}
        />
      </div>
    </section>
  );
}

export default function FormulaModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const alertContent =
    item.alert ||
    (['中藥', '方劑', '穴道'].includes(item.category)
      ? '本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非專業人士請勿擅自處方服藥。'
      : '');

  const rows = [
    {
      label: '別名',
      value: item.alias,
    },
    {
      label: '來源',
      value: item.source,
    },
    {
      label: '功效',
      value: item.effect,
    },
  ];

  const fields = [
    {
      title: '製法用量',
      value: item.preparation,
      inset: true,
    },
    {
      title: '主治',
      value: item.indications,
    },
    {
      title: '文獻別錄',
      value: item.literature,
      inset: true,
    },
    {
      title: '方義分析',
      value: item.analysis,
    },
    {
      title: '方論',
      value: item.discussion,
      inset: true,
    },
    {
      title: '辨證要點',
      value: item.syndrome,
    },
    {
      title: '加減變化',
      value: item.modifications,
      inset: true,
    },
    {
      title: '注意禁忌',
      value: item.contraindication,
    },
    {
      title: '現代應用',
      value: item.modernApp,
    },
    {
      title: '現代藥理',
      value: item.modernPharmacology,
      inset: true,
    },
    {
      title: '附方',
      value: item.prescription,
    },
  ];

  return (
    <div className="formula-detail">
      <style>{FORMULA_STYLES}</style>

      <header className="formula-header">
        <div className="formula-header-inner">
          <div className="min-w-0">
            <p className="formula-eyebrow">
              本草百科 / HERBAL FORMULA
            </p>

            <h1 className="formula-header-name">
              {item.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="formula-back"
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

      <main className="formula-scroll">
        <div className="formula-layout">
          <aside className="formula-panel formula-overview">
            <div className="formula-identity">
              <div className="formula-tags">
                {item.category && (
                  <span className="formula-tag">
                    {item.category}
                  </span>
                )}

                {item.tag &&
                  item.tag !== item.category && (
                    <span className="formula-tag">
                      {item.tag}
                    </span>
                  )}
              </div>

              <h2
                className="formula-name"
                style={TITLE_FONT}
              >
                {item.name}
              </h2>

              <p className="formula-alias">
                {item.alias || '方劑百科'}
              </p>
            </div>

            <div className="formula-overview-body">
              <dl className="formula-facts">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="formula-fact"
                  >
                    <dt>{row.label}</dt>

                    <dd>
                      <FormattedText value={row.value} />
                    </dd>
                  </div>
                ))}
              </dl>

              <section className="formula-summary">
                <h3 className="formula-summary-title">
                  簡介
                </h3>

                <p className="formula-summary-text">
                  {item.description ||
                    '此條目目前尚未填寫簡介。'}
                </p>
              </section>
            </div>
          </aside>

          <div className="formula-panel formula-reading">
            {fields.map((field) => (
              <DetailSection
                key={field.title}
                title={field.title}
                value={field.value}
                inset={field.inset}
              />
            ))}

            {alertContent && (
              <div className="formula-alert">
                <strong>⚠️ 重要提醒：</strong>{' '}
                {alertContent}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}