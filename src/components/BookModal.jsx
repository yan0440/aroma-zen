import React, { useState } from 'react';

export default function BookModal({ item, onClose }) {
  // 記錄當前使用者點選了哪一個子篇章的內容
  const [selectedContent, setSelectedContent] = useState(null);
  
  // 用於控制臨時修改篇章別名的輸入框狀態
  const [aliasInput, setAliasInput] = useState('');

  if (!item) return null;

  // 專用百科語法解析器（已拔除 font-sans/font-serif，確保百分之百套用你的自訂字體）
  const parseModalSyntax = (str) => {
    if (typeof str !== 'string') return str;
    
    // 精簡後的正則表達式：專注捕捉 **粗體**、==高亮==、【大標題】、《書名號》
    const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g;
    
    return str.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-2 min-h-[1.5rem]">
        {line.split(regex).map((part, i) => {
          if (!part) return null;
          
          // 1. 強調高亮語法 ==...==
          if (part.startsWith('==') && part.endsWith('==')) 
            return <mark key={i} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
          
          // 2. 粗體語法 **...**（套用 900 最高字重強制將你的字體加粗）
          if (part.startsWith('**') && part.endsWith('**')) 
            return (
              <strong 
                key={i} 
                className="text-[#3A4F3F]" 
                style={{ fontWeight: 900, display: 'inline-block' }}
              >
                {part.replace(/\*\*/g, '')}
              </strong>
            );
          
          // 3. 專門優化症狀鑑別的 【大標題】，引入別名過濾
          if (part.startsWith('【') && part.endsWith('】')) {
            const hasAlias = part.match(/\(([^)]+)\)/);
            if (hasAlias) {
              const cleanTitle = part.replace(/\([^)]+\)/, '').replace(/[【】]/g, '');
              const aliasText = hasAlias[1];
              return (
                <span 
                  key={i} 
                  className="flex flex-wrap items-center gap-2 text-base text-[#3A4F3F] border-l-4 border-[#6B9080] pl-2 mt-5 mb-2 bg-[#F0EDE6]/40 py-1.5 rounded-r-lg w-full"
                  style={{ fontWeight: 900 }}
                >
                  <span>【{cleanTitle}】</span>
                  <span className="text-xs font-medium bg-[#6B9080]/10 text-[#6B9080] px-2 py-0.5 rounded-md border border-[#6B9080]/20">
                    {aliasText}
                  </span>
                </span>
              );
            }
            
            return (
              <span 
                key={i} 
                className="block text-base text-[#3A4F3F] border-l-4 border-[#6B9080] pl-2 mt-5 mb-2 bg-[#F0EDE6]/40 py-1.5 rounded-r-lg w-full"
                style={{ fontWeight: 900 }}
              >
                {part}
              </span>
            );
          }
          
          // 4. 古典書名號 《...》（維持綠色，且使用你的字體強制加粗）
          if (part.startsWith('《') && part.endsWith('》')) 
            return (
              <span 
                key={i} 
                className="text-[#6B9080]" 
                style={{ fontWeight: 900, display: 'inline-block' }}
              >
                {part}
              </span>
            );
          
          return part;
        })}
      </span>
    ));
  };

  // 取得書籍細節與目錄架構
  const { author, chapters } = item.bookDetails || { author: '經典文獻', chapters: [] };

  // 輔助函式：從原始標題中抽取出真正的主標題文字（過濾掉括號別名）
  const getRawTitle = (fullTitle) => {
    if (!fullTitle) return '未命名';
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? match[1].trim() : fullTitle;
  };

  // 輔助函式：從原始標題中抽取出原本帶有的別名文字
  const getRawAlias = (fullTitle) => {
    if (!fullTitle) return '';
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? match[2].trim() : '';
  };

  // 專門為左側目錄與右側標題設計的「標題與別名自動拆解渲染器」
  const renderTitleWithAlias = (fullTitle, isMainHeading = false) => {
    if (!fullTitle) return '未命名';
    
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    
    if (match) {
      const mainTitle = match[1].trim();
      const aliasList = match[2].trim();
      
      return (
        <div className="flex flex-col md:flex-row md:items-center gap-1.5 w-full">
          <span 
            className={isMainHeading ? "text-2xl md:text-3xl text-[#3A4F3F]" : "text-[#3A4F3F] truncate"}
            style={{ fontWeight: 900 }}
          >
            {mainTitle}
          </span>
          <span className="inline-block text-[10px] bg-[#6B9080]/10 text-[#6B9080] font-medium px-2 py-0.5 rounded border border-[#6B9080]/20 whitespace-nowrap w-fit">
            別名：{aliasList}
          </span>
        </div>
      );
    }
    
    return (
      <span 
        className={isMainHeading ? "text-2xl md:text-3xl text-[#3A4F3F]" : "text-[#3A4F3F] truncate block"}
        style={{ fontWeight: 900 }}
      >
        {fullTitle}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FCFBFA] rounded-3xl w-full max-w-5xl h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-[#E5E0D8]/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部導覽列 */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#E5E0D8]/50 bg-white">
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-widest block mb-0.5">
              {item.category} 百科閱讀器
            </span>
            <h2 className="text-2xl text-[#3A4F3F] flex items-center gap-3" style={{ fontWeight: 900 }}>
              {item.name}
              {author && <span className="text-xs font-normal text-[#A39284] bg-[#F7F5F0] px-2.5 py-1 rounded-full">{author}</span>}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#A39284] hover:text-red-500 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* 雙欄式閱讀器主體 */}
        <div className="flex flex-1 overflow-hidden bg-[#FBF9F6]">
          
          {/* 左側欄：動態目錄樹 */}
          <div className="w-80 border-r border-[#E5E0D8]/60 bg-white overflow-y-auto p-4 space-y-4">
            <h4 className="text-base font-bold text-[#A39284] tracking-widest uppercase px-2 mb-2">目錄與分類架構</h4>
            
            {(!chapters || chapters.length === 0) && (
              <p className="text-base text-[#A39284] italic p-2">此項目尚未建立目錄架構。</p>
            )}

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
                  {ch.children?.map((child) => {
                    // 核心邏輯：如果這個項目是目前選中的項目，且使用者有在右側輸入框輸入別名，則左側目錄也即時動態融合渲染
                    const displayTitle = selectedContent?.id === child.id 
                      ? (aliasInput ? `${getRawTitle(child.title)}(別名：${aliasInput})` : getRawTitle(child.title))
                      : child.title;

                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          if (child.type === 'content') {
                            setSelectedContent(child);
                            // 點選時，自動把該篇章原有的別名填入輸入框中
                            setAliasInput(getRawAlias(child.title));
                          }
                        }}
                        className={`w-full text-left text-base p-2.5 rounded-lg transition-all flex items-start gap-2 ${
                          child.type === 'folder' 
                            ? 'text-[#A39284] font-medium cursor-default' 
                            : selectedContent?.id === child.id
                              ? 'bg-[#3A4F3F] text-white font-bold shadow-sm'
                              : 'text-[#6B7A6E] hover:bg-[#F7F5F0] hover:text-[#3A4F3F]'
                        }`}
                      >
                        <span className="mt-0.5">{child.type === 'folder' ? '📂' : '📄'}</span>
                        <div className="flex-1 min-w-0">
                          {renderTitleWithAlias(displayTitle, false)}
                        </div>
                      </button>
                    );
                  })}
                  {(!ch.children || ch.children.length === 0) && (
                    <span className="text-base text-[#A39284] italic pl-2 block">無子項目</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 右側欄：內文顯示區 */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#FCFBFA]">
            {selectedContent ? (
              <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
                
                {/* 🟢 頂部複合區塊：將「當前標題顯示」與「別名輸入框」並排合併在一起 */}
                <div className="border-b border-[#E5E0D8]/60 pb-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#6B9080] tracking-wider block mb-1">CURRENT VIEWING</span>
                    <div className="mt-1">
                      {/* 右側標題也即時動態融合輸入框內容 */}
                      {renderTitleWithAlias(
                        aliasInput ? `${getRawTitle(selectedContent.title)}(別名：${aliasInput})` : getRawTitle(selectedContent.title), 
                        true
                      )}
                    </div>
                  </div>

                  {/* 🟢 直接在項目篇章標題下方加入與之呼應的別名設定框 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F6F4F0] p-3.5 rounded-xl border border-[#E5E0D8]/70">
                    <div className="whitespace-nowrap text-xs font-bold text-[#3A4F3F]">
                      🏷️ 項目別名設定：
                    </div>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#E5E0D8] rounded-lg text-[#3A4F3F] focus:outline-none focus:border-[#6B9080] focus:ring-1 focus:ring-[#6B9080] transition-all shadow-sm"
                      placeholder="請輸入別名（例如：養生總綱、內經第一篇），多個可用頓號隔開"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                    />
                  </div>
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
              /* 預設引導頁 UI */
              <div className="h-full max-w-3xl mx-auto flex flex-col justify-start pt-4 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 border-b border-[#E5E0D8]/60 pb-4">
                  <span className="text-xl">📖</span>
                  <div className="text-left">
                    <h4 className="text-base font-bold text-[#3A4F3F]">歡迎閱讀百科導覽</h4>
                    <p className="text-sm text-[#A39284]">請從左側目錄點選想要深入閱讀的細節科別、症狀或文獻章節</p>
                  </div>
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