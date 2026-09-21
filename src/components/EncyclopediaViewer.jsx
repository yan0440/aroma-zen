import React, { memo, Suspense, lazy } from 'react';

const BookModal = lazy(() => import('./BookModal'));
const OilModal = lazy(() => import('./OilModal'));
const AcuModal = lazy(() => import('./AcuModal'));
const HerbModal = lazy(() => import('./HerbModal'));
const FormulaModal = lazy(() => import('./FormulaModal'));

function EncyclopediaViewer({ item, onClose, onBack }) {
  if (!item) return null;

  const handleBack = typeof onClose === 'function' ? onClose : onBack;

  const renderModal = () => {
    switch (item.category) {
      case '書籍':
        return <BookModal item={item} onClose={handleBack} onBack={handleBack} />;
      case '精油':
        return <OilModal item={item} onClose={handleBack} onBack={handleBack} />;
      case '穴道':
        return <AcuModal item={item} onClose={handleBack} onBack={handleBack} />;
      case '中藥':
        return <HerbModal item={item} onClose={handleBack} onBack={handleBack} />;
      case '方劑':
        return <FormulaModal item={item} onClose={handleBack} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#FCFBFA]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E0D8] bg-white px-8 py-4 shadow-sm">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-bold text-[#A39284] transition-colors hover:text-[#3A4F3F]"
        >
          返回後台列表
        </button>
        <div className="text-xs font-bold uppercase tracking-widest text-[#6B9080]">
          開發者專區 - {item.category} 檢視預覽
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-8">
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
