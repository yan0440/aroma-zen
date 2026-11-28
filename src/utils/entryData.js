import { normalizeText } from './text';

export const OTHER_CATEGORY_VALUES = ['其他', '名詞材料'];

export const normalizeCategory = (category) => {
  const value = String(category || '')
    .trim()
    .normalize('NFKC');

  return value === '名詞材料' ? '其他' : value;
};

const normalizeName = (name) =>
  String(name || '')
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, ' ');

export const getItemIdentity = (item) => {
  if (!item) return '';

  const entryKey = normalizeText(item.entryKey || '');

  if (entryKey) {
    return `entryKey:${entryKey}`;
  }

  const category = normalizeCategory(item.category);
  const name = normalizeName(item.name);

  if (category && name) {
    return `category:${category}__name:${normalizeText(name)}`;
  }

  return `document:${String(
    item.documentId ||
      item.firestoreId ||
      item.id ||
      ''
  )}`;
};

export const getCreatedTime = (item) => {
  const value = item?.createdAt;

  if (typeof value === 'number') return value;

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (value && typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

const mergeNonEmpty = (base = {}, incoming = {}) => {
  const result = { ...(base || {}) };

  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && !value.trim())
    ) {
      result[key] = value;
    }
  });

  return result;
};

const mergeArrayValue = (baseValue, incomingValue) => {
  if (Array.isArray(incomingValue)) {
    return incomingValue;
  }

  if (incomingValue && typeof incomingValue === 'object') {
    return Object.keys(incomingValue)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => incomingValue[key]);
  }

  if (Array.isArray(baseValue)) {
    return baseValue;
  }

  if (baseValue && typeof baseValue === 'object') {
    return Object.keys(baseValue)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => baseValue[key]);
  }

  return [];
};

const normalizeItem = (item) => {
  if (!item) return null;

  const category = normalizeCategory(item.category);
  const name = normalizeName(item.name);

  return category && name
    ? {
        ...item,
        name,
        category,
      }
    : null;
};

const mergeItems = (base, incoming) => {
  const b = normalizeItem(base);
  const i = normalizeItem(incoming);

  if (!b) return i;
  if (!i) return b;

  return {
    ...mergeNonEmpty(b, i),
    name: i.name || b.name,
    category: i.category || b.category,
    id: i.id || b.id,
    documentId: i.documentId || b.documentId,
    firestoreId: i.firestoreId || b.firestoreId,
    entryKey: i.entryKey || b.entryKey,

    oilDetails: mergeNonEmpty(b.oilDetails, i.oilDetails),
    acuTable: mergeNonEmpty(b.acuTable, i.acuTable),
    acuDetails: mergeNonEmpty(b.acuDetails, i.acuDetails),

    bookDetails: {
      ...(b.bookDetails || {}),
      ...(i.bookDetails || {}),
      chapters: mergeArrayValue(
        b.bookDetails?.chapters,
        i.bookDetails?.chapters
      ),
    },

    knowledgeDetails: {
      ...(b.knowledgeDetails || {}),
      ...(i.knowledgeDetails || {}),
      sections: mergeArrayValue(
        b.knowledgeDetails?.sections,
        i.knowledgeDetails?.sections
      ),
    },
  };
};

export const addItemToMap = (map, item, source) => {
  const normalized = normalizeItem(item);

  if (!normalized) return;

  const key = getItemIdentity(normalized);

  if (!key) return;

  const old = map.get(key);

  map.set(
    key,
    old
      ? mergeItems(old, {
          ...normalized,
          _source: source,
        })
      : {
          ...normalized,
          _source: source,
        }
  );
};

const collectSearchText = (value) => {
  if (value === undefined || value === null) return '';

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(collectSearchText)
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map(collectSearchText)
      .filter(Boolean)
      .join(' ');
  }

  return '';
};

export const getBookSearchText = (item) =>
  normalizeText(
    [
      item?.name,
      item?.alias,
      item?.bookDetails?.author,
      collectSearchText(item?.bookDetails?.chapters),
    ]
      .filter(Boolean)
      .join(' ')
  );

export const getSearchText = (item) =>
  normalizeText(collectSearchText(item));

export const asText = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(asText)
      .filter(Boolean)
      .join('、');
  }

  return typeof value === 'string' ||
    typeof value === 'number'
    ? String(value).trim()
    : '';
};