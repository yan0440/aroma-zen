import React from 'react';

// --- 格式化函數 (直接定義在檔案內，確保可被組件使用) ---
const parseBoldSyntax = (str) => {
  if (!str) return str;
  const lineStartRegex = /^(肌肉|神經|血管)([：:])/;
  const parts = str.split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g);
  
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('==') && part.endsWith('==')) {
      return <mark key={i} className="bg-[#F3E1C5] text-[#2C3C30] px-1 py-0.5 rounded-md font-bold mx-0.5 shadow-sm">{part.slice(2, -2)}</mark>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith('《') && part.endsWith('》')) || (part.startsWith('【') && part.endsWith('】'))) {
      return <strong key={i} className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{part}</strong>;
    }
    if (lineStartRegex.test(part)) {
      return part.replace(lineStartRegex, (match, keyword, colon) => (
        <React.Fragment key={i}>
          <strong className="text-[#1A261C]" style={{ fontWeight: 'bold' }}>{keyword}</strong>{colon}
        </React.Fragment>
      ));
    }
    return part;
  });
};

const renderFormattedText = (text, customClasses = "") => {
  if (!text) return <span className="italic text-gray-400">無記載</span>;
  const lines = typeof text === 'string' ? text.split('\n').filter(line => line.trim() !== '') : [text];
  
  return (
    <div className={`text-[15px] leading-8 text-[#6B7A6E] ${customClasses}`}>
      {lines.map((line, i) => (
        <div key={i} className="mb-1">
          {typeof line === 'string' ? parseBoldSyntax(line) : line}
        </div>
      ))}
    </div>
  );
};

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080]",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest"
};

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="w-full h-auto py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E0D8]/60 sticky top-8">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">
                {item.constitutionTag || item.oilDetails?.constitutionTag || "無"}體質
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">
                {item.chemicalTag || item.oilDetails?.chemicalTag || "無"}屬性
              </span>
            </div>
            <h2 className={UI.title}>{item.name}</h2>
            <p className="text-base italic text-[#A39284] mt-1 mb-6 font-serif border-b border-[#F7F5F0] pb-4">{item.englishName}</p>

            <div className="overflow-hidden border border-[#E5E0D8] rounded-xl shadow-sm">
              <table className="w-full text-[14px] border-collapse">
                <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
                  {[
                    { label: '別名', val: item.alias || item.oilDetails?.alias },
                    { label: '部位', val: item.typePart || item.oilDetails?.typePart },
                    { label: '方法', val: item.method || item.oilDetails?.method },
                    { label: '學名', val: item.latin || item.oilDetails?.latin },
                    { label: '科名', val: item.family || item.oilDetails?.family },
                    { label: '性味', val: item.oilDetails?.nature },
                    { label: '五行', val: item.oilDetails?.property },
                    { label: '歸經', val: item.oilDetails?.meridian },
                    { label: '主治', val: item.oilDetails?.indications },
                    { label: '音符', val: item.oilDetails?.noteAnalogy },
                    { label: '星球', val: item.oilDetails?.planet },
                    { label: '產地', val: item.oilDetails?.origin }
                  ].map((row, i) => (
                    <tr key={i} className="bg-[#FBFBFA]/40">
                      <td className="px-3 py-2 font-bold bg-[#FBFBFA] border-r border-[#E5E0D8] w-[35%]">{row.label}</td>
                      <td className="px-3 py-2">{renderFormattedText(row.val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#E5E0D8]/60">
            <div className="space-y-8 text-[#3A4F3F]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><span className={UI.sectionLabel}>🔍 氣味</span>{renderFormattedText(item.oilDetails?.scent)}</div>
                <div><span className={UI.sectionLabel}>✨ 外觀</span>{renderFormattedText(item.oilDetails?.appearance)}</div>
              </div>

              <div>
                <span className="font-bold text-[#4E6654] block mb-2 text-base">📜 應用歷史與相關神話</span>
                <div className="bg-[#F7F5F0]/40 p-5 rounded-xl border border-[#E5E0D8]/30">{renderFormattedText(item.oilDetails?.historyMyth)}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><span className={UI.sectionLabel}>🔬 化學結構</span>{renderFormattedText(item.oilDetails?.chemistry)}</div>
                <div><span className={UI.sectionLabel}>⚖️ 屬性補充</span>{renderFormattedText(item.oilDetails?.attribute)}</div>
              </div>

              {item.oilDetails?.caution && (
                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                  <span className="font-bold text-red-800 text-sm block mb-2">⚠️ 注意事項</span>
                  {renderFormattedText(item.oilDetails?.caution)}
                </div>
              )}

              <div className="space-y-6 pt-4">
                <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-2">🩺 深度療效</span>
                <div className="space-y-4">
                  {[ 
                    { t: "心靈療效", v: item.oilDetails?.mindEffect, icon: "🧠" }, 
                    { t: "身體療效", v: item.oilDetails?.bodyEffect, icon: "💪" }, 
                    { t: "皮膚療效", v: item.oilDetails?.skinEffect, icon: "🧴" } 
                  ].map((ef, i) => (
                    <div key={i} className="flex gap-4 border-b border-[#F7F5F0] pb-4 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-24 pt-1">
                        <div className="flex items-center gap-2 text-[#4E6654] font-bold text-sm"><span>{ef.icon}</span>{ef.t}</div>
                      </div>
                      <div className="flex-grow text-[14px] leading-7 text-[#6B7A6E]">
                        {renderFormattedText(ef.v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6">
                <div><span className={UI.sectionLabel}>🔗 適合調和的精油</span>{renderFormattedText(item.oilDetails?.blendingOils)}</div>
                <div><span className={UI.sectionLabel}>🧪 精油配方</span>{renderFormattedText(item.oilDetails?.formulas)}</div>
                <div><span className={UI.sectionLabel}>🧴 按摩基底油</span>{renderFormattedText(item.oilDetails?.carrierOil)}</div>
                <div><span className={UI.sectionLabel}>🚀 使用方法</span>{renderFormattedText(item.oilDetails?.usage)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}