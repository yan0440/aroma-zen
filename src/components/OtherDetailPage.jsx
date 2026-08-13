import React from 'react';

const getCategoryLabel = (category) =>
  category === '其他'
    ? '名詞／用品'
    : category;

const detailFields = [
  ['alias', '🏷️ 別名'],
  ['englishName', '🌐 英文名稱'],
  ['type', '🗂️ 類型'],
  ['tag', '🔖 核心標籤'],
];

const UI = {
  text: 'text-[15px] leading-8 text-[#55655B]',

  sectionLabel:
    'mb-3 mt-4 flex items-center gap-3 border-b border-[#E5E0D8] pb-2 text-base font-bold uppercase tracking-[0.18em] text-[#4E6654] before:block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[#6B9080]',
};

const getFieldValue = (item, key) => {
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
};

const parseBoldSyntax = (str) => {
  if (!str) {
    return null;
  }

  const parts = String(str).split(
    /(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g
  );

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (
      part.startsWith('==') &&
      part.endsWith('==')
    ) {
      return (
        <mark
          key={index}
          className="mx-0.5 rounded-md bg-[#F3E1C5] px-1 py-0.5 font-bold text-[#2C3C30] shadow-sm"
        >
          {part.slice(2, -2)}
        </mark>
      );
    }

    if (
      part.startsWith('**') &&
      part.endsWith('**')
    ) {
      return (
        <strong
          key={index}
          className="font-bold text-[#1A261C]"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      (part.startsWith('《') &&
        part.endsWith('》')) ||
      (part.startsWith('【') &&
        part.endsWith('】'))
    ) {
      return (
        <strong
          key={index}
          className="font-bold text-[#1A261C]"
        >
          {part}
        </strong>
      );
    }

    return part;
  });
};

const renderFormattedText = (text) => {
  if (
    text === undefined ||
    text === null ||
    String(text).trim() === ''
  ) {
    return (
      <span className="italic text-gray-400">
        無記載
      </span>
    );
  }

  const lines =
    typeof text === 'string'
      ? text
          .split('\n')
          .filter(
            (line) => line.trim() !== ''
          )
      : [text];

  return (
    <div className={UI.text}>
      {lines.map((line, index) => (
        <div
          key={index}
          className="mb-1"
        >
          {parseBoldSyntax(
            typeof line === 'string'
              ? line.trim()
              : line
          )}
        </div>
      ))}
    </div>
  );
};

const normalizeSections = (sections) => {
  if (!sections) {
    return [];
  }

  if (Array.isArray(sections)) {
    return sections;
  }

  if (
    typeof sections === 'object'
  ) {
    return Object.values(sections);
  }

  return [];
};

const normalizeBlocks = (section) => {
  if (
    Array.isArray(section?.blocks)
  ) {
    return section.blocks;
  }

  if (
    section?.text &&
    String(section.text).trim() !== ''
  ) {
    return [
      {
        id: `legacy_text_${Date.now()}`,
        type: 'text',
        text: section.text,
      },
    ];
  }

  return [];
};

const renderTableBlock = (
  block,
  blockIndex
) => {
  const rows = Array.isArray(block?.rows)
    ? block.rows
    : [];

  if (rows.length === 0) {
    return (
      <div
        key={
          block?.id ||
          `table-${blockIndex}`
        }
        className="rounded-xl border border-[#E7DED4] bg-[#FBF9F6] p-4 text-sm text-[#A39284]"
      >
        目前沒有表格內容。
      </div>
    );
  }

  return (
    <div
      key={
        block?.id ||
        `table-${blockIndex}`
      }
      className="my-4 overflow-x-auto rounded-xl border border-[#E7DED4] bg-white"
    >
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={
                row?.id ||
                `table-row-${blockIndex}-${rowIndex}`
              }
              className="border-b border-[#E7DED4] last:border-b-0"
            >
              <td className="w-[32%] bg-[#F7F5F0] px-4 py-3 align-top font-bold text-[#3A4F3F]">
                {row?.left || '—'}
              </td>

              <td className="px-4 py-3 align-top text-[#55655B]">
                {row?.right ? (
                  renderFormattedText(row.right)
                ) : (
                  <span className="italic text-gray-400">
                    無記載
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderKnowledgeBlock = (
  block,
  blockIndex
) => {
  if (!block) {
    return null;
  }

  const blockType =
    block.type || 'text';

  if (blockType === 'table') {
    return renderTableBlock(
      block,
      blockIndex
    );
  }

  if (blockType === 'subtitle') {
    return (
      <h4
        key={
          block.id ||
          `subtitle-${blockIndex}`
        }
        className="mb-3 mt-5 border-l-4 border-[#6B9080] pl-3 text-lg font-bold text-[#2F4638]"
      >
        {block.text || '未命名副標題'}
      </h4>
    );
  }

  return (
    <div
      key={
        block.id ||
        `text-${blockIndex}`
      }
      className="mb-4"
    >
      {renderFormattedText(
        block.text ||
          block.content ||
          block.description ||
          ''
      )}
    </div>
  );
};

const renderKnowledgeSections = (
  sections,
  level = 0
) => {
  const sectionList =
    normalizeSections(sections);

  if (sectionList.length === 0) {
    return null;
  }

  return (
    <div
      className={
        level > 0
          ? 'ml-4 border-l-2 border-[#E8E0D6] pl-4 md:ml-6 md:pl-6'
          : 'space-y-5'
      }
    >
      {sectionList.map((section, index) => {
        if (!section) {
          return null;
        }

        const title =
          section.title ||
          section.name ||
          `第 ${index + 1} 節`;

        const blocks =
          normalizeBlocks(section);

        const children =
          normalizeSections(
            section.children
          );

        return (
          <article
            key={
              section.id ||
              `${title}-${index}`
            }
            className="rounded-2xl border border-[#E7DED4] bg-[#FDFBF8] p-5"
          >
            <h3
              className={`mb-4 font-bold text-[#2F4638] ${
                level === 0
                  ? 'text-lg'
                  : 'text-base'
              }`}
            >
              {title}
            </h3>

            {blocks.length > 0 && (
              <div className="space-y-4">
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
              <div className="mt-5">
                {renderKnowledgeSections(
                  children,
                  level + 1
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

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
    .filter(
      (field) =>
        field.value !== undefined &&
        field.value !== null &&
        String(field.value).trim() !== ''
    );

  const tags = [
    item.tag,
    item.alias,
  ]
    .filter(Boolean)
    .flatMap((value) =>
      String(value)
        .split(/[、,，/／]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    );

  const knowledgeSections =
    item?.knowledgeDetails?.sections ||[];
const knowledgeIntroduction =
  item?.knowledgeDetails?.introduction || '';
  const hasKnowledgeSections =
    normalizeSections(knowledgeSections)
      .length > 0;

  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-full flex-col overflow-hidden bg-[#F4EFE7] text-[#3A4F3F]">
      <header className="shrink-0 border-b border-[#D8C8B8] bg-[#FFFCF8] shadow-[0_4px_18px_rgba(96,116,102,0.12)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl leading-none md:text-3xl">
              📖
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B9080]">
                Glossary / Material
              </p>

              <h1 className="truncate text-lg font-black text-[#718678] md:text-xl">
                {item.name}
              </h1>

              <p className="hidden text-xs text-[#8C725F] sm:block">
                {getCategoryLabel(item.category)}
                百科詳細資料
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg border border-[#B2B2A8] bg-[#B2B2A8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5F7568]"
          >
            {backLabel}
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)]">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 md:px-7 md:py-8 lg:grid-cols-12 lg:gap-8 lg:px-10">
          <section className="lg:col-span-4">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-8 lg:sticky lg:top-6">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#EAE7E0] px-2 py-0.5 text-xs font-medium text-[#6B7A6E]">
                  {getCategoryLabel(item.category)}
                </span>

                {item.type && (
                  <span className="rounded-full bg-[#E5EAE6] px-2 py-0.5 text-xs font-medium text-[#4E6654]">
                    {item.type}
                  </span>
                )}
              </div>

              <h2 className="mb-2 text-3xl font-bold text-[#2F4638] md:text-4xl">
                {item.name}
              </h2>

              {(item.alias ||
                item.englishName) && (
                <p className="mb-6 mt-1 border-b border-[#F0E8DE] pb-4 font-serif text-base italic text-[#A39284]">
                  {item.alias ||
                    item.englishName}
                </p>
              )}

              {tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-[#E7DED4] bg-[#F9F7F3] px-3 py-1 text-xs text-[#6B9080]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-[#EAE4DB] shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                <table className="w-full border-collapse text-[14px]">
                  <tbody className="divide-y divide-[#EAE4DB] text-[#3A4F3F]">
                    {fields
                      .slice(0, 6)
                      .map((field) => (
                        <tr
                          key={field.key}
                          className="bg-[#FBFBFA]/60"
                        >
                          <td className="w-[35%] bg-[#FBFBFA] px-3 py-2 font-bold text-[#3A4F3F]">
                            {field.label}
                          </td>

                          <td className="px-3 py-2">
                            {renderFormattedText(
                              field.value
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-xl font-bold text-[#2F4638]">
                  簡介
                </h3>

                <div className="text-[15px] leading-8 text-[#55655B]">
                  {renderFormattedText(
                    item.description
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-10">
              <div className="space-y-8 text-[#3A4F3F]">
                {fields.length > 6 && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {fields
                      .slice(6)
                      .map((field) => (
                        <div key={field.key}>
                          <span className={UI.sectionLabel}>
                            {field.label}
                          </span>

                          {renderFormattedText(
                            field.value
                          )}
                        </div>
                      ))}
                  </div>
                )}

{knowledgeIntroduction && (
  <section>
    <span className={UI.sectionLabel}>
      📖 詳細介紹
    </span>

    <div className="rounded-xl bg-[#F7F5F0]/60 p-5">
      {renderFormattedText(
        knowledgeIntroduction
      )}
    </div>
  </section>
)}

                {hasKnowledgeSections && (
                  <section>
                    <span className={UI.sectionLabel}>
                      📚 內容架構
                    </span>

                    <div className="space-y-5">
                      {renderKnowledgeSections(
                        knowledgeSections
                      )}
                    </div>
                  </section>
                )}

                {item.note && (
                  <div>
                    <span className={UI.sectionLabel}>
                      💡 補充說明
                    </span>

                    <div className="rounded-xl bg-[#F7F5F0]/60 p-5">
                      {renderFormattedText(
                        item.note
                      )}
                    </div>
                  </div>
                )}

                {(item.caution ||
                  item.contraindication) && (
                  <div className="rounded-xl bg-red-50/70 p-5">
                    <span className="mb-2 block text-sm font-bold text-red-800">
                      ⚠️ 注意事項
                    </span>

                    {renderFormattedText(
                      item.caution ||
                        item.contraindication
                    )}
                  </div>
                )}

                {!hasKnowledgeSections &&
                  !item.description &&
                  fields.length === 0 && (
                    <div className="rounded-xl bg-[#F7F5F0]/60 p-5 text-[15px] leading-8 text-[#55655B]">
                      此項目目前尚未填寫詳細內容。
                    </div>
                  )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}