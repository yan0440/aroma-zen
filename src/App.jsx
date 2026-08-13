import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';

import { oilData } from './data/oilData.js';
import { acuData } from './data/acuData.js';
import { herbData } from './data/herbData.js';
import { formulaData } from './data/formulaData.js';
import { bookData } from './data/bookData.js';

import OilModal from './components/OilModal';
import AcuModal from './components/AcuModal';
import HerbModal from './components/HerbModal';
import FormulaModal from './components/FormulaModal';
import BookModal from './components/BookModal';
import AdminPage from './components/AdminPage';
import OtherCategoryView from './components/OtherCategoryView';
import OtherDetailPage from './components/OtherDetailPage';

import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const CATEGORIES = [
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
  '其他',
];

const PAGE_SIZE = 20;

const BOLD_KEYWORDS = [
  '肌肉',
  '神經',
  '血管',
];

const getCategoryLabel = (category) =>
  category === '其他'
    ? '名詞／用品'
    : category;

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getDataKey = (item) =>
  `${normalizeText(item?.category)}__${normalizeText(
    item?.name
  )}`;

const getCreatedTime = (item) => {
  const value = item?.createdAt;

  if (typeof value === 'number') {
    return value;
  }

  if (
    value &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  }

  return 0;
};

const mergeNonEmpty = (
  base = {},
  incoming = {}
) => {
  const result = {
    ...base,
  };

  Object.entries(incoming || {}).forEach(
    ([key, value]) => {
      const isEmptyString =
        typeof value === 'string' &&
        value.trim() === '';

      if (
        value !== undefined &&
        value !== null &&
        !isEmptyString
      ) {
        result[key] = value;
      }
    }
  );

  return result;
};

const collectSearchText = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        collectSearchText(item)
      )
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map((item) =>
        collectSearchText(item)
      )
      .filter(Boolean)
      .join(' ');
  }

  return '';
};

const parseBoldSyntax = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map(
    (line, lineIndex) => (
      <span
        key={lineIndex}
        className="mb-1 block"
      >
        {line.split(regex).map(
          (part, index) => {
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
                  className="rounded bg-[#F3E1C5] px-1 font-bold text-[#2C3C30]"
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
                  className="font-bold text-[#2F4638]"
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }

            if (
              BOLD_KEYWORDS.includes(part)
            ) {
              return (
                <strong
                  key={index}
                  className="font-bold text-[#2F4638]"
                >
                  {part}
                </strong>
              );
            }

            if (
              /^[【《\(].*[】》\)]$/.test(part)
            ) {
              return (
                <span
                  key={index}
                  className="font-medium text-[#6B9080]"
                >
                  {part}
                </span>
              );
            }

            return part;
          }
        )}
      </span>
    )
  );
};

const DataCard = memo(function DataCard({
  item,
  onClick,
}) {
  const tags = [
    item.tag,
    item.constitutionTag,
    item.chemicalTag,
    item.acuTable?.meridian,
  ].filter(Boolean);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[13px] font-semibold tracking-wider text-[#3A4F3F]">
          {getCategoryLabel(item.category)}
        </span>

        {tags.map((tag, index) => (
          <span
            key={`tag-${index}`}
            className="rounded-full border border-[#E7DED4] bg-white px-3 py-1 text-[13px] font-medium text-[#7C8A80]"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-[26px] font-black leading-tight tracking-tight text-[#2F4638] transition-colors group-hover:text-[#6B9080] md:text-[28px]">
        {item.name}
      </h3>

      <p className="mb-4 mt-2 font-serif text-[15px] italic text-[#A39284]">
        {item.category === '精油'
          ? item.englishName || ''
          : item.category === '穴道'
            ? item.acuTable?.code || ''
            : item.category === '其他'
              ? item.type ||
                item.alias ||
                ''
              : item.alias || ''}
      </p>

      <div className="text-[16px] leading-8 text-[#5F6F65]">
        {parseBoldSyntax(
          item.description ||
            item.effect ||
            item.indications ||
            ''
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#EEE6DC] pt-4">
        <span className="text-[14px] text-[#A39284]">
          點擊查看詳細內容
        </span>

        <span className="text-[14px] font-semibold text-[#6B9080] transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </div>
  );
});

const getBookSearchText = (item) => {
  const walkChapters = (chapters) => {
    if (!chapters) {
      return '';
    }

    const chapterArray = Array.isArray(
      chapters
    )
      ? chapters
      : Object.values(chapters);

    return chapterArray
      .map((chapter) => {
        const current = [
          chapter.title,
          chapter.alias,
          chapter.name,
          chapter.text,
          chapter.content,
          chapter.description,
        ]
          .filter(Boolean)
          .join(' ');

        return `${current} ${walkChapters(
          chapter.children
        )}`;
      })
      .join(' ');
  };

  return normalizeText(
    [
      item.name,
      item.alias,
      item.bookDetails?.author,
      walkChapters(
        item.bookDetails?.chapters
      ),
    ]
      .filter(Boolean)
      .join(' ')
  );
};

const getSearchText = (item) => {
  const fields = [
    item.name,
    item.alias,
    item.englishName,
    item.type,
    item.latin,
    item.tag,
    item.source,
    item.typePart,
    item.method,
    item.property,
    item.noteAnalogy,
    item.planet,
    item.origin,
    item.constitutionTag,
    item.chemicalTag,
    item.description,
    item.effect,
    item.indications,
    item.literature,
    item.contraindication,
    item.nature,
    item.family,
    item.meridian,
    item.traits,
    item.dosage,
    item.pharmacology,
    item.contemporary,
    item.medicine,
    item.preparation,
    item.directions,
    item.analysis,
    item.discussion,
    item.syndrome,
    item.modifications,
    item.modernApp,
    item.modernPharmacology,
    item.prescription,
    item.note,
    item.usage,
    item.caution,
    item.acuTable?.code,
    item.acuTable?.meridian,
    item.acuTable?.alias,
    item.acuDetails?.location,
    item.acuDetails?.operation,
    item.acuDetails?.indications,
    item.acuDetails?.type,
    item.acuDetails?.nameExpl,
    item.acuDetails?.anatomy,
    item.acuDetails?.effectAncient,
    item.acuDetails?.effectModern,
    item.acuDetails?.matchingPoints,
    item.oilDetails?.scent,
    item.oilDetails?.appearance,
    item.oilDetails?.historyMyth,
    item.oilDetails?.chemistry,
    item.oilDetails?.attribute,
    item.oilDetails?.caution,
    item.oilDetails?.mindEffect,
    item.oilDetails?.bodyEffect,
    item.oilDetails?.skinEffect,
    item.oilDetails?.constitution,
    item.oilDetails?.blendingOils,
    item.oilDetails?.formulas,
    item.oilDetails?.carrierOils,
    item.oilDetails?.usage,
    item.knowledgeDetails,
  ];

  return normalizeText(
    fields
      .map((field) =>
        collectSearchText(field)
      )
      .filter(Boolean)
      .join(' ')
  );
};

function StatusMessage({
  isOnline,
  isUsingCache,
  dataError,
}) {
  if (dataError) {
    return (
      <div className="fixed left-1/2 top-4 z-[300] w-[92%] max-w-xl -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-center text-[15px] text-white shadow-lg">
        {dataError}
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-[15px] text-white shadow-lg">
        目前離線，正在使用已儲存的百科資料
      </div>
    );
  }

  if (isUsingCache) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-[15px] text-white shadow-lg">
        目前使用已儲存的百科資料
      </div>
    );
  }

  return null;
}

export default function App() {
  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery,] = useState('');
  const [selectedCategory,setSelectedCategory,] = useState('書籍');
  const [activeItem, setActiveItem] =useState(null);
  const [isAdminMode, setIsAdminMode] =useState(false);
  const [visibleCount, setVisibleCount] =useState(PAGE_SIZE);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined'? navigator.onLine: true);
  const [isUsingCache, setIsUsingCache] =useState(false);
  const [dataError, setDataError] =useState('');
  const [isLoading, setIsLoading] =useState(true);
  const staticData = useMemo(
    () => [...(oilData || []),...(acuData || []),...(herbData || []),...(formulaData || []),...(bookData || []),],[]);
  const loadFirstPage = useCallback(async () => {setIsLoading(true);setDataError('');setDbData([]);setVisibleCount(PAGE_SIZE);
    try {
  const entriesQuery = query(collection(db, 'entries'),where('category','==',selectedCategory)
      );
      const snapshot = await getDocs(
        entriesQuery
      );

      const entries = snapshot.docs.map(
        (entryDoc) => ({
          id: entryDoc.id,
          ...entryDoc.data(),
        })
      );

      setDbData(entries);
      setIsUsingCache(false);
    } catch (error) {
      console.error(
        'Firestore 讀取錯誤：',
        error
      );

      setDataError(
        `百科資料讀取失敗：${
          error.code || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDataError('');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsUsingCache(true);
    };

    window.addEventListener(
      'online',
      handleOnline
    );

    window.addEventListener(
      'offline',
      handleOffline
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    selectedCategory,
    debouncedSearchQuery,
  ]);

  const allData = useMemo(() => {
    const dataMap = new Map();

    staticData.forEach((item) => {
      if (
        !item ||
        !item.name ||
        !item.category
      ) {
        return;
      }

      const key = getDataKey(item);

      dataMap.set(key, {
        ...item,
        _source: 'static',
      });
    });

    dbData.forEach((dbItem) => {
      if (
        !dbItem ||
        !dbItem.name ||
        !dbItem.category
      ) {
        return;
      }

      const key = getDataKey(dbItem);
      const staticItem = dataMap.get(key);

      if (!staticItem) {
        dataMap.set(key, {
          ...dbItem,
          _source: 'firestore',
        });

        return;
      }

      const mergedItem = {
        ...mergeNonEmpty(
          staticItem,
          dbItem
        ),

        oilDetails: mergeNonEmpty(
          staticItem.oilDetails,
          dbItem.oilDetails
        ),

        acuTable: mergeNonEmpty(
          staticItem.acuTable,
          dbItem.acuTable
        ),

        acuDetails: mergeNonEmpty(
          staticItem.acuDetails,
          dbItem.acuDetails
        ),

        bookDetails: {
          ...staticItem.bookDetails,
          ...dbItem.bookDetails,
        },

        knowledgeDetails: {
          ...staticItem.knowledgeDetails,
          ...dbItem.knowledgeDetails,
          sections:
            dbItem.knowledgeDetails
              ?.sections ||
            staticItem.knowledgeDetails
              ?.sections ||
            [],
        },

        _source: 'firestore',
      };

      dataMap.set(key, mergedItem);
    });

    return Array.from(dataMap.values())
      .filter(
        (item) =>
          item &&
          item.name &&
          item.category
      )
      .sort((a, b) => {
        const timeA = getCreatedTime(a);
        const timeB = getCreatedTime(b);

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return String(a.name).localeCompare(
          String(b.name),
          'zh-Hant'
        );
      })
      .map((item) => {
        const {
          _source,
          ...cleanItem
        } = item;

        if (cleanItem.category === '書籍') {
          return {
            ...cleanItem,
            _searchText:
              getBookSearchText(cleanItem),
          };
        }

        return {
          ...cleanItem,
          _searchText:
            getSearchText(cleanItem),
        };
      });
  }, [staticData, dbData]);

  const filteredData = useMemo(() => {
    const normalizedQuery = normalizeText(
      debouncedSearchQuery
    );

    return allData.filter((item) => {
      if (!item || !item.name) {
        return false;
      }

      if (selectedCategory === '其他') {
        const mainCategories = [
          '書籍',
          '精油',
          '穴道',
          '中藥',
          '方劑',
        ];

        if (
          mainCategories.includes(
            item.category
          )
        ) {
          return false;
        }
      } else if (
        item.category !== selectedCategory
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        item._searchText || ''
      ).includes(normalizedQuery);
    });
  }, [
    allData,
    debouncedSearchQuery,
    selectedCategory,
  ]);

  const visibleData = useMemo(
    () =>
      filteredData.slice(
        0,
        visibleCount
      ),
    [filteredData, visibleCount]
  );

  const handleCloseDetail = useCallback(() => {
    setActiveItem(null);
  }, []);

  if (isAdminMode) {
    return (
      <>
        <StatusMessage
          isOnline={isOnline}
          isUsingCache={isUsingCache}
          dataError={dataError}
        />

        <AdminPage
          allData={allData}
          onBack={() =>
            setIsAdminMode(false)
          }
        />
      </>
    );
  }

  if (activeItem) {
    const modalMap = {
      精油: OilModal,
      穴道: AcuModal,
      中藥: HerbModal,
      方劑: FormulaModal,
      書籍: BookModal,
      其他: OtherDetailPage,
    };

    const ModalComponent =
      modalMap[activeItem.category];

    if (ModalComponent) {
      return (
        <ModalComponent
          item={activeItem}
          onClose={handleCloseDetail}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#fdfbf7] text-[#3A4F3F]">
        <StatusMessage
          isOnline={isOnline}
          isUsingCache={isUsingCache}
          dataError={dataError}
        />

        <div className="mx-auto max-w-6xl px-4 pt-8">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] text-[#7F6D5F] shadow-sm transition-all hover:text-[#3A4F3F] hover:shadow-md"
          >
            ← 返回列表
          </button>
        </div>

        <div className="px-4 pb-12">
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#E5E0D8] bg-white px-6 py-12 text-center text-[16px] text-[#A39284] shadow-sm">
            找不到此百科的詳細頁面。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#3A4F3F]">
      <StatusMessage
        isOnline={isOnline}
        isUsingCache={isUsingCache}
        dataError={dataError}
      />

      <button
        type="button"
        onClick={() => setIsAdminMode(true)}
        className="fixed left-3 top-3 z-50 rounded-full border border-white bg-white px-3 py-1 text-[12px] font-medium text-[#A39284] shadow-sm transition-all hover:text-[#3A4F3F]"
      >
        開發者專區
      </button>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <header className="mb-12 text-center md:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-[14px] tracking-[0.28em] text-[#A39284] shadow-sm">
            東方經絡 × 西方芳療
          </div>

          <h1 className="mb-4 text-[34px] font-black leading-tight tracking-tight text-[#2F4638] md:text-[46px]">
            本草與芳香數位百科
          </h1>

          <p className="text-[16px] tracking-wide text-[#8E7B6A] md:text-[17px]">
            結合東方經絡與西方芳療的健康數位誌
          </p>
        </header>

        <section className="mb-10 rounded-[2rem] border border-white bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#B19C8A]">
                ⌕
              </span>

              <input
                type="text"
                placeholder="搜尋名稱、英文、經絡或功效標籤..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-[#E6DDD3] bg-white py-3 pl-9 pr-4 text-[15px] outline-none transition focus:border-[#3A4F3F]/30"
              />
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:justify-end md:pb-0">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setSelectedCategory(
                      category
                    );
                    setSearchQuery('');
                    setActiveItem(null);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#2F4638] text-white shadow-md'
                      : 'border border-[#E6DDD3] bg-white text-[#5F6F65] hover:text-[#2F4638]'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main>
          {selectedCategory === '其他' ? (
            <OtherCategoryView
              allData={filteredData}
            />
          ) : filteredData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                {visibleData.map(
                  (item, index) => (
                    <DataCard
                      key={
                        item.id ||
                        `${getCategoryLabel(
                          item.category
                        )}-${item.name}-${index}`
                      }
                      item={item}
                      onClick={() =>
                        setActiveItem(item)
                      }
                    />
                  )
                )}
              </div>

              {visibleCount <
                filteredData.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        (previous) =>
                          previous + PAGE_SIZE
                      )
                    }
                    className="rounded-full bg-[#2F4638] px-5 py-2.5 text-[15px] font-medium text-white shadow-md transition-all hover:opacity-90"
                  >
                    載入更多
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-[#E5E0D8] bg-white px-6 py-16 text-center text-[16px] text-[#A39284] shadow-sm">
              {isLoading
                ? '正在讀取資料...'
                : '目前沒有符合條件的資料。'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}