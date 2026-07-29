import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

function AutoResizeTextarea({ value, onChange, placeholder, className, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '0px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      disabled={disabled}
      className={`${className} w-full overflow-hidden resize-none`}
    />
  );
}

function parseTitle(title = '') {
  const match = title.match(/(.*?)[（(]別名[:：](.*?)[)）]/);
  return {
    pureTitle: match ? match[1].trim() : title,
    aliasText: match ? match[2].trim() : '',
  };
}

function buildTitle(pureTitle, aliasText) {
  if (!pureTitle && !aliasText) return '';
  if (!aliasText) return pureTitle;
  return `${pureTitle}(別名：${aliasText})`;
}

function cloneDeep(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function updateNestedState(currentData, path, updater) {
  if (path.length === 0) {
    return typeof updater === 'function' ? updater(currentData) : updater;
  }

  const [key, ...restPath] = path;

  if (Array.isArray(currentData)) {
    return currentData.map((item, index) =>
      index === key ? updateNestedState(item, restPath, updater) : item
    );
  }

  if (typeof currentData === 'object' && currentData !== null) {
    return {
      ...currentData,
      [key]: updateNestedState(currentData[key], restPath, updater),
    };
  }

  return currentData;
}

function getNodeByPath(chapters, path) {
  let current = chapters;
  for (let i = 0; i < path.length; i++) {
    current = current?.[path[i]];
    if (current == null) return null;
  }
  return current;
}

function findFirstEditableNode(chapters) {
  const queue = chapters.map((node, index) => ({ node, path: [index] }));

  while (queue.length) {
    const { node, path } = queue.shift();
    if (node?.type !== 'folder') return { node, path };
    if (Array.isArray(node.children)) {
      node.children.forEach((child, idx) =>
        queue.push({ node: child, path: [...path, 'children', idx] })
      );
    }
  }

  return chapters.length ? { node: chapters[0], path: [0] } : null;
}

function createFolderNode() {
  return {
    id: `folder_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: '',
    type: 'folder',
    children: [],
    text: '',
  };
}

function createContentNode() {
  return {
    id: `content_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: '',
    type: 'content',
    children: [],
    text: '',
  };
}

function getLevelLabel(level) {
  const labels = ['篇', '章', '節', '目', '子目'];
  return labels[Math.min(level, labels.length - 1)];
}

function getPathNodes(chapters, path) {
  const nodes = [];
  let current = chapters;

  for (let i = 0; i < path.length; i += 2) {
    const index = path[i];
    const node = current?.[index];
    if (!node) break;
    nodes.push(node);
    current = node.children || [];
  }

  return nodes;
}

export default function BookStructureEditor({
  formData,
  setFormData,
  disabled = false,
  isViewOnly = false,
}) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  const chapters = formData.bookDetails?.chapters || [];

  useEffect(() => {
    if (!selectedPath && chapters.length) {
      const first = findFirstEditableNode(chapters);
      if (first) setSelectedPath(first.path);
    }
  }, [chapters, selectedPath]);

  useEffect(() => {
    if (selectedPath) {
      const node = getNodeByPath(chapters, selectedPath);
      if (!node && chapters.length) {
        const first = findFirstEditableNode(chapters);
        setSelectedPath(first?.path || null);
      }
    }
  }, [chapters, selectedPath]);

  const selectedNode = useMemo(() => {
    if (!selectedPath) return null;
    return getNodeByPath(chapters, selectedPath);
  }, [chapters, selectedPath]);

  const breadcrumbNodes = useMemo(() => {
    if (!selectedPath) return [];
    return getPathNodes(chapters, selectedPath);
  }, [chapters, selectedPath]);

  const updateChapters = useCallback((newChapters) => {
    setFormData((prev) => ({
      ...prev,
      bookDetails: {
        ...(prev.bookDetails || {}),
        chapters: newChapters,
      },
    }));
  }, [setFormData]);

  const toggleNode = useCallback((id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const updateNode = useCallback((path, updates) => {
    const newChapters = updateNestedState(chapters, path, (node) => ({ ...node, ...updates }));
    updateChapters(newChapters);
  }, [chapters, updateChapters]);

  const deleteNode = useCallback((path) => {
    if (!path || path.length === 0) return;

    const parentPath = path.slice(0, -1);
    const indexToDelete = path[path.length - 1];
    const newChapters = cloneDeep(chapters);

    if (parentPath.length === 0) {
      newChapters.splice(indexToDelete, 1);
      updateChapters(newChapters);
      setSelectedPath(null);
      return;
    }

    const parent = getNodeByPath(newChapters, parentPath);
    if (parentPath[parentPath.length - 1] === 'children' && Array.isArray(parent)) {
      parent.splice(indexToDelete, 1);
    } else if (parent && Array.isArray(parent.children)) {
      parent.children.splice(indexToDelete, 1);
    }

    updateChapters(newChapters);
    setSelectedPath(null);
  }, [chapters, updateChapters]);

  const addRootContent = useCallback(() => {
    const newNode = createContentNode();
    const newChapters = [...chapters, newNode];
    updateChapters(newChapters);
    setSelectedPath([newChapters.length - 1]);
  }, [chapters, updateChapters]);

  const addRootFolder = useCallback(() => {
    const newNode = createFolderNode();
    const newChapters = [...chapters, newNode];
    updateChapters(newChapters);
    setSelectedPath([newChapters.length - 1]);
    setExpandedNodes((prev) => ({ ...prev, [newNode.id]: true }));
  }, [chapters, updateChapters]);

  const addChild = useCallback((path, type = 'content') => {
    const newChild = type === 'folder' ? createFolderNode() : createContentNode();

    const newChapters = updateNestedState(chapters, path, (node) => {
      const currentChildren = Array.isArray(node.children) ? node.children : [];
      return { ...node, children: [...currentChildren, newChild] };
    });

    updateChapters(newChapters);

    const parentNode = getNodeByPath(newChapters, path);
    if (parentNode?.id) {
      setExpandedNodes((prev) => ({ ...prev, [parentNode.id]: true }));
    }

    const parentChildren = getNodeByPath(newChapters, path)?.children || [];
    setSelectedPath([...path, 'children', parentChildren.length - 1]);
  }, [chapters, updateChapters]);

  const renderNode = useCallback((node, index, path, level = 0) => {
    if (!node) return null;

    const isFolder = node.type === 'folder';
    const isExpanded = expandedNodes[node.id] !== false;
    const isSelected =
      selectedPath &&
      selectedPath.length === path.length &&
      selectedPath.every((v, i) => v === path[i]);

    const { pureTitle, aliasText } = parseTitle(node.title || '');
    const label = isFolder ? getLevelLabel(level) : '內文';

    return (
      <div key={node.id || index} className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedPath(path)}
          className={`w-full text-left rounded-lg border px-3 py-2 transition ${
            isSelected
              ? 'bg-[#6B9080] text-white border-[#6B9080]'
              : 'bg-white text-[#3A4F3F] border-[#E5E0D8] hover:bg-[#F7F5F0]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isFolder ? (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
                className="w-4 text-center text-xs"
              >
                {isExpanded ? '▼' : '▶'}
              </span>
            ) : (
              <span className="w-4" />
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 shrink-0">
              {label}
            </span>
            <span className="truncate flex-1">
              {pureTitle || '未命名'}
              {aliasText ? `（別名：${aliasText}）` : ''}
            </span>
          </div>
        </button>

        {isFolder && isExpanded && Array.isArray(node.children) && (
          <div className="pl-4 border-l border-[#E5E0D8] space-y-2">
            {node.children.map((child, childIdx) =>
              renderNode(child, childIdx, [...path, 'children', childIdx], level + 1)
            )}

            {!isViewOnly && (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => addChild(path, 'content')}
                  className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] px-2 py-1 rounded hover:bg-[#6B9080]/10"
                >
                  ＋ 新增內文
                </button>

                <button
                  type="button"
                  onClick={() => addChild(path, 'folder')}
                  className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] px-2 py-1 rounded hover:bg-[#6B9080]/10"
                >
                  ＋ 新增子目錄
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, selectedPath, toggleNode, addChild, isViewOnly]);

  const selectedTitleParts = useMemo(
    () => parseTitle(selectedNode?.title || ''),
    [selectedNode]
  );

  return (
    <div className="w-full bg-[#FCFBFA] flex flex-col overflow-hidden">
      <main className="flex-1 min-h-0 flex overflow-hidden">
        <aside className="w-[320px] shrink-0 border-r border-[#E5E0D8] bg-[#F7F5F0] flex flex-col min-h-0">
          <div className="shrink-0 p-4 border-b border-[#E5E0D8]">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={addRootContent}
                disabled={disabled || isViewOnly}
                className="w-full py-3 bg-[#6B9080] text-white rounded-xl font-bold hover:bg-[#5A7B6D] disabled:opacity-50"
              >
                ＋ 新增內文
              </button>

              <button
                type="button"
                onClick={addRootFolder}
                disabled={disabled || isViewOnly}
                className="w-full py-3 bg-white border border-[#E5E0D8] text-[#3A4F3F] rounded-xl font-bold hover:bg-[#F7F5F0] disabled:opacity-50"
              >
                ＋ 新增篇章
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 [scrollbar-gutter:stable]">
            {Array.isArray(chapters) && chapters.length > 0 ? (
              chapters.map((chapter, index) => renderNode(chapter, index, [index], 0))
            ) : (
              <div className="text-center text-sm text-gray-400 py-8">
                目前沒有內容，請先新增一筆。
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-[#FCFBFA] p-6 [scrollbar-gutter:stable]">
          {selectedNode ? (
            <div className="w-full space-y-6">
              <div className="text-sm text-[#6B9080] flex items-center gap-1 flex-wrap">
                {breadcrumbNodes.map((node, idx) => (
                  <React.Fragment key={node.id || idx}>
                    <span>
                      {node.type === 'folder' ? getLevelLabel(idx) : '內文'} {node.title?.trim() || '未命名'}
                    </span>
                    {idx < breadcrumbNodes.length - 1 && <span>›</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-[#E5E0D8] text-[#3A4F3F]">
                    {selectedNode.type === 'folder' ? getLevelLabel(breadcrumbNodes.length - 1) : '內文'}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteNode(selectedPath)}
                    disabled={disabled || isViewOnly}
                    className="ml-auto text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    刪除
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">名稱</label>
                    <input
                      value={selectedTitleParts.pureTitle}
                      onChange={(e) =>
                        updateNode(selectedPath, {
                          title: buildTitle(e.target.value, selectedTitleParts.aliasText),
                        })
                      }
                      disabled={disabled || isViewOnly}
                      className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none"
                      placeholder="輸入名稱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">別名</label>
                    <input
                      value={selectedTitleParts.aliasText}
                      onChange={(e) =>
                        updateNode(selectedPath, {
                          title: buildTitle(selectedTitleParts.pureTitle, e.target.value),
                        })
                      }
                      disabled={disabled || isViewOnly}
                      className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none text-[#6B9080] disabled:bg-[#F7F5F0]"
                      placeholder="輸入別名"
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const template = '【概念】\n\n\n【辨證分析】\n\n\n【文獻別錄】\n\n';
                      const currentText = selectedNode.text || '';
                      updateNode(selectedPath, {
                        text: currentText ? currentText + '\n' + template : template,
                      });
                    }}
                    disabled={disabled || isViewOnly}
                    className="text-[11px] bg-[#E5E0D8]/60 hover:bg-[#E5E0D8] text-[#3A4F3F] px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    📌 插入模板
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tableTemplate =
                        '\n| 項目 | 內容 | 備註 |\n| :--- | :--- | :--- |\n| 欄位1 | 欄位2 | 欄位3 |\n';
                      const currentText = selectedNode.text || '';
                      updateNode(selectedPath, {
                        text: currentText ? currentText + '\n' + tableTemplate : tableTemplate,
                      });
                    }}
                    disabled={disabled || isViewOnly}
                    className="text-[11px] bg-[#E5E0D8]/60 hover:bg-[#E5E0D8] text-[#3A4F3F] px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    📊 插入表格
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-medium mb-3">內文</label>
                <AutoResizeTextarea
                  value={selectedNode.text || ''}
                  onChange={(e) => updateNode(selectedPath, { text: e.target.value })}
                  disabled={disabled || isViewOnly}
                  placeholder="在此輸入詳細內容..."
                  className="w-full min-h-[520px] p-4 bg-[#FCFBFA] text-sm border border-[#E5E0D8] rounded-xl outline-none leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              請從左側選擇一個節點開始編輯
            </div>
          )}
        </section>
      </main>
    </div>
  );
}