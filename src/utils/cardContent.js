import { getLocationLabel } from './locationLabel';

const EMPTY_VALUES = new Set([
  '無記載',
  '無',
  '未記載',
  '無資料',
  '—',
  '-',
  '－',
  'n/a',
  'N/A',
]);

const toText = (value) => {
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join('、');
  }

  if (
    value === undefined ||
    value === null ||
    typeof value === 'object'
  ) {
    return '';
  }

  return String(value).trim();
};

const getPath = (item, path) =>
  path
    .split('.')
    .reduce((current, key) => current?.[key], item);

export const firstText = (item, keys) => {
  for (const key of keys) {
    const text = toText(getPath(item, key));

    if (text && !EMPTY_VALUES.has(text)) {
      return text;
    }
  }

  return '';
};

export const splitTagText = (value) => {
  const list = Array.isArray(value) ? value : [value];

  return list
    .flatMap((entry) =>
      String(entry ?? '').split(/[、,，/／;；]+/)
    )
    .map((entry) => entry.trim())
    .filter((entry) => entry && !EMPTY_VALUES.has(entry));
};

export const getCategoryKind = (category) => {
  const value = String(category || '').trim();

  if (value === '精油') return 'oil';

  if (['穴道', '穴位', '腧穴'].includes(value)) {
    return 'acupoint';
  }

  if (['中藥', '中医', '藥材', '药材'].includes(value)) {
    return 'herb';
  }

  if (value === '方劑') return 'formula';
  if (value === '書籍') return 'book';

  if (value === '其他' || value === '名詞材料') {
    return 'other';
  }

  return '';
};

const KIND_LABELS = {
  oil: '精油',
  acupoint: '穴道',
  herb: '中藥',
  formula: '方劑',
  book: '書籍',
  other: '名詞材料',
};

export const getCardContent = (item = {}) => {
  const kind = getCategoryKind(item.category);

  const name = toText(item.name) || '未命名';

  const englishName = firstText(item, [
    'englishName',
    'english',
    '英文名',
    '英文名稱',
    'latin',
  ]);

  const tags = [];
  const lines = [];

  const addTag = (text, variant = 'tag') => {
    if (text && !tags.some((tag) => tag.text === text)) {
      tags.push({ text, variant });
    }
  };

  if (kind === 'acupoint') {
    addTag(firstText(item, ['acuTable.meridian', 'meridian']));
    addTag(firstText(item, ['acuTable.code']), 'code');

    addTag(
      getLocationLabel(
        firstText(item, [
          'acuDetails.location',
          'acuTable.location',
          'location',
        ])
      )
    );

    if (englishName) {
      lines.push({ type: 'english', text: englishName });
    }

    const indications = firstText(item, [
      'acuDetails.indications',
      'indications',
      '主治',
      '主治功效',
    ]);

    if (indications) {
      lines.push({
        type: 'meta',
        label: '主治',
        text: indications,
      });
    }
  } else if (kind === 'formula') {
    splitTagText([item.tags, item.tag]).forEach((text) =>
      addTag(text)
    );

    const alias = firstText(item, ['alias']);
    const source = firstText(item, ['source']);
    const effect = firstText(item, ['effect']);

    if (alias) {
      lines.push({ type: 'plain', text: alias });
    }

    if (source) {
      lines.push({
        type: 'meta',
        label: '來源',
        text: source,
      });
    }

    if (effect) {
      lines.push({
        type: 'meta',
        label: '功效',
        text: effect,
      });
    }
  } else {
    splitTagText([
      item.tags,
      item.tag,
      item.type,
      item.constitutionTag,
      item.chemicalTag,
    ]).forEach((text) => addTag(text));

    if (kind === 'oil') {
      if (englishName) {
        lines.push({ type: 'english', text: englishName });
      }

      const indications = firstText(item, [
        'indications',
        'effect',
        '主治',
        '主治功效',
        '功效',
      ]);

      if (indications) {
        lines.push({ type: 'meta', text: indications });
      }
    } else if (kind === 'herb') {
      if (englishName) {
        lines.push({ type: 'english', text: englishName });
      }

      const meridian = firstText(item, [
        'meridian',
        'acuTable.meridian',
      ]);

      if (meridian) {
        lines.push({
          type: 'meta',
          label: '歸經',
          text: meridian,
        });
      }
    } else {
      const subtitle =
        kind === 'other'
          ? firstText(item, ['type', 'alias'])
          : firstText(item, ['alias']);

      if (subtitle) {
        lines.push({ type: 'english', text: subtitle });
      }
    }
  }

  return {
    kind,
    name,
    categoryLabel:
      KIND_LABELS[kind] ||
      String(item.category || '').trim(),
    tags,
    lines,
  };
};