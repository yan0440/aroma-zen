import {
  doc,
  runTransaction,
} from 'firebase/firestore';

import {
  db,
} from '../../../firebase';

import {
  buildSearchKey,
  getEntryKey,
  normalizeArray,
  normalizeChapters,
  normalizeText,
} from '../utils/addEntryUtils';

function removeUndefinedValues(value) {
  if (value === undefined) {
    return null;
  }

  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map(removeUndefinedValues)
      .filter(
        (item) =>
          item !== null &&
          item !== undefined
      );
  }

  return Object.entries(value).reduce(
    (result, [key, item]) => {
      const cleanedValue =
        removeUndefinedValues(item);

      if (
        cleanedValue !== null &&
        cleanedValue !== undefined
      ) {
        result[key] = cleanedValue;
      }

      return result;
    },
    {}
  );
}

function buildCleanData(formData) {
  const cleanChapters =
    normalizeChapters(
      formData?.bookDetails?.chapters
    );

  const cleanSections =
    normalizeArray(
      formData?.knowledgeDetails?.sections
    );

  return removeUndefinedValues({
    ...formData,

    bookDetails: {
      ...(formData?.bookDetails || {}),
      author:
        formData?.bookDetails?.author || '',
      chapters: cleanChapters,
    },

    knowledgeDetails: {
      ...(formData?.knowledgeDetails || {}),
      introduction:
        formData?.knowledgeDetails
          ?.introduction || '',
      sections: cleanSections,
    },

    acuTable: {
      ...(formData?.acuTable || {}),
    },

    acuDetails: {
      ...(formData?.acuDetails || {}),
    },

    oilDetails: {
      ...(formData?.oilDetails || {}),
    },
  });
}

function buildEntryData({
  cleanData,
  category,
  name,
  entryKey,
  documentId,
  createdAt,
  updatedAt,
}) {
  const searchKey = buildSearchKey({
    ...cleanData,
    category,
    name,
  });

  return removeUndefinedValues({
    ...cleanData,

    id: documentId,
    documentId,
    firestoreId: documentId,

    entryKey,
    category,
    name,

    sortName: normalizeText(name),
    searchKey,

    createdAt,
    updatedAt,
  });
}

function buildEntryKeyData({
  cleanData,
  category,
  name,
  entryKey,
  documentId,
  createdAt,
  updatedAt,
}) {
  const searchKey = buildSearchKey({
    ...cleanData,
    category,
    name,
  });

  return removeUndefinedValues({
    entryKey,
    entryId: documentId,
    documentId,

    category,
    name,

    sortName: normalizeText(name),
    searchKey,

    type: cleanData?.type || '',
    alias: cleanData?.alias || '',
    englishName:
      cleanData?.englishName || '',
    description:
      cleanData?.description || '',
    effect:
      cleanData?.effect || '',
    indications:
      cleanData?.indications || '',
    usage:
      cleanData?.usage || '',
    directions:
      cleanData?.directions || '',
    caution:
      cleanData?.caution || '',
    tag:
      cleanData?.tag || '',
    constitutionTag:
      cleanData?.constitutionTag || '',
    chemicalTag:
      cleanData?.chemicalTag || '',

    acuTable: {
      code:
        cleanData?.acuTable?.code || '',
      meridian:
        cleanData?.acuTable?.meridian || '',
      alias:
        cleanData?.acuTable?.alias || '',
    },

    createdAt,
    updatedAt,
  });
}

export async function saveEntry({
  formData,
  editingItem,
  originalDocumentId,
  originalEntryKey,
}) {
  const category = String(
    formData?.category || ''
  ).trim();

  const name = String(
    formData?.name || ''
  ).trim();

  if (!category) {
    throw new Error(
      '請至少填寫分類與名稱！'
    );
  }

  if (!name) {
    throw new Error(
      '請至少填寫名稱！'
    );
  }

  const entryKey = getEntryKey(
    category,
    name
  );

  const isEditing =
    Boolean(editingItem);

  const oldEntryKey =
    originalEntryKey ||
    editingItem?.entryKey ||
    getEntryKey(
      editingItem?.category || '',
      editingItem?.name || ''
    );

  const oldDocumentId =
    originalDocumentId ||
    editingItem?.documentId ||
    editingItem?.firestoreId ||
    editingItem?.id ||
    oldEntryKey;

  const documentId =
    isEditing
      ? oldDocumentId
      : entryKey;

  const isKeyChanged =
    isEditing &&
    entryKey !== oldEntryKey;

  const newEntryRef = doc(
    db,
    'entries',
    documentId
  );

  const newKeyRef = doc(
    db,
    'entryKeys',
    entryKey
  );

  const oldEntryRef = doc(
    db,
    'entries',
    oldDocumentId
  );

  const oldKeyRef = doc(
    db,
    'entryKeys',
    oldEntryKey
  );

  const cleanData = buildCleanData({
    ...formData,
    category,
    name,
  });

  const now = Date.now();

  await runTransaction(
    db,
    async (transaction) => {
      const newKeySnapshot =
        await transaction.get(
          newKeyRef
        );

      if (!isEditing) {
        if (
          newKeySnapshot.exists()
        ) {
          throw new Error(
            '已有相同分類與名稱的百科資料'
          );
        }

        const entryData =
          buildEntryData({
            cleanData,
            category,
            name,
            entryKey,
            documentId,
            createdAt: now,
            updatedAt: now,
          });

        const entryKeyData =
          buildEntryKeyData({
            cleanData,
            category,
            name,
            entryKey,
            documentId,
            createdAt: now,
            updatedAt: now,
          });

        transaction.set(
          newEntryRef,
          entryData
        );

        transaction.set(
          newKeyRef,
          entryKeyData
        );

        return;
      }

      const oldEntrySnapshot =
        await transaction.get(
          oldEntryRef
        );

      const oldEntryData =
        oldEntrySnapshot.exists()
          ? oldEntrySnapshot.data() || {}
          : {};

      if (
        isKeyChanged &&
        newKeySnapshot.exists() &&
        newKeyRef.path !==
          oldKeyRef.path
      ) {
        throw new Error(
          '已有相同分類與名稱的百科資料'
        );
      }

      const createdAt =
        oldEntryData.createdAt ||
        editingItem?.createdAt ||
        now;

      const entryData =
        buildEntryData({
          cleanData,
          category,
          name,
          entryKey,
          documentId,
          createdAt,
          updatedAt: now,
        });

      const entryKeyData =
        buildEntryKeyData({
          cleanData,
          category,
          name,
          entryKey,
          documentId,
          createdAt,
          updatedAt: now,
        });

      transaction.set(
        newEntryRef,
        entryData
      );

      transaction.set(
        newKeyRef,
        entryKeyData
      );

      if (
        isKeyChanged &&
        oldKeyRef.path !==
          newKeyRef.path
      ) {
        transaction.delete(
          oldKeyRef
        );
      }

      if (
        oldEntryRef.path !==
        newEntryRef.path
      ) {
        transaction.delete(
          oldEntryRef
        );
      }
    }
  );

  return {
    ...cleanData,

    id: documentId,
    documentId,
    firestoreId: documentId,

    entryKey,
    category,
    name,

    sortName: normalizeText(name),
    searchKey: buildSearchKey({
      ...cleanData,
      category,
      name,
    }),

    updatedAt: now,
  };
}