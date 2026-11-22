import React, { memo, useCallback, useMemo } from 'react';
import { getLocationLabel } from '../utils/locationLabel';
import { getCategoryTheme } from '../config/categories';
import Sprig from './Sprig';

const TITLE_FONT = {
  fontFamily:
    '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", serif',
};

const getCategoryType = (category) => {
  const value = String(category || '').trim();

  return {
    isOil: value === '精油',
    isAcupuncture:
      value === '穴道' ||
      value === '穴位' ||
      value === '腧穴',
    isChineseMedicine:
      value === '中藥' ||
      value === '中医' ||
      value === '藥材' ||
      value === '药材',
  };
};

const firstValue = (item, keys) => {
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((current, part) => current?.[part], item);

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
};

const DataCard = memo(function DataCard({
  item = {},
  onSelectItem,
}) {
  const {
    isOil,
    isAcupuncture,
    isChineseMedicine,
  } = useMemo(
    () => getCategoryType(item.category),
    [item.category]
  );

  const resolvedCategory = isOil
    ? '精油'
    : isAcupuncture
      ? '穴道'
      : isChineseMedicine
        ? '中藥'
        : item.category;

  const theme = getCategoryTheme(resolvedCategory);

  const cardStyle = {
    '--cat-deep': theme?.deep || '#527565',
    '--cat-mid': theme?.mid || '#9AAE9F',
    '--cat-tint': theme?.tint || '#EEF2EA',
  };

  const englishName = String(
    firstValue(item, [
      'englishName',
      'english',
      '英文名',
      '英文名稱',
      'latin',
    ]) || ''
  ).trim();

  const indications = String(
    firstValue(item, [
      'indications',
      'effect',
      '主治',
      '主治功效',
      '功效',
    ]) || ''
  ).trim();

  const meridian = String(
    firstValue(item, [
      'meridian',
      'acuTable.meridian',
    ]) || ''
  ).trim();

  const rawLocation = String(
    firstValue(item, [
      'acuDetails.location',
      'acuTable.location',
      'location',
    ]) || ''
  ).trim();

  const locationLabel = isAcupuncture
    ? getLocationLabel(rawLocation)
    : '';

  const acupunctureCode = isAcupuncture
    ? String(item.acuTable?.code || '').trim()
    : '';

  const categoryLabel =
    resolvedCategory === '其他' ||
    resolvedCategory === '名詞材料'
      ? '名詞材料'
      : String(resolvedCategory || '').trim();

  const tags = useMemo(() => {
    const values = [
      item.tag,
      item.type,
      item.constitutionTag,
      item.chemicalTag,
    ];

    if (isAcupuncture) {
      values.push(
        item.meridian,
        item.acuTable?.meridian
      );
    }

    return values
      .flatMap((value) =>
        Array.isArray(value) ? value : [value]
      )
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      );
  }, [
    item.tag,
    item.type,
    item.constitutionTag,
    item.chemicalTag,
    item.meridian,
    item.acuTable?.meridian,
    isAcupuncture,
  ]);

  const handleClick = useCallback(() => {
    onSelectItem?.(item);
  }, [item, onSelectItem]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        onSelectItem?.(item);
      }
    },
    [item, onSelectItem]
  );

  const subtitle = isOil
    ? englishName
    : isAcupuncture
      ? acupunctureCode
      : item.category === '其他'
        ? item.type || item.alias || ''
        : item.alias || '';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`查看${item.name || '未命名'}的詳細內容`}
      style={cardStyle}
      className="
        group relative isolate flex h-full min-w-0
        cursor-pointer flex-col overflow-hidden
        rounded-[20px] border border-[#E2E2D8]
        bg-[#FFFDF8]
        shadow-[0_2px_5px_rgba(40,60,50,0.025),0_12px_28px_-22px_rgba(40,60,50,0.18)]
        transition-[border-color,box-shadow] duration-300
        hover:border-[#B8C2B5]
        hover:shadow-[0_3px_8px_rgba(40,60,50,0.04),0_18px_38px_-24px_rgba(40,60,50,0.26)]
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-[#527565]
        motion-reduce:transition-none
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 top-0
          z-0 h-32
          bg-[linear-gradient(150deg,var(--cat-tint)_0%,transparent_75%)]
          opacity-35
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-7 top-0
          z-0 h-px
          bg-gradient-to-r from-transparent
          via-white to-transparent
        "
      />

      <Sprig
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-3 top-10
          z-0 h-28 w-20 rotate-12
          text-[color:var(--cat-deep)] opacity-[0.12]
        "
      />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-5 pt-6 md:px-7 md:pt-7">
        <div className="mb-1 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, index) => (
                <span
                  key={`tag-${index}-${tag}`}
                  className="
                    inline-flex max-w-full items-center
                    rounded-md border border-[#DCE2D7]
                    bg-[#FFFDF8]/80 px-2.5 py-1
                    text-[11px] font-medium leading-5
                    tracking-[0.04em] text-[#536A5C]
                  "
                >
                  <span className="break-words">
                    {tag}
                  </span>
                </span>
              ))}

              {acupunctureCode && (
                <span
                  className="
                    inline-flex shrink-0 items-center justify-center
                    rounded-md border border-[#405E4C]
                    bg-[#324D3D] px-2.5 py-1
                    font-sans text-[13px] font-semibold
                    leading-5 tracking-[0.06em] text-[#FFFDF8]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  "
                >
                  <span className="sr-only">
                    國際代碼：
                  </span>
                  {acupunctureCode}
                </span>
              )}

              {tags.length === 0 && !acupunctureCode && (
                <span className="text-[11px] font-medium tracking-[0.16em] text-[#777D72]">
                  本草與芳香
                </span>
              )}
            </div>
          </div>

          {categoryLabel && (
            <span className="shrink-0 pt-1 text-[10px] font-medium tracking-[0.18em] text-[#777D72]">
              {categoryLabel}
            </span>
          )}
        </div>

        <div className="relative pr-8">
          <h3
            style={TITLE_FONT}
            className="
              break-words text-[25px] font-semibold
              leading-[1.5] tracking-[0.06em]
              text-[#283C32] md:text-[27px]
            "
          >
            {item.name || '未命名'}
          </h3>

          {isOil && (
            <div className="mt-2 space-y-4">
              {englishName && (
                <div className="break-words font-latin text-[18px] italic leading-7 tracking-[0.015em] text-[#627B69]">
                  {englishName}
                </div>
              )}

              {indications && (
                <div className="line-clamp-3 whitespace-pre-wrap break-words text-[14px] leading-[1.9] tracking-[0.025em] text-[#596358]">
                  {indications}
                </div>
              )}
            </div>
          )}

          {isAcupuncture && (
            <div className="mt-2 space-y-3">
              {englishName && (
                <div className="break-words font-latin text-[18px] italic leading-7 tracking-[0.015em] text-[#627B69]">
                  {englishName}
                </div>
              )}

              {locationLabel && (
                <div className="flex items-center gap-2 text-[13px] leading-6 tracking-[0.06em] text-[#596358]">
                  <span
                    aria-hidden="true"
                    className="h-px w-3 shrink-0 bg-[#A4AF9D]"
                  />
                  <span>{locationLabel}</span>
                </div>
              )}
            </div>
          )}

          {isChineseMedicine && (
            <div className="mt-2 space-y-3">
              {englishName && (
                <div className="break-words font-latin text-[18px] italic leading-7 tracking-[0.015em] text-[#627B69]">
                  {englishName}
                </div>
              )}

              {meridian && (
                <div className="break-words text-[13px] leading-7 tracking-[0.04em] text-[#596358]">
                  <span className="mr-2 text-[#777D72]">
                    歸經
                  </span>
                  {meridian}
                </div>
              )}
            </div>
          )}

          {!isOil &&
            !isAcupuncture &&
            !isChineseMedicine &&
            subtitle && (
              <div className="mt-2 break-words font-latin text-[17px] italic leading-7 text-[#627B69]">
                {subtitle}
              </div>
            )}
        </div>

        <div className="mt-auto pt-7">
          <div className="flex items-center justify-between gap-4 border-t border-[#E6E7DD] pt-4">
            <span className="text-[11px] font-medium tracking-[0.16em] text-[#697667] transition-colors duration-300 group-hover:text-[#283C32]">
              查看詳情
            </span>

            <span
              aria-hidden="true"
              className="
                grid h-8 w-8 shrink-0 place-items-center
                rounded-full border border-[#DDE2D6]
                bg-transparent text-[#627B69]
                transition-colors duration-300
                group-hover:border-[#527565]
                group-hover:bg-[#527565]
                group-hover:text-[#FFFDF8]
                group-focus-visible:border-[#527565]
                group-focus-visible:bg-[#527565]
                group-focus-visible:text-[#FFFDF8]
                motion-reduce:transition-none
              "
            >
              <svg
                viewBox="0 0 20 20"
                className="
                  h-4 w-4 transition-transform duration-300
                  group-hover:translate-x-0.5
                  motion-reduce:transform-none
                  motion-reduce:transition-none
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DataCard;