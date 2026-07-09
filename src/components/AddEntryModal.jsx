import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // 引入你的 Firebase 設定
import { doc, setDoc } from 'firebase/firestore'; // 引入寫入功能

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
    if (editingItem) {
      setFormData(editingItem);
    }
  }, [editingItem]);

  const handleSave = async () => {
    // 建立新 ID 或沿用舊 ID
    const entryId = editingItem ? String(editingItem.id) : Date.now().toString();
    
    const newEntry = {
      ...formData,
      id: entryId,
      tag: formData.category === '穴道' ? (formData.acuTable?.meridian || '') : formData.tag,
      acuTable: formData.acuTable || { code: '', meridian: '', alias: '' },
      acuDetails: formData.acuDetails || { location: '', operation: '', indications: '' },
      oilTable: formData.oilTable || {},
      oilDetails: formData.oilDetails || {}
    };

    try {
      // 存入 Firestore 的 'entries' 集合
      await setDoc(doc(db, "entries", entryId), newEntry);
      onClose();
    } catch (error) {
      console.error("寫入資料失敗: ", error);
      alert("儲存失敗，請檢查網路連線");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto text-[15px]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-[#3A4F3F]">新增百科資料</h2>
        
        <select className="w-full mb-4 p-2 border rounded" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
          <option>精油</option><option>穴道</option><option>中藥</option><option>方劑</option>
        </select>
        
        <input placeholder="名稱" value={formData.name || ''} className="w-full mb-3 p-2 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        
        {formData.category !== '穴道' && (
          <input placeholder="通用標籤 (Tag)" value={formData.tag || ''} className="w-full mb-3 p-2 border rounded" onChange={(e) => setFormData({...formData, tag: e.target.value})} />
        )}
        
        <textarea placeholder="簡介描述" value={formData.description || ''} className="w-full mb-3 p-2 border rounded h-16" onChange={(e) => setFormData({...formData, description: e.target.value})} />

        {/* --- 根據分類動態渲染的欄位 --- */}
        {formData.category === '精油' && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="體質標籤" value={formData.constitutionTag || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, constitutionTag: e.target.value})} />
              <input placeholder="化學屬性" value={formData.chemicalTag || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, chemicalTag: e.target.value})} />
              <input placeholder="英文名稱" value={formData.englishName || ''} className="col-span-2 p-2 border rounded" onChange={(e) => setFormData({...formData, englishName: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg">
              <input placeholder="拉丁學名" value={formData.oilTable?.latin || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, oilTable: { ...formData.oilTable, latin: e.target.value }})} />
              <input placeholder="萃取部位" value={formData.oilTable?.typePart || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, oilTable: { ...formData.oilTable, typePart: e.target.value }})} />
              <input placeholder="主治功能" value={formData.oilTable?.indications || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, oilTable: { ...formData.oilTable, indications: e.target.value }})} />
            </div>
            <textarea placeholder="氣味描述" value={formData.oilDetails?.scent || ''} className="w-full p-2 border rounded h-20" onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, scent: e.target.value }})} />
            <textarea placeholder="化學結構" value={formData.oilDetails?.chemistry || ''} className="w-full p-2 border rounded h-20" onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, chemistry: e.target.value }})} />
            <textarea placeholder="心靈療效" value={formData.oilDetails?.mindEffect || ''} className="w-full p-2 border rounded h-20" onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, mindEffect: e.target.value }})} />
            <textarea placeholder="身體療效" value={formData.oilDetails?.bodyEffect || ''} className="w-full p-2 border rounded h-20" onChange={(e) => setFormData({...formData, oilDetails: { ...formData.oilDetails, bodyEffect: e.target.value }})} />
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
            <textarea placeholder="類別" value={formData.acuDetails?.type || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, type: e.target.value }})} />
            <textarea placeholder="位置" value={formData.acuDetails?.location || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, location: e.target.value }})} />
            <textarea placeholder="主治" value={formData.acuDetails?.indications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, acuDetails: { ...formData.acuDetails, indications: e.target.value }})} />
          </div>
        )}

        {formData.category === '中藥' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="別名" value={formData.alias || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, alias: e.target.value})} />
              <input placeholder="科屬" value={formData.family || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, family: e.target.value})} />
              <input placeholder="性味歸經" value={formData.nature || ''} className="p-2 border rounded" onChange={(e) => setFormData({...formData, nature: e.target.value})} />
            </div>
            <textarea placeholder="品種來源" value={formData.source || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, source: e.target.value})} />
            <textarea placeholder="功效" value={formData.effect || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, effect: e.target.value})} />
            <textarea placeholder="主治" value={formData.indications || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, indications: e.target.value})} />
            <textarea placeholder="用法用量" value={formData.dosage || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, dosage: e.target.value})} />
            <textarea placeholder="現代藥理" value={formData.pharmacology || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, pharmacology: e.target.value})} />
            <textarea placeholder="文獻別錄" value={formData.literature || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, literature: e.target.value})} />
            <textarea placeholder="注意禁忌" value={formData.contraindication || ''} className="w-full p-2 border rounded h-16" onChange={(e) => setFormData({...formData, contraindication: e.target.value})} />
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
        
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#3A4F3F] text-white rounded">儲存資料</button>
        </div>
      </div>
    </div>
  );
}