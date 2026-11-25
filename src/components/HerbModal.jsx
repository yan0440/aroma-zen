import React from 'react';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const HERB_STYLES = `
  .herb-detail {
    --herb-bg: var(--app-bg, #fdfbf7);
    --herb-surface: var(--app-surface, #fffdf8);
    --herb-soft: var(--app-surface-soft, #f0f3eb);
    --herb-text: var(--app-text, #283c32);
    --herb-muted: var(--app-muted, #657565);
    --herb-border: var(--app-border, #dce2d7);
    --herb-accent: var(--app-accent, #405e4c);
    --herb-selected: var(--app-selected, #e3ebdf);
    --herb-selected-text: var(--app-selected-text, #2f4c3b);
    --herb-mark-bg: #efe3c9;
    --herb-mark-text: #4b432c;
    --herb-danger-bg: rgba(127, 29, 29, 0.08);
    --herb-danger-text: #9b2c2c;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--herb-bg);
    color: var(--herb-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .herb-detail {
    --herb-mark-bg: #4a4430;
    --herb-mark-text: #eee0b5;
    --herb-danger-bg: rgba(127, 29, 29, 0.22);
    --herb-danger-text: #fca5a5;

    color-scheme: dark;
  }

  .herb-detail .herb-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--herb-border);
    background: var(--herb-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .herb-detail .herb-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .herb-detail .herb-eyebrow {
    color: var(--herb-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .herb-detail .herb-header-name {
    margin-top: 3px;
    overflow: hidden;
    color: var(--herb-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .herb-detail .herb-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--herb-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--herb-surface);
    color: var(--herb-text);
    font-size: 13px;
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .herb-detail .herb-back:hover {
    border-color: var(--herb-accent);
    background: var(--herb-soft);
  }

  .herb-detail .herb-back:focus-visible {
    outline: 2px solid var(--herb-accent);
    outline-offset: 3px;
  }

  .herb-detail .herb-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--herb-border) var(--herb-bg);
  }

  .herb-detail .herb-layout {
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

  .herb-detail .herb-panel {
    min-width: 0;
    border: 1px solid var(--herb-border);
    border-radius: 24px;
    background: var(--herb-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .herb-detail .herb-overview {
    overflow: hidden;
  }

  .herb-detail .herb-identity {
    border-bottom: 1px solid var(--herb-border);
    padding: 28px;
    background:
      radial-gradient(
        ellipse at 100% 0%,
        rgb(107 144 128 / 10%),
        transparent 70%
      ),
      var(--herb-surface);
  }

  .herb-detail .herb-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .herb-detail .herb-tag {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--herb-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--herb-soft);
    color: var(--herb-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .herb-detail .herb-code {
    border-color: transparent;
    background: var(--herb-selected);
    color: var(--herb-selected-text);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .herb-detail .herb-name {
    margin: 0;
    color: var(--herb-text);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .herb-detail .herb-english {
    margin-top: 8px;
    color: var(--herb-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .herb-detail .herb-overview-body {
    padding: 24px 28px 28px;
  }

  .herb-detail .herb-facts {
    margin: 0;
  }

  .herb-detail .herb-fact {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--herb-border);
    padding: 13px 0;
  }

  .herb-detail .herb-fact:first-child {
    padding-top: 0;
  }

  .herb-detail .herb-fact:last-child {
    border-bottom: 0;
  }

  .herb-detail .herb-fact dt {
    color: var(--herb-muted);
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.06em;
  }

  .herb-detail .herb-fact dd {
    min-width: 0;
    margin: 0;
    color: var(--herb-text);
    font-size: 14px;
    line-height: 1.9;
  }

  .herb-detail .herb-summary {
    margin-top: 0;
    border-top: 1px solid var(--herb-border);
    padding-top: 24px;
  }

  .herb-detail .herb-summary-title {
    margin: 0 0 12px;
    color: var(--herb-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .herb-detail .herb-summary-text {
    margin: 0;
    color: var(--herb-muted);
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .herb-detail .herb-reading {
    padding: 8px 32px;
  }

  .herb-detail .herb-section {
    min-width: 0;
    padding: 28px 0;
  }

  .herb-detail .herb-section + .herb-section {
    border-top: 1px solid var(--herb-border);
  }

  .herb-detail .herb-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
    color: var(--herb-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .herb-detail .herb-section-title::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--herb-accent);
    content: "";
  }

  .herb-detail .herb-body {
    color: var(--herb-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .herb-detail .herb-line + .herb-line {
    margin-top: 6px;
  }

  .herb-detail .herb-blank {
    height: 10px;
  }

  .herb-detail .herb-numbered,
  .herb-detail .herb-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .herb-detail .herb-number {
    color: var(--herb-text);
    font-weight: 600;
  }

  .herb-detail .herb-bullet-dot {
    color: var(--herb-accent);
  }

  .herb-detail strong {
    color: var(--herb-text);
    font-weight: 600;
  }

  .herb-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--herb-mark-bg);
    color: var(--herb-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .herb-detail .herb-empty {
    color: var(--herb-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .herb-detail .herb-inset {
    border: 1px solid var(--herb-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--herb-soft);
  }

  .herb-detail .herb-alert {
    margin-top: 28px;
    border: 1px solid rgba(155, 44, 44, 0.22);
    border-radius: 16px;
    background: var(--herb-danger-bg);
    padding: 18px 20px;
    color: var(--herb-danger-text);
    font-size: 13px;
    line-height: 1.9;
  }

  @media (min-width: 1024px) {
    .herb-detail .herb-layout {
      grid-template-columns: 400px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .herb-detail .herb-overview {
      position: sticky;
      top: 28px;
    }
  }

  @media (max-width: 640px) {
    .herb-detail .herb-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .herb-detail .herb-layout {
      gap: 18px;
      padding: 20px 12px 40px;
    }

    .herb-detail .herb-identity {
      padding: 24px;
    }

    .herb-detail .herb-overview-body {
      padding: 22px 16px;
    }

    .herb-detail .herb-reading {
      padding: 4px 22px;
    }

    .herb-detail .herb-section {
      padding: 24px 0;
    }

    .herb-detail .herb-inset {
      padding: 16px;
    }

    .herb-detail .herb-name {
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .herb-detail .herb-back {
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
      <span className="herb-empty">
        {emptyText}
      </span>
    );
  }

  return (
    <div className="herb-body">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="herb-blank"
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
              className="herb-line herb-numbered"
            >
              <span className="herb-number">
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
              className="herb-line herb-bullet"
            >
              <span className="herb-bullet-dot">
                ●
              </span>

              <div>
                {renderInline(trimmed.slice(1).trim())}
              </div>
            </div>
          );
        }

        const colonIndex = emphasizeLabel
          ? trimmed.search(/[：:]/)
          : -1;

        if (colonIndex > 0) {
          return (
            <div key={index} className="herb-line">
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
        }

        return (
          <div key={index} className="herb-line">
            {renderInline(trimmed)}
          </div>
        );
      })}
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
    <section className="herb-section">
      <h3 className="herb-section-title">
        {title}
      </h3>

      <div className={inset ? 'herb-inset' : undefined}>
        <FormattedText
          value={value}
          emptyText={emptyText}
          emphasizeLabel={emphasizeLabel}
        />
      </div>
    </section>
  );
}

export default function HerbModal({
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

  const displayAlert =
    item.alert ||
    (['中藥', '方劑'].includes(item.category)
      ? '本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。'
      : '');

  const rows = [
    {
      label: '別名',
      value: item.alias,
    },
    {
      label: '類別',
      value: item.tag || item.category,
    },
    {
      label: '科屬',
      value: item.family,
    },
    {
      label: '性味',
      value: item.nature,
    },
    {
      label: '歸經',
      value: item.meridian,
    },
  ];

  const fields = [
    {
      title: '品種來源',
      value: item.source,
      inset: true,
    },
    {
      title: '性狀',
      value: item.traits,
    },
    {
      title: '功效',
      value: item.effect,
    },
    {
      title: '主治',
      value: item.indications,
    },
    {
      title: '用法用量',
      value: item.dosage,
      inset: true,
    },
    {
      title: '現代藥理',
      value: item.pharmacology,
    },
    {
      title: '現代應用',
      value: item.contemporary,
    },
    {
      title: '選方',
      value: item.medicine,
      inset: true,
    },
    {
      title: '文獻別錄',
      value: item.literature,
    },
    {
      title: '注意禁忌',
      value: item.contraindication,
    },
    {
      title: '炮製儲藏',
      value: item.preparation,
      inset: true,
    },
    {
      title: '附藥說明',
      value: item.directions,
    },
    {
      title: '註',
      value: item.note,
    },
  ];

  return (
    <div className="herb-detail">
      <style>{HERB_STYLES}</style>

      <header className="herb-header">
        <div className="herb-header-inner">
          <div className="min-w-0">
            <p className="herb-eyebrow">
              本草百科 / HERBAL MEDICINE
            </p>

            <h1 className="herb-header-name">
              {item.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="herb-back"
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

      <main className="herb-scroll">
        <div className="herb-layout">
          <aside className="herb-panel herb-overview">
            <div className="herb-identity">
              <div className="herb-tags">
                {item.category && (
                  <span className="herb-tag">
                    {item.category}
                  </span>
                )}

                {item.tag &&
                  item.tag !== item.category && (
                    <span className="herb-tag">
                      {item.tag}
                    </span>
                  )}
              </div>

              <h2
                className="herb-name"
                style={TITLE_FONT}
              >
                {item.name}
              </h2>

              <p className="herb-english">
                {item.englishName || '中藥百科'}
              </p>
            </div>

            <div className="herb-overview-body">
              <dl className="herb-facts">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="herb-fact"
                  >
                    <dt>{row.label}</dt>

                    <dd>
                      <FormattedText
                        value={row.value}
                        emptyText={
                          row.label === '別名'
                            ? '無別名'
                            : '無記載'
                        }
                      />
                    </dd>
                  </div>
                ))}
              </dl>

              <section className="herb-summary">
                <h3 className="herb-summary-title">
                  簡介
                </h3>

                <p className="herb-summary-text">
                  {item.description ||
                    '此條目目前尚未填寫簡介。'}
                </p>
              </section>
            </div>
          </aside>

          <div className="herb-panel herb-reading">
            {fields.map((field) => (
              <DetailSection
                key={field.title}
                title={field.title}
                value={field.value}
                inset={field.inset}
              />
            ))}

            {displayAlert && (
              <div className="herb-alert">
                <strong>⚠️ 重要提醒：</strong>{' '}
                {displayAlert}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}