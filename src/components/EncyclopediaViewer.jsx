import React, { memo, Suspense } from 'react';
import { lazy } from 'react';

const BookModal = lazy(() => import('./BookModal'));
const OilModal = lazy(() => import('./OilModal'));
const AcuModal = lazy(() => import('./AcuModal'));
const HerbModal = lazy(() => import('./HerbModal'));
const FormulaModal = lazy(() => import('./FormulaModal'));

function EncyclopediaViewer({ item, onClose }) {
  if (!item) return null;

  const renderModal = () => {
    switch (item.category) {
      case '書籍':
        return <BookModal item={item} />;
      case '精油':
        return <OilModal item={item} />;
      case '穴道':
        return <AcuModal item={item} />;
      case '中藥':
        return <HerbModal item={item} />;
      case '方劑':
        return <FormulaModal item={item} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#FCFBFA] overflow-y-auto">
      <div className="bg-white border-b border-[#E5E0D8] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button
          onClick={onClose}
          className="text-sm font-bold text-[#A39284] hover:text-[#3A4F3F] transition-colors"
        >
          ← 返回後台列表
        </button>
        <div className="text-xs font-bold tracking-widest text-[#6B9080] uppercase">
          開發者專區 - {item.category} 檢視預覽
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto py-8 px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-[#6B7A6E]">
              載入中...
            </div>
          }
        >
          {renderModal()}
        </Suspense>
      </div>
    </div>
  );
}

export default memo(EncyclopediaViewer);