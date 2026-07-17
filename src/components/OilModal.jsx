import React from 'react';
import { renderFormattedText } from "../utils/formatUtils.jsx";

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest"
};

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        
        {/* 標籤區 */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">
            {item.constitutionTag || item.oilDetails?.constitutionTag || "無"}體質
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">
            {item.chemicalTag || item.oilDetails?.chemicalTag || "無"}屬性
          </span>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        <p className="text-base italic text-[#A39284] mt-1 mb-3 font-serif border-b border-[#F7F5F0] pb-2">{item.englishName}</p>

        {/* 表格區：確保讀取 item 內正確的欄位 */}
        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
          <table className="w-full text-[15px] border-collapse">
            <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
              {[
                { label: '別名', val: item.alias || item.oilTable?.alias },
                { label: '植物種類／萃取部位', val: item.typePart || item.oilTable?.typePart },
                { label: '萃取方法', val: item.method || item.oilTable?.method },
                { label: '拉丁學名', val: item.latin || item.oilTable?.latin },
                { label: '科名', val: item.family || item.oilTable?.family },
                { label: '性味(四氣／五味)', val: item.nature || item.oilDetails?.nature || item.oilTable?.nature },
                { label: '五行／陰陽屬性', val: item.property || item.oilDetails?.property || item.oilTable?.property },
                { label: '歸經', val: item.meridian || item.oilDetails?.meridian || item.oilTable?.meridian },
                { label: '主治', val: item.indications || item.oilDetails?.indications || item.oilTable?.indications },
                { label: '類比音符', val: item.noteAnalogy || item.oilDetails?.noteAnalogy || item.oilTable?.noteAnalogy },
                { label: '主宰星球', val: item.planet || item.oilDetails?.planet || item.oilTable?.planet },
                { label: '重要產地', val: item.origin || item.oilDetails?.origin || item.oilTable?.origin }
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
              {renderFormattedText(item.oilDetails?.carrierOil)}
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