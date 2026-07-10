import React from 'react';
import { parseBoldSyntax } from "../utils/formatUtils.jsx"; // 確保此路徑正確

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-4",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest",
};

export default function HerbModal({ item, onClose }) {
  if (!item) return null;

  const renderFormattedText = (text) => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    
    const lines = typeof text === 'string' ? text.split('\n').filter(l => l.trim() !== '') : [text];

    return (
      <div className={UI.text}>
        {lines.map((line, i) => {
          const trimmed = typeof line === 'string' ? line.trim() : line;
          
          // 偵測阿拉伯數字編號 (1.) 或中文數字編號 (一、)
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

  // ... 其餘部分保持不變
  const displayAlert = item.alert || (['中藥', '方劑'].includes(item.category) ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。" : "");

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl transition-colors">✕</button>
        <h2 className={UI.title}>{item.name}</h2>

        <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#6B7A6E]">
            <p><strong>別名：</strong> {item.alias || '無記載'}</p>
            <p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p>
            <p className="col-span-2"><strong>科屬：</strong> {item.family || '無記載'}</p>
            <p><strong>性味：</strong> {item.nature || '無記載'}</p>
            <p><strong>歸經：</strong> {item.meridian || '無記載'}</p>
          </div>
        </div>

        <div className="space-y-6 text-[#3A4F3F]">
          {[
            { label: '品種來源', val: item.source },
            { label: '功效', val: item.effect },
            { label: '主治', val: item.indications },
            { label: '文獻別錄', val: item.literature },
            { label: '用法用量', val: item.dosage },
            { label: '注意禁忌', val: item.contraindication },
            { label: '現代藥理', val: item.pharmacology },
            { label: '附藥說明', val: item.directions },
            { label: '註', val: item.note }
          ].map((field, i) => (
            <div key={i}>
              <h4 className={UI.sectionLabel}>{field.label}</h4>
              {renderFormattedText(field.val)}
            </div>
          ))}
        </div>

        {displayAlert && (
          <div className="mt-8 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
            <strong className="block mb-1">⚠️ 重要提醒：</strong>
            {displayAlert}
          </div>
        )}
      </div>
    </div>
  );
}