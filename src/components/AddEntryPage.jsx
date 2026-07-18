import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, setDoc } from 'firebase/firestore'; 
import BookStructureEditor from './BookStructureEditor';
import PreviewRenderer from "./PreviewRenderer";

export default function AddEntryPage({ onClose, editingItem, isViewOnly = false }) {
  const [formData, setFormData] = useState({ 
    category: '精油', name: '', tag: '', description: '', 
    englishName: '', constitutionTag: '', chemicalTag: '', 
    acuTable: { code: '', meridian: '', alias: '' },
    acuDetails: { location: '', operation: '', indications: '', type: '', nameExpl: '', anatomy: '', effectAncient: '', effectModern: '', matchingPoints: '' },
    oilTable: {}, oilDetails: {},
    bookDetails: { author: '', chapters: [] } 
  });

  // 1. 編輯時的資料還原：將物件結構轉回陣列供 UI 使用
  useEffect(() => {
    if (editingItem) {
      const convertObjectsToArrays = (obj) => {
        if (obj !== null && typeof obj === 'object') {
          // 如果 key 都是數字字串，則視為陣列還原
          const keys = Object.keys(obj);
          const isArrayLike = keys.length > 0 && keys.every(key => !isNaN(key));
          
          if (isArrayLike) {
            return keys.sort((a, b) => Number(a) - Number(b)).map(key => convertObjectsToArrays(obj[key]));
          } else {
            const newObj = {};
            for (const key in obj) {
              newObj[key] = convertObjectsToArrays(obj[key]);
            }
            return newObj;
          }
        }
        return obj;
      };
      setFormData(convertObjectsToArrays(editingItem));
    }
  }, [editingItem]);

  // 2. 儲存時的資料轉換：將陣列轉為物件以繞過 Firebase 限制
  const handleSave = async () => {
    if (!formData.name) return alert("請至少填寫名稱！");
    
    const convertArraysToObjects = (obj) => {
      if (Array.isArray(obj)) {
        const newObj = {};
        obj.forEach((item, index) => {
          newObj[index.toString()] = convertArraysToObjects(item);
        });
        return newObj;
      } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = convertArraysToObjects(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const cleanData = convertArraysToObjects(formData);
    const entryId = editingItem ? String(editingItem.id) : Date.now().toString();
    const newEntry = { ...cleanData, id: entryId };

    try {
      await setDoc(doc(db, "entries", entryId), newEntry);
      alert("✅ 資料已成功儲存！");
      onClose();
    } catch (error) {
      console.error("寫入資料失敗: ", error);
      alert("儲存失敗，請檢查控制台錯誤訊息。");
    }
  };

  const inputClass = `w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#3A4F3F]/10 focus:border-[#3A4F3F] outline-none transition-all ${isViewOnly ? 'opacity-70 cursor-not-allowed' : ''}`;
  const labelClass = "text-[11px] font-bold text-[#A39284] uppercase tracking-widest mb-1.5 block";
  const textareaClass = `${inputClass} h-24`;

  return (
  <div className={`min-h-screen bg-[#FBF9F6] ${isViewOnly ? 'p-6 md:p-12' : 'p-4 md:p-12'}`}>
    {/* 標題區域：檢視模式更寬鬆 */}
    <div className={`${isViewOnly ? 'max-w-5xl' : 'max-w-4xl'} mx-auto flex justify-between items-center mb-10 pb-6 border-b border-[#E5E0D8]`}>
      <h2 className="text-3xl font-black text-[#3A4F3F]">
        {isViewOnly ? `檢視：${formData.name || '百科資料'}` : (editingItem ? "編輯百科資料" : "新增百科資料")}
      </h2>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 text-[#A39284] font-bold hover:text-[#3A4F3F] transition-colors">
            {isViewOnly ? "關閉" : "取消"}
          </button>
          {!isViewOnly && (
            <button onClick={handleSave} className="px-8 py-2 bg-[#3A4F3F] text-white rounded-full font-bold hover:bg-[#2C3C30] shadow-lg transition-all">
              儲存資料
            </button>
          )}
        </div>
      </div>

      <div className={`${isViewOnly ? 'max-w-5xl' : 'max-w-4xl'} mx-auto space-y-6`}>
      <div className={`bg-white ${isViewOnly ? 'p-12' : 'p-8'} rounded-3xl border border-[#E5E0D8]/60 shadow-sm`}>
          {/* 表單內容 (維持你原有的欄位) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelClass}>分類</label>
              <select disabled={isViewOnly} className={inputClass} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="書籍">書籍</option>
                <option value="精油">精油</option>
                <option value="穴道">穴道</option>
                <option value="中藥">中藥</option>
                <option value="方劑">方劑</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>名稱</label>
              <input disabled={isViewOnly} placeholder="輸入名稱" value={formData.name || ''} className={inputClass} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          
          <div className="w-full mb-6">
            <label className={labelClass}>簡介描述</label>
            <textarea disabled={isViewOnly} placeholder="簡介描述" value={formData.description || ''} className={textareaClass} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          {!['穴道', '精油'].includes(formData.category) && (
            <div className="mb-6">
              <label className={labelClass}>核心標籤</label>
              <input disabled={isViewOnly} placeholder="例如：解表、清熱" value={formData.tag || ''} className={inputClass} onChange={(e) => setFormData({...formData, tag: e.target.value})} />
            </div>
          )}

          {formData.category === '書籍' && (
  <BookStructureEditor 
    formData={formData}
    setFormData={setFormData}
    labelClass={labelClass}
    inputClass={inputClass}
    // 確保這裡有傳遞這個屬性，你的編輯器元件內要記得接收它
    disabled={isViewOnly}
  />
)}
          {formData.category === '精油' && (
  <div className={`grid grid-cols-1 gap-8 animate-in fade-in duration-500`}>
    
    {/* 基本屬性區 */}
    <div className={`col-span-1 md:col-span-2 grid grid-cols-1 ${isViewOnly ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4 bg-white ${isViewOnly ? 'p-10' : 'p-5'} rounded-2xl border border-[#E5E0D8]/50 shadow-sm`}>
      <span className="col-span-1 md:col-span-2 lg:col-span-3 font-bold text-[#3A4F3F] text-sm border-b border-[#E5E0D8] pb-1.5 mb-1">📊 基本屬性資料</span>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <label className={labelClass}>適用體質與化學屬性標籤</label>
        <div className="flex gap-2">
          <input disabled={isViewOnly} placeholder="體質標籤" value={formData.constitutionTag || ''} className={inputClass} onChange={(e) => setFormData({...formData, constitutionTag: e.target.value})} />
          <input disabled={isViewOnly} placeholder="化學屬性標籤" value={formData.chemicalTag || ''} className={inputClass} onChange={(e) => setFormData({...formData, chemicalTag: e.target.value})} />
        </div>
      </div>

      {[
        { label: '別名', key: 'alias' },
        { label: '植物種類／萃取部位', key: 'typePart' },
        { label: '萃取方法', key: 'method' },
        { label: '外文名', key: 'englishName' },
        { label: '拉丁學名', key: 'latin' },
        { label: '科名', key: 'family' },
        { label: '性味', key: 'nature', isDetail: true },
        { label: '五行／陰陽屬性', key: 'property', isDetail: true },
        { label: '歸經', key: 'meridian', isDetail: true },
        { label: '主治', key: 'indications', isDetail: true },
        { label: '類比音符', key: 'noteAnalogy', isDetail: true },
        { label: '主宰星球', key: 'planet', isDetail: true },
        { label: '重要產地', key: 'origin', isDetail: true }
      ].map((field) => (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          <input 
            disabled={isViewOnly} 
            className={inputClass} 
            value={field.isDetail ? (formData.oilDetails?.[field.key] || '') : (formData[field.key] || '')} 
            onChange={(e) => field.isDetail 
              ? setFormData({...formData, oilDetails: { ...formData.oilDetails, [field.key]: e.target.value }})
              : setFormData({...formData, [field.key]: e.target.value})
            } 
          />
        </div>
      ))}
    </div>

    {/* 感官與歷史描述 */}
    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>🔍 氣味</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.scent || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, scent: e.target.value }})} />
      </div>
      <div>
        <label className={labelClass}>✨ 外觀描述</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.appearance || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, appearance: e.target.value }})} />
      </div>
      <div className="col-span-1 md:col-span-2">
        <label className={labelClass}>📜 應用歷史與相關神話</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.historyMyth || ''} className={`${textareaClass} h-32`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, historyMyth: e.target.value }})} />
      </div>
    </div>

    {/* 化學與屬性補充 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>🔬 化學結構</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.chemistry || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, chemistry: e.target.value }})} />
      </div>
      <div>
        <label className={labelClass}>⚖️ 屬性</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.attribute || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, attribute: e.target.value }})} />
      </div>
    </div>

    {/* 注意事項 */}
    <div className="bg-red-50/40 p-4 rounded-xl border border-red-200/40">
        <label className={`${labelClass} text-red-800`}>⚠️ 注意事項</label>
        <textarea disabled={isViewOnly} value={formData.oilDetails?.caution || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, caution: e.target.value }})} />
    </div>

    {/* 深度效能 */}
    <div className="col-span-1 md:col-span-2 bg-[#F7F5F0]/60 p-6 rounded-xl border border-[#E5E0D8]/40 space-y-4">
      <span className="font-bold text-[#3A4F3F] block border-b border-[#E5E0D8] pb-1.5 text-sm">🩺 深度效能</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['心靈療效', '身體療效', '皮膚療效'].map((type) => {
           const key = type === '心靈療效' ? 'mindEffect' : type === '身體療效' ? 'bodyEffect' : 'skinEffect';
           return (
            <div key={type} className="bg-white p-4 rounded-lg border border-[#E5E0D8]/40 shadow-sm">
              <label className="text-xs font-bold text-[#6B9080] uppercase tracking-wider mb-2 block">{type}</label>
              <textarea disabled={isViewOnly} value={formData.oilDetails?.[key] || ''} className={`${textareaClass} h-40`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, [key]: e.target.value }})} />
            </div>
           );
        })}
      </div>
    </div>

    {/* 調和與配方 */}
    <div className="space-y-4 bg-[#3A4F3F]/5 p-6 rounded-xl border border-[#3A4F3F]/10">
      <label className={labelClass}>🔗 適合與之調和的精油</label>
      <textarea disabled={isViewOnly} value={formData.oilDetails?.blendingOils || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, blendingOils: e.target.value }})} />
      
      <label className={labelClass}>🧪 精油配方</label>
      <textarea disabled={isViewOnly} value={formData.oilDetails?.formulas || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, formulas: e.target.value }})} />
      
      <label className={labelClass}>🧴 按摩基底油</label>
      <textarea disabled={isViewOnly} value={formData.oilDetails?.carrierOil || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, carrierOil: e.target.value }})} />
      
      <label className={labelClass}>🚀 使用方法</label>
      <textarea disabled={isViewOnly} value={formData.oilDetails?.usage || ''} className={textareaClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, usage: e.target.value }})} />
    </div>
  </div>
)}

        {formData.category === '穴道' && (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <input placeholder="國際代碼" value={formData.acuTable?.code || ''} className={inputClass} onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, code: e.target.value }})} />
      <input placeholder="經絡" value={formData.acuTable?.meridian || ''} className={inputClass} onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, meridian: e.target.value }})} />
    </div>
    <input placeholder="別名" value={formData.acuTable?.alias || ''} className={inputClass} onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, alias: e.target.value }})} />
    <textarea placeholder="主治" value={formData.acuDetails?.indications || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, indications: e.target.value }})} />
    <textarea placeholder="🏷️ 類別" value={formData.acuDetails?.type || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, type: e.target.value }})} />
    <textarea placeholder="📖 釋名" value={formData.acuDetails?.nameExpl || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, nameExpl: e.target.value }})} />
    <textarea placeholder="📍 位置" value={formData.acuDetails?.location || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, location: e.target.value }})} />
    <textarea placeholder="💀 解剖" value={formData.acuDetails?.anatomy || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, anatomy: e.target.value }})} />
    <textarea placeholder="🎯 操作" value={formData.acuDetails?.operation || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, operation: e.target.value }})} />
    <textarea placeholder="古代功效" value={formData.acuDetails?.effectAncient || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, effectAncient: e.target.value }})} />
    <textarea placeholder="現代功效" value={formData.acuDetails?.effectModern || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, effectModern: e.target.value }})} />
    <textarea placeholder="🔗 配穴" value={formData.acuDetails?.matchingPoints || ''} className={textareaClass} onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, matchingPoints: e.target.value }})} />
  </div>
)}

        {formData.category === '中藥' && (
  <div className="space-y-3 mb-4">
    <div className="grid grid-cols-2 gap-3">
      <input placeholder="別名" value={formData.alias || ''} className={inputClass} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
      <input placeholder="科屬" value={formData.family || ''} className={inputClass} onChange={(e) => setFormData({...formData, family: e.target.value})} />
      
      {/* 拆分為兩個獨立欄位 */}
      <input placeholder="性味" value={formData.nature || ''} className={inputClass} onChange={(e) => setFormData({...formData, nature: e.target.value})} />
      <input placeholder="歸經" value={formData.meridian || ''} className={inputClass} onChange={(e) => setFormData({...formData, meridian: e.target.value})} />
    </div>
    
    <textarea placeholder="品種來源" value={formData.source || ''} className={textareaClass} onChange={(e) => setFormData({...formData, source: e.target.value})} />
    <textarea placeholder="功效" value={formData.effect || ''} className={textareaClass} onChange={(e) => setFormData({...formData, effect: e.target.value})} />
    <textarea placeholder="主治" value={formData.indications || ''} className={textareaClass} onChange={(e) => setFormData({...formData, indications: e.target.value})} />
    <textarea placeholder="用法用量" value={formData.dosage || ''} className={textareaClass} onChange={(e) => setFormData({...formData, dosage: e.target.value})} />
    <textarea placeholder="現代藥理" value={formData.pharmacology || ''} className={textareaClass} onChange={(e) => setFormData({...formData, pharmacology: e.target.value})} />
    <textarea placeholder="文獻別錄" value={formData.literature || ''} className={textareaClass} onChange={(e) => setFormData({...formData, literature: e.target.value})} />
    <textarea placeholder="注意禁忌" value={formData.contraindication || ''} className={textareaClass} onChange={(e) => setFormData({...formData, contraindication: e.target.value})} />
    <textarea placeholder="附藥說明" value={formData.directions || ''} className={textareaClass} onChange={(e) => setFormData({...formData, directions: e.target.value})} />
    <textarea placeholder="註" value={formData.note || ''} className={textareaClass} onChange={(e) => setFormData({...formData, note: e.target.value})} />
  </div>
)}
        {formData.category === '方劑' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="來源" value={formData.source || ''} className={inputClass} onChange={(e) => setFormData({...formData, source: e.target.value})} />
              <input placeholder="功效" value={formData.effect || ''} className={inputClass} onChange={(e) => setFormData({...formData, effect: e.target.value})} />
            </div>
            <textarea placeholder="製法用量" value={formData.preparation || ''} className={textareaClass} onChange={(e) => setFormData({...formData, preparation: e.target.value})} />
            <textarea placeholder="主治" value={formData.indications || ''} className={textareaClass} onChange={(e) => setFormData({...formData, indications: e.target.value})} />
            <textarea placeholder="文獻別錄" value={formData.literature || ''} className={textareaClass} onChange={(e) => setFormData({...formData, literature: e.target.value})} />
            <textarea placeholder="方義" value={formData.analysis || ''} className={textareaClass} onChange={(e) => setFormData({...formData, analysis: e.target.value})} />
            <textarea placeholder="方論" value={formData.discussion || ''} className={textareaClass} onChange={(e) => setFormData({...formData, discussion: e.target.value})} />
            <textarea placeholder="辨證要點" value={formData.syndrome || ''} className={textareaClass} onChange={(e) => setFormData({...formData, syndrome: e.target.value})} />
            <textarea placeholder="加減" value={formData.modifications || ''} className={textareaClass} onChange={(e) => setFormData({...formData, modifications: e.target.value})} />
            <textarea placeholder="注意禁忌" value={formData.contraindication || ''} className={textareaClass} onChange={(e) => setFormData({...formData, contraindication: e.target.value})} />
            <textarea placeholder="現代應用" value={formData.modernApp || ''} className={textareaClass} onChange={(e) => setFormData({...formData, modernApp: e.target.value})} />
            <textarea placeholder="附方" value={formData.prescription || ''} className={textareaClass} onChange={(e) => setFormData({...formData, prescription: e.target.value})} />
          </div>
        )}
        </div>
        
        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-[#E5E0D8]/40">
          <button onClick={onClose} className="px-8 py-3 text-[#A39284] font-fttf hover:text-[#3A4F3F] transition-colors">
            {isViewOnly ? "關閉" : "取消"}
          </button>
          {!isViewOnly && (
            <button onClick={handleSave} className="px-10 py-3 bg-[#3A4F3F] text-white rounded-2xl font-fttf hover:bg-[#2C3C30] shadow-xl shadow-[#3A4F3F]/20 transition-all">
              儲存資料
            </button>
          )}
        </div>
      </div>
    </div>
  );
}