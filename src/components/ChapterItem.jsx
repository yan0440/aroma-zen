// components/ChapterItem.jsx
import React from 'react';

export default function ChapterItem({ item, path, updateData, removeNode, addNode }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-[#E5E0D8] space-y-2">
      <div className="flex gap-2 items-center">
        <select 
          value={item.type || 'content'} 
          className="text-xs p-1 bg-[#F7F5F0] rounded border"
          onChange={(e) => updateData(path, { ...item, type: e.target.value })}
        >
          <option value="folder">📁 目錄</option>
          <option value="content">📄 內容</option>
        </select>

        <input
          value={item.title || ''}
          placeholder={item.type === 'folder' ? "目錄名稱" : "篇名"}
          className="flex-1 text-sm border-b outline-none"
          onChange={(e) => updateData(path, { ...item, title: e.target.value })}
        />

        <button type="button" onClick={() => removeNode(path)} className="text-red-400 font-bold px-2">✕</button>
      </div>

      {item.type === 'folder' && (
        <div className="pl-6 space-y-2 border-l border-[#6B9080]/20">
          {(item.children || []).map((child, childIdx) => (
            <ChapterItem 
              key={child.id} 
              item={child} 
              path={[...path, 'children', childIdx]} 
              updateData={updateData}
              removeNode={removeNode}
              addNode={addNode}
            />
          ))}
          <button 
            type="button" 
            onClick={() => addNode(path)} 
            className="text-xs text-[#6B9080] font-bold hover:underline"
          >
            ＋ 新增子項目
          </button>
        </div>
      )}
    </div>
  );
}