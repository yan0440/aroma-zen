import React, { useState, useEffect } from 'react';
import { oilData } from "./data/oilData.js";
import { acuData } from "./data/acuData.js";
import { herbData } from "./data/herbData.js";
import { formulaData } from "./data/formulaData.js";
import { bookData } from "./data/bookData.js";
import OilModal from './components/OilModal';
import AcuModal from './components/AcuModal';
import HerbModal from './components/HerbModal';
import FormulaModal from './components/FormulaModal';
import BookModal from './components/BookModal';
import AdminPage from './components/AdminPage';
import OtherCategoryView from './components/OtherCategoryView';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('書籍');
  const [activeItem, setActiveItem] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const parseBoldSyntax = (str) => {
    if (typeof str !== 'string') return str;
    const boldKeywords = ['肌肉', '神經', '血管'];
    const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉 | 神經 | 血管)/g;

    return str.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-1">
        {line.split(regex).map((part, i) => {
          if (!part) return null;
          if (part.startsWith('==') && part.endsWith('==')) {
            return (
              <mark key={i} className="bg-[#F3E1C5] px-1 rounded">
                {part.slice(2, -2)}
              </mark>
            );
          }
          if ((part.startsWith('**') && part.endsWith('**')) || boldKeywords.includes(part)) {
            return (
              <strong key={i} className="text-[#2F4638] font-semibold">
                {part.replace(/\*\*/g, '')}
              </strong>
            );
          }
          if (part.match(/^[【《\(].*[】》\)]$/)) {
            return <span key={i} className="text-[#6B9080] font-medium">{part}</span>;
          }
          return part;
        })}
      </span>
    ));
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "entries"), (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbData(entries);
    });
    return () => unsub();
  }, []);

  const staticData = [...(oilData || []), ...(acuData || []), ...(herbData || []), ...(formulaData || []), ...(bookData || [])];
  const allData = [...staticData, ...dbData];

  const filteredData = allData.filter(item => {
    if (!item || !item.name) return false;
    const matchesCategory = item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    if (!query) return matchesCategory;

    const searchableFields = [
      item.name,
      item.englishName,
      item.tag,
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
      item.formData?.pharmacology,
      item.formData?.contemporary,
      item.formData?.directions,
      item.formData?.note,
    ];

    const searchableText = searchableFields.filter(Boolean).join(' ').toLowerCase();
    return matchesCategory && searchableText.includes(query);
  });

  if (isAdminMode) {
    return <AdminPage allData={allData} onBack={() => setIsAdminMode(false)} />;
  }

  if (activeItem) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fcfbf8_0%,_#f7f2ea_55%,_#f3ede4_100%)] text-[#3A4F3F]">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button
            onClick={() => setActiveItem(null)}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white/80 px-4 py-2 text-sm text-[#7F6D5F] shadow-sm backdrop-blur-md hover:text-[#3A4F3F] hover:shadow-md transition-all"
          >
            ← 返回列表
          </button>
        </div>

        <div className="px-4 pb-12">
          {activeItem.category === "精油" && <OilModal item={activeItem} />}
          {activeItem.category === "穴道" && <AcuModal item={activeItem} />}
          {activeItem.category === "中藥" && <HerbModal item={activeItem} />}
          {activeItem.category === "方劑" && <FormulaModal item={activeItem} />}
          {activeItem.category === "書籍" && <BookModal item={activeItem} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdfbf7_0%,_#f7f3ea_45%,_#efe9de_100%)] text-[#3A4F3F]">
      <button
        onClick={() => setIsAdminMode(true)}
        className="fixed top-3 left-3 z-50 rounded-full bg-white/70 px-3 py-1 text-[10px] font-medium text-[#A39284] shadow-sm backdrop-blur-md border border-white/70 hover:text-[#3A4F3F] hover:bg-white transition-all"
      >
        開發者專區
      </button>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white/70 px-4 py-2 text-xs tracking-[0.28em] text-[#A39284] shadow-sm backdrop-blur-md mb-5">
            東方經絡 × 西方芳療
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#2F4638] mb-4">
            本草與芳香數位百科
          </h1>
          <p className="text-sm md:text-base text-[#8E7B6A] tracking-wide">
            結合東方經絡與西方芳療的健康數位誌
          </p>
        </header>

        <section className="mb-10 rounded-[2rem] border border-white/70 bg-white/55 p-4 md:p-5 shadow-[0_10px_40px_rgba(122,106,90,0.08)] backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B19C8A]">⌕</span>
              <input
                type="text"
                placeholder="搜尋名稱、英文、經絡或功效標籤..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#E6DDD3] bg-white/85 py-3 pl-11 pr-4 text-sm outline-none ring-0 transition focus:border-[#3A4F3F]/30 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:flex-wrap md:justify-end">
              {['書籍', '精油', '穴道', '中藥', '方劑'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#2F4638] text-white shadow-md shadow-[#2F4638]/15'
                      : 'bg-white/80 text-[#5F6F65] border border-[#E6DDD3] hover:bg-white hover:text-[#2F4638]'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory('其他')}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === '其他'
                    ? 'bg-[#2F4638] text-white shadow-md shadow-[#2F4638]/15'
                    : 'bg-white/80 text-[#5F6F65] border border-[#E6DDD3] hover:bg-white hover:text-[#2F4638]'
                }`}
              >
                其他
              </button>
            </div>
          </div>
        </section>

        <main>
          {selectedCategory === '其他' ? (
            <OtherCategoryView allData={allData} />
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-6 md:p-7 shadow-[0_12px_35px_rgba(122,106,90,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(122,106,90,0.14)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />

                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#3A4F3F]">
                      {item.category}
                    </span>

                    {[item.tag, item.constitutionTag, item.chemicalTag, item.acuTable?.meridian]
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={`tag-${idx}`}
                          className="rounded-full border border-[#E7DED4] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#7C8A80]"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <h3 className="text-2xl md:text-[1.7rem] font-black tracking-tight text-[#2F4638] group-hover:text-[#6B9080] transition-colors">
                    {item.name}
                  </h3>

                  <p className="mt-2 mb-4 text-sm italic text-[#A39284] font-serif">
                    {item.category === "精油" ? item.englishName : (item.acuTable?.code || '')}
                  </p>

                  <div className="text-sm leading-7 text-[#5F6F65]">
                    {parseBoldSyntax(item.description || item.effect || '')}
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#EEE6DC]">
                    <span className="text-xs text-[#A39284]">點擊查看詳細內容</span>
                    <span className="text-xs font-semibold text-[#6B9080] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#E5E0D8] bg-white/70 px-6 py-16 text-center text-[#A39284] shadow-sm backdrop-blur-md">
              沒有資料。
            </div>
          )}
        </main>
      </div>
    </div>
  );
}