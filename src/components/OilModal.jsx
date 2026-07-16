import React from 'react';
import { parseBoldSyntax } from "../utils/formatUtils.jsx";
// 修改後 (正確)
import PreviewRenderer from "./PreviewRenderer";

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest"
};

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  const renderFormattedText = (text, customClasses = "") => {
  if (!text) return <span className="italic text-gray-400">無記載</span>;

  // 1. 將內容按換行分割，並過濾掉空行
  const lines = typeof text === 'string' ? text.split('\n').filter(line => line.trim() !== '') : [text];

  return (
    <div className={`${UI.text} ${customClasses} text-justify break-words`}>
      {lines.map((line, i) => {
        const trimmed = typeof line === 'string' ? line.trim() : line;
        
        // 2. 綜合偵測邏輯：偵測阿拉伯數字 (1.) 或中文數字 (一、或一.)
        const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
        const isIndented = trimmed.startsWith('●');

        // 3. Grid 排版結構 (維持對齊且穩定)
        if (isNumbered) {
          // 抓取編號結束點 (無論是 . 或 、)
          const splitIndex = trimmed.search(/[.、]/) + 1;
          return (
            <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2 mb-1">
              <span className="font-bold shrink-0">{trimmed.substring(0, splitIndex)}</span>
              <span>{parseBoldSyntax(trimmed.substring(splitIndex).trim())}</span>
            </div>
          );
        }

        if (isIndented) {
          return (
            <div key={i} className="grid grid-cols-[1.5rem_1fr] mb-1">
              <span className="text-[#A39284]">●</span>
              <span>{parseBoldSyntax(trimmed.replace('●', '').trim())}</span>
            </div>
          );
        }

        // 4. 普通段落
        return <div key={i} className="mb-1">{parseBoldSyntax(trimmed)}</div>;
      })}
    </div>
  );
};

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">{item.constitutionTag}體質</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">{item.chemicalTag}屬性</span>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        <p className="text-base italic text-[#A39284] mt-1 mb-3 font-serif border-b border-[#F7F5F0] pb-2">{item.englishName}</p>

        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
          <table className="w-full text-[15px] border-collapse">
            <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
              {[
                { label: '別名', val: item.oilTable?.alias },
                { label: '植物種類／萃取部位', val: item.oilTable?.typePart },
                { label: '萃取方法', val: item.oilTable?.method },
                { label: '拉丁學名', val: item.oilTable?.latin },
                { label: '科名', val: item.oilTable?.family },
                { label: '性味(四氣／五味)', val: item.oilTable?.nature },
                { label: '五行／陰陽屬性', val: item.oilTable?.property },
                { label: '歸經', val: item.oilTable?.meridian },
                { label: '適用體質', val: item.oilTable?.constitution },
                { label: '主治功能', val: item.oilTable?.indications },
                { label: '類比音符', val: item.oilTable?.noteAnalogy },
                { label: '主宰星球', val: item.oilTable?.planet },
                { label: '重要產地', val: item.oilTable?.origin }
              ].map((row, i) => (
                <tr key={i} className="text-center bg-[#FBFBFA]/40">
                  <td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">{row.label}</td>
                  <td className="px-4 py-2">{renderFormattedText(row.val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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