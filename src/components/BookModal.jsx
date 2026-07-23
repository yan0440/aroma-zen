import React, { useState, useRef } from 'react';

export default function BookModal({ item, onClose }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const contentRef = useRef(null);

  if (!item) return null;

  const restoreArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return Object.keys(obj)
      .filter((key) => !isNaN(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => obj[key]);
  };

  const deepRestore = (node) => {
    if (node?.type === 'folder') {
      return {
        ...node,
        children: restoreArray(node.children || []).map(deepRestore),
      };
    }
    return node;
  };

  const rawChapters = item.bookDetails?.chapters;
  const processedChapters = restoreArray(rawChapters).map(deepRestore);

  const renderTable = (rows) => (
    <div className="overflow-x-auto my-5 rounded-[1.2rem] bg-[#FFFCF8] shadow-[0_6px_20px_rgba(63,81,68,0.05)]">
      <table className="w-full text-left border-collapse text-[12px]">
        <tbody>
          {rows.map((row, i) => {
            const cells = row
              .split('|')
              .map((c) => c.trim())
              .filter((c, idx, arr) => {
                if (idx === 0 && c === '') return false;
                if (idx === arr.length - 1 && c === '') return false;
                return true;
              });

            if (cells.every((c) => c.includes('-'))) return null;

            return (
              <tr
                key={i}
                className={`border-b border-[#E8E0D6] ${
                  i === 0 ? 'bg-[#F7F5F0] font-bold text-[#2F4638]' : 'text-[#45584B]'
                }`}
              >
                {cells.map((cell, j) => (
                  <td
                    key={j}
                    className="p-3.5 border-r border-[#E8E0D6] last:border-r-0 whitespace-pre-wrap align-top"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const parseModalSyntax = (str) => {
    if (typeof str !== 'string') return null;

    const lines = str.split('\n');
    let tableBuffer = [];
    const result = [];

    const processInlineSyntax = (text) => {
      const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g;
      return text.split(regex).map((part, idx) => {
        if (!part) return null;

        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <mark key={idx} className="bg-[#EFD8B8] px-1.5 py-0.5 rounded-md text-[#243126] font-semibold">
              {part.slice(2, -2)}
            </mark>
          );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="text-[#243126] font-bold">{part.replace(/\*\*/g, '')}</strong>;
        }

        if (part.startsWith('《') && part.endsWith('》')) {
          return <span key={idx} className="text-[#5E7263] font-semibold">{part}</span>;
        }

        if (part.startsWith('【') && part.endsWith('】')) {
  const hasAlias = part.match(/\(([^)]+)\)/);
  const raw = part.replace(/\([^)]+\)/, '').replace(/[【】]/g, '');

  // 指定這三個當成「帶長方形背景」的副標題
  const isSubheading = ['概念', '辨證分析', '文獻別錄'].includes(raw);

  if (isSubheading) {
    return (
      <div
        key={idx}
        className="relative w-full flex items-center gap-3 my-5"
      >
        {/* 長方形背景色塊 */}
        <div className="absolute left-0 top-0 h-10 w-full bg-[#6B9080]/10 rounded-xl" />

        {/* 標題文字 */}
        <div className="relative z-10 flex items-center gap-2 pl-3">
          <span className="text-lg md:text-xl font-extrabold text-[#2F4638] tracking-tight translate-y-[6px]">
            {raw}
          </span>
          {hasAlias && (
            <span className="text-xs font-medium bg-[#6B9080]/20 text-[#6B9080] px-2 py-0.5 rounded-md">
              {hasAlias[1]}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 其他【】維持原本的樣式
  return (
    <span
      key={idx}
      className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#2F4638] pl-1 mt-2 mb-2 py-1.5 rounded-lg w-full"
    >
      <span>[{raw}]</span>
      {hasAlias && (
        <span className="text-xs font-medium bg-[#6B9080]/10 text-[#6B9080] px-2 py-0.5 rounded-md">
          {hasAlias[1]}
        </span>
      )}
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
            result.push(
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
                <span className="font-bold text-[#2F4638] shrink-0">
                  {trimmed.substring(0, splitIndex)}
                </span>
                <span>{processInlineSyntax(trimmed.substring(splitIndex).trim())}</span>
              </div>
            );
          } else if (isIndented) {
            result.push(
              <div key={i} className="flex items-baseline pl-0 mb-1">
                <span className="text-[#7C6E60] mr-2 inline-block shrink-0 translate-y-[-1px]">●</span>
                <span className="leading-relaxed text-left flex-1">
                  {processInlineSyntax(trimmed.replace('●', '').trim())}
                </span>
              </div>
            );
          } else {
            result.push(<div key={i}>{processInlineSyntax(trimmed)}</div>);
          }
        }
      }
    });

    if (tableBuffer.length > 0) result.push(<div key="final-table">{renderTable(tableBuffer)}</div>);
    return <div className="space-y-3 text-[15px] leading-8 text-[#3A4F3F]">{result}</div>;
  };

  const getRawTitle = (fullTitle) => {
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? match[1].trim() : fullTitle;
  };

  const renderTitleWithAlias = (fullTitle) => {
    const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
    return match ? (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 w-full">
        <span className="text-2xl md:text-3xl font-black text-[#2F4638]">{match[1].trim()}</span>
        <span className="text-xs bg-[#6B9080]/10 text-[#6B9080] font-medium px-2 py-1 rounded-full">
          別名：{match[2].trim()}
        </span>
      </div>
    ) : (
      <span className="text-2xl md:text-3xl font-black text-[#2F4638]">{fullTitle}</span>
    );
  };

  const renderDirectory = (items, level = 0) => (
    <div className="w-full space-y-2">
      {items.map((item) => {
        if (!item || !item.id) return null;

        if (item.type === 'folder') {
          return (
            <div key={item.id} className="w-full">
              <div
                className={`flex items-center gap-2 rounded-[0.95rem] bg-[#F7F5F0]/80 px-3 py-2.5 text-sm font-semibold text-[#2F4638] shadow-[0_2px_8px_rgba(63,81,68,0.03)] ${
                  level === 0 ? '' : 'ml-1'
                }`}
              >
                <span className="text-sm shrink-0">📁</span>
                <span className="truncate flex-1">{item.title || '無標題目錄'}</span>
              </div>

              {Array.isArray(item.children) && item.children.length > 0 && (
                <div className="mt-2 pl-2 border-l border-[#E8E0D6]/50 space-y-2">
                  {renderDirectory(item.children, level + 1)}
                </div>
              )}
            </div>
          );
        }

        const isActive = selectedContent?.id === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setSelectedContent(item);
              requestAnimationFrame(() => {
                if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              });
            }}
            className={`group relative w-full overflow-hidden rounded-[0.95rem] px-3 py-2.5 text-left transition-all duration-200 ${
              isActive
                ? 'bg-[#2F4638] text-white shadow-[0_10px_24px_rgba(47,70,56,0.18)]'
                : 'bg-white/70 text-[#5E7263] hover:-translate-y-0.5 hover:bg-[#FBFAF7] hover:shadow-[0_8px_18px_rgba(63,81,68,0.05)]'
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isActive ? 'bg-[#C8A97E]' : 'bg-transparent group-hover:bg-[#6B9080]/30'
              }`}
            />
            <div className="flex items-center gap-2 pl-1">
              <span className="text-sm opacity-75">📄</span>
              <span className="truncate text-sm font-medium">
                {getRawTitle(item.title || '無標題內容')}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen w-full bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)] overflow-hidden">
      <div className="border-b border-[#E8E0D6]/50 bg-white/70 backdrop-blur-md px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div>
            <span className="text-[11px] font-bold text-[#6B9080] uppercase tracking-[0.28em] block mb-0.5">
              {item.category} 百科閱讀器
            </span>
            <h2 className="text-xl md:text-2xl font-black text-[#2F4638]">{item.name}</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-6 py-8 h-[calc(100vh-88px)] min-h-0">
        <aside className="w-full md:w-72 shrink-0 h-full overflow-y-auto pr-1">
          <div className="bg-white/60 p-4 shadow-[0_12px_30px_rgba(63,81,68,0.05)] backdrop-blur-md">
            <div className="flex items-center justify-between px-1 mb-3">
              <h4 className="text-[11px] font-bold text-[#A39284] tracking-[0.28em] uppercase">
                目錄架構
              </h4>
              <span className="text-[10px] text-[#B7A89A]">Book Tree</span>
            </div>
            {renderDirectory(processedChapters)}
          </div>
        </aside>

        <main ref={contentRef} className="flex-1 min-w-0 h-full overflow-y-auto pr-1">
          {selectedContent ? (
            <div className="space-y-6 pb-8">
              <div className="border-b border-[#E8E0D6]/70 pb-5">
                {renderTitleWithAlias(selectedContent.title)}
              </div>

              <div className="rounded-[1.6rem] bg-[#FFFCF8] p-8 md:p-10 shadow-[0_10px_30px_rgba(63,81,68,0.06)]">
                {selectedContent.text ? (
                  parseModalSyntax(selectedContent.text)
                ) : (
                  <span className="text-[#A39284] italic">尚無內容。</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-[#E8E0D6] rounded-2xl text-[#A39284] bg-white/50">
              請從左側目錄選擇項目。
            </div>
          )}
        </main>
      </div>
    </div>
  );
}