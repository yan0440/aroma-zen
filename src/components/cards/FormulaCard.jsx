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

export default function FormulaCard({ item }) {
  return (
    <div className="bg-[#F0EDE6] p-8 rounded-3xl border border-[#D6D2C9]">
      <div className="text-[10px] tracking-[0.3em] text-[#6B7A6E] mb-3 uppercase">PRESCRIPTION</div>
      <h2 className="text-4xl font-black text-[#3A4F3F] mb-6">{item.name}</h2>
      <div className="bg-white/50 p-5 rounded-2xl">
        <p className="text-[10px] font-bold text-[#4E6654] uppercase mb-2">辨證要點</p>
        <p className="text-[#3A4F3F] text-sm leading-relaxed">{item.syndrome || '無記載'}</p>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold text-[#4E6654] uppercase mb-1">整體功效</p>
        <p className="text-[#3A4F3F] text-sm">{item.effect || '無記載'}</p>
      </div>
    </div>
  );
}