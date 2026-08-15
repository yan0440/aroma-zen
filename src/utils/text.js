export const normalizeText = (
  value = ''
) =>
  String(value)
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const getEntryKey = (
  category = '',
  name = ''
) =>
  `${normalizeText(category)}__${normalizeText(name)}`;

export const getDataKey = (item) =>
  `${normalizeText(item?.category)}__${normalizeText(
    item?.name
  )}`;

export const safeText = (
  value,
  fallback = ''
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
};