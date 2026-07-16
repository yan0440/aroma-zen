import React from 'react';

const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') return str;
  // 檢查這裡是否包含了 《》 的匹配邏輯
  const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;
  
  return str.split(regex).map((part, i) => {
    if (!part) return null;
    
    // 這裡強制加上 font-bold
    if (part.startsWith('==') && part.endsWith('==')) 
      return <mark key={i} className="bg-[#F3E1C5] px-1 rounded font-bold">{part.slice(2, -2)}</mark>;
    
    if (part.startsWith('**') && part.endsWith('**')) 
      return <strong key={i} className="text-[#3A4F3F] font-bold">{part.replace(/\*\*/g, '')}</strong>;
      
    // 這裡是關鍵：檢查這裡是否有處理 《》 並加上 font-bold
    if (part.match(/^[【《\(].*[】》\)]$/)) 
      return <span key={i} className="font-bold">{part}</span>;
      
    return part;
  });
};

export default function EssentialOilCard({ item }) {
  return (
    <div className="p-8 bg-[#E5EAE6]">
      <div className="text-[10px] tracking-[0.2em] text-[#4E6654] mb-2 uppercase">ESSENTIAL OIL</div>
      <h2 className="text-4xl font-bold text-[#3A4F3F] mb-1">{item.name}</h2>
      <p className="text-[#4E6654]/70 italic text-sm mb-6">{item.englishName}</p>
      <div className="bg-white/60 p-4 rounded-xl">
        <p className="font-bold text-[#3A4F3F] text-xs mb-1">功效：</p>
        <p className="text-[#3A4F3F] text-sm leading-relaxed">{item.oilDetails?.mindEffect?.substring(0, 60)}...</p>
      </div>
    </div>
  );
}