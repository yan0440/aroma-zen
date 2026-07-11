// components/BookStructureEditor.jsx
import React from 'react';

export default function BookStructureEditor({ formData, setFormData, labelClass, inputClass }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>作者 / 編著</label>
          <input 
            placeholder="例如：黃帝內經" 
            value={formData.bookDetails?.author || ''} 
            className={inputClass} 
            onChange={(e) => setFormData({
              ...formData, 
              bookDetails: { ...formData.bookDetails, author: e.target.value }
            })} 
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              const currentChapters = formData.bookDetails?.chapters || [];
              const newChapter = {
                id: `ch_${Date.now()}`,
                title: '',
                type: 'folder',
                children: []
              };
              setFormData({
                ...formData,
                bookDetails: { ...formData.bookDetails, chapters: [...currentChapters, newChapter] }
              });
            }}
            className="w-full py-3 bg-[#6B9080] text-white rounded-xl font-bold hover:bg-[#5A7B6D] transition-colors shadow-sm"
          >
            ＋ 新增主目錄
          </button>
        </div>
      </div>

      {/* 樹狀目錄動態編輯區域 */}
      <div className="space-y-4 border-l-2 border-[#E5E0D8] pl-4 mt-4">
        <label className={labelClass}>書籍目錄與內容架構</label>
        
        {(!formData.bookDetails?.chapters || formData.bookDetails.chapters.length === 0) && (
          <p className="text-sm text-[#A39284] italic">目前尚無目錄，請點擊上方按鈕開始建立。</p>
        )}

        {formData.bookDetails?.chapters?.map((chapter, index) => (
          <div key={chapter.id} className="p-4 bg-[#F7F5F0] rounded-2xl border border-[#E5E0D8]/60 space-y-3">
            {/* 主目錄標題輸入 */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-[#6B9080]">主目錄 {index + 1}:</span>
              <input
                placeholder="輸入目錄名稱（如：素問、內科症狀）"
                value={chapter.title}
                className={`${inputClass} !py-2 bg-white`}
                onChange={(e) => {
                  const updated = [...formData.bookDetails.chapters];
                  updated[index].title = e.target.value;
                  setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = formData.bookDetails.chapters.filter((_, i) => i !== index);
                  setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                }}
                className="text-red-500 hover:text-red-700 text-xs px-2"
              >
                刪除
              </button>
            </div>

            {/* 子篇章 / 內文列表 */}
            <div className="pl-6 space-y-3 border-l border-[#6B9080]/30">
              {chapter.children?.map((child, childIdx) => {
                const fullTitle = child.title || '';
                const match = fullTitle.match(/(.*?)[（\(]別名[：:](.*?)[）\)]/);
                const pureTitle = match ? match[1].trim() : fullTitle;
                const aliasText = match ? match[2].trim() : '';

                return (
                  <div key={child.id} className="bg-white p-3 rounded-xl border border-[#E5E0D8] space-y-2">
                    {/* 這裡加上 items-stretch 確保子元件高度填滿並對齊 */}
                    <div className="flex gap-2 items-stretch">
                      <select
                        value={child.type}
                        className="text-xs p-1 bg-[#F7F5F0] rounded border border-[#E5E0D8] shrink-0 self-center h-8"
                        onChange={(e) => {
                          const updated = [...formData.bookDetails.chapters];
                          updated[index].children[childIdx].type = e.target.value;
                          setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                        }}
                      >
                        <option value="content">📄 終端內文</option>
                        <option value="folder">📁 子目錄</option>
                      </select>

                      {/* 1. 項目主名稱輸入框 */}
                      <input
                        placeholder={child.type === 'folder' ? "子目錄名稱（如：卷一）" : "篇名（如：上古天真論）"}
                        value={pureTitle}
                        className="flex-1 text-sm px-1.5 border-b border-[#E5E0D8] shrink-0 self-center h-8"
                        onChange={(e) => {
                          const newPureTitle = e.target.value;
                          const updated = [...formData.bookDetails.chapters];
                          updated[index].children[childIdx].title = aliasText 
                            ? `${newPureTitle}(別名：${aliasText})` 
                            : newPureTitle;
                          setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                        }}
                      />

                      {/* 🟢 2. 全新升級：與名稱完全一致的底線風格別名格 */}
                      {child.type === 'content' && (
                        <div className="flex items-center gap-1 shrink-0 border-b border-[#E5E0D8] h-8">
                          <span className="text-sm text-[#A39284] whitespace-nowrap">別名：</span>
                          <input
                            placeholder="如：養生總綱"
                            value={aliasText}
                            className="w-24 md:w-36 text-sm bg-transparent outline-none text-[#3A4F3F] placeholder-[#A39284]/60 h-full"
                            onChange={(e) => {
                              const newAlias = e.target.value;
                              const updated = [...formData.bookDetails.chapters];
                              updated[index].children[childIdx].title = newAlias 
                                ? `${pureTitle}(別名：${newAlias})` 
                                : pureTitle;
                              setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.bookDetails.chapters];
                          updated[index].children = updated[index].children.filter((_, i) => i !== childIdx);
                          setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs shrink-0 px-1 self-center"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 如果是終端內文，顯示快速模板工具列與大文字框 */}
                    {child.type === 'content' && (
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center bg-[#F0EDE6]/60 p-2 rounded-lg">
                          <span className="text-[11px] font-bold text-[#6B9080]">症狀快速模板：</span>
                          <button
                            type="button"
                            onClick={() => {
                              const template = "【概念】\n\n【辨證分析】\n\n【文獻別錄】\n\n【現代研究】\n\n【診斷辨證分析】\n";
                              const updated = [...formData.bookDetails.chapters];
                              updated[index].children[childIdx].text = template + (child.text || '');
                              setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                            }}
                            className="text-[10px] bg-white text-[#3A4F3F] border border-[#E5E0D8] px-2 py-1 rounded hover:bg-[#3A4F3F] hover:text-white transition-colors"
                          >
                            ＋ 插入 概念/辨證/文獻 框架
                          </button>
                        </div>

                        <textarea
                          placeholder="在此輸入詳細經文..."
                          value={child.text || ''}
                          className="w-full p-3 bg-[#FCFBFA] text-xs border border-[#E5E0D8] rounded-xl h-48 resize-y outline-none focus:border-[#3A4F3F] font-sans leading-relaxed"
                          onChange={(e) => {
                            const updated = [...formData.bookDetails.chapters];
                            updated[index].children[childIdx].text = e.target.value;
                            setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  const updated = [...formData.bookDetails.chapters];
                  updated[index].children = [
                    ...(updated[index].children || []),
                    { id: `sub_${Date.now()}`, title: '', type: 'content', text: '' }
                  ];
                  setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: updated } });
                }}
                className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] flex items-center gap-1 mt-1"
              >
                ＋ 在「{chapter.title || '此目錄'}」下新增 篇章/子目錄
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}