import React from 'react';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const OIL_STYLES = `
  .oil-detail {
    --oil-bg: var(--app-bg, #fdfbf7);
    --oil-surface: var(--app-surface, #fffdf8);
    --oil-soft: var(--app-surface-soft, #f0f3eb);
    --oil-text: var(--app-text, #283c32);
    --oil-muted: var(--app-muted, #657565);
    --oil-border: var(--app-border, #dce2d7);
    --oil-accent: var(--app-accent, #405e4c);
    --oil-selected: var(--app-selected, #e3ebdf);
    --oil-selected-text: var(--app-selected-text, #2f4c3b);
    --oil-mark-bg: #efe3c9;
    --oil-mark-text: #4b432c;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--oil-bg);
    color: var(--oil-text);
    color-scheme: light;
  }

  .oil-detail,
  .oil-detail *,
  .oil-detail *::before,
  .oil-detail *::after {
    box-sizing: border-box;
  }

  :root[data-app-theme='dark'] .oil-detail {
    --oil-mark-bg: #4a4430;
    --oil-mark-text: #eee0b5;

    color-scheme: dark;
  }

  .oil-detail .oil-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--oil-border);
    background: var(--oil-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .oil-detail .oil-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .oil-detail .oil-header-text {
    min-width: 0;
  }

  .oil-detail .oil-eyebrow {
    margin: 0;
    color: var(--oil-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .oil-detail .oil-header-name {
    margin: 3px 0 0;
    overflow: hidden;
    color: var(--oil-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .oil-detail .oil-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--oil-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--oil-surface);
    color: var(--oil-text);
    font-size: 13px;
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .oil-detail .oil-back:hover {
    border-color: var(--oil-accent);
    background: var(--oil-soft);
  }

  .oil-detail .oil-back:focus-visible {
    outline: 2px solid var(--oil-accent);
    outline-offset: 3px;
  }

  .oil-detail .oil-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--oil-border) var(--oil-bg);
  }

  .oil-detail .oil-layout {
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

  .oil-detail .oil-panel {
    min-width: 0;
    border: 1px solid var(--oil-border);
    border-radius: 24px;
    background: var(--oil-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .oil-detail .oil-overview {
    overflow: hidden;
  }

  .oil-detail .oil-identity {
    border-bottom: 1px solid var(--oil-border);
    padding: 28px;
    background:
      radial-gradient(
        ellipse at 100% 0%,
        rgb(107 144 128 / 10%),
        transparent 70%
      ),
      var(--oil-surface);
  }

  .oil-detail .oil-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .oil-detail .oil-tag {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--oil-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--oil-soft);
    color: var(--oil-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .oil-detail .oil-name {
    margin: 0;
    color: var(--oil-text);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .oil-detail .oil-english {
    margin: 8px 0 0;
    color: var(--oil-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .oil-detail .oil-overview-body {
    padding: 24px 28px 28px;
  }

  .oil-detail .oil-facts {
    margin: 0;
  }

  .oil-detail .oil-fact {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--oil-border);
    padding: 13px 0;
  }

  .oil-detail .oil-fact:first-child {
    padding-top: 0;
  }

  .oil-detail .oil-fact:last-child {
    border-bottom: 0;
  }

  .oil-detail .oil-fact dt {
    align-self: center;
    margin: 0;
    color: var(--oil-muted);
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .oil-detail .oil-fact dd {
    min-width: 0;
    margin: 0;
    color: var(--oil-text);
    font-size: 15px;
    line-height: 2;
  }

  .oil-detail .oil-summary {
    margin-top: 0;
    border-top: 1px solid var(--oil-border);
    padding-top: 24px;
  }

  .oil-detail .oil-summary-title {
    margin: 0 0 12px;
    color: var(--oil-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .oil-detail .oil-summary-text {
    margin: 0;
    color: var(--oil-muted);
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .oil-detail .oil-reading {
    padding: 8px 32px;
  }

  .oil-detail .oil-section {
    min-width: 0;
    padding: 28px 0;
  }

  .oil-detail .oil-section + .oil-section,
  .oil-detail .oil-section + .oil-effects,
  .oil-detail .oil-effects + .oil-section,
  .oil-detail .oil-effects + .oil-effects {
    border-top: 1px solid var(--oil-border);
  }

  .oil-detail .oil-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
    color: var(--oil-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .oil-detail .oil-section-title::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--oil-accent);
    content: "";
  }

  .oil-detail .oil-body {
    color: var(--oil-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .oil-detail .oil-line + .oil-line {
    margin-top: 6px;
  }

  .oil-detail .oil-blank {
    height: 10px;
  }

  .oil-detail .oil-numbered,
  .oil-detail .oil-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .oil-detail .oil-number {
    color: var(--oil-text);
    font-weight: 600;
  }

  .oil-detail .oil-bullet-dot {
    color: var(--oil-accent);
  }

  .oil-detail strong {
    color: var(--oil-text);
    font-weight: 600;
  }

  .oil-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--oil-mark-bg);
    color: var(--oil-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .oil-detail .oil-empty {
    color: var(--oil-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .oil-detail .oil-inset {
    border: 1px solid var(--oil-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--oil-soft);
  }

  .oil-detail .oil-effects {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .oil-detail .oil-effects .oil-section {
    border-top: 0;
  }

  .oil-detail .oil-effects .oil-section + .oil-section {
    border-top: 1px solid var(--oil-border);
  }

  @media (min-width: 768px) {
    .oil-detail .oil-effects {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 28px;
    }

    .oil-detail .oil-effects .oil-section + .oil-section {
      border-top: 0;
    }
  }

  @media (min-width: 1024px) {
    .oil-detail .oil-layout {
      grid-template-columns: 400px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .oil-detail .oil-overview {
      position: sticky;
      top: 28px;
    }
  }

  @media (max-width: 640px) {
    .oil-detail .oil-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .oil-detail .oil-layout {
      gap: 18px;
      padding: 20px 12px 40px;
    }

    .oil-detail .oil-identity {
      padding: 24px;
    }

    .oil-detail .oil-overview-body {
      padding: 22px 16px;
    }

    .oil-detail .oil-fact {
      gap: 10px;
    }

    .oil-detail .oil-reading {
      padding: 4px 22px;
    }

    .oil-detail .oil-section {
      padding: 24px 0;
    }

    .oil-detail .oil-inset {
      padding: 16px;
    }

    .oil-detail .oil-name {
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .oil-detail .oil-back {
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
  return (
    values
      .map(asText)
      .find((value) => value.trim()) || ''
  );
}

function renderInline(text) {
  return asText(text)
    .split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g)
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
      <span className="oil-empty">
        {emptyText}
      </span>
    );
  }

  return (
    <div className="oil-body">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="oil-blank"
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
              className="oil-line oil-numbered"
            >
              <span className="oil-number">
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
              className="oil-line oil-bullet"
            >
              <span className="oil-bullet-dot">
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
            <div key={index} className="oil-line">
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
          <div key={index} className="oil-line">
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
    <section className="oil-section">
      <h3 className="oil-section-title">
        {title}
      </h3>

      <div className={inset ? 'oil-inset' : undefined}>
        <FormattedText
          value={value}
          emptyText={emptyText}
          emphasizeLabel={emphasizeLabel}
        />
      </div>
    </section>
  );
}

export default function OilModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) return null;

  const oilTable = item.oilTable || {};
  const oilDetails = item.oilDetails || {};

  const name =
    firstText(item.name).trim() || '未命名';

  const englishName = firstText(
    item.englishName,
    item.english,
    item['英文名'],
    item['英文名稱']
  );

  const getValue = (...keys) => {
    for (const key of keys) {
      const value = firstText(
        oilDetails[key],
        oilTable[key],
        item[key]
      );

      if (value) {
        return value;
      }
    }

    return '';
  };

  const constitutionTag = getValue('constitutionTag');
  const chemicalTag = getValue('chemicalTag');

  const description = firstText(
    item.description,
    oilDetails.description,
    oilTable.description
  );

  const rows = [
    {
      label: '別名',
      value: getValue('alias'),
    },
    {
      label: '植物種類／萃取部位',
      value: getValue('typePart'),
    },
    {
      label: '萃取方法',
      value: getValue('method'),
    },
    {
      label: '學名',
      value: getValue('latin'),
    },
    {
      label: '科名',
      value: getValue('family'),
    },
    {
      label: '性味',
      value: getValue('nature'),
    },
    {
      label: '五行',
      value: getValue('property'),
    },
    {
      label: '歸經',
      value: getValue('meridian'),
    },
    {
      label: '主治',
      value: getValue('indications'),
    },
    {
      label: '音符',
      value: getValue('noteAnalogy'),
    },
    {
      label: '星球',
      value: getValue('planet'),
    },
    {
      label: '產地',
      value: getValue('origin'),
    },
  ];

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="oil-detail">
      <style>{OIL_STYLES}</style>

      <header className="oil-header">
        <div className="oil-header-inner">
          <div className="oil-header-text">
            <p className="oil-eyebrow">
              本草百科 / ESSENTIAL OIL
            </p>

            <h1 className="oil-header-name">
              {name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="oil-back"
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

      <main className="oil-scroll">
        <div className="oil-layout">
          <aside className="oil-panel oil-overview">
            <div className="oil-identity">
              <div className="oil-tags">
                <span className="oil-tag">
                  {item.category || '精油'}
                </span>

                {constitutionTag && (
                  <span className="oil-tag">
                    {constitutionTag} 體質
                  </span>
                )}

                {chemicalTag && (
                  <span className="oil-tag">
                    {chemicalTag} 屬性
                  </span>
                )}
              </div>

              <h2
                className="oil-name"
                style={TITLE_FONT}
              >
                {name}
              </h2>

              {englishName && (
                <p className="oil-english">
                  {englishName}
                </p>
              )}
            </div>

            <div className="oil-overview-body">
              <dl className="oil-facts">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="oil-fact"
                  >
                    <dt>{row.label}</dt>

                    <dd>
                      <FormattedText value={row.value} />
                    </dd>
                  </div>
                ))}
              </dl>

              <section className="oil-summary">
                <h3 className="oil-summary-title">
                  簡介
                </h3>

                <p className="oil-summary-text">
                  {description ||
                    '此項目目前尚未填寫簡介。'}
                </p>
              </section>
            </div>
          </aside>

          <div className="oil-panel oil-reading">
            <DetailSection
              title="氣味"
              value={getValue('scent')}
            />

            <DetailSection
              title="外觀"
              value={getValue('appearance')}
            />

            <DetailSection
              title="應用歷史與相關神話"
              value={getValue('historyMyth')}
              inset
            />

            <div className="oil-effects">
              <DetailSection
                title="化學結構"
                value={getValue('chemistry')}
              />

              <DetailSection
                title="屬性補充"
                value={getValue('attribute')}
              />
            </div>

            {getValue('caution') && (
              <DetailSection
                title="⚠️ 注意事項"
                value={getValue('caution')}
                inset
              />
            )}

            <div className="oil-effects">
              <DetailSection
                title="心靈療效"
                value={getValue('mindEffect')}
              />

              <DetailSection
                title="身體療效"
                value={getValue('bodyEffect')}
              />
            </div>

            <DetailSection
              title="皮膚療效"
              value={getValue('skinEffect')}
            />

            <DetailSection
              title="體質適用"
              value={getValue('constitution')}
              inset
            />

            <DetailSection
              title="適合調和的精油"
              value={getValue('blendingOils')}
            />

            <DetailSection
              title="精油配方"
              value={getValue('formulas')}
              inset
            />

            <DetailSection
              title="按摩基底油"
              value={getValue(
                'carrierOils',
                'carrierOil'
              )}
            />

            <DetailSection
              title="使用方法"
              value={getValue('usage')}
              inset
            />
          </div>
        </div>
      </main>
    </div>
  );
}