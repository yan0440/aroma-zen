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
import AddEntryModal from './components/AddEntryModal';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('書籍');
  const [activeItem, setActiveItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const parseBoldSyntax = (str) => {
    if (typeof str !== 'string') return str;
    const boldKeywords = ['肌肉', '神經', '血管'];
    const regex = /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;
    return str.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-1">
        {line.split(regex).map((part, i) => {
          if (!part) return null;
          if (part.startsWith('==') && part.endsWith('==')) 
            return <mark key={i} className="bg-[#F3E1C5] px-1 rounded">{part.slice(2, -2)}</mark>;
          if ((part.startsWith('**') && part.endsWith('**')) || boldKeywords.includes(part)) 
            return <strong key={i} className="text-[#3A4F3F]">{part.replace(/\*\*/g, '')}</strong>;
          if (part.match(/^[【《\(].*[】》\)]$/)) 
            return <span key={i} className="text-[#6B9080] font-medium">{part}</span>;
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

  const deleteEntry = async (e, id) => {
    e.stopPropagation();
    const password = prompt("請輸入管理員密碼：");
    if (password === "0423") {
      try { await deleteDoc(doc(db, "entries", String(id))); alert("刪除成功"); } catch (error) { alert("刪除失敗"); }
    } else if (password !== null) { alert("密碼錯誤"); }
  };

  const startEdit = (e, item) => { e.stopPropagation(); setEditingItem(item); setIsAddModalOpen(true); };

  const staticData = [...(oilData || []), ...(acuData || []), ...(herbData || []), ...(formulaData || []), ...(bookData || [])];
  const allData = [...staticData, ...dbData];
  
  const filteredData = allData.filter(item => {
    if (!item || !item.name) return false;
    const query = searchQuery.toLowerCase();
    const tags = [item.tag, item.constitutionTag, item.chemicalTag, item.acuTable?.meridian].filter(Boolean).join(' ');
    
    let categorySpecificSearch = '';
    if (item.category === '書籍') categorySpecificSearch = [item.name, item.description].filter(Boolean).join(' ');
    else if (item.category === '精油') categorySpecificSearch = [item.oilDetails?.mindEffect, item.oilDetails?.bodyEffect, item.oilDetails?.skinEffect, item.oilDetails?.usage, item.oilDetails?.nature].filter(Boolean).join(' ');
    else if (item.category === '穴道') categorySpecificSearch = [item.acuTable?.function, item.acuTable?.combination].filter(Boolean).join(' ');
    else if (item.category === '中藥') categorySpecificSearch = [item.effect, item.indications].filter(Boolean).join(' ');
    else if (item.category === '方劑') categorySpecificSearch = [item.effect, item.indications, item.syndrome, item.modifications, item.modernApp].filter(Boolean).join(' ');

    const searchableText = `${item.name} ${item.englishName || ''} ${tags} ${categorySpecificSearch}`.toLowerCase();
    return searchableText.includes(query) && item.category === selectedCategory;
  });
  
  return (
    <div className="font-fttf min-h-screen bg-[#F7F5F0] text-[#3A4F3F] py-12 px-4">
      <header className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#3A4F3F] mb-3 tracking-wide">本草與芳香數位百科</h1>
        <p className="text-[#A39284] tracking-wide">結合東方經絡與西方芳療的健康數位誌</p>
      </header>

      <div className="max-w-5xl mx-auto mb-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <input type="text" placeholder="搜尋名稱、英文、經絡或功效標籤..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4F3F]/20" />
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 items-center">
            {['書籍', '精油', '穴道', '中藥', '方劑'].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#3A4F3F] text-white' : 'bg-white text-[#3A4F3F] border border-[#E5E0D8]'}`}>{cat}</button>
            ))}
            <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="bg-[#6B9080] text-white px-5 py-2 rounded-xl text-sm font-medium">+ 新增</button>
          </div>
        </div>
      </div>

      {isAddModalOpen && <AddEntryModal onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} editingItem={editingItem} />}

      <main className="max-w-5xl mx-auto">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredData.map((item) => (
              <div key={item.id} onClick={() => setActiveItem(item)} className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all cursor-pointer relative border border-[#E5E0D8]/40">
                {/* 🟢 管理按鈕補回 */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => startEdit(e, item)} className="text-[11px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-bold">編輯</button>
                  <button onClick={(e) => deleteEntry(e, item.id)} className="text-[11px] text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold">刪除</button>
                </div>
                
                <div>
                  <div className="flex flex-wrap gap-1.5 items-start mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#F0EDE6] text-[#3A4F3F]">{item.category}</span>
                    {[item.tag, item.constitutionTag, item.chemicalTag, item.acuTable?.meridian].filter(Boolean).map((tag, idx) => (
                      <span key={`tag-${idx}`} className="text-xs font-medium px-2.5 py-1 rounded bg-[#E5E0D8]/40 text-[#6B7A6E]">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-[#3A4F3F] group-hover:text-[#A39284] transition-colors">{item.name}</h3>
                  <p className="text-sm italic text-[#A39284] mt-1 mb-4 font-serif">
                    {item.category === "精油" ? item.englishName : (item.acuTable?.code || '')}
                  </p>
                  <div className="text-sm text-[#6B7A6E] leading-relaxed mb-4">{parseBoldSyntax(item.description || item.effect || '')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-center py-20 text-[#A39284]">沒有資料。</div>}
      </main>

      {activeItem?.category === "精油" && <OilModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "穴道" && <AcuModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "中藥" && <HerbModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "方劑" && <FormulaModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "書籍" && <BookModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}