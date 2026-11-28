import React from 'react';

export function PageLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: 'var(--app-bg, #fdfbf7)',
        color: 'var(--app-muted, #657565)',
      }}
    >
      正在載入頁面...
    </div>
  );
}

export function StatusMessage({ isOnline, dataError }) {
  if (dataError) {
    return (
      <div
        role="alert"
        className="fixed left-1/2 top-4 z-[300] w-[92%] max-w-xl -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-center text-[15px] text-white shadow-lg"
      >
        {dataError}
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        role="status"
        className="fixed bottom-4 left-1/2 z-[300] w-max max-w-[92%] -translate-x-1/2 rounded-full bg-[#D4A373] px-4 py-2 text-center text-[15px] text-white shadow-lg"
      >
        目前離線，正在使用已儲存的百科資料
      </div>
    );
  }

  return null;
}

export function SessionNotice({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 top-4 z-[300] w-[92%] max-w-xl -translate-x-1/2 rounded-xl bg-[#405E4C] px-4 py-3 text-center text-[15px] text-white shadow-lg"
    >
      {message}
    </div>
  );
}

export function EmptyState({ isLoading, query }) {
  let message = '這個分類還沒有資料。';

  if (isLoading) {
    message = '正在讀取資料...';
  } else if (query) {
    message =
      `找不到符合「${query}」的資料。` +
      '試試更短的關鍵字，或換一個分類。';
  }

  return (
    <div
      className="rounded-[22px] px-6 py-20 text-center text-[16px] leading-7"
      style={{
        backgroundColor: 'var(--app-surface)',
        color: 'var(--app-muted)',
      }}
    >
      {message}
    </div>
  );
}