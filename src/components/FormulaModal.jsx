import React from 'react';

// 🟢 集中管理樣式：與 HerbModal 保持同步
const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-4",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
  marker: "shrink-0 font-bold w-4 text-[13px] pr-7 select-none text-[#6B7A6E]"
};

// 輔助函式：處理粗體語法
const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  const parts = str.split(/(\*\*.*?\*\*|==.*?==)/g);
  return parts.map((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) return <mark key={i} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-[#3A4F3F]">{part.slice(2, -2)}</strong>;
    return part;
  });
};

export default function FormulaModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 嚴格對齊版排版引擎
  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    const lines = String(text).split(/\n/);
    
    return lines.filter(line => line.trim() !== '').map((line, index) => {
      const trimmed = line.trim();
      const listMatch = trimmed.match(/^((?:\d+|[一二三四五六七八九十A-Za-z]+)[.、)]|[\u2460-\u2473]|[-•*‣▪])\s*/);
      
      if (listMatch) {
        const marker = listMatch[1];
        const content = trimmed.substring(listMatch[0].length);
        return (
          <div key={index} className={`flex items-start mb-1 ${UI.text}`}>
            <span className={UI.marker}>{marker}</span>
            <div className="flex-1 break-words">{parseBoldSyntax(content)}</div>
          </div>
        );
      }
      return <div key={index} className={`${UI.text} mb-1`}>{parseBoldSyntax(trimmed)}</div>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center mb-4">
          <button onClick={onClose} className="text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        </div>

        <h2 className={UI.title}>{item.name}</h2>

        <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-6">
          <div className="text-sm text-[#6B7A6E] space-y-2">
            <p><strong>來源：</strong> {item.source || '無記載'}</p>
            <p><strong>功效：</strong> {item.effect || '無記載'}</p>
          </div>
        </div>

        <div className="space-y-6 text-[#3A4F3F]">
          {[
            { label: '製法用量', val: item.preparation },
            { label: '主治', val: item.indications },
            { label: '方義分析', val: item.analysis },
            { label: '方論', val: item.discussion },
            { label: '辨證要點', val: item.syndrome },
            { label: '加減變化', val: item.modifications },
            { label: '注意禁忌', val: item.contraindication },
            { label: '現代應用', val: item.modernApp }
          ].map((field, i) => (
            <div key={i}>
              <h4 className={UI.sectionLabel}>{field.label}</h4>
              {renderFormattedText(field.val)}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">
            關閉並返回列表
          </button>
        </div>
      </div>
    </div>
  );
}