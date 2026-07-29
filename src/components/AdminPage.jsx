import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import AddEntryPage from './AddEntryPage';

const EncyclopediaViewer = lazy(() => import('./EncyclopediaViewer'));
const CardViewer = lazy(() => import('./CardViewer'));

const normalizeText = (v = '') =>
  String(v).trim().normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();

const getEntryKey = (category = '', name = '') =>
  `${normalizeText(category)}__${normalizeText(name)}`;

const categories = ['全部', '書籍', '精油', '穴道', '中藥', '方劑'];

const EntryRow = React.memo(function EntryRow({
  item,
  onViewItem,
  onViewCard,
  onEdit,
  onDelete,
  disabled
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8]/60 flex justify-between items-center shadow-sm print:break-inside-avoid">
      <span className="font-semibold text-[#3A4F3F]">{item.name}</span>
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
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [viewState, setViewState] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [version, setVersion] = useState('v1.2.7');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [searchName, setSearchName] = useState('');
  const [displayCount, setDisplayCount] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion('v1.2.7'));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewState]);

  useEffect(() => {
    setDisplayCount(10);
  }, [filterCategory, searchName]);

  const getBookSearchText = useCallback((item) => {
    const walkChapters = (chapters) => {
      if (!chapters) return '';
      const arr = Array.isArray(chapters) ? chapters : Object.values(chapters);

      return arr
        .map((ch) => {
          const current = [ch.title, ch.alias, ch.name, ch.text].filter(Boolean).join(' ');
          return `${current} ${walkChapters(ch.children)}`;
        })
        .join(' ');
    };

    return [item.name, item.bookDetails?.author, walkChapters(item.bookDetails?.chapters)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }, []);

  const getSearchText = useCallback((item) => {
    return [item.name].filter(Boolean).join(' ').toLowerCase();
  }, []);

  const filteredEntries = useMemo(() => {
    const query = searchName.toLowerCase();
    return allData
      .filter((item) => filterCategory === '全部' || item.category === filterCategory)
      .filter((item) => {
        if (!query) return true;
        const searchableText =
          item.category === '書籍' ? getBookSearchText(item) : getSearchText(item);
        return searchableText.includes(query);
      });
  }, [allData, filterCategory, searchName, getBookSearchText, getSearchText]);

  const displayedEntries = useMemo(
    () => filteredEntries.slice(0, displayCount),
    [filteredEntries, displayCount]
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + 10);
  }, []);

  const handleDelete = useCallback(async (item) => {
    if (isDeleting) return;
    if (!confirm('確定刪除？')) return;

    setIsDeleting(true);
    setDeleteMessage('');

    const entryKey = item?.entryKey || getEntryKey(item?.category || '', item?.name || '');

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'entries', entryKey));
      batch.delete(doc(db, 'entryKeys', entryKey));
      await batch.commit();
      setDeleteMessage('刪除成功');
    } catch (error) {
      console.error('刪除失敗:', error);
      setDeleteMessage('刪除失敗，請稍後再試。');
      alert('刪除失敗，請稍後再試。');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting]);

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

  if (!isAuth) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0]">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5E0D8] w-full max-w-sm text-center">
          <h2 className="text-xl font-bold text-[#3A4F3F] mb-6 tracking-widest">開發者專區</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password === '0423') setIsAuth(true);
              else alert('密碼錯誤');
            }}
            className="flex flex-col gap-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] outline-none"
              placeholder="輸入密碼"
            />
            <button type="submit" className="w-full bg-[#3A4F3F] text-white py-3 rounded-xl font-bold">
              進入專區
            </button>
          </form>
          <button onClick={onBack} className="mt-6 text-[#A39284] text-sm hover:underline">
            返回首頁
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
          <EncyclopediaViewer item={viewingItem} onClose={() => setViewingItem(null)} />
        )}
        {viewingCard && (
          <CardViewer item={viewingCard} onClose={() => setViewingCard(null)} />
        )}
      </Suspense>

      <header className="shrink-0 bg-[#F7F5F0] px-6 md:px-10 py-6 border-b border-[#E5E0D8] print:hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4F3F]">開發者專區</h1>
            <p className="text-[#A39284] text-sm mt-1">目前版本：{version}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-[#3A4F3F] font-medium hover:bg-[#F0EDE6]"
            >
              返回首頁
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
                onChange={(e) => setSearchName(e.target.value)}
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
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filterCategory === cat
                      ? 'bg-[#3A4F3F] text-white'
                      : 'bg-white text-[#6B7A6E] border border-[#E5E0D8]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {deleteMessage && (
            <div className="text-sm text-[#6B7A6E] bg-white px-4 py-2 rounded-xl border border-[#E5E0D8]">
              {deleteMessage}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid gap-3">
              {displayedEntries.map((item) => (
                <EntryRow
                  key={item.id}
                  item={item}
                  onViewItem={handleViewItem}
                  onViewCard={handleViewCard}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  disabled={isDeleting}
                />
              ))}
            </div>

            {filteredEntries.length > 10 && displayedEntries.length < filteredEntries.length && (
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