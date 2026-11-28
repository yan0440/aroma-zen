import React from 'react';
import { getCategoryLabel } from '../config/categories';
import { getCardContent } from '../utils/cardContent';

export default function EntryListItem({
  item,
  onSelectItem,
}) {
  const content = getCardContent(item);

  const englishLine = content.lines.find(
    (line) => line.type === 'english'
  );

  const detailLines = content.lines.filter(
    (line) => line.type !== 'english'
  );

  const hasTags = content.tags.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      aria-label={`查看${content.name}的詳細內容`}
      className="appearance-entry-row"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {hasTags ? (
            content.tags.map((tag) =>
              tag.variant === 'code' ? (
                <span
                  key={`code-${tag.text}`}
                  className="appearance-entry-code"
                >
                  <span className="sr-only">
                    國際代碼：
                  </span>

                  {tag.text}
                </span>
              ) : (
                <span
                  key={`tag-${tag.text}`}
                  className="appearance-entry-tag"
                >
                  {tag.text}
                </span>
              )
            )
          ) : (
            <span className="appearance-entry-tag">
              {getCategoryLabel(item.category)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="break-words text-lg font-semibold">
            {content.name}
          </h3>

          {englishLine && (
            <span className="appearance-muted break-words text-sm italic">
              {englishLine.text}
            </span>
          )}
        </div>

        {detailLines.map((line, index) => {
          const key = `${line.type}-${index}`;

          if (line.type === 'plain') {
            return (
              <p
                key={key}
                className="appearance-muted mt-1 break-words text-sm leading-6"
              >
                {line.text}
              </p>
            );
          }

          return (
            <p
              key={key}
              className="appearance-muted mt-1 line-clamp-2 break-words text-sm leading-6"
            >
              {line.label && (
                <span className="mr-2 font-semibold">
                  {line.label}
                </span>
              )}

              {line.text}
            </p>
          );
        })}
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