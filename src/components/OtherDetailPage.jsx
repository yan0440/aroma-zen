import React, { useRef } from 'react';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const OTHER_DETAIL_STYLES = `
  .other-detail {
    --other-bg: var(--app-bg, #fdfbf7);
    --other-surface: var(--app-surface, #fffdf8);
    --other-soft: var(--app-surface-soft, #f0f3eb);
    --other-text: var(--app-text, #283c32);
    --other-muted: var(--app-muted, #657565);
    --other-border: var(--app-border, #dce2d7);
    --other-accent: var(--app-accent, #405e4c);
    --other-selected: var(--app-selected, #e3ebdf);
    --other-selected-text: var(--app-selected-text, #2f4c3b);
    --other-mark-bg: #efe3c9;
    --other-mark-text: #4b432c;
    --other-danger-bg: #fbefec;
    --other-danger-text: #9c544b;
    --other-danger-border: #e7c6bf;

    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--other-bg);
    color: var(--other-text);
    color-scheme: light;
  }

  .other-detail,
  .other-detail *,
  .other-detail *::before,
  .other-detail *::after {
    box-sizing: border-box;
  }

  :root[data-app-theme='dark'] .other-detail {
    --other-mark-bg: #4a4430;
    --other-mark-text: #eee0b5;
    --other-danger-bg: #402b2b;
    --other-danger-text: #edb6ac;
    --other-danger-border: #6b4541;
    color-scheme: dark;
  }

  .other-detail button {
    font: inherit;
  }

  .other-detail .other-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--other-border);
    background: var(--other-surface);
    padding-top: env(safe-area-inset-top, 0px);
  }

  .other-detail .other-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .other-detail .other-header-text {
    min-width: 0;
  }

  .other-detail .other-eyebrow {
    margin: 0;
    color: var(--other-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.8;
  }

  .other-detail .other-header-name {
    margin: 4px 0 0;
    overflow: hidden;
    color: var(--other-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .other-detail .other-back {
    display: inline-flex;
    min-height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--other-border);
    border-radius: 12px;
    padding: 9px 14px;
    background: var(--other-surface);
    color: var(--other-text);
    font-size: 13px;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .other-detail .other-back:hover {
    border-color: var(--other-accent);
    background: var(--other-soft);
  }

  .other-detail button:focus-visible {
    outline: 2px solid var(--other-accent);
    outline-offset: 3px;
  }

  .other-detail .other-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-color: var(--other-border) var(--other-bg);
  }

  .other-detail .other-layout {
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

  .other-detail .other-panel {
    min-width: 0;
    border: 1px solid var(--other-border);
    border-radius: 24px;
    background: var(--other-surface);
    box-shadow: 0 14px 36px -30px rgb(20 33 28 / 25%);
  }

  .other-detail .other-overview {
    overflow: hidden;
  }

  .other-detail .other-identity {
    border-bottom: 1px solid var(--other-border);
    padding: 28px;
    background:
      radial-gradient(
        ellipse at 100% 0%,
        rgb(107 144 128 / 10%),
        transparent 70%
      ),
      var(--other-surface);
  }

  .other-detail .other-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .other-detail .other-tag {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    border: 1px solid var(--other-border);
    border-radius: 7px;
    padding: 4px 9px;
    background: var(--other-soft);
    color: var(--other-muted);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .other-detail .other-name {
    margin: 0;
    color: var(--other-text);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.08em;
    overflow-wrap: anywhere;
  }

  .other-detail .other-english {
    margin: 8px 0 0;
    color: var(--other-muted);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .other-detail .other-overview-body {
    padding: 24px 28px 28px;
  }

  .other-detail .other-facts {
    margin: 0;
  }

  .other-detail .other-fact {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--other-border);
    padding: 13px 0;
  }

  .other-detail .other-fact:first-child {
    padding-top: 0;
  }

  .other-detail .other-fact:last-child {
    border-bottom: 0;
  }

  .other-detail .other-fact dt {
    color: var(--other-muted);
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.06em;
  }

  .other-detail .other-fact dd {
    min-width: 0;
    margin: 0;
  }

  .other-detail .other-summary {
    margin-top: 0;
    padding-top: 24px;
  }

  .other-detail .other-facts + .other-summary {
    border-top: 1px solid var(--other-border);
  }

  .other-detail .other-summary:first-child {
    padding-top: 0;
  }

  .other-detail .other-small-title {
    margin: 0 0 12px;
    color: var(--other-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1.8;
  }

  .other-detail .other-toc {
    margin-top: 24px;
    border-top: 1px solid var(--other-border);
    padding-top: 24px;
  }

  .other-detail .other-toc-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .other-detail .other-toc-head .other-small-title {
    margin: 0;
  }

  .other-detail .other-toc-count {
    color: var(--other-muted);
    font-size: 11px;
    white-space: nowrap;
  }

  .other-detail .other-toc-list {
    display: flex;
    max-height: 320px;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    padding: 3px;
    scrollbar-color: var(--other-border) transparent;
  }

  .other-detail .other-toc-link {
    display: flex;
    align-items: baseline;
    gap: 10px;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 9px 10px;
    background: transparent;
    color: var(--other-muted);
    text-align: left;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .other-detail .other-toc-link:hover {
    border-color: var(--other-border);
    background: var(--other-soft);
    color: var(--other-text);
  }

  .other-detail .other-toc-number {
    flex-shrink: 0;
    color: var(--other-accent);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    line-height: 1.9;
  }

  .other-detail .other-toc-label {
    min-width: 0;
    font-size: 13px;
    line-height: 1.9;
    overflow-wrap: anywhere;
  }

  .other-detail .other-reading {
    padding: 8px 32px;
  }

  .other-detail .other-section {
    min-width: 0;
    padding: 28px 0;
  }

  .other-detail .other-section + .other-section {
    border-top: 1px solid var(--other-border);
  }

  .other-detail .other-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 18px;
    color: var(--other-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.08em;
  }

  .other-detail .other-section-title::before {
    display: block;
    width: 4px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--other-accent);
    content: "";
  }

  .other-detail .other-body {
    color: var(--other-muted);
    font-size: 15px;
    line-height: 2;
    overflow-wrap: anywhere;
  }

  .other-detail .other-line + .other-line {
    margin-top: 6px;
  }

  .other-detail .other-blank {
    height: 10px;
  }

  .other-detail .other-numbered,
  .other-detail .other-bullet {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
  }

  .other-detail .other-number {
    color: var(--other-text);
    font-weight: 600;
  }

  .other-detail .other-bullet-dot {
    color: var(--other-accent);
  }

  .other-detail strong {
    color: var(--other-text);
    font-weight: 600;
  }

  .other-detail mark {
    border-radius: 4px;
    padding: 1px 4px;
    background: var(--other-mark-bg);
    color: var(--other-mark-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .other-detail .other-inset {
    border: 1px solid var(--other-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--other-soft);
  }

  .other-detail .other-knowledge {
    min-width: 0;
    scroll-margin-top: 24px;
  }

  .other-detail .other-knowledge + .other-knowledge {
    margin-top: 30px;
    border-top: 1px solid var(--other-border);
    padding-top: 28px;
  }

  .other-detail .other-knowledge-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
  }

  .other-detail .other-section-number {
    flex-shrink: 0;
    color: var(--other-accent);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.8;
    font-variant-numeric: tabular-nums;
  }

  .other-detail .other-knowledge-title {
    min-width: 0;
    margin: 0;
    color: var(--other-text);
    font-size: 22px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: 0.04em;
    overflow-wrap: anywhere;
  }

  .other-detail .other-knowledge-children {
    margin-top: 24px;
    border-left: 1px solid var(--other-border);
    padding-left: 20px;
  }

  .other-detail .other-knowledge-children .other-knowledge-title {
    font-size: 17px;
    letter-spacing: 0.02em;
  }

  .other-detail .other-block + .other-block {
    margin-top: 18px;
  }

  .other-detail .other-subtitle {
    margin: 0;
    border-left: 3px solid var(--other-accent);
    padding-left: 12px;
    color: var(--other-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.8;
  }

  .other-detail .other-table-wrap {
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--other-border);
    border-radius: 16px;
    background: var(--other-surface);
  }

  .other-detail .other-table-scroll {
    overflow-x: auto;
  }

  .other-detail .other-table {
    width: 100%;
    min-width: 480px;
    border-collapse: collapse;
    text-align: left;
  }

  .other-detail .other-table td,
  .other-detail .other-table th {
    border-top: 1px solid var(--other-border);
    padding: 14px 16px;
    vertical-align: middle;
  }

  .other-detail .other-table tr:first-child td,
  .other-detail .other-table tr:first-child th {
    border-top: 0;
  }

  .other-detail .other-table th {
    width: 28%;
    border-right: 1px solid var(--other-border);
    background: var(--other-soft);
    color: var(--other-text);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.9;
    text-align: left;
    overflow-wrap: anywhere;
  }

  .other-detail .other-alert {
    border: 1px solid var(--other-danger-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--other-danger-bg);
  }

  .other-detail .other-alert .other-body,
  .other-detail .other-alert strong {
    color: var(--other-danger-text);
  }

  .other-detail .other-empty {
    margin: 0;
    color: var(--other-muted);
    font-size: 14px;
    line-height: 1.9;
  }

  .other-detail .other-empty-state {
    margin: 24px 0;
    border: 1px dashed var(--other-border);
    border-radius: 16px;
    padding: 36px 20px;
    background: var(--other-soft);
    text-align: center;
  }

  @media (min-width: 1024px) {
    .other-detail .other-layout {
      grid-template-columns: 400px minmax(0, 1fr);
      gap: 28px;
      padding-top: 32px;
    }

    .other-detail .other-overview {
      position: sticky;
      top: 28px;
    }
  }

  @media (max-width: 640px) {
    .other-detail .other-header-inner {
      gap: 12px;
      padding: 14px 16px;
    }

    .other-detail .other-layout {
      gap: 18px;
      padding: 20px 12px 40px;
    }

    .other-detail .other-identity {
      padding: 24px;
    }

    .other-detail .other-name {
      font-size: 32px;
    }

    .other-detail .other-overview-body {
      padding: 22px 16px;
    }

    .other-detail .other-reading {
      padding: 4px 20px;
    }

    .other-detail .other-section {
      padding: 24px 0;
    }

    .other-detail .other-inset,
    .other-detail .other-alert {
      padding: 16px;
    }

    .other-detail .other-toc-list {
      max-height: 240px;
    }

    .other-detail .other-knowledge-children {
      padding-left: 12px;
    }

    .other-detail .other-knowledge-title {
      font-size: 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .other-detail .other-back,
    .other-detail .other-toc-link {
      transition: none;
    }
  }
`;

const DETAIL_FIELDS = [
  ['alias', '別名'],
  ['englishName', '英文名稱'],
  ['type', '類型'],
  ['tag', '核心標籤'],
];

function asText(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join('\n');
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

function getCategoryLabel(category) {
  const value = asText(category).trim();

  return !value || value === '其他'
    ? '名詞材料'
    : value;
}

function getFieldValue(item, key) {
  return firstText(
    item?.[key],
    item?.oilDetails?.[key],
    item?.acuDetails?.[key]
  );
}

function normalizeSections(value) {
  if (Array.isArray(value)) {
    return value.filter(
      (entry) => entry && typeof entry === 'object'
    );
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter(
      (entry) => entry && typeof entry === 'object'
    );
  }

  return [];
}

function normalizeBlocks(section) {
  const blocks = normalizeSections(section?.blocks);

  if (blocks.length > 0) {
    return blocks;
  }

  const legacyText = asText(section?.text);

  return legacyText.trim()
    ? [{ type: 'text', text: legacyText }]
    : [];
}

function getSectionTitle(section, index) {
  return firstText(
    section?.title,
    section?.name,
    `第 ${index + 1} 節`
  );
}

function getSectionId(path) {
  return `other-knowledge-section-${path.join('-')}`;
}

function buildKnowledgeToc(
  sections,
  parentNumber = '',
  parentPath = []
) {
  return normalizeSections(sections).flatMap(
    (section, index) => {
      const path = [...parentPath, index];

      const number = parentNumber
        ? `${parentNumber}.${index + 1}`
        : `${index + 1}`;

      return [
        {
          id: getSectionId(path),
          number,
          title: getSectionTitle(section, index),
          level: parentPath.length,
        },
        ...buildKnowledgeToc(
          section.children,
          number,
          path
        ),
      ];
    }
  );
}

function renderInline(value) {
  return asText(value)
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
        return <strong key={index}>{part}</strong>;
      }

      return part;
    });
}

function FormattedText({ value }) {
  const text = asText(value).replace(/\r\n?/g, '\n').trim();

  if (!text) return null;

  return (
    <div className="other-body">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="other-blank"
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
              className="other-line other-numbered"
            >
              <span className="other-number">
                {numbered[1]}
              </span>

              <div>{renderInline(numbered[2])}</div>
            </div>
          );
        }

        if (trimmed.startsWith('●')) {
          return (
            <div
              key={index}
              className="other-line other-bullet"
            >
              <span
                className="other-bullet-dot"
                aria-hidden="true"
              >
                ●
              </span>

              <div>
                {renderInline(trimmed.slice(1).trim())}
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="other-line">
            {renderInline(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

function KnowledgeBlock({ block }) {
  const type = block?.type || 'text';

  if (type === 'table') {
    const rows = normalizeSections(block?.rows).filter(
      (row) =>
        asText(row.left).trim() ||
        asText(row.right).trim()
    );

    if (!rows.length) return null;

    return (
      <div className="other-block">
        <div className="other-table-wrap">
          <div
            className="other-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="內容表格，可橫向捲動"
          >
            <table className="other-table">
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.id || 'row'}-${index}`}>
                    <th scope="row">
                      {renderInline(row.left)}
                    </th>

                    <td>
                      <FormattedText value={row.right} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const text = firstText(
    block?.text,
    block?.content,
    block?.description
  );

  if (!text.trim()) return null;

  if (type === 'subtitle') {
    return (
      <div className="other-block">
        <h4 className="other-subtitle">
          {renderInline(text)}
        </h4>
      </div>
    );
  }

  return (
    <div className="other-block">
      <FormattedText value={text} />
    </div>
  );
}

function KnowledgeSections({
  sections,
  parentPath = [],
  parentNumber = '',
}) {
  const sectionList = normalizeSections(sections);

  if (!sectionList.length) return null;

  return (
    <div
      className={
        parentPath.length
          ? 'other-knowledge-children'
          : undefined
      }
    >
      {sectionList.map((section, index) => {
        const path = [...parentPath, index];

        const number = parentNumber
          ? `${parentNumber}.${index + 1}`
          : `${index + 1}`;

        const blocks = normalizeBlocks(section);

        const children = normalizeSections(
          section.children
        );

        return (
          <article
            key={getSectionId(path)}
            id={getSectionId(path)}
            className="other-knowledge"
          >
            <div className="other-knowledge-head">
              <span className="other-section-number">
                {number}
              </span>

              <h3
                className="other-knowledge-title"
                style={
                  parentPath.length === 0
                    ? TITLE_FONT
                    : undefined
                }
              >
                {getSectionTitle(section, index)}
              </h3>
            </div>

            {blocks.map((block, blockIndex) => (
              <KnowledgeBlock
                key={`${block.id || 'block'}-${blockIndex}`}
                block={block}
              />
            ))}

            <KnowledgeSections
              sections={children}
              parentPath={path}
              parentNumber={number}
            />
          </article>
        );
      })}
    </div>
  );
}

function DetailSection({
  title,
  children,
  inset = false,
}) {
  return (
    <section className="other-section">
      <h2 className="other-section-title">
        {title}
      </h2>

      <div className={inset ? 'other-inset' : undefined}>
        {children}
      </div>
    </section>
  );
}

export default function OtherDetailPage({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  const rootRef = useRef(null);

  if (!item) return null;

  const name = asText(item.name).trim() || '未命名';

  const englishName = getFieldValue(
    item,
    'englishName'
  ).trim();

  const type = getFieldValue(item, 'type').trim();

  const categoryLabel = getCategoryLabel(
    item.category
  );

  const fields = DETAIL_FIELDS
    .map(([key, label]) => ({
      key,
      label,
      value: getFieldValue(item, key),
    }))
    .filter((field) => field.value.trim());

  const description = asText(item.description).trim();

  const introduction = asText(
    item.knowledgeDetails?.introduction
  ).trim();

  const sections = normalizeSections(
    item.knowledgeDetails?.sections
  );

  const note = asText(item.note).trim();

  const caution = firstText(
    item.caution,
    item.contraindication
  ).trim();

  const tocItems = buildKnowledgeToc(sections);

  const hasReadingContent = Boolean(
    introduction ||
    sections.length ||
    note ||
    caution
  );

  const scrollToSection = (id) => {
    const element = rootRef.current
      ? Array.from(
          rootRef.current.querySelectorAll(
            '.other-knowledge[id]'
          )
        ).find((node) => node.id === id)
      : null;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    element.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="other-detail" ref={rootRef}>
      <style>{OTHER_DETAIL_STYLES}</style>

      <header className="other-header">
        <div className="other-header-inner">
          <div className="other-header-text">
            <p className="other-eyebrow">
              本草百科 / GLOSSARY & MATERIAL
            </p>

            <h1 className="other-header-name">
              {name}
            </h1>
          </div>

          <button
            type="button"
            className="other-back"
            onClick={() => {
              if (typeof onClose === 'function') {
                onClose();
              }
            }}
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

      <main className="other-scroll">
        <div className="other-layout">
          <aside className="other-panel other-overview">
            <div className="other-identity">
              <div className="other-tags">
                <span className="other-tag">
                  {categoryLabel}
                </span>

                {type && type !== categoryLabel && (
                  <span className="other-tag">
                    {type}
                  </span>
                )}
              </div>

              <h2
                className="other-name"
                style={TITLE_FONT}
              >
                {name}
              </h2>

              {englishName && (
                <p className="other-english">
                  {englishName}
                </p>
              )}
            </div>

            <div className="other-overview-body">
              {fields.length > 0 && (
                <dl className="other-facts">
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="other-fact"
                    >
                      <dt>{field.label}</dt>

                      <dd>
                        <FormattedText
                          value={field.value}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {description && (
                <section className="other-summary">
                  <h3 className="other-small-title">
                    簡介
                  </h3>

                  <FormattedText value={description} />
                </section>
              )}

              {tocItems.length > 0 && (
                <nav
                  className="other-toc"
                  aria-label="內容目錄"
                >
                  <div className="other-toc-head">
                    <h3 className="other-small-title">
                      內容目錄
                    </h3>

                    <span className="other-toc-count">
                      {tocItems.length} 個章節
                    </span>
                  </div>

                  <div className="other-toc-list">
                    {tocItems.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="other-toc-link"
                        style={{
                          paddingLeft:
                            10 + Math.min(entry.level, 4) * 12,
                        }}
                        onClick={() =>
                          scrollToSection(entry.id)
                        }
                      >
                        <span className="other-toc-number">
                          {entry.number}
                        </span>

                        <span className="other-toc-label">
                          {entry.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </nav>
              )}
            </div>
          </aside>

          <div className="other-panel other-reading">
            {introduction && (
              <DetailSection title="詳細介紹" inset>
                <FormattedText value={introduction} />
              </DetailSection>
            )}

            {sections.length > 0 && (
              <DetailSection title="內容架構">
                <KnowledgeSections sections={sections} />
              </DetailSection>
            )}

            {note && (
              <DetailSection title="補充說明" inset>
                <FormattedText value={note} />
              </DetailSection>
            )}

            {caution && (
              <DetailSection title="注意事項">
                <div className="other-alert">
                  <FormattedText value={caution} />
                </div>
              </DetailSection>
            )}

            {!hasReadingContent && (
              <div className="other-empty-state">
                <h2 className="other-small-title">
                  {description || fields.length
                    ? '基本資料已列於資料卡'
                    : '尚無詳細內容'}
                </h2>

                <p className="other-empty">
                  此項目目前尚未補充詳細介紹或章節內容。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}