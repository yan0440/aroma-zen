import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import './styles/appearance.css';

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

import {
  loadFirstEntriesPage,
  loadNextEntriesPage,
} from './services/entryService';

import OtherCategoryView from './components/OtherCategoryView';
import DataCard from './components/DataCard';
import Sprig from './components/Sprig';
import AppearanceSettings from './components/AppearanceSettings';
import EntryListItem from './components/EntryListItem';

import {
  EmptyState,
  PageLoading,
  SessionNotice,
  StatusMessage,
} from './components/AppStatus';

import {
  CATEGORIES,
  getCategoryLabel,
  getCategoryTheme,
} from './config/categories';

import {
  OTHER_CATEGORY_VALUES,
  addItemToMap,
  getBookSearchText,
  getCreatedTime,
  getItemIdentity,
  getSearchText,
  normalizeCategory,
} from './utils/entryData';

import { normalizeText } from './utils/text';

import useAppearance from './hooks/useAppearance';
import useAdminAuth from './hooks/useAdminAuth';

const LoginPage = lazy(
  () => import('./components/LoginPage.jsx')
);

const EncyclopediaViewer = lazy(
  () => import('./components/EncyclopediaViewer.jsx')
);

const CardViewer = lazy(
  () => import('./components/CardViewer.jsx')
);

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

const AddEntryPage = lazy(
  () => import('./features/entries/pages/AddEntryPage.jsx')
);

const PAGE_SIZE = 20;

const MODAL_COMPONENTS = {
  精油: OilModal,
  穴道: AcuModal,
  中藥: HerbModal,
  方劑: FormulaModal,
  書籍: BookModal,
  其他: OtherDetailPage,
  名詞材料: OtherDetailPage,
};

export default function App() {
  const {
    appearance,
    resolvedTheme,
    updateAppearance,
  } = useAppearance();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [
    debouncedSearchQuery,
    setDebouncedSearchQuery,
  ] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('書籍');

  const [activeItem, setActiveItem] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminAction, setAdminAction] = useState(null);
  const [sessionNotice, setSessionNotice] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  const [dataError, setDataError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingMore, setIsLoadingMore] =
    useState(false);

  const [hasMore, setHasMore] = useState(false);

  const [lastDocument, setLastDocument] =
    useState(null);

  const handleIdleLogout = useCallback(() => {
    setAdminAction(null);
    setActiveItem(null);
    setIsAdminMode(false);
    setSessionNotice('閒置超過五分鐘，已自動登出。');
  }, []);

  const {
    isAdminAuthenticated,
    authReady,
    logout,
  } = useAdminAuth({ onIdleLogout: handleIdleLogout });

  useEffect(() => {
    if (authReady && !isAdminAuthenticated) {
      setAdminAction((previous) =>
        previous ? null : previous
      );
    }
  }, [authReady, isAdminAuthenticated]);

  useEffect(() => {
    if (!sessionNotice) return undefined;

    const timer = window.setTimeout(() => {
      setSessionNotice('');
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [sessionNotice]);

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
      } catch (error) {
        if (signal?.cancelled) return;

        console.error('Firestore 第一頁讀取錯誤：', error);

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

  const loadMoreEntries = useCallback(async () => {
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
      const result = await loadNextEntriesPage({
        category: selectedCategory,
        pageSize: 200,
        lastDocument,
      });

      const nextEntries =
        result?.entries ||
        result?.data ||
        [];

      setDbData((previous) => {
        const map = new Map();

        [...previous, ...nextEntries].forEach((item) => {
          addItemToMap(map, item, 'firestore');
        });

        return Array.from(map.values());
      });

      setLastDocument(result?.lastDocument || lastDocument);
      setHasMore(Boolean(result?.hasMore));

      setVisibleCount(
        (previous) => previous + PAGE_SIZE
      );
    } catch (error) {
      console.error('Firestore 載入更多資料錯誤：', error);

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

        setDataError('');
        setIsLoading(false);
      },
      (error) => {
        console.error('展示區即時同步失敗：', error);

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
    const online = () => {
      setIsOnline(true);
      setDataError('');
    };

    const offline = () => {
      setIsOnline(false);
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
        const cleanItem = { ...item };
        delete cleanItem._source;

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

      return (
        !q ||
        (item._searchText || '').includes(q)
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

  const categoryCounts = useMemo(() => {
    const counts = {};

    allData.forEach((item) => {
      const key = normalizeCategory(item.category);

      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }, [allData]);

  const canLoadMore =
    visibleCount < filteredData.length ||
    hasMore;

  const handleSelectItem = useCallback((item) => {
    setActiveItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActiveItem(null);
  }, []);

  const handleEnterAdmin = useCallback(() => {
    setIsSettingsOpen(false);
    setIsAdminMode(true);
  }, []);

  const handleLeaveAdmin = useCallback(() => {
    setIsAdminMode(false);
    setAdminAction(null);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setAdminAction(null);
    setActiveItem(null);
    setIsAdminMode(false);
  }, [logout]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveItem(null);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (visibleCount < filteredData.length) {
      setVisibleCount(
        (previous) => previous + PAGE_SIZE
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

  const openAdminAction = useCallback((type, item) => {
    if (type !== 'add' && !item) return;

    setAdminAction({ type, item });
    setActiveItem(null);
    setIsAdminMode(false);
  }, []);

  const handleAdminView = useCallback(
    (item) => openAdminAction('view', item),
    [openAdminAction]
  );

  const handleAdminCard = useCallback(
    (item) => openAdminAction('card', item),
    [openAdminAction]
  );

  const handleAdminEdit = useCallback(
    (item) => openAdminAction('edit', item),
    [openAdminAction]
  );

  const handleAdminAdd = useCallback(
    () => openAdminAction('add'),
    [openAdminAction]
  );

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
      await deleteDoc(doc(db, 'entries', documentId));

      window.alert('資料已成功刪除！');
    } catch (error) {
      console.error('刪除資料失敗：', error);

      window.alert(
        `刪除資料失敗：${
          error?.code ||
          error?.message ||
          '未知錯誤'
        }`
      );
    }
  }, []);

  const returnToAdmin = useCallback(() => {
    setActiveItem(null);
    setAdminAction(null);
    setIsAdminMode(true);
  }, []);

  const renderLoadMoreButton = () => {
    if (!canLoadMore) return null;

    return (
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="appearance-button rounded-full px-7 py-3 text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingMore ? '載入中...' : '載入更多'}
        </button>
      </div>
    );
  };

  if (adminAction?.type === 'view') {
    const viewItem = adminAction.item;

    const viewCategory = normalizeCategory(
      viewItem?.category
    );

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

  if (isAdminMode && !authReady) {
    return <PageLoading />;
  }

  if (isAdminMode && !isAdminAuthenticated) {
    return (
      <Suspense fallback={<PageLoading />}>
        <LoginPage
          onLogin={() => {
            setIsAdminMode(true);
          }}
          onClose={handleLeaveAdmin}
        />
      </Suspense>
    );
  }

  if (isAdminMode) {
    return (
      <Suspense fallback={<PageLoading />}>
        <StatusMessage
          isOnline={isOnline}
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
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  if (activeItem) {
    const activeCategory = normalizeCategory(
      activeItem.category
    );

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
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--app-bg)',
          color: 'var(--app-text)',
        }}
      >
        <StatusMessage
          isOnline={isOnline}
          dataError={dataError}
        />

        <div className="mx-auto max-w-6xl px-4 pt-8">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="appearance-button inline-flex items-center gap-2 px-4 py-2 text-[15px]"
          >
            返回列表
          </button>
        </div>

        <div className="px-4 pb-12">
          <div
            className="mx-auto mt-8 max-w-2xl rounded-3xl border px-6 py-12 text-center text-[16px]"
            style={{
              borderColor: 'var(--app-border)',
              backgroundColor: 'var(--app-surface)',
              color: 'var(--app-muted)',
            }}
          >
            找不到此百科的詳細頁面。
          </div>
        </div>
      </div>
    );
  }

  const trimmedQuery = debouncedSearchQuery.trim();

  const categoryLabel = getCategoryLabel(selectedCategory);

  const selectedTheme = getCategoryTheme(selectedCategory);

  return (
    <div
      className="encyclopedia-home min-h-screen bg-paper font-ui text-ink"
      data-theme={resolvedTheme}
    >
      <AppearanceSettings
        open={isSettingsOpen}
        onClose={closeSettings}
        appearance={appearance}
        onChange={updateAppearance}
      />

      <StatusMessage
        isOnline={isOnline}
        dataError={dataError}
      />

      <SessionNotice message={sessionNotice} />

      <header className="hero-wash relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="hero-pattern pointer-events-none absolute inset-0 -z-10"
        />

        <Sprig
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-0 -z-10 h-[300px] w-[214px] rotate-6 text-[#4c7a3a]/55 md:right-[5%] md:h-[430px] md:w-[307px]"
        />

        <Sprig
          aria-hidden="true"
          className="pointer-events-none absolute right-[24%] top-28 -z-10 hidden h-[250px] w-[179px] -rotate-12 text-[#6c4f95]/45 md:block"
        />

        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex items-center justify-between gap-3 py-5">
            <span className="shrink-0 text-[15px] font-semibold tracking-[0.12em] text-leaf-deep">
              本草百科
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(true);
                }}
                aria-haspopup="dialog"
                aria-expanded={isSettingsOpen}
                aria-controls="appearance-settings"
                className="appearance-button px-3 py-2 text-[13px]"
              >
                設定
              </button>

              <button
                type="button"
                onClick={handleEnterAdmin}
                className="appearance-button px-3 py-2 text-[13px]"
              >
                開發者專區
              </button>
            </div>
          </div>

          <div className="pb-12 pt-14 md:pb-16 md:pt-24">
            <h1 className="text-[40px] font-light leading-[1.22] tracking-[0.06em] text-leaf-deep md:text-[66px]">
              本草與芳香
              <br />
              數位百科
            </h1>

            <p className="mt-6 max-w-sm text-[15px] leading-7 text-ink/60 md:text-[16px]">
              從東方經絡到西方芳療，收錄精油、穴道、中藥與方劑。
            </p>

            <div className="relative mt-10 max-w-xl">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>

              <input
                type="text"
                aria-label="搜尋百科"
                placeholder="搜尋名稱、英文、經絡或功效標籤"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                className="w-full rounded-full bg-white py-4 pl-[52px] pr-12 text-[16px] text-ink shadow-[0_1px_2px_rgba(27,42,34,0.05),0_14px_32px_-18px_rgba(27,42,34,0.2)] outline-none ring-1 ring-line placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-leaf"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="清除搜尋"
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink/45 transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="百科分類"
        className="sticky top-0 z-40 border-y border-line bg-paper/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 md:px-7">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;

            const count =
              categoryCounts[normalizeCategory(category)] || 0;

            const theme = getCategoryTheme(category);

            const activeColor =
              resolvedTheme === 'dark'
                ? '#E0EBD9'
                : theme?.deep || '#405E4C';

            const activeBackground =
              resolvedTheme === 'dark'
                ? '#304A39'
                : theme?.tint || '#EEF2EA';

            const indicatorColor =
              resolvedTheme === 'dark' && isActive
                ? '#B4CFB4'
                : isActive
                  ? theme?.deep || '#405E4C'
                  : theme?.mid || '#9AAE9F';

            return (
              <button
                type="button"
                key={category}
                aria-pressed={isActive}
                onClick={() => {
                  handleCategoryChange(category);
                }}
                style={
                  isActive
                    ? {
                        color: activeColor,
                        backgroundColor: activeBackground,
                      }
                    : undefined
                }
                className={`relative flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-4 text-[15px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-leaf ${
                  isActive
                    ? 'font-semibold'
                    : 'text-ink/55 hover:text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: indicatorColor }}
                />

                {getCategoryLabel(category)}

                {count > 0 && (
                  <span className="text-[11px] font-normal tabular-nums opacity-60">
                    {count}
                  </span>
                )}

                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px]"
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <div className="flex items-baseline justify-between gap-4 pb-6 pt-10 text-[14px]">
          <p
            className="font-medium"
            style={{
              color:
                resolvedTheme === 'dark'
                  ? 'var(--app-accent)'
                  : selectedTheme?.deep || '#405E4C',
            }}
          >
            {trimmedQuery
              ? `在${categoryLabel}中搜尋「${trimmedQuery}」`
              : categoryLabel}
          </p>

          <p className="shrink-0 tabular-nums text-ink/45">
            {isLoading && filteredData.length === 0
              ? '讀取中'
              : `${filteredData.length} 筆`}
          </p>
        </div>

        <main>
          {filteredData.length === 0 ? (
            <EmptyState
              isLoading={isLoading}
              query={trimmedQuery}
            />
          ) : (
            <>
              {appearance.view === 'list' ? (
                <div className="space-y-3">
                  {visibleData.map((item) => (
                    <EntryListItem
                      key={getItemIdentity(item)}
                      item={item}
                      onSelectItem={handleSelectItem}
                    />
                  ))}
                </div>
              ) : selectedCategory === '其他' ? (
                <OtherCategoryView
                  allData={visibleData}
                  onSelectItem={handleSelectItem}
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  {visibleData.map((item) => (
                    <div
                      key={getItemIdentity(item)}
                      className="appearance-card-shell h-full min-w-0"
                    >
                      <DataCard
                        item={item}
                        onSelectItem={handleSelectItem}
                      />
                    </div>
                  ))}
                </div>
              )}

              {renderLoadMoreButton()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}