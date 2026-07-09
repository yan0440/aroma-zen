import React, { useState } from 'react';
import { oilData } from "./data/oilData.js";
import { acuData } from "./data/acuData.js";
import { herbData } from "./data/herbData.js";
import { formulaData } from "./data/formulaData.js";
import OilModal from './components/OilModal';
import AcuModal from './components/AcuModal';
import HerbModal from './components/HerbModal';
import FormulaModal from './components/FormulaModal';
import AddEntryModal from './components/AddEntryModal';

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("myEncyclopedia");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeItem, setActiveItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const addNewEntry = (newEntry) => {
    const updatedData = [...data, { ...newEntry, id: Date.now() }];
    setData(updatedData);
    localStorage.setItem("myEncyclopedia", JSON.stringify(updatedData));
  };

  const updateEntry = (updatedEntry) => {
    const updatedData = data.map(item => item.id === updatedEntry.id ? updatedEntry : item);
    setData(updatedData);
    localStorage.setItem("myEncyclopedia", JSON.stringify(updatedData));
    setEditingItem(null);
  };

  const deleteEntry = (e, id) => {
    e.stopPropagation();
    const password = prompt("請輸入管理員密碼：");
    if (password === "1234") {
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      localStorage.setItem("myEncyclopedia", JSON.stringify(updatedData));
      alert("刪除成功");
    } else {
      alert(password === null ? "已取消刪除" : "密碼錯誤，請重新嘗試");
    }
  };

  const startEdit = (e, item) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const allEncyclopediaData = [...data, ...(oilData || []), ...(acuData || []), ...(herbData || []), ...(formulaData || [])];
  const filteredData = allEncyclopediaData.filter(item => {
    if (!item || !item.name) return false;
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) || (item.tag && item.tag.toLowerCase().includes(query)) || (item.englishName && item.englishName.toLowerCase().includes(query));
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-fttf min-h-screen bg-[#F7F5F0] text-[#3A4F3F] py-12 px-4">
      <header className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#3A4F3F] mb-3 tracking-wide">本草與芳香數位百科</h1>
        <p className="text-[#A39284] tracking-wide">結合東方經絡與西方芳療的健康數位誌</p>
      </header>
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input type="text" placeholder="搜尋名稱、英文、經絡或功效標籤..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4F3F]/20 text-[#3A4F3F] transition-all" />
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 items-center">
          {['全部', '精油', '穴道', '中藥', '方劑'].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#3A4F3F] text-white shadow-sm' : 'bg-white text-[#3A4F3F] border border-[#E5E0D8] hover:bg-[#F0EDE6]'}`}>{cat}</button>
          ))}
          <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="bg-[#6B9080] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#3A4F3F] transition-all">+ 新增</button>
        </div>
      </div>
      {isAddModalOpen && (
        <AddEntryModal 
          onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
          onSave={editingItem ? updateEntry : addNewEntry} 
          editingItem={editingItem} 
        />
      )}
      <main className="max-w-5xl mx-auto">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredData.map((item) => (
              <div key={item.id} onClick={() => setActiveItem(item)} className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-[#E5E0D8]/40 cursor-pointer relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-[999] pointer-events-auto">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(e, item); }} className="text-[11px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-bold hover:bg-blue-100">編輯</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteEntry(e, item.id); }} className="text-[11px] text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold hover:bg-red-100">刪除</button>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 items-start mb-3">
                    {item.category === "精油" ? (
                      <><span className="text-xs font-medium px-2.5 py-1 rounded bg-[#EAE7E0] text-[#6B7A6E]">{item.constitutionTag}</span><span className="text-xs font-medium px-2.5 py-1 rounded bg-[#E5EAE6] text-[#4E6654]">{item.chemicalTag}</span></>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#F0EDE6] text-[#3A4F3F]">{item.tag}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-[#3A4F3F] group-hover:text-[#A39284]">{item.name}</h3>
                  <p className="text-sm italic text-[#A39284] mt-1 mb-4 font-serif">{item.category === "精油" ? item.englishName : (item.acuTable?.code || '')}</p>
                  {/* 使用 whitespace-pre-line 保留你在 textarea 輸入的換行與編號格式 */}
                  <div className="text-sm text-[#6B7A6E] whitespace-pre-line leading-relaxed mb-4">{item.description}</div>
                </div>
                <div className="border-t border-[#F7F5F0] pt-4 flex justify-between items-center text-xs text-[#A39284]">
                  <span>點擊進入詳情</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#A39284] bg-white rounded-2xl border border-dashed border-[#E5E0D8]">沒有資料。</div>
        )}
      </main>
      {activeItem?.category === "精油" && <OilModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "穴道" && <AcuModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "中藥" && <HerbModal item={activeItem} onClose={() => setActiveItem(null)} />}
      {activeItem?.category === "方劑" && <FormulaModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}