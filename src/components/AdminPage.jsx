import React, { useState, useEffect } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AddEntryModal from './AddEntryModal';

export default function AdminPage({ allData, onBack }) {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 版本號狀態
  const [version, setVersion] = useState("v1.2.7");

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => setVersion(data.version))
      .catch(() => setVersion("v1.2.7"));
  }, []);

  // 分類篩選狀態
  const [filterCategory, setFilterCategory] = useState('全部');
  const categories = ['全部', '書籍', '精油', '穴道', '中藥', '方劑'];
  
  // 過濾資料邏輯
  const filteredEntries = filterCategory === '全部' 
    ? allData 
    : allData.filter(item => item.category === filterCategory);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#E5E0D8] w-full max-w-sm text-center">
          <h2 className="text-xl font-bold text-[#3A4F3F] mb-6 tracking-widest">DEVELOPER ACCESS</h2>
          <form onSubmit={(e) => { e.preventDefault(); if(password === "0423") setIsAuth(true); else alert("密碼錯誤"); }} className="flex flex-col gap-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] outline-none focus:ring-2 focus:ring-[#3A4F3F]/20" placeholder="輸入密碼" />
            <button type="submit" className="w-full bg-[#3A4F3F] text-white py-3 rounded-xl font-bold">進入專區</button>
          </form>
          <button onClick={onBack} className="mt-6 text-[#A39284] text-sm hover:underline">返回首頁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-12 px-6">
      {isAddModalOpen && (
        <AddEntryModal 
          onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
          editingItem={editingItem} 
        />
      )}

      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-8 border-b border-[#E5E0D8] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3A4F3F]">開發者專區</h1>
            <p className="text-[#A39284] text-sm mt-1">目前版本：{version}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-[#3A4F3F] font-medium hover:bg-[#F0EDE6]">返回首頁</button>
            <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="px-5 py-2.5 rounded-xl bg-[#6B9080] text-white font-medium hover:bg-[#5a7d6e]">+ 新增百科</button>
          </div>
        </header>

        {/* 分類篩選標籤 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterCategory === cat ? 'bg-[#3A4F3F] text-white' : 'bg-white text-[#6B7A6E] border border-[#E5E0D8]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#E5E0D8]/60 flex justify-between items-center shadow-sm hover:border-[#6B9080]/30 transition-all">
                <div>
                  <span className="text-[10px] font-bold text-[#6B9080] bg-[#6B9080]/10 px-2 py-0.5 rounded mr-3">{item.category}</span>
                  <span className="font-semibold text-[#3A4F3F]">{item.name}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`/entry/${item.id}`, '_blank')} 
                    className="px-3 py-1.5 text-xs font-medium text-[#A39284] hover:text-[#3A4F3F] transition"
                  >
                    檢視
                  </button>
                  <button 
                    onClick={() => { setEditingItem(item); setIsAddModalOpen(true); }} 
                    className="px-3 py-1.5 text-xs font-medium text-[#6B9080] hover:bg-[#6B9080]/10 rounded-lg transition"
                  >
                    編輯
                  </button>
                  <button 
                    onClick={async () => { if(confirm('確定刪除「' + item.name + '」？')) await deleteDoc(doc(db, "entries", item.id)); }} 
                    className="px-3 py-1.5 text-xs font-medium text-[#D4A373] hover:bg-[#D4A373]/10 rounded-lg transition"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-[#A39284]">此分類目前沒有資料。</div>
          )}
        </div>
      </div>
    </div>
  );
}