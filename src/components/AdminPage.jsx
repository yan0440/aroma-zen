import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import {
  doc,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../firebase';
import AddEntryPage from './AddEntryPage';

const EncyclopediaViewer = lazy(() => import('./EncyclopediaViewer'));
const CardViewer = lazy(() => import('./CardViewer'));

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getEntryKey = (category = '', name = '') =>
  `${normalizeText(category)}__${normalizeText(name)}`;

const categories = [
  '全部',
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
];

const buildBookSearchText = (item) => {
  const walkChapters = (chapters) => {
    if (!chapters) return '';

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

        return `${current} ${walkChapters(chapter.children)}`;
      })
      .join(' ');
  };

  return normalizeText(
    [
      item.name,
      item.bookDetails?.author,
      walkChapters(item.bookDetails?.chapters),
    ]
      .filter(Boolean)
      .join(' ')
  );
};

const buildSearchText = (item) => {
  if (item.category === '書籍') {
    return buildBookSearchText(item);
  }

  return normalizeText(
    [
      item.name,
      item.alias,
      item.englishName,
      item.tag,
      item.source,
      item.effect,
      item.indications,
    ]
      .filter(Boolean)
      .join(' ')
  );
};

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email 或密碼錯誤。';

    case 'auth/invalid-email':
      return 'Email 格式不正確。';

    case 'auth/too-many-requests':
      return '登入失敗次數過多，請稍後再試。';

    case 'auth/network-request-failed':
      return '網路連線失敗，請確認網路後再試。';

    case 'auth/operation-not-allowed':
      return 'Firebase 尚未啟用 Email/Password 登入。';

    default:
      return error?.message || '登入失敗，請稍後再試。';
  }
};

const EntryRow = React.memo(function EntryRow({
  item,
  onViewItem,
  onViewCard,
  onEdit,
  onDelete,
  disabled,
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8]/60 flex justify-between items-center shadow-sm print:break-inside-avoid">
      <span className="font-semibold text-[#3A4F3F]">
        {item.name}
      </span>

      <div className="flex gap-2 flex-wrap justify-end print:hidden">
        <button
          onClick={() => onViewItem(item)}
          disabled={disabled}
          className="px-4 py-2 text-sm text-[#3A4F3F] font-medium bg-[#F7F5F0] rounded-lg hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          檢視
        </button>

        <button
          onClick={() => onViewCard(item)}
          disabled={disabled}
          className="px-4 py-2 text-sm text-[#3A4F3F] font-medium bg-[#F7F5F0] rounded-lg hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          圖卡
        </button>

        <button
          onClick={() => onEdit(item)}
          disabled={disabled}
          className="px-4 py-2 text-sm text-[#6B9080] font-medium bg-[#F7F5F0] rounded-lg hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          編輯
        </button>

        <button
          onClick={() => onDelete(item)}
          disabled={disabled}
          className="px-4 py-2 text-sm text-[#D4A373] font-medium bg-[#F7F5F0] rounded-lg hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          刪除
        </button>
      </div>
    </div>
  );
});

export default function AdminPage({ allData, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [viewState, setViewState] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);

  const [version, setVersion] = useState('v2026-08-11-b02f021');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [searchName, setSearchName] = useState('');
  const [displayCount, setDisplayCount] = useState(10);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const deletingRef = useRef(false);

  /*
   * 監聽 Firebase 登入狀態
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      },
      (error) => {
        console.error('Authentication 狀態讀取失敗:', error);
        setAuthError('無法確認登入狀態，請重新整理頁面。');
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * 讀取版本號
   */
  useEffect(() => {
  const loadVersion = async () => {
    try {
      const response = await fetch(
        `/version.json?t=${Date.now()}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          `版本檔讀取失敗：${response.status}`
        );
      }

      const data = await response.json();

      if (data?.version) {
        setVersion(String(data.version));
      }
    } catch (error) {
      console.error('版本號讀取失敗:', error);

      // 讀取失敗時保留目前版本，不退回舊版 v1.2.7
      setVersion('v2026-08-11-b02f021');
    }
  };

  loadVersion();
}, []);
  /*
   * 切換頁面時回到頂端
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewState]);

  /*
   * 搜尋或分類變更時，回到前 10 筆
   */
  useEffect(() => {
    setDisplayCount(10);
  }, [filterCategory, searchName]);

  /*
   * 成功或失敗通知 3 秒後自動消失
   */
  useEffect(() => {
    if (!deleteMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDeleteMessage('');
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deleteMessage]);

  const indexedData = useMemo(() => {
    return (allData || [])
      .filter((item) => item && item.name && item.category)
      .map((item) => ({
        ...item,
        _searchText: item._searchText || buildSearchText(item),
      }));
  }, [allData]);

  const filteredByCategory = useMemo(() => {
    if (filterCategory === '全部') {
      return indexedData;
    }

    return indexedData.filter(
      (item) => item.category === filterCategory
    );
  }, [indexedData, filterCategory]);

  const filteredEntries = useMemo(() => {
    const query = normalizeText(searchName);

    if (!query) {
      return filteredByCategory;
    }

    return filteredByCategory.filter((item) =>
      (item._searchText || '').includes(query)
    );
  }, [filteredByCategory, searchName]);

  const displayedEntries = useMemo(
    () => filteredEntries.slice(0, displayCount),
    [filteredEntries, displayCount]
  );

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();

      if (isSigningIn) return;

      const normalizedEmail = email.trim();

      if (!normalizedEmail || !password) {
        setAuthError('請輸入 Email 與密碼。');
        return;
      }

      setIsSigningIn(true);
      setAuthError('');

      try {
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

        setPassword('');
      } catch (error) {
        console.error('登入失敗:', error);
        setAuthError(getAuthErrorMessage(error));
      } finally {
        setIsSigningIn(false);
      }
    },
    [email, password, isSigningIn]
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);

      setViewState('list');
      setEditingItem(null);
      setViewingItem(null);
      setViewingCard(null);
      setEmail('');
      setPassword('');
      setAuthError('');
    } catch (error) {
      console.error('登出失敗:', error);
      alert('登出失敗，請稍後再試。');
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount((previous) => previous + 10);
  }, []);

  const handleDelete = useCallback(async (item) => {
    if (deletingRef.current) return;

    const confirmed = window.confirm(
      `確定要刪除「${item?.name || ''}」嗎？`
    );

    if (!confirmed) return;

    deletingRef.current = true;
    setIsDeleting(true);
    setDeleteMessage('');

    const entryKey =
      item?.entryKey ||
      getEntryKey(
        item?.category || '',
        item?.name || ''
      );

    try {
      const batch = writeBatch(db);

      batch.delete(doc(db, 'entries', entryKey));
      batch.delete(doc(db, 'entryKeys', entryKey));

      await batch.commit();

      setDeleteMessage('刪除成功。');
    } catch (error) {
      console.error('刪除失敗:', error);

      if (error?.code === 'permission-denied') {
        setDeleteMessage(
          '刪除失敗：目前帳號沒有 Firestore 寫入權限。'
        );
      } else if (error?.code === 'unauthenticated') {
        setDeleteMessage(
          '登入狀態已失效，請重新登入。'
        );
      } else {
        setDeleteMessage('刪除失敗，請稍後再試。');
      }
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }, []);

  const handleViewItem = useCallback((item) => {
    setViewingItem(item);
  }, []);

  const handleViewCard = useCallback((item) => {
    setViewingCard(item);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setViewState('add');
  }, []);

  /*
   * Authentication 狀態確認中
   */
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0]">
        <div className="rounded-2xl bg-white px-6 py-4 text-[#3A4F3F] shadow-lg">
          正在確認登入狀態...
        </div>
      </div>
    );
  }

  /*
   * 尚未登入
   */
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5E0D8] w-full max-w-sm text-center">
          <h2 className="text-xl font-bold text-[#3A4F3F] mb-2 tracking-widest">
            開發者專區
          </h2>

          <p className="text-sm text-[#A39284] mb-6">
            請使用管理員帳號登入
          </p>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setAuthError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] outline-none text-[#3A4F3F]"
              placeholder="管理員 Email"
              autoComplete="email"
              disabled={isSigningIn}
            />

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setAuthError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] outline-none text-[#3A4F3F]"
              placeholder="管理員密碼"
              autoComplete="current-password"
              disabled={isSigningIn}
            />

            {authError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-[#3A4F3F] text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? '登入中...' : '登入開發者專區'}
            </button>
          </form>

          <button
            onClick={onBack}
            disabled={isSigningIn}
            className="mt-6 text-[#A39284] text-sm hover:underline disabled:opacity-50"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  /*
   * 新增或編輯頁面
   */
  if (viewState === 'add') {
    return (
      <AddEntryPage
        onClose={() => {
          setViewState('list');
          setEditingItem(null);
        }}
        editingItem={editingItem}
      />
    );
  }

  return (
    <div className="w-screen h-dvh bg-[#F7F5F0] flex flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#F7F5F0]/80">
            <div className="rounded-2xl bg-white px-5 py-3 shadow-lg text-[#3A4F3F] font-medium">
              載入中...
            </div>
          </div>
        }
      >
        {viewingItem && (
          <EncyclopediaViewer
            item={viewingItem}
            onClose={() => setViewingItem(null)}
          />
        )}

        {viewingCard && (
          <CardViewer
            item={viewingCard}
            onClose={() => setViewingCard(null)}
          />
        )}
      </Suspense>

      <header className="shrink-0 bg-[#F7F5F0] px-6 md:px-10 py-6 border-b border-[#E5E0D8] print:hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4F3F]">
              開發者專區
            </h1>

            <p className="text-[#A39284] text-sm mt-1">
              目前版本：{version}
            </p>

            <p className="text-[#A39284] text-xs mt-1">
              登入帳號：{currentUser.email}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-[#3A4F3F] font-medium hover:bg-[#F0EDE6]"
            >
              返回首頁
            </button>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#D4A373] text-[#D4A373] font-medium hover:bg-[#F0EDE6]"
            >
              登出
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setViewState('add');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#6B9080] text-white font-medium hover:bg-[#5a7d6e]"
            >
              + 新增百科
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden px-6 md:px-10 py-6 print:p-0">
        <div className="h-full flex flex-col min-h-0 gap-6">
          <div className="shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 print:hidden">
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="搜尋名稱"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white outline-none text-[#3A4F3F] placeholder:text-[#B8A99A]"
              />

              {searchName && (
                <button
                  onClick={() => setSearchName('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white border border-[#E5E0D8] text-[#6B7A6E] hover:bg-[#F0EDE6]"
                >
                  清除
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:justify-end">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filterCategory === category
                      ? 'bg-[#3A4F3F] text-white'
                      : 'bg-white text-[#6B7A6E] border border-[#E5E0D8]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {deleteMessage && (
            <div className="flex items-center justify-between gap-4 text-sm text-[#6B7A6E] bg-white px-4 py-2 rounded-xl border border-[#E5E0D8]">
              <span>{deleteMessage}</span>

              <button
                onClick={() => setDeleteMessage('')}
                className="shrink-0 text-lg leading-none text-[#A39284] hover:text-[#3A4F3F]"
                aria-label="關閉通知"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {displayedEntries.length === 0 ? (
              <div className="rounded-2xl bg-white border border-[#E5E0D8] px-6 py-12 text-center text-[#A39284]">
                目前沒有符合條件的百科資料。
              </div>
            ) : (
              <div className="grid gap-3">
                {displayedEntries.map((item, index) => (
                  <EntryRow
                    key={
                      item.id ||
                      `${item.category}-${item.name}-${index}`
                    }
                    item={item}
                    onViewItem={handleViewItem}
                    onViewCard={handleViewCard}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    disabled={isDeleting}
                  />
                ))}
              </div>
            )}

            {filteredEntries.length > displayCount && (
              <div className="pt-4 pb-2 flex justify-center print:hidden">
                <button
                  onClick={handleLoadMore}
                  className="rounded-full bg-[#2F4638] px-5 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 transition-all"
                >
                  載入更多
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}