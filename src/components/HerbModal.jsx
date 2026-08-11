import React, {
  useEffect,
  useRef,
  useState,
} from 'react';


const parseBoldSyntax = (str) => {
  if (!str) {
    return null;
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
  text: 'text-[16px] leading-8 text-[#55655B]',

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
        '此條目目前尚未填寫簡介。'
      }
      className={`w-full resize-none overflow-hidden whitespace-pre-wrap border-0 bg-transparent px-0 py-0 text-[16px] leading-8 text-[#55655B] outline-none focus:outline-none focus:ring-0 ${className}`}
      style={{ height }}
    />
  );
};


export default function HerbModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  if (!item) {
    return null;
  }

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

          if (
            typeof trimmed === 'string' &&
            /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(
              trimmed
            )
          ) {
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

          if (
            typeof trimmed === 'string' &&
            trimmed.startsWith('●')
          ) {
            return (
              <div
                key={index}
                className="mb-1 grid grid-cols-[1rem_1fr] gap-x-2"
              >
                <span className="text-[#A39284]">
                  ●
                </span>

                <span className="flex-1 text-left leading-relaxed">
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

  const displayAlert =
    item.alert ||
    (['中藥', '方劑'].includes(item.category)
      ? '本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。'
      : '');

  const fields = [
    {label: '🌱 品種來源', val: item.source,},
    {label: '🔍 性狀', val: item.traits,},
    {label: '✨ 功效', val: item.effect,},
    {label: '🎯 主治', val: item.indications,},
    {label: '⚖️ 用法用量', val: item.dosage,},
    {label: '🧬 現代藥理', val: item.pharmacology,},
    {label: '🏥 現代應用', val: item.contemporary,},
    {label: '📜 選方', val: item.medicine,},
    {label: '📚 文獻別錄', val: item.literature,},
    {label: '⚠️ 注意禁忌', val: item.contraindication,},
    {label: '🔥 炮製儲藏', val: item.preparation,},
    {label: '💡 附藥說明', val: item.directions,},
    {label: '📝註', val: item.note,}
  ];

  const rows = [
    {label: '🏷️ 別名', val: item.alias,},
    {label: '🗂️ 類別', val: item.tag || item.category,},
    {label: '🌿 科屬', val: item.family,},
    {label: '👅 性味', val: item.nature,},
    {label: '🎯 歸經', val: item.meridian,}
  ];

  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-full flex-col overflow-hidden bg-[#F4EFE7] text-[#3A4F3F]">
      <header className="shrink-0 border-b border-[#D8C8B8] bg-[#FFFCF8] shadow-[0_4px_18px_rgba(96,116,102,0.12)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl leading-none md:text-3xl">
              🌿
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B9080]">
                Herbal Medicine
              </p>

              <h1 className="truncate text-lg font-black text-[#718678] md:text-xl">
                {item.name}
              </h1>

              <p className="hidden text-xs text-[#8C725F] sm:block">
                中藥百科詳細資料
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
                {item.category && (
                  <span className="rounded-full bg-[#F3E1C5] px-2 py-0.5 text-xs font-medium text-[#2C3C30]">
                    {item.category}
                  </span>
                )}

                {item.tag &&
                  item.tag !== item.category && (
                    <span className="rounded-full bg-[#F7F5F0] px-2 py-0.5 text-xs font-medium text-[#6B7A6E]">
                      {item.tag}
                    </span>
                  )}
              </div>

              <h2 className={UI.title}>
                {item.name}
              </h2>

              <p className="mb-6 mt-1 border-b border-[#F0E8DE] pb-4 font-serif text-base italic text-[#A39284]">
                {item.alias || '中藥百科'}
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
                          {row.val || '無'}
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
            <div className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(63,81,68,0.07)] backdrop-blur-md md:p-10">
              <div className="space-y-8 text-[#3A4F3F]">
                {fields.map((field, index) => (
                  <div key={index}>
                    <h4 className={UI.sectionLabel}>
                      {field.label}
                    </h4>

                    {renderFormattedText(
                      field.val
                    )}
                  </div>
                ))}

                {displayAlert && (
                  <div className="mt-12 rounded-[1rem] bg-red-50/80 p-5 text-xs font-medium text-red-700">
                    <strong>
                      ⚠️ 重要提醒：
                    </strong>{' '}
                    {displayAlert}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}