import React, { useState } from 'react';

export default function BookStructureEditor({ formData, setFormData, labelClass, inputClass }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // 安全的狀態更新輔助函式
  const updateNestedState = (currentData, path, updateFnOrValue) => {
    if (path.length === 0) {
      return typeof updateFnOrValue === 'function' ? updateFnOrValue(currentData) : updateFnOrValue;
    }

    const [key, ...restPath] = path;

    if (Array.isArray(currentData)) {
      return currentData.map((item, index) => {
        if (index === key) {
          return updateNestedState(item, restPath, updateFnOrValue);
        }
        return item;
      });
    } else if (typeof currentData === 'object' && currentData !== null) {
      return {
        ...currentData,
        [key]: updateNestedState(currentData[key], restPath, updateFnOrValue),
      };
    }
    return currentData;
  };

  const updateNode = (path, updates) => {
    const currentChapters = formData.bookDetails?.chapters || [];
    const newChapters = updateNestedState(currentChapters, path, (node) => ({ ...node, ...updates }));
    setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: newChapters } });
  };

  const deleteNode = (path) => {
    const currentChapters = formData.bookDetails?.chapters || [];
    if (path.length === 0) return;
    const parentPath = path.slice(0, -1);
    const indexToDelete = path[path.length - 1];
    const newChapters = updateNestedState(currentChapters, parentPath, (parent) => {
      if (Array.isArray(parent)) return parent.filter((_, idx) => idx !== indexToDelete);
      if (parent && Array.isArray(parent.children)) return { ...parent, children: parent.children.filter((_, idx) => idx !== indexToDelete) };
      return parent;
    });
    setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: newChapters } });
  };

  const addChild = (path) => {
    const newChild = { id: `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`, title: '', type: 'content', children: [], text: '' };
    const currentChapters = formData.bookDetails?.chapters || [];
    const newChapters = updateNestedState(currentChapters, path, (node) => {
      const currentChildren = Array.isArray(node.children) ? node.children : [];
      return { ...node, children: [...currentChildren, newChild] };
    });
    setFormData({ ...formData, bookDetails: { ...formData.bookDetails, chapters: newChapters } });
  };

  // 遞迴渲染節點
  // 遞迴渲染節點
  const renderNode = (node, index, path, level = 0) => {
    if (!node) return null;
    
    const isExpanded = expandedNodes[node.id] !== false;
    const isRoot = level === 0;
    const isFolder = node.type === 'folder';
    const fullTitle = node.title || '';
    const match = fullTitle.match(/(.*?)[（(]別名[:：](.*?)[)）]/);
    const pureTitle = match ? match[1].trim() : fullTitle;
    const aliasText = match ? match[2].trim() : '';

    let levelLabel = isRoot ? "主目錄" : (isFolder ? "子目錄" : "內文篇章");
    let bgColor = isRoot ? "bg-[#F7F5F0]" : "bg-white";
    let borderColor = isRoot ? "border-[#6B9080]/40" : "border-[#E5E0D8]";

    return (
      <div key={node.id || index} className={`${bgColor} p-3 rounded-xl border ${borderColor} space-y-2 mt-2 shadow-sm`}>
        <div className="flex gap-2 items-center w-full">
          {/* 摺疊按鈕 */}
          {isFolder && (
            <button onClick={() => toggleNode(node.id)} className="text-[10px] text-gray-400 w-4">
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${isRoot ? "bg-[#6B9080] text-white" : "bg-[#E5E0D8] text-[#3A4F3F]"}`}>
            {levelLabel}
          </span>

          {!isRoot && (
            <select value={node.type || 'content'} className="text-xs p-1 bg-white rounded border border-[#E5E0D8] shrink-0 h-8 outline-none"
              onChange={(e) => updateNode(path, { type: e.target.value })}>
              <option value="content">📄 內文</option>
              <option value="folder">📁 子目錄</option>
            </select>
          )}

          {/* 名稱與別名整合容器 */}
          <div className="flex-1 flex gap-2 items-center min-w-[200px]">
            {/* 名稱輸入框 */}
            <input placeholder={isFolder ? "輸入目錄名稱" : "輸入篇名"} value={pureTitle}
              className="flex-[2] text-sm border-b border-[#E5E0D8] outline-none h-8 bg-transparent"
              onChange={(e) => updateNode(path, { title: aliasText ? `${e.target.value}(別名：${aliasText})` : e.target.value })} />

            {/* 別名輸入框 (整合你指定的樣式與邏輯) */}
            <div className="flex-[1] flex items-center border-b border-[#E5E0D8] h-8 px-1 min-w-[80px]">
              <input
                placeholder="別名"
                value={aliasText}
                className="w-full text-sm bg-transparent outline-none text-[#6B9080] placeholder-[#A39284]/50 h-full"
                onChange={(e) => {
                  const newAlias = e.target.value;
                  updateNode(path, { title: newAlias ? `${pureTitle}(別名：${newAlias})` : pureTitle });
                }}
              />
            </div>
          </div>

          <button type="button" onClick={() => deleteNode(path)} 
            className="text-gray-400 hover:text-red-500 text-xs px-2 shrink-0">✕</button>
        </div>

        {/* ... (其餘內容渲染與邏輯保持不變) ... */}
        {isFolder && isExpanded && (
          <div className="pl-6 space-y-2 border-l-2 border-[#6B9080]/20 mt-2">
            {Array.isArray(node.children) && node.children.map((child, childIdx) => 
              renderNode(child, childIdx, [...path, 'children', childIdx], level + 1)
            )}
            <button type="button" onClick={() => addChild(path)} className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] mt-2 py-1 px-2 rounded hover:bg-[#6B9080]/10">
              ＋ 新增{isRoot ? "子項目" : "下級項目"}
            </button>
          </div>
        )}
        
        {!isFolder && (
          <div className="space-y-2 mt-2">
            <textarea placeholder="在此輸入詳細內容..." value={node.text || ''} className="w-full p-3 bg-[#FCFBFA] text-xs border border-[#E5E0D8] rounded-xl h-32 outline-none"
              onChange={(e) => updateNode(path, { text: e.target.value })} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-white/90 pb-4 pt-2">
        <label className={labelClass}>作者 / 編著</label>
        <input value={formData.bookDetails?.author || ''} className={inputClass} onChange={(e) => setFormData({...formData, bookDetails: {...formData.bookDetails, author: e.target.value}})} />
        <button 
  type="button" 
  onClick={() => setFormData({
    ...formData, 
    bookDetails: { 
      ...formData.bookDetails, 
      chapters: [
        ...(formData.bookDetails?.chapters || []), 
        { id: `ch_${Date.now()}`, title: '', type: 'folder', children: [] }
      ] 
    }
  })}
  className="w-full mt-4 py-3 bg-[#6B9080] text-white rounded-xl font-bold 
             transition-all duration-150 ease-in-out 
             hover:bg-[#5A7B6D] hover:shadow-md 
             active:scale-[0.98] active:bg-[#4A685B]"
>
  ＋ 新增主目錄
</button>
      </div>
      <div className="space-y-4 border-l-2 border-[#E5E0D8] pl-4">
        {Array.isArray(formData.bookDetails?.chapters) && formData.bookDetails.chapters.map((chapter, index) => renderNode(chapter, index, [index], 0))}
      </div>
    </div>
  );
}