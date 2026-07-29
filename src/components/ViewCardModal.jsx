import React, { memo, useMemo } from 'react';

const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  const boldKeywords = ['肌肉', '神經', '血管'];
  const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map((line, lineIndex) => (
    <span key={lineIndex} className="block mb-1">
      {line.split(regex).map((part, i) => {
        if (!part) return null;

        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <mark key={i} className="bg-[#F3E1C5] px-1 rounded font-bold text-[#2F4638]">
              {part.slice(2, -2)}
            </mark>
          );
        }

        if ((part.startsWith('**') && part.endsWith('**')) || boldKeywords.includes(part)) {
          return (
            <strong key={i} className="text-[#3A4F3F] font-bold">
              {part.replace(/\*\*/g, '')}
            </strong>
          );
        }

        if (part.match(/^[【《\(].*[】》\)]$/)) {
          return (
            <span key={i} className="font-bold text-[#3A4F3F]">
              {part}
            </span>
          );
        }

        return part;
      })}
    </span>
  ));
};

function ViewCardModal({ item, onClose }) {
  const tags = useMemo(
    () => [item?.tag, item?.constitutionTag, item?.chemicalTag, item?.acuTable?.meridian].filter(Boolean),
    [item]
  );

  if (!item) return null;

  return (
    <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
      <div className="relative max-h-[85vh] overflow-y-auto rounded-[1.75rem] border border-[#E5E0D8] bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)] shadow-[0_12px_35px_rgba(122,106,90,0.08)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 text-[#A39284] hover:text-[#3A4F3F] transition-colors font-bold text-lg"
        >
          ✕
        </button>

        <div className="p-6 md:p-7">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#3A4F3F]">
              {item.category}
            </span>

            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full border border-[#E7DED4] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#7C8A80]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-2xl md:text-[1.7rem] font-black tracking-tight text-[#2F4638]">
            {item.name}
          </h3>

          <p className="mt-2 mb-4 text-sm italic text-[#A39284] font-serif">
            {item.category === '精油' ? item.englishName : (item.acuTable?.code || '')}
          </p>

          <div className="text-sm leading-7 text-[#5F6F65] border-t border-[#EEE6DC] pt-5">
            {parseBoldSyntax(item.description || item.effect || '尚無詳細內容。')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ViewCardModal);