
/**
 * 書籍結構編輯器
 *
 * 作用：
 * - 新增章節
 * - 編輯章節標題
 * - 編輯章節內容
 * - 建立資料夾與子章節
 * - 刪除或移動章節
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
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

function restoreArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  }

  return [];
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const normalizedType = node.type === 'folder' ? 'folder' : 'content';

  return {
    ...node,
    id:
      node.id ||
      `${normalizedType}_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    title: typeof node.title === 'string' ? node.title : '',
    type: normalizedType,
    text: typeof node.text === 'string' ? node.text : '',
    children: restoreArray(node.children)
      .map(normalizeNode)
      .filter(Boolean),
  };
}

function normalizeChapters(value) {
  return restoreArray(value)
    .map(normalizeNode)
    .filter(Boolean);
}

function parseTitle(title = '') {
  const match = title.match(/(.*?)[（(]別名[:：](.*?)[)）]/);

  return {
    pureTitle: match ? match[1].trim() : title,
    aliasText: match ? match[2].trim() : '',
  };
}

function buildTitle(pureTitle, aliasText) {
  if (!pureTitle && !aliasText) {
    return '';
  }

  if (!aliasText) {
    return pureTitle;
  }

  return `${pureTitle}(別名：${aliasText})`;
}

function cloneDeep(value) {
  if (value == null) {
    return value;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function updateNestedState(currentData, path, updater) {
  if (path.length === 0) {
    return typeof updater === 'function'
      ? updater(currentData)
      : updater;
  }

  const [key, ...restPath] = path;

  if (Array.isArray(currentData)) {
    return currentData.map((item, index) => {
      if (index !== key) {
        return item;
      }

      return updateNestedState(item, restPath, updater);
    });
  }

  if (
    typeof currentData === 'object' &&
    currentData !== null
  ) {
    return {
      ...currentData,
      [key]: updateNestedState(
        currentData[key],
        restPath,
        updater
      ),
    };
  }

  return currentData;
}

function getNodeByPath(chapters, path) {
  let current = chapters;

  for (const key of path || []) {
    current = current?.[key];

    if (current == null) {
      return null;
    }
  }

  return current;
}

function getPathNodes(chapters, path) {
  const nodes = [];
  let current = chapters;

  for (let i = 0; i < path.length; i += 2) {
    const index = path[i];
    const node = current?.[index];

    if (!node) {
      break;
    }

    nodes.push(node);
    current = Array.isArray(node.children)
      ? node.children
      : [];
  }

  return nodes;
}

function findFirstEditableNode(chapters) {
  const queue = chapters.map((node, index) => ({
    node,
    path: [index],
  }));

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current?.node) {
      continue;
    }

    if (current.node.type === 'content') {
      return current;
    }

    const children = Array.isArray(current.node.children)
      ? current.node.children
      : [];

    children.forEach((child, index) => {
      queue.push({
        node: child,
        path: [
          ...current.path,
          'children',
          index,
        ],
      });
    });
  }

  if (chapters.length > 0) {
    return {
      node: chapters[0],
      path: [0],
    };
  }

  return null;
}

function createFolderNode() {
  return {
    id: `folder_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    title: '',
    type: 'folder',
    children: [],
    text: '',
  };
}

function createContentNode() {
  return {
    id: `content_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    title: '',
    type: 'content',
    children: [],
    text: '',
  };
}

function getLevelLabel(level) {
  const labels = [
    '篇',
    '章',
    '節',
    '目',
    '子目',
    '項',
  ];

  return labels[Math.min(level, labels.length - 1)];
}

export default function BookStructureEditor({
  formData,
  setFormData,
  disabled = false,
  isViewOnly = false,
}) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  const rawChapters = useMemo(() => {
    return formData?.bookDetails?.chapters ?? [];
  }, [formData?.bookDetails?.chapters]);

  const chapters = useMemo(() => {
    return normalizeChapters(rawChapters);
  }, [rawChapters]);

  useEffect(() => {
    if (!chapters.length) {
      setSelectedPath(null);
      return;
    }

    const currentSelectedNode = selectedPath
      ? getNodeByPath(chapters, selectedPath)
      : null;

    if (!currentSelectedNode) {
      const firstNode = findFirstEditableNode(chapters);

      setSelectedPath(firstNode?.path || [0]);
    }
  }, [chapters, selectedPath]);

  const selectedNode = useMemo(() => {
    if (!selectedPath) {
      return null;
    }

    return getNodeByPath(chapters, selectedPath);
  }, [chapters, selectedPath]);

  const breadcrumbNodes = useMemo(() => {
    if (!selectedPath) {
      return [];
    }

    return getPathNodes(chapters, selectedPath);
  }, [chapters, selectedPath]);

  const updateChapters = useCallback(
    (nextChapters) => {
      const normalizedChapters = normalizeChapters(nextChapters);

      setFormData((previousFormData) => {
        const previousBookDetails =
          previousFormData?.bookDetails || {};

        return {
          ...previousFormData,
          bookDetails: {
            ...previousBookDetails,
            chapters: normalizedChapters,
          },
        };
      });
    },
    [setFormData]
  );

  const toggleNode = useCallback((id) => {
    setExpandedNodes((previous) => ({
      ...previous,
      [id]: previous[id] === false,
    }));
  }, []);

  const updateNode = useCallback(
    (path, updates) => {
      if (!path || path.length === 0) {
        return;
      }

      const nextChapters = updateNestedState(
        chapters,
        path,
        (node) => ({
          ...node,
          ...updates,
        })
      );

      updateChapters(nextChapters);
    },
    [chapters, updateChapters]
  );

  const deleteNode = useCallback(
    (path) => {
      if (!path || path.length === 0) {
        return;
      }

      const nextChapters = cloneDeep(chapters);

      if (path.length === 1) {
        const rootIndex = path[0];

        nextChapters.splice(rootIndex, 1);
      } else {
        const parentPath = path.slice(0, -2);
        const childIndex = path[path.length - 1];
        const parentNode = getNodeByPath(
          nextChapters,
          parentPath
        );

        if (
          parentNode &&
          Array.isArray(parentNode.children)
        ) {
          parentNode.children.splice(childIndex, 1);
        }
      }

      updateChapters(nextChapters);
      setSelectedPath(null);
    },
    [chapters, updateChapters]
  );

  const addRootContent = useCallback(() => {
    const newNode = createContentNode();
    const nextChapters = [...chapters, newNode];

    updateChapters(nextChapters);
    setSelectedPath([nextChapters.length - 1]);
  }, [chapters, updateChapters]);

  const addRootFolder = useCallback(() => {
    const newNode = createFolderNode();
    const nextChapters = [...chapters, newNode];

    updateChapters(nextChapters);

    setSelectedPath([nextChapters.length - 1]);

    setExpandedNodes((previous) => ({
      ...previous,
      [newNode.id]: true,
    }));
  }, [chapters, updateChapters]);

  const addChild = useCallback(
    (parentPath, type = 'content') => {
      const newChild =
        type === 'folder'
          ? createFolderNode()
          : createContentNode();

      const nextChapters = updateNestedState(
        chapters,
        parentPath,
        (parentNode) => ({
          ...parentNode,
          children: [
            ...(Array.isArray(parentNode.children)
              ? parentNode.children
              : []),
            newChild,
          ],
        })
      );

      updateChapters(nextChapters);

      const updatedParentNode = getNodeByPath(
        nextChapters,
        parentPath
      );

      const children = Array.isArray(
        updatedParentNode?.children
      )
        ? updatedParentNode.children
        : [];

      const newChildIndex = children.length - 1;

      if (updatedParentNode?.id) {
        setExpandedNodes((previous) => ({
          ...previous,
          [updatedParentNode.id]: true,
        }));
      }

      setSelectedPath([
        ...parentPath,
        'children',
        newChildIndex,
      ]);

      if (type === 'folder') {
        setExpandedNodes((previous) => ({
          ...previous,
          [newChild.id]: true,
        }));
      }
    },
    [chapters, updateChapters]
  );

  const renderNode = useCallback(
    (node, index, path, level = 0) => {
      if (!node) {
        return null;
      }

      const isFolder = node.type === 'folder';
      const isExpanded = expandedNodes[node.id] !== false;

      const isSelected =
        Array.isArray(selectedPath) &&
        selectedPath.length === path.length &&
        selectedPath.every(
          (value, pathIndex) => value === path[pathIndex]
        );

      const { pureTitle, aliasText } = parseTitle(
        node.title || ''
      );

      const label = isFolder
        ? getLevelLabel(level)
        : '內文';

      return (
        <div
          key={node.id || index}
          className="space-y-2"
        >
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
                  onClick={(event) => {
                    event.stopPropagation();
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
                {aliasText
                  ? `（別名：${aliasText}）`
                  : ''}
              </span>

              {isFolder && node.text && (
                <span className="text-[10px] opacity-80">
                  有內文
                </span>
              )}
            </div>
          </button>

          {isFolder && isExpanded && (
            <div className="pl-4 border-l border-[#E5E0D8] space-y-2">
              {Array.isArray(node.children) &&
                node.children.map((child, childIndex) =>
                  renderNode(
                    child,
                    childIndex,
                    [
                      ...path,
                      'children',
                      childIndex,
                    ],
                    level + 1
                  )
                )}

              {!isViewOnly && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      addChild(path, 'content')
                    }
                    disabled={disabled}
                    className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] px-2 py-1 rounded hover:bg-[#6B9080]/10 disabled:opacity-50"
                  >
                    ＋ 新增內文
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      addChild(path, 'folder')
                    }
                    disabled={disabled}
                    className="text-xs font-bold text-[#6B9080] hover:text-[#5A7B6D] px-2 py-1 rounded hover:bg-[#6B9080]/10 disabled:opacity-50"
                  >
                    ＋ 新增子目錄
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      expandedNodes,
      selectedPath,
      toggleNode,
      addChild,
      isViewOnly,
      disabled,
    ]
  );

  const selectedTitleParts = useMemo(() => {
    return parseTitle(selectedNode?.title || '');
  }, [selectedNode]);

  const appendText = useCallback(
    (text) => {
      if (!selectedNode || !selectedPath) {
        return;
      }

      const currentText = selectedNode.text || '';

      updateNode(selectedPath, {
        text: currentText
          ? `${currentText}\n${text}`
          : text,
      });
    },
    [
      selectedNode,
      selectedPath,
      updateNode,
    ]
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
            {chapters.length > 0 ? (
              chapters.map((chapter, index) =>
                renderNode(
                  chapter,
                  index,
                  [index],
                  0
                )
              )
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
                {breadcrumbNodes.map((node, index) => (
                  <React.Fragment
                    key={node.id || index}
                  >
                    <span>
                      {node.type === 'folder'
                        ? getLevelLabel(index)
                        : '內文'}{' '}
                      {node.title?.trim() || '未命名'}
                    </span>

                    {index < breadcrumbNodes.length - 1 && (
                      <span>›</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-[#E5E0D8] text-[#3A4F3F]">
                    {selectedNode.type === 'folder'
                      ? getLevelLabel(
                          breadcrumbNodes.length - 1
                        )
                      : '內文'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      deleteNode(selectedPath)
                    }
                    disabled={disabled || isViewOnly}
                    className="ml-auto text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    刪除
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      名稱
                    </label>

                    <input
                      value={selectedTitleParts.pureTitle}
                      onChange={(event) =>
                        updateNode(selectedPath, {
                          title: buildTitle(
                            event.target.value,
                            selectedTitleParts.aliasText
                          ),
                        })
                      }
                      disabled={disabled || isViewOnly}
                      className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none"
                      placeholder="輸入名稱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      別名
                    </label>

                    <input
                      value={selectedTitleParts.aliasText}
                      onChange={(event) =>
                        updateNode(selectedPath, {
                          title: buildTitle(
                            selectedTitleParts.pureTitle,
                            event.target.value
                          ),
                        })
                      }
                      disabled={disabled || isViewOnly}
                      className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none text-[#6B9080] disabled:bg-[#F7F5F0]"
                      placeholder="輸入別名"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      類型
                    </label>

                    <select
                      value={selectedNode.type || 'content'}
                      onChange={(event) =>
                        updateNode(selectedPath, {
                          type: event.target.value,
                        })
                      }
                      disabled={disabled || isViewOnly}
                      className="w-full md:w-48 border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none bg-white disabled:bg-[#F7F5F0]"
                    >
                      <option value="content">
                        內文
                      </option>

                      <option value="folder">
                        篇章／目錄
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      appendText(
                        '【概念】\n\n\n【辨證分析】\n\n\n【文獻別錄】\n\n'
                      )
                    }
                    disabled={disabled || isViewOnly}
                    className="text-[11px] bg-[#E5E0D8]/60 hover:bg-[#E5E0D8] text-[#3A4F3F] px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    📌 插入模板
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      appendText(
                        '| 項目 | 內容 | 備註 |\n| :--- | :--- | :--- |\n| 欄位1 | 欄位2 | 欄位3 |'
                      )
                    }
                    disabled={disabled || isViewOnly}
                    className="text-[11px] bg-[#E5E0D8]/60 hover:bg-[#E5E0D8] text-[#3A4F3F] px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    📊 插入表格
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-medium mb-3">
                  內文
                </label>

                <AutoResizeTextarea
                  value={selectedNode.text || ''}
                  onChange={(event) =>
                    updateNode(selectedPath, {
                      text: event.target.value,
                    })
                  }
                  disabled={disabled || isViewOnly}
                  placeholder="在此輸入詳細內容..."
                  className="w-full min-h-[520px] p-4 bg-[#FCFBFA] text-sm border border-[#E5E0D8] rounded-xl outline-none leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center space-y-3">
                <p>目前尚未選擇內容。</p>

                {!isViewOnly && (
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={addRootContent}
                      disabled={disabled}
                      className="px-4 py-2 rounded-lg bg-[#6B9080] text-white disabled:opacity-50"
                    >
                      新增內文
                    </button>

                    <button
                      type="button"
                      onClick={addRootFolder}
                      disabled={disabled}
                      className="px-4 py-2 rounded-lg bg-white border border-[#E5E0D8] text-[#3A4F3F] disabled:opacity-50"
                    >
                      新增篇章
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}