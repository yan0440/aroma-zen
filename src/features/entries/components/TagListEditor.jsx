import React from 'react';

export default function TagListEditor({
  tags,
  onChange,
  disabled = false,
  readOnly = false,
  inputClass = '',
  placeholder = '輸入標籤',
}) {
  const list =
    Array.isArray(tags) && tags.length > 0 ? tags : [''];

  if (readOnly) {
    const filled = list
      .map((tag) => String(tag || '').trim())
      .filter(Boolean);

    if (filled.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {filled.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="rounded-xl border border-[#E5E0D8] bg-[#FBF9F6] px-4 py-2 text-sm text-[#4B5563]"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }

  const updateTag = (index, value) => {
    onChange(
      list.map((tag, tagIndex) =>
        tagIndex === index ? value : tag
      )
    );
  };

  const addTag = () => {
    onChange([...list, '']);
  };

  const removeTag = (index) => {
    const next = list.filter(
      (_, tagIndex) => tagIndex !== index
    );

    onChange(next.length > 0 ? next : ['']);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {list.map((tag, index) => (
          <div
            key={index}
            className="flex w-full items-center gap-2 sm:w-56"
          >
            <input
              disabled={disabled}
              className={inputClass}
              value={tag}
              placeholder={placeholder}
              aria-label={`標籤 ${index + 1}`}
              onChange={(event) =>
                updateTag(index, event.target.value)
              }
            />

            {list.length > 1 && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeTag(index)}
                aria-label={`刪除標籤 ${index + 1}`}
                className="shrink-0 px-2 py-1 text-[#A39284] hover:text-[#3A4F3F] disabled:opacity-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={addTag}
        className="rounded-xl border border-dashed border-[#3A4F3F]/40 px-4 py-2 text-sm font-bold text-[#3A4F3F] hover:bg-[#3A4F3F]/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ＋ 增加標籤
      </button>
    </div>
  );
}