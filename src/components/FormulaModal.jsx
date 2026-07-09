import React from 'react';

// 🟢 集中管理樣式：與其他 Modal 保持同步
const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-4",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
  marker: "shrink-0 font-bold w-4 text-[13px] pr-7 select-none text-[#6B7A6E]"
};

// 🟢 同步 App.jsx 的智慧解析邏輯
const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  const boldKeywords = ['肌肉', '神經', '血管'];
  const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map((line, lineIndex) => (
    <span key={lineIndex} className="block mb-1">
      {line.split(regex).map((part, i) => {
        if (!part) return null;
        if (part.startsWith('==') && part.endsWith('==')) 
          return <mark key={i} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
        if ((part.startsWith('**') && part.endsWith('**')) || boldKeywords.includes(part)) 
          return <strong key={i} className="text-[#3A4F3F]">{part.replace(/\*\*/g, '')}</strong>;
        if (part.match(/^[【《\(].*[】》\)]$/)) 
          return <span key={i} className="text-[#6B9080] font-medium">{part}</span>;
        return part;
      })}
    </span>
  ));
};

export default function FormulaModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 排版引擎：處理傳入的文字顯示
  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    return <div className={`break-words ${UI.text}`}>{parseBoldSyntax(text)}</div>;
  };

  const categoryAlerts = {
    '中藥': "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。",
    '方劑': "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。"
  };
  
  const displayAlert = item.alert || categoryAlerts[item.category];

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

        {item.intro && (
          <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E5E0D8] mb-6 text-[#6B7A6E] italic text-sm">
            {item.intro}
          </div>
        )}

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

        {displayAlert && (
          <div className="mt-8 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
            <strong className="block mb-1">⚠️ 重要提醒：</strong>
            {displayAlert}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">
            關閉並返回列表
          </button>
        </div>
      </div>
    </div>
  );
}