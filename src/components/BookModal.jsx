import React, { useState } from 'react';

export default function BookModal({ item, onClose }) {
  const [selectedContent, setSelectedContent] = useState(null);

  if (!item) return null;

  // 1. 輔助：將區塊內容轉為 Table 組件
  const renderTable = (rows) => {
    return (
      <div className="overflow-x-auto my-4 border border-[#E5E0D8] rounded-xl shadow-sm bg-white">
        <table className="w-full text-left border-collapse text-[11px]">
          <tbody>
            {rows.map((row, i) => {
              const cells = row.split('|').map(c => c.trim()).filter((c, idx, arr) => {
                if (idx === 0 && c === '') return false;
                if (idx === arr.length - 1 && c === '') return false;
                return true;
              });
              if (cells.every(c => c.includes('-'))) return null;
              return (
                <tr key={i} className={`border-b border-[#E5E0D8] ${i === 0 ? 'bg-[#F7F5F0] font-bold text-[#3A4F3F]' : ''}`}>
                  {cells.map((cell, j) => <td key={j} className="p-3 border-r border-[#E5E0D8] last:border-r-0 whitespace-pre-wrap">{cell}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // 2. 還原陣列輔助函式
  const restoreArray = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).sort((a, b) => Number(a) - Number(b)).map(key => obj[key]);
  };

  const rawChapters = item.bookDetails?.chapters;
  const chapters = Array.isArray(rawChapters) ? rawChapters : restoreArray(rawChapters || {});
  const processedChapters = chapters.map(ch => ({
    ...ch,
    children: Array.isArray(ch.children) ? ch.children : restoreArray(ch.children || {})
  }));

  // 3. 文字解析器
  const parseModalSyntax = (str) => {
    if (typeof str !== 'string') return null;
    const lines = str.split('\n');
    let tableBuffer = [];
    let result = [];

    const processInlineSyntax = (text) => {
      const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g;
      return text.split(regex).map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('==') && part.endsWith('==')) return <mark key={idx} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="text-[#AAB8AB]" style={{ fontWeight: 700 }}>{part.replace(/\*\*/g, '')}</strong>;
        if (part.startsWith('《') && part.endsWith('》')) return <span key={idx} className="text-[#AAB8AB]" style={{ fontWeight: 700 }}>{part}</span>;
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

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        tableBuffer.push(trimmed);
      } else {
        if (tableBuffer.length > 0) {
          result.push(<div key={`t-${i}`}>{renderTable(tableBuffer)}</div>);
          tableBuffer = [];
        }
        if (trimmed) {
          const isNumbered = /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(trimmed);
          const isIndented = trimmed.startsWith('●');
          if (isNumbered) {
            const splitIndex = trimmed.search(/[.、]/) + 1;
            result.push(<div key={i} className="grid grid-cols-[auto_1fr] gap-x-2"><span className="font-bold text-[#3A4F3F] shrink-0">{trimmed.substring(0, splitIndex)}</span><span>{processInlineSyntax(trimmed.substring(splitIndex).trim())}</span></div>);
          } else if (isIndented) {
            result.push(<div key={i} className="flex items-baseline pl-0 mb-1"><span className="text-[#A39284] mr-2 inline-block shrink-0 translate-y-[-1px]">●</span><span className="leading-relaxed text-left flex-1">{processInlineSyntax(trimmed.replace('●', '').trim())}</span></div>);
          } else {
            result.push(<div key={i}>{processInlineSyntax(trimmed)}</div>);
          }
        }
      }
    });
    if (tableBuffer.length > 0) result.push(<div key="final-table">{renderTable(tableBuffer)}</div>);

    return <div className="space-y-3 text-sm leading-relaxed text-[#3A4F3F]">{result}</div>;
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

  return (
    <div className="h-screen w-full flex flex-col bg-[#FCFBFA] overflow-hidden">
      {/* 頁首 */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-[#E5E0D8]/50 bg-white">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="text-[#A39284] hover:text-[#3A4F3F] font-bold text-sm">← 返回</button>
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-widest block mb-0.5">{item.category} 百科閱讀器</span>
            <h2 className="text-xl font-black text-[#3A4F3F]">{item.name}</h2>
          </div>
        </div>
      </div>

      {/* 主內容區：佔滿剩餘高度，僅包含目錄與文章 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側目錄 */}
        <div className="w-80 border-r border-[#E5E0D8]/60 bg-white overflow-y-auto p-4 space-y-4 text-sm">
          <h4 className="text-[11px] font-bold text-[#A39284] tracking-widest uppercase px-2 mb-2">目錄架構</h4>
          {processedChapters.map((ch) => (
            <div key={ch.id} className="space-y-1">
              <div className="text-sm text-[#3A4F3F] bg-[#F7F5F0] px-3 py-2 rounded-xl font-extrabold">📁 {ch.title}</div>
              <div className="pl-4 space-y-1 border-l border-[#6B9080]/20 ml-3">
                {ch.children.map((child) => (
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

        {/* 右側內容區 */}
        <div className="flex-1 overflow-y-auto p-12">
          {selectedContent ? (
            <div className="space-y-6 max-w-3xl mx-auto">
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
  );
}