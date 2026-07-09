import React from 'react';

// 🟢 集中管理樣式：與其他 Modal 保持同步
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

export default function HerbModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 精簡排版引擎：移除強制分段，確保內容靈活顯示
  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    return <div className={`break-words ${UI.text}`}>{parseBoldSyntax(text)}</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        
        <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-[#6B7A6E]">
            {/* 🟢 新增：顯示別名 */}
            <p className="col-span-2"><strong>別名：</strong> {item.alias || '無記載'}</p>
            <p><strong>科屬：</strong> {item.family || '無記載'}</p>
            <p><strong>類別：</strong> {item.category || '無記載'}</p>
            <p className="col-span-2"><strong>性味歸經：</strong> {item.nature || '無記載'}</p>
          </div>
        </div>

        <div className="space-y-6 text-[#3A4F3F]">
          {[
            { label: '品種來源', val: item.source },
            { label: '功效', val: item.effect },
            { label: '主治', val: item.indications },
            { label: '文獻別錄', val: item.literature },
            { label: '用法用量', val: item.dosage },
            { label: '注意禁忌', val: item.contraindication },
            { label: '現代藥理', val: item.pharmacology },
            { label: '註', val: item.note }
          ].map((field, i) => (
            <div key={i}>
              <h4 className={UI.sectionLabel}>{field.label}</h4>
              {renderFormattedText(field.val)}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">關閉</button>
        </div>
      </div>
    </div>
  );
}