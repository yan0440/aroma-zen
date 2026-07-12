import React, { useState } from 'react';

export default function BookModal({ item, onClose }) {
  // 記錄當前使用者點選了哪一個子篇章的內容
  const [selectedContent, setSelectedContent] = useState(null);

  if (!item) return null;

  // 核心修改：整合了排版邏輯的解析器
  const parseModalSyntax = (str) => {
    if (typeof str !== 'string') return null;

    // 將內容按行分割
    const lines = str.split('\n').filter(line => line.trim() !== '');

    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          // 判斷是否為編號 (如: 1. 或 一、)
          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          // 判斷是否為項目符號
          const isIndented = trimmed.startsWith('●');

          // 處理特殊樣式解析的輔助函數
          const processInlineSyntax = (text) => {
            const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g;
            return text.split(regex).map((part, idx) => {
              if (!part) return null;
              if (part.startsWith('==') && part.endsWith('==')) 
                return <mark key={idx} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
              if (part.startsWith('**') && part.endsWith('**')) 
                return <strong key={idx} className="text-[#AAB8AB]" style={{ fontWeight: 700 }}>{part.replace(/\*\*/g, '')}</strong>;
              if (part.startsWith('《') && part.endsWith('》'))
                return <span key={idx} className="text-[#AAB8AB]" style={{ fontWeight: 700 }}>{part}</span>;
              if (part.startsWith('【') && part.endsWith('】')) {
                const hasAlias = part.match(/\(([^)]+)\)/);
                return (
                  <span key={idx} className="flex flex-wrap items-center gap-2 text-base font-bold text-[#3A4F3F] border-l-4 border-[#6B9080] pl-2 mt-2 mb-2 bg-[#F0EDE6]/40 py-1.5 rounded-r-lg w-full">
                    <span>【{part.replace(/\([^)]+\)/, '').replace(/[【】]/g, '')}】</span>
                    {hasAlias && <span className="text-xs font-medium bg-[#6B9080]/10 text-[#6B9080] px-2 py-0.5 rounded-md border border-[#6B9080]/20">{hasAlias[1]}</span>}
                  </span>
                );
              }
              return part;
            });
          };

          // 1. 編號處理
          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            return (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
                <span className="font-bold text-[#3A4F3F] shrink-0">{trimmed.substring(0, splitIndex)}</span>
                <span>{processInlineSyntax(trimmed.substring(splitIndex).trim())}</span>
              </div>
            );
          }
          // 2. 項目符號處理
          if (isIndented) {
            return (
              <div key={i} className="grid grid-cols-[1.5rem_1fr]">
                <span className="text-[#A39284]">●</span>
                <span>{processInlineSyntax(trimmed.replace('●', '').trim())}</span>
              </div>
            );
          }
          // 3. 一般文字處理
          return <div key={i}>{processInlineSyntax(trimmed)}</div>;
        })}
      </div>
    );
  };

  // 取得書籍細節與目錄架構
  const { author, chapters } = item.bookDetails || { author: '經典文獻', chapters: [] };

  // 輔助函式：從原始標題中抽取出真正的主標題文字（過濾掉括號別名）
  const getRawTitle = (fullTitle) => {
    if (!fullTitle) return '未命名';
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? match[1].trim() : fullTitle;
  };

  // 專門為右側大標題設計的「標題與別名自動拆解渲染器」
  const renderTitleWithAlias = (fullTitle) => {
    if (!fullTitle) return '未命名';
    
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    
    if (match) {
      const mainTitle = match[1].trim();
      const aliasList = match[2].trim();
      
      return (
        // 核心修正：加入 flex-wrap 以防止推擠，並確保別名標籤有寬度下限
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 w-full">
          <span 
            className="text-2xl md:text-3xl text-[#3A4F3F] font-black"
          >
            {mainTitle}
          </span>
          
          <span className="text-xs bg-[#6B9080]/10 text-[#6B9080] font-medium px-2 py-1 rounded border border-[#6B9080]/20 whitespace-nowrap shrink-0">
            別名：{aliasList}
          </span>
        </div>
      );
    }
    
    return (
      <span className="text-2xl md:text-3xl text-[#3A4F3F] block font-black">
        {fullTitle}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#FCFBFA] rounded-3xl w-full max-w-5xl h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-[#E5E0D8]/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#E5E0D8]/50 bg-white">
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-widest block mb-0.5">{item.category} 百科閱讀器</span>
            <h2 className="text-2xl text-[#3A4F3F] flex items-center gap-3 font-black">
              {item.name}
              {author && <span className="text-xs font-normal text-[#A39284] bg-[#F7F5F0] px-2.5 py-1 rounded-full">{author}</span>}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#A39284] hover:text-red-500 text-xl w-8 h-8 rounded-full hover:bg-gray-100 transition-all">✕</button>
        </div>

        {/* 雙欄式閱讀器主體 */}
        <div className="flex flex-1 overflow-hidden bg-[#FBF9F6]">
          
          {/* 左側欄：動態目錄樹 */}
          <div className="w-80 border-r border-[#E5E0D8]/60 bg-white overflow-y-auto p-4 space-y-4">
            <h4 className="text-base font-bold text-[#A39284] tracking-widest uppercase px-2 mb-2">目錄與分類</h4>
            {chapters?.map((ch) => (
              <div key={ch.id} className="space-y-1.5">
                {/* 📁 大目錄標題（如：素問） */}
                <div 
                  className="text-base text-[#3A4F3F] bg-[#F7F5F0] px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{ fontWeight: 800 }}
                >
                  📁 {ch.title || '未命名分類'}
                </div>

                {/* 子篇章節點 */}
                <div className="pl-4 space-y-1 border-l border-[#6B9080]/20 ml-2">
                  {ch.children?.map((child) => (
  <button 
    key={child.id} 
    onClick={() => child.type === 'content' && setSelectedContent(child)} 
    // 關鍵修改處：針對 content 類型的項目，額外增加 pl-8 或 pl-10
    className={`w-full text-left text-base p-2.5 rounded-lg flex items-start gap-2 
      ${child.type === 'content' ? 'pl-10' : 'pl-4'} 
      ${selectedContent?.id === child.id ? 'bg-[#3A4F3F] text-white font-bold' : 'text-[#6B7A6E] hover:bg-[#F7F5F0]'}`}
  >
    <span>{child.type === 'folder' ? '📂' : '📄'}</span>
    <span className="truncate font-black">{getRawTitle(child.title)}</span>
  </button>
))}
</div>
              </div>
            ))}
          </div>

          {/* 右側欄：內文顯示區 */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#FCFBFA]">
            {selectedContent ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="border-b border-[#E5E0D8]/60 pb-5">
                  <span className="text-xs font-bold text-[#6B9080] tracking-wider block mb-2">CURRENT VIEWING</span>
                  {renderTitleWithAlias(selectedContent.title)}
                </div>
                
                {/* 經文 / 症狀主體內容 */}
                <div className="text-base text-[#3A4F3F] leading-loose tracking-wide bg-[#FBF9F6] p-6 md:p-8 rounded-2xl border border-[#E5E0D8]/40 shadow-inner">
                  {selectedContent.text ? (
                    parseModalSyntax(selectedContent.text)
                  ) : (
                    <span className="text-[#A39284] italic">此項目尚無詳細解析內容。</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto pt-4 space-y-6">
                <div className="border-b border-[#E5E0D8]/60 pb-4">
                  <h4 className="font-bold text-[#3A4F3F]">歡迎閱讀百科導覽</h4>
                  <p className="text-sm text-[#A39284]">請從左側目錄點選想要深入閱讀的細節。</p>
                </div>

                {/* 書籍簡介區塊 */}
                {item.description && (
                  <div className="w-full text-left bg-[#FBF9F6] p-6 md:p-8 rounded-2xl border border-[#E5E0D8]/50 shadow-inner space-y-3">
                    <strong className="text-base text-[#3A4F3F] flex items-center gap-2 border-b border-[#E5E0D8]/40 pb-2" style={{ fontWeight: 800 }}>
                      ✨ 本書概要與導論
                    </strong>
                    <div className="text-base text-[#6B7A6E] leading-relaxed tracking-wide">
                      {parseModalSyntax(item.description)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}