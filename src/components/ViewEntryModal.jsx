import React from 'react';
import PreviewRenderer from './PreviewRenderer';

// ViewEntryModal.jsx
export default function ViewEntryModal({ item, onClose }) {
  if (!item) return null;

  return (
    // 修改處：移除 fixed, inset-0, bg-black/45, backdrop-blur-sm, z-[9999], flex 等所有彈窗容器屬性
    // 將其改為標準的頁面內容容器
    <div className="w-full max-w-5xl mx-auto py-10 md:py-16 px-6 md:px-10 bg-[#FBF9F6]">
      
      {/* 關閉按鈕：改為普通按鈕樣式，並移除 absolute 定位，避免覆蓋問題 */}
      <div className="mb-8">
        <button 
          onClick={onClose} 
          className="text-[#A39284] hover:text-[#3A4F3F] transition-colors font-medium flex items-center gap-2"
        >
          ← 返回列表
        </button>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#E5E0D8]">
        {/* 渲染 PreviewRenderer 以顯示完整內容 */}
        <div className="w-full">
           <h1 className="text-3xl font-bold text-[#3A4F3F] mb-6">{item.name}</h1>
           {/* 若要顯示完整百科內容，建議使用 PreviewRenderer */}
           <PreviewRenderer item={item} />
        </div>
      </div>
    </div>
  );
}