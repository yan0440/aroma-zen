/**
 * 百科資料編輯頁
 *
 * 作用：
 * - 新增百科資料
 * - 編輯既有百科資料
 * - 檢視百科資料
 * - 依分類顯示不同欄位
 * - 呼叫 AI 圖片匯入功能
 */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import BookStructureEditor from '../components/BookStructureEditor';
import KnowledgeStructureEditor from '../components/KnowledgeStructureEditor';
import AiImageImporter from '../components/AiImageImporter';

import {
  getDefaultFormData,
} from '../utils/addEntryDefaults';

import {
  convertObjectsToArrays,
  getEntryKey,
  normalizeArray,
  normalizeChapters,
  normalizeText,
  removeFirestoreFields,
} from '../utils/addEntryUtils';

import {
  saveEntry,
} from '../services/addEntryFirestore';


const getFriendlyTransactionError = (error) => {
  const code = String(
    error?.code || ''
  ).toLowerCase();

  const message = String(
    error?.message || ''
  ).toLowerCase();

  if (code.includes('aborted') || message.includes('too much contention')
  ) {
    return '目前資料正在被其他人更新，請稍後再試。';
  }
  if (code.includes('permission-denied') || code.includes('permissiondenied')
  ) {
    return '你沒有儲存這筆資料的權限。';
  }

  if (
    code.includes('failed-precondition') ||
    code.includes('failedprecondition')
  ) {
    return '資料狀態不符合儲存條件，請重新整理後再試。';
  }

  if (code.includes('resource-exhausted') ||code.includes('resourceexhausted')
  ) {
    return '目前系統資源不足，請稍後再試。';
  }

  if (code.includes('unauthenticated')) {
    return '請先登入後再儲存。';
  }

  return '儲存失敗，請稍後再試一次。';
};


export default function AddEntryPage({
  onClose,
  onSaved,
  editingItem,
  isViewOnly = false,
  closeLabel = '',
}) {
  const contentRef = useRef(null);
const originalDocumentIdRef = useRef('');
const originalEntryKeyRef = useRef('');

  const [lastNodeId, setLastNodeId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());
  const resolvedCloseLabel = closeLabel ||
    (isViewOnly ? '關閉' : '取消');

  useEffect(() => {
  if (!editingItem) {
  originalDocumentIdRef.current = '';
  originalEntryKeyRef.current = '';

  setFormData(
    getDefaultFormData()
  );
  setLastNodeId(null);
  setSaveError('');
  return;
}

  const originalDocumentId = editingItem?.documentId || editingItem?.firestoreId || editingItem?.id || '';
  const originalEntryKey = editingItem?.entryKey || getEntryKey(editingItem?.category || '', editingItem?.name || '');

originalDocumentIdRef.current =
  originalDocumentId;

originalEntryKeyRef.current =
  originalEntryKey;

const editingData =
  removeFirestoreFields(
    editingItem
  );

const normalized =
  convertObjectsToArrays(
    editingData
  ) || {};

  const defaultData =
    getDefaultFormData();

  const normalizedBookDetails =
    normalized.bookDetails &&
    typeof normalized.bookDetails ===
      'object'
      ? normalized.bookDetails
      : {};

  const normalizedKnowledgeDetails =
    normalized.knowledgeDetails &&
    typeof normalized.knowledgeDetails ===
      'object'
      ? normalized.knowledgeDetails
      : {};

  const normalizedChapters =
    normalizeChapters(
      normalizedBookDetails.chapters
    );

  const normalizedSections =
    normalizeArray(
      normalizedKnowledgeDetails.sections
    );

  const nextFormData = {
    ...defaultData,
    ...normalized,

    category:
      normalized.category ||
      '精油',

    name:
      normalized.name ||
      '',

    bookDetails: {
      ...defaultData.bookDetails,
      ...normalizedBookDetails,

      author:
        normalizedBookDetails.author ||
        '',

      chapters:
        normalizedChapters,
    },

    knowledgeDetails: {
      ...defaultData.knowledgeDetails,
      ...normalizedKnowledgeDetails,

      introduction:
        normalizedKnowledgeDetails
          .introduction || '',

      sections:
        normalizedSections,
    },

    acuTable: {
      ...defaultData.acuTable,
      ...(normalized.acuTable || {}),
    },

    acuDetails: {
      ...defaultData.acuDetails,
      ...(normalized.acuDetails || {}),
    },

    oilDetails: {
      ...defaultData.oilDetails,
      ...(normalized.oilDetails || {}),
    },

    entryKey:
  originalEntryKey ||
  normalized.entryKey ||
  getEntryKey(
    normalized.category || '',
    normalized.name || ''
  ),

documentId:
  originalDocumentId,

firestoreId:
  originalDocumentId,

    sortName:
      normalized.sortName ||
      normalizeText(
        normalized.name || ''
      ),

    searchKey:
      normalized.searchKey || '',

    sourceText:
      normalized.sourceText || '',

    createdAt:
      normalized.createdAt || '',

    updatedAt:
      normalized.updatedAt || '',
  };

  console.log(
    'AddEntryPage 載入資料：',
    nextFormData
  );

  console.log(
    'AddEntryPage 載入 chapters：',
    nextFormData.bookDetails.chapters
  );

  setFormData(nextFormData);
  setSaveError('');
}, [editingItem]);

 const addNode = useCallback(
  (path = []) => {
    const newNodeId =
      `sub_${Date.now()}_${Math.floor(
        Math.random() * 100000
      )}`;

    const newNode = {
      id: newNodeId,
      title: '',
      type: 'content',
      text: '',
      children: [],
    };

    setFormData((currentData) => {
      const chapters =
        normalizeChapters(
          currentData.bookDetails?.chapters
        );

      const newChapters =
        JSON.parse(
          JSON.stringify(chapters)
        );

      if (
        !Array.isArray(path) ||
        path.length === 0
      ) {
        newChapters.push(newNode);

        return {
          ...currentData,

          bookDetails: {
            ...(currentData.bookDetails || {}),
            chapters: newChapters,
          },
        };
      }

      let targetList = newChapters;
      let targetNode = null;

      for (
        let index = 0;
        index < path.length;
        index += 1
      ) {
        const pathIndex = path[index];

        if (
          !Array.isArray(targetList) ||
          !targetList[pathIndex]
        ) {
          targetNode = null;
          break;
        }

        targetNode =
          targetList[pathIndex];

        if (
          index < path.length - 1
        ) {
          targetNode.children =
            normalizeArray(
              targetNode.children
            );

          targetList =
            targetNode.children;
        }
      }

      if (!targetNode) {
        newChapters.push(newNode);

        return {
          ...currentData,

          bookDetails: {
            ...(currentData.bookDetails || {}),
            chapters: newChapters,
          },
        };
      }

      if (
        targetNode.type === 'folder'
      ) {
        targetNode.children =
          normalizeArray(
            targetNode.children
          );

        targetNode.children.push(
          newNode
        );
      } else {
        targetNode.type = 'folder';
        targetNode.children = [
          newNode,
        ];
      }

      return {
        ...currentData,

        bookDetails: {
          ...(currentData.bookDetails || {}),
          chapters: newChapters,
        },
      };
    });

    setLastNodeId(newNodeId);
  },
  []
);

  const inputClass = `w-full rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 outline-none ${
  isViewOnly
    ? 'cursor-not-allowed opacity-70'
    : 'focus:border-[#3A4F3F] focus:ring-2 focus:ring-[#3A4F3F]/10'
}`;

  const labelClass =
    'mb-2 block text-[13px] font-bold uppercase tracking-widest text-[#A39284]';

  const textareaClass =
  `${inputClass} min-h-24 resize-y`;

  const getValueByPath = useCallback(
    (obj, path) => {
      const value = path
        .split('.')
        .reduce(
          (acc, key) => acc?.[key],
          obj
        );

      return value ?? '';
    },
    []
  );

  const updateValueByPath = useCallback(
    (path, value) => {
      const keys = path.split('.');

      setFormData((prev) => {
        const next = {
          ...prev,
        };

        let current = next;

        for (
          let i = 0;
          i < keys.length - 1;
          i++
        ) {
          current[keys[i]] = {
            ...(current[keys[i]] || {}),
          };

          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] =
          value;

        return next;
      });
    },
    []
  );

  const renderField = useCallback(
  (
    label,
    path,
    placeholder = '',
    isTextarea = false
  ) => {
    const value = getValueByPath(
      formData,
      path
    );

    if (isViewOnly) {
      const text = String(value || '').trim();

      if (!text) {
        return null;
      }

      return (
        <div>
          <label className={labelClass}>
            {label}
          </label>

          <div className="whitespace-pre-wrap break-words rounded-xl border border-[#E5E0D8] bg-[#FBF9F6] px-4 py-3 leading-7 text-[#4B5563]">
            {text}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className={labelClass}>
          {label}
        </label>

        {isTextarea ? (
          <textarea
            disabled={isSaving}
            className={textareaClass}
            value={value}
            placeholder={placeholder}
            onChange={(event) =>
              updateValueByPath(
                path,
                event.target.value
              )
            }
          />
        ) : (
          <input
            disabled={isSaving}
            className={inputClass}
            value={value}
            placeholder={placeholder}
            onChange={(event) =>
              updateValueByPath(
                path,
                event.target.value
              )
            }
          />
        )}
      </div>
    );
  },
  [
    formData,
    getValueByPath,
    updateValueByPath,
    isViewOnly,
    isSaving,
    inputClass,
    labelClass,
    textareaClass,
  ]
);

  const handleSave = useCallback(
  async () => {
    if (
      isSaving ||
      isViewOnly
    ) {
      return;
    }

    setSaveError('');

    const category = String(
      formData.category || ''
    ).trim();

    const name = String(
      formData.name || ''
    ).trim();

    if (!name) {
      setSaveError(
        '請至少填寫名稱！'
      );
      return;
    }

    if (!category) {
      setSaveError(
        '請至少填寫分類與名稱！'
      );
      return;
    }

    setIsSaving(true);

    try {
  const savedEntry =
    await saveEntry({
      formData: {
        ...formData,
        category,
        name,
      },

      editingItem,

      originalDocumentId:
        originalDocumentIdRef.current,

      originalEntryKey:
        originalEntryKeyRef.current,
    });

  if (
    typeof onSaved === 'function'
  ) {
    onSaved(savedEntry);
  } else {
    onClose();
  }

  window.alert(
    editingItem
      ? '✅ 資料已成功更新！'
      : '✅ 資料已成功儲存！'
  );
}catch (error) {
      console.error(
        '寫入資料失敗：',
        error
      );

      if (
        error?.message ===
          '已有相同分類與名稱的百科資料' ||
        error?.message ===
          '已存在相同分類與名稱的百科資料'
      ) {
        setSaveError(
          error.message
        );
      } else if (
        error?.message ===
          '請至少填寫名稱！' ||
        error?.message ===
          '請至少填寫分類與名稱！'
      ) {
        setSaveError(
          error.message
        );
      } else {
        setSaveError(
          getFriendlyTransactionError(
            error
          )
        );
      }
    } finally {
      setIsSaving(false);
    }
  },
  [
  editingItem,
  formData,
  isSaving,
  isViewOnly,
  onClose,
  onSaved,
]
);

  return (
    <div
      ref={contentRef}
      className="flex h-dvh w-screen flex-col overflow-hidden bg-[#FBF9F6]"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E5E0D8] bg-[#FBF9F6] px-6 py-5 md:px-10">
        <h2 className="text-xl font-black text-[#3A4F3F] md:text-3xl">
          {isViewOnly
            ? `檢視：${
                formData.name || '百科資料'
              }`
            : editingItem
              ? '編輯百科資料'
              : '新增百科資料'}
        </h2>

        <div className="flex shrink-0 gap-4">
          {!isViewOnly && (
            <AiImageImporter
  category={formData.category}
  disabled={isSaving}
  onData={(aiData) => {
    if (!aiData) {
      return;
    }

    setFormData((currentData) => {
      const mergeNonEmptyFields = (
        oldData,
        newData
      ) => {
        const result = {
          ...(oldData || {}),
        };

        Object.entries(
          newData || {}
        ).forEach(([key, value]) => {
          if (
            value === undefined ||
            value === null
          ) {
            return;
          }

          if (
            typeof value === 'string' &&
            value.trim() === ''
          ) {
            return;
          }

          result[key] = value;
        });

        return result;
      };

      const aiBookDetails = {
        ...(aiData.bookDetails || {}),
      };

      const aiKnowledgeDetails = {
        ...(aiData.knowledgeDetails || {}),
      };

      const currentBookDetails = {
        ...(currentData.bookDetails || {}),
      };

      const currentKnowledgeDetails = {
        ...(currentData.knowledgeDetails || {}),
      };

      const aiChapters =
        Array.isArray(
          aiBookDetails.chapters
        )
          ? normalizeChapters(
              aiBookDetails.chapters
            )
          : normalizeChapters(
              currentBookDetails.chapters
            );

      const aiSections =
        Array.isArray(
          aiKnowledgeDetails.sections
        )
          ? normalizeArray(
              aiKnowledgeDetails.sections
            )
          : normalizeArray(
              currentKnowledgeDetails.sections
            );

      return {
        ...currentData,

        ...mergeNonEmptyFields(
          currentData,
          aiData
        ),

        category:
          currentData.category,

        oilDetails: mergeNonEmptyFields(
          currentData.oilDetails,
          aiData.oilDetails
        ),

        acuTable: mergeNonEmptyFields(
          currentData.acuTable,
          aiData.acuTable
        ),

        acuDetails: mergeNonEmptyFields(
          currentData.acuDetails,
          aiData.acuDetails
        ),

        bookDetails: {
          ...currentBookDetails,
          ...aiBookDetails,

          author:
            aiBookDetails.author ||
            currentBookDetails.author ||
            '',

          chapters: aiChapters,
        },

        knowledgeDetails: {
          ...currentKnowledgeDetails,
          ...aiKnowledgeDetails,

          introduction:
            aiKnowledgeDetails.introduction ||
            currentKnowledgeDetails.introduction ||
            '',

          sections: aiSections,
        },
      };
    });
  }}
/>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 font-bold text-[#A39284] hover:text-[#3A4F3F]"
          >
            {resolvedCloseLabel}
          </button>

          {!isViewOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#3A4F3F] px-8 py-2 font-bold text-white hover:bg-[#2C3C30] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? '儲存中...'
                : '儲存資料'}
            </button>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <div className="h-full overflow-y-auto overscroll-contain px-6 py-6 [scrollbar-gutter:stable] md:px-10">
          <div className="w-full space-y-6">
            <div className="rounded-3xl border border-[#E5E0D8]/60 bg-white p-6 md:p-8">
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    分類
                  </label>

                  <select
                    disabled={
                      isViewOnly || isSaving
                    }
                    className={inputClass}
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        category:
                          event.target.value,
                      }))
                    }
                  >
                    <option value="書籍">書籍</option>
                    <option value="精油">精油</option>
                    <option value="穴道">穴道</option>
                    <option value="中藥">中藥</option>
                    <option value="方劑">方劑
                    </option>
                    <option value="其他">
                      名詞材料
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    名稱
                  </label>

                  <input
                    disabled={
                      isViewOnly || isSaving
                    }
                    placeholder="輸入名稱"
                    value={formData.name}
                    className={inputClass}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>

                {formData.category ===
                  '書籍' && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      作者 / 編著
                    </label>

                    <input
                      disabled={
                        isViewOnly || isSaving
                      }
                      placeholder="輸入作者 / 編著"
                      value={
                        formData.bookDetails
                          .author
                      }
                      className={inputClass}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          bookDetails: {
                            ...prev.bookDetails,
                            author:
                              event.target
                                .value,
                          },
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="mb-6 w-full">
                <label className={labelClass}>
                  簡介描述
                </label>

                <textarea
                  disabled={
                    isViewOnly || isSaving
                  }
                  placeholder="簡介描述"
                  value={formData.description || ''}
                  className={textareaClass}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      description:
                        event.target.value,
                    }))
                  }
                />
              </div>

              {![
                '穴道',
                '精油',
              ].includes(formData.category) && (
                <div className="mb-6">
                  <label className={labelClass}>
                    核心標籤
                  </label>

                  <input
                    disabled={
                      isViewOnly || isSaving
                    }
                    placeholder="例如：解表、清熱"
                    value={formData.tag}
                    className={inputClass}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        tag: event.target
                          .value,
                      }))
                    }
                  />
                </div>
              )}

              {formData.category ===
                '書籍' && (
                <div className="max-h-[60vh] overflow-y-auto border-r border-[#E5E0D8]/30 pl-1 pr-6 [scrollbar-gutter:stable]">
                  <BookStructureEditor
                    formData={formData}
                    setFormData={setFormData}
                    labelClass={labelClass}
                    inputClass={inputClass}
                    addNode={addNode}
                    lastNodeId={lastNodeId}
                    disabled={
                      isViewOnly || isSaving
                    }
                    isViewOnly={
                      isViewOnly || isSaving
                    }
                  />
                </div>
              )}

              {formData.category === '其他' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {renderField('🗂️ 類型', 'type')}
      {renderField('🏷️ 別名', 'alias')}
      {renderField('🌐 英文名稱', 'englishName')}
    </div>

    {renderField(
      '📖 詳細介紹',
      'knowledgeDetails.introduction',
      '輸入這個名詞或材料的完整介紹',
      true
    )}

    <div className="rounded-2xl border border-[#E5E0D8]/60 bg-[#FBF9F6] p-5">
      <h3 className="mb-4 text-base font-bold text-[#3A4F3F]">
        📚 內容
      </h3>

      <KnowledgeStructureEditor
        formData={formData}
        setFormData={setFormData}
        labelClass={labelClass}
        inputClass={inputClass}
        disabled={isViewOnly || isSaving}
        isViewOnly={isViewOnly || isSaving}
      />
    </div>
  </div>
)}

              {formData.category ===
                '精油' && (
                <div className="grid grid-cols-1 gap-8">
                  <div className="col-span-1 grid grid-cols-1 gap-4 rounded-2xl border border-[#E5E0D8]/50 bg-white p-5 md:col-span-2 md:grid-cols-2">
                    <span className="col-span-1 mb-1 border-b border-[#E5E0D8] pb-1.5 text-sm font-bold text-[#3A4F3F] md:col-span-2">
                      📊 基本屬性資料
                    </span>

                    <div className="col-span-1 md:col-span-2">
                      <label className={labelClass}>
                        適用體質與化學屬性標籤
                      </label>

                      <div className="flex gap-2">
                        <input
                          disabled={
                            isViewOnly ||
                            isSaving
                          }
                          placeholder="體質標籤"
                          value={
                            formData.constitutionTag
                          }
                          className={inputClass}
                          onChange={(event) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                constitutionTag:
                                  event.target
                                    .value,
                              })
                            )
                          }
                        />

                        <input
                          disabled={
                            isViewOnly ||
                            isSaving
                          }
                          placeholder="化學屬性標籤"
                          value={
                            formData.chemicalTag
                          }
                          className={inputClass}
                          onChange={(event) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                chemicalTag:
                                  event.target
                                    .value,
                              })
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                      {renderField('🏷️ 別名','alias')}
                      {renderField('🌿 植物種類／萃取部位','typePart')}
                      {renderField('🧪 萃取方法','method')}
                      {renderField('🌐 外文名','englishName')}
                      {renderField('🧬 拉丁學名','latin')}
                      {renderField('🌳 科名','family')}
                      {renderField('👅 性味','nature')}
                      {renderField('☯️ 五行／陰陽屬性','property')}
                      {renderField('🎯 歸經','meridian')}
                      {renderField('🩹 主治','indications')}
                      {renderField('🎵 類比音符','noteAnalogy')}
                      {renderField('🪐 主宰星球','planet')}
                      {renderField('🌍 重要產地','origin')}
                    </div>
                  </div>

                  <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                    {renderField('🔍 氣味','oilDetails.scent','',true)}
                    {renderField('✨ 外觀描述','oilDetails.appearance','',true)}
                    {renderField('📜 應用歷史與相關神話','oilDetails.historyMyth','',true)}
                    {renderField('🔬 化學結構','oilDetails.chemistry','',true)}
                    {renderField('⚖️ 屬性補充','oilDetails.attribute','',true)}
                    {renderField('⚠️ 注意事項','oilDetails.caution','',true)}
                    {renderField('🧠 心靈療效','oilDetails.mindEffect','',true)}
                    {renderField('🧍 身體療效','oilDetails.bodyEffect','',true)}
                    {renderField('💪 皮膚療效','oilDetails.skinEffect','',true)}
                    {renderField('🧬 體質適用','oilDetails.constitution','',true)}
                    {renderField('🔗 適合調和的精油','oilDetails.blendingOils','',true)}
                    {renderField('🧪 精油配方','oilDetails.formulas','',true)}
                    {renderField('🧴 按摩基底油','oilDetails.carrierOils','',true)}
                    {renderField('🚀 使用方法','oilDetails.usage','',true)}
                  </div>
                </div>
              )}

              {formData.category ===
                '穴道' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('🌐 英文名稱', 'englishName')}
                    {renderField('🆔 國際代碼','acuTable.code')}
                    {renderField('🎯 經絡','acuTable.meridian')}
                  </div>
                  {renderField('🏷️ 別名','acuTable.alias')}
                  {renderField('主治','acuDetails.indications','',true)}
                  {renderField('🗂️ 類別','acuDetails.type','',true)}
                  {renderField('釋名','acuDetails.nameExpl','',true)}
                  {renderField('📍 位置','acuDetails.location','',true)}
                  {renderField('解剖','acuDetails.anatomy','',true)}
                  {renderField('操作','acuDetails.operation','',true)}
                  {renderField('古代功效','acuDetails.effectAncient','',true)}
                  {renderField('現代功效','acuDetails.effectModern','',true)}
                  {renderField('配穴','acuDetails.matchingPoints','',true)}
                </div>
              )}

              {formData.category ===
                '中藥' && (
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {renderField('🗂️ 別名','alias')}
                    {renderField('🌐 英文名稱', 'englishName')}
                    {renderField('🌿 科屬','family')}
                    {renderField('👅 性味','nature')}
                    {renderField('🎯 歸經','meridian')}
                  </div>
                  {renderField('🌱 品種來源','source','',true)}
                  {renderField('🔍 性狀','traits','',true)}
                  {renderField('✨ 功效','effect','',true)}
                  {renderField('🎯 主治','indications','',true)}
                  {renderField('⚖️ 用法用量','dosage','',true)}
                  {renderField('🧬 現代藥理','pharmacology','',true)}
                  {renderField('🏥 現代應用','contemporary','',true)}
                  {renderField('📜 選方','medicine','',true)}
                  {renderField('📚 文獻別錄','literature','',true)}
                  {renderField('⚠️ 注意禁忌','contraindication','',true)}
                  {renderField('🔥 炮製儲藏','preparation','',true)}
                  {renderField('💡 附藥說明','directions','',true)}
                  {renderField('📝 註','note','',true)}
                </div>
              )}

              {formData.category ===
                '方劑' && (
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {renderField('🗂️ 別名','alias')}
                    {renderField('🌱 來源','source')}
                    {renderField('✨ 功效','effect')}
                  </div>
                  {renderField('🏺 製法用量','preparation','',true)}
                  {renderField('🎯 主治','indications','',true)}
                  {renderField('📚 文獻別錄','literature','',true)}
                  {renderField('🧮 方義','analysis','',true)}
                  {renderField('🗣️ 方論','discussion','',true)}
                  {renderField('👁️ 辨證要點','syndrome','',true)}
                  {renderField('➕ 加減','modifications','',true)}
                  {renderField('⚠️ 注意禁忌','contraindication','',true)}
                  {renderField('🏥 現代應用','modernApp','',true)}
                  {renderField('🧬 現代藥理','modernPharmacology','',true)}
                  {renderField('📎 附方','prescription','',true)}
                </div>
              )}
            </div>

            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-4 py-6">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-[#A39284] transition-colors hover:text-[#3A4F3F]"
              >
                {resolvedCloseLabel}
              </button>

              {!isViewOnly && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-2xl bg-[#3A4F3F] px-10 py-3 text-white shadow-[#3A4F3F]/20 hover:bg-[#2C3C30] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? '儲存中...'
                    : '儲存資料'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}