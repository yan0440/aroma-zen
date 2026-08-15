import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../firebase';

const DEFAULT_PAGE_SIZE = 200;
const MAX_PAGE_SIZE = 500;

function normalizeValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeValue(item)
    );
  }

  if (typeof value === 'object') {
    const result = {};

    Object.entries(value).forEach(
      ([key, item]) => {
        result[key] =
          normalizeValue(item);
    }
    );

    return result;
  }

  return value;
}

function getDocumentTime(data) {
  const value = data?.createdAt;

  if (
    value &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  if (
    value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsedTime =
      Date.parse(value);

    if (!Number.isNaN(parsedTime)) {
      return parsedTime;
    }

    const numericTime =
      Number(value);

    if (
      Number.isFinite(numericTime)
    ) {
      return numericTime;
    }
  }

  return 0;
}

function normalizeEntrySnapshot(
  snapshot
) {
  const data =
    snapshot.data() || {};

  const normalizedData =
    normalizeValue(data);

  return {
    ...normalizedData,
    id: snapshot.id,
    documentId: snapshot.id,
    firestoreId: snapshot.id,
    entryKey:
      normalizedData.entryKey ||
      snapshot.id,
  };
}

function getEntryIdentity(entry) {
  if (!entry) {
    return '';
  }

  return (
    entry.documentId ||
    entry.firestoreId ||
    entry.id ||
    entry.entryKey ||
    `${entry.category || ''}__${entry.name || ''}`
  );
}

function mergeDuplicateEntry(
  previous,
  incoming
) {
  if (!previous) {
    return incoming;
  }

  return {
    ...previous,
    ...incoming,

    documentId:
      previous.documentId ||
      incoming.documentId,

    firestoreId:
      previous.firestoreId ||
      incoming.firestoreId,

    id:
      previous.id ||
      incoming.id,

    entryKey:
      previous.entryKey ||
      incoming.entryKey,

    _documentReference:
      previous._documentReference ||
      incoming._documentReference,
  };
}

function deduplicateEntries(
  entries = []
) {
  const entryMap = new Map();

  entries.forEach((entry) => {
    if (
      !entry ||
      !entry.name ||
      !entry.category
    ) {
      return;
    }

    const identity =
      getEntryIdentity(entry);

    const previous =
      entryMap.get(identity);

    entryMap.set(
      identity,
      mergeDuplicateEntry(
        previous,
        entry
      )
    );
  });

  return Array.from(
    entryMap.values()
  );
}

function sortEntriesByCreatedAt(
  entries = []
) {
  return [...entries].sort(
    (a, b) => {
      const timeA =
        getDocumentTime(a);

      const timeB =
        getDocumentTime(b);

      if (timeA !== timeB) {
        return timeB - timeA;
      }

      return String(
        a?.name || ''
      ).localeCompare(
        String(b?.name || ''),
        'zh-Hant'
      );
    }
  );
}

function buildEntriesQuery({
  category,
  pageSize,
}) {
  const entriesRef = collection(
    db,
    'entries'
  );

  const constraints = [];

  if (category) {
    constraints.push(
      where(
        'category',
        '==',
        category
      )
    );
  }

  constraints.push(
    limit(pageSize)
  );

  return query(
    entriesRef,
    ...constraints
  );
}

export async function loadEntriesPage({
  category,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const safePageSize = Math.min(
    Math.max(
      Number(pageSize) ||
        DEFAULT_PAGE_SIZE,
      1
    ),
    MAX_PAGE_SIZE
  );

  const entriesQuery =
    buildEntriesQuery({
      category,
      pageSize: safePageSize,
    });

  const snapshot =
    await getDocs(entriesQuery);

  const rawEntries =
    snapshot.docs.map(
      normalizeEntrySnapshot
    );

  const entries =
    sortEntriesByCreatedAt(
      deduplicateEntries(
        rawEntries
      )
    );

  return {
    entries,

    lastDocument: null,

    hasMore: false,

    empty:
      entries.length === 0,

    total: entries.length,
  };
}

export async function loadFirstEntriesPage({
  category,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  return loadEntriesPage({
    category,
    pageSize,
  });
}

export async function loadNextEntriesPage({
  category,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  return loadEntriesPage({
    category,
    pageSize,
  });
}

export async function loadAllEntriesForFallback({
  category,
  maxItems = DEFAULT_PAGE_SIZE,
} = {}) {
  const result =
    await loadEntriesPage({
      category,
      pageSize: maxItems,
    });

  return result.entries;
}

export function getEntryCreatedTime(
  entry
) {
  return getDocumentTime(entry);
}

export { sortEntriesByCreatedAt };

export default {
  loadEntriesPage,
  loadFirstEntriesPage,
  loadNextEntriesPage,
  loadAllEntriesForFallback,
  getEntryCreatedTime,
  sortEntriesByCreatedAt,
};