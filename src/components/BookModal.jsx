import React, {
  useState,
  useRef,
} from 'react';

const LEVEL_TYPES = [
  '篇',
  '章',
  '節',
  '目',
  '子目',
];

const CONTENT_TYPE = '內文';
const INTRODUCTION_TYPE = '簡介';
const INTRODUCTION_ID =
  '__book_introduction__';

function normalizeType(
  type,
  level = 0
) {
  if (type === 'folder') {
    return LEVEL_TYPES[
      Math.min(
        level,
        LEVEL_TYPES.length - 1
      )
    ];
  }

  if (type === 'content') {
    return CONTENT_TYPE;
  }

  if (
    LEVEL_TYPES.includes(type) ||
    type === CONTENT_TYPE
  ) {
    return type;
  }

  return level === 0
    ? '篇'
    : LEVEL_TYPES[
        Math.min(
          level,
          LEVEL_TYPES.length - 1
        )
      ];
}

function getLevelLabel(
  type,
  level = 0
) {
  if (
    type === INTRODUCTION_TYPE
  ) {
    return INTRODUCTION_TYPE;
  }

  if (type === CONTENT_TYPE) {
    return CONTENT_TYPE;
  }

  return LEVEL_TYPES[
    Math.min(
      level,
      LEVEL_TYPES.length - 1
    )
  ];
}

function getRawTitle(
  fullTitle = ''
) {
  const match = fullTitle.match(
    /(.*?)[（\(]別名[：:](.*?)[）\)]/
  );

  return match
    ? match[1].trim()
    : fullTitle;
}

function getAliasTitle(
  fullTitle = ''
) {
  const match = fullTitle.match(
    /(.*?)[（\(]別名[：:](.*?)[）\)]/
  );

  return match
    ? match[2].trim()
    : '';
}

export default function BookModal({
  item,
  onClose,
  backLabel = '返回列表',
}) {
  const [
    selectedContent,
    setSelectedContent,
  ] = useState(null);

  const [
    expandedDirectories,
    setExpandedDirectories,
  ] = useState(
    () => new Set()
  );

  const contentRef =
    useRef(null);

  if (!item) {
    return null;
  }

  const restoreArray = (
    value
  ) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (
      typeof value !== 'object'
    ) {
      return [];
    }

    return Object.keys(value)
      .filter((key) =>
        /^\d+$/.test(key)
      )
      .sort(
        (a, b) =>
          Number(a) - Number(b)
      )
      .map((key) => value[key]);
  };

  const deepRestore = (
    node,
    level = 0
  ) => {
    if (!node) {
      return node;
    }

    return {
      ...node,

      type: normalizeType(
        node.type,
        level
      ),

      children: restoreArray(
        node.children
      ).map((child) =>
        deepRestore(
          child,
          level + 1
        )
      ),
    };
  };

  const processedChapters =
    restoreArray(
      item.bookDetails?.chapters
    ).map((node) =>
      deepRestore(node, 0)
    );

  const bookDescription =
    String(
      item.description ||
        item.knowledgeDetails
          ?.introduction ||
        ''
    ).trim();

  const bookAuthor =
    String(
      item.bookDetails?.author ||
        ''
    ).trim();

  const bookEnglishName =
    String(
      item.englishName || ''
    ).trim();

  const introductionItem = {
    id: INTRODUCTION_ID,
    title: '簡介',
    type: INTRODUCTION_TYPE,
    text: bookDescription,
    children: [],
  };

  const directoryItems = [
  ...(bookDescription
    ? [introductionItem]
    : []),
  ...processedChapters,
];

  const renderTable = (
    rows
  ) => (
    <div className="my-7 overflow-hidden rounded-2xl border border-[#E5E0D8] bg-[#FFFCF8] shadow-[0_8px_22px_rgba(63,81,68,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
          <tbody>
            {rows.map(
              (row, rowIndex) => {
                const cells = row
                  .split('|')
                  .map((cell) =>
                    cell.trim()
                  )
                  .filter(
                    (
                      cell,
                      index,
                      array
                    ) => {
                      if (
                        index === 0 &&
                        cell === ''
                      ) {
                        return false;
                      }

                      if (
                        index ===
                          array.length - 1 &&
                        cell === ''
                      ) {
                        return false;
                      }

                      return true;
                    }
                  );

                if (
                  cells.length === 0 ||
                  cells.every((cell) =>
                    cell.includes('-')
                  )
                ) {
                  return null;
                }

                return (
                  <tr
                    key={rowIndex}
                    className={`border-b border-[#EEE8DF] last:border-b-0 ${
                      rowIndex === 0
  ? 'bg-[#E4D2BDFF] text-[#3A4F3F]'
                        : 'text-[#45584B] hover:bg-[#FCFAF6]'
                    }`}
                  >
                    {cells.map(
                      (
                        cell,
                        cellIndex
                      ) => (
                        <td
                          key={cellIndex}
                          className={`whitespace-pre-wrap px-4 py-3.5 align-top ${
                            cellIndex !==
                            cells.length - 1
                              ? 'border-r border-[#EEE8DF]'
                              : ''
                          } ${
                            rowIndex === 0
                              ? 'font-bold tracking-wide'
                              : 'leading-7'
                          }`}
                        >
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const parseModalSyntax = (
    str
  ) => {
    if (
      typeof str !== 'string'
    ) {
      return null;
    }

    const lines = str.split('\n');
    let tableBuffer = [];
    const result = [];

    const processInlineSyntax = (
      text
    ) => {
      const regex =
        /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》)/g;

      return text
        .split(regex)
        .map((part, index) => {
          if (!part) {
            return null;
          }

          if (
            part.startsWith('==') &&
            part.endsWith('==')
          ) {
            return (
              <mark
                key={`inline-${index}`}
                className="rounded-md bg-[#EFD8B8] px-1.5 py-0.5 font-semibold text-[#243126]"
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
                key={`inline-${index}`}
                className="font-bold text-[#243126]"
              >
                {part.replace(
                  /\*\*/g,
                  ''
                )}
              </strong>
            );
          }

          if (
            part.startsWith('《') &&
            part.endsWith('》')
          ) {
            return (
              <span
                key={`inline-${index}`}
                className="font-semibold text-[#5E7263]"
              >
                {part}
              </span>
            );
          }

          if (
            part.startsWith('【') &&
            part.endsWith('】')
          ) {
            const hasAlias =
              part.match(
                /\(([^)]+)\)/
              );

            const raw = part
              .replace(
                /\([^)]+\)/,
                ''
              )
              .replace(
                /[【】]/g,
                ''
              );

            const isSubheading = [
              '概念',
              '辨證分析',
              '文獻別錄',
            ].includes(raw);

            if (isSubheading) {
              return (
                <div
                  key={`inline-${index}`}
                  className="relative my-6 flex w-full items-center gap-3"
                >
                  <div className="absolute left-0 top-0 h-11 w-full rounded-xl bg-[#6B9080]/10" />

                  <div className="relative z-10 flex items-center gap-2 pl-3">
                    <span className="translate-y-[8px] text-lg font-extrabold tracking-tight text-[#2F4638] md:text-xl">
                      {raw}
                    </span>

                    {hasAlias && (
                      <span className="rounded-md bg-[#D9C6B0]/40 px-2 py-0.5 text-xs font-medium text-[#8C725F]">
                        {hasAlias[1]}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <span
                key={`inline-${index}`}
                className="my-2 flex w-full flex-wrap items-center gap-2 rounded-lg py-1.5 pl-1 text-sm font-bold text-[#2F4638]"
              >
                <span>
                  [{raw}]
                </span>

                {hasAlias && (
                  <span className="rounded-md bg-[#D9C6B0]/35 px-2 py-0.5 text-xs font-medium text-[#8C725F]">
                    {hasAlias[1]}
                  </span>
                )}
              </span>
            );
          }

          return part;
        });
    };

    lines.forEach(
      (line, lineIndex) => {
        const trimmed =
          line.trim();

        if (
          trimmed.startsWith('|')
        ) {
          tableBuffer.push(trimmed);
          return;
        }

        if (tableBuffer.length > 0) {
          result.push(
            <div
              key={`table-${lineIndex}`}
            >
              {renderTable(
                tableBuffer
              )}
            </div>
          );

          tableBuffer = [];
        }

        if (!trimmed) {
          return;
        }

        const isNumbered =
          /^(?:\d+\.|[一二三四五六七八九十]+[、.])/.test(
            trimmed
          );

        const isIndented =
          trimmed.startsWith('●');

        if (isNumbered) {
          const splitIndex =
            trimmed.search(
              /[.、]/
            ) + 1;

          result.push(
            <div
              key={`line-${lineIndex}`}
              className="grid grid-cols-[auto_1fr] gap-x-2"
            >
              <span className="shrink-0 font-bold text-[#2F4638]">
                {trimmed.substring(
                  0,
                  splitIndex
                )}
              </span>

              <span>
                {processInlineSyntax(
                  trimmed
                    .substring(
                      splitIndex
                    )
                    .trim()
                )}
              </span>
            </div>
          );

          return;
        }

        if (isIndented) {
          result.push(
            <div
              key={`line-${lineIndex}`}
              className="mb-1 flex items-baseline"
            >
              <span className="mr-2 shrink-0 text-[#7C6E60]">
                ●
              </span>

              <span className="flex-1 leading-relaxed">
                {processInlineSyntax(
                  trimmed
                    .replace('●', '')
                    .trim()
                )}
              </span>
            </div>
          );

          return;
        }

        result.push(
          <div key={`line-${lineIndex}`}>
            {processInlineSyntax(
              trimmed
            )}
          </div>
        );
      }
    );

    if (tableBuffer.length > 0) {
      result.push(
        <div key="final-table">
          {renderTable(
            tableBuffer
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 text-[17px] leading-8 text-[#3A4F3F]">
        {result}
      </div>
    );
  };

  const renderTitleWithAlias = (
    fullTitle = ''
  ) => {
    const alias =
      getAliasTitle(fullTitle);

    const raw =
      getRawTitle(fullTitle);

    if (alias) {
      return (
        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-2xl font-black tracking-tight text-[#2F4638] md:text-3xl">
            {raw}
          </span>

          <span className="rounded-full bg-[#D9C6B0]/35 px-2.5 py-1 text-xs font-medium text-[#8C725F]">
            別名：
            {alias}
          </span>
        </div>
      );
    }

    return (
      <span className="text-2xl font-black tracking-tight text-[#2F4638] md:text-3xl">
        {fullTitle}
      </span>
    );
  };

  const renderDirectory = (
  items,
  level = 0
) => (
  <div className="w-full space-y-1.5">
    {items.map((directoryItem) => {
      if (
        !directoryItem ||
        !directoryItem.id
      ) {
        return null;
      }

      const children =
        Array.isArray(
          directoryItem.children
        )
          ? directoryItem.children
          : [];

      const hasChildren =
        children.length > 0;

      const isIntroduction =
        directoryItem.id ===
        INTRODUCTION_ID;

      const isContent =
        isIntroduction ||
        directoryItem.type ===
          CONTENT_TYPE;

      const hasOwnText =
        Boolean(
          String(
            directoryItem.text || ''
          ).trim()
        );

      const canRead =
        isIntroduction ||
        isContent ||
        hasOwnText;

      const isExpandable =
        hasChildren;

      const isActive =
        selectedContent?.id ===
        directoryItem.id;

      const isExpanded =
        expandedDirectories.has(
          directoryItem.id
        );

      const toggleExpanded = (
        event
      ) => {
        event.stopPropagation();

        setExpandedDirectories(
          (previous) => {
            const next = new Set(
              previous
            );

            if (
              next.has(
                directoryItem.id
              )
            ) {
              next.delete(
                directoryItem.id
              );
            } else {
              next.add(
                directoryItem.id
              );
            }

            return next;
          }
        );
      };

      const handleDirectoryClick =
        () => {
          if (canRead) {
            setSelectedContent(
              directoryItem
            );

            requestAnimationFrame(
              () => {
                if (
                  contentRef.current
                ) {
                  contentRef.current.scrollTo(
                    {
                      top: 0,
                      behavior: 'smooth',
                    }
                  );
                }
              }
            );

            return;
          }

          if (isExpandable) {
            setExpandedDirectories(
              (previous) => {
                const next = new Set(
                  previous
                );

                if (
                  next.has(
                    directoryItem.id
                  )
                ) {
                  next.delete(
                    directoryItem.id
                  );
                } else {
                  next.add(
                    directoryItem.id
                  );
                }

                return next;
              }
            );
          }
        };

      const typeLabel =
        isIntroduction
          ? INTRODUCTION_TYPE
          : isContent
            ? CONTENT_TYPE
            : directoryItem.type ||
              LEVEL_TYPES[
                Math.min(
                  level,
                  LEVEL_TYPES.length - 1
                )
              ];

      const icon =
        isIntroduction
          ? '📖'
          : isExpandable
            ? isExpanded
              ? '📂'
              : '📁'
            : '📄';

      return (
        <div
          key={directoryItem.id}
          className="w-full"
        >
          <div className="flex w-full items-stretch gap-1">
            <button
              type="button"
              onClick={
                handleDirectoryClick
              }
              className={`group relative min-w-0 flex-1 overflow-hidden rounded-lg border px-3 py-2 text-left transition-all duration-200 ${
                isActive
                  ? 'border-[#3A4F3F] bg-[#3A4F3F] text-white'
                  : 'border-transparent bg-[#FDFBF7] text-[#5E7263] hover:border-[#E5E0D8] hover:bg-white'
              }`}
            >
              <div
                className={`absolute left-0 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full ${
                  isActive
                    ? 'bg-[#D9C6B0]'
                    : 'bg-transparent group-hover:bg-[#6B9080]/40'
                }`}
              />

              <div className="flex min-w-0 items-center gap-2 pl-1">
                <span className="shrink-0 text-xs opacity-75">
                  {icon}
                </span>

                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/15 text-[#F5E6D1]'
                      : 'bg-[#6B9080]/10 text-[#6B9080]'
                  }`}
                >
                  {typeLabel}
                </span>

                <span className="min-w-0 truncate text-sm font-medium">
                  {getRawTitle(
                    directoryItem.title ||
                      '無標題內容'
                  )}
                </span>

                {hasOwnText &&
                  isExpandable && (
                    <span className="shrink-0 text-[10px] opacity-75">
                      有內文
                    </span>
                  )}
              </div>
            </button>

            {isExpandable && (
              <button
                type="button"
                onClick={toggleExpanded}
                className={`flex w-8 shrink-0 items-center justify-center rounded-lg border text-xs transition ${
                  isActive
                    ? 'border-[#3A4F3F] bg-[#3A4F3F] text-white'
                    : 'border-transparent bg-[#FDFBF7] text-[#6B9080] hover:border-[#E5E0D8] hover:bg-white'
                }`}
                aria-label={
                  isExpanded
                    ? '收合子內容'
                    : '展開子內容'
                }
              >
                {isExpanded
                  ? '▾'
                  : '▸'}
              </button>
            )}
          </div>

          {isExpandable &&
            isExpanded && (
              <div className="mt-1.5 space-y-1.5 border-l border-[#E5E0D8] pl-2">
                {renderDirectory(
                  children,
                  level + 1
                )}
              </div>
            )}
        </div>
      );
    })}
  </div>
);

  const selectedIsIntroduction =
    selectedContent?.id ===
    INTRODUCTION_ID;

  return (
    <div className="fixed inset-0 z-[200] flex h-screen w-full flex-col overflow-hidden bg-[#F4EFE7] text-[#3A4F3F]">
      <header className="shrink-0 border-b border-[#D8C8B8] bg-[#FFFCF8] shadow-[0_4px_18px_rgba(96,116,102,0.12)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-3xl leading-none md:text-4xl">
              📖
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B9080]">
                Book Reader
              </p>

              <h2 className="truncate text-lg font-black text-[#718678] md:text-xl">
                {item.name}
              </h2>

              <p className="hidden text-xs text-[#8C725F] sm:block">
                {item.category} 閱讀器
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                typeof onClose ===
                'function'
              ) {
                onClose();
              }
            }}
            className="shrink-0 rounded-lg border border-[#B2B2A8] bg-[#B2B2A8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5F7568]"
          >
            {backLabel}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 bg-[#F5EEE5] p-4 md:p-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#D8C8B8] bg-[#FBF7F1] shadow-[0_8px_24px_rgba(63,81,68,0.08)]">
            <div className="shrink-0 border-b border-[#D8C8B8] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#AD9683]">
                Contents
              </p>

              <div className="mt-1 flex items-center justify-between">
                <h3 className="text-base font-black text-[#3A4F3F]">
                  目錄
                </h3>

                <span className="text-xs text-[#AD9683]">
                  Book Tree
                </span>
              </div>

              <div className="mt-1 h-1 w-10 rounded-full bg-[#6B9080]" />
            </div>

            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {directoryItems.length > 0 ? (
                renderDirectory(
                  directoryItems
                )
              ) : (
                <div className="rounded-xl border border-dashed border-[#D8C8B8] bg-[#FCF8F2] px-4 py-8 text-center">
                  <div className="mb-3 text-2xl">
                    📚
                  </div>

                  <p className="text-sm text-[#AD9683]">
                    目前沒有目錄內容
                  </p>
                </div>
              )}
            </div>
          </aside>

          <main
  ref={contentRef}
  className="scrollbar-hidden min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-[#D8C8B8] bg-[#F7EFE5] p-4 shadow-[0_8px_24px_rgba(63,81,68,0.08)] md:p-6"
>
            {selectedContent ? (
              <div className="w-full pb-6">
                <div className="mb-4 border-b border-[#D8C8B8] px-2 pb-4 md:px-4">
                  <div className="mb-3 flex items-center gap-2 text-xs text-[#AD9683]">
                    <span>目錄</span>

                    <span className="text-[#D9C6B0]">
                      /
                    </span>

                    <span className="truncate text-[#6B9080]">
                      {getLevelLabel(
                        selectedContent.type,
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="hidden h-10 w-1 shrink-0 rounded-full bg-[#6B9080] sm:block" />

                    <div className="min-w-0 flex-1">
                      {renderTitleWithAlias(
                        selectedContent.title ||
                          '無標題內容'
                      )}
                    </div>
                  </div>
                </div>

                <article className="w-full rounded-xl bg-[#FFFCF8] px-6 py-7 shadow-[0_6px_18px_rgba(63,81,68,0.06)] md:px-10 md:py-9 lg:px-14">
                  {selectedIsIntroduction ? (
                    <div className="space-y-6">
                      {(bookEnglishName ||
                        bookAuthor) && (
                        <div className="border-b border-[#E5D8C8] pb-5">
                          {bookEnglishName && (
                            <p className="mb-2 text-sm italic text-[#A39284]">
                              {bookEnglishName}
                            </p>
                          )}

                          {bookAuthor && (
                            <p className="text-sm font-medium text-[#6B9080]">
                              作者／編著：
                              {bookAuthor}
                            </p>
                          )}
                        </div>
                      )}

                      {bookDescription ? (
                        <div className="whitespace-pre-wrap break-words text-[15px] leading-8 text-[#5E7263]">
                          {bookDescription}
                        </div>
                      ) : (
                        <div className="py-16 text-center text-[16px] italic text-[#AD9683]">
                          尚無書籍簡介。
                        </div>
                      )}
                    </div>
                  ) : selectedContent.text ? (
                    parseModalSyntax(
                      selectedContent.text
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#F2E9DE] text-2xl">
                        ✦
                      </div>

                      <p className="text-base font-semibold text-[#756A63]">
                        尚無內容
                      </p>

                      <p className="mt-2 text-sm text-[#AD9683]">
                        此章節目前還沒有編輯內容。
                      </p>
                    </div>
                  )}
                </article>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#B59A82]">
                  <span className="h-px w-10 bg-[#D8C8B8]" />

                  <span>
                    本草與芳香數位百科
                  </span>

                  <span className="h-px w-10 bg-[#D8C8B8]" />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-[#D8C8B8] bg-[#FCF8F2] px-6 py-10 text-center">
                <div>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-[#F2E9DE] text-3xl">
                    📖
                  </div>

                  <h3 className="text-xl font-black text-[#3A4F3F]">
                    開始閱讀
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#AD9683]">
                    請從左側目錄選擇一個篇章
                    <br />
                    閱讀完整百科內容
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}