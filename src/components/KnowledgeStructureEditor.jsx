import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

const createId = (prefix = 'knowledge') =>
  `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const createTableRow = () => ({
  id: createId('row'),
  left: '',
  right: '',
});

const createBlock = (type) => {
  if (type === 'table') {
    return {
      id: createId('table'),
      type: 'table',
      rows: [createTableRow()],
    };
  }

  if (type === 'subtitle') {
    return {
      id: createId('subtitle'),
      type: 'subtitle',
      text: '',
    };
  }

  return {
    id: createId('text'),
    type: 'text',
    text: '',
  };
};

const createNode = () => ({
  id: createId('section'),
  title: '',
  blocks: [],
  children: [],
});

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data || []));

const normalizeSections = (sections) => {
  if (Array.isArray(sections)) {
    return sections;
  }

  if (
    sections &&
    typeof sections === 'object'
  ) {
    return Object.values(sections);
  }

  return [];
};

const normalizeNode = (node) => {
  if (!node || typeof node !== 'object') {
    return createNode();
  }

  const currentBlocks = Array.isArray(
    node.blocks
  )
    ? node.blocks
    : [];

  const legacyBlocks = [];

  if (
    currentBlocks.length === 0 &&
    node.text &&
    String(node.text).trim() !== ''
  ) {
    legacyBlocks.push({
      id: createId('legacy_text'),
      type: 'text',
      text: node.text,
    });
  }

  const blocks = [
    ...currentBlocks,
    ...legacyBlocks,
  ];

  return {
    ...node,
    id: node.id || createId('section'),
    title: node.title || '',
    blocks,
    children: normalizeSections(
      node.children
    ),
  };
};

const getSectionsFromFormData = (
  formData
) => {
  const sections =
    formData?.knowledgeDetails?.sections;

  return normalizeSections(sections).map(
    normalizeNode
  );
};

const updateNodeAtPath = (
  nodes,
  path,
  updater
) => {
  if (path.length === 0) {
    return updater(nodes);
  }

  const [index, ...rest] = path;
  const next = [...nodes];

  if (!next[index]) {
    return nodes;
  }

  const currentNode = normalizeNode(
    next[index]
  );

  if (rest.length === 0) {
    next[index] = updater(currentNode);
    return next;
  }

  currentNode.children =
    updateNodeAtPath(
      normalizeSections(
        currentNode.children
      ),
      rest,
      updater
    );

  next[index] = currentNode;

  return next;
};

const removeNodeAtPath = (nodes, path) => {
  if (path.length === 0) {
    return nodes;
  }

  if (path.length === 1) {
    return nodes.filter(
      (_, index) => index !== path[0]
    );
  }

  const [index, ...rest] = path;
  const next = [...nodes];

  if (!next[index]) {
    return nodes;
  }

  const currentNode = normalizeNode(
    next[index]
  );

  currentNode.children =
    removeNodeAtPath(
      normalizeSections(
        currentNode.children
      ),
      rest
    );

  next[index] = currentNode;

  return next;
};

const updateBlockAtIndex = (
  node,
  blockIndex,
  updater
) => {
  const blocks = Array.isArray(node.blocks)
    ? [...node.blocks]
    : [];

  if (!blocks[blockIndex]) {
    return node;
  }

  blocks[blockIndex] = updater(
    blocks[blockIndex]
  );

  return {
    ...node,
    blocks,
  };
};

const removeBlockAtIndex = (
  node,
  blockIndex
) => {
  const blocks = Array.isArray(node.blocks)
    ? node.blocks.filter(
        (_, index) => index !== blockIndex
      )
    : [];

  return {
    ...node,
    blocks,
  };
};

function TableBlockEditor({
  block,
  blockIndex,
  disabled,
  inputClass,
  labelClass,
  onUpdateBlock,
  onDeleteBlock,
}) {
  const rows = Array.isArray(block.rows)
    ? block.rows
    : [];

  const updateRow = (
    rowIndex,
    key,
    value
  ) => {
    onUpdateBlock((currentBlock) => {
      const nextRows = rows.map(
        (row, index) => {
          if (index !== rowIndex) {
            return row;
          }

          return {
            ...row,
            [key]: value,
          };
        }
      );

      return {
        ...currentBlock,
        rows: nextRows,
      };
    });
  };

  const addRow = () => {
    onUpdateBlock((currentBlock) => ({
      ...currentBlock,
      rows: [
        ...(Array.isArray(
          currentBlock.rows
        )
          ? currentBlock.rows
          : []),
        createTableRow(),
      ],
    }));
  };

  const deleteRow = (rowIndex) => {
    onUpdateBlock((currentBlock) => {
      const nextRows = (
        Array.isArray(currentBlock.rows)
          ? currentBlock.rows
          : []
      ).filter(
        (_, index) => index !== rowIndex
      );

      return {
        ...currentBlock,
        rows:
          nextRows.length > 0
            ? nextRows
            : [createTableRow()],
      };
    });
  };

  return (
    <div className="rounded-2xl border border-[#D8C8B8] bg-[#FFFDF8] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-base font-bold text-[#3A4F3F]">
          📋 雙欄表格
        </h4>

        {!disabled && (
          <button
            type="button"
            onClick={onDeleteBlock}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#D0766E] transition hover:bg-red-50"
          >
            刪除表格
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr>
              <th className="w-[30%] border border-[#E5E0D8] bg-[#F4EFE7] px-3 py-3 text-left text-sm font-bold text-[#4E6654]">
                左欄標題
              </th>

              <th className="border border-[#E5E0D8] bg-[#F4EFE7] px-3 py-3 text-left text-sm font-bold text-[#4E6654]">
                右欄內容
              </th>

              {!disabled && (
                <th className="w-20 border border-[#E5E0D8] bg-[#F4EFE7] px-2 py-3 text-center text-sm font-bold text-[#4E6654]">
                  操作
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={
                  row.id ||
                  `row-${blockIndex}-${rowIndex}`
                }
              >
                <td className="border border-[#E5E0D8] p-2 align-top">
                  <input
                    disabled={disabled}
                    value={row.left || ''}
                    placeholder="例如：英文名稱、學名、備註"
                    className={inputClass}
                    onChange={(event) =>
                      updateRow(
                        rowIndex,
                        'left',
                        event.target.value
                      )
                    }
                  />
                </td>

                <td className="border border-[#E5E0D8] p-2 align-top">
                  <textarea
                    disabled={disabled}
                    value={row.right || ''}
                    placeholder="輸入對應內容"
                    className={`${inputClass} min-h-[90px] resize-y`}
                    onChange={(event) =>
                      updateRow(
                        rowIndex,
                        'right',
                        event.target.value
                      )
                    }
                  />
                </td>

                {!disabled && (
                  <td className="border border-[#E5E0D8] p-2 text-center align-top">
                    <button
                      type="button"
                      onClick={() =>
                        deleteRow(rowIndex)
                      }
                      className="rounded-lg px-2 py-1 text-sm text-[#D0766E] hover:bg-red-50"
                    >
                      刪除
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={addRow}
          className="mt-4 rounded-xl border border-[#C8A97E] bg-white px-4 py-2 text-[15px] font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
        >
          ＋ 新增表格列
        </button>
      )}
    </div>
  );
}

function KnowledgeBlockEditor({
  block,
  blockIndex,
  disabled,
  inputClass,
  labelClass,
  onUpdateBlock,
  onDeleteBlock,
}) {
  const blockType = block.type || 'text';

  if (blockType === 'table') {
    return (
      <TableBlockEditor
        block={block}
        blockIndex={blockIndex}
        disabled={disabled}
        inputClass={inputClass}
        labelClass={labelClass}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
      />
    );
  }

  if (blockType === 'subtitle') {
    return (
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FBF9F6] p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <label className={labelClass}>
            副標題
          </label>

          {!disabled && (
            <button
              type="button"
              onClick={onDeleteBlock}
              className="mb-1 rounded-lg px-3 py-1.5 text-sm font-medium text-[#D0766E] transition hover:bg-red-50"
            >
              刪除副標題
            </button>
          )}
        </div>

        <input
          disabled={disabled}
          value={block.text || ''}
          placeholder="例如：使用方式、注意事項、基本資料"
          className={inputClass}
          onChange={(event) =>
            onUpdateBlock((currentBlock) => ({
              ...currentBlock,
              text: event.target.value,
            }))
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FBF9F6] p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className={labelClass}>
          文字內容
        </label>

        {!disabled && (
          <button
            type="button"
            onClick={onDeleteBlock}
            className="mb-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#D0766E] transition hover:bg-red-50"
          >
            刪除文字
          </button>
        )}
      </div>

      <textarea
        disabled={disabled}
        value={block.text || ''}
        placeholder="輸入詳細內容，可使用換行、**粗體**、==標記==。"
        className={`${inputClass} min-h-[150px] resize-y`}
        onChange={(event) =>
          onUpdateBlock((currentBlock) => ({
            ...currentBlock,
            text: event.target.value,
          }))
        }
      />
    </div>
  );
}

function KnowledgeNodeEditor({
  node,
  path,
  level,
  disabled,
  labelClass,
  inputClass,
  onUpdate,
  onAddChild,
  onDelete,
  defaultOpen = false,
}) {
  const normalizedNode =
    normalizeNode(node);
const [isOpen, setIsOpen] =
  useState(defaultOpen);
  const blocks = Array.isArray(
    normalizedNode.blocks
  )
    ? normalizedNode.blocks
    : [];

  const children = normalizeSections(
    normalizedNode.children
  ).map(normalizeNode);

  const updateNode = (key, value) => {
    onUpdate(path, (currentNode) => ({
      ...normalizeNode(currentNode),
      [key]: value,
    }));
  };

  const addBlock = (type) => {
    onUpdate(path, (currentNode) => {
      const current = normalizeNode(
        currentNode
      );

      return {
        ...current,
        blocks: [
          ...(Array.isArray(current.blocks)
            ? current.blocks
            : []),
          createBlock(type),
        ],
      };
    });
  };

  const updateBlock = (
    blockIndex,
    updater
  ) => {
    onUpdate(path, (currentNode) =>
      updateBlockAtIndex(
        normalizeNode(currentNode),
        blockIndex,
        updater
      )
    );
  };

  const deleteBlock = (blockIndex) => {
    onUpdate(path, (currentNode) =>
      removeBlockAtIndex(
        normalizeNode(currentNode),
        blockIndex
      )
    );
  };

  return (
    <div
  className={`rounded-2xl border border-[#E5E0D8] bg-white px-3 py-1.5 shadow-sm ${
    level > 0
      ? 'ml-4 border-l-4 border-l-[#C8A97E] md:ml-8'
      : ''
  }`}
>
      <div className="flex min-h-[42px] flex-wrap items-center justify-between gap-1 leading-none">
  <button
    type="button"
    onClick={() =>
      setIsOpen((previous) => !previous)
    }
    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition hover:opacity-80"
    aria-expanded={isOpen}
  >
    

    <span className="shrink-0 rounded-full bg-[#F4EFE7] px-3 py-1 text-[13px] font-bold text-[#7C8A80]">
      {level === 0
        ? '主要章節'
        : `子章節 ${level}`}
    </span>

    <span className="min-w-0 truncate text-[20px] font-bold text-[#2F4638] md:text-[14px]">
  {normalizedNode.title ||
    '未命名章節'}
</span>

  </button>

  <div className="flex shrink-0 items-center gap-2">
    <button
      type="button"
      onClick={() =>
        setIsOpen((previous) => !previous)
      }
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
    >
      {isOpen ? '收合' : '展開'}
    </button>

    {!disabled && (
      <button
        type="button"
        onClick={() => onDelete(path)}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#D0766E] transition hover:bg-red-50"
      >
        刪除此章節
      </button>
    )}
  </div>
</div>

      {isOpen && (
  <div>
    <div className="mb-5">
      <label className={labelClass}>
        章節名稱
      </label>

        <input
          disabled={disabled}
          value={normalizedNode.title || ''}
          placeholder="例如：荷荷芭油"
          className={inputClass}
          onChange={(event) =>
            updateNode(
              'title',
              event.target.value
            )
          }
        />
      </div>

      <div className="space-y-4">
        {blocks.map((block, blockIndex) => (
          <KnowledgeBlockEditor
            key={
              block.id ||
              `${block.type}-${blockIndex}`
            }
            block={block}
            blockIndex={blockIndex}
            disabled={disabled}
            inputClass={inputClass}
            labelClass={labelClass}
            onUpdateBlock={(updater) =>
              updateBlock(
                blockIndex,
                updater
              )
            }
            onDeleteBlock={() =>
              deleteBlock(blockIndex)
            }
          />
        ))}
      </div>

      {!disabled && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E5E0D8] pt-4">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
          >
            ＋ 新增文字
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock('subtitle')
            }
            className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
          >
            ＋ 新增副標題
          </button>

          <button
            type="button"
            onClick={() => addBlock('table')}
            className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
          >
            ＋ 新增表格
          </button>

          <button
            type="button"
            onClick={() => onAddChild(path)}
            className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-2 text-[15px] font-medium text-[#6B9080] transition hover:bg-[#F3E1C5]"
          >
            ＋ 新增子章節
          </button>
        </div>
      )}

      {children.length > 0 && (
        <div className="mt-6 space-y-4">
          {children.map((child, index) => (
            <KnowledgeNodeEditor
              key={
                child.id ||
                `${child.title}-${index}`
              }
              node={child}
              path={[...path, index]}
              level={level + 1}
              defaultOpen={false}
              disabled={disabled}
              labelClass={labelClass}
              inputClass={inputClass}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
        </div>
)}
    </div>
  );
}


export default function KnowledgeStructureEditor({
  formData,
  setFormData,
  labelClass,
  inputClass,
  disabled = false,
  isViewOnly = false,
}) {
  const isDisabled =
    disabled || isViewOnly;

  const sections = useMemo(
    () =>
      getSectionsFromFormData(formData),
    [formData]
  );

  const updateSections = useCallback(
    (updater) => {
      setFormData((previous) => {
        const currentSections =
          getSectionsFromFormData(previous);

        const clonedSections =
          cloneData(currentSections);

        const nextSections =
          typeof updater === 'function'
            ? updater(clonedSections)
            : updater;

        return {
          ...previous,
          knowledgeDetails: {
            ...(previous.knowledgeDetails || {}),
            sections: Array.isArray(
              nextSections
            )
              ? nextSections
              : [],
          },
        };
      });
    },
    [setFormData]
  );

  const handleUpdate = useCallback(
    (path, updater) => {
      updateSections((previous) =>
        updateNodeAtPath(
          previous,
          path,
          updater
        )
      );
    },
    [updateSections]
  );

  const handleAddRoot = useCallback(() => {
    updateSections((previous) => [
      ...previous,
      createNode(),
    ]);
  }, [updateSections]);

  const handleAddChild = useCallback(
    (path) => {
      updateSections((previous) =>
        updateNodeAtPath(
          previous,
          path,
          (node) => {
            const current =
              normalizeNode(node);

            return {
              ...current,
              children: [
                ...normalizeSections(
                  current.children
                ),
                createNode(),
              ],
            };
          }
        )
      );
    },
    [updateSections]
  );

  const handleDelete = useCallback(
    (path) => {
      const confirmed = window.confirm(
        '確定要刪除這個章節嗎？'
      );

      if (!confirmed) {
        return;
      }

      updateSections((previous) =>
        removeNodeAtPath(previous, path)
      );
    },
    [updateSections]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E0D8] bg-[#FBF9F6] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-[#3A4F3F]">
            內容架構
          </h3>

          <p className="mt-1 text-[14px] leading-7 text-[#A39284]">
            可建立章節、文字、副標題與雙欄表格。
          </p>
        </div>

        <div className="hidden md:block">
          <span className="text-[14px] text-[#A39284]">
            可使用右下角按鈕新增主要章節
          </span>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D8C8B8] bg-[#FFFDF9] px-5 py-10 text-center text-[16px] leading-8 text-[#A39284]">
          尚未建立內容架構。
          <br />

          {isDisabled
            ? '目前沒有可顯示的章節內容。'
            : '請使用右下角「新增主要章節」開始建立。'}
        </div>
      ) : (
        <div className="space-y-5">
  {sections.map((node, index) => (
            <KnowledgeNodeEditor
              key={
                node.id ||
                `${node.title}-${index}`
              }
              node={node}
              path={[index]}
              level={0}
              defaultOpen={
  index === sections.length - 1}
              disabled={isDisabled}
              labelClass={labelClass}
              inputClass={inputClass}
              onUpdate={handleUpdate}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!isDisabled && (
  <div className="pointer-events-none sticky bottom-5 z-40 flex justify-end pb-2 md:bottom-6">
    <button
      type="button"
      onClick={handleAddRoot}
      aria-label="新增主要章節"
      className="pointer-events-auto rounded-full border border-white/40 bg-[#3A4F3F]/95 px-5 py-3 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(47,70,56,0.28)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#2C3C30] hover:shadow-xl"
    >
      ＋ 新增主要章節
    </button>
  </div>
)}
    </div>
  );
}