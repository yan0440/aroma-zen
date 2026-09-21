import React, {
  memo,
  Suspense,
  lazy,
} from 'react';

const ViewCardModal = lazy(
  () => import('./ViewCardModal')
);

function CardViewer({
  item,
  onClose,
  closeLabel = '返回列表',
  isAdminPreview = false,
}) {
  if (!item) {
    return null;
  }

  const handleClose =
    typeof onClose === 'function'
      ? onClose
      : undefined;

  return (
    <div className="fixed inset-0 z-[110]">
      <div
        className="absolute inset-0 bg-black/35"
        onClick={handleClose}
      />

      <div className="relative z-10 flex min-h-full items-start justify-center overflow-y-auto p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="mt-20 rounded-2xl bg-white px-5 py-3 font-medium text-[#3A4F3F] shadow-lg">
              載入中...
            </div>
          }
        >
          <ViewCardModal
            item={item}
            onClose={handleClose}
            closeLabel={closeLabel}
            isAdminPreview={isAdminPreview}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default memo(CardViewer);