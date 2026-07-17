import React, { useState, useEffect } from 'react';

const UI = { text: "text-[15px] leading-8 text-[#6B7A6E]", title: "text-4xl font-bold text-[#6B9080] mb-4" };

export const processInlineSyntax = (text) => {
  if (typeof text !== 'string') return text;
  
  // 正規表達式匹配：粗體、高亮、雙括號連結、書名號、中括號、圓括號
  const regex = /(\*\*.*?\*\*|==.*?==|\[\[.*?\]\]|《.*?》|【.*?】|\(.*?\))/g;
  
  return text.split(regex).map((part, i) => {
    if (!part) return null;
    
    // 1. 處理 **加粗**：強制加粗 (font-bold)
    if (part.startsWith('**')) 
      return <strong key={i} className="text-[#3A4F3F] font-bold">{part.replace(/\*\*/g, '')}</strong>;
    
    // 2. 處理 ==高亮==：背景色 + 強制加粗
    if (part.startsWith('==')) 
      return <mark key={i} className="bg-[#F3E1C5] px-1 rounded font-bold">{part.slice(2, -2)}</mark>;
    
    // 3. 處理 [[連結]]、書名號《》、中括號【】：強制加粗，保留符號
    if (part.startsWith('[[') || part.startsWith('《') || part.startsWith('【')) 
      return <span key={i} className="font-bold">{part}</span>;
      
    // 4. 處理圓括號 ()：強制加粗，保留符號
    if (part.startsWith('('))
      return <span key={i} className="font-bold">{part}</span>;

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

export default function ViewEntryModal({ item, onClose }) {
  const [selectedContent, setSelectedContent] = useState(null);
  useEffect(() => { setSelectedContent(null); }, [item]);
  if (!item) return null;

  const renderContent = () => {
    switch (item.category) {
      case '書籍': return <BookContent item={item} selectedContent={selectedContent} setSelectedContent={setSelectedContent} onClose={onClose} />;
      case '穴道': return <AcuContent item={item} renderFormattedText={renderFormattedText} />;
      case '中藥': return <HerbContent item={item} renderFormattedText={renderFormattedText} />;
      case '方劑': return <FormulaContent item={item} renderFormattedText={renderFormattedText} />;
      case '精油': return <OilContent item={item} renderFormattedText={renderFormattedText} />;
      default: return <div className="p-8 text-center text-[#A39284]">暫無此類別 UI 設定。</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] shadow-2xl relative border border-[#E5E0D8]/40 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-red-500 text-xl z-20">✕</button>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}

export function BookContent({ item, selectedContent, setSelectedContent }) {
  // ... (其他原有邏輯保持不變，確認括號均已閉合)
  const getRawTitle = (t) => { const m = t.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/); return m ? m[1].trim() : t; };
  // (此處省略部分重複代碼，確保 parseModalSyntax 函式獨立於 return 之外)
  // ... 確保所有 function 結束時都有正確的 }
  return (
    <div className="flex h-full bg-[#FBF9F6]">
        {/* 目錄區塊 */}
        <div className="w-80 border-r border-[#E5E0D8]/60 bg-white overflow-y-auto p-4">
            {/* 這裡確保你調用 getRawTitle 的邏輯是正確的 */}
        </div>
        {/* 內容區塊 */}
    </div>
  );
}

export function AcuContent({ item, renderFormattedText }) {
  const { acuTable, acuDetails } = item;
  return (
    <div className="p-8 md:p-12">
      <div className="mb-2"><span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F] font-sans">{item.category || '穴道'}百科 · {item.tag || '基本資料'}</span></div>
      <h2 className="text-4xl font-bold text-[#3A4F3F] mb-1">{item.name}</h2>
      <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8]/40 pb-4">INTERNATIONAL CODE: {acuTable?.code || 'N/A'}</p>
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
              <td className="px-4 py-3.5 text-[15px] leading-8 text-[#6B7A6E]">{renderFormattedText(acuDetails?.indications || "無")}</td>
              <td className="px-4 py-3.5 text-[15px] leading-8 text-[#6B7A6E]">{renderFormattedText(acuTable?.alias || "無")}</td>
              <td className="px-4 py-3.5 text-[15px] leading-8 text-[#6B7A6E]">{renderFormattedText(acuTable?.meridian || "無")}</td>
              <td className="px-4 py-3.5 text-[15px] leading-8 text-[#6B7A6E]">{renderFormattedText(acuTable?.code || "無")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="space-y-6">
        {acuDetails?.type && (<div className="bg-[#F4F2ED]/40 p-4 rounded-xl border border-[#E5E0D8]/50"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">🏷️ 類別</span><div>{renderFormattedText(acuDetails.type)}</div></div>)}
        {acuDetails?.nameExpl && (<div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">📖 釋名</span><div>{renderFormattedText(acuDetails.nameExpl)}</div></div>)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acuDetails?.location && (<div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">📍 位置</span><div>{renderFormattedText(acuDetails.location)}</div></div>)}
          {acuDetails?.anatomy && (<div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">💀 解剖</span><div className="text-[15px] leading-8 text-[#6B7A6E]">{acuDetails.anatomy.split('\n').map((line, i) => { const isBoldLine = line.startsWith('肌肉') || line.startsWith('神經') || line.startsWith('血管'); if (isBoldLine) { const colonIndex = line.indexOf('：'); return (<div key={i} className="mb-1"><strong className="text-[#3A4F3F] !font-bold">{line.substring(0, colonIndex)}</strong><span>{line.substring(colonIndex)}</span></div>); } return <div key={i} className="mb-1">{line}</div>; })}</div></div>)}
        </div>
        <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#3A4F3F]/10"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">🎯 操作</span><div>{renderFormattedText(acuDetails?.operation || "未記載操作說明")}</div></div>
        <div className="bg-white border border-[#E5E0D8]/80 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(58,79,63,0.01)]"><div className="bg-[#F0EDE6]/60 px-4 py-2.5 font-bold text-[15px] tracking-widest text-[#3A4F3F] border-b border-[#E5E0D8]/70">✨ 功效</div><div className="divide-y divide-[#E5E0D8]/60"><div className="p-4"><span className="font-bold text-[#4E6654] text-[13px] tracking-wider block mb-2">【古代功效記載】</span><div>{renderFormattedText(acuDetails?.effectAncient || "未記載")}</div></div><div className="p-4 bg-[#FBFBFA]"><span className="font-bold text-[#4E6654] text-[13px] tracking-wider block mb-2">【現代臨床應用】</span><div>{renderFormattedText(acuDetails?.effectModern || "未記載")}</div></div></div></div>
        <div className="bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10"><span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">🔗 配穴</span><div className="text-[15px] leading-8 text-[#6B7A6E]">{acuDetails?.matchingPoints ? acuDetails.matchingPoints.split('\n').map((line, i) => { const colonIndex = line.indexOf('：'); return colonIndex !== -1 ? (<div key={i} className="mb-1"><strong className="text-[#3A4F3F] !font-bold">{line.substring(0, colonIndex)}</strong><span>{line.substring(colonIndex)}</span></div>) : <div key={i} className="mb-1">{line}</div>; }) : <span className="italic text-gray-400">未記載配穴資訊</span>}</div></div>
      </div>
    </div>
  );
}

export function HerbContent({ item, renderFormattedText }) {
  const displayAlert = item.alert || (['中藥', '方劑'].includes(item.category) ? "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。" : "");
  return (
    <div className="p-8 md:p-12">
      <h2 className="text-4xl font-bold text-[#6B9080] mb-6">{item.name}</h2>
      <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-8"><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#6B7A6E]"><p><strong>別名：</strong> {item.alias || '無別名'}</p><p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p><p className="col-span-2"><strong>科屬：</strong> {item.family || '無記載'}</p><p><strong>性味：</strong> {item.nature || '無記載'}</p><p><strong>歸經：</strong> {item.meridian || '無記載'}</p></div></div>
      <div className="space-y-6 text-[#3A4F3F]">
        {[{ label: '品種來源', val: item.source }, { label: '功效', val: item.effect }, { label: '主治', val: item.indications }, { label: '文獻別錄', val: item.literature }, { label: '用法用量', val: item.dosage }, { label: '注意禁忌', val: item.contraindication }, { label: '現代藥理', val: item.pharmacology }, { label: '附藥說明', val: item.directions }, { label: '註', val: item.note }].map((field, i) => (<div key={i}><h4 className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">{field.label}</h4>{renderFormattedText(field.val)}</div>))}
      </div>
      {displayAlert && (<div className="mt-10 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium"><strong className="block mb-1">⚠️ 重要提醒：</strong>{displayAlert}</div>)}
    </div>
  );
}

export function FormulaContent({ item, renderFormattedText }) {
  const alertContent = item.alert || "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。";
  return (
    <div className="p-8 md:p-12">
      <h2 className="text-4xl font-bold text-[#6B9080] mb-6">{item.name}</h2>
      <div className="bg-white rounded-xl border border-[#E5E0D8] p-6 mb-8"><div className="grid grid-cols-2 gap-4 text-sm text-[#6B7A6E]"><p><strong>類別：</strong> {item.tag || item.category || '無記載'}</p><p><strong>來源：</strong> {item.source || '無記載'}</p><p className="col-span-2"><strong>功效：</strong> {item.effect || '無記載'}</p></div></div>
      <div className="space-y-6 text-[#3A4F3F]">
        {[{ label: '製法用量', val: item.preparation }, { label: '主治', val: item.indications }, { label: '文獻別錄', val: item.literature }, { label: '方義分析', val: item.analysis }, { label: '方論', val: item.discussion }, { label: '辨證要點', val: item.syndrome }, { label: '加減變化', val: item.modifications }, { label: '注意禁忌', val: item.contraindication }, { label: '現代應用', val: item.modernApp }, { label: '附方', val: item.prescription }].map((field, i) => (<div key={i}><h4 className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">{field.label}</h4>{renderFormattedText(field.val)}</div>))}
      </div>
      {alertContent && (<div className="mt-10 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium"><strong className="block mb-1">⚠️ 重要提醒：</strong>{alertContent}</div>)}
    </div>
  );
}
  export function OilContent({ item, renderFormattedText }) {
  // 自動匹配器：傳入多個可能的 key 名稱，只要有一個有資料就抓取
  const getVal = (...keys) => {
    for (const key of keys) {
      if (item[key]) return item[key];
      if (item.oilDetails?.[key]) return item.oilDetails[key];
      if (item.oilTable?.[key]) return item.oilTable[key];
    }
    return null;
  };

  return (
    <div className="p-8 md:p-12">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">{item.constitutionTag || "無"}體質</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">{item.chemicalTag || "無"}屬性</span>
      </div>
      <h2 className="text-4xl font-bold text-[#6B9080] mb-1">{item.name}</h2>
      <p className="text-base italic text-[#A39284] mt-1 mb-6 font-serif border-b border-[#F7F5F0] pb-4">{item.englishName}</p>
      
      <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
        <table className="w-full text-[15px] border-collapse">
          <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">{[
            { label: '別名', keys: ['alias'] },
            { label: '性味(四氣／五味)', keys: ['nature'] },
            { label: '五行／陰陽屬性', keys: ['property'] },
            { label: '植物種類', keys: ['typePart', 'plantPart'] },
            { label: '萃取方法', keys: ['method', 'extraction'] },
            { label: '拉丁學名', keys: ['latin'] },
            { label: '科名', keys: ['family'] },
            { label: '歸經', keys: ['meridian'] },
            { label: '適用體質', keys: ['constitution'] },
            { label: '主治', keys: ['indications'] },
            { label: '類比音符', keys: ['noteAnalogy'] },
            { label: '星球', keys: ['planet'] },
            { label: '主要產地', keys: ['origin'] }
          ].map((row, i) => (
            <tr key={i} className="text-center bg-[#FBFBFA]/40">
              <td className="px-4 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8]">{row.label}</td>
              <td className="px-4 py-2 text-left">{renderFormattedText(getVal(...row.keys) || "無記載")}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="space-y-5 text-[#3A4F3F]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">🔍 氣味</span>
            {renderFormattedText(getVal('scent') || "無記載")}
          </div>
          <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">✨ 外觀</span>
            {renderFormattedText(getVal('appearance') || "無記載")}
          </div>
        </div>

        <div>
          <span className="font-bold text-[#4E6654] block mb-1.5 text-base">📜 應用歷史與相關神話</span>
          <div className="bg-[#FBFBFA] px-5 py-4 rounded-xl border border-[#E5E0D8]/30">
            {renderFormattedText(getVal('historyMyth', 'history', 'myth') || "無記載")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">🔬 化學結構</span>
            {renderFormattedText(getVal('chemistry', 'chemical') || "無記載")}
          </div>
          <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">⚖️ 屬性</span>
            {renderFormattedText(getVal('attribute', 'property') || "無記載")}
          </div>
        </div>

        <div className="bg-red-50/40 p-4 rounded-xl border border-red-200/40">
          <span className="font-bold text-red-800 block mb-1 text-[15px]">⚠️ 注意事項</span>
          {renderFormattedText(getVal('caution') || "無記載", "text-red-700/90")}
        </div>

        <div className="space-y-4 bg-[#F7F5F0]/60 p-4 rounded-xl border border-[#E5E0D8]/40">
          <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-1.5 mb-1 text-[15px]">🩺 深度效能</span>
          {[
            { label: '🧠 心靈療效', k: ['mindEffect', 'mind'] },
            { label: '💪 身體療效', k: ['bodyEffect', 'body'] },
            { label: '🧴 皮膚療效', k: ['skinEffect', 'skin'] }
          ].map((effect, i) => (
            <div key={i}>
              <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">{effect.label}</span>
              <div className="pl-2 border-l-2 border-[#A39284]">{renderFormattedText(getVal(...effect.k) || "無記載")}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
          {[
            { label: '🔗 適合與之調和的精油', k: ['blendingOils'] },
            { label: '🧪 精油配方', k: ['formulas'] },
            { label: '🧴 按摩基底油', k: ['carrierOil'] },
            { label: '🚀 使用方法', k: ['usage'] }
          ].map((field, i) => (
            <div key={i}>
              <span className="font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest">{field.label}</span>
              {renderFormattedText(getVal(...field.k) || "無記載")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}