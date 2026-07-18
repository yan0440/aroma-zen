import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- 格式化核心邏輯 (新增此段以解決 ReferenceError) ---
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
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-2",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{trimmed}</ReactMarkdown>
              </div>
            );
          }

          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = trimmed.startsWith('●');

          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            return (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2 mb-1">
                <span className="font-bold shrink-0">{trimmed.substring(0, splitIndex)}</span>
                <span>{parseBoldSyntax(trimmed.substring(splitIndex).trim())}</span>
              </div>
            );
          }
          if (isIndented) {
            return (
              <div key={i} className="grid grid-cols-[1.5rem_1fr] mb-1">
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

  const alertContent = item.alert || (['中藥', '方劑', '穴道'].includes(item.category) ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非專業人士請勿擅自處方服藥。" : "");

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto mb-6" />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E0D8]/60 sticky top-8">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {item.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F3E1C5] text-[#2C3C30]">
                  {item.category}
                </span>
              )}
              {item.tag && item.tag !== item.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F7F5F0] text-[#6B7A6E]">
                  {item.tag}
                </span>
              )}
            </div>
            <h2 className={UI.title}>{item.name}</h2>
            <div className="space-y-4 text-sm text-[#6B7A6E] border-t border-[#F7F5F0] pt-6">
              <p><strong>來源：</strong> {item.source || '無記載'}</p>
              <p><strong>功效：</strong> {item.effect || '無記載'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#E5E0D8]/60">
            <div className="space-y-8">
              {[
                { label: '製法用量', val: item.preparation },
                { label: '主治', val: item.indications },
                { label: '文獻別錄', val: item.literature },
                { label: '方義分析', val: item.analysis },
                { label: '方論', val: item.discussion },
                { label: '辨證要點', val: item.syndrome },
                { label: '加減變化', val: item.modifications },
                { label: '注意禁忌', val: item.contraindication },
                { label: '現代應用', val: item.modernApp },
                { label: '附方', val: item.prescription }
              ].map((field, i) => (
                <div key={i}>
                  <h4 className={UI.sectionLabel}>{field.label}</h4>
                  {renderFormattedText(field.val)}
                </div>
              ))}
            </div>

            {alertContent && (
              <div className="mt-12 p-5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium">
                <strong>⚠️ 重要提醒：</strong> {alertContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}