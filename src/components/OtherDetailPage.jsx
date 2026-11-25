import React from 'react';

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
    --other-danger-bg: rgba(127, 29, 29, 0.08);
    --other-danger-text: #9b2c2c;

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

  :root[data-app-theme='dark'] .other-detail {
    --other-mark-bg: #4a4430;
    --other-mark-text: #eee0b5;
    --other-danger-bg: rgba(127, 29, 29, 0.22);
    --other-danger-text: #fca5a5;

    color-scheme: dark;
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
    gap: 16px;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 16px 24px;
  }

  .other-detail .other-eyebrow {
    color: var(--other-accent);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    line-height: 1.6;
  }

  .other-detail .other-header-name {
    margin-top: 3px;
    overflow: hidden;
    color: var(--other-text);
    font-size: 35px;
    font-weight: 600;
    line-height: 1.6;
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
    line-height: 1.5;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .other-detail .other-back:hover {
    border-color: var(--other-accent);
    background: var(--other-soft);
  }

  .other-detail .other-back:focus-visible {
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
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .other-detail .other-tag {
    display: inline-flex;
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

  .other-detail .other-code {
    border-color: transparent;
    background: var(--other-selected);
    color: var(--other-selected-text);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
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

  .other-detail .other-alias,
  .other-detail .other-english {
    margin-top: 8px;
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
    grid-template-columns: 108px minmax(0, 1fr);
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
    color: var(--other-text);
    font-size: 14px;
    line-height: 1.9;
  }

  .other-detail .other-summary {
    margin-top: 0;
    border-top: 1px solid var(--other-border);
    padding-top: 24px;
  }

  .other-detail .other-summary-title {
    margin: 0 0 12px;
    color: var(--other-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .other-detail .other-summary-text {
    margin: 0;
    color: var(--other-muted);
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .other-detail .other-toc {
    margin-top: 24px;
    border: 1px solid var(--other-border);
    border-radius: 16px;
    background: var(--other-soft);
    padding: 18px 20px;
  }

  .other-detail .other-toc-title {
    margin: 0 0 12px;
    color: var(--other-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .other-detail .other-toc-select {
    width: 100%;
    border: 1px solid var(--other-border);
    border-radius: 12px;
    background: var(--other-surface);
    color: var(--other-text);
    padding: 11px 14px;
    font-size: 14px;
    outline: none;
  }

  .other-detail .other-toc-select:focus-visible {
    border-color: var(--other-accent);
    outline: 2px solid var(--other-accent);
    outline-offset: 2px;
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
    margin: 0 0 16px;
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

  .other-detail .other-empty {
    color: var(--other-muted);
    font-size: 14px;
    font-style: italic;
    line-height: 1.9;
  }

  .other-detail .other-inset {
    border: 1px solid var(--other-border);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--other-soft);
  }

  .other-detail .other-subtitle {
    margin: 24px 0 12px;
    padding-left: 14px;
    border-left: 4px solid var(--other-accent);
    color: var(--other-text);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.7;
  }

  .other-detail .other-table-wrap {
    margin: 18px 0;
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
    font-size: 14px;
    text-align: left;
  }

  .other-detail .other-table td {
    border-top: 1px solid var(--other-border);
    padding: 13px 16px;
    vertical-align: top;
    color: var(--other-muted);
    line-height: 1.9;
  }

  .other-detail .other-table tr:first-child td {
    border-top: 0;
  }

  .other-detail .other-table-label {
    width: 28%;
    background: var(--other-soft);
    color: var(--other-text);
    font-weight: 600;
  }

  .other-detail .other-knowledge {
    border: 1px solid var(--other-border);
    border-radius: 18px;
    background: var(--other-surface);
    padding: 20px;
  }

  .other-detail .other-knowledge + .other-knowledge {
    margin-top: 18px;
  }

  .other-detail .other-knowledge-title {
    margin: 0 0 12px;
    color: var(--other-text);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
  }

  .other-detail .other-knowledge-children {
    margin-top: 16px;
    padding-left: 16px;
    border-left: 1px solid var(--other-border);
  }

  .other-detail .other-alert {
    margin-top: 28px;
    border: 1px solid rgba(155, 44, 44, 0.22);
    border-radius: 16px;
    background: var(--other-danger-bg);
    padding: 18px 20px;
    color: var(--other-danger-text);
    font-size: 13px;
    line-height: 1.9;
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

    .other-detail .other-overview-body {
      padding: 22px 16px;
    }

    .other-detail .other-reading {
      padding: 4px 22px;
    }

    .other-detail .other-section {
      padding: 24px 0;
    }

    .other-detail .other-inset {
      padding: 16px;
    }

    .other-detail .other-name {
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .other-detail .other-back {
      transition: none;
    }
  }
`;

const getCategoryLabel = (category) =>
  category === '其他'
    ? '名詞材料'
    : category;

const detailFields = [
  ['alias', '別名'],
  ['englishName', '英文名稱'],
  ['type', '類型'],
  ['tag', '核心標籤'],
];

function asText(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join('\n');
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '';
}

function getFieldValue(item, key) {
  const topLevelValue = item?.[key];

  if (
    topLevelValue !== undefined &&
    topLevelValue !== null &&
    String(topLevelValue).trim() !== ''
  ) {
    return topLevelValue;
  }

  const oilValue = item?.oilDetails?.[key];

  if (
    oilValue !== undefined &&
    oilValue !== null &&
    String(oilValue).trim() !== ''
  ) {
    return oilValue;
  }

  const acuValue = item?.acuDetails?.[key];

  if (
    acuValue !== undefined &&
    acuValue !== null &&
    String(acuValue).trim() !== ''
  ) {
    return acuValue;
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
  emptyText = '',
}) {
  const text = asText(value).replace(/\r\n?/g, '\n');

  if (!text.trim()) {
    return emptyText ? (
      <span className="other-empty">
        {emptyText}
      </span>
    ) : null;
  }

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
              className="other-line other-bullet"
            >
              <span className="other-bullet-dot">
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

function normalizeSections(sections) {
  if (!sections) {
    return [];
  }

  if (Array.isArray(sections)) {
    return sections;
  }

  if (typeof sections === 'object') {
    return Object.values(sections);
  }

  return [];
}

function normalizeBlocks(section) {
  if (Array.isArray(section?.blocks)) {
    return section.blocks;
  }

  if (
    section?.text &&
    String(section.text).trim() !== ''
  ) {
    return [
      {
        id: `legacy_text_${section.id || 'section'}`,
        type: 'text',
        text: section.text,
      },
    ];
  }

  return [];
}

function getSectionTitle(section, index) {
  return (
    section?.title ||
    section?.name ||
    `第 ${index + 1} 節`
  );
}

function getSectionId(section, path = []) {
  if (section?.id) {
    return `knowledge-section-${section.id}`;
  }

  return `knowledge-section-${path.join('-')}`;
}

function buildKnowledgeToc(
  sections,
  parentNumber = '',
  parentPath = []
) {
  const sectionList = normalizeSections(sections);

  return sectionList.flatMap((section, index) => {
    if (!section) {
      return [];
    }

    const currentNumber = parentNumber
      ? `${parentNumber}.${index + 1}`
      : `${index + 1}`;

    const currentPath = [...parentPath, index];

    const currentId = getSectionId(
      section,
      currentPath
    );

    const currentItem = {
      id: currentId,
      number: currentNumber,
      title: getSectionTitle(section, index),
      level: parentNumber ? 1 : 0,
    };

    const children = buildKnowledgeToc(
      section.children,
      currentNumber,
      currentPath
    );

    return [
      currentItem,
      ...children,
    ];
  });
}

function renderTableBlock(block, blockIndex) {
  const rows = Array.isArray(block?.rows)
    ? block.rows
    : [];

  if (rows.length === 0) {
    return null;
  }

  return (
    <div
      key={block?.id || `table-${blockIndex}`}
      className="other-table-wrap"
    >
      <div className="other-table-scroll">
        <table className="other-table">
          <tbody>
            {rows.map((row, rowIndex) => {
              const leftValue = asText(row?.left).trim();
              const rightValue = asText(row?.right).trim();

              if (!leftValue && !rightValue) {
                return null;
              }

              return (
                <tr
                  key={
                    row?.id ||
                    `table-row-${blockIndex}-${rowIndex}`
                  }
                >
                  <td className="other-table-label">
                    {leftValue}
                  </td>

                  <td>
                    <FormattedText value={rightValue} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderKnowledgeBlock(block, blockIndex) {
  if (!block) {
    return null;
  }

  const blockType = block.type || 'text';

  if (blockType === 'table') {
    return renderTableBlock(block, blockIndex);
  }

  if (blockType === 'subtitle') {
    const subtitle = asText(
      block.text ||
      block.content ||
      block.description
    ).trim();

    if (!subtitle) {
      return null;
    }

    return (
      <h4
        key={block.id || `subtitle-${blockIndex}`}
        className="other-subtitle"
      >
        {subtitle}
      </h4>
    );
  }

  const text = asText(
    block.text ||
    block.content ||
    block.description
  );

  if (!text.trim()) {
    return null;
  }

  return (
    <div
      key={block.id || `text-${blockIndex}`}
      className="other-line"
    >
      <FormattedText value={text} />
    </div>
  );
}

function renderKnowledgeSections(
  sections,
  level = 0,
  parentPath = []
) {
  const sectionList = normalizeSections(sections);

  if (sectionList.length === 0) {
    return null;
  }

  return (
    <div
      className={
        level > 0
          ? 'other-knowledge-children'
          : ''
      }
    >
      {sectionList.map((section, index) => {
        if (!section) {
          return null;
        }

        const currentPath = [...parentPath, index];

        const title = getSectionTitle(
          section,
          index
        );

        const sectionId = getSectionId(
          section,
          currentPath
        );

        const blocks = normalizeBlocks(section);
        const children = normalizeSections(
          section.children
        );

        return (
          <article
            id={sectionId}
            key={
              section.id ||
              `${title}-${currentPath.join('-')}`
            }
            className="other-knowledge"
          >
            <h3
              className="other-knowledge-title"
              style={
                level === 0
                  ? TITLE_FONT
                  : undefined
              }
            >
              {title}
            </h3>

            {blocks.length > 0 && (
              <div>
                {blocks.map(
                  (block, blockIndex) =>
                    renderKnowledgeBlock(
                      block,
                      blockIndex
                    )
                )}
              </div>
            )}

            {children.length > 0 && (
              <div>
                {renderKnowledgeSections(
                  children,
                  level + 1,
                  currentPath
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function KnowledgeTableOfContents({
  sections,
}) {
  const tocItems = buildKnowledgeToc(sections);

  if (tocItems.length === 0) {
    return null;
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="other-toc">
      <label
        htmlFor="knowledge-section-select"
        className="other-toc-title"
      >
        🧭 內容目錄
      </label>

      <select
        id="knowledge-section-select"
        defaultValue=""
        onChange={(event) => {
          const selectedId = event.target.value;

          if (!selectedId) {
            return;
          }

          scrollToSection(selectedId);

          event.target.value = '';
        }}
        className="other-toc-select"
      >
        <option value="">
          請選擇要閱讀的內容
        </option>

        {tocItems.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {`${item.number}　${item.title}`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function OtherDetailPage({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) {
    return null;
  }

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const fields = detailFields
    .map(([key, label]) => ({
      key,
      label,
      value: getFieldValue(item, key),
    }))
    .filter((field) =>
      asText(field.value).trim()
    );

  const tags = [item.tag, item.alias]
    .filter(Boolean)
    .flatMap((value) =>
      String(value)
        .split(/[、,，/／]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    );

  const knowledgeSections =
    item?.knowledgeDetails?.sections || [];

  const knowledgeIntroduction =
    item?.knowledgeDetails?.introduction || '';

  const hasKnowledgeSections =
    normalizeSections(knowledgeSections).length > 0;

  const hasDescription = asText(
    item?.description
  ).trim();

  const hasNote = asText(item?.note).trim();

  const cautionText = asText(
    item?.caution || item?.contraindication
  ).trim();

  return (
    <div className="other-detail">
      <style>{OTHER_DETAIL_STYLES}</style>

      <header className="other-header">
        <div className="other-header-inner">
          <div className="min-w-0">
            <p className="other-eyebrow">
              本草百科 / GLOSSARY & MATERIAL
            </p>

            <h1 className="other-header-name">
              {item.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="other-back"
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
                  {getCategoryLabel(item.category)}
                </span>

                {item.type && (
                  <span className="other-tag">
                    {item.type}
                  </span>
                )}
              </div>

              <h2
                className="other-name"
                style={TITLE_FONT}
              >
                {item.name}
              </h2>

              {item.alias && (
                <p className="other-alias">
                  {item.alias}
                </p>
              )}

              {item.englishName && (
                <p className="other-english">
                  {item.englishName}
                </p>
              )}
            </div>

            <div className="other-overview-body">
              {tags.length > 0 && (
                <div className="other-tags">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="other-tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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

              {hasDescription && (
                <section className="other-summary">
                  <h3 className="other-summary-title">
                    簡介
                  </h3>

                  <FormattedText
                    value={item.description}
                  />
                </section>
              )}

              {hasKnowledgeSections && (
                <KnowledgeTableOfContents
                  sections={knowledgeSections}
                />
              )}
            </div>
          </aside>

          <div className="other-panel other-reading">
            {knowledgeIntroduction &&
              String(knowledgeIntroduction).trim() !== '' && (
                <section className="other-section">
                  <h3 className="other-section-title">
                    📖 詳細介紹
                  </h3>

                  <div className="other-inset">
                    <FormattedText
                      value={knowledgeIntroduction}
                    />
                  </div>
                </section>
              )}

            {hasKnowledgeSections && (
              <section className="other-section">
                <h3 className="other-section-title">
                  📚 內容架構
                </h3>

                {renderKnowledgeSections(
                  knowledgeSections
                )}
              </section>
            )}

            {hasNote && (
              <section className="other-section">
                <h3 className="other-section-title">
                  💡 補充說明
                </h3>

                <div className="other-inset">
                  <FormattedText value={item.note} />
                </div>
              </section>
            )}

            {cautionText && (
              <section className="other-section">
                <h3 className="other-section-title">
                  ⚠️ 注意事項
                </h3>

                <div className="other-inset">
                  <FormattedText value={cautionText} />
                </div>
              </section>
            )}

            {!hasKnowledgeSections &&
              !knowledgeIntroduction &&
              !hasDescription &&
              !hasNote &&
              !cautionText &&
              fields.length === 0 && (
                <div className="other-empty">
                  此項目目前尚未填寫詳細內容。
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}