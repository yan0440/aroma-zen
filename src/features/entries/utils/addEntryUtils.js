import {
  getEntryKey,
  normalizeText,
} from '../../../utils/text';

export {
  getEntryKey,
  normalizeText,
};

export function collectSearchText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        collectSearchText(item)
      )
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map((item) =>
        collectSearchText(item)
      )
      .filter(Boolean)
      .join(' ');
  }

  return String(value);
}

export function buildSearchKey(data) {
  return normalizeText(
    [
      data.category,
      data.name,
      data.type,
      data.alias,
      data.englishName,
      data.latin,
      data.tag,
      data.typePart,
      data.method,
      data.property,
      data.noteAnalogy,
      data.planet,
      data.origin,
      data.constitutionTag,
      data.chemicalTag,
      data.description,
      data.effect,
      data.indications,
      data.literature,
      data.contraindication,
      data.family,
      data.nature,
      data.meridian,
      data.traits,
      data.dosage,
      data.pharmacology,
      data.contemporary,
      data.medicine,
      data.preparation,
      data.directions,
      data.analysis,
      data.discussion,
      data.syndrome,
      data.modifications,
      data.modernApp,
      data.modernPharmacology,
      data.prescription,
      data.note,
      data.usage,
      data.caution,
      data.oilDetails,
      data.acuTable,
      data.acuDetails,
      data.bookDetails,
      data.knowledgeDetails,
    ]
      .map((item) =>
        collectSearchText(item)
      )
      .filter(Boolean)
      .join(' ')
  );
}

function isPlainObject(value) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function isFirestoreSpecialValue(
  value
) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return false;
  }

  return (
    typeof value.toMillis ===
      'function' ||
    typeof value.toDate ===
      'function' ||
    typeof value.toJSON ===
      'function'
  );
}

export function convertObjectsToArrays(
  value,
  seen = new WeakSet(),
  depth = 0
) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof value !== 'object'
  ) {
    return value;
  }

  if (depth > 50) {
    return null;
  }

  if (
    isFirestoreSpecialValue(value)
  ) {
    return value;
  }

  if (seen.has(value)) {
    return null;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) =>
      convertObjectsToArrays(
        item,
        seen,
        depth + 1
      )
    );
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const keys = Object.keys(value);

  const isArrayLike =
    keys.length > 0 &&
    keys.every((key) =>
      /^\d+$/.test(String(key))
    );

  if (isArrayLike) {
    return keys
      .sort(
        (a, b) =>
          Number(a) - Number(b)
      )
      .map((key) =>
        convertObjectsToArrays(
          value[key],
          seen,
          depth + 1
        )
      );
  }

  const newObject = {};

  keys.forEach((key) => {
    if (
      key === '_documentReference' ||
      key === 'documentReference' ||
      key === 'firestoreReference' ||
      key === 'ref' ||
      key === 'snapshot' ||
      key === 'parent' ||
      key === 'firestore' ||
      key === 'converter'
    ) {
      return;
    }

    newObject[key] =
      convertObjectsToArrays(
        value[key],
        seen,
        depth + 1
      );
  });

  return newObject;
}

export function normalizeArray(value) {
  const converted =
    convertObjectsToArrays(value);

  if (Array.isArray(converted)) {
    return converted;
  }

  if (
    converted &&
    typeof converted === 'object'
  ) {
    return Object.keys(converted)
      .sort(
        (a, b) =>
          Number(a) - Number(b)
      )
      .map((key) => converted[key]);
  }

  return [];
}

export function normalizeChapterNode(node) {
  if (
    !node ||
    typeof node !== 'object'
  ) {
    return null;
  }

  const normalizedChildren =
    normalizeArray(node.children)
      .map((child) =>
        normalizeChapterNode(child)
      )
      .filter(Boolean);

  return {
    ...node,
    id:
      node.id ||
      `sub_${Date.now()}_${Math.floor(
        Math.random() * 100000
      )}`,
    title:
      typeof node.title === 'string'
        ? node.title
        : '',
    type:
      node.type === 'folder'
        ? 'folder'
        : 'content',
    text:
      typeof node.text === 'string'
        ? node.text
        : '',
    children: normalizedChildren,
  };
}

export function normalizeChapters(value) {
  return normalizeArray(value)
    .map((node) =>
      normalizeChapterNode(node)
    )
    .filter(Boolean);
}

export function removeFirestoreFields(
  value
) {
  const result = {
    ...(value || {}),
  };

  [
    '_documentReference',
    'documentReference',
    'firestoreReference',
    'ref',
    'snapshot',
    'parent',
    'firestore',
    'converter',
  ].forEach((key) => {
    delete result[key];
  });

  return result;
}