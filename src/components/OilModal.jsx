import React from 'react';

export default function OilModal({ item, onClose }) {
  if (!item) return null;

  // 🧠 智慧型段落渲染助手：安全、標準且相容所有系統與 Linter 檢查
  const renderSmartParagraphs = (text, customClasses = "") => {
    if (!text) return null;
    return text
      .split(/\\n|\r?\n/)
      .filter(p => p.trim() !== '')
      .map((paragraph, index) => {
        // 🔍 修正後的乾淨語法，移除 useless escape，百分之百通過 ESLint 檢查
        const isNumbered = /^(\d+[.、)]|[\u2460-\u2473])/.test(paragraph.trim());
        return (
          <p 
            key={index} 
            className={`text-justify leading-relaxed break-all ${isNumbered ? 'pl-6 -indent-6' : ''} ${customClasses}`}
          >
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30 text-sm" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl">✕</button>

        {/* 🏷️ 頂部獨立的體質與屬性標籤 */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EAE7E0] text-[#6B7A6E]">
            {item.constitutionTag}體質
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E5EAE6] text-[#4E6654]">
            {item.chemicalTag}屬性
          </span>
        </div>

        <h2 className="text-3xl font-bold text-[#3A4F3F]">{item.name}</h2>
        
        {/* 🔤 英文名字 */}
        <p className="text-base italic text-[#A39284] mt-1 mb-6 font-serif border-b border-[#F7F5F0] pb-4">
          {item.englishName}
        </p>

        {/* 📊 精油 11 項表格 */}
        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0EDE6] text-[#3A4F3F] font-bold border-b border-[#E5E0D8]">
                <th className="px-4 py-2.5 w-1/3 border-r border-[#E5E0D8]">精油指標項目</th>
                <th className="px-4 py-2.5">百科記載內容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[#3A4F3F]">
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">植物種類/萃取部位</td><td className="px-4 py-2">{item.oilTable?.typePart}</td></tr>
              <tr className="bg-[#FBFBFA]/40"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">萃取方法</td><td className="px-4 py-2">{item.oilTable?.method}</td></tr>
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">拉丁學名</td><td className="px-4 py-2 italic">{item.oilTable?.latin}</td></tr>
              <tr className="bg-[#FBFBFA]/40"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">科名</td><td className="px-4 py-2">{item.oilTable?.family}</td></tr>
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">性味</td><td className="px-4 py-2">{item.oilTable?.nature}</td></tr>
              <tr className="bg-[#FBFBFA]/40"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">歸經</td><td className="px-4 py-2">{item.oilTable?.meridian}</td></tr>
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">適用體質</td><td className="px-4 py-2">{item.oilTable?.constitution}</td></tr>
              <tr className="bg-[#FBFBFA]/40"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">主治功能</td><td className="px-4 py-2 break-all text-justify">{item.oilTable?.indications}</td></tr>
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">類比音符</td><td className="px-4 py-2">{item.oilTable?.noteAnalogy}</td></tr>
              <tr className="bg-[#FBFBFA]/40"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">主宰星球</td><td className="px-4 py-2">{item.oilTable?.planet}</td></tr>
              <tr className="bg-white"><td className="px-4 py-2 font-medium bg-[#FBFBFA] border-r border-[#E5E0D8]">重要產地</td><td className="px-4 py-2">{item.oilTable?.origin}</td></tr>
            </tbody>
          </table>
        </div>

        {/* 📝 下方細節資訊 */}
        <div className="space-y-5 text-[#3A4F3F]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className="font-bold text-[#4E6654] block mb-1">🔍 氣味</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed">{item.oilDetails?.scent}</p>
            </div>
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className="font-bold text-[#4E6654] block mb-1">✨ 外觀</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed">{item.oilDetails?.appearance}</p>
            </div>
          </div>

          {/* 📜 應用歷史與相關神話 */}
          <div>
            <span className="font-bold text-[#4E6654] block mb-1.5 text-base">📜 應用歷史與相關神話</span>
            <div className="bg-[#FBFBFA] px-5 py-4 rounded-xl border border-[#E5E0D8]/30 text-[#6B7A6E]">
              {renderSmartParagraphs(item.oilDetails?.historyMyth, "mb-4 last:mb-0 text-[#6B7A6E]")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className="font-bold text-[#4E6654] block mb-1">🔬 化學結構</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed">{item.oilDetails?.chemistry}</p>
            </div>
            <div className="bg-[#FBFBFA] p-3.5 rounded-xl border border-[#E5E0D8]/40">
              <span className="font-bold text-[#4E6654] block mb-1">⚖️ 屬性</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed">{item.oilDetails?.attribute}</p>
            </div>
          </div>

          <div className="bg-red-50/40 p-4 rounded-xl border border-red-200/40">
            <span className="font-bold text-red-800 block mb-1 text-xs">⚠️ 注意事項</span>
            <p className="text-red-700/90 text-xs leading-relaxed">{item.oilDetails?.caution}</p>
          </div>

          {/* 🩺 深度效能 */}
          <div className="space-y-4 bg-[#F7F5F0]/60 p-4 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-1.5 mb-1 text-base">🩺 深度效能</span>
            
            <div>
              <span className="font-bold text-[#4E6654] text-xs block mb-1">🧠 心靈療效：</span>
              <div className="pl-2 border-l-2 border-[#A39284] text-xs">
                {renderSmartParagraphs(item.oilDetails?.mindEffect, "mb-1.5 last:mb-0 text-[#6B7A6E]")}
              </div>
            </div>

            <div>
              <span className="font-bold text-[#4E6654] text-xs block mb-1">💪 身體療效：</span>
              <div className="pl-2 border-l-2 border-[#A39284] text-xs">
                {renderSmartParagraphs(item.oilDetails?.bodyEffect, "mb-1.5 last:mb-0 text-[#6B7A6E]")}
              </div>
            </div>

            <div>
              <span className="font-bold text-[#4E6654] text-xs block mb-1">🧴 皮膚療效：</span>
              <div className="pl-2 border-l-2 border-[#A39284] text-xs">
                {renderSmartParagraphs(item.oilDetails?.skinEffect, "mb-1.5 last:mb-0 text-[#6B7A6E]")}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <div><span className="font-bold block text-xs">🔗 適合與之調和的精油</span><p className="text-[#6B7A6E] text-xs mt-0.5">{item.oilDetails?.blendingOils}</p></div>
            <div className="mt-2"><span className="font-bold block text-xs">🧪 精油配方</span><p className="text-[#3A4F3F] font-medium text-xs mt-0.5">{item.oilDetails?.formulas}</p></div>
            <div className="mt-2"><span className="font-bold block text-xs">🧴 按摩基底油</span><p className="text-[#6B7A6E] text-xs mt-0.5">{item.oilDetails?.carrierOils}</p></div>
            
            {/* 🚀 使用方法 */}
            <div className="mt-2 border-t border-[#E5E0D8] pt-2">
              <span className="font-bold block text-xs text-[#4E6654] mb-1.5">🚀 使用方法</span>
              <div className="text-xs px-1">
                {renderSmartParagraphs(item.oilDetails?.usage, "mb-2 last:mb-0 text-[#3A4F3F]")}
              </div>
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