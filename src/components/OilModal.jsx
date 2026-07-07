import React from 'react';
import { parseBoldSyntax } from "../utils/formatUtils.jsx";

// 🟢 集中管理樣式：未來只需改動這裡，所有段落同步統一
const UI = {
  // 將這裡的 14.5px 改成你想要的數值，例如 15px 或 16px
  text: "text-[14px] leading-relaxed text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block mb-1 text-base tracking-widest"
};

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 嚴格對齊版排版引擎
  const renderFormattedText = (text, customClasses = "") => {
    if (!text) return null;
    const lines = String(text).split(/\\n|\r?\n/);
    
    return lines
      .filter(line => line.trim() !== '')
      .map((line, index) => {
        const trimmed = line.trim();
        // 偵測數字列表：例如 1.、一、(一) 等
        const listMatch = trimmed.match(/^((?:\d+|[一二三四五六七八九十A-Za-z]+)[.、)]|[\u2460-\u2473]|[-•*‣▪])\s*/);
        
        // 🧠 修正後：更寬的 marker 容器，確保 (一)、(1) 不會被蓋住
if (listMatch) {
  const marker = listMatch[1];
  const content = trimmed.substring(listMatch[0].length);
  return (
    <div key={index} className={`flex items-start mb-1 ${customClasses}`}>
      {/* 將 w-6 改為 w-8 (增加寬度)
         text-right 確保括號不會貼邊
         pr-1 增加右側與內文的間距
      */}
      <span className="shrink-0 font-bold w-4 text-[13px] pr-7 select-none text-[#6B7A6E]">
        {marker}
      </span>
      <div className="flex-1 break-words text-[13px]">
        {parseBoldSyntax(content)}
      </div>
    </div>
  );
}
        
        // 檢查這裡有沒有其他的 inline style 或 class 覆寫了 UI.text
return (
  <p key={index} className={`${UI.text} text-justify ...`}>
    {parseBoldSyntax(trimmed)}
  </p>
);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl">✕</button>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">
            {item.constitutionTag}體質
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">
            {item.chemicalTag}屬性
          </span>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        <p className="text-base italic text-[#A39284] mt-1 mb-3 font-serif border-b border-[#F7F5F0] pb-2">
          {item.englishName}
        </p>

        {/* 📊 精油 11 項表格 */}
        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
          <table className="w-full text-[15px] border-collapse">
            <thead>
              <tr className="bg-[#F0EDE6] text-[#3A4F3F] font-bold border-b border-[#E5E0D8]">
                <th className="px-4 py-2.5 w-1/3 border-r border-[#E5E0D8]">精油指標項目</th>
                <th className="px-4 py-2.5">百科記載內容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
    <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">別名</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.alias)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">植物種類／萃取部位</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.typePart)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">萃取方法</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.method)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">拉丁學名</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.latin)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">科名</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.family)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">性味</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.nature)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">五行／陰陽屬性</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.property)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">歸經</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.meridian)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">適用體質</td><td className="text-left px-4 py-2">{renderFormattedText(item.oilTable?.constitution)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">主治功能</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.indications)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">類比音符</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.noteAnalogy)}</td></tr>
  <tr className="text-center bg-[#FBFBFA]/40"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">主宰星球</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.planet)}</td></tr>
  <tr className="text-center"><td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">重要產地</td><td className="px-4 py-2">{renderFormattedText(item.oilTable?.origin)}</td></tr>
</tbody>
          </table>
        </div>

        {/* 📝 下方細節資訊 */}
        <div className="space-y-5 text-[#3A4F3F]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>🔍 氣味</span>
              {renderFormattedText(item.oilDetails?.scent)}
            </div>
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>✨ 外觀</span>
              {renderFormattedText(item.oilDetails?.appearance)}
            </div>
          </div>

          <div>
            <span className="font-bold text-[#4E6654] block mb-1.5 text-base">📜 應用歷史與相關神話</span>
            <div className="bg-[#FBFBFA] px-5 py-4 rounded-xl border border-[#E5E0D8]/30">
              {renderFormattedText(item.oilDetails?.historyMyth)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>🔬 化學結構</span>
              {renderFormattedText(item.oilDetails?.chemistry)}
            </div>
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>⚖️ 屬性</span>
              {renderFormattedText(item.oilDetails?.attribute)}
            </div>
          </div>

          <div className="bg-red-50/40 p-4 rounded-xl border border-red-200/40">
            <span className="font-bold text-red-800 block mb-1 text-[15px]">⚠️ 注意事項</span>
            {renderFormattedText(item.oilDetails?.caution, "text-red-700/90")}
          </div>

          <div className="space-y-4 bg-[#F7F5F0]/60 p-4 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-1.5 mb-1 text-[15px]">🩺 深度效能</span>
            <div>
              <span className={UI.sectionLabel}>🧠 心靈療效</span>
              <div className="pl-2 border-l-2 border-[#A39284]">{renderFormattedText(item.oilDetails?.mindEffect)}</div>
            </div>
            <div>
              <span className={UI.sectionLabel}>💪 身體療效</span>
              <div className="pl-2 border-l-2 border-[#A39284]">{renderFormattedText(item.oilDetails?.bodyEffect)}</div>
            </div>
            <div>
              <span className={UI.sectionLabel}>🧴 皮膚療效</span>
              <div className="pl-2 border-l-2 border-[#A39284]">{renderFormattedText(item.oilDetails?.skinEffect)}</div>
            </div>
          </div>

          <div className="space-y-3 bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <div>
              <span className={UI.sectionLabel}>🔗 適合與之調和的精油</span>
              {renderFormattedText(item.oilDetails?.blendingOils)}
            </div>
            <div className="mt-2">
              <span className={UI.sectionLabel}>🧪 精油配方</span>
              {renderFormattedText(item.oilDetails?.formulas)}
            </div>
            <div className="mt-2">
              <span className={UI.sectionLabel}>🧴 按摩基底油</span>
              {renderFormattedText(item.oilDetails?.carrierOils)}
            </div>
            <div className="mt-2 border-t border-[#E5E0D8] pt-2">
              <span className={UI.sectionLabel}>🚀 使用方法</span>
              <div className="px-1">{renderFormattedText(item.oilDetails?.usage)}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">關閉並返回列表</button>
        </div>
      </div>
    </div>
  );
}