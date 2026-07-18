import React, { useMemo } from 'react';
import * as Content from './ContentRenderer';

export default function PreviewRenderer({ item }) {
  // 使用 useMemo 優化效能，確保只有在 item 內容改變時才會觸發重新渲染
  const content = useMemo(() => {
    if (!item) {
      return <div className="p-8 text-center text-[#A39284]">無資料</div>;
    }

    // 根據類別切換渲染器
    switch (item.category) {
      case '書籍':
        // 若 BookContent 需要額外邏輯，請確保其內部已進行 memo 優化
        return <Content.BookContent item={item} />;
      case '穴道':
        return <Content.AcuContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '中藥':
        return <Content.HerbContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '方劑':
        return <Content.FormulaContent item={item} renderFormattedText={Content.renderFormattedText} />;
      case '精油':
        return <Content.OilContent item={item} renderFormattedText={Content.renderFormattedText} />;
      default:
        return <div className="p-8 text-center text-[#A39284]">暫無此類別 UI 設定。</div>;
    }
  }, [item]); // 依賴項僅為 item

  return (
    <div className="w-full h-auto">
      {content}
    </div>
  );
}