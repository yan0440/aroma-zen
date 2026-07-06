import React, { useState } from 'react';
import { oilData } from './data/oilData';
import { acuData } from './data/acuData';
import OilModal from './components/OilModal';
import AcuModal from './components/AcuModal';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeItem, setActiveItem] = useState(null);

  const encyclopediaData = [...oilData, ...acuData];

  const filteredData = encyclopediaData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.englishName && item.englishName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 🧠 圖卡專用排版引擎：全面支援 \n 換行與純淨 ** 粗體加粗（無額外背景）
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const lines = String(text).split(/\\n|\r?\n/);

    // 🔬 終極加粗解析器：大幅加深顏色與權重，確保中文字體高強度顯性
    const parseBoldSyntax = (str) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong 
              key={i} 
              className="font-black text-stone-950 tracking-normal"
              style={{ fontWeight: '850' }} // 強制瀏覽器使用超重磅粗體
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    return lines
      .filter(line => line.trim() !== '')
      .map((line, index) => {
        const trimmed = line.trim();
        // 偵測是否為數字清單或符號清單 (如: 1., •, -)
        const listMatch = trimmed.match(/^((?:\d+|[一二三四五六七八九十A-Za-z]+)[.、)]|[\u2460-\u2473]|[-•*‣▪])\s*/);
        
        if (listMatch) {
          const marker = listMatch[1];
          const content = trimmed.substring(listMatch[0].length);
          return (
            <div key={index} className="flex items-start gap-2 mb-1 last:mb-0 text-justify text-sm text-[#6B7A6E]">
              <span className="font-bold text-[#4E6654] shrink-0 select-none mt-[1px]">{marker}</span>
              <div className="flex-1 break-words leading-relaxed">{parseBoldSyntax(content)}</div>
            </div>
          );
        }
        
        return (
          <p 
            key={index} 
            className="text-justify leading-relaxed break-words mb-1 last:mb-0 text-sm text-[#6B7A6E]"
          >
            {parseBoldSyntax(trimmed)}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#3A4F3F] py-12 px-4 font-sans">
      
      <header className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#3A4F3F] mb-3 tracking-wide">本草與芳香數位百科</h1>
        <p className="text-[#A39284] tracking-wide">結合東方經絡與西方芳療的健康數位誌</p>
      </header>

      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="搜尋名稱、英文、經絡或功效標籤..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4F3F]/20 text-[#3A4F3F] transition-all"
        />

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['全部', '精油', '穴位'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === '穴位' ? '穴道' : cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                (selectedCategory === cat || (selectedCategory === '穴道' && cat === '穴位'))
                  ? 'bg-[#3A4F3F] text-white shadow-sm'
                  : 'bg-white text-[#3A4F3F] border border-[#E5E0D8] hover:bg-[#F0EDE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredData.map((item) => (
              <div 
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-[#E5E0D8]/40 cursor-pointer transform hover:-translate-y-0.5"
              >
                <div>
                  {/* 🏷️ 外層圖卡標籤：若是精油，渲染出實體分開的獨立小卡 */}
                  <div className="flex flex-wrap gap-1.5 items-start mb-3">
                    {item.category === "精油" ? (
                      <>
                        <span className="text-xs font-medium tracking-wider px-2.5 py-1 rounded bg-[#EAE7E0] text-[#6B7A6E]">
                          {item.constitutionTag}
                        </span>
                        <span className="text-xs font-medium tracking-wider px-2.5 py-1 rounded bg-[#E5EAE6] text-[#4E6654]">
                          {item.chemicalTag}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium tracking-wider px-2.5 py-1 rounded bg-[#F0EDE6] text-[#3A4F3F]">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[#3A4F3F] group-hover:text-[#A39284] transition-colors duration-200">
                    {item.name}
                  </h3>
                  
                  <p className="text-sm italic text-[#A39284] mt-1 mb-4 font-serif">
                    {item.category === "精油" ? item.englishName : item.acuTable.code}
                  </p>
                  
                  {/* 🎯 關鍵修正：將原本的 {item.description} 改用排版引擎包裹，使其支援換行與純淨粗體 */}
                  <div className="mb-4">
                    {renderFormattedText(item.description)}
                  </div>
                </div>

                <div className="border-t border-[#F7F5F0] pt-4 flex justify-between items-center text-xs text-[#A39284]">
                  <span>點擊進入探索詳細記載</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">進入圖卡 →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#A39284] bg-white rounded-2xl border border-dashed border-[#E5E0D8]">
            沒有找到符合條件的資料。
          </div>
        )}
      </main>

      {activeItem && activeItem.category === "精油" && (
        <OilModal item={activeItem} onClose={() => setActiveItem(null)} />
      )}
      
      {activeItem && activeItem.category === "穴道" && (
        <AcuModal item={activeItem} onClose={() => setActiveItem(null)} />
      )}

    </div>
  );
}