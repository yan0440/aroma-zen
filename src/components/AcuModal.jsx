import React from 'react';

// --- 強化版格式化邏輯 ---
const parseBoldSyntax = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (line.trim() === '') return <div key={idx} className="h-2" />; 
    const lineStartRegex = /^(肌肉|神經|血管)([：:])/;
    const parts = line.split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g);
    
    return (
      <div key={idx} className="mb-1 leading-7">
        {parts.map((part, i) => {
          if (!part) return null;
          if (part.startsWith('==') && part.endsWith('==')) return <mark key={i} className="bg-[#F3E1C5] text-[#2C3C30] px-1 py-0.5 rounded-md font-bold mx-0.5 shadow-sm">{part.slice(2, -2)}</mark>;
          if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-[#1A261C] font-bold">{part.slice(2, -2)}</strong>;
          if ((part.startsWith('《') && part.endsWith('》')) || (part.startsWith('【') && part.endsWith('】'))) return <strong key={i} className="text-[#1A261C] font-bold">{part}</strong>;
          if (lineStartRegex.test(part)) {
            return part.replace(lineStartRegex, (match, keyword, colon) => (
              <span key={i}><strong className="text-[#1A261C] font-bold">{keyword}</strong>{colon}</span>
            ));
          }
          return part;
        })}
      </div>
    );
  });
};

const UI = {
  text: "text-[15px] leading-8 text-[#6B7A6E]", 
  title: "text-4xl font-bold text-[#6B9080] mb-2",
  sectionLabel: "font-bold text-[#4E6654] block border-b border-[#E5E0D8] pb-1 mb-2 text-sm tracking-widest"
};

export default function AcuModal({ item, onClose }) {
  if (!item) return null;
  const acuTable = item.acuTable || {};
  const acuDetails = item.acuDetails || {};

  const renderFormattedText = (text, customClasses = "") => {
    if (!text) return <span className="italic text-gray-400">無記載</span>;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <div className={`${UI.text} ${customClasses}`}>
        {lines.map((line, i) => (
          <div key={i} className="mb-1">{parseBoldSyntax(line)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E0D8]/60 sticky top-8">
            <span className="text-[11px] font-medium tracking-widest px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#5C6B5F]">{item.category || '穴道'}百科</span>
            <h2 className={UI.title}>{item.name}</h2>
            <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E5E0D8]/40 pb-4">CODE: {acuTable?.code || 'N/A'}</p>
            <div className="space-y-4 text-sm text-[#3A4F3F]">
              <p><strong>經絡：</strong> {acuTable?.meridian || '無記載'}</p>
              <p><strong>別名：</strong> {acuTable?.alias || '無記載'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#E5E0D8]/60">
            <div className="space-y-8">
              <div><h4 className={UI.sectionLabel}>主治</h4>{renderFormattedText(acuDetails?.indications)}</div>
              <div><h4 className={UI.sectionLabel}>類別</h4>{renderFormattedText(acuDetails?.type)}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h4 className={UI.sectionLabel}>釋名</h4>{renderFormattedText(acuDetails?.nameExpl)}</div>
                <div><h4 className={UI.sectionLabel}>位置</h4>{renderFormattedText(acuDetails?.location)}</div>
              </div>
              

              {/* 解剖、操作、配穴、功效區塊 */}
              <div className="space-y-6">
                {/* 解剖 */}
                {acuDetails?.anatomy && (
                  <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
                    <span className={UI.sectionLabel}>💀 解剖</span>
                    {acuDetails.anatomy.split('\n').filter(l => l.trim()).map((line, i) => {
                      const colonIndex = line.indexOf('：');
                      const isLabel = /^(肌肉|神經|血管)/.test(line) && colonIndex !== -1 && colonIndex < 8;
                      return (
                        <div key={i} className={`mb-1 ${isLabel ? 'flex flex-wrap items-baseline' : ''}`}>
                          {isLabel ? (
                            <>
                              <strong className="text-[#3A4F3F] font-bold mr-1">{line.substring(0, colonIndex + 1)}</strong>
                              <span className="flex-1">{parseBoldSyntax(line.substring(colonIndex + 1))}</span>
                            </>
                          ) : parseBoldSyntax(line)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 🎯 操作區塊 */}
                <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#3A4F3F]/10">
                  <span className={UI.sectionLabel}>🎯 操作</span>
                  {renderFormattedText(acuDetails?.operation)}
                </div>

                {/* ✨ 功效區塊 */}
                <div className="bg-white border border-[#E5E0D8]/60 rounded-xl p-6 shadow-sm">
                  <h4 className={UI.sectionLabel}>✨ 功效</h4>
                  <div className="space-y-4 mt-4">
                    <div>
                      <span className="font-bold text-[#4E6654] text-[15px] block mb-1">【古代功效】</span>
                      {renderFormattedText(acuDetails?.effectAncient)}
                    </div>
                    <div>
                      <span className="font-bold text-[#4E6654] text-[15px] block mb-1">【現代功效】</span>
                      {renderFormattedText(acuDetails?.effectModern)}
                    </div>
                  </div>
                </div>

                {/* 🔗 配穴區塊 (獨立) */}
                <div className="bg-[#3A4F3F]/5 p-6 rounded-xl border border-[#3A4F3F]/10">
                  <h4 className={UI.sectionLabel}>🔗 配穴建議</h4>
                  <div className={UI.text}>
                    {acuDetails?.matchingPoints ? (
                      acuDetails.matchingPoints.split('\n').filter(l => l.trim()).map((line, i) => {
                        const colonIndex = line.indexOf('：');
                        return (
                          <div key={i} className="mb-2 flex flex-wrap items-baseline">
                            {colonIndex !== -1 ? (
                              <>
                                <strong className="text-[#3A4F3F] font-bold mr-1 shrink-0">{line.substring(0, colonIndex + 1)}</strong>
                                <span>{parseBoldSyntax(line.substring(colonIndex + 1))}</span>
                              </>
                            ) : (
                              parseBoldSyntax(line)
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="italic text-gray-400">無記載配穴資訊</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}