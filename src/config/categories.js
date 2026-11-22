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

// 每個分類的專屬顏色：deep 用在文字，mid 用在裝飾線條，tint 用在淡淡的底色
export const CATEGORY_THEMES = {
  書籍: { deep: '#3b5a7a', mid: '#7f9dbb', tint: '#e6eef6' },
  精油: { deep: '#6c4f95', mid: '#a88ccb', tint: '#eee7f7' },
  穴道: { deep: '#1f7a74', mid: '#5db5ab', tint: '#ddf1ee' },
  中藥: { deep: '#8a5c14', mid: '#d9a441', tint: '#f9edd2' },
  方劑: { deep: '#4c7a3a', mid: '#8db87a', tint: '#e4f0dd' },
  其他: { deep: '#a5526a', mid: '#d98fa3', tint: '#f8e3ea' },
};

const DEFAULT_THEME = { deep: '#24382e', mid: '#6f8f7e', tint: '#e6ece7' };

const CATEGORY_ALIASES = {
  名詞材料: '其他',
  穴位: '穴道',
  腧穴: '穴道',
  中医: '中藥',
  藥材: '中藥',
  药材: '中藥',
};

export const getCategoryTheme = (category) => {
  const value = String(category || '').trim().normalize('NFKC');
  return CATEGORY_THEMES[CATEGORY_ALIASES[value] || value] || DEFAULT_THEME;
};
