import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import DataCard from '../components/DataCard';

const NAV_ITEMS = [
  { key: 'all', label: '全部' },
  { key: '書籍', label: '書籍' },
  { key: '精油', label: '精油' },
  { key: '穴道', label: '穴道' },
  { key: '中藥', label: '中藥' },
  { key: '方劑', label: '方劑' },
  { key: '其他', label: '名詞材料' },
];

const STAT_ITEMS = [
  { key: 'total', label: '全部資料' },
  { key: 'books', label: '書籍' },
  { key: 'oils', label: '精油' },
  { key: 'points', label: '穴道' },
  { key: 'herbs', label: '中藥' },
  { key: 'formulas', label: '方劑' },
];

const ADMIN_STYLES = `
  .admin-page {
    --admin-bg: var(--app-bg, #fdfbf7);
    --admin-surface: var(--app-surface, #fffdf8);
    --admin-soft: var(--app-surface-soft, #f0f3eb);
    --admin-input: var(--app-input, #ffffff);
    --admin-text: var(--app-text, #283c32);
    --admin-muted: var(--app-muted, #657565);
    --admin-border: var(--app-border, #dce2d7);
    --admin-accent: var(--app-accent, #405e4c);
    --admin-selected: var(--app-selected, #e3ebdf);
    --admin-selected-text: var(--app-selected-text, #2f4c3b);

    --admin-primary-bg: #405e4c;
    --admin-primary-text: #fffdf8;
    --admin-danger-bg: #fbefec;
    --admin-danger-text: #9c544b;
    --admin-danger-border: #e7c6bf;

    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    background: var(--admin-bg);
    color: var(--admin-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .admin-page {
    --admin-primary-bg: #b4cfb4;
    --admin-primary-text: #17291e;
    --admin-danger-bg: #402b2b;
    --admin-danger-text: #edb6ac;
    --admin-danger-border: #6b4541;

    color-scheme: dark;
  }

  .admin-page .admin-header {
    border-color: var(--admin-border);
    background: var(--admin-soft);
  }

  .admin-page .admin-brand-mark {
    background: var(--admin-primary-bg);
    color: var(--admin-primary-text);
  }

  .admin-page .admin-muted {
    color: var(--admin-muted);
  }

  .admin-page .admin-accent {
    color: var(--admin-accent);
  }

  .admin-page .admin-dashboard {
    border: 1px solid var(--admin-border);
    background:
      radial-gradient(
        ellipse at 95% 5%,
        rgb(107 144 128 / 12%),
        transparent 60%
      ),
      var(--admin-soft);
  }

  .admin-page .admin-dashboard-label {
    background: var(--admin-surface);
    color: var(--admin-accent);
  }

  .admin-page .admin-stat-card {
    min-width: 0;
    border: 1px solid var(--admin-border);
    background: var(--admin-surface);
  }

  .admin-page .admin-stat-number {
    color: var(--admin-text);
    font-variant-numeric: tabular-nums;
  }

  .admin-page .admin-toolbar {
    border: 1px solid var(--admin-border);
    background: var(--admin-surface);
  }

  .admin-page .admin-search {
    width: 100%;
    border: 1px solid var(--admin-border);
    border-radius: 12px;
    background: var(--admin-input);
    color: var(--admin-text);
    padding: 12px 16px 12px 44px;
    font-size: 14px;
    outline: none;
  }

  .admin-page .admin-search::placeholder {
    color: var(--admin-muted);
    opacity: 0.85;
  }

  .admin-page .admin-search:focus-visible {
    border-color: var(--admin-accent);
    outline: 2px solid var(--admin-accent);
    outline-offset: 2px;
  }

  .admin-page .admin-button {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid var(--admin-border);
    border-radius: 12px;
    padding: 8px 14px;
    background: var(--admin-surface);
    color: var(--admin-text);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .admin-page .admin-button:hover {
    border-color: var(--admin-accent);
    background: var(--admin-soft);
  }

  .admin-page .admin-button:focus-visible {
    outline: 2px solid var(--admin-accent);
    outline-offset: 3px;
  }

  .admin-page .admin-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .admin-page .admin-button-primary,
  .admin-page .admin-button-primary:hover {
    border-color: var(--admin-primary-bg);
    background: var(--admin-primary-bg);
    color: var(--admin-primary-text);
  }

  .admin-page .admin-button-primary:hover {
    box-shadow: 0 0 0 3px rgb(107 144 128 / 18%);
  }

  .admin-page .admin-button-selected,
  .admin-page .admin-button-selected:hover {
    border-color: var(--admin-accent);
    background: var(--admin-selected);
    color: var(--admin-selected-text);
  }

  .admin-page .admin-button-edit {
    border-color: transparent;
    background: var(--admin-selected);
    color: var(--admin-selected-text);
  }

  .admin-page .admin-button-edit:hover {
    border-color: var(--admin-accent);
    background: var(--admin-selected);
  }

  .admin-page .admin-button-danger {
    border-color: var(--admin-danger-border);
    background: var(--admin-danger-bg);
    color: var(--admin-danger-text);
  }

  .admin-page .admin-button-danger:hover {
    border-color: var(--admin-danger-text);
    background: var(--admin-danger-bg);
  }

  .admin-page .admin-view-controls {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
  }

  .admin-page .admin-entry {
    min-width: 0;
    border: 1px solid var(--admin-border);
    border-radius: 18px;
    background: var(--admin-surface);
    padding: 20px;
    box-shadow: 0 6px 20px rgb(20 33 28 / 3%);
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .admin-page .admin-entry:hover {
    border-color: var(--admin-accent);
    box-shadow: 0 12px 28px -20px rgb(20 33 28 / 35%);
  }

  .admin-page .admin-entry-inner {
    display: flex;
    height: 100%;
    flex-direction: column;
    gap: 16px;
  }

  .admin-page .admin-entry-actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  .admin-page .admin-card-actions {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;
  }

  .admin-page .admin-card-actions .admin-button {
    min-height: 34px;
    flex: 1 1 auto;
    padding: 6px 10px;
    font-size: 13px;
  }

  .admin-page .admin-category {
    display: inline-flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 3px 9px;
    background: var(--admin-soft);
    color: var(--admin-muted);
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
  }

  .admin-page .admin-category[data-category='精油'] {
    background: #eaf2ed;
    color: #466a56;
  }

  .admin-page .admin-category[data-category='穴道'] {
    background: #f2ede3;
    color: #7e643f;
  }

  .admin-page .admin-category[data-category='中藥'] {
    background: #f3e9e4;
    color: #805747;
  }

  .admin-page .admin-category[data-category='方劑'] {
    background: #eaeaf2;
    color: #5d5d82;
  }

  .admin-page .admin-category[data-category='書籍'] {
    background: #e8eef4;
    color: #4c6781;
  }

  .admin-page .admin-category[data-category='其他'] {
    background: #f0e9f1;
    color: #765c7d;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='精油'] {
    background: #2e4637;
    color: #c3d9bb;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='穴道'] {
    background: #454032;
    color: #dfd1aa;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='中藥'] {
    background: #48372f;
    color: #e2c3b2;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='方劑'] {
    background: #39394b;
    color: #cecae6;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='書籍'] {
    background: #2d404b;
    color: #bdd2e1;
  }

  :root[data-app-theme='dark']
    .admin-page .admin-category[data-category='其他'] {
    background: #443548;
    color: #dcc4df;
  }

  .admin-page .admin-empty {
    border: 1px dashed var(--admin-border);
    background: var(--admin-surface);
    color: var(--admin-muted);
  }

  .admin-page .admin-toast {
    border: 1px solid var(--admin-accent);
    background: var(--admin-primary-bg);
    color: var(--admin-primary-text);
  }

  @media (min-width: 1024px) {
    .admin-page .admin-list .admin-entry-inner {
      flex-direction: row;
      align-items: center;
    }

    .admin-page .admin-toolbar-divider {
      border-left: 1px solid var(--admin-border);
      padding-left: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-page .admin-button,
    .admin-page .admin-entry {
      transition: none;
    }
  }
`;

function normalizeCategory(category = '') {
  const value = String(category || '')
    .trim()
    .normalize('NFKC');

  if (value === '名詞材料') {
    return '其他';
  }

  if (['穴位', '腧穴', '經穴'].includes(value)) {
    return '穴道';
  }

  if (['藥材', '药材', '中医'].includes(value)) {
    return '中藥';
  }

  return value;
}

function getCategory(item) {
  return normalizeCategory(item?.category);
}

function getCategoryLabel(category) {
  return category === '其他'
    ? '名詞材料'
    : category || '未分類';
}

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase();
}

function asText(value) {
  if (Array.isArray(value)) {
    return value
      .map(asText)
      .filter(Boolean)
      .join('、');
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value).trim();
  }

  return '';
}

function getSummary(item) {
  return [
    item?.englishName,
    item?.english,
    item?.alias,
    item?.description,
    item?.indications,
    item?.effect,
    item?.['主治功效'],
    item?.['功效'],
  ]
    .map(asText)
    .find(Boolean) || '尚無摘要';
}

function getEntryKey(item) {
  const category = getCategory(item);
  const name = normalizeText(item?.name);

  const documentId = String(
    item?.documentId ||
      item?.firestoreId ||
      item?.id ||
      ''
  ).trim();

  const entryKey = normalizeText(item?.entryKey);

  return JSON.stringify([
    category,
    name,
    documentId
      ? `document:${documentId}`
      : entryKey
        ? `entry:${entryKey}`
        : 'local',
  ]);
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card rounded-2xl p-4">
      <div className="admin-muted text-xs font-medium">
        {label}
      </div>

      <div className="admin-stat-number mt-3 text-3xl font-semibold">
        {value}
      </div>
    </div>
  );
}

export default function AdminPage({
  allData = [],
  onBack,
  onAdd,
  onView,
  onCard,
  onEdit,
  onDelete,
  onLogout,
}) {
  const [activeCategory, setActiveCategory] =
    useState('all');

  const [query, setQuery] = useState('');

  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = window.localStorage.getItem(
        'herbal-encyclopedia-admin-view'
      );

      return saved === 'grid' ? 'grid' : 'list';
    } catch {
      return 'list';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'herbal-encyclopedia-admin-view',
        viewMode
      );
    } catch {
      // 無法儲存時，仍可在本次頁面使用期間切換。
    }
  }, [viewMode]);

  const [toast, setToast] = useState('');

  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const normalizedData = useMemo(() => {
    const uniqueItems = new Map();

    const source = Array.isArray(allData)
      ? allData
      : [];

    source.forEach((item) => {
      if (!item?.name) return;

      const key = getEntryKey(item);

      uniqueItems.set(key, item);
    });

    return Array.from(uniqueItems.values());
  }, [allData]);

  const stats = useMemo(() => {
    const counts = {
      total: normalizedData.length,
      books: 0,
      oils: 0,
      points: 0,
      herbs: 0,
      formulas: 0,
    };

    const categoryKeys = {
      書籍: 'books',
      精油: 'oils',
      穴道: 'points',
      中藥: 'herbs',
      方劑: 'formulas',
    };

    normalizedData.forEach((item) => {
      const key = categoryKeys[getCategory(item)];

      if (key) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [normalizedData]);

  const filtered = useMemo(() => {
    const search = normalizeText(query);

    return normalizedData.filter((item) => {
      const category = getCategory(item);

      if (
        activeCategory !== 'all' &&
        category !== activeCategory
      ) {
        return false;
      }

      if (!search) return true;

      const text = normalizeText(
        [
          item?.name,
          item?.englishName,
          item?.english,
          item?.alias,
          item?.description,
          item?.effect,
          item?.indications,
          item?.['主治'],
          item?.['主治功效'],
          item?.['功效'],
          item?.meridian,
          item?.acuTable?.meridian,
          item?.acuTable?.code,
        ]
          .map(asText)
          .filter(Boolean)
          .join(' ')
      );

      return text.includes(search);
    });
  }, [
    normalizedData,
    activeCategory,
    query,
  ]);

  const activeLabel =
    activeCategory === 'all'
      ? '全部資料'
      : getCategoryLabel(activeCategory);

  const showToast = (message) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast(message);

    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 2200);
  };

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item);
      return;
    }

    showToast('刪除功能請由原本流程處理');
  };

  const renderActions = (
    item,
    className = 'admin-entry-actions'
  ) => (
    <div className={className}>
      <button
        type="button"
        onClick={() => onView?.(item)}
        aria-label={`檢視${item.name}`}
        className="admin-button"
      >
        檢視
      </button>

      <button
        type="button"
        onClick={() => onCard?.(item)}
        aria-label={`預覽${item.name}圖卡`}
        className="admin-button"
      >
        圖卡
      </button>

      <button
        type="button"
        onClick={() => onEdit?.(item)}
        aria-label={`編輯${item.name}`}
        className="admin-button admin-button-edit"
      >
        編輯
      </button>

      <button
        type="button"
        onClick={() => {
          handleDelete(item);
        }}
        aria-label={`刪除${item.name}`}
        className="admin-button admin-button-danger"
      >
        刪除
      </button>
    </div>
  );

  return (
    <div className="admin-page">
      <style>{ADMIN_STYLES}</style>

      <header className="admin-header sticky top-0 z-20 border-b px-5 py-5 md:px-10">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div
              aria-hidden="true"
              className="admin-brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            >
              ✦
            </div>

            <div className="min-w-0">
              <div className="admin-accent text-[10px] font-semibold uppercase tracking-[0.2em] md:text-xs">
                Knowledge Studio
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                開發者專區
              </h1>

              <p className="admin-muted mt-1 text-xs leading-5">
                管理、編輯與整理你的百科資料
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="admin-button"
            >
              首頁
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="admin-button admin-button-danger"
            >
              登出
            </button>

            <button
              type="button"
              onClick={onAdd}
              className="admin-button admin-button-primary"
            >
              ＋ 新增百科
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-5 py-8 md:px-10">
        <section
          aria-labelledby="admin-dashboard-title"
          className="admin-dashboard mb-8 rounded-[28px] p-6 md:p-8"
        >
          <div className="grid gap-7 xl:grid-cols-[minmax(240px,0.8fr)_minmax(0,2fr)] xl:items-center">
            <div>
              <div className="admin-dashboard-label mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.12em]">
                CONTENT DASHBOARD
              </div>

              <h2
                id="admin-dashboard-title"
                className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl"
              >
                讓知識整理更從容
              </h2>

              <p className="admin-muted mt-3 max-w-xl text-sm leading-7">
                集中管理本草、芳療、穴道與書籍資料，
                快速找到需要編輯的內容。
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
              {STAT_ITEMS.map((stat) => (
                <StatCard
                  key={stat.key}
                  label={stat.label}
                  value={stats[stat.key]}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="資料篩選與顯示方式"
          className="admin-toolbar mb-6 flex flex-col gap-4 rounded-2xl p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <span className="admin-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>

              <input
                type="search"
                aria-label="搜尋後台百科資料"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="搜尋名稱、英文名稱或內容"
                className="admin-search"
              />
            </div>

            <div
              role="group"
              aria-label="資料顯示方式"
              className="admin-view-controls admin-toolbar-divider"
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                }}
                aria-label="列表模式"
                aria-pressed={viewMode === 'list'}
                title="列表模式"
                className={`admin-button ${
                  viewMode === 'list'
                    ? 'admin-button-selected'
                    : ''
                }`}
              >
                <ListIcon />
                <span>列表</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('grid');
                }}
                aria-label="圖卡模式"
                aria-pressed={viewMode === 'grid'}
                title="圖卡模式"
                className={`admin-button ${
                  viewMode === 'grid'
                    ? 'admin-button-selected'
                    : ''
                }`}
              >
                <GridIcon />
                <span>圖卡</span>
              </button>
            </div>
          </div>

          <div
            role="group"
            aria-label="百科分類"
            className="flex flex-wrap gap-2"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeCategory === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveCategory(item.key);
                  }}
                  aria-pressed={isActive}
                  className={`admin-button ${
                    isActive
                      ? 'admin-button-selected'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p>
            <span className="text-sm font-semibold">
              {activeLabel}
            </span>

            <span className="admin-muted ml-2 text-xs tabular-nums">
              {filtered.length} 筆
            </span>
          </p>

          <p className="admin-muted text-xs">
            與首頁共用外觀設定
          </p>
        </div>

        <section
          aria-label={`${activeLabel}清單`}
          className={
            viewMode === 'grid'
              ? 'admin-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
              : 'admin-list space-y-3'
          }
        >
          {filtered.map((item) => {
            const category = getCategory(item);
            const entryKey = getEntryKey(item);

            if (viewMode === 'grid') {
              return (
                <DataCard
                  key={entryKey}
                  item={item}
                  onSelectItem={onView}
                  actions={renderActions(
                    item,
                    'admin-card-actions'
                  )}
                />
              );
            }

            return (
              <article
                key={entryKey}
                className="admin-entry"
              >
                <div className="admin-entry-inner">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className="admin-category"
                        data-category={category}
                      >
                        {getCategoryLabel(category)}
                      </span>

                      {item?.updatedAt && (
                        <span className="admin-muted text-[11px]">
                          已更新
                        </span>
                      )}
                    </div>

                    <h3 className="break-words text-lg font-semibold leading-7">
                      {item.name || '未命名'}
                    </h3>

                    <p className="admin-muted mt-1 line-clamp-2 break-words text-sm leading-6">
                      {getSummary(item)}
                    </p>
                  </div>

                  {renderActions(item)}
                </div>
              </article>
            );
          })}
        </section>

        {filtered.length === 0 && (
          <div
            role="status"
            className="admin-empty rounded-2xl px-6 py-16 text-center text-sm leading-7"
          >
            找不到符合條件的資料，請調整搜尋文字或分類。
          </div>
        )}
      </main>

      {toast && (
        <div
          role="status"
          className="admin-toast fixed bottom-6 left-1/2 z-50 w-max max-w-[90%] -translate-x-1/2 rounded-full px-5 py-3 text-center text-sm font-medium shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}