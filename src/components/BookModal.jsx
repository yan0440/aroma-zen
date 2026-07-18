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

    return <div className="space-y-3 text-base leading-relaxed text-[#3A4F3F]">{result}</div>;
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

  // 遞迴目錄渲染函式
  const renderDirectory = (items) => {
    return items.map((item) => (
      <div key={item.id} className="space-y-1">
        {item.type === 'folder' ? (
          <>
            <div className="text-sm text-[#3A4F3F] bg-[#F7F5F0] px-3 py-2 rounded-xl font-extrabold flex items-center gap-2 mt-2">
              <span>📁</span> {item.title}
            </div>
            <div className="pl-6 border-l-2 border-[#E5E0D8] ml-3 space-y-1">
              {renderDirectory(item.children || [])}
            </div>
          </>
        ) : (
          <button 
  onClick={() => {
    setSelectedContent(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }} 
  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
    selectedContent?.id === item.id ? 'bg-[#3A4F3F] text-white font-bold' : 'text-[#6B7A6E] hover:bg-[#F7F5F0]'
  }`}
          >
            <span>📄</span>
            <span className="truncate font-black">{getRawTitle(item.title)}</span>
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF9F6] pb-20">
      <div className="border-b border-[#E5E0D8]/50 bg-white px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-widest block mb-0.5">
              {item.category} 百科閱讀器
            </span>
            <h2 className="text-xl font-black text-[#3A4F3F]">{item.name}</h2>
          </div>
        </div>
      </div>

      {/* 主內容區：調整寬度讓閱讀器變大 */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row gap-8 px-6">
        
        {/* 左側目錄：將寬度從 w-80 改為 w-64，讓目錄更精簡 */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <h4 className="text-[11px] font-bold text-[#A39284] tracking-widest uppercase px-2 mb-2">目錄架構</h4>
          {renderDirectory(processedChapters)}
        </div>

        {/* 右側內容區：flex-1 會自動填滿剩餘空間，閱讀器自動變大 */}
        <div className="flex-1 min-w-0">
          {selectedContent ? (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0D8]/60 pb-5">{renderTitleWithAlias(selectedContent.title)}</div>
              <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8]/40 shadow-sm">
                {selectedContent.text ? parseModalSyntax(selectedContent.text) : <span className="text-[#A39284] italic">尚無內容。</span>}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-[#E5E0D8] rounded-2xl text-[#A39284]">請從左側目錄選擇項目。</div>
          )}
        </div>
      </div>
    </div>
  );
}