import React, { useMemo, useState } from 'react';

const NAV_ITEMS = [
  { key: 'all', label: '全部' },
  { key: '書籍', label: '書籍' },
  { key: '精油', label: '精油' },
  { key: '穴道', label: '穴道' },
  { key: '中藥', label: '中藥' },
  { key: '方劑', label: '方劑' },
  { key: '其他', label: '名詞材料' },
];

const categoryClass = {
  精油: 'bg-[#EAF2ED] text-[#4E7661]',
  穴道: 'bg-[#F2EDE3] text-[#8A6F4C]',
  中藥: 'bg-[#F3E9E4] text-[#8B6255]',
  方劑: 'bg-[#EAEAF2] text-[#65658A]',
  書籍: 'bg-[#E8EEF4] text-[#58728C]',
  其他: 'bg-[#F0E9F1] text-[#806687]',
};

function normalizeCategory(category = '') {
  const value = String(category || '').trim().normalize('NFKC');
  if (value === '名詞材料') return '其他';
  if (['穴位', '腧穴', '經穴'].includes(value)) return '穴道';
  if (['藥材', '药材', '中医'].includes(value)) return '中藥';
  return value;
}

function getCategory(item) {
  return normalizeCategory(item?.category);
}

function normalizeText(value = '') {
  return String(value || '').trim().normalize('NFKC').toLowerCase();
}

function StatCard({ icon, label, value, isDark }) {
  return <div className={`rounded-2xl border p-4 shadow-[0_8px_24px_rgba(63,81,68,0.06)] backdrop-blur ${isDark ? 'border-white/10 bg-white/10' : 'border-white/80 bg-white/75'}`}><div className="mb-2 text-xl">{icon}</div><div className={`text-2xl font-black ${isDark ? 'text-[#F4EFE7]' : 'text-[#2F4638]'}`}>{value}</div><div className={`mt-1 text-xs ${isDark ? 'text-[#C8D2CA]' : 'text-[#8A938B]'}`}>{label}</div></div>;
}

export default function AdminPage({ allData = [], onBack, onAdd, onView, onCard, onEdit, onDelete, onLogout }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState('');

  const normalizedData = useMemo(() => (allData || []).filter((item) => item?.name), [allData]);
  const categories = useMemo(() => normalizedData.map(getCategory), [normalizedData]);
  const stats = useMemo(() => ({ total: normalizedData.length, books: categories.filter((item) => item === '書籍').length, oils: categories.filter((item) => item === '精油').length, points: categories.filter((item) => item === '穴道').length, herbs: categories.filter((item) => item === '中藥').length, formulas: categories.filter((item) => item === '方劑').length }), [normalizedData.length, categories]);
  const filtered = useMemo(() => normalizedData.filter((item) => { const category = getCategory(item); const text = normalizeText(`${item?.name || ''} ${item?.englishName || ''} ${item?.alias || ''} ${item?.description || ''} ${item?.effect || ''} ${item?.indications || ''}`); return (activeCategory === 'all' || category === activeCategory) && (!query.trim() || text.includes(normalizeText(query))); }), [normalizedData, activeCategory, query]);
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const handleDelete = (item) => { if (onDelete) onDelete(item); else showToast('刪除功能請由原本流程處理'); };

  return <div className={`${isDark ? 'bg-[#25332C] text-[#F4EFE7]' : 'bg-[#F5F3EE] text-[#2F4638]'} min-h-screen w-full overflow-x-hidden transition-colors`}><header className={`${isDark ? 'border-white/10 bg-[#25332C]/90' : 'border-[#E7E2D9]/80 bg-[#F5F3EE]/90'} sticky top-0 z-20 border-b px-6 py-5 backdrop-blur-xl md:px-10`}><div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6"><div className="flex min-w-0 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A5546] text-2xl text-white shadow-lg">✦</div><div className="min-w-0"><div className="text-xs font-bold uppercase tracking-[0.22em] text-[#789785]">Knowledge Studio</div><h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">開發者專區</h1><p className={`mt-1 text-xs ${isDark ? 'text-[#C8D2CA]' : 'text-[#9A978F]'}`}>管理、編輯與整理你的百科資料</p></div></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={onBack} className="rounded-xl border border-[#DDD8CF] bg-white/80 px-5 py-2.5 text-sm font-bold text-[#53645A] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">首頁</button><button type="button" onClick={onLogout} className="rounded-xl border border-[#D9A6A0] bg-white/80 px-5 py-2.5 text-sm font-bold text-[#B06D66] transition hover:bg-[#FFF4F2]">登出</button><button type="button" onClick={onAdd} className="rounded-xl bg-[#6B9080] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(107,144,128,0.25)] transition hover:-translate-y-0.5 hover:bg-[#5A7B6D]">＋ 新增百科</button></div></div></header><main className="mx-auto w-full max-w-[1500px] px-6 py-8 md:px-10"><section className="mb-8 rounded-[2rem] border border-white/80 bg-gradient-to-br from-[#EAF2ED] via-[#F6F1E7] to-[#F2E9E5] p-7 shadow-[0_14px_40px_rgba(63,81,68,0.08)] md:p-9"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><div className="mb-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-widest text-[#6B9080]">CONTENT DASHBOARD</div><h2 className="text-3xl font-black tracking-tight text-[#2F4638] md:text-4xl">讓知識整理更從容</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#718078]">集中管理本草、芳療、穴道與書籍資料，快速找到需要編輯的內容。</p></div><div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><StatCard icon="📚" label="全部資料" value={stats.total} isDark={isDark} /><StatCard icon="📖" label="書籍" value={stats.books} isDark={isDark} /><StatCard icon="🌿" label="精油" value={stats.oils} isDark={isDark} /><StatCard icon="◎" label="穴道" value={stats.points} isDark={isDark} /><StatCard icon="🌱" label="中藥" value={stats.herbs} isDark={isDark} /><StatCard icon="⚗" label="方劑" value={stats.formulas} isDark={isDark} /></div></div></section><section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E7E2D9] bg-white/75 p-4 shadow-sm lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#A39284]">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋名稱、英文名稱或內容" className="w-full rounded-xl border border-[#E5E0D8] bg-[#FBFAF7] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#6B9080] focus:ring-2 focus:ring-[#6B9080]/10" /></div><div className="flex flex-wrap gap-2">{NAV_ITEMS.map((item) => <button key={item.key} type="button" onClick={() => setActiveCategory(item.key)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeCategory === item.key ? 'bg-[#3A5546] text-white shadow-md' : 'border border-[#E5E0D8] bg-white text-[#728078] hover:bg-[#F4F1EB]'}`}>{item.label}</button>)}</div><div className="flex items-center gap-2 border-l border-[#E5E0D8] pl-3"><button type="button" onClick={() => setViewMode('list')} className={`rounded-lg px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-[#EAF2ED] text-[#4E7661]' : 'text-[#9A978F]'}`}>☰</button><button type="button" onClick={() => setViewMode('grid')} className={`rounded-lg px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-[#EAF2ED] text-[#4E7661]' : 'text-[#9A978F]'}`}>▦</button><button type="button" onClick={() => setIsDark((value) => !value)} className="rounded-lg px-3 py-2 text-sm text-[#9A978F]">{isDark ? '☀' : '☾'}</button></div></section><div className="mb-4 flex items-center justify-between"><div><span className={`text-sm font-bold ${isDark ? 'text-[#F4EFE7]' : 'text-[#53645A]'}`}>{activeCategory === 'all' ? '全部資料' : NAV_ITEMS.find((item) => item.key === activeCategory)?.label}</span><span className="ml-2 text-xs text-[#A39284]">{filtered.length} 筆</span></div><span className="text-xs text-[#A39284]">最後更新：即時同步</span></div><section className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>{filtered.map((item, index) => { const category = getCategory(item); return <article key={item?.entryKey || item?.documentId || item?.id || index} className={`group rounded-2xl border p-4 shadow-[0_6px_20px_rgba(63,81,68,0.05)] transition hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'border-white/10 bg-white/10' : 'border-white/80 bg-white/85'}`}><div className="flex flex-col gap-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${categoryClass[category] || 'bg-[#F0EDE6] text-[#6B7A6E]'}`}>{category || '未分類'}</span>{item?.updatedAt && <span className="text-[11px] text-[#A39284]">已更新</span>}</div><h3 className={`truncate text-lg font-black ${isDark ? 'text-[#F4EFE7]' : 'text-[#3A4F3F]'}`}>{item?.name || '未命名'}</h3><p className={`mt-1 line-clamp-2 text-sm ${isDark ? 'text-[#C8D2CA]' : 'text-[#87938C]'}`}>{item?.englishName || item?.alias || item?.description || '尚無摘要'}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => onView?.(item)} className="rounded-xl border border-[#E5E0D8] bg-[#FBFAF7] px-4 py-2 text-sm font-bold text-[#53645A] hover:bg-[#F1EEE7]">檢視</button><button type="button" onClick={() => onCard?.(item)} className="rounded-xl border border-[#E5E0D8] bg-[#FBFAF7] px-4 py-2 text-sm font-bold text-[#53645A] hover:bg-[#F1EEE7]">圖卡</button><button type="button" onClick={() => onEdit?.(item)} className="rounded-xl bg-[#EAF2ED] px-4 py-2 text-sm font-bold text-[#4E7661] hover:bg-[#DCEBE2]">編輯</button><button type="button" onClick={() => handleDelete(item)} className="rounded-xl bg-[#FBF0ED] px-4 py-2 text-sm font-bold text-[#B47B6B] hover:bg-[#F8E0DB]">刪除</button></div></div></article>; })}</section>{filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[#D9D3C9] bg-white/60 px-6 py-16 text-center text-[#9A978F]">找不到符合條件的資料</div>}</main>{toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2F4638] px-5 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}</div>;
}
