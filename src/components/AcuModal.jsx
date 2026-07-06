import React from 'react';

export default function AcuModal({ item, onClose }) {
  if (!item) return null;
  const { acuTable, acuDetails } = item;

  // 🧠 全域智慧排版引擎：全面支援 \n 換行、分點清單、以及純淨 ** 粗體加粗
  const renderFormattedText = (text, customClasses = "") => {
    if (!text) return null;
    
    const lines = String(text).split(/\\n|\r?\n/);

    // 🔬 純淨加粗解析器：只加粗，不增加任何額外背景與間距
    const parseBoldSyntax = (str) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-[#2C3C30]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    return lines
      .filter(line => line.trim() !== '')
      .map((line, index) => {
        const trimmed = line.trim();
        // 偵測是否為數字清單或符號清單 (如: 1., •, -)
        const listMatch = trimmed.match(/^((?:\d+|[一二三四五六七八九十A-Za-z]+)[.、)]|[\u2460-\u2473]|[-•*‣▪])\s*/);
        
        if (listMatch) {
          const marker = listMatch[1];
          const content = trimmed.substring(listMatch[0].length);
          return (
            <div key={index} className={`flex items-start gap-2.5 mb-1.5 last:mb-0 text-justify ${customClasses}`}>
              <span className="font-bold text-[#4E6654] shrink-0 select-none font-sans mt-[1px]">{marker}</span>
              <div className="flex-1 break-words leading-relaxed">{parseBoldSyntax(content)}</div>
            </div>
          );
        }
        
        return (
          <p 
            key={index} 
            className={`text-justify leading-relaxed break-words mb-1.5 last:mb-0 ${customClasses}`}
          >
            {parseBoldSyntax(trimmed)}
          </p>
        );
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 antialiased tracking-wide" onClick={onClose}>
      <div className="bg-[#FCFBFA] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/40 text-stone-700 text-[13.5px]" onClick={(e) => e.stopPropagation()}>
        
        {/* ✕ 關閉按鈕 */}
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>

        {/* 頂部優雅小標籤 */}
        <div className="mb-2">
          <span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F] font-sans">
            {item.category}百科 · {item.tag}
          </span>
        </div>

        {/* 👑 大標題 */}
        <h2 className="text-3xl font-bold font-serif text-[#2C3C30] tracking-wide mt-1">{item.name}</h2>
        <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8]/40 pb-4">INTERNATIONAL CODE: {acuTable.code}</p>

        {/* 📊 最上方簡介大表格 */}
        <div className="overflow-hidden border border-[#E5E0D8]/80 rounded-xl mb-8 shadow-[0_4px_16px_rgba(58,79,63,0.01)] bg-white">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-[#F0EDE6]/60 text-[#4E6654] font-bold text-xs tracking-widest border-b border-[#E5E0D8]/70">
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">🩺 主治功能</th>
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">別名</th>
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">經絡</th>
                <th className="px-4 py-3">國際代碼</th>
              </tr>
            </thead>
            <tbody className="text-[#3A4F3F]">
              {/* 全欄位皆套用 renderFormattedText，全面支援換行與粗體 */}
              <tr className="divide-x divide-[#E5E0D8]/60 align-top">
                <td className="px-4 py-3.5 text-[13px] leading-relaxed text-[#2C3C30]">
                  {renderFormattedText(acuDetails.indications || item.indications || "未記載特定主治功能")}
                </td>
                <td className="px-4 py-3.5 text-[#6B7A6E] font-medium break-words">
                  {renderFormattedText(acuTable.alias || '—')}
                </td>
                <td className="px-4 py-3.5 font-medium break-words">
                  {renderFormattedText(acuTable.meridian)}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-[#A39284] break-words">
                  {renderFormattedText(acuTable.code)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 📝 下方詳細內容區塊 */}
        <div className="space-y-6">
          {/* 🏷️ 類別 */}
          <div className="bg-[#F4F2ED]/40 p-4 rounded-xl border border-[#E5E0D8]/50">
            <span className="font-bold text-[#5C6B5F] block mb-2 text-xs tracking-widest font-sans">🏷️ 類別</span>
            <div className="text-[#5C6B5F]">
              {renderFormattedText(acuDetails.type)}
            </div>
          </div>

          {/* 📖 釋名區域 */}
          <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="font-bold text-[#4E6654] block mb-2 text-xs tracking-widest font-sans">📖 釋名</span>
            <div className="text-[#5C6B5F]">
              {renderFormattedText(acuDetails.nameExpl)}
            </div>
          </div>

          {/* 📍 位置 與 💀 解剖 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40 flex flex-col">
              <span className="font-bold text-[#4E6654] block mb-2 text-xs tracking-widest font-sans">📍 位置</span>
              <div className="text-[#5C6B5F] flex-grow">
                {renderFormattedText(acuDetails.location)}
              </div>
            </div>
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40 flex flex-col">
              <span className="font-bold text-[#4E6654] block mb-2 text-xs tracking-widest font-sans">💀 解剖</span>
              <div className="text-[#5C6B5F] flex-grow">
                {renderFormattedText(acuDetails.anatomy)}
              </div>
            </div>
          </div>

          {/* 🎯 操作 */}
          <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className="font-bold text-[#3A4F3F] block mb-2 text-xs tracking-widest font-sans">🎯 操作</span>
            <div className="text-[#5C6B5F]">
              {renderFormattedText(acuDetails.operation)}
            </div>
          </div>

          {/* ✨ 功效（古代、現代） */}
          <div className="bg-white border border-[#E5E0D8]/80 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(58,79,63,0.01)]">
            <div className="bg-[#F0EDE6]/60 px-4 py-2.5 font-bold text-xs tracking-widest text-[#3A4F3F] border-b border-[#E5E0D8]/70 font-sans">✨ 功效</div>
            <div className="divide-y divide-[#E5E0D8]/60">
              <div className="p-4">
                <span className="font-bold text-[#A39284] text-[11px] tracking-wider block mb-2">【古代功效記載】</span>
                <div className="text-[#5C6B5F]">
                  {renderFormattedText(acuDetails.effectAncient)}
                </div>
              </div>
              <div className="p-4 bg-[#FBFBFA]">
                <span className="font-bold text-[#4E6654] text-[11px] tracking-wider block mb-2">【現代臨床應用】</span>
                <div className="text-[#2C3C30] font-medium">
                  {renderFormattedText(acuDetails.effectModern)}
                </div>
              </div>
            </div>
          </div>

          {/* 🔗 配穴 */}
          <div className="bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className="font-bold block text-xs text-[#3A4F3F] tracking-widest mb-2 font-sans">🔗 配穴</span>
            <div className="text-[#5C6B5F]">
              {renderFormattedText(acuDetails.matchingPoints)}
            </div>
          </div>
        </div>

        {/* 底部關閉按鈕 */}
        <div className="mt-8 pt-4 border-t border-[#E5E0D8]/30 text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-semibold rounded-xl tracking-widest transition-all shadow-md hover:shadow-lg">
            關閉並返回列表
          </button>
        </div>
      </div>
    </div>
  );
}