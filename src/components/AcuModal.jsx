import React from 'react';
import { getLocationLabel } from '../utils/locationLabel';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const ACU_STYLES = `
  .acu-detail {
    --acu-bg: var(--app-bg, #fdfbf7);
    --acu-surface: var(--app-surface, #fffdf8);
    --acu-soft: var(--app-surface-soft, #f0f3eb);
    --acu-text: var(--app-text, #283c32);
    --acu-muted: var(--app-muted, #657565);
    --acu-border: var(--app-border, #dce2d7);
    --acu-accent: var(--app-accent, #405e4c);
    --acu-selected: var(--app-selected, #e3ebdf);
    --acu-selected-text: var(--app-selected-text, #2f4c3b);
    --acu-mark-bg: #efe3c9;
    --acu-mark-text: #4b432c;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--acu-bg);
    color: var(--acu-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .acu-detail {
    --acu-mark-bg: #4a4430;
    --acu-mark-text: #eee0b5;

    color-scheme: dark;
  }

  .acu-detail .acu-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--acu-border);
    background: var(--acu-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .acu-detail .acu-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .acu-detail .acu-eyebrow {
    color: var(--acu-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .acu-detail .acu-header-name {
    margin-top: 3px;
    overflow: hidden;
    color: var(--acu-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .acu-detail .acu-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--acu-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--acu-surface);
    color: var(--acu-text);
    font-size: 13px;
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .acu-detail .acu-back:hover {
    border-color: var(--acu-accent);
    background: var(--acu-soft);
  }

  .acu-detail .acu-back:focus-visible {
    outline: 2px solid var(--acu-accent);
    outline-offset: 3px;
  }

  .acu-detail .acu-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--acu-border) var(--acu-bg);
  }

  .acu-detail .acu-layout {
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

  .acu-detail .acu-panel {
    min-width: 0;
    border: 1px solid var(--acu-border);
    border-radius: 24px;
    background: var(--acu-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .acu-detail .acu-overview {
    overflow: hidden;
  }

  .acu-detail .acu-identity {
    border-bottom: 1px solid var(--acu-border);
    padding: 28px;
    background:
      radial-gradient(
        ellipse at 100% 0%,
        rgb(107 144 128 / 10%),
        transparent 70%
      ),
      var(--acu-surface);
  }

  .acu-detail .acu-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .acu-detail .acu-tag {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--acu-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--acu-soft);
    color: var(--acu-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .acu-detail .acu-code {
    border-color: transparent;
    background: var(--acu-selected);
    color: var(--acu-selected-text);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .acu-detail .acu-name {
    margin: 0;
    color: var(--acu-text);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .acu-detail .acu-english {
    margin-top: 8px;
    color: var(--acu-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .acu-detail .acu-overview-body {
    padding: 24px 28px 28px;
  }

  .acu-detail .acu-facts {
    margin: 0;
  }

  .acu-detail .acu-fact {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--acu-border);
    padding: 13px 0;
  }

  .acu-detail .acu-fact:first-child {
    padding-top: 0;
  }

  .acu-detail .acu-fact:last-child {
    border-bottom: 0;
  }

  .acu-detail .acu-fact dt {
    color: var(--acu-muted);
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.06em;
  }

  .acu-detail .acu-fact dd {
    min-width: 0;
    margin: 0;
    color: var(--acu-text);
    font-size: 14px;
    line-height: 1.9;
  }

  .acu-detail .acu-summary {
    margin-top: 0;
    border-top: 1px solid var(--acu-border);
    padding-top: 24px;
  }

  .acu-detail .acu-summary-title {
    margin: 0 0 12px;
    color: var(--acu-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .acu-detail .acu-summary-text {
    margin: 0;
    color: var(--acu-muted);
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .acu-detail .acu-reading {
    padding: 8px 32px;
  }

  .acu-detail .acu-section {
    min-width: 0;
    padding: 28px 0;
  }

  .acu-detail .acu-section + .acu-section,
  .acu-detail .acu-section + .acu-effects,
  .acu-detail .acu-effects + .acu-section {
    border-top: 1px solid var(--acu-border);
  }

  .acu-detail .acu-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
    color: var(--acu-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .acu-detail .acu-section-title::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--acu-accent);
    content: "";
  }

  .acu-detail .acu-body {
    color: var(--acu-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .acu-detail .acu-line + .acu-line {
    margin-top: 6px;
  }

  .acu-detail .acu-blank {
    height: 10px;
  }

  .acu-detail .acu-numbered,
  .acu-detail .acu-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .acu-detail .acu-number {
    color: var(--acu-text);
    font-weight: 600;
  }

  .acu-detail .acu-bullet-dot {
    color: var(--acu-accent);
  }

  .acu-detail strong {
    color: var(--acu-text);
    font-weight: 600;
  }

  .acu-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--acu-mark-bg);
    color: var(--acu-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .acu-detail .acu-empty {
    color: var(--acu-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .acu-detail .acu-inset {
    border: 1px solid var(--acu-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--acu-soft);
  }

  .acu-detail .acu-effects {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .acu-detail .acu-effects .acu-section {
    border-top: 0;
  }

  .acu-detail .acu-effects .acu-section + .acu-section {
    border-top: 1px solid var(--acu-border);
  }

  @media (min-width: 768px) {
    .acu-detail .acu-effects {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 28px;
    }

    .acu-detail .acu-effects .acu-section + .acu-section {
      border-top: 0;
    }
  }

  @media (min-width: 1024px) {
    .acu-detail .acu-layout {
      grid-template-columns: 400px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .acu-detail .acu-overview {
      position: sticky;
      top: 28px;
    }
  }

  @media (max-width: 640px) {
    .acu-detail .acu-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .acu-detail .acu-layout {
      gap: 18px;
      padding: 20px 12px 40px;
    }

    .acu-detail .acu-identity {
      padding: 24px;
    }

    .acu-detail .acu-overview-body {
      padding: 22px 16px;
    }

    .acu-detail .acu-reading {
      padding: 4px 22px;
    }

    .acu-detail .acu-section {
      padding: 24px 0;
    }

    .acu-detail .acu-inset {
      padding: 16px;
    }

    .acu-detail .acu-name {
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .acu-detail .acu-back {
      transition: none;
    }
  }
`;

function asText(value) {
  if (Array.isArray(value)) {
    return value
      .map(asText)
      .filter(Boolean)
      .join('\n');
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  return '';
}

function firstText(...values) {
  return values
    .map(asText)
    .find((value) => value.trim()) || '';
}

function renderInline(text) {
  return asText(text)
    .split(
      /(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】|肌肉|神經|血管)/g
    )
    .map((part, index) => {
      if (!part) return null;

      if (
        part.startsWith('==') &&
        part.endsWith('==')
      ) {
        return (
          <mark key={index}>
            {part.slice(2, -2)}
          </mark>
        );
      }

      if (
        part.startsWith('**') &&
        part.endsWith('**')
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        ['肌肉', '神經', '血管'].includes(part) ||
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
      <span className="acu-empty">
        {emptyText}
      </span>
    );
  }

  return (
    <div className="acu-body">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="acu-blank"
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
              className="acu-line acu-numbered"
            >
              <span className="acu-number">
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
              className="acu-line acu-bullet"
            >
              <span className="acu-bullet-dot">
                ●
              </span>

              <div>
                {renderInline(
                  trimmed.slice(1).trim()
                )}
              </div>
            </div>
          );
        }

        const colonIndex = emphasizeLabel
          ? trimmed.search(/[：:]/)
          : -1;

        if (colonIndex > 0) {
          return (
            <div key={index} className="acu-line">
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
          <div key={index} className="acu-line">
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
    <section className="acu-section">
      <h3 className="acu-section-title">
        {title}
      </h3>

      <div className={inset ? 'acu-inset' : undefined}>
        <FormattedText
          value={value}
          emptyText={emptyText}
          emphasizeLabel={emphasizeLabel}
        />
      </div>
    </section>
  );
}

export default function AcuModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) return null;

  const acuTable = item.acuTable || {};
  const acuDetails = item.acuDetails || {};

  const name = firstText(item.name).trim() || '未命名';

  const englishName = firstText(
    item.englishName,
    item.english,
    item['英文名'],
    item['英文名稱']
  );

  const code = firstText(acuTable.code).trim();

  const meridian = firstText(
    acuTable.meridian,
    item.meridian
  );

  const alias = firstText(
    acuTable.alias,
    item.alias
  );

  const rawLocation = firstText(
    acuDetails.location,
    acuTable.location,
    item.location
  );

  const locationLabel = rawLocation
    ? getLocationLabel(rawLocation)
    : '';

  const description = firstText(item.description);

  const rows = [
    {
      label: '國際代碼',
      value: code,
    },
    {
      label: '經絡',
      value: meridian,
    },
    {
      label: '別名',
      value: alias,
    },
    {
      label: '部位',
      value: locationLabel,
    },
  ];

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="acu-detail">
      <style>{ACU_STYLES}</style>

      <header className="acu-header">
        <div className="acu-header-inner">
          <div className="min-w-0">
            <p className="acu-eyebrow">
              本草百科 / ACUPOINT
            </p>

            <h1 className="acu-header-name">
              {name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="acu-back"
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

      <main className="acu-scroll">
        <div className="acu-layout">
          <aside className="acu-panel acu-overview">
            <div className="acu-identity">
              <div className="acu-tags">
                <span className="acu-tag">
                  {item.category || '穴道'}
                </span>

                {meridian && (
                  <span className="acu-tag">
                    {meridian}
                  </span>
                )}

                {code && (
                  <span className="acu-tag acu-code">
                    <span className="sr-only">
                      國際代碼：
                    </span>
                    {code}
                  </span>
                )}
              </div>

              <h2
                className="acu-name"
                style={TITLE_FONT}
              >
                {name}
              </h2>

              {englishName && (
                <p className="acu-english">
                  {englishName}
                </p>
              )}
            </div>

            <div className="acu-overview-body">
              <dl className="acu-facts">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="acu-fact"
                  >
                    <dt>{row.label}</dt>

                    <dd>
                      <FormattedText value={row.value} />
                    </dd>
                  </div>
                ))}
              </dl>

              <section className="acu-summary">
                <h3 className="acu-summary-title">
                  簡介
                </h3>

                <p className="acu-summary-text">
                  {description ||
                    '此項目目前尚未填寫簡介。'}
                </p>
              </section>
            </div>
          </aside>

          <div className="acu-panel acu-reading">
            <DetailSection
              title="主治"
              value={firstText(
                acuDetails.indications,
                item.indications
              )}
            />

            <DetailSection
              title="類別"
              value={acuDetails.type}
            />

            <DetailSection
              title="釋名"
              value={acuDetails.nameExpl}
            />

            <DetailSection
              title="位置"
              value={rawLocation}
            />

            <DetailSection
              title="解剖"
              value={acuDetails.anatomy}
              emphasizeLabel
              inset
            />

            <DetailSection
              title="操作"
              value={acuDetails.operation}
              inset
            />

            <div className="acu-effects">
              <DetailSection
                title="古代功效"
                value={acuDetails.effectAncient}
              />

              <DetailSection
                title="現代功效"
                value={acuDetails.effectModern}
              />
            </div>

            <DetailSection
              title="配穴建議"
              value={acuDetails.matchingPoints}
              emptyText="無記載配穴資訊"
              emphasizeLabel
              inset
            />
          </div>
        </div>
      </main>
    </div>
  );
}