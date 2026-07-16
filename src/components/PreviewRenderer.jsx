import React, { useState } from 'react';
import * as Content from './ContentRenderer';

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

export default function PreviewRenderer({ item }) {
  // 定義書籍類別需要的狀態
  const [selectedContent, setSelectedContent] = useState(null);

  if (!item) return <div className="p-8 text-center text-[#A39284]">無資料</div>;

  // 移除之前的提前 return，讓 switch 可以執行
  switch (item.category) {
    case '書籍': 
      return (
        <Content.BookContent 
          item={item} 
          selectedContent={selectedContent} 
          setSelectedContent={setSelectedContent} 
        />
      );
    case '穴道': 
      return <Content.AcuContent item={item} renderFormattedText={Content.renderFormattedText} />;
    case '中藥': 
      return <Content.HerbContent item={item} renderFormattedText={Content.renderFormattedText} />;
    case '方劑': 
      return <Content.FormulaContent item={item} renderFormattedText={Content.renderFormattedText} />;
    case '精油': 
      return <Content.OilContent item={item} renderFormattedText={Content.renderFormattedText} />;
    default: 
      return <div className="p-8 text-center text-[#A39284]">暫無此類別 UI 設定。</div>;
  }
}