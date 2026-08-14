import React, {
  memo,
  useMemo,
} from 'react';

const getCategoryLabel = (category) =>
  category === '其他'
    ? '名詞材料'
    : category;

const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  const boldKeywords = [
    '肌肉',
    '神經',
    '血管',
  ];

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str
    .split('\n')
    .map((line, lineIndex) => (
      <span
        key={lineIndex}
        className="mb-1 block"
      >
        {line.split(regex).map(
          (part, index) => {
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
                  className="rounded bg-[#F3E1C5] px-1 font-bold text-[#2F4638]"
                >
                  {part.slice(2, -2)}
                </mark>
              );
            }

            if (
              (part.startsWith('**') &&
                part.endsWith('**')) ||
              boldKeywords.includes(part)
            ) {
              return (
                <strong
                  key={index}
                  className="font-bold text-[#3A4F3F]"
                >
                  {part.replace(/\*\*/g, '')}
                </strong>
              );
            }

            if (
              /^[【《\(].*[】》\)]$/.test(part)
            ) {
              return (
                <span
                  key={index}
                  className="font-bold text-[#3A4F3F]"
                >
                  {part}
                </span>
              );
            }

            return part;
          }
        )}
      </span>
    ));
};

function ViewCardModal({
  item,
  onClose,
}) {
  const tags = useMemo(() => {
  if (!item) {
    return [];
  }

  return [
    item.tag || item.type,
    item.constitutionTag,
    item.chemicalTag,
    item.acuTable?.meridian,
  ].filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
  );
}, [item]);

  if (!item) {
    return null;
  }

  const categoryDisplay =
  getCategoryLabel(item.category);
  return (
    <div
      className="relative w-full max-w-lg"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <div className="relative max-h-[85vh] overflow-y-auto rounded-[1.75rem] border border-[#E5E0D8] bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)] shadow-[0_12px_35px_rgba(122,106,90,0.08)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-lg font-bold text-[#A39284] transition-colors hover:text-[#3A4F3F]"
        >
          ✕
        </button>

        <div className="p-6 md:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
  <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[13px] font-semibold tracking-wider text-[#3A4F3F]">
    {getCategoryLabel(item.category)}
  </span>

  {tags.map((tag, index) => (
    <span
      key={`${tag}-${index}`}
      className="rounded-full border border-[#E7DED4] bg-white/80 px-3 py-1 text-[13px] font-medium text-[#7C8A80]"
    >
      {tag}
    </span>
  ))}
</div>

          <h3 className="text-[28px] font-black leading-tight tracking-tight text-[#2F4638] md:text-[32px]">
            {item.name}
          </h3>

          {(item.category === '精油' ||
            item.category === '其他') && (
            <p className="mb-4 mt-2 font-serif text-[16px] italic text-[#A39284]">
              {item.category === '精油'
                ? item.englishName || ''
                : item.alias ||
                  item.englishName ||
                  ''}
            </p>
          )}

          {item.category === '穴道' &&
            item.acuTable?.code && (
              <p className="mb-4 mt-2 font-serif text-[16px] italic text-[#A39284]">
                {item.acuTable.code}
              </p>
            )}

          {(item.description ||
            item.effect ||
            item.indications) && (
            <div className="border-t border-[#EEE6DC] pt-5 text-[17px] leading-9 text-[#5F6F65]">
              {parseBoldSyntax(
                item.description ||
                  item.effect ||
                  item.indications
              )}
            </div>
          )}

          {!item.description &&
            !item.effect &&
            !item.indications && (
              <div className="border-t border-[#EEE6DC] pt-5 text-[16px] italic text-[#A39284]">
                尚無詳細內容。
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default memo(ViewCardModal);