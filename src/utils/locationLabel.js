export const LOCATION_RULES = [
  {
    label: '頭面頸項部',
    keywords: [
      '面部',
      '頭側部',
      '顏面',
      '面頰部',
      '上唇部',
      '鼻孔',
      '頸外側部',
    ],
  },
  {
    label: '胸腹部',
    keywords: [
      '胸部',
      '腹部',
      '鎖骨',
      '頸部',
      '肩胛骨',
      '腹股溝',
      '腹中部',
      '腹直肌',
    ],
  },
  {
    label: '背腰部',
    keywords: [
      '背部',
      '腰部',
    ],
  },
  {
    label: '上肢部',
    keywords: [
      '臂內',
      '上臂',
      '前臂',
      '肩臂',
      '腕掌側',
      '臂外',
      '肱二頭肌',
      '肘橫紋',
      '橈側',
    ],
  },
  {
    label: '下肢部',
    keywords: [
      '下肢',
      '大腿',
      '膝部',
      '小腿',
      '足背',
      '足大',
    ],
  },
  {
    label: '全身',
    keywords: [
      '全身',
      '身體',
    ],
  },
];

export function getLocationLabel(location) {
  const text = String(location || '').trim();

  if (!text) {
    return '';
  }

  const matchedRule = LOCATION_RULES.find(
    (rule) =>
      rule.keywords.some((keyword) =>
        text.includes(keyword)
      )
  );

  return matchedRule
    ? matchedRule.label
    : '';
}