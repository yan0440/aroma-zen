import React from 'react';
import { parseBoldSyntax } from "../utils/formatUtils.jsx";

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-4",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
};

export default function FormulaModal({ item, onClose }) {
  if (!item) return null;

  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    const lines = typeof text === 'string' ? text.split('\n').filter(l => l.trim() !== '') : [text];
    
    return (
      <div className={UI.text}>
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

  const alertContent = item.alert || (['中藥', '方劑', '穴道'].includes(item.category) ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非專業人士請勿擅自處方服藥。" : "");

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center mb-4">
          <button onClick={onClose} className="text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        </div>

        {/* 標籤區 */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {item.category && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              item.category === '中藥' ? 'bg-[#E5EAE6] text-[#4E6654]' :
              item.category === '穴道' ? 'bg-[#EAE7E0] text-[#6B7A6E]' :
              item.category === '方劑' ? 'bg-[#F3E1C5] text-[#2C3C30]' :
              'bg-gray-100 text-gray-600'
            }`}>
              {item.category}
            </span>
          )}
          {item.tag && item.tag !== item.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F7F5F0] text-[#6B7A6E]">
              {item.tag}
            </span>
          )}
        </div>

        <h2 className={UI.title}>{item.name}</h2>

        <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-[#6B7A6E]">
            <p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p>
            <p><strong>來源：</strong> {item.source || '無記載'}</p>
            <p className="col-span-2"><strong>功效：</strong> {item.effect || '無記載'}</p>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="space-y-6 text-[#3A4F3F]">
          {[
            { label: '製法用量', val: item.preparation },
            { label: '主治', val: item.indications },
            { label: '文獻別錄', val: item.literature },
            { label: '方義分析', val: item.analysis },
            { label: '方論', val: item.discussion },
            { label: '辨證要點', val: item.syndrome },
            { label: '加減變化', val: item.modifications },
            { label: '注意禁忌', val: item.contraindication },
            { label: '現代應用', val: item.modernApp },
            { label: '附方', val: item.prescription }
          ].map((field, i) => (
            <div key={i}>
              <h4 className={UI.sectionLabel}>{field.label}</h4>
              {renderFormattedText(field.val)}
            </div>
          ))}
        </div>

        {/* 重要提醒 */}
        {alertContent && (
          <div className="mt-10 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
            <strong className="block mb-1">⚠️ 重要提醒：</strong>
            {alertContent}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">
            關閉並返回列表
          </button>
        </div>
      </div>
    </div>
  );
}