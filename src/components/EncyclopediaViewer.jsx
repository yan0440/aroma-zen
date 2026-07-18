import React from 'react';
import BookModal from './BookModal'; // 假設這是您的書籍組件路徑
import OilModal from './OilModal';   // 假設這是您的精油組件路徑
import AcuModal from './AcuModal';
import HerbModal from './HerbModal';
import FormulaModal from './FormulaModal';

export default function EncyclopediaViewer({ item, onClose }) {
  if (!item) return null;

  return (
    // 外層容器：統一的背景與遮罩效果
    <div className="fixed inset-0 z-[100] bg-[#FCFBFA] overflow-y-auto">
      
      {/* 統一的後台檢視頁首 (確保檢視時有明確的返回路徑) */}
      <div className="bg-white border-b border-[#E5E0D8] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button 
          onClick={onClose} 
          className="text-sm font-bold text-[#A39284] hover:text-[#3A4F3F] transition-all hover:scale-105"
        >
          ← 返回後台列表
        </button>
        <div className="text-xs font-bold tracking-widest text-[#6B9080] uppercase">
          開發者專區 - {item.category} 檢視預覽
        </div>
      </div>

      {/* 內容容器：統一的間距與最大寬度規範 */}
      <div className="max-w-[1400px] mx-auto py-8 px-6">
        {item.category === '書籍' && <BookModal item={item} />}
        {item.category === '精油' && <OilModal item={item} />}
        {item.category === '穴道' && <AcuModal item={item} />}
        {item.category === '中藥' && <HerbModal item={item} />}
        {item.category === '方劑' && <FormulaModal item={item} />}
      </div>
    </div>
  );
}