import React, {
  memo,
  useMemo,
} from 'react';

const getCategoryLabel = (
  category
) =>
  category === '其他'
    ? '名詞材料'
    : category;

const getLocationLabel = (
  location
) => {
  const text = String(
    location || ''
  ).trim();

  if (!text) {
    return '';
  }

  const locationRules = [
    {
      label: '頭面部',
      keywords: [
        '頭',
        '面',
        '額',
        '眼',
        '眉',
        '鼻',
        '口',
        '唇',
        '齒',
        '牙',
        '耳',
        '顏面',
      ],
    },
    {
      label: '頸肩部',
      keywords: [
        '頸',
        '脖',
        '項',
        '喉',
        '肩',
        '頸部',
      ],
    },
    {
      label: '胸腹部',
      keywords: [
        '胸',
        '乳',
        '心前區',
        '腹',
        '臍',
        '肚',
        '胸部',
        '腹部',
      ],
    },
    {
      label: '背腰部',
      keywords: [
        '背',
        '脊',
        '腰',
        '骶',
        '脊柱',
        '背部',
        '腰部',
      ],
    },
    {
      label: '上肢部',
      keywords: [
        '臂',
        '上臂',
        '前臂',
        '肘',
        '手',
        '腕',
        '掌',
        '指',
        '肩臂',
      ],
    },
    {
      label: '下肢部',
      keywords: [
        '髖',
        '臀',
        '大腿',
        '膝',
        '小腿',
        '踝',
        '足',
        '腳',
        '趾',
        '下肢',
      ],
    },
    {
      label: '全身',
      keywords: [
        '全身',
        '身體',
        '軀幹',
      ],
    },
  ];

  const matchedRule =
    locationRules.find((rule) =>
      rule.keywords.some((keyword) =>
        text.includes(keyword)
      )
    );

  return matchedRule
    ? matchedRule.label
    : '';
};

const parseBoldSyntax = (
  str
) => {
  if (
    typeof str !== 'string'
  ) {
    return str;
  }

  const boldKeywords = [
    '肌肉',
    '神經',
    '血管',
  ];

  const regex =
    /(\*\*.*?\*\*|==.*?==|【.*?】|《.*?》|\(.*?\)|肌肉|神經|血管)/g;

  return str
    .split('\n')
    .map((line, lineIndex) => (
      <span
        key={`line-${lineIndex}`}
        className="mb-1 block"
      >
        {line
          .split(regex)
          .map((part, index) => {
            if (!part) {
              return null;
            }

            if (
              part.startsWith('==') &&
              part.endsWith('==')
            ) {
              return (
                <mark
                  key={`part-${index}`}
                  className="rounded bg-[#F3E1C5] px-1 font-bold text-[#2F4638]"
                >
                  {part.slice(2, -2)}
                </mark>
              );
            }

            if (
              (part.startsWith('**') &&
                part.endsWith('**')) ||
              boldKeywords.includes(part)
            ) {
              return (
                <strong
                  key={`part-${index}`}
                  className="font-bold text-[#3A4F3F]"
                >
                  {part.replace(
                    /\*\*/g,
                    ''
                  )}
                </strong>
              );
            }

            if (
              /^[【《\(].*[】》\)]$/.test(
                part
              )
            ) {
              return (
                <span
                  key={`part-${index}`}
                  className="font-bold text-[#3A4F3F]"
                >
                  {part}
                </span>
              );
            }

            return part;
          })}
      </span>
    ));
};

function ViewCardModal({
  item,
  onClose,
}) {
  const tags = useMemo(() => {
    if (!item) {
      return [];
    }

    return [
      item.tag ||
      item.type,
      item.constitutionTag,
      item.chemicalTag,
      item.acuTable?.meridian,
    ].filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
    );
  }, [item]);

  if (!item) {
    return null;
  }

  const category =
    String(
      item.category || ''
    ).trim();

  const categoryDisplay =
    getCategoryLabel(category);

  const isAcupuncture =
    category === '穴道' ||
    category === '穴位' ||
    category === '腧穴';

  const isChineseMedicine =
    category === '中藥' ||
    category === '中医' ||
    category === '藥材' ||
    category === '药材';

  const englishName = String(
    item.englishName ||
      item.latin ||
      ''
  ).trim();

  const meridian = String(
    item.meridian ||
      item.acuTable?.meridian ||
      ''
  ).trim();

  const location = String(
    item.acuDetails?.location ||
      item.location ||
      ''
  ).trim();

  const locationLabel =
    isAcupuncture
      ? getLocationLabel(location)
      : '';

  const detailText =
    item.description ||
    item.effect ||
    item.indications ||
    '';

  return (
    <div
      className="relative w-full max-w-lg"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <div className="relative max-h-[85vh] overflow-y-auto rounded-[1.75rem] border border-[#E5E0D8] bg-[radial-gradient(circle_at_top,_#FCFBF7_0%,_#F7F2E8_52%,_#F2EBDD_100%)] shadow-[0_12px_35px_rgba(122,106,90,0.08)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-lg font-bold text-[#A39284] transition-colors hover:text-[#3A4F3F]"
          aria-label="關閉圖卡"
        >
          ✕
        </button>

        <div className="p-6 md:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[13px] font-semibold tracking-wider text-[#3A4F3F]">
              {categoryDisplay}
            </span>

            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#E7DED4] bg-white/80 px-3 py-1 text-[13px] font-medium text-[#7C8A80]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-[28px] font-black leading-tight tracking-tight text-[#2F4638] md:text-[32px]">
            {item.name}
          </h3>


          {category === '精油' &&
            englishName && (
              <p className="mb-4 mt-2 font-serif text-[16px] italic text-[#A39284]">
                {englishName}
              </p>
            )}

          {category === '其他' && (
            <p className="mb-4 mt-2 font-serif text-[16px] italic text-[#A39284]">
              {item.alias ||
                englishName ||
                ''}
            </p>
          )}

          {isAcupuncture && (
            <div className="mb-5 mt-3 space-y-2">
              {item.acuTable?.code && (
                <p className="font-serif text-[16px] italic text-[#A39284]">
                  
                  {item.acuTable.code}
                </p>
              )}
            
            
              {englishName && (
                <p className="text-[16px] text-[#6B7280]">
                  
                  {englishName}
                </p>
              )}

              {locationLabel && (
                <p className="text-[15px] font-semibold text-[#3A4F3F]">
                  
                  {locationLabel}
                </p>
              )}
            </div>
          )}

          {isChineseMedicine && (
            <div className="mb-5 mt-3 space-y-2">
              {englishName && (
                <p className="text-[15px] text-[#6B7280]">
                 
                  {englishName}
                </p>
              )}

              {meridian && (
                <p className="text-[16px] font-semibold text-[#3A4F3F]">
                  
                  {meridian}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default memo(
  ViewCardModal
);