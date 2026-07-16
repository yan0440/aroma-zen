import React, { useState, useEffect } from 'react';
// 修改後 (正確)
import PreviewRenderer from "./PreviewRenderer";

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


const SECTION_STYLE = {
  container: "bg-white p-6 rounded-xl border border-[#E5E0D8]/60 shadow-sm mb-6",
  title: "font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1.5 mb-3 text-sm tracking-widest flex items-center gap-2"
};

// 在你的 renderFormattedText 中使用它：
const renderSection = (title, content, icon = "📖") => (
  <div className={SECTION_STYLE.container}>
    <h4 className={SECTION_STYLE.title}><span>{icon}</span>{title}</h4>
    <div className={UI.text}>{renderFormattedText(content)}</div>
  </div>
);

export default function ViewEntryModal({ item, onClose }) {
  const [selectedContent, setSelectedContent] = useState(null);
  useEffect(() => { setSelectedContent(null); }, [item]);
  
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] shadow-2xl relative border border-[#E5E0D8]/40 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-red-500 text-xl z-20">✕</button>
        <div className="flex-1 overflow-y-auto">
          {/* 一行搞定所有類別 */}
          <PreviewRenderer 
            item={item} 
            selectedContent={selectedContent} 
            setSelectedContent={setSelectedContent} 
          />
        </div>
      </div>
    </div>
  );
}