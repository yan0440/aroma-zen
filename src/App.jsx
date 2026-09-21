import React, { lazy, Suspense, useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { oilData } from './data/oilData.js';
import { acuData } from './data/acuData.js';
import { herbData } from './data/herbData.js';
import { formulaData } from './data/formulaData.js';
import { bookData } from './data/bookData.js';
import { loadFirstEntriesPage, loadNextEntriesPage } from './services/entryService';
import OtherCategoryView from './components/OtherCategoryView';
import DataCard from './components/DataCard';
import { CATEGORIES, MAIN_CATEGORIES, getCategoryLabel } from './config/categories';
import { getDataKey, normalizeText } from './utils/text';

const LoginPage = lazy(
  () => import('./components/LoginPage.jsx')
);
const EncyclopediaViewer = lazy(() => import('./components/EncyclopediaViewer.jsx'));
const CardViewer = lazy(() => import('./components/CardViewer.jsx'));
const OilModal = lazy(() => import('./components/OilModal'));
const AcuModal = lazy(() => import('./components/AcuModal'));
const HerbModal = lazy(() => import('./components/HerbModal'));
const FormulaModal = lazy(() => import('./components/FormulaModal'));
const BookModal = lazy(() => import('./components/BookModal'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const OtherDetailPage = lazy(() => import('./components/OtherDetailPage'));
const AddEntryPage = lazy(() => import('./features/entries/pages/AddEntryPage.jsx'));

const PAGE_SIZE = 20;
const OTHER_CATEGORY_VALUES = ['其他', '名詞材料'];
const BOLD_KEYWORDS = ['肌肉', '神經', '血管'];

const MODAL_COMPONENTS = {
  精油: OilModal,
  穴道: AcuModal,
  中藥: HerbModal,
  方劑: FormulaModal,
  書籍: BookModal,
  其他: OtherDetailPage,
  名詞材料: OtherDetailPage,
};

const normalizeCategory = (category) => {
  const value = String(category || '').trim().normalize('NFKC');
  return value === '名詞材料' ? '其他' : value;
};

const normalizeName = (name) =>
  String(name || '')
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ');

const getItemIdentity = (item) => {
  if (!item) return '';

  const entryKey = normalizeText(item.entryKey || '');

  if (entryKey) {
    return `entryKey:${entryKey}`;
  }

  const category = normalizeCategory(item.category);
  const name = normalizeName(item.name);

  if (category && name) {
    return `category:${category}__name:${normalizeText(name)}`;
  }

  return `document:${String(
    item.documentId || item.firestoreId || item.id || ''
  )}`;
};

const getCreatedTime = (item) => {
  const value = item?.createdAt;

  if (typeof value === 'number') return value;

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (value && typeof value.toDate === 'function') {
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

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

const mergeNonEmpty = (base = {}, incoming = {}) => {
  const result = { ...(base || {}) };

  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && !value.trim())
    ) {
      result[key] = value;
    }
  });

  return result;
};

const mergeArrayValue = (baseValue, incomingValue) => {
  if (Array.isArray(incomingValue)) {
    return incomingValue;
  }

  if (incomingValue && typeof incomingValue === 'object') {
    return Object.keys(incomingValue)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => incomingValue[key]);
  }

  if (Array.isArray(baseValue)) {
    return baseValue;
  }

  if (baseValue && typeof baseValue === 'object') {
    return Object.keys(baseValue)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => baseValue[key]);
  }

  return [];
};

const normalizeItem = (item) => {
  if (!item) return null;

  const category = normalizeCategory(item.category);
  const name = normalizeName(item.name);

  return category && name
    ? {
        ...item,
        name,
        category,
      }
    : null;
};

const mergeItems = (base, incoming) => {
  const b = normalizeItem(base);
  const i = normalizeItem(incoming);

  if (!b) return i;
  if (!i) return b;

  return {
    ...mergeNonEmpty(b, i),
    name: i.name || b.name,
    category: i.category || b.category,
    id: i.id || b.id,
    documentId: i.documentId || b.documentId,
    firestoreId: i.firestoreId || b.firestoreId,
    entryKey: i.entryKey || b.entryKey,
    oilDetails: mergeNonEmpty(b.oilDetails, i.oilDetails),
    acuTable: mergeNonEmpty(b.acuTable, i.acuTable),
    acuDetails: mergeNonEmpty(b.acuDetails, i.acuDetails),
    bookDetails: {
      ...(b.bookDetails || {}),
      ...(i.bookDetails || {}),
      chapters: mergeArrayValue(
        b.bookDetails?.chapters,
        i.bookDetails?.chapters
      ),
    },
    knowledgeDetails: {
      ...(b.knowledgeDetails || {}),
      ...(i.knowledgeDetails || {}),
      sections: mergeArrayValue(
        b.knowledgeDetails?.sections,
        i.knowledgeDetails?.sections
      ),
    },
  };
};

const addItemToMap = (map, item, source) => {
  const normalized = normalizeItem(item);

  if (!normalized) return;

  const key = getItemIdentity(normalized);

  if (!key) return;

  const old = map.get(key);

  map.set(
    key,
    old
      ? mergeItems(old, { ...normalized, _source: source })
      : { ...normalized, _source: source }
  );
};

const collectSearchText = (value) => {
  if (value === undefined || value === null) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(collectSearchText).filter(Boolean).join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map(collectSearchText)
      .filter(Boolean)
      .join(' ');
  }

  return '';
};

const getBookSearchText = (item) =>
  normalizeText(
    [
      item?.name,
      item?.alias,
      item?.bookDetails?.author,
      collectSearchText(item?.bookDetails?.chapters),
    ]
      .filter(Boolean)
      .join(' ')
  );

const getSearchText = (item) =>
  normalizeText(collectSearchText(item));

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] text-[#A39284]">
      正在載入頁面...
    </div>
  );
}

function StatusMessage({ isOnline, isUsingCache, dataError }) {
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

  return null;
}

export default function App() {
  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('書籍');
  const [activeItem, setActiveItem] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
const [adminAction, setAdminAction] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [dataError, setDataError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDocument, setLastDocument] = useState(null);

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

  const loadFirstPage = useCallback(
    async (signal) => {
      setIsLoading(true);
      setDataError('');
      setLastDocument(null);
      setHasMore(false);
      setVisibleCount(PAGE_SIZE);

      try {
        const result = await loadFirstEntriesPage({
          category: selectedCategory,
          pageSize: 200,
        });

        if (signal?.cancelled) return;

        setLastDocument(result?.lastDocument || null);
        setHasMore(Boolean(result?.hasMore));
        setIsUsingCache(false);
      } catch (error) {
        if (signal?.cancelled) return;

        console.error('Firestore 第一頁讀取錯誤：', error);

        setDataError(
          `百科資料讀取失敗：${
            error?.code || error?.message || '未知錯誤'
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

  const loadMoreEntries = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || !lastDocument) {
      return;
    }

    setIsLoadingMore(true);
    setDataError('');

    try {
      const result = await loadNextEntriesPage({
        category: selectedCategory,
        pageSize: 200,
        lastDocument,
      });

      const nextEntries = result?.entries || result?.data || [];

      setDbData((previous) => {
        const map = new Map();

        [...previous, ...nextEntries].forEach((item) => {
          addItemToMap(map, item, 'firestore');
        });

        return Array.from(map.values());
      });

      setLastDocument(result?.lastDocument || lastDocument);
      setHasMore(Boolean(result?.hasMore));
      setVisibleCount((previous) => previous + PAGE_SIZE);
    } catch (error) {
      console.error('Firestore 載入更多資料錯誤：', error);

      setDataError(
        `更多百科資料載入失敗：${
          error?.code || error?.message || '未知錯誤'
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
    const signal = { cancelled: false };

    loadFirstPage(signal);

    return () => {
      signal.cancelled = true;
    };
  }, [loadFirstPage]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'entries'),
      (snapshot) => {
        setDbData(
          snapshot.docs.map((entryDoc) => ({
            ...entryDoc.data(),
            id: entryDoc.id,
            documentId: entryDoc.id,
            firestoreId: entryDoc.id,
          }))
        );

        setIsUsingCache(false);
        setDataError('');
        setIsLoading(false);
      },
      (error) => {
        console.error('展示區即時同步失敗：', error);

        setDataError(
          `展示區資料同步失敗：${
            error?.code || error?.message || '未知錯誤'
          }`
        );

        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      setDataError('');
    };

    const offline = () => {
      setIsOnline(false);
      setIsUsingCache(true);
    };

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchQuery(searchQuery),
      250
    );

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, debouncedSearchQuery]);

  const allData = useMemo(() => {
    const map = new Map();

    staticData.forEach((item) => {
      addItemToMap(map, item, 'static');
    });

    dbData.forEach((item) => {
      addItemToMap(map, item, 'firestore');
    });

    return Array.from(map.values())
      .filter((item) => item && item.name && item.category)
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
        const { _source, ...cleanItem } = item;

        return {
          ...cleanItem,
          _searchText:
            cleanItem.category === '書籍'
              ? getBookSearchText(cleanItem)
              : getSearchText(cleanItem),
        };
      });
  }, [staticData, dbData]);

  const filteredData = useMemo(() => {
    const q = normalizeText(debouncedSearchQuery);

    return allData.filter((item) => {
      if (!item || !item.name) return false;

      const category = normalizeCategory(item.category);

      if (selectedCategory === '其他') {
        if (
          !OTHER_CATEGORY_VALUES.includes(item.category) &&
          category !== '其他'
        ) {
          return false;
        }
      } else if (category !== selectedCategory) {
        return false;
      }

      return !q || (item._searchText || '').includes(q);
    });
  }, [allData, debouncedSearchQuery, selectedCategory]);

  const visibleData = useMemo(
    () => filteredData.slice(0, visibleCount),
    [filteredData, visibleCount]
  );

  const canLoadMore =
    visibleCount < filteredData.length || hasMore;

  const handleSelectItem = useCallback(
    (item) => setActiveItem(item),
    []
  );

  const handleCloseDetail = useCallback(
    () => setActiveItem(null),
    []
  );

  const handleEnterAdmin = useCallback(() => {
  setIsAdminMode(true);
  setIsAdminAuthenticated(false);
}, []);

  const handleLeaveAdmin = useCallback(() => {
  setIsAdminMode(false);
  setIsAdminAuthenticated(false);
  setAdminAction(null);
}, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveItem(null);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (visibleCount < filteredData.length) {
      setVisibleCount((previous) => previous + PAGE_SIZE);
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

  const renderLoadMoreButton = () =>
    !canLoadMore ? null : (
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="rounded-full bg-[#2F4638] px-5 py-2.5 text-[15px] font-medium text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingMore ? '載入中...' : '載入更多'}
        </button>
      </div>
    );

  const handleAdminView = useCallback((item) => {
    if (!item) return;

    setAdminAction({
      type: 'view',
      item,
    });

    setActiveItem(null);
    setIsAdminMode(false);
  }, []);

  const handleAdminCard = useCallback((item) => {
    if (!item) return;

    setAdminAction({
      type: 'card',
      item,
    });

    setActiveItem(null);
    setIsAdminMode(false);
  }, []);

  const handleAdminEdit = useCallback((item) => {
    if (!item) return;

    setAdminAction({
      type: 'edit',
      item,
    });

    setActiveItem(null);
    setIsAdminMode(false);
  }, []);

  const handleAdminDelete = useCallback(async (item) => {
  if (!item) return;

  const documentId =
    item.documentId ||
    item.firestoreId ||
    item.id;

  if (!documentId) {
    window.alert('找不到要刪除的資料 ID。');
    return;
  }

  const confirmed = window.confirm(
    `確定要刪除「${item.name || '未命名'}」嗎？`
  );

  if (!confirmed) return;

  try {
    await deleteDoc(
      doc(db, 'entries', documentId)
    );

    window.alert('✅ 資料已成功刪除！');
  } catch (error) {
    console.error('刪除資料失敗：', error);

    window.alert(
      `刪除資料失敗：${
        error?.code || error?.message || '未知錯誤'
      }`
    );
  }
}, []);

  const handleAdminAdd = useCallback(() => {
    setAdminAction({
      type: 'add',
    });

    setActiveItem(null);
    setIsAdminMode(false);
  }, []);

  const returnToAdmin = useCallback(() => {
    setActiveItem(null);
    setAdminAction(null);
    setIsAdminMode(true);
  }, []);

  if (adminAction?.type === 'view') {
  const viewItem = adminAction.item;
  const viewCategory = normalizeCategory(viewItem?.category);
  const ViewComponent = MODAL_COMPONENTS[viewCategory];

  if (ViewComponent) {
    return (
      <Suspense fallback={<PageLoading />}>
        <ViewComponent
          item={{
            ...viewItem,
            category: viewCategory,
          }}
          onClose={returnToAdmin}
          backLabel="返回後台列表"
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <EncyclopediaViewer
        item={viewItem}
        onClose={returnToAdmin}
        onBack={returnToAdmin}
        closeLabel="返回後台列表"
        backLabel="返回後台列表"
      />
    </Suspense>
  );
}

  if (adminAction?.type === 'card') {
    return (
      <Suspense fallback={<PageLoading />}>
        <CardViewer
          item={adminAction.item}
          onClose={returnToAdmin}
          closeLabel="返回後台列表"
          isAdminPreview
        />
      </Suspense>
    );
  }

  if (adminAction?.type === 'edit') {
    return (
      <Suspense fallback={<PageLoading />}>
        <AddEntryPage
          editingItem={adminAction.item}
          closeLabel="返回開發者專區"
          onClose={returnToAdmin}
          onSaved={returnToAdmin}
        />
      </Suspense>
    );
  }

  if (adminAction?.type === 'add') {
    return (
      <Suspense fallback={<PageLoading />}>
        <AddEntryPage
          closeLabel="返回開發者專區"
          onClose={returnToAdmin}
          onSaved={returnToAdmin}
        />
      </Suspense>
    );
  }

if (isAdminMode && !isAdminAuthenticated) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginPage
        onLogin={() => setIsAdminAuthenticated(true)}
        onClose={() => {
          setIsAdminMode(false);
          setIsAdminAuthenticated(false);
        }}
      />
    </Suspense>
  );
}

  if (isAdminMode) {
    return (
      <Suspense fallback={<PageLoading />}>
        <StatusMessage
          isOnline={isOnline}
          isUsingCache={isUsingCache}
          dataError={dataError}
        />

        <AdminPage
          allData={allData}
          onBack={handleLeaveAdmin}
          onAdd={handleAdminAdd}
          onView={handleAdminView}
          onCard={handleAdminCard}
          onEdit={handleAdminEdit}
          onDelete={handleAdminDelete}
          onLogout={handleLeaveAdmin}
        />
      </Suspense>
    );
  }

  if (activeItem) {
    const activeCategory = normalizeCategory(activeItem.category);
    const ModalComponent = MODAL_COMPONENTS[activeCategory];

    if (ModalComponent) {
      return (
        <Suspense fallback={<PageLoading />}>
          <ModalComponent
  item={{
    ...activeItem,
    category: activeCategory,
  }}
  onClose={handleCloseDetail}
  backLabel="返回列表"
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
            onClick={handleCloseDetail}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] text-[#7F6D5F] shadow-sm transition-all hover:text-[#3A4F3F] hover:shadow-md"
          >
            返回列表
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
                  setSearchQuery(event.target.value)
                }
                className="w-full rounded-2xl border border-[#E6DDD3] bg-white py-3 pl-9 pr-4 text-[15px] outline-none transition focus:border-[#3A4F3F]/30"
              />
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:justify-end md:pb-0">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    handleCategoryChange(category)
                  }
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
            filteredData.length > 0 ? (
              <>
                <OtherCategoryView
                  allData={visibleData}
                  onSelectItem={handleSelectItem}
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
                {visibleData.map((item) => (
                  <DataCard
                    key={getItemIdentity(item)}
                    item={item}
                    onSelectItem={handleSelectItem}
                  />
                ))}
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