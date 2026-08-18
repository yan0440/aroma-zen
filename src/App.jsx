import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';

import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import {
  db,
} from './firebase';

import { oilData } from './data/oilData.js';
import { acuData } from './data/acuData.js';
import { herbData } from './data/herbData.js';
import { formulaData } from './data/formulaData.js';
import { bookData } from './data/bookData.js';


import {
  loadFirstEntriesPage,
  loadNextEntriesPage,
} from './services/entryService';

import OtherCategoryView from './components/OtherCategoryView';
import DataCard from './components/DataCard';
import {
  CATEGORIES,
  MAIN_CATEGORIES,
  getCategoryLabel,
} from './config/categories';

import {
  getDataKey,
  normalizeText,
} from './utils/text';

const OilModal = lazy(
  () => import('./components/OilModal')
);

const AcuModal = lazy(
  () => import('./components/AcuModal')
);

const HerbModal = lazy(
  () => import('./components/HerbModal')
);

const FormulaModal = lazy(
  () => import('./components/FormulaModal')
);

const BookModal = lazy(
  () => import('./components/BookModal')
);

const AdminPage = lazy(
  () => import('./pages/AdminPage.jsx')
);

const OtherDetailPage = lazy(
  () => import('./components/OtherDetailPage')
);

const PAGE_SIZE = 20;

const OTHER_CATEGORY_VALUES = [
  '其他',
  '名詞材料',
];

const BOLD_KEYWORDS = [
  '肌肉',
  '神經',
  '血管',
];

const MODAL_COMPONENTS = {
  精油: OilModal,
  穴道: AcuModal,
  中藥: HerbModal,
  方劑: FormulaModal,
  書籍: BookModal,
  其他: OtherDetailPage,
  名詞材料: OtherDetailPage,
};

const normalizeCategory = (
  category
) => {
  const value = String(
    category || ''
  )
    .trim()
    .normalize('NFKC');

  if (value === '名詞材料') {
    return '其他';
  }

  return value;
};

const normalizeName = (name) => {
  return String(name || '')
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ');
};

const getItemIdentity = (item) => {
  if (!item) {
    return '';
  }

  const entryKey = normalizeText(
    item.entryKey || ''
  );

  if (entryKey) {
    return `entryKey:${entryKey}`;
  }

  const category =
    normalizeCategory(
      item.category
    );

  const name = normalizeName(
    item.name
  );

  if (category && name) {
    return `category:${category}__name:${normalizeText(
      name
    )}`;
  }

  const documentId =
    item.documentId ||
    item.firestoreId ||
    item.id ||
    '';

  return `document:${String(
    documentId
  )}`;
};

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

  if (
    value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    const numericValue =
      Number(value);

    if (
      Number.isFinite(numericValue)
    ) {
      return numericValue;
    }
  }

  return 0;
};

const mergeNonEmpty = (
  base = {},
  incoming = {}
) => {
  const result = {
    ...(base || {}),
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

const mergeArrayValue = (
  baseValue,
  incomingValue
) => {
  if (Array.isArray(incomingValue)) {
    return incomingValue;
  }

  if (
    incomingValue &&
    typeof incomingValue === 'object'
  ) {
    return Object.keys(incomingValue)
      .sort(
        (a, b) =>
          Number(a) - Number(b)
      )
      .map((key) => incomingValue[key]);
  }

  if (Array.isArray(baseValue)) {
    return baseValue;
  }

  if (
    baseValue &&
    typeof baseValue === 'object'
  ) {
    return Object.keys(baseValue)
      .sort(
        (a, b) =>
          Number(a) - Number(b)
      )
      .map((key) => baseValue[key]);
  }

  return [];
};

const normalizeItem = (item) => {
  if (!item) {
    return null;
  }

  const category =
    normalizeCategory(
      item.category
    );

  const name = normalizeName(
    item.name
  );

  if (!category || !name) {
    return null;
  }

  return {
    ...item,
    name,
    category,
  };
};

const mergeItems = (
  base,
  incoming
) => {
  const normalizedBase =
    normalizeItem(base);

  const normalizedIncoming =
    normalizeItem(incoming);

  if (!normalizedBase) {
    return normalizedIncoming;
  }

  if (!normalizedIncoming) {
    return normalizedBase;
  }

  const mergedItem = {
    ...mergeNonEmpty(
      normalizedBase,
      normalizedIncoming
    ),

    name:
      normalizedIncoming.name ||
      normalizedBase.name,

    category:
      normalizedIncoming.category ||
      normalizedBase.category,

    id:
      normalizedIncoming.id ||
      normalizedBase.id,

    documentId:
      normalizedIncoming.documentId ||
      normalizedBase.documentId,

    firestoreId:
      normalizedIncoming.firestoreId ||
      normalizedBase.firestoreId,

    entryKey:
      normalizedIncoming.entryKey ||
      normalizedBase.entryKey,

    oilDetails: mergeNonEmpty(
      normalizedBase.oilDetails,
      normalizedIncoming.oilDetails
    ),

    acuTable: mergeNonEmpty(
      normalizedBase.acuTable,
      normalizedIncoming.acuTable
    ),

    acuDetails: mergeNonEmpty(
      normalizedBase.acuDetails,
      normalizedIncoming.acuDetails
    ),

    bookDetails: {
      ...(normalizedBase.bookDetails ||
        {}),
      ...(normalizedIncoming.bookDetails ||
        {}),

      chapters:
        mergeArrayValue(
          normalizedBase.bookDetails
            ?.chapters,
          normalizedIncoming.bookDetails
            ?.chapters
        ),
    },

    knowledgeDetails: {
      ...(normalizedBase.knowledgeDetails ||
        {}),
      ...(normalizedIncoming.knowledgeDetails ||
        {}),

      sections:
        mergeArrayValue(
          normalizedBase.knowledgeDetails
            ?.sections,
          normalizedIncoming.knowledgeDetails
            ?.sections
        ),
    },
  };

  return mergedItem;
};

const addItemToMap = (
  itemMap,
  item,
  source
) => {
  const normalizedItem =
    normalizeItem(item);

  if (!normalizedItem) {
    return;
  }

  const key =
    getItemIdentity(
      normalizedItem
    );

  if (!key) {
    return;
  }

  const existingItem =
    itemMap.get(key);

  const nextItem = existingItem
    ? mergeItems(
        existingItem,
        {
          ...normalizedItem,
          _source: source,
        }
      )
    : {
        ...normalizedItem,
        _source: source,
      };

  itemMap.set(key, nextItem);
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

const parseBoldSyntax = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return value.split('\n').map(
    (line, lineIndex) => (
      <span
        key={`line-${lineIndex}`}
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
                  key={`part-${index}`}
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
                  key={`part-${index}`}
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
                  key={`part-${index}`}
                  className="font-bold text-[#2F4638]"
                >
                  {part}
                </strong>
              );
            }

            if (
              /^[【《\(].*[】》\)]$/.test(
                part
              )
            ) {
              return (
                <span
                  key={`part-${index}`}
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

const getBookSearchText = (item) => {
  const walkChapters = (
    chapters
  ) => {
    if (!chapters) {
      return '';
    }

    const chapterArray =
      Array.isArray(chapters)
        ? chapters
        : Object.values(chapters);

    return chapterArray
      .map((chapter) => {
        const current = [
          chapter?.title,
          chapter?.alias,
          chapter?.name,
          chapter?.text,
          chapter?.content,
          chapter?.description,
        ]
          .filter(Boolean)
          .join(' ');

        return `${current} ${walkChapters(
          chapter?.children
        )}`;
      })
      .join(' ');
  };

  return normalizeText(
    [
      item?.name,
      item?.alias,
      item?.bookDetails?.author,
      walkChapters(
        item?.bookDetails?.chapters
      ),
    ]
      .filter(Boolean)
      .join(' ')
  );
};

const getSearchText = (item) => {
  const fields = [
    item?.name,
    item?.alias,
    item?.englishName,
    item?.type,
    item?.latin,
    item?.tag,
    item?.source,
    item?.typePart,
    item?.method,
    item?.property,
    item?.noteAnalogy,
    item?.planet,
    item?.origin,
    item?.constitutionTag,
    item?.chemicalTag,
    item?.description,
    item?.effect,
    item?.indications,
    item?.literature,
    item?.contraindication,
    item?.nature,
    item?.family,
    item?.meridian,
    item?.traits,
    item?.dosage,
    item?.pharmacology,
    item?.contemporary,
    item?.medicine,
    item?.preparation,
    item?.directions,
    item?.analysis,
    item?.discussion,
    item?.syndrome,
    item?.modifications,
    item?.modernApp,
    item?.modernPharmacology,
    item?.prescription,
    item?.note,
    item?.usage,
    item?.caution,
    item?.acuTable?.code,
    item?.acuTable?.meridian,
    item?.acuTable?.alias,
    item?.acuDetails?.location,
    item?.acuDetails?.operation,
    item?.acuDetails?.indications,
    item?.acuDetails?.type,
    item?.acuDetails?.nameExpl,
    item?.acuDetails?.anatomy,
    item?.acuDetails?.effectAncient,
    item?.acuDetails?.effectModern,
    item?.acuDetails?.matchingPoints,
    item?.oilDetails?.scent,
    item?.oilDetails?.appearance,
    item?.oilDetails?.historyMyth,
    item?.oilDetails?.chemistry,
    item?.oilDetails?.attribute,
    item?.oilDetails?.caution,
    item?.oilDetails?.mindEffect,
    item?.oilDetails?.bodyEffect,
    item?.oilDetails?.skinEffect,
    item?.oilDetails?.constitution,
    item?.oilDetails?.blendingOils,
    item?.oilDetails?.formulas,
    item?.oilDetails?.carrierOils,
    item?.oilDetails?.usage,
    item?.knowledgeDetails?.introduction,
    item?.knowledgeDetails?.sections,
    item?.bookDetails?.author,
    item?.bookDetails?.chapters,
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

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] text-[#A39284]">
      正在載入頁面...
    </div>
  );
}

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
  const [dbData, setDbData] =
    useState([]);

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
    useState(PAGE_SIZE);

  const [isOnline, setIsOnline] =
    useState(
      typeof navigator !== 'undefined'
        ? navigator.onLine
        : true
    );

  const [
    isUsingCache,
    setIsUsingCache,
  ] = useState(false);

  const [dataError, setDataError] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [hasMore, setHasMore] =
    useState(false);

  const [lastDocument, setLastDocument] =
    useState(null);

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

  const loadFirstPage =
  useCallback(
    async (signal) => {
      setIsLoading(true);
      setDataError('');
      setLastDocument(null);
      setHasMore(false);
      setVisibleCount(PAGE_SIZE);

      try {
        const result =
          await loadFirstEntriesPage({
            category: selectedCategory,
            pageSize: 200,
          });

        if (signal?.cancelled) {
          return;
        }

        setLastDocument(
          result?.lastDocument || null
        );

        setHasMore(
          Boolean(result?.hasMore)
        );

        setIsUsingCache(false);
      } catch (error) {
        if (signal?.cancelled) {
          return;
        }

        console.error(
          'Firestore 第一頁讀取錯誤：',
          error
        );

        setDataError(
          `百科資料讀取失敗：${
            error?.code ||
            error?.message ||
            '未知錯誤'
          }`
        );

        setLastDocument(null);
        setHasMore(false);
      } finally {
        if (!signal?.cancelled) {
          setIsLoading(false);
        }
      }
    },
    [selectedCategory]
  );
  
  const loadMoreEntries =
    useCallback(async () => {
      if (
        isLoading ||
        isLoadingMore ||
        !hasMore ||
        !lastDocument
      ) {
        return;
      }

      setIsLoadingMore(true);
      setDataError('');

      try {
        const result =
          await loadNextEntriesPage({
            category: selectedCategory,
            pageSize: 200,
            lastDocument,
          });

        const nextEntries =

        setDbData((previous) => {
          const itemMap = new Map();

          [
            ...previous,
            ...nextEntries,
          ].forEach((item) => {
            addItemToMap(
              itemMap,
              item,
              'firestore'
            );
          });

          return Array.from(
            itemMap.values()
          );
        });

        setLastDocument(
          result?.lastDocument ||
            lastDocument
        );

        setHasMore(
          Boolean(result?.hasMore)
        );

        setVisibleCount(
          (previous) =>
            previous + PAGE_SIZE
        );
      } catch (error) {
        console.error(
          'Firestore 載入更多資料錯誤：',
          error
        );

        setDataError(
          `更多百科資料載入失敗：${
            error?.code ||
            error?.message ||
            '未知錯誤'
          }`
        );
      } finally {
        setIsLoadingMore(false);
      }
    }, [
      hasMore,
      isLoading,
      isLoadingMore,
      lastDocument,
      selectedCategory,
    ]);

  useEffect(() => {
    const signal = {
      cancelled: false,
    };

    loadFirstPage(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadFirstPage]);

  useEffect(() => {
  const entriesRef = collection(
    db,
    'entries'
  );

  const unsubscribe = onSnapshot(
    entriesRef,
    (snapshot) => {
      const nextEntries =
        snapshot.docs.map(
          (entryDoc) => ({
            ...entryDoc.data(),
            id: entryDoc.id,
            documentId: entryDoc.id,
            firestoreId: entryDoc.id,
          })
        );

      setDbData(nextEntries);

      setIsUsingCache(
        snapshot.metadata.fromCache
      );

      setDataError('');
      setIsLoading(false);
    },
    (error) => {
      console.error(
        '展示區即時同步失敗：',
        error
      );

      setDataError(
        `展示區資料同步失敗：${
          error?.code ||
          error?.message ||
          '未知錯誤'
        }`
      );

      setIsLoading(false);
    }
  );

  return unsubscribe;
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
    const itemMap = new Map();

    staticData.forEach((item) => {
      addItemToMap(
        itemMap,
        item,
        'static'
      );
    });

    dbData.forEach((item) => {
      addItemToMap(
        itemMap,
        item,
        'firestore'
      );
    });

    return Array.from(
      itemMap.values()
    )
      .filter(
        (item) =>
          item &&
          item.name &&
          item.category
      )
      .sort((a, b) => {
        const timeA =
          getCreatedTime(a);

        const timeB =
          getCreatedTime(b);

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return String(
          a.name
        ).localeCompare(
          String(b.name),
          'zh-Hant'
        );
      })
      .map((item) => {
        const {
          _source,
          ...cleanItem
        } = item;

        if (
          cleanItem.category === '書籍'
        ) {
          return {
            ...cleanItem,
            _searchText:
              getBookSearchText(
                cleanItem
              ),
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
    const normalizedQuery =
      normalizeText(
        debouncedSearchQuery
      );

    return allData.filter((item) => {
      if (!item || !item.name) {
        return false;
      }

      const itemCategory =
        normalizeCategory(
          item.category
        );

      if (
        selectedCategory === '其他'
      ) {
        if (
          !OTHER_CATEGORY_VALUES.includes(
            item.category
          ) &&
          itemCategory !== '其他'
        ) {
          return false;
        }
      } else if (
        itemCategory !==
        selectedCategory
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

  const canLoadMore =
    visibleCount <
      filteredData.length ||
    hasMore;

  const handleSelectItem =
    useCallback((item) => {
      setActiveItem(item);
    }, []);

  const handleCloseDetail =
    useCallback(() => {
      setActiveItem(null);
    }, []);

  const handleEnterAdmin =
    useCallback(() => {
      setIsAdminMode(true);
    }, []);

  const handleLeaveAdmin =
    useCallback(() => {
      setIsAdminMode(false);
    }, []);

  const handleCategoryChange =
    useCallback((category) => {
      setSelectedCategory(category);
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setActiveItem(null);
      setVisibleCount(PAGE_SIZE);
    }, []);

  const handleLoadMore =
    useCallback(async () => {
      if (
        visibleCount <
        filteredData.length
      ) {
        setVisibleCount(
          (previous) =>
            previous + PAGE_SIZE
        );

        return;
      }

      if (hasMore && lastDocument) {
        await loadMoreEntries();
      }
    }, [
      filteredData.length,
      hasMore,
      lastDocument,
      loadMoreEntries,
      visibleCount,
    ]);

  const renderLoadMoreButton =
    () => {
      if (!canLoadMore) {
        return null;
      }

      return (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-full bg-[#2F4638] px-5 py-2.5 text-[15px] font-medium text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore
              ? '載入中...'
              : '載入更多'}
          </button>
        </div>
      );
    };

  if (isAdminMode) {
    return (
      <Suspense
        fallback={<PageLoading />}
      >
        <StatusMessage
          isOnline={isOnline}
          isUsingCache={isUsingCache}
          dataError={dataError}
        />

        <AdminPage
          allData={allData}
          onBack={handleLeaveAdmin}
        />
      </Suspense>
    );
  }

  if (activeItem) {
    const activeCategory =
      normalizeCategory(
        activeItem.category
      );

    const ModalComponent =
      MODAL_COMPONENTS[
        activeCategory
      ];

    if (ModalComponent) {
      return (
        <Suspense
          fallback={<PageLoading />}
        >
          <ModalComponent
            item={{
              ...activeItem,
              category:
                activeCategory,
            }}
            onClose={
              handleCloseDetail
            }
          />
        </Suspense>
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
            onClick={
              handleCloseDetail
            }
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
        onClick={handleEnterAdmin}
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
                placeholder="搜尋名稱、英文、經絡或功效標籤"
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
              {CATEGORIES.map(
                (category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() =>
                      handleCategoryChange(
                        category
                      )
                    }
                    className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                      selectedCategory ===
                      category
                        ? 'bg-[#2F4638] text-white shadow-md'
                        : 'border border-[#E6DDD3] bg-white text-[#5F6F65] hover:text-[#2F4638]'
                    }`}
                  >
                    {getCategoryLabel(
                      category
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        <main>
          {selectedCategory ===
          '其他' ? (
            filteredData.length > 0 ? (
              <>
                <OtherCategoryView
                  allData={visibleData}
                  onSelectItem={
                    handleSelectItem
                  }
                />

                {renderLoadMoreButton()}
              </>
            ) : (
              <div className="rounded-3xl border border-[#E5E0D8] bg-white px-6 py-16 text-center text-[16px] text-[#A39284] shadow-sm">
                {isLoading
                  ? '正在讀取資料...'
                  : '目前沒有符合條件的資料。'}
              </div>
            )
          ) : filteredData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                {visibleData.map((item) => {
                  const itemKey =
                    getItemIdentity(
                      item
                    );

                  return (
                    <DataCard
                      key={itemKey}
                      item={item}
                      onSelectItem={
                        handleSelectItem
                      }
                    />
                  );
                })}
              </div>

              {renderLoadMoreButton()}
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