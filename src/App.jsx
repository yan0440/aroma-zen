import React, {
  useState,
  useEffect,
  useMemo,
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


import { db } from './firebase';
import {
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';


const CATEGORIES = [
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
  '其他',
];


const BOLD_KEYWORDS = [
  '肌肉',
  '神經',
  '血管',
];


const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();


const getDataKey = (item) =>
  `${normalizeText(item?.category)}__${normalizeText(item?.name)}`;


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


function parseBoldSyntax(str) {
  if (typeof str !== 'string') {
    return str;
  }

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map((line, lineIndex) => (
    <span
      key={lineIndex}
      className="mb-1 block"
    >
      {line.split(regex).map((part, index) => {
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
              className="rounded bg-[#F3E1C5] px-1"
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
              className="font-semibold text-[#2F4638]"
            >
              {part.replace(/\*\*/g, '')}
            </strong>
          );
        }

        if (BOLD_KEYWORDS.includes(part)) {
          return (
            <strong
              key={index}
              className="font-semibold text-[#2F4638]"
            >
              {part}
            </strong>
          );
        }

        if (
          part.match(/^[【《\(].*[】》\)]$/)
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
      })}
    </span>
  ));
}


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
          onClick();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#3A4F3F]">
          {item.category}
        </span>

        {tags.map((tag, index) => (
          <span
            key={`tag-${index}`}
            className="rounded-full border border-[#E7DED4] bg-white px-3 py-1 text-[11px] font-medium text-[#7C8A80]"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-2xl font-black tracking-tight text-[#2F4638] transition-colors group-hover:text-[#6B9080] md:text-[1.7rem]">
        {item.name}
      </h3>

      <p className="mb-4 mt-2 font-serif text-sm italic text-[#A39284]">
        {item.category === '精油'
          ? item.englishName
          : item.category === '穴道'
            ? item.acuTable?.code || ''
            : item.alias || ''}
      </p>

      <div className="text-sm leading-7 text-[#5F6F65]">
        {parseBoldSyntax(
          item.description || item.effect || ''
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#EEE6DC] pt-4">
        <span className="text-xs text-[#A39284]">
          點擊查看詳細內容
        </span>

        <span className="text-xs font-semibold text-[#6B9080] transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </div>
  );
});


const getBookSearchText = (item) => {
  if (item._searchText) {
    return item._searchText;
  }

  const walkChapters = (chapters) => {
    if (!chapters) {
      return '';
    }

    const array = Array.isArray(chapters)
      ? chapters
      : Object.values(chapters);

    return array
      .map((chapter) => {
        const current = [
          chapter.title,
          chapter.alias,
          chapter.name,
          chapter.text,
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
    item.tag,
    item.source,
    item.constitutionTag,
    item.chemicalTag,
    item.description,
    item.effect,
    item.indications,
    item.syndrome,
    item.modifications,
    item.modernApp,
    item.acuTable?.meridian,
    item.acuTable?.effectAncient,
    item.acuTable?.effectModern,
    item.acuTable?.function,
    item.acuTable?.combination,
    item.acuTable?.matchingPoints,
    item.acuTable?.code,
    item.acuDetails?.indications,
    item.acuDetails?.effectAncient,
    item.acuDetails?.effectModern,
    item.acuDetails?.matchingPoints,
    item.oilDetails?.mindEffect,
    item.oilDetails?.bodyEffect,
    item.oilDetails?.skinEffect,
    item.oilDetails?.usage,
    item.oilDetails?.nature,
    item.oilDetails?.attribute,
    item.oilDetails?.meridian,
    item.oilDetails?.origin,
    item.pharmacology,
    item.contemporary,
    item.directions,
    item.note,
  ];

  return normalizeText(
    fields
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
      <div className="fixed left-1/2 top-4 z-[300] w-[92%] max-w-xl -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-center text-sm text-white shadow-lg">
        {dataError}
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-sm text-white shadow-lg">
        目前離線，正在使用已儲存的百科資料
      </div>
    );
  }

  if (isUsingCache) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[300] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-sm text-white shadow-lg">
        目前使用已儲存的百科資料
      </div>
    );
  }

  return null;
}


export default function App() {
  const [dbData, setDbData] = useState([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    debouncedSearchQuery,
    setDebouncedSearchQuery,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('書籍');

  const [activeItem, setActiveItem] =
    useState(null);

  const [isAdminMode, setIsAdminMode] =
    useState(false);

  const [visibleCount, setVisibleCount] =
    useState(20);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  const [isUsingCache, setIsUsingCache] =
    useState(false);

  const [dataError, setDataError] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);


  useEffect(() => {
    const entriesQuery = query(
      collection(db, 'entries')
    );

    console.log(
      '開始讀取 Firestore entries...'
    );

    const unsubscribe = onSnapshot(
      entriesQuery,
      {
        includeMetadataChanges: true,
      },
      (snapshot) => {
        const entries = snapshot.docs.map(
          (entryDoc) => ({
            id: entryDoc.id,
            ...entryDoc.data(),
          })
        );

        console.log(
          'Firestore 讀取成功'
        );

        console.log(
          '資料筆數:',
          entries.length
        );

        console.log(
          '是否使用快取:',
          snapshot.metadata.fromCache
        );

        console.log(
          '資料內容:',
          entries
        );

        console.table(
          entries.map((entry) => ({
            id: entry.id,
            category: entry.category,
            name: entry.name,
            entryKey: entry.entryKey,
            description:
              entry.description || '',
            nature:
              entry.oilDetails?.nature || '',
            property:
              entry.oilDetails?.property || '',
            meridian:
              entry.oilDetails?.meridian || '',
            origin:
              entry.oilDetails?.origin || '',
          }))
        );

        setDbData(entries);
        setIsUsingCache(
          snapshot.metadata.fromCache
        );
        setDataError('');
        setIsLoading(false);
      },
      (error) => {
        console.error(
          'Firestore 讀取錯誤:',
          error
        );

        console.error(
          '錯誤代碼:',
          error.code
        );

        console.error(
          '錯誤訊息:',
          error.message
        );

        setDataError(
          `百科資料讀取失敗：${
            error.code || error.message
          }`
        );

        setIsLoading(false);
      }
    );

    return () => {
      console.log(
        '取消 Firestore 監聽'
      );

      unsubscribe();
    };
  }, []);


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
      setDebouncedSearchQuery(
        searchQuery
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);


  useEffect(() => {
    setVisibleCount(20);
  }, [
    selectedCategory,
    debouncedSearchQuery,
  ]);


  const staticData = useMemo(
    () => [
      ...(oilData || []),
      ...(acuData || []),
      ...(herbData || []),
      ...(formulaData || []),
      ...(bookData || []),
    ],
    []
  );


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

        return cleanItem;
      });
  }, [staticData, dbData]);


  const filteredData = useMemo(() => {
    const normalizedQuery =
      debouncedSearchQuery
        .trim()
        .toLowerCase();

    return allData.filter((item) => {
      if (!item || !item.name) {
        return false;
      }

      if (selectedCategory === '其他') {
        return false;
      }

      if (
        item.category !== selectedCategory
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText =
        item.category === '書籍'
          ? item._searchText || ''
          : getSearchText(item);

      return searchableText.includes(
        normalizedQuery
      );
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


  const handleCloseDetail = () => {
    setActiveItem(null);
  };


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
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-sm text-[#7F6D5F] shadow-sm transition-all hover:text-[#3A4F3F] hover:shadow-md"
          >
            ← 返回列表
          </button>
        </div>

        <div className="px-4 pb-12">
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#E5E0D8] bg-white px-6 py-12 text-center text-[#A39284] shadow-sm">
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
        onClick={() =>
          setIsAdminMode(true)
        }
        className="fixed left-3 top-3 z-50 rounded-full border border-white bg-white px-3 py-1 text-[10px] font-medium text-[#A39284] shadow-sm transition-all hover:bg-white hover:text-[#3A4F3F]"
      >
        開發者專區
      </button>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <header className="mb-12 text-center md:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-xs tracking-[0.28em] text-[#A39284] shadow-sm">
            東方經絡 × 西方芳療
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-[#2F4638] md:text-6xl">
            本草與芳香數位百科
          </h1>

          <p className="text-sm tracking-wide text-[#8E7B6A] md:text-base">
            結合東方經絡與西方芳療的健康數位誌
          </p>
        </header>

        <section className="mb-10 rounded-[2rem] border border-white bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B19C8A]">
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
                className="w-full rounded-2xl border border-[#E6DDD3] bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-[#3A4F3F]/30 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:justify-end md:pb-0">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#2F4638] text-white shadow-md'
                      : 'border border-[#E6DDD3] bg-white text-[#5F6F65] hover:text-[#2F4638]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main>
          {selectedCategory === '其他' ? (
            <OtherCategoryView
              allData={allData}
            />
          ) : filteredData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                {visibleData.map((item, index) => (
                  <DataCard
                    key={
                      item.id ||
                      `${item.category}-${item.name}-${index}`
                    }
                    item={item}
                    onClick={() =>
                      setActiveItem(item)
                    }
                  />
                ))}
              </div>

              {visibleCount <
                filteredData.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        (count) => count + 20
                      )
                    }
                    className="rounded-full bg-[#2F4638] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90"
                  >
                    載入更多
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-[#E5E0D8] bg-white px-6 py-16 text-center text-[#A39284] shadow-sm">
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