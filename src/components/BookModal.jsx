import React, { useState } from 'react';

export default function BookModal({ item, onClose }) {
  const [selectedContent, setSelectedContent] = useState(null);

  if (!item) return null;

  // 核心解析器：維持您原本的邏輯，僅限制文字大小與行高
  const parseModalSyntax = (str) => {
    if (typeof str !== 'string') return null;
    const lines = str.split('\n').filter(line => line.trim() !== '');

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
            <span key={idx} className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#3A4F3F] border-l-4 border-[#6B9080] pl-2 mt-2 mb-2 bg-[#F0EDE6]/40 py-1.5 rounded-r-lg w-full">
              <span>【{part.replace(/\([^)]+\)/, '').replace(/[【】]/g, '')}】</span>
              {hasAlias && <span className="text-xs font-medium bg-[#6B9080]/10 text-[#6B9080] px-2 py-0.5 rounded-md border border-[#6B9080]/20">{hasAlias[1]}</span>}
            </span>
          );
        }
        return part;
      });
    };

    return (
      <div className="space-y-3 text-sm leading-relaxed text-[#3A4F3F]">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = trimmed.startsWith('●');

          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            return (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
                <span className="font-bold text-[#3A4F3F] shrink-0">{trimmed.substring(0, splitIndex)}</span>
                <span>{processInlineSyntax(trimmed.substring(splitIndex).trim())}</span>
              </div>
            );
          }
          if (isIndented) {
            return (
              <div key={i} className="flex items-baseline pl-0 mb-1">
                <span className="text-[#A39284] mr-2 inline-block shrink-0 translate-y-[-1px]">●</span>
                <span className="leading-relaxed text-left flex-1">
                  {processInlineSyntax(trimmed.replace('●', '').trim())}
                </span>
              </div>
            );
          }
          return <div key={i}>{processInlineSyntax(trimmed)}</div>;
        })}
      </div>
    );
  };

  const getRawTitle = (fullTitle) => {
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? match[1].trim() : fullTitle;
  };

  const renderTitleWithAlias = (fullTitle) => {
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 w-full">
        <span className="text-2xl font-black text-[#3A4F3F]">{match[1].trim()}</span>
        <span className="text-xs bg-[#6B9080]/10 text-[#6B9080] font-medium px-2 py-1 rounded border border-[#6B9080]/20">別名：{match[2].trim()}</span>
      </div>
    ) : <span className="text-2xl font-black text-[#3A4F3F]">{fullTitle}</span>;
  };

  const { chapters } = item.bookDetails || { chapters: [] };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#FCFBFA] rounded-3xl w-full max-w-5xl h-[85vh] shadow-xl flex flex-col border border-[#E5E0D8]/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#E5E0D8]/50 bg-white">
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-widest block mb-0.5">{item.category} 百科閱讀器</span>
            <h2 className="text-xl font-black text-[#3A4F3F]">{item.name}</h2>
          </div>
          <button onClick={onClose} className="text-[#A39284] hover:text-red-500 text-xl rounded-full transition-all">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-[#FBF9F6]">
          <div className="w-80 border-r border-[#E5E0D8]/60 bg-white overflow-y-auto p-4 space-y-4 text-sm">
            <h4 className="text-[11px] font-bold text-[#A39284] tracking-widest uppercase px-2 mb-2">目錄架構</h4>
            {chapters?.map((ch) => (
              <div key={ch.id} className="space-y-1">
                <div className="text-sm text-[#3A4F3F] bg-[#F7F5F0] px-3 py-2 rounded-xl font-extrabold">📁 {ch.title}</div>
                <div className="pl-4 space-y-1 border-l border-[#6B9080]/20 ml-3">
                  {ch.children?.map((child) => (
                    <button key={child.id} onClick={() => child.type === 'content' && setSelectedContent(child)} 
                      className={`w-full text-left p-2 rounded-lg flex items-start gap-2 ${selectedContent?.id === child.id ? 'bg-[#3A4F3F] text-white font-bold' : 'text-[#6B7A6E] hover:bg-[#F7F5F0]'}`}>
                      <span>{child.type === 'folder' ? '📂' : '📄'}</span>
                      <span className="truncate font-black">{getRawTitle(child.title)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-12 bg-[#FCFBFA]">
            {selectedContent ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="border-b border-[#E5E0D8]/60 pb-5">{renderTitleWithAlias(selectedContent.title)}</div>
                <div className="bg-[#FBF9F6] p-8 rounded-2xl border border-[#E5E0D8]/40 shadow-inner">
                  {selectedContent.text ? parseModalSyntax(selectedContent.text) : <span className="text-[#A39284] italic">尚無內容。</span>}
                </div>
              </div>
            ) : (
              <div className="text-center pt-20 text-[#A39284]">請從左側目錄選擇項目。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}