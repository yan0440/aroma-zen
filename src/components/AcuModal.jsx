import React from 'react';

export default function AcupointModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 穴道專用智慧排版引擎：保留原始編號、支援黑點，完美解析 **雙星號粗體**
  const renderSmartParagraphs = (text, customClasses = "") => {
    if (!text) return null;
    
    const stringText = String(text);
    let paragraphs = [];
    
    // 💡 智慧段落切分：橫著連寫時，會自動依據「數字/國字編號」或「黑點符號 • - *」切分段落
    if (!stringText.includes('\n') && /(?:\d+|[一二三四五六七八九十]+)[.、)]|[-•*]\s/.test(stringText)) {
      paragraphs = stringText.split(/(?=(?:\d+|[一二三四五六七八九十]+)[.、)]|[-•*]\s)/).map(p => p.trim());
    } else {
      paragraphs = stringText.split(/\\n|\r?\n/).map(p => p.trim());
    }

    // 🔬 特定詞彙粗體解析器：將 **文字** 轉換成加粗標籤，並加上精緻的草本微襯底
    const parseBoldSyntax = (str) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong 
              key={i} 
              className="font-bold text-[#2C3C30] bg-[#3A4F3F]/5 px-1.5 py-0.5 rounded-md mx-0.5 inline-block align-baseline"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    return paragraphs
      .filter(p => p !== '')
      .map((paragraph, index) => {
        // 🔍 偵測是否為列表項目（包含編號類 或 黑點符號類）
        const isListItem = /^((?:\d+|[一二三四五六七八九十]+)[.、)]|[\u2460-\u2473]|[-•*])/.test(paragraph);
        
        return (
          <p 
            key={index} 
            // 🎯 懸掛縮進：如果是編號或黑點開頭，自動對齊第二行，字體絕對不卡在編號下方！
            className={`text-justify leading-relaxed break-all mb-1.5 last:mb-0 ${isListItem ? 'pl-6 -indent-6' : ''} ${customClasses}`}
          >
            {parseBoldSyntax(paragraph)}
          </p>
        );
      });
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30 text-sm" onClick={(e) => e.stopPropagation()}>
        
        {/* ✕ 關閉按鈕 */}
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl">✕</button>

        {/* 🏷️ 頂部經絡標籤 */}
        <div className="mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E5EAE6] text-[#4E6654]">
            {item.meridianName || "未歸類經絡"}
          </span>
        </div>

        {/* 穴位名稱 */}
        <h2 className="text-3xl font-bold text-[#3A4F3F] flex items-baseline gap-2">
          {item.name}
          {item.pinyin && <span className="text-sm font-serif italic text-[#A39284] font-normal">{item.pinyin}</span>}
        </h2>
        
        {/* 國際標準代號 (例如: LU7, LI4) */}
        <p className="text-xs font-mono tracking-wider text-[#A39284] mt-0.5 mb-6 border-b border-[#F7F5F0] pb-4">
          CODE: {item.code || "N/A"}
        </p>

        {/* 📊 穴位基本定位表格 */}
        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-6 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0EDE6] text-[#3A4F3F] font-bold border-b border-[#E5E0D8]">
                <th className="px-4 py-2.5 w-1/3 border-r border-[#E5E0D8]">穴位指標項目</th>
                <th className="px-4 py-2.5">解剖定位與記載</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
              <tr className="bg-white">
                <td className="px-4 py-3.5 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">📍 精確位置</td>
                <td className="px-4 py-3.5 text-xs leading-relaxed">{renderSmartParagraphs(item.location)}</td>
              </tr>
              <tr className="bg-[#FBFBFA]/40">
                <td className="px-4 py-3.5 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">🔍 取穴方法</td>
                <td className="px-4 py-3.5 text-xs leading-relaxed">{renderSmartParagraphs(item.findMethod)}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3.5 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">🩻 解剖層次</td>
                <td className="px-4 py-3.5 text-xs text-[#6B7A6E]">{renderSmartParagraphs(item.anatomy)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🩺 功效功能核心區域：🌟主要功效置頂 ➔ 下分 📜古代 與 🔬現代 */}
        <div className="space-y-4 bg-[#F7F5F0]/70 p-5 rounded-xl border border-[#E5E0D8]/50 mb-6">
          <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-1.5 mb-2 text-base">🩺 穴位主治與功效</span>
          
          {/* 1. 主要功效置頂 */}
          <div className="mb-4">
            <span className="font-bold text-[#3A4F3F] text-xs bg-[#EAE7E0] inline-block px-2.5 py-0.5 rounded shadow-sm mb-1.5">🌟 主要功效</span>
            <div className="pl-1 text-[#3A4F3F]">
              {renderSmartParagraphs(item.mainEffect)}
            </div>
          </div>

          {/* 2. 古代與現代對比欄位（左右分列） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E5E0D8]/60 pt-3.5">
            <div>
              <span className="font-bold text-[#4E6654] text-xs block mb-1.5">📜 古代文獻 / 傳統記載：</span>
              <div className="pl-2 border-l-2 border-[#A39284]/50 text-xs text-[#6B7A6E]">
                {renderSmartParagraphs(item.ancientEffect)}
              </div>
            </div>

            <div>
              <span className="font-bold text-[#4E6654] text-xs block mb-1.5">🔬 現代研究 / 科學實證：</span>
              <div className="pl-2 border-l-2 border-[#A39284]/50 text-xs text-[#6B7A6E]">
                {renderSmartParagraphs(item.modernEffect)}
              </div>
            </div>
          </div>
        </div>

        {/* 🖐️ 按摩與配伍建議 */}
        <div className="space-y-3 bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
          <div>
            <span className="font-bold block text-xs text-[#2C3C30]">🖐️ 按摩與理療手法</span>
            <div className="mt-1">
              {renderSmartParagraphs(item.massageMethod, "text-[#6B7A6E] text-xs")}
            </div>
          </div>
          
          <div className="mt-2 border-t border-[#E5E0D8] pt-2.5">
            <span className="font-bold block text-xs text-[#2C3C30]">🔗 經典穴位配伍（搭配療效）</span>
            <div className="mt-1">
              {renderSmartParagraphs(item.compatibility, "text-[#3A4F3F] text-xs")}
            </div>
          </div>

          <div className="bg-red-50/40 p-3 rounded-lg border border-red-200/30 mt-2">
            <span className="font-bold text-red-800 block text-xs">⚠️ 禁忌注意</span>
            {renderSmartParagraphs(item.caution, "text-red-700/90 text-xs mt-0.5")}
          </div>
        </div>

        {/* 底部關閉按鈕 */}
        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">
            關閉詳細資訊
          </button>
        </div>
      </div>
    </div>
  );
}