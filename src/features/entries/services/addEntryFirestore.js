import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  writeBatch,
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
      chapters: [],
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

function flattenChapters(
  nodes,
  parentId = null,
  result = []
) {
  (nodes || []).forEach((node, index) => {
    if (!node) return;

    const rawId =
      node.id ||
      `${parentId || 'root'}__${index}`;

    const chapterId = String(rawId)
      .replace(/\//g, '_');

    result.push({
      id: chapterId,
      title: node.title || '',
      type: node.type || 'content',
      text: node.text || '',
      parentId,
      order: index,
    });

    flattenChapters(
      node.children || [],
      chapterId,
      result
    );
  });

  return result;
}

async function saveBookChapters(
  documentId,
  chapters
) {
  const chaptersRef = collection(
    db,
    'entries',
    documentId,
    'chapters'
  );

  const flatChapters =
    flattenChapters(chapters);

  const existingSnapshot =
    await getDocs(chaptersRef);

  const nextIds = new Set(
    flatChapters.map(
      (chapter) => chapter.id
    )
  );

  const staleRefs =
    existingSnapshot.docs
      .filter(
        (chapterDoc) =>
          !nextIds.has(chapterDoc.id)
      )
      .map((chapterDoc) => chapterDoc.ref);

  const operations = [
    ...flatChapters.map((chapter) => ({
      type: 'set',
      ref: doc(
        chaptersRef,
        chapter.id
      ),
      data: {
        title: chapter.title,
        type: chapter.type,
        text: chapter.text,
        parentId: chapter.parentId,
        order: chapter.order,
      },
    })),

    ...staleRefs.map((ref) => ({
      type: 'delete',
      ref,
    })),
  ];

  for (
    let index = 0;
    index < operations.length;
    index += 450
  ) {
    const batch = writeBatch(db);

    operations
      .slice(index, index + 450)
      .forEach((operation) => {
        if (operation.type === 'delete') {
          batch.delete(operation.ref);
        } else {
          batch.set(
            operation.ref,
            operation.data
          );
        }
      });

    await batch.commit();
  }
}

export async function loadBookChapters(
  documentId,
  fallbackChapters = []
) {
  if (!documentId) {
    return normalizeChapters(fallbackChapters);
  }

  const snapshot = await getDocs(
    collection(
      db,
      'entries',
      documentId,
      'chapters'
    )
  );

  if (snapshot.empty) {
    return normalizeChapters(fallbackChapters);
  }

  const nodes = new Map();

  snapshot.docs.forEach((chapterDoc) => {
    const data = chapterDoc.data() || {};

    nodes.set(chapterDoc.id, {
      id: chapterDoc.id,
      title: data.title || '',
      type: data.type || 'content',
      text: data.text || '',
      parentId: data.parentId || null,
      order: Number.isFinite(data.order)
        ? data.order
        : 0,
      children: [],
    });
  });

  const roots = [];

  nodes.forEach((node) => {
    const parent = node.parentId
      ? nodes.get(node.parentId)
      : null;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (list) => {
    list.sort((a, b) => a.order - b.order);

    list.forEach((node) => {
      sortTree(node.children);
      delete node.parentId;
      delete node.order;
    });

    return list;
  };

  return sortTree(roots);
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

  const cleanChapters =
    normalizeChapters(
      formData?.bookDetails?.chapters
    );

  const cleanData = buildCleanData({
    ...formData,
    category,
    name,
  });

  const now = Date.now();

  const isBook = category === '書籍';
  const wasBook =
    editingItem?.category === '書籍';

  if (isBook || wasBook) {
    if (!isEditing) {
      const existingKey =
        await getDoc(newKeyRef);

      if (existingKey.exists()) {
        throw new Error(
          '已有相同分類與名稱的百科資料'
        );
      }
    }

    await saveBookChapters(
      documentId,
      isBook ? cleanChapters : []
    );
  }

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

    bookDetails: {
      ...(cleanData.bookDetails || {}),
      chapters: cleanChapters,
    },

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

    createdAt:
      editingItem?.createdAt ||
      now,

    updatedAt: now,
  };
}