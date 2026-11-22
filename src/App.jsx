import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import './styles/appearance.css';

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { AppUpdateSettings } from './components/AppUpdates';

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

import {
  CATEGORIES,
  getCategoryLabel,
  getCategoryTheme,
} from './config/categories';

import { normalizeText } from './utils/text';

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

const OTHER_CATEGORY_VALUES = ['其他', '名詞材料'];

const APPEARANCE_KEY = 'herbal-encyclopedia-appearance';

const DEFAULT_APPEARANCE = {
  theme: 'system',
  view: 'grid',
};

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
  const value = String(category || '')
    .trim()
    .normalize('NFKC');

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
    item.documentId ||
      item.firestoreId ||
      item.id ||
      ''
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

    oilDetails: mergeNonEmpty(
      b.oilDetails,
      i.oilDetails
    ),

    acuTable: mergeNonEmpty(
      b.acuTable,
      i.acuTable
    ),

    acuDetails: mergeNonEmpty(
      b.acuDetails,
      i.acuDetails
    ),

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
      ? mergeItems(old, {
          ...normalized,
          _source: source,
        })
      : {
          ...normalized,
          _source: source,
        }
  );
};

const collectSearchText = (value) => {
  if (value === undefined || value === null) return '';

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(collectSearchText)
      .filter(Boolean)
      .join(' ');
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

const asText = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(asText)
      .filter(Boolean)
      .join('、');
  }

  return typeof value === 'string' ||
    typeof value === 'number'
    ? String(value).trim()
    : '';
};

function readAppearance() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_APPEARANCE };
  }

  try {
    const saved = JSON.parse(
      window.localStorage.getItem(APPEARANCE_KEY) || '{}'
    );

    return {
      theme: ['light', 'dark', 'system'].includes(saved?.theme)
        ? saved.theme
        : DEFAULT_APPEARANCE.theme,

      view: ['grid', 'list'].includes(saved?.view)
        ? saved.view
        : DEFAULT_APPEARANCE.view,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

function useAppearance() {
  const [appearance, setAppearance] = useState(readAppearance);

  const [systemDark, setSystemDark] = useState(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const handleChange = (event) => {
      setSystemDark(event.matches);
    };

    setSystemDark(media.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);

      return () => {
        media.removeEventListener('change', handleChange);
      };
    }

    media.addListener(handleChange);

    return () => {
      media.removeListener(handleChange);
    };
  }, []);

  const resolvedTheme =
    appearance.theme === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : appearance.theme;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        APPEARANCE_KEY,
        JSON.stringify(appearance)
      );
    } catch {
      // 無法儲存時，仍保留本次使用期間的設定。
    }
  }, [appearance]);

  useEffect(() => {
    document.documentElement.dataset.appTheme = resolvedTheme;
  }, [resolvedTheme]);

  const updateAppearance = useCallback((key, value) => {
    const allowedValues = {
      theme: ['light', 'dark', 'system'],
      view: ['grid', 'list'],
    };

    if (!allowedValues[key]?.includes(value)) {
      return;
    }

    setAppearance((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  return {
    appearance,
    resolvedTheme,
    updateAppearance,
  };
}

function PageLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: 'var(--app-bg, #fdfbf7)',
        color: 'var(--app-muted, #657565)',
      }}
    >
      正在載入頁面...
    </div>
  );
}

function StatusMessage({ isOnline, dataError }) {
  if (dataError) {
    return (
      <div
        role="alert"
        className="fixed left-1/2 top-4 z-[300] w-[92%] max-w-xl -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-center text-[15px] text-white shadow-lg"
      >
        {dataError}
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        role="status"
        className="fixed bottom-4 left-1/2 z-[300] w-max max-w-[92%] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-center text-[15px] text-white shadow-lg"
      >
        目前離線，正在使用已儲存的百科資料
      </div>
    );
  }

  return null;
}

function EmptyState({ isLoading, query }) {
  let message = '這個分類還沒有資料。';

  if (isLoading) {
    message = '正在讀取資料...';
  } else if (query) {
    message =
      `找不到符合「${query}」的資料。` +
      '試試更短的關鍵字，或換一個分類。';
  }

  return (
    <div
      className="rounded-[22px] px-6 py-20 text-center text-[16px] leading-7"
      style={{
        backgroundColor: 'var(--app-surface)',
        color: 'var(--app-muted)',
      }}
    >
      {message}
    </div>
  );
}

function AppearanceSettings({
  open,
  onClose,
  appearance,
  onChange,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const groups = [
    {
      key: 'theme',
      title: '外觀模式',
      options: [
        { value: 'light', label: '白天' },
        { value: 'dark', label: '夜晚' },
        { value: 'system', label: '跟隨系統' },
      ],
    },
    {
      key: 'view',
      title: '顯示方式',
      options: [
        { value: 'grid', label: '圖卡' },
        { value: 'list', label: '列表' },
      ],
    },
  ];

  return (
    <dialog
      ref={dialogRef}
      id="appearance-settings"
      className="appearance-dialog"
      aria-labelledby="appearance-settings-title"
      aria-describedby="appearance-settings-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;

        const bounds =
          event.currentTarget.getBoundingClientRect();

        const outside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;

        if (outside) {
          onClose();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="appearance-settings-title"
            className="text-xl font-semibold"
          >
            設定
          </h2>

          <p
            id="appearance-settings-description"
            className="appearance-muted mt-2 text-sm leading-6"
          >
            變更會立即套用，並記住於此瀏覽器。
          </p>
        </div>

        <button
          type="button"
          className="appearance-button shrink-0 px-3 py-2 text-sm"
          onClick={onClose}
          autoFocus
        >
          關閉
        </button>
      </div>

      <div className="mt-7 space-y-7">
        {groups.map((group) => (
          <fieldset key={group.key}>
            <legend className="mb-3 text-sm font-medium">
              {group.title}
            </legend>

            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="appearance-choice"
                >
                  <input
                    type="radio"
                    name={`appearance-${group.key}`}
                    value={option.value}
                    checked={
                      appearance[group.key] === option.value
                    }
                    onChange={() => {
                      onChange(group.key, option.value);
                    }}
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
            <AppUpdateSettings />
    </dialog>
  );
}

function EntryListItem({ item, onSelectItem }) {
  const code = asText(item.acuTable?.code);

  const englishName = [
    item.englishName,
    item.english,
    item['英文名'],
    item['英文名稱'],
    item.latin,
  ]
    .map(asText)
    .find(Boolean);

  const description = [
    item.indications,
    item.effect,
    item['主治'],
    item['主治功效'],
    item['功效'],
    item.alias,
    item.meridian,
    item.acuTable?.meridian,
  ]
    .map(asText)
    .find(Boolean);

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      aria-label={`查看${item.name || '未命名'}的詳細內容`}
      className="appearance-entry-row"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="appearance-entry-tag">
            {getCategoryLabel(item.category)}
          </span>

          {code && (
            <span className="appearance-entry-code">
              <span className="sr-only">
                國際代碼：
              </span>
              {code}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="break-words text-lg font-semibold">
            {item.name || '未命名'}
          </h3>

          {englishName && (
            <span className="appearance-muted break-words text-sm italic">
              {englishName}
            </span>
          )}
        </div>

        {description && (
          <p className="appearance-muted mt-2 line-clamp-2 break-words text-sm leading-6">
            {description}
          </p>
        )}
      </div>

      <span
        aria-hidden="true"
        className="appearance-muted shrink-0 text-xl"
      >
        →
      </span>
    </button>
  );
}

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

  const [
    isAdminAuthenticated,
    setIsAdminAuthenticated,
  ] = useState(false);

  const [adminAction, setAdminAction] = useState(null);
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

        setLastDocument(
          result?.lastDocument || null
        );

        setHasMore(Boolean(result?.hasMore));
      } catch (error) {
        if (signal?.cancelled) return;

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

      setLastDocument(
        result?.lastDocument || lastDocument
      );

      setHasMore(Boolean(result?.hasMore));

      setVisibleCount(
        (previous) => previous + PAGE_SIZE
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
  }, [
    selectedCategory,
    debouncedSearchQuery,
  ]);

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
          {isLoadingMore
            ? '載入中...'
            : '載入更多'}
        </button>
      </div>
    );
  };

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

    const viewCategory = normalizeCategory(
      viewItem?.category
    );

    const ViewComponent =
      MODAL_COMPONENTS[viewCategory];

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
          onLogin={() => {
            setIsAdminAuthenticated(true);
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
          onLogout={handleLeaveAdmin}
        />
      </Suspense>
    );
  }

  if (activeItem) {
    const activeCategory = normalizeCategory(
      activeItem.category
    );

    const ModalComponent =
      MODAL_COMPONENTS[activeCategory];

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

  const categoryLabel =
    getCategoryLabel(selectedCategory);

  const selectedTheme =
    getCategoryTheme(selectedCategory);

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
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />
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
            const isActive =
              selectedCategory === category;

            const count =
              categoryCounts[
                normalizeCategory(category)
              ] || 0;

            const theme =
              getCategoryTheme(category);

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
                  style={{
                    backgroundColor: indicatorColor,
                  }}
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
                    style={{
                      backgroundColor: indicatorColor,
                    }}
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