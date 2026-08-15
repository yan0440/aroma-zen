import {
  doc,
  runTransaction,
} from 'firebase/firestore';

import { db } from '../../../firebase';

import {
  buildSearchKey,
  getEntryKey,
  normalizeArray,
  normalizeChapters,
  normalizeText,
} from '../utils/addEntryUtils';

function buildCleanData(formData) {
  const cleanChapters =
    normalizeChapters(
      formData.bookDetails?.chapters
    );

  const cleanSections =
    normalizeArray(
      formData.knowledgeDetails?.sections
    );

  return {
    ...formData,

    bookDetails: {
      ...(formData.bookDetails || {}),
      author:
        formData.bookDetails?.author ||
        '',
      chapters: cleanChapters,
    },

    knowledgeDetails: {
      ...(formData.knowledgeDetails || {}),
      introduction:
        formData.knowledgeDetails
          ?.introduction || '',
      sections: cleanSections,
    },

    acuTable: {
      ...(formData.acuTable || {}),
    },

    acuDetails: {
      ...(formData.acuDetails || {}),
    },

    oilDetails: {
      ...(formData.oilDetails || {}),
    },
  };
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
  const searchKey =
    buildSearchKey({
      ...cleanData,
      category,
      name,
    });

  return {
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
  };
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
  const searchKey =
    buildSearchKey({
      ...cleanData,
      category,
      name,
    });

  return {
    entryKey,
    entryId: documentId,
    documentId,

    category,
    name,

    sortName: normalizeText(name),
    searchKey,

    type: cleanData.type || '',
    alias: cleanData.alias || '',
    englishName:
      cleanData.englishName || '',
    description:
      cleanData.description || '',
    effect: cleanData.effect || '',
    indications:
      cleanData.indications || '',
    usage: cleanData.usage || '',
    directions:
      cleanData.directions || '',
    caution: cleanData.caution || '',
    tag: cleanData.tag || '',
    constitutionTag:
      cleanData.constitutionTag || '',
    chemicalTag:
      cleanData.chemicalTag || '',

    bookDetails: {
      author:
        cleanData.bookDetails?.author ||
        '',
      chapters:
        cleanData.bookDetails?.chapters ||
        [],
    },

    knowledgeDetails: {
      introduction:
        cleanData.knowledgeDetails
          ?.introduction || '',
      sections:
        cleanData.knowledgeDetails
          ?.sections || [],
    },

    acuTable: {
      code:
        cleanData.acuTable?.code || '',
      meridian:
        cleanData.acuTable?.meridian ||
        '',
      alias:
        cleanData.acuTable?.alias || '',
    },

    createdAt,
    updatedAt,
  };
}

export async function saveEntry({
  formData,
  editingItem,
  originalDocumentId,
  originalEntryKey,
}) {
  const category = String(
    formData.category || ''
  ).trim();

  const name = String(
    formData.name || ''
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

  const oldEntryKey =
    originalEntryKey ||
    editingItem?.entryKey ||
    getEntryKey(
      editingItem?.category || '',
      editingItem?.name || ''
    );

  const isEditing =
    Boolean(editingItem);

  const isKeyChanged =
    isEditing &&
    entryKey !== oldEntryKey;

  const documentId =
    isEditing &&
    originalDocumentId
      ? originalDocumentId
      : entryKey;

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
    originalDocumentId ||
      oldEntryKey
  );

  const oldKeyRef = doc(
    db,
    'entryKeys',
    oldEntryKey
  );

  const cleanData =
    buildCleanData({
      ...formData,
      category,
      name,
    });

  const now = Date.now();

  await runTransaction(
    db,
    async (transaction) => {
      const newKeySnap =
        await transaction.get(
          newKeyRef
        );

      if (!isEditing) {
        if (newKeySnap.exists()) {
          throw new Error(
            '已有相同分類與名稱的百科資料'
          );
        }

        transaction.set(
          newEntryRef,
          buildEntryData({
            cleanData,
            category,
            name,
            entryKey,
            documentId,
            createdAt: now,
            updatedAt: now,
          })
        );

        transaction.set(
          newKeyRef,
          buildEntryKeyData({
            cleanData,
            category,
            name,
            entryKey,
            documentId,
            createdAt: now,
            updatedAt: now,
          })
        );

        return;
      }

      const oldEntrySnap =
        await transaction.get(
          oldEntryRef
        );

      const sameKey =
        oldKeyRef.path ===
        newKeyRef.path;

      if (
        isKeyChanged &&
        newKeySnap.exists() &&
        !sameKey
      ) {
        throw new Error(
          '已有相同分類與名稱的百科資料'
        );
      }

      const oldEntryData =
        oldEntrySnap.exists()
          ? oldEntrySnap.data() || {}
          : {};

      const createdAt =
        oldEntryData.createdAt ||
        editingItem?.createdAt ||
        now;

      transaction.set(
        newEntryRef,
        buildEntryData({
          cleanData,
          category,
          name,
          entryKey,
          documentId,
          createdAt,
          updatedAt: now,
        })
      );

      transaction.set(
        newKeyRef,
        buildEntryKeyData({
          cleanData,
          category,
          name,
          entryKey,
          documentId,
          createdAt,
          updatedAt: now,
        })
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
        isKeyChanged &&
        originalDocumentId &&
        documentId !== originalDocumentId
      ) {
        transaction.delete(
          oldEntryRef
        );
      }
    }
  );
}