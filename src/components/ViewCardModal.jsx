import React from 'react';

const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  const boldKeywords = ['肌肉', '神經', '血管'];
  
  // 核心：這裡保留您的 Regex，但我們調整內部的判斷邏輯
  const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;
  
  return str.split(regex).map((part, i) => {
    if (!part) return null;

    // 1. 處理 ==標記== (保留顏色 + 強制加粗)
    if (part.startsWith('==') && part.endsWith('==')) 
      return <mark key={i} className="bg-[#F3E1C5] px-1 rounded font-bold">{part.slice(2, -2)}</mark>;

    // 2. 處理 **加粗** 或 關鍵字 (強制加粗)
    if ((part.startsWith('**') && part.endsWith('**')) || boldKeywords.includes(part)) 
      return <strong key={i} className="text-[#3A4F3F] font-bold">{part.replace(/\*\*/g, '')}</strong>;

    // 3. 處理 【】《》() (強制加粗)
    // 這裡我們不再給定顏色，只給 font-bold
    if (part.match(/^[【《\(].*[】》\)]$/)) 
      return <span key={i} className="font-bold">{part}</span>;

    return part;
  });
};

export default function ViewCardModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-[#E5E0D8] relative overflow-y-auto max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-[#A39284] hover:text-[#3A4F3F] transition-colors font-bold text-lg"
        >
          ✕
        </button>

        <div className="flex flex-wrap gap-1.5 items-start mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#F0EDE6] text-[#3A4F3F]">
            {item.category}
          </span>
          {[item.tag, item.constitutionTag, item.chemicalTag, item.acuTable?.meridian].filter(Boolean).map((tag, idx) => (
            <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded bg-[#E5E0D8]/40 text-[#6B7A6E]">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-[#3A4F3F] mb-1">{item.name}</h3>
        <p className="text-sm italic text-[#A39284] mt-1 mb-6 font-serif">
          {item.category === "精油" ? item.englishName : (item.acuTable?.code || '')}
        </p>
        
        <div className="text-sm text-[#6B7A6E] leading-relaxed border-t border-[#E5E0D8]/50 pt-6">
          {parseBoldSyntax(item.description || item.effect || '尚無詳細內容。')}
        </div>
      </div>
    </div>
  );
}