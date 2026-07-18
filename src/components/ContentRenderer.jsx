import React, { useState } from 'react';

const UI = { text: "text-[15px] leading-8 text-[#6B7A6E]", title: "text-4xl font-bold text-[#6B9080] mb-4" };

export const processInlineSyntax = (text) => {
  if (typeof text !== 'string') return text;
  const regex = /(\*\*.*?\*\*|==.*?==|\[\[.*?\]\]|《.*?》|【.*?】|\(.*?\))/g;
  return text.split(regex).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**')) return <strong key={i} className="text-[#3A4F3F] font-bold">{part.replace(/\*\*/g, '')}</strong>;
    if (part.startsWith('==')) return <mark key={i} className="bg-[#F3E1C5] px-1 rounded font-bold">{part.slice(2, -2)}</mark>;
    if (part.startsWith('[[') || part.startsWith('《') || part.startsWith('【')) return <span key={i} className="font-bold">{part}</span>;
    if (part.startsWith('(')) return <span key={i} className="font-bold">{part}</span>;
    return part;
  });
};

export function renderFormattedText(text, customClasses = "") {
  if (!text) return <span className="italic text-gray-400">無記載</span>;
  const lines = typeof text === 'string' ? text.split('\n').filter(l => l.trim() !== '') : [text];
  return (
    <div className={`${UI.text} ${customClasses}`}>
      {lines.map((line, i) => {
        const trimmed = typeof line === 'string' ? line.trim() : line;
        const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
        const isIndented = trimmed.startsWith('●');
        if (isNumbered) {
          const splitIndex = trimmed.search(/[.、]/) + 1;
          return (
            <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2 mb-1">
              <span className="font-bold shrink-0">{trimmed.substring(0, splitIndex)}</span>
              <span>{processInlineSyntax(trimmed.substring(splitIndex).trim())}</span>
            </div>
          );
        }
        if (isIndented) {
          return (
            <div key={i} className="flex items-baseline pl-0 mb-1">
              <span className="text-[#A39284] mr-1.5 inline-block shrink-0 translate-y-[-2px]">●</span>
              <span className="leading-relaxed text-left flex-1">{processInlineSyntax(trimmed.replace('●', '').trim())}</span>
            </div>
          );
        }
        return <div key={i} className="mb-1">{processInlineSyntax(trimmed)}</div>;
      })}
    </div>
  );
}

export function AcuContent({ item, renderFormattedText }) {
  const { acuTable, acuDetails } = item;
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-2"><span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F] font-sans">{item.category || '穴道'}百科 · {item.tag || '基本資料'}</span></div>
      <h2 className="text-4xl font-bold text-[#3A4F3F] mb-1">{item.name}</h2>
      <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8] pb-4">INTERNATIONAL CODE: {acuTable?.code || 'N/A'}</p>
      
      <div className="mb-10 text-[15px]">
        <table className="w-full text-left">
          <tbody className="text-[#3A4F3F] border-t border-b border-[#E5E0D8]">
            {[{l:'主治',v:acuDetails?.indications},{l:'別名',v:acuTable?.alias},{l:'經絡',v:acuTable?.meridian},{l:'國際代碼',v:acuTable?.code}].map((r,i) => (
              <tr key={i} className="border-b border-[#E5E0D8]/40 last:border-0">
                <td className="py-4 font-bold text-[#4E6654] w-24 align-top">{r.l}</td>
                <td className="py-4 text-[#6B7A6E]">{renderFormattedText(r.v || "無")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-8">
        {acuDetails?.type && (<div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">🏷️ 類別</h4><div>{renderFormattedText(acuDetails.type)}</div></div>)}
        {acuDetails?.nameExpl && (<div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">📖 釋名</h4><div>{renderFormattedText(acuDetails.nameExpl)}</div></div>)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {acuDetails?.location && (<div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">📍 位置</h4><div>{renderFormattedText(acuDetails.location)}</div></div>)}
          {acuDetails?.anatomy && (<div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">💀 解剖</h4><div className="text-[15px] leading-8 text-[#6B7A6E]">{acuDetails.anatomy.split('\n').map((line, i) => { const isBoldLine = line.startsWith('肌肉') || line.startsWith('神經') || line.startsWith('血管'); if (isBoldLine) { const colonIndex = line.indexOf('：'); return (<div key={i} className="mb-1"><strong className="text-[#3A4F3F] !font-bold">{line.substring(0, colonIndex)}</strong><span>{line.substring(colonIndex)}</span></div>); } return <div key={i} className="mb-1">{line}</div>; })}</div></div>)}
        </div>
        <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">🎯 操作</h4><div>{renderFormattedText(acuDetails?.operation || "未記載操作說明")}</div></div>
        <div>
          <h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">✨ 功效</h4>
          <div className="space-y-4">
            <div><span className="font-bold text-[#4E6654] text-[13px] block mb-1">【古代功效記載】</span>{renderFormattedText(acuDetails?.effectAncient || "未記載")}</div>
            <div><span className="font-bold text-[#4E6654] text-[13px] block mb-1">【現代臨床應用】</span>{renderFormattedText(acuDetails?.effectModern || "未記載")}</div>
          </div>
        </div>
        <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm tracking-widest">🔗 配穴</h4><div className="text-[15px] leading-8 text-[#6B7A6E]">{acuDetails?.matchingPoints ? acuDetails.matchingPoints.split('\n').map((line, i) => { const colonIndex = line.indexOf('：'); return colonIndex !== -1 ? (<div key={i} className="mb-1"><strong className="text-[#3A4F3F] !font-bold">{line.substring(0, colonIndex)}</strong><span>{line.substring(colonIndex)}</span></div>) : <div key={i} className="mb-1">{line}</div>; }) : <span className="italic text-gray-400">未記載配穴資訊</span>}</div></div>
      </div>
    </div>
  );
}

export function HerbContent({ item, renderFormattedText }) {
  const displayAlert = item.alert || (['中藥', '方劑'].includes(item.category) ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。" : "");
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-[#6B9080] mb-8">{item.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-10 text-sm text-[#6B7A6E]">
        <p><strong>別名：</strong> {item.alias || '無別名'}</p><p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p>
        <p><strong>科屬：</strong> {item.family || '無記載'}</p><p><strong>性味：</strong> {item.nature || '無記載'}</p>
        <p className="col-span-2"><strong>歸經：</strong> {item.meridian || '無記載'}</p>
      </div>
      <div className="space-y-8 text-[#3A4F3F]">
        {[{ label: '品種來源', val: item.source }, { label: '功效', val: item.effect }, { label: '主治', val: item.indications }, { label: '文獻別錄', val: item.literature }, { label: '用法用量', val: item.dosage }, { label: '注意禁忌', val: item.contraindication }, { label: '現代藥理', val: item.pharmacology }, { label: '附藥說明', val: item.directions }, { label: '註', val: item.note }].map((field, i) => (<div key={i}><h4 className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-2 mb-3 text-sm tracking-widest">{field.label}</h4>{renderFormattedText(field.val)}</div>))}
      </div>
      {displayAlert && (<div className="mt-12 p-4 border-t border-b border-red-200 text-red-700 text-sm"><strong className="block mb-1">⚠️ 重要提醒：</strong>{displayAlert}</div>)}
    </div>
  );
}

export function FormulaContent({ item, renderFormattedText }) {
  const alertContent = item.alert || "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。";
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-[#6B9080] mb-8">{item.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#6B7A6E] mb-10">
        <p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p><p><strong>來源：</strong> {item.source || '無記載'}</p>
        <p className="col-span-2"><strong>功效：</strong> {item.effect || '無記載'}</p>
      </div>
      <div className="space-y-8 text-[#3A4F3F]">
        {[{ label: '製法用量', val: item.preparation }, { label: '主治', val: item.indications }, { label: '文獻別錄', val: item.literature }, { label: '方義分析', val: item.analysis }, { label: '方論', val: item.discussion }, { label: '辨證要點', val: item.syndrome }, { label: '加減變化', val: item.modifications }, { label: '注意禁忌', val: item.contraindication }, { label: '現代應用', val: item.modernApp }, { label: '附方', val: item.prescription }].map((field, i) => (<div key={i}><h4 className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-2 mb-3 text-sm tracking-widest">{field.label}</h4>{renderFormattedText(field.val)}</div>))}
      </div>
      {alertContent && (<div className="mt-12 p-4 border-t border-b border-red-200 text-red-700 text-sm"><strong className="block mb-1">⚠️ 重要提醒：</strong>{alertContent}</div>)}
    </div>
  );
}

export function OilContent({ item, renderFormattedText }) {
  const getVal = (...keys) => {
    for (const key of keys) {
      if (item[key]) return item[key];
      if (item.oilDetails?.[key]) return item.oilDetails[key];
      if (item.oilTable?.[key]) return item.oilTable[key];
    }
    return null;
  };
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium text-[#6B7A6E]">
        <span className="px-2 py-0.5 bg-[#EAE7E0] rounded">{item.constitutionTag || "無"}體質</span>
        <span className="px-2 py-0.5 bg-[#E5EAE6] rounded text-[#4E6654]">{item.chemicalTag || "無"}屬性</span>
      </div>
      <h2 className="text-4xl font-bold text-[#6B9080] mb-2">{item.name}</h2>
      <p className="text-base italic text-[#A39284] mb-10 border-b border-[#E5E0D8] pb-4">{item.englishName}</p>
      
      <div className="mb-10">
        <table className="w-full text-[15px]">
          <tbody>{[
            { label: '別名', keys: ['alias'] }, { label: '性味', keys: ['nature'] }, { label: '屬性', keys: ['property'] }, { label: '植物', keys: ['typePart', 'plantPart'] }, { label: '萃取', keys: ['method', 'extraction'] }, { label: '拉丁', keys: ['latin'] }, { label: '科名', keys: ['family'] }, { label: '歸經', keys: ['meridian'] }, { label: '主治', keys: ['indications'] }, { label: '音符', keys: ['noteAnalogy'] }, { label: '星球', keys: ['planet'] }, { label: '產地', keys: ['origin'] }
          ].map((row, i) => (
            <tr key={i} className="border-b border-[#E5E0D8]/50">
              <td className="py-3 font-bold text-[#4E6654] w-24 align-top">{row.label}</td>
              <td className="py-3 text-[#3A4F3F]">{renderFormattedText(getVal(...row.keys) || "無記載")}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="space-y-10 text-[#3A4F3F]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">🔍 氣味</h4>{renderFormattedText(getVal('scent') || "無記載")}</div>
          <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">✨ 外觀</h4>{renderFormattedText(getVal('appearance') || "無記載")}</div>
        </div>
        <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">📜 應用歷史</h4>{renderFormattedText(getVal('historyMyth', 'history', 'myth') || "無記載")}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">🔬 化學</h4>{renderFormattedText(getVal('chemistry', 'chemical') || "無記載")}</div>
          <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">⚖️ 屬性</h4>{renderFormattedText(getVal('attribute', 'property') || "無記載")}</div>
        </div>
        <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">🩺 深度效能</h4>{['mind', 'body', 'skin'].map((key, i) => (<div key={i} className="mb-4"><span className="text-xs font-bold text-[#6B9080]">{key.toUpperCase()}療效</span><div className="mt-1">{renderFormattedText(getVal(key+'Effect', key) || "無記載")}</div></div>))}</div>
        <div><h4 className="font-bold text-[#4E6654] border-b border-[#E5E0D8] pb-1 mb-3 text-sm">🔗 綜合應用</h4>{['blendingOils', 'formulas', 'carrierOil', 'usage'].map((k, i) => (<div key={i} className="mb-4"><span className="text-sm font-bold text-[#4E6654]">{k.toUpperCase()}</span><div className="mt-1">{renderFormattedText(getVal(k) || "無記載")}</div></div>))}</div>
      </div>
    </div>
  );
}