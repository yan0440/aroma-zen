import React from 'react';
import PreviewRenderer from './PreviewRenderer';

export default function ViewEntryModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 md:py-16 px-6 md:px-10 bg-[#FBF9F6]">
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="text-[#A39284] hover:text-[#3A4F3F] transition-colors font-medium flex items-center gap-2"
        >
          ← 返回列表
        </button>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-[#E5E0D8]">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-[#3A4F3F] mb-6">{item.name}</h1>
          <PreviewRenderer item={item} />
        </div>
      </div>
    </div>
  );
}
