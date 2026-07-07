import React from 'react';

// 🟢 集中管理樣式：與 OilModal 完全同步
const UI = {
  text: "text-[14.5px] leading-relaxed text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block mb-2 text-xs tracking-widest font-sans"
};

export default function AcuModal({ item, onClose }) {
  if (!item) return null;
  const { acuTable, acuDetails } = item;

  // 🧠 全域智慧彈窗排版引擎
  const renderFormattedText = (text, customClasses = "") => {
  if (!text) return null;
  const lines = String(text).split(/\\n|\r?\n/);
  
  return lines
    .filter(line => line.trim() !== '')
    .map((line, index) => {
      const trimmed = line.trim();
      const listMatch = trimmed.match(/^((?:\d+|[一二三四五六七八九十A-Za-z]+)[.、)]|[\u2460-\u2473]|[-•*‣▪])\s*/);
      
      if (listMatch) {
        const marker = listMatch[1];
        const content = trimmed.substring(listMatch[0].length);
        return (
          <div key={index} className={`flex items-start ${UI.text} ${customClasses}`}>
            <span className="shrink-0 font-bold w-6">{marker}</span>
            <span className="flex-1 break-words text-justify">{parseBoldSyntax(content)}</span>
          </div>
        );
      }
      
      return (
        <p key={index} className={`${UI.text} text-justify break-words mb-1.5 last:mb-0 ${customClasses}`}>
          {parseBoldSyntax(trimmed)}
        </p>
      );
    });
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#FCFBFA] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/40" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>

        <div className="mb-2">
          <span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F] font-sans">
            {item.category}百科 · {item.tag}
          </span>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8]/40 pb-4">
          INTERNATIONAL CODE: {acuTable.code}
        </p>

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
              <tr className="divide-x divide-[#E5E0D8]/60 align-top">
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuDetails.indications || item.indications || "未記載特定主治功能")}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable.alias || '—')}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable.meridian)}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable.code)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F4F2ED]/40 p-4 rounded-xl border border-[#E5E0D8]/50">
            <span className={UI.sectionLabel}>🏷️ 類別</span>
            <div className={UI.text}>{renderFormattedText(acuDetails.type)}</div>
          </div>

          <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
            <span className={UI.sectionLabel}>📖 釋名</span>
            <div className={UI.text}>{renderFormattedText(acuDetails.nameExpl)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>📍 位置</span>
              <div className={UI.text}>{renderFormattedText(acuDetails.location)}</div>
            </div>
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>💀 解剖</span>
              <div className={UI.text}>{renderFormattedText(acuDetails.anatomy)}</div>
            </div>
          </div>

          <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className={UI.sectionLabel}>🎯 操作</span>
            <div className={UI.text}>{renderFormattedText(acuDetails.operation)}</div>
          </div>

          <div className="bg-white border border-[#E5E0D8]/80 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(58,79,63,0.01)]">
            <div className="bg-[#F0EDE6]/60 px-4 py-2.5 font-bold text-xs tracking-widest text-[#3A4F3F] border-b border-[#E5E0D8]/70">✨ 功效</div>
            <div className="divide-y divide-[#E5E0D8]/60">
              <div className="p-4">
                <span className="font-bold text-[#A39284] text-[11px] tracking-wider block mb-2">【古代功效記載】</span>
                <div className={UI.text}>{renderFormattedText(acuDetails.effectAncient)}</div>
              </div>
              <div className="p-4 bg-[#FBFBFA]">
                <span className="font-bold text-[#4E6654] text-[11px] tracking-wider block mb-2">【現代臨床應用】</span>
                <div className={UI.text}>{renderFormattedText(acuDetails.effectModern)}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className={UI.sectionLabel}>🔗 配穴</span>
            <div className={UI.text}>{renderFormattedText(acuDetails.matchingPoints)}</div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#E5E0D8]/30 text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-semibold rounded-xl transition-all shadow-md">
            關閉並返回列表
          </button>
        </div>
      </div>
    </div>
  );
}