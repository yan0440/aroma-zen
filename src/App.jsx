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

function parseBoldSyntax(str) {
  if (typeof str !== 'string') return str;

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str.split('\n').map((line, lineIndex) => (
    <span
      key={lineIndex}
      className="block mb-1"
    >
      {line.split(regex).map((part, i) => {
        if (!part) return null;

        if (
          part.startsWith('==') &&
          part.endsWith('==')
        ) {
          return (
            <mark
              key={i}
              className="bg-[#F3E1C5] px-1 rounded"
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
              key={i}
              className="text-[#2F4638] font-semibold"
            >
              {part.replace(/\*\*/g, '')}
            </strong>
          );
        }

        if (BOLD_KEYWORDS.includes(part)) {
          return (
            <strong
              key={i}
              className="text-[#2F4638] font-semibold"
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
              key={i}
              className="text-[#6B9080] font-medium"
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
      className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#3A4F3F]">
          {item.category}
        </span>

        {tags.map((tag, idx) => (
          <span
            key={`tag-${idx}`}
            className="rounded-full border border-[#E7DED4] bg-white px-3 py-1 text-[11px] font-medium text-[#7C8A80]"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-2xl md:text-[1.7rem] font-black tracking-tight text-[#2F4638] group-hover:text-[#6B9080] transition-colors">
        {item.name}
      </h3>

      <p className="mt-2 mb-4 text-sm italic text-[#A39284] font-serif">
        {item.category === '精油'
          ? item.englishName
          : item.acuTable?.code || ''}
      </p>

      <div className="text-sm leading-7 text-[#5F6F65]">
        {parseBoldSyntax(
          item.description || item.effect || ''
        )}
      </div>

      <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#EEE6DC]">
        <span className="text-xs text-[#A39284]">
          點擊查看詳細內容
        </span>

        <span className="text-xs font-semibold text-[#6B9080] group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </div>
  );
});

const getBookSearchText = (item) => {
  if (item._searchText) return item._searchText;

  const walkChapters = (chapters) => {
    if (!chapters) return '';

    const arr = Array.isArray(chapters)
      ? chapters
      : Object.values(chapters);

    return arr
      .map((ch) => {
        const current = [
          ch.title,
          ch.alias,
          ch.name,
          ch.text,
        ]
          .filter(Boolean)
          .join(' ');

        return `${current} ${walkChapters(ch.children)}`;
      })
      .join(' ');
  };

  return [
    item.name,
    item.bookDetails?.author,
    walkChapters(item.bookDetails?.chapters),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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
    item.acuDetails?.indications,
    item.acuTable?.matchingPoints,
    item.acuTable?.code,
    item.oilDetails?.mindEffect,
    item.oilDetails?.bodyEffect,
    item.oilDetails?.skinEffect,
    item.oilDetails?.usage,
    item.oilDetails?.nature,
    item.oilDetails?.attribute,
    item.pharmacology,
    item.contemporary,
    item.directions,
    item.note,
  ];

  return fields
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [
    debouncedSearchQuery,
    setDebouncedSearchQuery,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('書籍');

  const [activeItem, setActiveItem] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  const [isUsingCache, setIsUsingCache] = useState(false);
  const [dataError, setDataError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    const merged = [
      ...staticData,
      ...dbData,
    ].map((item) => {
      if (item.category !== '書籍') {
        return item;
      }

      return {
        ...item,
        _searchText: getBookSearchText(item),
      };
    });

    const seen = new Set();

    return merged.filter((item) => {
      if (
        !item ||
        !item.name ||
        !item.category
      ) {
        return false;
      }

      const key = `${item.category}__${item.name}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
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
    () => filteredData.slice(0, visibleCount),
    [filteredData, visibleCount]
  );

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
          onBack={() => setIsAdminMode(false)}
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

    return (
      <div className="min-h-screen bg-[#fdfbf7] text-[#3A4F3F]">
        <StatusMessage
          isOnline={isOnline}
          isUsingCache={isUsingCache}
          dataError={dataError}
        />

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button
            onClick={() => setActiveItem(null)}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-sm text-[#7F6D5F] shadow-sm hover:text-[#3A4F3F] hover:shadow-md transition-all"
          >
            ← 返回列表
          </button>
        </div>

        <div className="px-4 pb-12">
          {ModalComponent ? (
            <ModalComponent item={activeItem} />
          ) : (
            <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#E5E0D8] bg-white px-6 py-12 text-center text-[#A39284] shadow-sm">
              找不到此百科的詳細頁面。
            </div>
          )}
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
        onClick={() => setIsAdminMode(true)}
        className="fixed top-3 left-3 z-50 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#A39284] shadow-sm border border-white hover:text-[#3A4F3F] hover:bg-white transition-all"
      >
        開發者專區
      </button>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-xs tracking-[0.28em] text-[#A39284] shadow-sm mb-5">
            東方經絡 × 西方芳療
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#2F4638] mb-4">
            本草與芳香數位百科
          </h1>

          <p className="text-sm md:text-base text-[#8E7B6A] tracking-wide">
            結合東方經絡與西方芳療的健康數位誌
          </p>
        </header>

        <section className="mb-10 rounded-[2rem] border border-white bg-white p-4 md:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B19C8A]">
                ⌕
              </span>

              <input
                type="text"
                placeholder="搜尋名稱、英文、經絡或功效標籤..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                className="w-full rounded-2xl border border-[#E6DDD3] bg-white py-3 pl-8 pr-4 text-sm outline-none ring-0 transition focus:border-[#3A4F3F]/30 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:flex-wrap md:justify-end">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`shrink-0 rounded-full px-4.5 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#2F4638] text-white shadow-md'
                      : 'bg-white text-[#5F6F65] border border-[#E6DDD3] hover:text-[#2F4638]'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                    onClick={() =>
                      setVisibleCount(
                        (count) => count + 20
                      )
                    }
                    className="rounded-full bg-[#2F4638] px-5 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 transition-all"
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