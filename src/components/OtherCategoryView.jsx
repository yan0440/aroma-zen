import React, {
  useMemo,
  useState,
} from 'react';

const OTHER_CATEGORY = '其他';

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const getCreatedTime = (item) => {
  const value = item?.createdAt;

  if (typeof value === 'number') {
    return value;
  }

  if (
    value &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  }

  return 0;
};

const getSearchText = (item) => {
  const fields = [
    item?.name,
    item?.tag,
    item?.alias,
    item?.description,
    item?.source,
    item?.effect,
    item?.indications,
    item?.literature,
    item?.contraindication,
    item?.note,
    item?.analysis,
    item?.discussion,
    item?.modernApp,
    item?.modernPharmacology,
    item?.property,
    item?.nature,
    item?.family,
    item?.traits,
    item?.directions,
  ];

  return normalizeText(
    fields
      .filter(Boolean)
      .join(' ')
  );
};

const getVisibleFields = (item) => {
  const fields = [
    {
      label: '核心標籤',
      value: item?.tag,
    },
    {
      label: '別名',
      value: item?.alias,
    },
    {
      label: '來源',
      value: item?.source,
    },
    {
      label: '功效',
      value: item?.effect,
    },
    {
      label: '主治',
      value: item?.indications,
    },
    {
      label: '性質／特徵',
      value: item?.traits,
    },
    {
      label: '注意禁忌',
      value: item?.contraindication,
    },
    {
      label: '文獻資料',
      value: item?.literature,
    },
    {
      label: '補充說明',
      value: item?.note,
    },
    {
      label: '現代應用',
      value: item?.modernApp,
    },
    {
      label: '現代藥理',
      value: item?.modernPharmacology,
    },
  ];

  return fields.filter(
    (field) =>
      field.value !== undefined &&
      field.value !== null &&
      String(field.value).trim() !== ''
  );
};

function EntryDetail({
  item,
  onBack,
}) {
  const visibleFields =
    getVisibleFields(item);

  const tags = [
    item?.tag,
    item?.alias,
  ].filter(Boolean);

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_8px_24px_rgba(122,106,90,0.06)] md:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#7F6D5F] transition-colors hover:text-[#3A4F3F]"
      >
        ← 返回名詞／用品列表
      </button>

      <div className="mb-5">
        <span className="mb-3 inline-block rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold text-[#3A4F3F]">
          名詞／用品
        </span>

        <h3 className="text-3xl font-black tracking-tight text-[#2F4638]">
          {item?.name || '未命名資料'}
        </h3>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#E7DED4] bg-[#F9F7F3] px-3 py-1 text-xs text-[#6B9080]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 h-[2px] w-full bg-[#E8E0D6]" />

      {item?.description && (
        <section className="mb-7">
          <h4 className="mb-2 text-sm font-bold text-[#2F4638]">
            簡介
          </h4>

          <p className="whitespace-pre-wrap text-sm leading-7 text-[#5F6F65]">
            {item.description}
          </p>
        </section>
      )}

      {visibleFields.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {visibleFields.map(
            ({ label, value }) => (
              <section
                key={label}
                className="rounded-2xl border border-[#E7DED4] bg-[#FDFBF8] p-4"
              >
                <h4 className="mb-2 text-sm font-bold text-[#2F4638]">
                  {label}
                </h4>

                <p className="whitespace-pre-wrap text-sm leading-7 text-[#5F6F65]">
                  {value}
                </p>
              </section>
            )
          )}
        </div>
      )}

      {!item?.description &&
        visibleFields.length === 0 && (
          <div className="rounded-2xl border border-[#E7DED4] bg-[#FDFBF8] px-5 py-8 text-center text-sm text-[#A39284]">
            這筆資料目前還沒有詳細介紹。
          </div>
        )}
    </div>
  );
}

function EntryCard({
  item,
  onClick,
}) {
  const tags = [
    item?.tag,
    item?.alias,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[1.5rem] border border-[#E7DED4] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#C8A97E] hover:bg-[#FFFDF9] hover:shadow-md"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />

      <div className="mb-3 flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full border border-[#E7DED4] bg-[#F9F7F3] px-2.5 py-1 text-[11px] text-[#7C8A80]"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-[#F4EFE7] px-2.5 py-1 text-[11px] text-[#A39284]">
            名詞／用品
          </span>
        )}
      </div>

      <h4 className="text-xl font-black text-[#2F4638] transition-colors group-hover:text-[#6B9080]">
        {item?.name || '未命名資料'}
      </h4>

      {item?.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5F6F65]">
          {item.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-[#EEE6DC] pt-4">
        <span className="text-xs text-[#A39284]">
          點擊查看詳細介紹
        </span>

        <span className="text-sm font-semibold text-[#6B9080] transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </button>
  );
}

export default function OtherCategoryView({
  allData = [],
}) {
  const [activeItem, setActiveItem] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const otherItems = useMemo(() => {
    return allData
      .filter(
        (item) =>
          item &&
          item.category === OTHER_CATEGORY &&
          item.name
      )
      .sort((a, b) => {
        const timeA = getCreatedTime(a);
        const timeB = getCreatedTime(b);

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return String(a.name).localeCompare(
          String(b.name),
          'zh-Hant'
        );
      });
  }, [allData]);

  const filteredItems = useMemo(() => {
    const keyword = normalizeText(
      searchQuery
    );

    if (!keyword) {
      return otherItems;
    }

    return otherItems.filter((item) =>
      getSearchText(item).includes(keyword)
    );
  }, [otherItems, searchQuery]);

  if (activeItem) {
    return (
      <EntryDetail
        item={activeItem}
        onBack={() => setActiveItem(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-2xl font-black tracking-tight text-[#2F4638] md:text-3xl">
          名詞／用品總覽
        </h3>

        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E8E0D6] to-transparent" />
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-[0_8px_24px_rgba(122,106,90,0.06)]">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="搜尋名詞、用品或相關說明..."
          className="w-full rounded-2xl border border-[#E6DDD3] bg-white px-4 py-3 text-sm text-[#3A4F3F] outline-none transition focus:border-[#3A4F3F]/30"
        />
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredItems.map((item, index) => (
            <EntryCard
              key={
                item.id ||
                item.entryKey ||
                `${item.name}-${index}`
              }
              item={item}
              onClick={() =>
                setActiveItem(item)
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-[#E7DED4] bg-white px-6 py-16 text-center text-[#A39284] shadow-sm">
          {searchQuery
            ? '找不到符合的名詞或用品。'
            : '目前還沒有名詞／用品資料。'}
        </div>
      )}
    </div>
  );
}