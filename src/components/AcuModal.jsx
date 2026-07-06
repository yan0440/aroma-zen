import React from 'react';

export default function AcuModal({ item, onClose }) {
  if (!item) return null;
  const { acuTable, acuDetails } = item;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-[#E5E0D8]/30 text-sm" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A39284] hover:text-[#3A4F3F] text-xl">✕</button>

        <div className="mb-2">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-[#F0EDE6] text-[#3A4F3F]">{item.category}百科 · {item.tag}</span>
        </div>

        <h2 className="text-3xl font-bold text-[#3A4F3F]">{item.name}</h2>
        <p className="text-base italic tracking-wider text-[#A39284] mt-1 mb-6 font-mono border-b border-[#F7F5F0] pb-4">國際代碼: {acuTable.code}</p>

        {/* 📊 穴道專屬 4 項表格 */}
        <div className="overflow-hidden border border-[#E5E0D8] rounded-xl mb-8 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E5E0D8] text-[#3A4F3F] font-bold border-b border-[#E5E0D8]">
                <th className="px-4 py-2.5 border-r border-[#D5CFC6]">穴名</th>
                <th className="px-4 py-2.5 border-r border-[#D5CFC6]">別名</th>
                <th className="px-4 py-2.5 border-r border-[#D5CFC6]">經絡</th>
                <th className="px-4 py-2.5">國際代碼</th>
              </tr>
            </thead>
            <tbody className="text-[#3A4F3F] bg-white">
              <tr>
                <td className="px-4 py-3 font-bold border-r border-[#E5E0D8]">{acuTable.name}</td>
                <td className="px-4 py-3 border-r border-[#E5E0D8] text-[#6B7A6E]">{acuTable.alias}</td>
                <td className="px-4 py-3 border-r border-[#E5E0D8] font-medium">{acuTable.meridian}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#A39284]">{acuTable.code}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 📝 穴道表格下方 7 大內容 */}
        <div className="space-y-5 text-[#3A4F3F]">
          <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40">
            <span className="font-bold text-[#4E6654] block mb-1.5 text-xs tracking-wider">🏷️ 類別</span>
            <p className="text-[#3A4F3F] font-medium text-xs">{acuDetails.type}</p>
          </div>

          <div>
            <span className="font-bold text-[#4E6654] block mb-1 text-sm">📖 釋名</span>
            <p className="text-[#6B7A6E] leading-relaxed bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/30">{acuDetails.nameExpl}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40 flex flex-col">
              <span className="font-bold text-[#4E6654] block mb-1.5 text-xs">📍 位置</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed flex-grow">{acuDetails.location}</p>
            </div>
            <div className="bg-[#FBFBFA] p-4 rounded-xl border border-[#E5E0D8]/40 flex flex-col">
              <span className="font-bold text-[#4E6654] block mb-1.5 text-xs">💀 解剖</span>
              <p className="text-[#6B7A6E] text-xs leading-relaxed flex-grow">{acuDetails.anatomy}</p>
            </div>
          </div>

          <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className="font-bold text-[#3A4F3F] block mb-1.5 text-sm">🎯 操作</span>
            <p className="text-[#6B7A6E] text-xs leading-relaxed">{acuDetails.operation}</p>
          </div>

          {/* 功效（分古代、現代） */}
          <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#F0EDE6] px-4 py-2 font-bold text-sm text-[#3A4F3F] border-b border-[#E5E0D8]">✨ 功效</div>
            <div className="divide-y divide-[#E5E0D8]">
              <div className="p-4">
                <span className="font-bold text-[#A39284] text-xs block mb-1">【古代功效記載】</span>
                <p className="text-[#6B7A6E] text-xs leading-relaxed">{acuDetails.effectAncient}</p>
              </div>
              <div className="p-4 bg-[#FBFBFA]">
                <span className="font-bold text-[#4E6654] text-xs block mb-1">【現代臨床應用】</span>
                <p className="text-[#3A4F3F] text-xs leading-relaxed font-medium">{acuDetails.effectModern}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#3A4F3F]/5 p-4 rounded-xl border border-[#3A4F3F]/10">
            <span className="font-bold block text-xs text-[#3A4F3F] mb-1">🔗 配穴</span>
            <p className="text-[#6B7A6E] text-xs leading-relaxed">{acuDetails.matchingPoints}</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#F7F5F0] text-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#3A4F3F] hover:bg-[#2C3C30] text-white text-xs font-medium rounded-xl transition-all">關閉並返回列表</button>
        </div>
      </div>
    </div>
  );
}