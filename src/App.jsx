import React, { useState, useEffect } from 'react';
import { oilData } from "./data/oilData.js";
import { acuData } from "./data/acuData.js";
import { herbData } from "./data/herbData.js";
import { formulaData } from "./data/formulaData.js";
import OilModal from './components/OilModal';
import AcuModal from './components/AcuModal';
import HerbModal from './components/HerbModal';
import FormulaModal from './components/FormulaModal';
import AddEntryModal from './components/AddEntryModal';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [dbData, setDbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
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

  const categoryInfo = {
    '中藥': { desc: "藥是方的基礎。古云「用藥如用兵」，組方用藥即如同調兵遣將。一味藥又如同程式的基本指令、文章的字詞片語，惟有瞭解每道指令、隻字片語的特性與精確意義，方能寫出耐用的程式、漂亮的文章。中醫的用藥亦同，每味藥皆有其個性、寒熱溫涼、作用範圍(歸經)，非清楚瞭解每一味藥的特性，則無法開出精實、漂亮、有效的處方。", alert: "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。" },
    '方劑': { desc: "中國從漢朝至今，累積了不少名方，典籍記載的方數更是以萬計算。「方」者，方向、指引；引申為參考的依據、範例。唐代被尊稱為藥王的孫思邈嘗云：「學方三年，便謂天下無病不治；用方三年，方知天下無方可用。」何以「無方可用」？因為臨床上少有患者會依照固有成方的結構生病，疾病不但因人而異，且亦隨著時代、環境的變遷而有不同。\n學方者，學其組方的精神；用方者，但視臨症變化。中醫組方、用方完全視患者目前的態(state)量身訂做，而非單憑症狀、一視同仁。臨症變化萬千，豈只百方千方萬方可應付？中醫治證候，少直接針對症狀。若不視證候加減其藥味、藥量，但執原方用之，則有失中醫辨證論治的精神，其不效可期。\n本資料庫中，藥物的劑量有克、原典劑量並列者，須注意原典每單位的實際重量視其所在朝代而有不同，例如東漢的一兩約是15.6gm，1漢升約200毫升。再者，臨床方藥的劑量本須視患者的年紀、體量、與當時的病況、甚至氣候靈活調變，本資料庫的劑量僅供參考。", alert: "本資料庫的內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。" }
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

  const staticData = [...(oilData || []), ...(acuData || []), ...(herbData || []), ...(formulaData || [])];
  const allData = [...staticData, ...dbData];
  
  const filteredData = allData.filter(item => {
    if (!item || !item.name) return false;
    const query = searchQuery.toLowerCase();
    
    // 1. 基礎標籤範圍
    const tags = [item.tag, item.constitutionTag, item.chemicalTag].filter(Boolean).join(' ');

    // 2. 依類別設定搜尋範圍
    let categorySpecificSearch = '';
    
    if (item.category === '精油') {
      categorySpecificSearch = [
        item.oilDetails?.mindEffect, 
        item.oilDetails?.bodyEffect, 
        item.oilDetails?.skinEffect, 
        item.oilDetails?.usage,
        item.oilDetails?.nature
      ].filter(Boolean).join(' ');
    } else if (item.category === '穴道') {
      categorySpecificSearch = [
        item.acuTable?.function, // 假設您的資料欄位為 function
        item.acuTable?.combination   // 假設您的資料欄位為配穴
      ].filter(Boolean).join(' ');
    } else if (item.category === '中藥') {
      categorySpecificSearch = [
        item.effect, 
        item.indications // 主治
      ].filter(Boolean).join(' ');
    } else if (item.category === '方劑') {
      categorySpecificSearch = [
        item.effect, 
        item.indications, // 主治
        item.syndrome,    // 辨證要點
        item.modifications, // 加減變化
        item.modernApp    // 現代應用
      ].filter(Boolean).join(' ');
    }

    // 整合所有搜尋範圍 (名稱與英文名永遠包含)
    const searchableText = `${item.name} ${item.englishName || ''} ${tags} ${categorySpecificSearch}`.toLowerCase();
    
    return searchableText.includes(query) && (selectedCategory === '全部' || item.category === selectedCategory);
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
            {['全部', '精油', '穴道', '中藥', '方劑'].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-[#3A4F3F] text-white' : 'bg-white text-[#3A4F3F] border border-[#E5E0D8]'}`}>{cat}</button>
            ))}
            <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="bg-[#6B9080] text-white px-5 py-2 rounded-xl text-sm font-medium">+ 新增</button>
          </div>
        </div>
      </div>

      {/* 分類頁面介紹區塊 */}
      {categoryInfo[selectedCategory] && (
        <div className="max-w-5xl mx-auto mb-8 space-y-4">
          {/* 🟢 這裡新增專屬標題 */}
          <h3 className="font-bold text-[#3A4F3F] text-sm tracking-widest border-b border-[#E5E0D8] pb-2 mb-2">
            {selectedCategory} 說明與提醒
          </h3>

          <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] italic text-[#6B7A6E] text-sm">
            {categoryInfo[selectedCategory].desc}
          </div>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
            <strong className="block mb-1">⚠️ 重要提醒：</strong>
            {categoryInfo[selectedCategory].alert}
          </div>
        </div>
      )}

      {isAddModalOpen && <AddEntryModal onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} editingItem={editingItem} />}

      <main className="max-w-5xl mx-auto">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredData.map((item) => (
              <div key={item.id} onClick={() => setActiveItem(item)} className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all cursor-pointer relative border border-[#E5E0D8]/40">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(e, item); }} className="text-[11px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-bold">編輯</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteEntry(e, item.id); }} className="text-[11px] text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold">刪除</button>
                </div>
                
                {/* 🟢 補回標籤顯示區塊 */}
                <div>
                  <div className="flex flex-wrap gap-1.5 items-start mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#F0EDE6] text-[#3A4F3F]">{item.category}</span>
                    {(item.tag || item.acuTable?.meridian) && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#EAE7E0] text-[#6B7A6E]">
                        {item.tag || item.acuTable?.meridian}
                      </span>
                    )}
                    {item.category === "精油" && (
                      <>
                        {item.constitutionTag && <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#EAE7E0] text-[#6B7A6E]">{item.constitutionTag}</span>}
                        {item.chemicalTag && <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#E5EAE6] text-[#4E6654]">{item.chemicalTag}</span>}
                      </>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-[#3A4F3F] group-hover:text-[#A39284]">{item.name}</h3>
                  <p className="text-sm italic text-[#A39284] mt-1 mb-4 font-serif">{item.category === "精油" ? item.englishName : (item.acuTable?.code || '')}</p>
                  <div className="text-sm text-[#6B7A6E] leading-relaxed mb-4">{parseBoldSyntax(item.description || item.effect)}</div>
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
    </div>
  );
}