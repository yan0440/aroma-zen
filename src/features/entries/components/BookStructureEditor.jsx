/**
 * 書籍結構編輯器
 *
 * 功能：
 * - 左側最上方保留「＋ 新增內文」「＋ 新增篇章」。
 * - 每個展開目錄底部保留「＋ 新增內文」「＋ 新增篇章」。
 * - 右側保留「＋ 新增該資料夾內文」「＋ 新增該資料子目錄」。
 * - 新增任何節點後，右側編輯器只捲到自己的頂端。
 * - 不使用 window.scrollTo，不捲動外層頁面，不捲動左側目錄。
 * - 編輯名稱、別名、類型、模板、表格與內文時，右側捲軸位置保持不變。
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

function AutoResizeTextarea({ value, onChange, placeholder, className = '', disabled = false }) {
  const textareaRef = useRef(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);
  return <textarea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder} rows={1} disabled={disabled} className={`${className} w-full resize-none overflow-hidden`} />;
}

function restoreArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];
  return Object.keys(value).filter((key) => /^\d+$/.test(key)).sort((a, b) => Number(a) - Number(b)).map((key) => value[key]);
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') return null;
  const type = node.type === 'folder' ? 'folder' : 'content';
  return { ...node, id: node.id || `${type}_${Date.now()}_${Math.floor(Math.random() * 100000)}`, title: typeof node.title === 'string' ? node.title : '', type, text: typeof node.text === 'string' ? node.text : '', children: restoreArray(node.children).map(normalizeNode).filter(Boolean) };
}

function normalizeChapters(value) { return restoreArray(value).map(normalizeNode).filter(Boolean); }
function cloneDeep(value) { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } }
function createFolderNode() { return { id: `folder_${Date.now()}_${Math.floor(Math.random() * 100000)}`, title: '', type: 'folder', children: [], text: '' }; }
function createContentNode() { return { id: `content_${Date.now()}_${Math.floor(Math.random() * 100000)}`, title: '', type: 'content', children: [], text: '' }; }
function getLevelLabel(level) { const labels = ['篇', '章', '節', '目', '子目', '項']; return labels[Math.min(level, labels.length - 1)]; }
function parseTitle(title = '') { const match = title.match(/(.*?)[（(]別名[:：](.*?)[)）]/); return { pureTitle: match ? match[1].trim() : title, aliasText: match ? match[2].trim() : '' }; }
function buildTitle(pureTitle, aliasText) { if (!pureTitle && !aliasText) return ''; if (!aliasText) return pureTitle; return `${pureTitle}(別名：${aliasText})`; }
function getNodeByPath(chapters, path) { let current = chapters; for (const key of path || []) { current = current?.[key]; if (current == null) return null; } return current; }
function getPathNodes(chapters, path) { const nodes = []; let current = chapters; for (let index = 0; index < path.length; index += 2) { const node = current?.[path[index]]; if (!node) break; nodes.push(node); current = Array.isArray(node.children) ? node.children : []; } return nodes; }
function updateNestedState(currentData, path, updater) { if (path.length === 0) return typeof updater === 'function' ? updater(currentData) : updater; const [key, ...restPath] = path; if (Array.isArray(currentData)) return currentData.map((item, index) => index === key ? updateNestedState(item, restPath, updater) : item); if (currentData && typeof currentData === 'object') return { ...currentData, [key]: updateNestedState(currentData[key], restPath, updater) }; return currentData; }

export default function BookStructureEditor({ formData, setFormData, scrollContainerRef, disabled = false, isViewOnly = false }) {
  const locked = disabled || isViewOnly;
  const [selectedPath, setSelectedPath] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const pendingRightTopRef = useRef(false);
  const rightScrollTopRef = useRef(0);
  const rawChapters = useMemo(() => formData?.bookDetails?.chapters ?? [], [formData?.bookDetails?.chapters]);
  const chapters = useMemo(() => normalizeChapters(rawChapters), [rawChapters]);

  const updateChapters = useCallback((nextChapters, options = {}) => {
    const currentRightTop = rightScrollRef.current?.scrollTop ?? rightScrollTopRef.current;
    rightScrollTopRef.current = options.scrollRightTop ? 0 : currentRightTop;
    pendingRightTopRef.current = Boolean(options.scrollRightTop);
    setFormData((previous) => ({ ...previous, bookDetails: { ...(previous?.bookDetails || {}), chapters: normalizeChapters(nextChapters) } }));
  }, [setFormData]);

  useEffect(() => {
    if (pendingRightTopRef.current) {
      pendingRightTopRef.current = false;
      if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
      rightScrollTopRef.current = 0;
    } else if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = rightScrollTopRef.current;
    }
  });

  const scrollRightEditorToTop = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const right = rightScrollRef.current;
        if (!right) return;
        right.scrollTo({ top: 0, behavior: 'smooth' });
        rightScrollTopRef.current = 0;
      });
    });
  }, []);

  const addRootContent = useCallback(() => {
    if (locked) return;
    const newNode = createContentNode();
    const next = [...cloneDeep(chapters), newNode];
    updateChapters(next, { scrollRightTop: true });
    setSelectedPath([next.length - 1]);
    scrollRightEditorToTop();
  }, [chapters, locked, updateChapters, scrollRightEditorToTop]);

  const addRootFolder = useCallback(() => {
    if (locked) return;
    const newNode = createFolderNode();
    const next = [...cloneDeep(chapters), newNode];
    updateChapters(next, { scrollRightTop: true });
    setSelectedPath([next.length - 1]);
    setExpandedNodes((previous) => ({ ...previous, [newNode.id]: true }));
    scrollRightEditorToTop();
  }, [chapters, locked, updateChapters, scrollRightEditorToTop]);

  const addChild = useCallback((parentPath, type = 'content') => {
    if (locked || !parentPath?.length) return;
    const next = cloneDeep(chapters);
    const parent = getNodeByPath(next, parentPath);
    if (!parent) return;
    const child = type === 'folder' ? createFolderNode() : createContentNode();
    parent.children = Array.isArray(parent.children) ? parent.children : [];
    const childIndex = parent.children.length;
    parent.children.push(child);
    updateChapters(next, { scrollRightTop: true });
    setSelectedPath([...parentPath, 'children', childIndex]);
    setExpandedNodes((previous) => ({ ...previous, [parent.id]: true, [child.id]: true }));
    scrollRightEditorToTop();
  }, [chapters, locked, updateChapters, scrollRightEditorToTop]);

  const addSibling = useCallback((currentPath, type = 'content') => {
    if (locked || !currentPath?.length) return;
    const next = cloneDeep(chapters);
    let list;
    let parentPath = [];
    let index;
    if (currentPath.length === 1) { list = next; index = currentPath[0]; } else { parentPath = currentPath.slice(0, -2); const parent = getNodeByPath(next, parentPath); if (!parent) return; parent.children = Array.isArray(parent.children) ? parent.children : []; list = parent.children; index = currentPath[currentPath.length - 1]; }
    if (!Array.isArray(list) || typeof index !== 'number') return;
    const newNode = type === 'folder' ? createFolderNode() : createContentNode();
    const insertIndex = index + 1;
    list.splice(insertIndex, 0, newNode);
    const newPath = parentPath.length ? [...parentPath, 'children', insertIndex] : [insertIndex];
    updateChapters(next, { scrollRightTop: true });
    setSelectedPath(newPath);
    setExpandedNodes((previous) => ({ ...previous, [newNode.id]: true }));
    scrollRightEditorToTop();
  }, [chapters, locked, updateChapters, scrollRightEditorToTop]);

  const updateNode = useCallback((path, updates) => {
    if (locked || !path?.length) return;
    updateChapters(updateNestedState(chapters, path, (node) => ({ ...node, ...updates })));
  }, [chapters, locked, updateChapters]);

  const deleteNode = useCallback((path) => {
    if (locked || !path?.length) return;
    const next = cloneDeep(chapters);
    if (path.length === 1) next.splice(path[0], 1); else { const parent = getNodeByPath(next, path.slice(0, -2)); const index = path[path.length - 1]; if (parent?.children) parent.children.splice(index, 1); }
    updateChapters(next);
    setSelectedPath(null);
  }, [chapters, locked, updateChapters]);

  const toggleNode = useCallback((id) => setExpandedNodes((previous) => ({ ...previous, [id]: previous[id] !== true })), []);
  const selectedNode = useMemo(() => selectedPath ? getNodeByPath(chapters, selectedPath) : null, [chapters, selectedPath]);
  const breadcrumbNodes = useMemo(() => selectedPath ? getPathNodes(chapters, selectedPath) : [], [chapters, selectedPath]);
  const selectedTitleParts = useMemo(() => parseTitle(selectedNode?.title || ''), [selectedNode]);
  const canAddSibling = Boolean(selectedPath?.length);
  const appendText = useCallback((text) => { if (!selectedNode || !selectedPath || locked) return; const current = selectedNode.text || ''; updateNode(selectedPath, { text: current ? `${current}\n${text}` : text }); }, [selectedNode, selectedPath, locked, updateNode]);

  const renderNode = useCallback((node, index, path, level = 0) => {
    const isFolder = node.type === 'folder';
    const children = Array.isArray(node.children) ? node.children : [];
    const canExpand = isFolder || children.length > 0;
    const expanded = expandedNodes[node.id] === true;
    const selected = selectedPath?.length === path.length && selectedPath.every((value, i) => value === path[i]);
    const { pureTitle, aliasText } = parseTitle(node.title || '');
    return <div key={node.id || index} className="space-y-2"><button type="button" onClick={() => setSelectedPath(path)} className={`w-full rounded-lg border px-3 py-2 text-left transition ${selected ? 'border-[#6B9080] bg-[#6B9080] text-white' : 'border-[#E5E0D8] bg-white text-[#3A4F3F] hover:bg-[#F7F5F0]'}`}><div className="flex items-center gap-2">{canExpand ? <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); toggleNode(node.id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleNode(node.id); } }} className="w-4 cursor-pointer text-center text-xs">{expanded ? '▼' : '▶'}</span> : <span className="w-4" />}<span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{isFolder ? getLevelLabel(level) : '內文'}</span><span className="min-w-0 flex-1 truncate">{pureTitle || '未命名'}{aliasText ? `（別名：${aliasText}）` : ''}</span>{isFolder && node.text && <span className="text-[10px] opacity-80">有內文</span>}</div></button>{canExpand && expanded && <div className="space-y-2 border-l border-[#E5E0D8] pl-4">{children.map((child, childIndex) => renderNode(child, childIndex, [...path, 'children', childIndex], level + 1))}{!locked && <div className="flex flex-wrap gap-2 border-t border-[#E5E0D8] pt-2"><button type="button" onClick={() => addChild(path, 'content')} disabled={locked} className="rounded px-2 py-1 text-xs font-bold text-[#6B9080] hover:bg-[#6B9080]/10 disabled:opacity-50">＋ 新增內文</button><button type="button" onClick={() => addChild(path, 'folder')} disabled={locked} className="rounded px-2 py-1 text-xs font-bold text-[#6B9080] hover:bg-[#6B9080]/10 disabled:opacity-50">＋ 新增篇章</button></div>}</div>}</div>;
  }, [expandedNodes, selectedPath, toggleNode, addChild, locked]);

  return <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#FCFBFA]"><main className="flex min-h-0 flex-1 overflow-hidden"><aside className="flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-r border-[#E5E0D8] bg-[#F7F5F0]"><div className="shrink-0 border-b border-[#E5E0D8] p-4"><div className="flex flex-col gap-2"><button type="button" onClick={addRootContent} disabled={locked} className="w-full rounded-xl bg-[#6B9080] py-3 font-bold text-white hover:bg-[#5A7B6D] disabled:opacity-50">＋ 新增內文</button><button type="button" onClick={addRootFolder} disabled={locked} className="w-full rounded-xl border border-[#E5E0D8] bg-white py-3 font-bold text-[#3A4F3F] hover:bg-[#F7F5F0] disabled:opacity-50">＋ 新增篇章</button></div></div><div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"><div className="space-y-3">{chapters.length ? chapters.map((chapter, index) => renderNode(chapter, index, [index], 0)) : <div className="py-8 text-center text-sm text-gray-400">目前沒有內容，請先新增一筆。</div>}</div></div></aside><section ref={rightScrollRef} className="scrollbar-hidden min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#FCFBFA] p-6">{selectedNode ? <div className="w-full space-y-6"><div className="flex flex-wrap items-center gap-1 text-sm text-[#6B9080]">{breadcrumbNodes.map((node, index) => <React.Fragment key={node.id || index}><span>{node.type === 'folder' ? getLevelLabel(index) : '內文'} {node.title?.trim() || '未命名'}</span>{index < breadcrumbNodes.length - 1 && <span>›</span>}</React.Fragment>)}</div><div className="space-y-4 rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded bg-[#E5E0D8] px-2 py-1 text-xs font-bold text-[#3A4F3F]">{selectedNode.type === 'folder' ? getLevelLabel(breadcrumbNodes.length - 1) : '內文'}</span><button type="button" onClick={() => deleteNode(selectedPath)} disabled={locked} className="ml-auto text-sm text-red-500 hover:text-red-600 disabled:opacity-50">刪除</button></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className="mb-2 block text-sm font-medium">名稱</label><input value={selectedTitleParts.pureTitle} onChange={(event) => updateNode(selectedPath, { title: buildTitle(event.target.value, selectedTitleParts.aliasText) })} disabled={locked} className="w-full rounded-xl border border-[#E5E0D8] px-3 py-2 outline-none disabled:bg-[#F7F5F0]" placeholder="輸入名稱" /></div><div><label className="mb-2 block text-sm font-medium">別名</label><input value={selectedTitleParts.aliasText} onChange={(event) => updateNode(selectedPath, { title: buildTitle(selectedTitleParts.pureTitle, event.target.value) })} disabled={locked} className="w-full rounded-xl border border-[#E5E0D8] px-3 py-2 text-[#6B9080] outline-none disabled:bg-[#F7F5F0]" placeholder="輸入別名" /></div><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">類型</label><select value={selectedNode.type || 'content'} onChange={(event) => updateNode(selectedPath, { type: event.target.value })} disabled={locked} className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 outline-none disabled:bg-[#F7F5F0] md:w-48"><option value="content">內文</option><option value="folder">篇章／目錄</option></select></div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => appendText('【概念】\n\n\n【辨證分析】\n\n\n【文獻別錄】\n')} disabled={locked} className="rounded-lg bg-[#E5E0D8]/60 px-3 py-2 text-[11px] text-[#3A4F3F] hover:bg-[#E5E0D8] disabled:opacity-50">📌 插入模板</button><button type="button" onClick={() => appendText('| 項目 | 內容 | 備註 |\n| :--- | :--- | :--- |\n| 欄位1 | 欄位2 | 欄位3 |')} disabled={locked} className="rounded-lg bg-[#E5E0D8]/60 px-3 py-2 text-[11px] text-[#3A4F3F] hover:bg-[#E5E0D8] disabled:opacity-50">📊 插入表格</button><button type="button" onClick={() => addSibling(selectedPath, 'content')} disabled={locked || !canAddSibling} className="rounded-xl border border-[#D9D1C7] bg-white px-4 py-2 text-sm font-bold text-[#3A4F3F] transition hover:border-[#3A4F3F] hover:bg-[#F7F4EF] disabled:opacity-40">＋ 新增該資料夾內文</button><button type="button" onClick={() => addSibling(selectedPath, 'folder')} disabled={locked || !canAddSibling} className="rounded-xl border border-[#D9D1C7] bg-white px-4 py-2 text-sm font-bold text-[#3A4F3F] transition hover:border-[#3A4F3F] hover:bg-[#F7F4EF] disabled:opacity-40">＋ 新增該資料子目錄</button></div></div><div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm"><label className="mb-3 block text-sm font-medium">內文</label><AutoResizeTextarea value={selectedNode.text || ''} onChange={(event) => updateNode(selectedPath, { text: event.target.value })} disabled={locked} placeholder="在此輸入詳細內容..." className="min-h-[520px] rounded-xl border border-[#E5E0D8] bg-[#FCFBFA] p-4 text-sm leading-relaxed outline-none" /></div></div> : <div className="flex h-full items-center justify-center text-gray-400"><div className="space-y-3 text-center"><p>目前尚未選擇內容。</p></div></div>}</section></main></div>;
}
