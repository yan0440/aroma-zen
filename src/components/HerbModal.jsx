import React from 'react';

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-4",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
};

// 修改 parseBoldSyntax 函式，加入 ● 轉縮排的邏輯
const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  const boldKeywords = ['肌肉', '神經', '血管'];
  const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map((line, lineIndex) => {
    const isIndented = line.trim().startsWith('●');
    
    // 偵測數字格式，例如 1. 10. 等
    const isNumbered = /^\d+\./.test(line.trim()); 
    
    // 處理數字後方自動加入空隙
    const cleanLine = isIndented ? line.replace('●', '').trim() : 
                      isNumbered ? line.replace(/^(\d+\.)/, '$1\u00A0\u00A0') : line; // 這裡加入兩個不換行空格

    return (
      <span 
        key={lineIndex} 
        className={`block mb-2 ${isIndented ? 'ml-6' : ''} ${isNumbered ? 'pl-8 -indent-5' : ''}`}
      >
        {cleanLine.split(regex).map((part, i) => {
          if (!part) return null;
          // ... (保留你原有的粗體、標記邏輯)
          return part;
        })}
      </span>
    );
  });
};

export default function HerbModal({ item, onClose }) {
  if (!item) return null;

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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        </div>

        <h2 className={UI.title}>{item.name}</h2>

        {/* 這裡調整了顯示結構，使其與你手動輸入的資訊格式一致 */}
<div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-6">
  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#6B7A6E]">
  <p><strong>別名：</strong> {item.alias || '無記載'}</p>
  <p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p>
  <p className="col-span-2"><strong>科屬：</strong> {item.family || '無記載'}</p>
  <p><strong>性味：</strong> {item.nature || '無記載'}</p>
  <p><strong>歸經：</strong> {item.meridian || '無記載'}</p>
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
            { label: '附藥說明', val: item.directions },
            { label: '註', val: item.note }
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
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">關閉</button>
        </div>
      </div>
    </div>
  );
}