import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import BookStructureEditor from './BookStructureEditor';

const normalizeText = (v = '') =>
  String(v).trim().toLowerCase().replace(/\s+/g, ' ');

const getEntryKey = (data) => {
  const category = normalizeText(data.category);
  const name = normalizeText(data.name);
  return `${category}__${name}`;
};

export default function AddEntryPage({ onClose, editingItem, isViewOnly = false }) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    category: '精油',
    name: '',
    tag: '',
    description: '',
    englishName: '',
    constitutionTag: '',
    chemicalTag: '',
    alias: '',
    source: '',
    effect: '',
    indications: '',
    literature: '',
    contraindication: '',
    note: '',
    family: '',
    nature: '',
    meridian: '',
    traits: '',
    dosage: '',
    pharmacology: '',
    contemporary: '',
    medicine: '',
    preparation: '',
    directions: '',
    analysis: '',
    discussion: '',
    syndrome: '',
    modifications: '',
    modernApp: '',
    modernPharmacology: '',
    prescription: '',
    typePart: '',
    method: '',
    latin: '',
    property: '',
    noteAnalogy: '',
    planet: '',
    origin: '',
    acuTable: { code: '', meridian: '', alias: '' },
    acuDetails: {
      location: '',
      operation: '',
      indications: '',
      type: '',
      nameExpl: '',
      anatomy: '',
      effectAncient: '',
      effectModern: '',
      matchingPoints: '',
    },
    oilDetails: {
      scent: '',
      appearance: '',
      historyMyth: '',
      chemistry: '',
      attribute: '',
      caution: '',
      mindEffect: '',
      bodyEffect: '',
      skinEffect: '',
      blendingOils: '',
      formulas: '',
      carrierOil: '',
      usage: '',
    },
    bookDetails: { author: '', chapters: [] },
  });

  useEffect(() => {
    if (!editingItem) return;

    const normalizeImportedData = (obj) => {
      if (Array.isArray(obj)) return obj.map(normalizeImportedData);
      if (obj !== null && typeof obj === 'object') {
        const next = {};
        for (const key in obj) next[key] = normalizeImportedData(obj[key]);
        return next;
      }
      return obj;
    };

    setFormData((prev) => ({
      ...prev,
      ...normalizeImportedData(editingItem),
      bookDetails: {
        author: editingItem?.bookDetails?.author || '',
        chapters: Array.isArray(editingItem?.bookDetails?.chapters)
          ? editingItem.bookDetails.chapters
          : [],
      },
    }));
  }, [editingItem]);

  const inputClass = `w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#3A4F3F]/10 focus:border-[#3A4F3F] outline-none transition-all ${isViewOnly ? 'opacity-70 cursor-not-allowed' : ''}`;
  const labelClass = 'text-[11px] font-bold text-[#A39284] uppercase tracking-widest mb-1.5 block';
  const textareaClass = `${inputClass} h-24`;

  const getValueByPath = (obj, path) => {
    const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
    return value ?? '';
  };

  const updateValueByPath = (path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const next = { ...prev };
      let cur = next;

      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }

      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const renderField = (label, path, placeholder = '', isTextarea = false) => (
    <div>
      <label className={labelClass}>{label}</label>
      {isTextarea ? (
        <textarea
          disabled={isViewOnly}
          className={textareaClass}
          value={getValueByPath(formData, path)}
          placeholder={placeholder}
          onChange={(e) => updateValueByPath(path, e.target.value)}
        />
      ) : (
        <input
          disabled={isViewOnly}
          className={inputClass}
          value={getValueByPath(formData, path)}
          placeholder={placeholder}
          onChange={(e) => updateValueByPath(path, e.target.value)}
        />
      )}
    </div>
  );

  const handleSave = async () => {
    if (!formData.name?.trim()) return alert('請至少填寫名稱！');

    const entryKey = getEntryKey(formData);
    if (!entryKey || entryKey === '__') return alert('名稱或分類無效！');

    const entryId = editingItem?.id ? String(editingItem.id) : entryKey;

    try {
      if (!editingItem) {
        const snap = await getDoc(doc(db, 'entries', entryId));
        if (snap.exists()) {
          alert('已有相同分類與名稱的百科資料，請修改名稱後再儲存。');
          return;
        }
      }

      const newEntry = {
        ...formData,
        id: entryId,
        entryKey,
        updatedAt: Date.now(),
        createdAt: editingItem?.createdAt || Date.now(),
      };

      await setDoc(doc(db, 'entries', entryId), newEntry, { merge: true });
      alert(editingItem ? '✅ 資料已成功更新！' : '✅ 資料已成功建立！');
      onClose();
    } catch (error) {
      console.error('寫入資料失敗: ', error);
      alert('儲存失敗，請檢查控制台錯誤訊息。');
    }
  };

  return (
    <div ref={contentRef} className="w-screen h-dvh bg-[#FBF9F6] flex flex-col overflow-hidden">
      <header className="shrink-0 px-6 md:px-10 py-5 border-b border-[#E5E0D8] bg-[#FBF9F6] flex items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-[#3A4F3F]">
          {isViewOnly
            ? `檢視：${formData.name || '百科資料'}`
            : editingItem
              ? '編輯百科資料'
              : '新增百科資料'}
        </h2>

        <div className="flex gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[#A39284] font-bold hover:text-[#3A4F3F] transition-colors"
          >
            {isViewOnly ? '關閉' : '取消'}
          </button>

          {!isViewOnly && (
            <button
              onClick={handleSave}
              className="px-8 py-2 bg-[#3A4F3F] text-white rounded-full font-bold hover:bg-[#2C3C30] shadow-lg transition-all"
            >
              儲存資料
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 md:px-10 py-6 [scrollbar-gutter:stable]">
          <div className="w-full space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5E0D8]/60 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>分類</label>
                  <select
                    disabled={isViewOnly}
                    className={inputClass}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="書籍">書籍</option>
                    <option value="精油">精油</option>
                    <option value="穴道">穴道</option>
                    <option value="中藥">中藥</option>
                    <option value="方劑">方劑</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>名稱</label>
                  <input
                    disabled={isViewOnly}
                    placeholder="輸入名稱"
                    value={formData.name}
                    className={inputClass}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {formData.category === '書籍' && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>作者 / 編著</label>
                    <input
                      disabled={isViewOnly}
                      placeholder="輸入作者 / 編著"
                      value={formData.bookDetails.author}
                      className={inputClass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookDetails: { ...formData.bookDetails, author: e.target.value },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="w-full mb-6">
                <label className={labelClass}>簡介描述</label>
                <textarea
                  disabled={isViewOnly}
                  placeholder="簡介描述"
                  value={formData.description}
                  className={textareaClass}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {!['穴道', '精油'].includes(formData.category) && (
                <div className="mb-6">
                  <label className={labelClass}>核心標籤</label>
                  <input
                    disabled={isViewOnly}
                    placeholder="例如：解表、清熱"
                    value={formData.tag}
                    className={inputClass}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  />
                </div>
              )}

              {formData.category === '書籍' && (
                <div className="max-h-[60vh] overflow-y-auto pr-6 pl-1 border-r border-[#E5E0D8]/30 [scrollbar-gutter:stable]">
                  <BookStructureEditor
                    formData={formData}
                    setFormData={setFormData}
                    disabled={isViewOnly}
                    isViewOnly={isViewOnly}
                  />
                </div>
              )}

              {formData.category === '精油' && (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500">
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#E5E0D8]/50 shadow-sm">
                    <span className="col-span-1 md:col-span-2 font-bold text-[#3A4F3F] text-sm border-b border-[#E5E0D8] pb-1.5 mb-1">
                      📊 基本屬性資料
                    </span>
                    <div className="col-span-1 md:col-span-2">
                      <label className={labelClass}>適用體質與化學屬性標籤</label>
                      <div className="flex gap-2">
                        <input
                          disabled={isViewOnly}
                          placeholder="體質標籤"
                          value={formData.constitutionTag}
                          className={inputClass}
                          onChange={(e) => setFormData({ ...formData, constitutionTag: e.target.value })}
                        />
                        <input
                          disabled={isViewOnly}
                          placeholder="化學屬性標籤"
                          value={formData.chemicalTag}
                          className={inputClass}
                          onChange={(e) => setFormData({ ...formData, chemicalTag: e.target.value })}
                        />
                      </div>
                    </div>

                    {renderField('別名', 'alias')}
                    {renderField('植物種類／萃取部位', 'typePart')}
                    {renderField('萃取方法', 'method')}
                    {renderField('外文名', 'englishName')}
                    {renderField('拉丁學名', 'latin')}
                    {renderField('科名', 'family')}
                    {renderField('性味', 'nature')}
                    {renderField('五行／陰陽屬性', 'property')}
                    {renderField('歸經', 'meridian')}
                    {renderField('主治', 'indications')}
                    {renderField('類比音符', 'noteAnalogy')}
                    {renderField('主宰星球', 'planet')}
                    {renderField('重要產地', 'origin')}
                  </div>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('🔍 氣味', 'oilDetails.scent', '', true)}
                    {renderField('✨ 外觀描述', 'oilDetails.appearance', '', true)}
                    {renderField('📜 應用歷史與相關神話', 'oilDetails.historyMyth', '', true)}
                    {renderField('🔬 化學結構', 'oilDetails.chemistry', '', true)}
                    {renderField('⚖️ 屬性補充', 'oilDetails.attribute', '', true)}
                    {renderField('⚠️ 注意事項', 'oilDetails.caution', '', true)}
                    {renderField('心靈療效', 'oilDetails.mindEffect', '', true)}
                    {renderField('身體療效', 'oilDetails.bodyEffect', '', true)}
                    {renderField('皮膚療效', 'oilDetails.skinEffect', '', true)}
                    {renderField('適合調和的精油', 'oilDetails.blendingOils', '', true)}
                    {renderField('精油配方', 'oilDetails.formulas', '', true)}
                    {renderField('按摩基底油', 'oilDetails.carrierOil', '', true)}
                    {renderField('使用方法', 'oilDetails.usage', '', true)}
                  </div>
                </div>
              )}

              {formData.category === '穴道' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('國際代碼', 'acuTable.code')}
                    {renderField('經絡', 'acuTable.meridian')}
                  </div>
                  {renderField('別名', 'acuTable.alias')}
                  {renderField('主治', 'acuDetails.indications', '', true)}
                  {renderField('類別', 'acuDetails.type', '', true)}
                  {renderField('釋名', 'acuDetails.nameExpl', '', true)}
                  {renderField('位置', 'acuDetails.location', '', true)}
                  {renderField('解剖', 'acuDetails.anatomy', '', true)}
                  {renderField('操作', 'acuDetails.operation', '', true)}
                  {renderField('古代功效', 'acuDetails.effectAncient', '', true)}
                  {renderField('現代功效', 'acuDetails.effectModern', '', true)}
                  {renderField('配穴', 'acuDetails.matchingPoints', '', true)}
                </div>
              )}

              {formData.category === '中藥' && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    {renderField('別名', 'alias')}
                    {renderField('科屬', 'family')}
                    {renderField('性味', 'nature')}
                    {renderField('歸經', 'meridian')}
                  </div>
                  {renderField('品種來源', 'source', '', true)}
                  {renderField('性狀', 'traits', '', true)}
                  {renderField('功效', 'effect', '', true)}
                  {renderField('主治', 'indications', '', true)}
                  {renderField('用法用量', 'dosage', '', true)}
                  {renderField('現代藥理', 'pharmacology', '', true)}
                  {renderField('現代應用', 'contemporary', '', true)}
                  {renderField('選方', 'medicine', '', true)}
                  {renderField('文獻別錄', 'literature', '', true)}
                  {renderField('注意禁忌', 'contraindication', '', true)}
                  {renderField('炮製儲藏', 'preparation', '', true)}
                  {renderField('附藥說明', 'directions', '', true)}
                  {renderField('註', 'note', '', true)}
                </div>
              )}

              {formData.category === '方劑' && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    {renderField('別名', 'alias')}
                    {renderField('來源', 'source')}
                    {renderField('功效', 'effect')}
                  </div>
                  {renderField('製法用量', 'preparation', '', true)}
                  {renderField('主治', 'indications', '', true)}
                  {renderField('文獻別錄', 'literature', '', true)}
                  {renderField('方義', 'analysis', '', true)}
                  {renderField('方論', 'discussion', '', true)}
                  {renderField('辨證要點', 'syndrome', '', true)}
                  {renderField('加減', 'modifications', '', true)}
                  {renderField('注意禁忌', 'contraindication', '', true)}
                  {renderField('現代應用', 'modernApp', '', true)}
                  {renderField('現代藥理', 'modernPharmacology', '', true)}
                  {renderField('附方', 'prescription', '', true)}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 py-6">
              <button
                onClick={onClose}
                className="px-8 py-3 text-[#A39284] font-fttf hover:text-[#3A4F3F] transition-colors"
              >
                {isViewOnly ? '關閉' : '取消'}
              </button>
              {!isViewOnly && (
                <button
                  onClick={handleSave}
                  className="px-10 py-3 bg-[#3A4F3F] text-white rounded-2xl font-fttf hover:bg-[#2C3C30] shadow-xl shadow-[#3A4F3F]/20 transition-all"
                >
                  儲存資料
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}