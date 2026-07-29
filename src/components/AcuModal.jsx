import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const parseBoldSyntax = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (line.trim() === '') return <div key={idx} className="h-2" />;
    const lineStartRegex = /^(肌肉|神經|血管)([：:])/;
    const parts = line.split(/(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g);

    return (
      <div key={idx} className="mb-1 leading-7">
        {parts.map((part, i) => {
          if (!part) return null;
          if (part.startsWith('==') && part.endsWith('==')) {
            return <mark key={i} className="bg-[#EFD8B8] text-[#243126] px-1.5 py-0.5 rounded-md font-bold mx-0.5 shadow-sm">{part.slice(2, -2)}</mark>;
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-[#243126] font-bold">{part.slice(2, -2)}</strong>;
          }
          if ((part.startsWith('《') && part.endsWith('》')) || (part.startsWith('【') && part.endsWith('】'))) {
            return <strong key={i} className="text-[#243126] font-bold">{part}</strong>;
          }
          if (lineStartRegex.test(part)) {
            const keyword = part.match(lineStartRegex)?.[1] || '';
            const colon = part.match(lineStartRegex)?.[2] || '';
            return (
              <span key={i}>
                <strong className="text-[#243126] font-bold">{keyword}</strong>{colon}
              </span>
            );
          }
          return part;
        })}
      </div>
    );
  });
};

const UI = {
  text: "text-[15px] leading-8 text-[#45584B]",
  title: "text-4xl font-black tracking-tight text-[#2F4638] mb-2",
  sectionLabel: "font-bold text-[#5E7263] block border-b border-[#E8E0D6] pb-1.5 mb-3 text-[11px] tracking-[0.22em] uppercase"
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-[1.5rem] border border-[#E8E0D6] bg-[#FFFCF8] shadow-[0_8px_24px_rgba(63,81,68,0.05)] ${className}`}>
    {children}
  </div>
);

const AutoHeightTextarea = ({ value, className = "" }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = '0px';
    setHeight(`${ref.current.scrollHeight}px`);
  }, [value]);

  return (
    <textarea
      ref={ref}
      readOnly
      value={value || '此條目目前尚未填寫簡介。'}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-[15px] leading-8 text-[#45584B] outline-none focus:outline-none focus:ring-0 whitespace-pre-wrap ${className}`}
      style={{ height }}
    />
  );
};

export default function AcuModal({ item, onClose }) {
  if (!item) return null;

  const acuTable = item.acuTable || {};
  const acuDetails = item.acuDetails || {};

  const renderFormattedText = (text, customClasses = "") => {
    if (!text) return <span className="italic text-[#A39284]">無記載</span>;
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
      <div className={`${UI.text} ${customClasses}`}>
        {lines.map((line, i) => (
          <div key={i} className="mb-1">{parseBoldSyntax(line)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
          <Card className="p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex text-[10px] font-bold tracking-[0.28em] px-3 py-1 rounded-full bg-[#F2E9DC] text-[#617263]">
                {item.category || '穴道'}百科
              </span>
            </div>

            <h2 className={UI.title}>{item.name}</h2>

            <p className="text-xs italic tracking-widest text-[#A39284] mt-1.5 mb-6 font-mono border-b border-[#E8E0D6] pb-4">
              CODE: {acuTable?.code || 'N/A'}
            </p>

            <div className="space-y-4 text-sm text-[#3A4F3F] leading-7">
              <p><strong className="text-[#5E7263]">經絡：</strong> {acuTable?.meridian || '無記載'}</p>
              <p><strong className="text-[#5E7263]">別名：</strong> {acuTable?.alias || '無記載'}</p>
              <div className="pt-2">
                <h3 className="text-sm font-bold text-[#2F4638] mb-2">簡介</h3>
                <AutoHeightTextarea value={item.description} />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 md:p-10">
            <div className="space-y-8">
              <div>
                <h4 className={UI.sectionLabel}>主治</h4>
                {renderFormattedText(acuDetails?.indications)}
              </div>

              <div>
                <h4 className={UI.sectionLabel}>類別</h4>
                {renderFormattedText(acuDetails?.type)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={UI.sectionLabel}>釋名</h4>
                  {renderFormattedText(acuDetails?.nameExpl)}
                </div>
                <div>
                  <h4 className={UI.sectionLabel}>位置</h4>
                  {renderFormattedText(acuDetails?.location)}
                </div>
              </div>

              <div className="space-y-6">
                {acuDetails?.anatomy && (
                  <div className="rounded-[1.25rem] border border-[#E8E0D6] bg-[#FBFAF7] p-5 shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                    <span className={UI.sectionLabel}>💀 解剖</span>
                    {acuDetails.anatomy.split('\n').filter(l => l.trim()).map((line, i) => {
                      const colonIndex = line.indexOf('：');
                      const isLabel = /^(肌肉|神經|血管)/.test(line) && colonIndex !== -1 && colonIndex < 8;
                      return (
                        <div key={i} className={`mb-1 ${isLabel ? 'flex flex-wrap items-baseline' : ''}`}>
                          {isLabel ? (
                            <>
                              <strong className="text-[#2F4638] font-bold mr-1">{line.substring(0, colonIndex + 1)}</strong>
                              <span className="flex-1">{parseBoldSyntax(line.substring(colonIndex + 1))}</span>
                            </>
                          ) : parseBoldSyntax(line)}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-[1.25rem] border border-[#E8E0D6] bg-[#F8F4ED] p-5 shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                  <span className={UI.sectionLabel}>🎯 操作</span>
                  {renderFormattedText(acuDetails?.operation)}
                </div>

                <div className="rounded-[1.25rem] border border-[#E8E0D6] bg-[#FFFCF8] p-6 shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                  <h4 className={UI.sectionLabel}>✨ 功效</h4>
                  <div className="space-y-4 mt-4">
                    <div>
                      <span className="font-bold text-[#5E7263] text-[12px] tracking-[0.18em] uppercase block mb-1">古代功效</span>
                      {renderFormattedText(acuDetails?.effectAncient)}
                    </div>
                    <div>
                      <span className="font-bold text-[#5E7263] text-[12px] tracking-[0.18em] uppercase block mb-1">現代功效</span>
                      {renderFormattedText(acuDetails?.effectModern)}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-[#E8E0D6] bg-[#F7F9F6] p-6 shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                  <h4 className={UI.sectionLabel}>🔗 配穴建議</h4>
                  <div className={UI.text}>
                    {acuDetails?.matchingPoints ? (
                      acuDetails.matchingPoints.split('\n').filter(l => l.trim()).map((line, i) => {
                        const colonIndex = line.indexOf('：');
                        return (
                          <div key={i} className="mb-2 flex flex-wrap items-baseline">
                            {colonIndex !== -1 ? (
                              <>
                                <strong className="text-[#2F4638] font-bold mr-1 shrink-0">{line.substring(0, colonIndex + 1)}</strong>
                                <span>{parseBoldSyntax(line.substring(colonIndex + 1))}</span>
                              </>
                            ) : (
                              parseBoldSyntax(line)
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="italic text-[#A39284]">無記載配穴資訊</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}