import React from 'react';
import * as Content from './ContentRenderer';

export default function EncyclopediaPage({ item, onBack }) {
  if (!item) return <div className="p-20 text-center">查無資料</div>;

  const renderContent = () => {
    switch (item.category) {
      case '穴道': return <Content.AcuContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '中藥': return <Content.HerbContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '方劑': return <Content.FormulaContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '精油': return <Content.OilContent item={item} renderFormattedText={Content.renderFormattedText} />;
      default: return <div>類別不支援</div>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBF9F6]">
      {/* 頂部導覽列 */}
      <div className="max-w-4xl mx-auto px-6 py-6 border-b border-[#E5E0D8]">
        <button onClick={onBack} className="text-[#A39284] hover:text-[#3A4F3F] flex items-center gap-2">
          ← 返回後台列表
        </button>
      </div>
      
      {/* 全螢幕內容區域 */}
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
}