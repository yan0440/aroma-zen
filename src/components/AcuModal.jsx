import React, {
  useEffect,
  useRef,
  useState,
} from 'react';


const parseBoldSyntax = (text) => {
  if (!text) {
    return null;
  }

  const lines = String(text).split('\n');

  return lines.map((line, lineIndex) => {
    if (line.trim() === '') {
      return (
        <div
          key={lineIndex}
          className="h-2"
        />
      );
    }

    const parts = line.split(
      /(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g
    );

    return (
      <div
        key={lineIndex}
        className="mb-1 leading-7"
      >
        {parts.map((part, index) => {
          if (!part) {
            return null;
          }

          if (
            part.startsWith('==') &&
            part.endsWith('==')
          ) {
            return (
              <mark
                key={index}
                className="mx-0.5 rounded-md bg-[#F3E1C5] px-1 py-0.5 font-bold text-[#2C3C30] shadow-sm"
              >
                {part.slice(2, -2)}
              </mark>
            );
          }

          if (
            part.startsWith('**') &&
            part.endsWith('**')
          ) {
            return (
              <strong
                key={index}
                className="font-bold text-[#1A261C]"
              >
                {part.slice(2, -2)}
              </strong>
            );
          }

          if (
            (part.startsWith('《') &&
              part.endsWith('》')) ||
            (part.startsWith('【') &&
              part.endsWith('】'))
          ) {
            return (
              <strong
                key={index}
                className="font-bold text-[#1A261C]"
              >
                {part}
              </strong>
            );
          }

          return part;
        })}
      </div>
    );
  });
};


const UI = {
  text: 'text-[15px] leading-8 text-[#55655B]',

  title:
    'mb-2 text-3xl font-bold text-[#2F4638] md:text-4xl',

  sectionLabel:
  'mb-4 flex items-center gap-3 border-b border-[#E5E0D8] pb-2 text-base font-bold uppercase tracking-[0.18em] text-[#4E6654] before:block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[#6B9080]',
};


const AutoHeightTextarea = ({
  value,
  className = '',
}) => {
  const ref = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.style.height = '0px';

    setHeight(
      `${ref.current.scrollHeight}px`
    );
  }, [value]);

  return (
    <textarea
      ref={ref}
      readOnly
      value={
        value ||
        '此項目目前尚未填寫簡介。'
      }
      className={`w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-[15px] leading-8 text-[#55655B] outline-none focus:outline-none focus:ring-0 ${className}`}
      style={{ height }}
    />
  );
};


export default function AcuModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) {
    return null;
  }

  const acuTable = item.acuTable || {};
  const acuDetails = item.acuDetails || {};

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const renderFormattedText = (text) => {
    if (!text) {
      return (
        <span className="italic text-gray-400">
          無記載
        </span>
      );
    }

    const lines =
      typeof text === 'string'
        ? text
            .split('\n')
            .filter(
              (line) => line.trim() !== ''
            )
        : [text];

    return (
      <div className={UI.text}>
        {lines.map((line, index) => {
          const trimmed =
            typeof line === 'string'
              ? line.trim()
              : line;

          const isNumbered =
            typeof trimmed === 'string' &&
            /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(
              trimmed
            );

          const isIndented =
            typeof trimmed === 'string' &&
            trimmed.startsWith('●');

          if (isNumbered) {
            const splitIndex =
              trimmed.search(/[.、]/) + 1;

            return (
              <div
                key={index}
                className="mb-1 grid grid-cols-[auto_1fr] gap-x-2"
              >
                <span className="shrink-0 font-bold text-[#2F4638]">
                  {trimmed.substring(
                    0,
                    splitIndex
                  )}
                </span>

                <span>
                  {parseBoldSyntax(
                    trimmed
                      .substring(splitIndex)
                      .trim()
                  )}
                </span>
              </div>
            );
          }

          if (isIndented) {
            return (
              <div
                key={index}
                className="mb-1 grid grid-cols-[1rem_1fr] gap-x-2"
              >
                <span className="text-[#A39284]">
                  ●
                </span>

                <span>
                  {parseBoldSyntax(
                    trimmed
                      .replace('●', '')
                      .trim()
                  )}
                </span>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="mb-1"
            >
              {parseBoldSyntax(trimmed)}
            </div>
          );
        })}
      </div>
    );
  };

  const rows = [
    {label: '🆔 穴位代碼', val: acuTable.code,},
    {label: '🎯 經絡', val: acuTable.meridian,},
    {label: '🏷️ 別名', val: acuTable.alias,},
    {label: '🗂️ 類別', val: acuDetails.type,},
  ];

  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-full flex-col overflow-hidden bg-[#F4EFE7] text-[#3A4F3F]">
      <header className="shrink-0 border-b border-[#D8C8B8] bg-[#FFFCF8] shadow-[0_4px_18px_rgba(96,116,102,0.12)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B2B2A8] text-lg text-white">
              🪡
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B9080]">Acupoint
              </p>

              <h1 className="truncate text-lg font-black text-[#718678] md:text-xl">{item.name}
              </h1>

              <p className="hidden text-xs text-[#8C725F] sm:block">
                穴道百科詳細資料
              </p>
            </div>
          </div>

          <button
  type="button"
  onClick={handleClose}
  className="shrink-0 rounded-lg border border-[#B2B2A8] bg-[#B2B2A8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5F7568]"
>
  {backLabel}
</button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)]">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 md:px-7 md:py-8 lg:grid-cols-12 lg:gap-8 lg:px-10">
          <section className="lg:col-span-4">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-8 lg:sticky lg:top-6">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#EAE7E0] px-2 py-0.5 text-xs font-medium text-[#6B7A6E]">
                  {item.category || '穴道'}
                </span>

                {acuTable.meridian && (
                  <span className="rounded-full bg-[#E5EAE6] px-2 py-0.5 text-xs font-medium text-[#4E6654]">
                    {acuTable.meridian}
                  </span>
                )}
              </div>

              <h2 className={UI.title}>
                {item.name}
              </h2>

              <p className="mb-6 mt-1 border-b border-[#F0E8DE] pb-4 font-serif text-base italic text-[#A39284]">
                {acuTable.code || 'N/A'}
              </p>

              <div className="overflow-hidden rounded-xl border border-[#EAE4DB] shadow-[0_4px_14px_rgba(63,81,68,0.04)]">
                <table className="w-full border-collapse text-[14px]">
                  <tbody className="divide-y divide-[#EAE4DB] text-[#3A4F3F]">
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className="bg-[#FBFBFA]/60"
                      >
                        <td className="w-[35%] bg-[#FBFBFA] px-3 py-2 font-bold text-[#3A4F3F]">
                          {row.label}
                        </td>

                        <td className="px-3 py-2">
                          {renderFormattedText(
                            row.val
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-xl font-bold text-[#2F4638]">
                  簡介
                </h3>

                <AutoHeightTextarea
                  value={item.description}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-10"><div className="space-y-8 text-[#3A4F3F]"><div><span className={UI.sectionLabel}>🎯 主治</span>
                  {renderFormattedText(acuDetails.indications)}</div><div><span className={UI.sectionLabel}>📖 釋名</span>
                  {renderFormattedText(acuDetails.nameExpl)}</div><div><span className={UI.sectionLabel}>📍 位置</span>
                  {renderFormattedText(acuDetails.location)}</div><div><span className={UI.sectionLabel}>🧩 類別</span>
                  {renderFormattedText(acuDetails.type)}</div>{acuDetails.anatomy && (<div><span className={UI.sectionLabel}>💀 解剖</span>

                    <div className="rounded-xl bg-[#F7F5F0]/60 p-5">
                      {acuDetails.anatomy
                        .split('\n')
                        .filter(
                          (line) => line.trim() !== ''
                        )
                        .map((line, index) => {
                          const colonIndex =
                            line.indexOf('：');

                          const isLabel =
                            /^(肌肉|神經|血管)/.test(
                              line
                            ) &&
                            colonIndex !== -1 &&
                            colonIndex < 8;

                          return (
                            <div
                              key={index}
                              className={`mb-1 ${
                                isLabel
                                  ? 'flex flex-wrap items-baseline'
                                  : ''
                              }`}
                            >
                              {isLabel ? (
                                <>
                                  <strong className="mr-1 font-bold text-[#2F4638]">
                                    {line.substring(
                                      0,
                                      colonIndex + 1
                                    )}
                                  </strong>

                                  <span className="flex-1">
                                    {parseBoldSyntax(
                                      line.substring(
                                        colonIndex + 1
                                      )
                                    )}
                                  </span>
                                </>
                              ) : (
                                parseBoldSyntax(line)
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div>
                  <span className={UI.sectionLabel}>
                    🎯 操作
                  </span>

                  <div className="rounded-xl bg-[#F7F5F0]/60 p-5">
                    {renderFormattedText(
                      acuDetails.operation
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <span className={UI.sectionLabel}>
                      ✨ 古代功效
                    </span>

                    {renderFormattedText(
                      acuDetails.effectAncient
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      ✨ 現代功效
                    </span>

                    {renderFormattedText(
                      acuDetails.effectModern
                    )}
                  </div>
                </div>

                <div>
                  <span className={UI.sectionLabel}>
                    🔗 配穴建議
                  </span>

                  <div className={`${UI.text} rounded-xl bg-[#F7F9F6]/70 p-5`}>
                    {acuDetails.matchingPoints
                      ? acuDetails.matchingPoints
                          .split('\n')
                          .filter(
                            (line) =>
                              line.trim() !== ''
                          )
                          .map((line, index) => {
                            const colonIndex =
                              line.indexOf('：');

                            if (colonIndex !== -1) {
                              return (
                                <div
                                  key={index}
                                  className="mb-2 flex flex-wrap items-baseline"
                                >
                                  <strong className="mr-1 shrink-0 font-bold text-[#2F4638]">
                                    {line.substring(
                                      0,
                                      colonIndex + 1
                                    )}
                                  </strong>

                                  <span>
                                    {parseBoldSyntax(
                                      line.substring(
                                        colonIndex + 1
                                      )
                                    )}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={index}
                                className="mb-2"
                              >
                                {parseBoldSyntax(line)}
                              </div>
                            );
                          })
                      : (
                        <span className="italic text-[#A39284]">
                          無記載配穴資訊
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}