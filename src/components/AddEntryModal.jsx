import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, setDoc } from 'firebase/firestore'; 

export default function AddEntryModal({ onClose, editingItem }) {
  const [formData, setFormData] = useState({ 
    category: '精油', name: '', tag: '', description: '', 
    englishName: '', constitutionTag: '', chemicalTag: '', 
    acuTable: { code: '', meridian: '', alias: '' },
    acuDetails: { location: '', operation: '', indications: '' },
    oilTable: {},
    oilDetails: {}
  });

  useEffect(() => {
    if (editingItem) setFormData(editingItem);
  }, [editingItem]);

  const handleSave = async () => {
    const entryId = editingItem ? String(editingItem.id) : Date.now().toString();
    // 統一確保儲存時 tag 欄位有值，這裡同時儲存 category 以利顯示
    const newEntry = { ...formData, id: entryId };

    try {
      await setDoc(doc(db, "entries", entryId), newEntry);
      onClose();
    } catch (error) {
      console.error("寫入資料失敗: ", error);
      alert("儲存失敗，請檢查網路連線");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B9080]/30 focus:border-[#6B9080] outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3A4F3F]">新增百科資料</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">✕</button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[#A39284] uppercase tracking-wider mb-2 block">分類</label>
            <select className={inputClass} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option>精油</option><option>穴道</option><option>中藥</option><option>方劑</option>
            </select>
          </div>
          
          <input placeholder="名稱" value={formData.name || ''} className={inputClass} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <input 
            placeholder="標籤 (例如：解表、清熱)" 
            value={formData.tag || ''} 
            className={inputClass}
            onChange={(e) => setFormData({...formData, tag: e.target.value})} 
          />
          
          <textarea placeholder="簡介描述" value={formData.description || ''} className={`${inputClass} h-24`} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
        {formData.category === '精油' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <input placeholder="別名" value={formData.alias || ''} className={inputClass} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
            <input placeholder="科名" value={formData.family || ''} className={inputClass} onChange={(e) => setFormData({...formData, family: e.target.value})} />
            <input placeholder="性味" value={formData.oilDetails?.nature || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, nature: e.target.value }})} />
            <input placeholder="五行/陰陽" value={formData.oilDetails?.fiveElements || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, fiveElements: e.target.value }})} />
            <input placeholder="歸經" value={formData.oilDetails?.meridian || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, meridian: e.target.value }})} />
            <input placeholder="通用體質" value={formData.oilDetails?.constitution || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, constitution: e.target.value }})} />
            <input placeholder="類比音符" value={formData.oilDetails?.note || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, note: e.target.value }})} />
            <input placeholder="主宰星球" value={formData.oilDetails?.planet || ''} className={inputClass} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, planet: e.target.value }})} />
            <input placeholder="重要產地" value={formData.oilTable?.origin || ''} className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, oilTable: { ...formData.oilTable, origin: e.target.value }})} />
            <input placeholder="屬性" value={formData.chemicalTag || ''} className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, chemicalTag: e.target.value})} />
            <textarea placeholder="外觀描述" value={formData.oilDetails?.appearance || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, appearance: e.target.value }})} />
            <textarea placeholder="應用歷史與相關神話" value={formData.oilDetails?.history || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, history: e.target.value }})} />
            <textarea placeholder="注意事項" value={formData.oilDetails?.precautions || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, precautions: e.target.value }})} />
            <textarea placeholder="適合與之調和的精油" value={formData.oilDetails?.blending || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, blending: e.target.value }})} />
            <textarea placeholder="精油配方" value={formData.oilDetails?.formula || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, formula: e.target.value }})} />
            <textarea placeholder="按摩基底油" value={formData.oilDetails?.carrierOil || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, carrierOil: e.target.value }})} />
            <textarea placeholder="使用方法" value={formData.oilDetails?.usage || ''} className={`${inputClass} col-span-2 h-16`} onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, usage: e.target.value }})} />
          </div>
        )}

        {formData.category === '穴道' && (
          <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-[#3A4F3F] text-sm">穴道核心表格資訊</h3>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="國際代碼" value={formData.acuTable?.code || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, code: e.target.value }})} />
              <input placeholder="經絡" value={formData.acuTable?.meridian || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, meridian: e.target.value }})} />
              <input placeholder="別名" value={formData.acuTable?.alias || ''} className="col-span-2 p-2 border rounded" onChange={(e) => setFormData({...formData, acuTable: { ...formData.acuTable, alias: e.target.value }})} />
            </div>
            <textarea placeholder="位置" value={formData.acuDetails?.location || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, location: e.target.value }})} />
            <textarea placeholder="主治" value={formData.acuDetails?.indications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, indications: e.target.value }})} />
          </div>
        )}

        {formData.category === '中藥' && (
  <div className="space-y-3 mb-4">
    <div className="grid grid-cols-2 gap-3">
      <input placeholder="別名" value={formData.alias || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, alias: e.target.value})} />
      <input placeholder="科屬" value={formData.family || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, family: e.target.value})} />
      
      {/* 拆分為兩個獨立欄位 */}
      <input placeholder="性味" value={formData.nature || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, nature: e.target.value})} />
      <input placeholder="歸經" value={formData.meridian || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, meridian: e.target.value})} />
    </div>
    
    <textarea placeholder="品種來源" value={formData.source || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, source: e.target.value})} />
    <textarea placeholder="功效" value={formData.effect || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, effect: e.target.value})} />
    <textarea placeholder="主治" value={formData.indications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, indications: e.target.value})} />
    <textarea placeholder="用法用量" value={formData.dosage || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, dosage: e.target.value})} />
    <textarea placeholder="現代藥理" value={formData.pharmacology || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, pharmacology: e.target.value})} />
    <textarea placeholder="文獻別錄" value={formData.literature || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, literature: e.target.value})} />
    <textarea placeholder="注意禁忌" value={formData.contraindication || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, contraindication: e.target.value})} />
    <textarea placeholder="附藥說明" value={formData.contraindication || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, directions: e.target.value})} />
    <textarea placeholder="註" value={formData.note || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, note: e.target.value})} />
  </div>
)}
        {formData.category === '方劑' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="來源" value={formData.source || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, source: e.target.value})} />
              <input placeholder="整體功效" value={formData.effect || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, effect: e.target.value})} />
            </div>
            <textarea placeholder="製法用量" value={formData.preparation || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, preparation: e.target.value})} />
            <textarea placeholder="主治" value={formData.indications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, indications: e.target.value})} />
            <textarea placeholder="方義" value={formData.analysis || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, analysis: e.target.value})} />
            <textarea placeholder="方論" value={formData.discussion || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, discussion: e.target.value})} />
            <textarea placeholder="辨證要點" value={formData.syndrome || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, syndrome: e.target.value})} />
            <textarea placeholder="加減" value={formData.modifications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, modifications: e.target.value})} />
            <textarea placeholder="注意禁忌" value={formData.contraindication || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, contraindication: e.target.value})} />
            <textarea placeholder="現代應用" value={formData.modernApp || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, modernApp: e.target.value})} />
          </div>
        )}
        </div>
        
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2.5 text-[#A39284] font-medium hover:text-[#3A4F3F] transition-colors">取消</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-[#3A4F3F] text-white rounded-xl font-bold hover:bg-[#2c3d31] shadow-lg shadow-[#3A4F3F]/20 transition-all">儲存資料</button>
        </div>
      </div>
    </div>
  );
}