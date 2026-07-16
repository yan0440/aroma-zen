// components/InfoCard.jsx
import React from 'react';

export default function InfoCard({ item, onClick }) {
  // 自動收集所有可能的標籤
  const tags = [
    item.category, 
    item.tag, 
    item.constitutionTag, 
    item.chemicalTag, 
    item.acuTable?.meridian
  ].filter(Boolean);

  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-2xl p-6 border border-[#E5E0D8]/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* 標籤區 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <span key={idx} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#F0EDE6] text-[#6B7A6E]">
            {tag}
          </span>
        ))}
      </div>

      {/* 標題與副標 */}
      <h3 className="text-xl font-black text-[#3A4F3F] mb-1 group-hover:text-[#6B9080] transition-colors">
        {item.name}
      </h3>
      <p className="text-xs italic text-[#A39284] mb-3 font-serif">
        {item.englishName || item.acuTable?.code || ''}
      </p>

      {/* 簡短內容摘要 */}
      <p className="text-sm text-[#6B7A6E] line-clamp-3 leading-relaxed">
        {item.description || item.effect || '暫無描述'}
      </p>
    </div>
  );
}