import React, {
  useEffect,
  useRef,
  useState,
} from 'react';


const parseBoldSyntax = (str) => {
  if (!str) {
    return str;
  }

  const parts = String(str).split(
    /(\*\*.*?\*\*|==.*?==|《.*?》|【.*?】)/g
  );

  return parts.map((part, index) => {
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
  });
};


const UI = {
  text:
    'text-[15px] leading-8 text-[#55655B]',

  title:
    'mb-2 text-3xl font-bold text-[#2F4638] md:text-4xl',

  sectionLabel:
  'mb-3 mt-4 flex items-center gap-3 border-b border-[#E5E0D8] pb-2 text-base font-bold uppercase tracking-[0.18em] text-[#4E6654] before:block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[#6B9080]',
};


const AutoHeightTextarea = ({
  value,
  className = '',
}) => {
  const ref = useRef(null);
  const [height, setHeight] =
    useState('auto');

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


export default function OilModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) {
    return null;
  }

  const oilDetails =
    item.oilDetails ||
    item.oilTable ||
    {};

  const getOilValue = (key) => {
    const nestedValue =
      oilDetails?.[key];

    const topLevelValue =
      item?.[key];

    if (
      nestedValue !== undefined &&
      nestedValue !== null &&
      String(nestedValue).trim() !== ''
    ) {
      return nestedValue;
    }

    if (
      topLevelValue !== undefined &&
      topLevelValue !== null &&
      String(topLevelValue).trim() !== ''
    ) {
      return topLevelValue;
    }

    return '';
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const renderFormattedText = (text) => {
    if (!text) {
  return (
    <div className={UI.text}>
      <div className="mb-3">
        <span className="italic text-gray-400">
          無記載
        </span>
      </div>
    </div>
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
    {label: '🏷️ 別名',val: getOilValue('alias'),},
    {label: '🌿 植物種類／萃取部位',val: getOilValue('typePart'),},
    {label: '🧪 萃取方法',val: getOilValue('method'),},
    {label: '🧬 學名',val: getOilValue('latin'),},
    {label: '🌳 科名',val: getOilValue('family'),},
    {label: '👅 性味',val: getOilValue('nature'),},
    {label: '☯️ 五行',val: getOilValue('property'),},
    {label: '🎯 歸經',val: getOilValue('meridian'),},
    {label: '🩹 主治',val: getOilValue('indications'),},
    {label: '🎵 音符',val: getOilValue('noteAnalogy'),},
    {label: '🪐 星球',val: getOilValue('planet'),},
    {label: '🌍 產地',val: getOilValue('origin'),},
  ];


  const effects = [
    {title: '心靈療效',value: getOilValue('mindEffect'),icon: '🧠',},
    {title: '身體療效',value: getOilValue('bodyEffect'),icon: '🧍',},
    {title: '皮膚療效',value: getOilValue('skinEffect'),icon: '💪',},
  ];


  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-full flex-col overflow-hidden bg-[#F4EFE7] text-[#3A4F3F]">
      <header className="shrink-0 border-b border-[#D8C8B8] bg-[#FFFCF8] shadow-[0_4px_18px_rgba(96,116,102,0.12)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl leading-none md:text-3xl">
              🧴
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B9080]">
                Essential Oil
              </p>

              <h1 className="truncate text-lg font-black text-[#718678] md:text-xl">
                {item.name}
              </h1>

              <p className="hidden text-xs text-[#8C725F] sm:block">
                精油百科詳細資料
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
                  {item.constitutionTag ||
                    getOilValue('constitutionTag') ||
                    '無'}
                  體質
                </span>

                <span className="rounded-full bg-[#E5EAE6] px-2 py-0.5 text-xs font-medium text-[#4E6654]">
                  {item.chemicalTag ||
                    getOilValue('chemicalTag') ||
                    '無'}
                  屬性
                </span>
              </div>

              <h2 className={UI.title}>
                {item.name}
              </h2>

              <p className="mb-6 mt-1 border-b border-[#F0E8DE] pb-4 font-serif text-base italic text-[#A39284]">
                {item.englishName}
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
                  value={
                    item.description ||
                    getOilValue('description')
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-10">
              <div className="space-y-8 text-[#3A4F3F]">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <span className={UI.sectionLabel}>
                      🔍 氣味
                    </span>

                    {renderFormattedText(
                      getOilValue('scent')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      ✨ 外觀
                    </span>

                    {renderFormattedText(
                      getOilValue('appearance')
                    )}
                  </div>
                </div>

                <div>
                  <span className={`${UI.sectionLabel} text-base tracking-normal`}>
                    📜 應用歷史與相關神話
                  </span>

                  <div className="rounded-xl bg-[#F7F5F0]/60 p-5">
                    {renderFormattedText(
                      getOilValue('historyMyth')
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <span className={UI.sectionLabel}>
                      🔬 化學結構
                    </span>

                    {renderFormattedText(
                      getOilValue('chemistry')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      ⚖️ 屬性補充
                    </span>

                    {renderFormattedText(
                      getOilValue('attribute')
                    )}
                  </div>
                </div>

                {getOilValue('caution') && (
                  <div className="rounded-xl bg-red-50/70 p-5">
                    <span className="mb-2 block text-sm font-bold text-red-800">
                      ⚠️ 注意事項
                    </span>

                    {renderFormattedText(
                      getOilValue('caution')
                    )}
                  </div>
                )}

                <div>
                  <span className={`${UI.sectionLabel} text-base tracking-normal`}>
                    🩺 深度療效
                  </span>

                  <div className="space-y-4">
                    {effects.map((effect, index) => (
                      <div
                        key={index}
                        className="flex gap-4 border-b border-[#F7F5F0] pb-4 last:border-0 last:pb-0"
                      >
                        <div className="w-24 shrink-0 pt-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-[#4E6654]">
                            <span>
                              {effect.icon}
                            </span>

                            {effect.title}
                          </div>
                        </div>

                        <div className="flex-grow text-[14px] leading-7 text-[#55655B]">
                          {renderFormattedText(
                            effect.value
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div>
                    <span className={UI.sectionLabel}>
                      🧬 體質適用
                    </span>

                    {renderFormattedText(
                      getOilValue('constitution')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      🔗 適合調和的精油
                    </span>

                    {renderFormattedText(
                      getOilValue('blendingOils')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      🧪 精油配方
                    </span>

                    {renderFormattedText(
                      getOilValue('formulas')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      🧴 按摩基底油
                    </span>

                    {renderFormattedText(
                      getOilValue('carrierOils') ||
                      getOilValue('carrierOil')
                    )}
                  </div>

                  <div>
                    <span className={UI.sectionLabel}>
                      🚀 使用方法
                    </span>

                    {renderFormattedText(
                      getOilValue('usage')
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