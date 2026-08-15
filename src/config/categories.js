export const CATEGORIES = [
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
  '其他',
];

export const MAIN_CATEGORIES = [
  '書籍',
  '精油',
  '穴道',
  '中藥',
  '方劑',
];

export const CATEGORY_LABELS = {
  書籍: '書籍',
  精油: '精油',
  穴道: '穴道',
  中藥: '中藥',
  方劑: '方劑',
  其他: '名詞材料',
};

export const getCategoryLabel = (
  category
) =>
  CATEGORY_LABELS[category] || category;