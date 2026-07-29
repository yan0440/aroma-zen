import React, { useEffect, useRef, useState } from 'react';

const parseBoldSyntax = (str) => {
  if (!str) return str;
  const lineStartRegex = /^(肌肉|神經|血管)([：:])/;
  const parts = str.split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('==') && part.endsWith('==')) {
      return <mark key={i} className="bg-[#F3E1C5] text-[#2C3C30] px-1 py-0.5 rounded-md font-bold mx-0.5 shadow-sm">{part.slice(2, -2)}</mark>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith('《') && part.endsWith('》')) || (part.startsWith('【') && part.endsWith('】'))) {
      return <strong key={i} className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{part}</strong>;
    }
    if (lineStartRegex.test(part)) {
      return part.replace(lineStartRegex, (match, keyword, colon) => (
        <React.Fragment key={i}>
          <strong className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{keyword}</strong>{colon}
        </React.Fragment>
      ));
    }
    return part;
  });
};

const UI = {
  text: "text-[15px] leading-8 text-[#55655B]",
  title: "text-4xl font-bold text-[#2F4638] mb-2",
  sectionLabel: "font-bold text-[#4E6654] block pb-1 mb-2 text-sm tracking-[0.18em] uppercase"
};

const AutoHeightTextarea = ({ value, className = "" }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = '0px';
    setHeight(`${ref.current.scrollHeight}px`);
  }, [value]);

  return (
    <textarea
      ref={ref}
      readOnly
      value={value || '此項目目前尚未填寫簡介。'}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-[15px] leading-8 text-[#55655B] outline-none focus:outline-none focus:ring-0 whitespace-pre-wrap ${className}`}
      style={{ height }}
    />
  );
};

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    const lines = typeof text === 'string' ? text.split('\n').filter(line => line.trim() !== '') : [text];

    return (
      <div className={UI.text}>
        {lines.map((line, i) => {
          const trimmed = typeof line === 'string' ? line.trim() : line;
          const isNumbered = typeof trimmed === 'string' && /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = typeof trimmed === 'string' && trimmed.startsWith('●');

          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            return (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2 mb-1">
                <span className="font-bold shrink-0 text-[#2F4638]">{trimmed.substring(0, splitIndex)}</span>
                <span>{parseBoldSyntax(trimmed.substring(splitIndex).trim())}</span>
              </div>
            );
          }

          if (isIndented) {
            return (
              <div key={i} className="grid grid-cols-[1rem_1fr] gap-x-2 mb-1">
                <span className="text-[#A39284]">●</span>
                <span>{parseBoldSyntax(trimmed.replace('●', '').trim())}</span>
              </div>
            );
          }

          return <div key={i} className="mb-1">{parseBoldSyntax(trimmed)}</div>;
        })}
      </div>
    );
  };

  const rows = [
    { label: '別名', val: item.alias || item.oilDetails?.alias },
    { label: '植物種類／萃取部位', val: item.typePart || item.oilDetails?.typePart },
    { label: '方法', val: item.method || item.oilDetails?.method },
    { label: '學名', val: item.latin || item.oilDetails?.latin },
    { label: '科名', val: item.family || item.oilDetails?.family },
    { label: '性味', val: item.oilDetails?.nature },
    { label: '五行', val: item.oilDetails?.property },
    { label: '歸經', val: item.oilDetails?.meridian },
    { label: '主治', val: item.oilDetails?.indications },
    { label: '音符', val: item.oilDetails?.noteAnalogy },
    { label: '星球', val: item.oilDetails?.planet },
    { label: '產地', val: item.oilDetails?.origin }
  ];

  return (
    <div className="w-full h-auto py-8 bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/70 p-8 rounded-[1.6rem] shadow-[0_10px_30px_rgba(63,81,68,0.06)] backdrop-blur-md sticky top-8">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#EAE7E0] text-[#6B7A6E]">
                {item.constitutionTag || item.oilDetails?.constitutionTag || "無"}體質
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E5EAE6] text-[#4E6654]">
                {item.chemicalTag || item.oilDetails?.chemicalTag || "無"}屬性
              </span>
            </div>

            <h2 className={UI.title}>{item.name}</h2>
            <p className="text-base italic text-[#A39284] mt-1 mb-6 font-serif border-b border-[#F7F5F0] pb-4">
              {item.englishName}
            </p>

            <div className="overflow-hidden rounded-[1rem] shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
              <table className="w-full text-[14px] border-collapse">
                <tbody className="divide-y divide-[#EAE4DB] text-[#3A4F3F]">
                  {rows.map((row, i) => (
                    <tr key={i} className="bg-[#FBFBFA]/50">
                      <td className="px-3 py-2 font-bold bg-[#FBFBFA] w-[35%] text-[#3A4F3F]">
                        {row.label}
                      </td>
                      <td className="px-3 py-2">
                        {renderFormattedText(row.val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-[#2F4638] mb-2">簡介</h3>
              <AutoHeightTextarea value={item.description || item.oilDetails?.description} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/70 p-8 md:p-10 rounded-[1.6rem] shadow-[0_10px_30px_rgba(63,81,68,0.06)] backdrop-blur-md">
            <div className="space-y-8 text-[#3A4F3F]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className={UI.sectionLabel}>🔍 氣味</span>
                  {renderFormattedText(item.oilDetails?.scent)}
                </div>
                <div>
                  <span className={UI.sectionLabel}>✨ 外觀</span>
                  {renderFormattedText(item.oilDetails?.appearance)}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#4E6654] block mb-2 text-base">📜 應用歷史與相關神話</span>
                <div className="bg-[#F7F5F0]/45 p-5 rounded-[1rem]">
                  {renderFormattedText(item.oilDetails?.historyMyth)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className={UI.sectionLabel}>🔬 化學結構</span>
                  {renderFormattedText(item.oilDetails?.chemistry)}
                </div>
                <div>
                  <span className={UI.sectionLabel}>⚖️ 屬性補充</span>
                  {renderFormattedText(item.oilDetails?.attribute)}
                </div>
              </div>

              {item.oilDetails?.caution && (
                <div className="bg-red-50/70 p-5 rounded-[1rem]">
                  <span className="font-bold text-red-800 text-sm block mb-2">⚠️ 注意事項</span>
                  {renderFormattedText(item.oilDetails?.caution)}
                </div>
              )}

              <div className="space-y-6 pt-4">
                <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-2">
                  🩺 深度療效
                </span>

                <div className="space-y-4">
                  {[
                    { t: "心靈療效", v: item.oilDetails?.mindEffect, icon: "🧠" },
                    { t: "身體療效", v: item.oilDetails?.bodyEffect, icon: "💪" },
                    { t: "皮膚療效", v: item.oilDetails?.skinEffect, icon: "🧴" }
                  ].map((ef, i) => (
                    <div key={i} className="flex gap-4 border-b border-[#F7F5F0] pb-4 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-24 pt-1">
                        <div className="flex items-center gap-2 text-[#4E6654] font-bold text-sm">
                          <span>{ef.icon}</span>
                          {ef.t}
                        </div>
                      </div>
                      <div className="flex-grow text-[14px] leading-7 text-[#55655B]">
                        {renderFormattedText(ef.v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6">
                <div>
                  <span className={UI.sectionLabel}>🔗 適合調和的精油</span>
                  {renderFormattedText(item.oilDetails?.blendingOils)}
                </div>
                <div>
                  <span className={UI.sectionLabel}>🧪 精油配方</span>
                  {renderFormattedText(item.oilDetails?.formulas)}
                </div>
                <div>
                  <span className={UI.sectionLabel}>🧴 按摩基底油</span>
                  {renderFormattedText(item.oilDetails?.carrierOil)}
                </div>
                <div>
                  <span className={UI.sectionLabel}>🚀 使用方法</span>
                  {renderFormattedText(item.oilDetails?.usage)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}