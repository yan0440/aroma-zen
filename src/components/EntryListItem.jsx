import React from 'react';
import { getCategoryLabel } from '../config/categories';
import { asText } from '../utils/entryData';

export default function EntryListItem({
  item,
  onSelectItem,
}) {
  const code = asText(item.acuTable?.code);

  const englishName = [
    item.englishName,
    item.english,
    item['英文名'],
    item['英文名稱'],
    item.latin,
  ]
    .map(asText)
    .find(Boolean);

  const description = [
    item.indications,
    item.effect,
    item['主治'],
    item['主治功效'],
    item['功效'],
    item.alias,
    item.meridian,
    item.acuTable?.meridian,
  ]
    .map(asText)
    .find(Boolean);

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      aria-label={`查看${item.name || '未命名'}的詳細內容`}
      className="appearance-entry-row"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="appearance-entry-tag">
            {getCategoryLabel(item.category)}
          </span>

          {code && (
            <span className="appearance-entry-code">
              <span className="sr-only">
                國際代碼：
              </span>
              {code}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="break-words text-lg font-semibold">
            {item.name || '未命名'}
          </h3>

          {englishName && (
            <span className="appearance-muted break-words text-sm italic">
              {englishName}
            </span>
          )}
        </div>

        {description && (
          <p className="appearance-muted mt-2 line-clamp-2 break-words text-sm leading-6">
            {description}
          </p>
        )}
      </div>

      <span
        aria-hidden="true"
        className="appearance-muted shrink-0 text-xl"
      >
        →
      </span>
    </button>
  );
}