import React, { memo, Suspense, lazy } from 'react';

const ViewCardModal = lazy(() => import('./ViewCardModal'));

function CardViewer({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-start justify-center p-4 sm:p-6 overflow-y-auto">
        <Suspense
          fallback={
            <div className="mt-20 rounded-2xl bg-white px-5 py-3 shadow-lg text-[#3A4F3F] font-medium">
              載入中...
            </div>
          }
        >
          <ViewCardModal item={item} onClose={onClose} />
        </Suspense>
      </div>
    </div>
  );
}

export default memo(CardViewer);