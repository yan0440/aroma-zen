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

export default function BookCard({ item }) {
  return (
    <div className="bg-[#3A4F3F] p-8 rounded-3xl text-white">
      <div className="text-[10px] tracking-[0.3em] text-[#A39284] mb-3 uppercase">CLASSICS</div>
      <h2 className="text-4xl font-bold mb-2">{item.name}</h2>
      <p className="text-[#E5E0D8] text-sm italic mb-8">{item.bookDetails?.author || '作者佚名'}</p>
      <div className="border-t border-white/20 pt-6">
        <p className="text-[10px] font-bold text-[#A39284] uppercase mb-2">書籍簡介</p>
        <p className="text-[#E5E0D8] text-sm leading-relaxed">
          {item.description ? item.description.substring(0, 100) + '...' : '暫無簡介'}
        </p>
      </div>
    </div>
  );
}
