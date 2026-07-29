import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import BookStructureEditor from './BookStructureEditor';

const normalizeText = (v = '') =>
  String(v)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getEntryKey = (category = '', name = '') =>
  `${normalizeText(category)}__${normalizeText(name)}`;

const getDefaultFormData = () => ({
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
  property: '',
  planet: '',
  origin: '',
  noteAnalogy: '',
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
  entryKey: '',
  searchKey: '',
  createdAt: '',
  updatedAt: '',
});

const getFriendlyTransactionError = (error) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  if (code.includes('aborted') || message.includes('too much contention')) {
    return '目前資料正在被其他人更新，請稍後再試。';
  }
  if (code.includes('permission-denied') || code.includes('permissiondenied')) {
    return '你沒有儲存這筆資料的權限。';
  }
  if (code.includes('failed-precondition') || code.includes('failedprecondition')) {
    return '資料狀態不符合儲存條件，請重新整理後再試。';
  }
  if (code.includes('resource-exhausted') || code.includes('resourceexhausted')) {
    return '目前系統資源不足，請稍後再試。';
  }
  if (code.includes('unauthenticated')) {
    return '請先登入後再儲存。';
  }
  return '儲存失敗，請稍後再試一次。';
};

function toObjectArrays(obj) {
  if (Array.isArray(obj)) {
    const newObj = {};
    obj.forEach((item, index) => {
      newObj[index.toString()] = toObjectArrays(item);
    });
    return newObj;
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) newObj[key] = toObjectArrays(obj[key]);
    return newObj;
  }
  return obj;
}

function convertObjectsToArrays(obj) {
  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    const isArrayLike = keys.length > 0 && keys.every((key) => !isNaN(key));

    if (isArrayLike) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => convertObjectsToArrays(obj[key]));
    }

    const newObj = {};
    for (const key in obj) newObj[key] = convertObjectsToArrays(obj[key]);
    return newObj;
  }
  return obj;
}

export default function AddEntryPage({ onClose, editingItem, isViewOnly = false }) {
  const contentRef = useRef(null);
  const [lastNodeId, setLastNodeId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    if (!editingItem) {
      setFormData(getDefaultFormData());
      setSaveError('');
      return;
    }

    const normalized = convertObjectsToArrays(editingItem);

    setFormData({
      ...getDefaultFormData(),
      ...normalized,
      category: editingItem.category || '精油',
      name: editingItem.name || '',
      bookDetails: {
        author: editingItem?.bookDetails?.author || '',
        chapters: Array.isArray(editingItem?.bookDetails?.chapters)
          ? editingItem.bookDetails.chapters
          : [],
      },
      acuTable: {
        code: editingItem?.acuTable?.code || '',
        meridian: editingItem?.acuTable?.meridian || '',
        alias: editingItem?.acuTable?.alias || '',
      },
      acuDetails: {
        ...getDefaultFormData().acuDetails,
        ...(editingItem?.acuDetails || {}),
      },
      oilDetails: {
        ...getDefaultFormData().oilDetails,
        ...(editingItem?.oilDetails || {}),
      },
      entryKey:
        editingItem?.entryKey ||
        getEntryKey(editingItem?.category || '', editingItem?.name || ''),
      searchKey: editingItem?.searchKey || '',
      createdAt: editingItem?.createdAt || '',
      updatedAt: editingItem?.updatedAt || '',
    });
    setSaveError('');
  }, [editingItem]);

  const addNode = useCallback((path = []) => {
    const newNode = {
      id: `sub_${Date.now()}`,
      title: '',
      type: 'content',
      text: '',
      children: [],
    };

    setFormData((prev) => {
      const newChapters = JSON.parse(JSON.stringify(prev.bookDetails.chapters || []));

      if (path.length === 0) {
        newChapters.push(newNode);
      } else {
        let target = newChapters;
        for (let i = 0; i < path.length; i++) target = target[path[i]];
        if (target.type === 'folder') {
          if (!target.children) target.children = [];
          target.children.push(newNode);
        } else {
          target.type = 'folder';
          target.children = [newNode];
        }
      }

      return {
        ...prev,
        bookDetails: { ...prev.bookDetails, chapters: newChapters },
      };
    });

    setLastNodeId(`node_${Date.now()}`);
  }, []);

  const inputClass = `w-full px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#3A4F3F]/10 focus:border-[#3A4F3F] outline-none transition-all ${isViewOnly ? 'opacity-70 cursor-not-allowed' : ''}`;
  const labelClass = 'text-[11px] font-bold text-[#A39284] uppercase tracking-widest mb-1.5 block';
  const textareaClass = `${inputClass} h-24`;

  const getValueByPath = useCallback((obj, path) => {
    const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
    return value ?? '';
  }, []);

  const updateValueByPath = useCallback((path, value) => {
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
  }, []);

  const renderField = useCallback((label, path, placeholder = '', isTextarea = false) => (
    <div>
      <label className={labelClass}>{label}</label>
      {isTextarea ? (
        <textarea
          disabled={isViewOnly || isSaving}
          className={textareaClass}
          value={getValueByPath(formData, path)}
          placeholder={placeholder}
          onChange={(e) => updateValueByPath(path, e.target.value)}
        />
      ) : (
        <input
          disabled={isViewOnly || isSaving}
          className={inputClass}
          value={getValueByPath(formData, path)}
          placeholder={placeholder}
          onChange={(e) => updateValueByPath(path, e.target.value)}
        />
      )}
    </div>
  ), [formData, getValueByPath, updateValueByPath, isViewOnly, isSaving]);

  const handleSave = useCallback(async () => {
    if (isSaving || isViewOnly) return;
    setSaveError('');

    const category = formData.category?.trim();
    const name = formData.name?.trim();

    if (!name) {
      setSaveError('請至少填寫名稱！');
      return;
    }
    if (!category) {
      setSaveError('請至少填寫分類與名稱！');
      return;
    }

    setIsSaving(true);

    try {
      const newEntryKey = getEntryKey(category, name);
      const oldEntryKey =
        editingItem?.entryKey ||
        getEntryKey(editingItem?.category || '', editingItem?.name || '');
      const isEditing = !!editingItem;
      const isKeyChanged = isEditing && newEntryKey !== oldEntryKey;

      const newKeyRef = doc(db, 'entryKeys', newEntryKey);
      const newEntryRef = doc(db, 'entries', newEntryKey);
      const oldKeyRef = doc(db, 'entryKeys', oldEntryKey);
      const oldEntryRef = doc(db, 'entries', oldEntryKey);

      const cleanData = toObjectArrays(formData);
      const now = Date.now();

      await runTransaction(db, async (transaction) => {
        const newKeySnap = await transaction.get(newKeyRef);

        if (!isEditing) {
          if (newKeySnap.exists()) {
            throw new Error('已有相同分類與名稱的百科資料');
          }

          const newEntry = {
            ...cleanData,
            id: newEntryKey,
            entryKey: newEntryKey,
            searchKey: normalizeText(
              `${category} ${name} ${formData.alias || ''} ${formData.englishName || ''}`
            ),
            createdAt: now,
            updatedAt: now,
            name,
            category,
          };

          transaction.set(newKeyRef, {
            entryKey: newEntryKey,
            entryId: newEntryKey,
            category,
            name,
            createdAt: now,
            updatedAt: now,
          });

          transaction.set(newEntryRef, newEntry);
          return;
        }

        const oldEntrySnap = await transaction.get(oldEntryRef);
        if (!oldEntrySnap.exists()) {
          throw new Error('找不到原始資料，請重新整理後再試。');
        }

        const baseCreatedAt = oldEntrySnap.data()?.createdAt || editingItem?.createdAt || now;

        const newEntry = {
          ...cleanData,
          id: newEntryKey,
          entryKey: newEntryKey,
          searchKey: normalizeText(
            `${category} ${name} ${formData.alias || ''} ${formData.englishName || ''}`
          ),
          createdAt: baseCreatedAt,
          updatedAt: now,
          name,
          category,
        };

        if (!isKeyChanged) {
          transaction.set(newKeyRef, {
            entryKey: newEntryKey,
            entryId: newEntryKey,
            category,
            name,
            createdAt: baseCreatedAt,
            updatedAt: now,
          });

          transaction.set(newEntryRef, newEntry);
          return;
        }

        if (newKeySnap.exists()) {
          throw new Error('已存在相同分類與名稱的百科資料');
        }

        transaction.set(newKeyRef, {
          entryKey: newEntryKey,
          entryId: newEntryKey,
          category,
          name,
          createdAt: baseCreatedAt,
          updatedAt: now,
        });

        transaction.set(newEntryRef, newEntry);
        transaction.delete(oldKeyRef);
        transaction.delete(oldEntryRef);
      });

      alert(editingItem ? '✅ 資料已成功更新！' : '✅ 資料已成功儲存！');
      onClose();
    } catch (error) {
      console.error('寫入資料失敗: ', error);
      setSaveError(getFriendlyTransactionError(error));
    } finally {
      setIsSaving(false);
    }
  }, [editingItem, formData, isSaving, isViewOnly, onClose]);

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
              disabled={isSaving}
              className="px-8 py-2 bg-[#3A4F3F] text-white rounded-full font-bold hover:bg-[#2C3C30] shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? '儲存中...' : '儲存資料'}
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
                    disabled={isViewOnly || isSaving}
                    className={inputClass}
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
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
                    disabled={isViewOnly || isSaving}
                    placeholder="輸入名稱"
                    value={formData.name}
                    className={inputClass}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {formData.category === '書籍' && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>作者 / 編著</label>
                    <input
                      disabled={isViewOnly || isSaving}
                      placeholder="輸入作者 / 編著"
                      value={formData.bookDetails.author}
                      className={inputClass}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bookDetails: { ...prev.bookDetails, author: e.target.value },
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="w-full mb-6">
                <label className={labelClass}>簡介描述</label>
                <textarea
                  disabled={isViewOnly || isSaving}
                  placeholder="簡介描述"
                  value={formData.description}
                  className={textareaClass}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {!['穴道', '精油'].includes(formData.category) && (
                <div className="mb-6">
                  <label className={labelClass}>核心標籤</label>
                  <input
                    disabled={isViewOnly || isSaving}
                    placeholder="例如：解表、清熱"
                    value={formData.tag}
                    className={inputClass}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                  />
                </div>
              )}

              {formData.category === '書籍' && (
                <div className="max-h-[60vh] overflow-y-auto pr-6 pl-1 border-r border-[#E5E0D8]/30 [scrollbar-gutter:stable]">
                  <BookStructureEditor
                    formData={formData}
                    setFormData={setFormData}
                    labelClass={labelClass}
                    inputClass={inputClass}
                    addNode={addNode}
                    lastNodeId={lastNodeId}
                    disabled={isViewOnly || isSaving}
                    isViewOnly={isViewOnly || isSaving}
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
                          disabled={isViewOnly || isSaving}
                          placeholder="體質標籤"
                          value={formData.constitutionTag}
                          className={inputClass}
                          onChange={(e) => setFormData((prev) => ({ ...prev, constitutionTag: e.target.value }))}
                        />
                        <input
                          disabled={isViewOnly || isSaving}
                          placeholder="化學屬性標籤"
                          value={formData.chemicalTag}
                          className={inputClass}
                          onChange={(e) => setFormData((prev) => ({ ...prev, chemicalTag: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
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

            {saveError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {saveError}
              </div>
            )}

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
                  disabled={isSaving}
                  className="px-10 py-3 bg-[#3A4F3F] text-white rounded-2xl font-fttf hover:bg-[#2C3C30] shadow-xl shadow-[#3A4F3F]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? '儲存中...' : '儲存資料'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}