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
  signOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

import AddEntryPage from './AddEntryPage';
import OilModal from './OilModal';
import AcuModal from './AcuModal';
import HerbModal from './HerbModal';
import FormulaModal from './FormulaModal';
import BookModal from './BookModal';
import OtherDetailPage from './OtherDetailPage';

import { APP_VERSION } from '../generatedVersion.js';

const CardViewer = lazy(
  () => import('./CardViewer')
);

const MODAL_MAP = {
  書籍: BookModal,
  精油: OilModal,
  穴道: AcuModal,
  中藥: HerbModal,
  方劑: FormulaModal,
  其他: OtherDetailPage,
};

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getEntryKey = (
  category = '',
  name = ''
) =>
  `${normalizeText(category)}__${normalizeText(name)}`;

const getCategoryLabel = (category) =>
  category === '其他'
    ? '名詞材料'
    : category;

const categories = [
  '全部',
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
  '其他',
];

const buildBookSearchText = (item) => {
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
      item.description,
      item.syndrome,
      item.modifications,
      item.modernApp,
      item.modernPharmacology,
      item.pharmacology,
      item.contemporary,
      item.directions,
      item.note,
      item.literature,
      item.contraindication,
      item.traits,
      item.nature,
      item.family,
      item.meridian,
      item.property,
      item.typePart,
      item.method,

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
      return (
        error?.message ||
        '登入失敗，請稍後再試。'
      );
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
    <div className="flex items-center justify-between rounded-2xl border border-[#E5E0D8]/60 bg-white p-5 shadow-sm print:break-inside-avoid">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#3A4F3F]">
            {item.name}
          </span>

          <span className="rounded-full bg-[#F4EFE7] px-2.5 py-1 text-[11px] text-[#7C8A80]">
            {getCategoryLabel(item.category)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => onViewItem(item)}
          disabled={disabled}
          className="rounded-lg bg-[#F7F5F0] px-4 py-2 text-sm font-medium text-[#3A4F3F] hover:bg-[#E5E0D8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          檢視
        </button>

        <button
          type="button"
          onClick={() => onViewCard(item)}
          disabled={disabled}
          className="rounded-lg bg-[#F7F5F0] px-4 py-2 text-sm font-medium text-[#3A4F3F] hover:bg-[#E5E0D8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          圖卡
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          disabled={disabled}
          className="rounded-lg bg-[#F7F5F0] px-4 py-2 text-sm font-medium text-[#6B9080] hover:bg-[#E5E0D8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          編輯
        </button>

        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={disabled}
          className="rounded-lg bg-[#F7F5F0] px-4 py-2 text-sm font-medium text-[#D4A373] hover:bg-[#E5E0D8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          刪除
        </button>
      </div>
    </div>
  );
});

export default function AdminPage({
  allData,
  onBack,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [currentUser, setCurrentUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState('');

  const [isSigningIn, setIsSigningIn] =
    useState(false);

  const [viewState, setViewState] =
    useState('list');

  const [editingItem, setEditingItem] =
    useState(null);

  const [viewingItem, setViewingItem] =
    useState(null);

  const [viewingCard, setViewingCard] =
    useState(null);

  const [
    filterCategory,
    setFilterCategory,
  ] = useState('全部');

  const [searchName, setSearchName] =
    useState('');

  const [displayCount, setDisplayCount] =
    useState(10);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    deleteMessage,
    setDeleteMessage,
  ] = useState('');

  const [
    firestoreEntries,
    setFirestoreEntries,
  ] = useState([]);

  const [
    isLoadingEntries,
    setIsLoadingEntries,
  ] = useState(false);

  const deletingRef = useRef(false);

  const version = APP_VERSION;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      },
      (error) => {
        console.error(
          'Authentication 狀態讀取失敗:',
          error
        );

        setAuthError(
          '無法確認登入狀態，請重新整理頁面。'
        );

        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadAllFirestoreEntries =
    useCallback(async () => {
      if (!currentUser) {
        return;
      }

      setIsLoadingEntries(true);

      try {
        const snapshot = await getDocs(
          collection(db, 'entries')
        );

        const entries = snapshot.docs.map(
          (entryDoc) => ({
            id: entryDoc.id,
            ...entryDoc.data(),
          })
        );

        setFirestoreEntries(entries);
      } catch (error) {
        console.error(
          '後臺讀取 Firestore 百科失敗:',
          error
        );

        setDeleteMessage(
          '後臺讀取雲端百科失敗，請重新整理頁面。'
        );
      } finally {
        setIsLoadingEntries(false);
      }
    }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFirestoreEntries([]);
      return;
    }

    loadAllFirestoreEntries();
  }, [
    currentUser,
    viewState,
    loadAllFirestoreEntries,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewState]);

  useEffect(() => {
    setDisplayCount(10);
  }, [filterCategory, searchName]);

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

  const adminData = useMemo(() => {
    const dataMap = new Map();

    (allData || []).forEach((item) => {
      if (
        !item ||
        !item.name ||
        !item.category
      ) {
        return;
      }

      const key =
        item.entryKey ||
        getEntryKey(
          item.category,
          item.name
        );

      dataMap.set(key, {
        ...item,
      });
    });

    firestoreEntries.forEach((item) => {
      if (
        !item ||
        !item.name ||
        !item.category
      ) {
        return;
      }

      const key =
        item.entryKey ||
        getEntryKey(
          item.category,
          item.name
        );

      const previous = dataMap.get(key);

      dataMap.set(key, {
        ...previous,
        ...item,

        oilDetails: {
          ...previous?.oilDetails,
          ...item.oilDetails,
        },

        acuTable: {
          ...previous?.acuTable,
          ...item.acuTable,
        },

        acuDetails: {
          ...previous?.acuDetails,
          ...item.acuDetails,
        },

        bookDetails: {
          ...previous?.bookDetails,
          ...item.bookDetails,
        },
      });
    });

    return Array.from(dataMap.values());
  }, [allData, firestoreEntries]);

  const indexedData = useMemo(() => {
    return adminData
      .filter(
        (item) =>
          item &&
          item.name &&
          item.category
      )
      .map((item) => ({
        ...item,
        _searchText:
          item._searchText ||
          buildSearchText(item),
      }));
  }, [adminData]);

  const filteredByCategory = useMemo(() => {
    if (filterCategory === '全部') {
      return indexedData;
    }

    return indexedData.filter(
      (item) =>
        item.category === filterCategory
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
    () =>
      filteredEntries.slice(
        0,
        displayCount
      ),
    [filteredEntries, displayCount]
  );

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();

      if (isSigningIn) {
        return;
      }

      const normalizedEmail = email.trim();

      if (!normalizedEmail || !password) {
        setAuthError('請輸入 Email 與密碼。');
        return;
      }

      setIsSigningIn(true);
      setAuthError('');

      try {
        await setPersistence(
          auth,
          browserSessionPersistence
        );

        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

        setPassword('');
      } catch (error) {
        console.error('登入失敗:', error);

        setAuthError(
          getAuthErrorMessage(error)
        );
      } finally {
        setIsSigningIn(false);
      }
    },
    [email, password, isSigningIn]
  );

  const handleLogout = useCallback(
    async () => {
      try {
        await signOut(auth);

        setViewState('list');
        setEditingItem(null);
        setViewingItem(null);
        setViewingCard(null);
        setFirestoreEntries([]);
        setEmail('');
        setPassword('');
        setAuthError('');
      } catch (error) {
        console.error('登出失敗:', error);
        alert('登出失敗，請稍後再試。');
      }
    },
    []
  );

  const handleCloseAdminDetail =
    useCallback(() => {
      setViewingItem(null);
      setViewingCard(null);
      setEditingItem(null);
      setViewState('list');
      setDeleteMessage('');
    }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(
      (previous) => previous + 10
    );
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (deletingRef.current) {
        return;
      }

      const confirmed = window.confirm(
        `確定要刪除「${item?.name || ''}」嗎？`
      );

      if (!confirmed) {
        return;
      }

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

        batch.delete(
          doc(db, 'entries', entryKey)
        );

        batch.delete(
          doc(db, 'entryKeys', entryKey)
        );

        await batch.commit();

        setFirestoreEntries((previous) =>
          previous.filter((entry) => {
            const currentKey =
              entry.entryKey ||
              getEntryKey(
                entry.category || '',
                entry.name || ''
              );

            return currentKey !== entryKey;
          })
        );

        setDeleteMessage('刪除成功。');
      } catch (error) {
        console.error('刪除失敗:', error);

        if (
          error?.code ===
          'permission-denied'
        ) {
          setDeleteMessage(
            '刪除失敗：目前帳號沒有 Firestore 寫入權限。'
          );
        } else if (
          error?.code ===
          'unauthenticated'
        ) {
          setDeleteMessage(
            '登入狀態已失效，請重新登入。'
          );
        } else {
          setDeleteMessage(
            '刪除失敗，請稍後再試。'
          );
        }
      } finally {
        deletingRef.current = false;
        setIsDeleting(false);
      }
    },
    []
  );

  const handleViewItem = useCallback(
    (item) => {
      setViewingItem(item);
    },
    []
  );

  const handleViewCard = useCallback(
    (item) => {
      setViewingCard(item);
    },
    []
  );

  const handleEdit = useCallback(
    (item) => {
      setEditingItem(item);
      setViewState('add');
    },
    []
  );

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0]">
        <div className="rounded-2xl bg-white px-6 py-4 text-[#3A4F3F] shadow-lg">
          正在確認登入狀態...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-[#E5E0D8] bg-white p-8 text-center shadow-xl">
          <h2 className="mb-2 text-xl font-bold tracking-widest text-[#3A4F3F]">
            開發者專區
          </h2>

          <p className="mb-6 text-sm text-[#A39284]">
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
              className="w-full rounded-xl border border-[#E5E0D8] px-4 py-3 text-[#3A4F3F] outline-none"
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
              className="w-full rounded-xl border border-[#E5E0D8] px-4 py-3 text-[#3A4F3F] outline-none"
              placeholder="管理員密碼"
              autoComplete="current-password"
              disabled={isSigningIn}
            />

            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full rounded-xl bg-[#3A4F3F] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningIn
                ? '登入中...'
                : '登入開發者專區'}
            </button>
          </form>

          <button
            type="button"
            onClick={onBack}
            disabled={isSigningIn}
            className="mt-6 text-sm text-[#A39284] hover:underline disabled:opacity-50"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

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

if (viewingItem) {
  const DetailComponent =
    MODAL_MAP[viewingItem.category];

  if (DetailComponent) {
    return (
      <DetailComponent
        item={viewingItem}
        onClose={handleCloseAdminDetail}
        backLabel="返回後臺列表"
      />
    );
  }

  return (
  <AddEntryPage
    editingItem={viewingItem}
    isViewOnly
    closeLabel="返回後臺列表"
    onClose={handleCloseAdminDetail}
  />
);
}

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#F7F5F0]">
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#F7F5F0]/80">
            <div className="rounded-2xl bg-white px-5 py-3 font-medium text-[#3A4F3F] shadow-lg">
              載入中...
            </div>
          </div>
        }
      >


        {viewingCard && (
          <CardViewer
            item={viewingCard}
            onClose={() =>
              setViewingCard(null)
            }
          />
        )}
      </Suspense>

      <header className="shrink-0 border-b border-[#E5E0D8] bg-[#F7F5F0] px-6 py-6 print:hidden md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4F3F]">
              開發者專區
            </h1>

            <p className="mt-1 text-sm text-[#A39284]">
              目前版本：{version}
            </p>

            <p className="mt-1 text-xs text-[#A39284]">
              登入帳號：{currentUser.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-[#E5E0D8] bg-white px-5 py-2.5 font-medium text-[#3A4F3F] hover:bg-[#F0EDE6]"
            >
              首頁
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#D76B66] bg-white px-5 py-2.5 font-medium text-[#D76B66] hover:bg-[#F0EDE6]"
            >
              登出
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setViewState('add');
              }}
              className="rounded-xl bg-[#6B9080] px-5 py-2.5 font-medium text-white hover:bg-[#5A7D6E]"
            >
              + 新增百科
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden px-6 py-6 print:p-0 md:px-10">
        <div className="flex h-full min-h-0 flex-col gap-6">
          <div className="flex shrink-0 flex-col gap-3 print:hidden md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={searchName}
                onChange={(event) =>
                  setSearchName(
                    event.target.value
                  )
                }
                placeholder="搜尋名稱"
                className="w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-2.5 text-[#3A4F3F] outline-none placeholder:text-[#B8A99A]"
              />

              {searchName && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchName('')
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1.5 text-[#6B7A6E] hover:bg-[#F0EDE6]"
                >
                  清除
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:justify-end md:pb-0">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    setFilterCategory(category)
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    filterCategory === category
                      ? 'bg-[#3A4F3F] text-white'
                      : 'border border-[#E5E0D8] bg-white text-[#6B7A6E]'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          {deleteMessage && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-sm text-[#6B7A6E]">
              <span>{deleteMessage}</span>

              <button
                type="button"
                onClick={() =>
                  setDeleteMessage('')
                }
                className="shrink-0 text-lg leading-none text-[#A39284] hover:text-[#3A4F3F]"
                aria-label="關閉通知"
              >
                ×
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoadingEntries ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-white px-6 py-12 text-center text-[#A39284]">
                正在讀取全部雲端百科資料...
              </div>
            ) : displayedEntries.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-white px-6 py-12 text-center text-[#A39284]">
                目前沒有符合條件的百科資料。
              </div>
            ) : (
              <div className="grid gap-3">
                {displayedEntries.map(
                  (item, index) => (
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
                  )
                )}
              </div>
            )}

            {filteredEntries.length >
              displayCount && (
              <div className="flex justify-center pb-2 pt-4 print:hidden">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="rounded-full bg-[#2F4638] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90"
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