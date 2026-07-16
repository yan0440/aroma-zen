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

export default function HerbCard({ item }) {
  // 假設 item.tags 是一個陣列，例如 ["中藥", "補血"]
  const tags = item.tags || [item.category, "未知"]; 

  return (
    <div className="flex flex-col w-full">
      {/* 標籤區 */}
      <div className="flex gap-2 mb-3">
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] bg-[#F0EDE6] text-[#6B7A6E] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
            {tag}
          </span>
        ))}
      </div>
      
      {/* 標題與副標 */}
      <h3 className="text-xl font-black text-[#3A4F3F] mb-1">{item.name}</h3>
      {item.alias && <p className="text-sm italic text-[#AAB8AB] mb-4">{item.alias}</p>}
      
      {/* 內文區 */}
      <p className="text-sm leading-relaxed text-[#3A4F3F] text-justify">
        {item.description || "尚無詳細描述。"}
      </p>
    </div>
  );
}