import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const parseBoldSyntax = (str) => {
  if (!str) return str;
  const lineStartRegex = /^(肌肉|神經|血管)([：:])/;
  const parts = str.split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <mark key={i} className="bg-[#F3E1C5] text-[#2C3C30] px-1 py-0.5 rounded-md font-bold mx-0.5 shadow-sm">
          {part.slice(2, -2)}
        </mark>
      );
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
  text: "text-[15px] leading-8 text-[#6B7A6E]",
  title: "text-4xl font-bold text-[#2F4638] mb-2",
  sectionLabel: "font-bold text-[#4E6654] block pb-1 mb-2 text-sm tracking-widest uppercase"
};

export default function FormulaModal({ item, onClose }) {
  if (!item) return null;

  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    const lines = typeof text === 'string' ? text.split('\n').filter(l => l.trim() !== '') : [text];

    return (
      <div className={UI.text}>
        {lines.map((line, i) => {
          const trimmed = typeof line === 'string' ? line.trim() : line;
          const isTable = typeof trimmed === 'string' && trimmed.includes('|');

          if (isTable) {
            return (
              <div key={i} className="my-2 overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {trimmed}
                </ReactMarkdown>
              </div>
            );
          }

          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = trimmed.startsWith('●');

          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            return (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2 mb-1">
                <span className="font-bold shrink-0 text-[#3A4F3F]">{trimmed.substring(0, splitIndex)}</span>
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

  const alertContent = item.alert || (['中藥', '方劑', '穴道'].includes(item.category)
    ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非專業人士請勿擅自處方服藥。"
    : "");

  const fields = [
    { label: '製法用量', val: item.preparation },
    { label: '主治', val: item.indications },
    { label: '文獻別錄', val: item.literature },
    { label: '方義分析', val: item.analysis },
    { label: '方論', val: item.discussion },
    { label: '辨證要點', val: item.syndrome },
    { label: '加減變化', val: item.modifications },
    { label: '注意禁忌', val: item.contraindication },
    { label: '現代應用', val: item.modernApp },
    { label: '現代藥理', val: item.modernpharmacolog },
    { label: '附方', val: item.prescription }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/70 p-8 rounded-[1.6rem] shadow-[0_10px_30px_rgba(63,81,68,0.06)] backdrop-blur-md sticky top-8">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {item.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3E1C5] text-[#2C3C30]">
                  {item.category}
                </span>
              )}
              {item.tag && item.tag !== item.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F7F5F0] text-[#6B7A6E]">
                  {item.tag}
                </span>
              )}
            </div>

            <h2 className={UI.title}>{item.name}</h2>

            <div className="space-y-4 text-sm text-[#6B7A6E] pt-6">
              <p><strong className="text-[#3A4F3F]">別名：</strong> {item.alias || '無別名'}</p>
              <p><strong className="text-[#3A4F3F]">來源：</strong> {item.source || '無記載'}</p>
              <p><strong className="text-[#3A4F3F]">功效：</strong> {item.effect || '無記載'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/70 p-8 md:p-10 rounded-[1.6rem] shadow-[0_10px_30px_rgba(63,81,68,0.06)] backdrop-blur-md">
            <div className="space-y-8">
              {fields.map((field, i) => (
                <div key={i}>
                  <h4 className={UI.sectionLabel}>{field.label}</h4>
                  {renderFormattedText(field.val)}
                </div>
              ))}
            </div>

            {alertContent && (
              <div className="mt-12 p-5 bg-red-50/80 rounded-[1rem] text-red-700 text-xs font-medium">
                <strong>⚠️ 重要提醒：</strong> {alertContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}