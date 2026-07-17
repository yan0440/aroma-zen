import React from 'react';
import { parseBoldSyntax } from "../utils/formatUtils.jsx";
// 修改後 (正確)
import PreviewRenderer from "./PreviewRenderer";

const UI = {
  text: "text-[14px] leading-relaxed text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block mb-1 text-base tracking-widest"
};

export default function AcuModal({ item, onClose }) {
  if (!item) return null;
  
  const acuTable = item.acuTable || {};
  const acuDetails = item.acuDetails || {};

  const renderFormattedText = (text, customClasses = "") => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;

    const lines = typeof text === 'string' ? text.split('\n').filter(line => line.trim() !== '') : [text];

    return (
      <div className={`${UI.text} ${customClasses} text-justify break-words`}>
        {lines.map((line, i) => {
          const trimmed = typeof line === 'string' ? line.trim() : line;
          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = trimmed.startsWith('●');

          if (isNumbered) {
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

          return <div key={i} className="mb-1">{parseBoldSyntax(trimmed)}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#FCFBFA] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/40" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>

        {/* 頂部標籤 */}
        <div className="mb-2">
          <span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F] font-sans">
            {item.category || '穴道'}百科 · {item.tag || '基本資料'}
          </span>
        </div>

        <h2 className={UI.title}>{item.name}</h2>
        <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8]/40 pb-4">
          INTERNATIONAL CODE: {acuTable?.code || 'N/A'}
        </p>

        {/* 📊 表格區塊 */}
        <div className="overflow-hidden border border-[#E5E0D8]/80 rounded-xl mb-8 shadow-[0_4px_16px_rgba(58,79,63,0.01)] bg-white">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-[#F0EDE6]/60 text-[#4E6654] font-bold text-[14px] tracking-widest border-b border-[#E5E0D8]/70">
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">主治</th>
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">別名</th>
                <th className="px-4 py-3 border-r border-[#E5E0D8]/70">經絡</th>
                <th className="px-4 py-3">國際代碼</th>
              </tr>
            </thead>
            <tbody className="text-[#3A4F3F]">
              <tr className="divide-x divide-[#E5E0D8]/60 align-top">
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuDetails?.indications || "無主治")}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable?.alias || "無別名")}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable?.meridian || "無經絡分類")}</td>
                <td className={`px-4 py-3.5 ${UI.text}`}>{renderFormattedText(acuTable?.code || "無代碼")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 📝 詳細資訊區塊 */}
        <div className="space-y-6">
          {acuDetails?.type && (
            <div className="bg-[#F4F2ED]/40 p-4 rounded-xl border border-[#E5E0D8]/50">
              <span className={UI.sectionLabel}>🏷️ 類別</span>
              <div className={UI.text}>{renderFormattedText(acuDetails.type)}</div>
            </div>
          )}

          {acuDetails?.nameExpl && (
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
              <span className={UI.sectionLabel}>📖 釋名</span>
              <div className={UI.text}>{renderFormattedText(acuDetails.nameExpl)}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acuDetails?.location && (
              <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
                <span className={UI.sectionLabel}>📍 位置</span>
                <div className={UI.text}>{renderFormattedText(acuDetails.location)}</div>
              </div>
            )}
            {acuDetails?.anatomy && (
              <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
                <span className={UI.sectionLabel}>💀 解剖</span>
                <div className={UI.text}>
                  {acuDetails.anatomy.split('\n').map((line, i) => {
                    const isBoldLine = line.startsWith('肌肉') || line.startsWith('神經') || line.startsWith('血管');
                    if (isBoldLine) {
                      const colonIndex = line.indexOf('：');
                      const label = line.substring(0, colonIndex);
                      const content = line.substring(colonIndex);
                      return (
                        <div key={i} className="mb-1">
                          <strong className="text-[#3A4F3F] !font-bold">{label}</strong>
                          <span>{content}</span>
                        </div>
                      );
                    }
                    return <div key={i} className="mb-1">{line}</div>;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className={UI.sectionLabel}>🎯 操作</span>
            <div className={UI.text}>{renderFormattedText(acuDetails?.operation || "未記載操作說明")}</div>
          </div>

          <div className="bg-white border border-[#E5E0D8]/80 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(58,79,63,0.01)]">
            <div className="bg-[#F0EDE6]/60 px-4 py-2.5 font-bold text-[15px] tracking-widest text-[#3A4F3F] border-b border-[#E5E0D8]/70">✨ 功效</div>
            <div className="divide-y divide-[#E5E0D8]/60">
              <div className="p-4">
                <span className="font-bold text-[#4E6654] text-[13px] tracking-wider block mb-2">【古代功效記載】</span>
                <div className={UI.text}>{renderFormattedText(acuDetails?.effectAncient || "未記載")}</div>
              </div>
              <div className="p-4 bg-[#FBFBFA]">
                <span className="font-bold text-[#4E6654] text-[13px] tracking-wider block mb-2">【現代臨床應用】</span>
                <div className={UI.text}>{renderFormattedText(acuDetails?.effectModern || "未記載")}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className={UI.sectionLabel}>🔗 配穴</span>
            <div className={UI.text}>
              {acuDetails?.matchingPoints ? (
                acuDetails.matchingPoints.split('\n').map((line, i) => {
                  const colonIndex = line.indexOf('：');
                  if (colonIndex !== -1) {
                    const disease = line.substring(0, colonIndex);
                    const points = line.substring(colonIndex);
                    return (
                      <div key={i} className="mb-1">
                        <strong className="text-[#3A4F3F] !font-bold">{disease}</strong>
                        <span>{points}</span>
                      </div>
                    );
                  }
                  return <div key={i} className="mb-1">{line}</div>;
                })
              ) : (
                <span className="italic text-gray-400">未記載配穴資訊</span>
              )}
            </div>
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