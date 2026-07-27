import React, { useState, useMemo } from 'react';
import { allCategoryExplanations } from '../data/categoryData';

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function tagIncludes(tag, keyword) {
  return normalizeText(tag).includes(normalizeText(keyword));
}

function getItemTag(item) {
  return item?.tag || item?.constitutionTag || item?.chemicalTag || item?.acuTable?.meridian || '';
}

function getMatchedNamesByTag(allData, categoryName, keywords) {
  const keywordList = Array.isArray(keywords) ? keywords : [keywords];
  const validKeywords = keywordList.filter(Boolean);

  return Array.from(
    new Set(
      allData
        .filter((item) => item?.category === categoryName)
        .filter((item) => validKeywords.some((keyword) => tagIncludes(getItemTag(item), keyword)))
        .map((item) => item.name)
        .filter(Boolean)
    )
  );
}

function DetailPanel({ categoryName, tagName, tagData, allData, onBack, matchKeyword }) {
  const matchedItems = getMatchedNamesByTag(allData, categoryName, matchKeyword);

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 md:p-8 shadow-[0_8px_24px_rgba(122,106,90,0.06)]">
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#7F6D5F] hover:text-[#3A4F3F] transition-colors"
      >
        ← 返回上一層
      </button>

      <div className="mb-4">
        <span className="inline-block rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold text-[#3A4F3F] mb-2">
          {categoryName}
        </span>
        <h4 className="text-2xl font-black text-[#2F4638]">{tagName}</h4>
      </div>

      <div className="h-[2px] w-full bg-[#E8E0D6] mb-5" />

      <div className="space-y-5">
        <div>
          <h5 className="text-sm font-bold text-[#2F4638] mb-2">標籤描述</h5>
          <p className="text-sm text-[#5F6F65] leading-7">{tagData?.desc || ''}</p>
        </div>

        <div>
          <h5 className="text-sm font-bold text-[#2F4638] mb-3">自動搜尋到的百科名稱</h5>
          <div className="flex flex-wrap gap-2">
            {matchedItems.length > 0 ? (
              matchedItems.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-[#E7DED4] bg-[#F9F7F3] px-3 py-1 text-sm text-[#5F6F65]"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-sm text-[#A39284]">尚未搜尋到相關百科</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtherCategoryView({ allData }) {
  const [viewState, setViewState] = useState({
    category: null,
    tag: null,
    childTag: null,
  });

  const { category: activeCategory, tag: activeTag, childTag: activeChildTag } = viewState;
  const categories = Object.keys(allCategoryExplanations);

  const categoryData = useMemo(
    () => (activeCategory ? allCategoryExplanations[activeCategory] || {} : {}),
    [activeCategory]
  );

  const tagData = useMemo(
    () => (activeCategory && activeTag ? categoryData?.[activeTag] || null : null),
    [activeCategory, activeTag, categoryData]
  );

  const childTagData = useMemo(
    () =>
      activeCategory && activeTag && activeChildTag
        ? categoryData?.[activeTag]?.children?.[activeChildTag] || null
        : null,
    [activeCategory, activeTag, activeChildTag, categoryData]
  );

  const hasChildren = !!(tagData?.children && Object.keys(tagData.children).length > 0);

  const parentMatchKeyword = useMemo(() => {
    if (!tagData) return [];
    if (activeCategory === '方劑' && activeTag === '解表劑') return ['解表'];
    if (activeTag === '解表藥') return ['解表'];
    return tagData.keywords?.length ? tagData.keywords : [activeTag];
  }, [tagData, activeCategory, activeTag]);

  const childMatchKeyword = useMemo(() => {
    if (!childTagData) return [];
    return childTagData.keywords?.length ? childTagData.keywords : [activeChildTag];
  }, [childTagData, activeChildTag]);

  const setCategoryView = (category) => {
    setViewState({ category, tag: null, childTag: null });
  };

  const setTagView = (tag) => {
    setViewState((prev) => ({ ...prev, tag, childTag: null }));
  };

  const setChildTagView = (childTag) => {
    setViewState((prev) => ({ ...prev, childTag }));
  };

  const backToOverview = () => setViewState({ category: null, tag: null, childTag: null });
  const backToCategory = () => setViewState((prev) => ({ category: prev.category, tag: null, childTag: null }));
  const backToTag = () => setViewState((prev) => ({ ...prev, childTag: null }));

  if (activeCategory && activeTag && activeChildTag) {
    return (
      <DetailPanel
        categoryName={activeCategory}
        tagName={activeChildTag}
        tagData={childTagData}
        allData={allData}
        matchKeyword={childMatchKeyword}
        onBack={backToTag}
      />
    );
  }

  if (activeCategory && activeTag) {
    if (hasChildren) {
      return (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 md:p-8 shadow-[0_8px_24px_rgba(122,106,90,0.06)]">
          <button
            onClick={backToCategory}
            className="mb-5 inline-flex items-center gap-2 text-sm text-[#7F6D5F] hover:text-[#3A4F3F] transition-colors"
          >
            ← 返回上一層
          </button>

          <div className="mb-4">
            <span className="inline-block rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold text-[#3A4F3F] mb-2">
              {activeCategory}
            </span>
            <h4 className="text-2xl font-black text-[#2F4638]">{activeTag}</h4>
          </div>

          <div className="h-[2px] w-full bg-[#E8E0D6] mb-5" />

          <div className="space-y-5">
            <div>
              <h5 className="text-sm font-bold text-[#2F4638] mb-2">標籤描述</h5>
              <p className="text-sm text-[#5F6F65] leading-7">{tagData?.desc || ''}</p>
            </div>

            <div>
              <h5 className="text-sm font-bold text-[#2F4638] mb-3">自動搜尋到的百科名稱</h5>
              <div className="flex flex-wrap gap-2">
                {getMatchedNamesByTag(allData, activeCategory, parentMatchKeyword).map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-[#E7DED4] bg-[#F9F7F3] px-3 py-1 text-sm text-[#5F6F65]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-[#2F4638] mb-3">下一層分類</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tagData.children).map(([childName]) => (
                  <button
                    key={childName}
                    onClick={() => setChildTagView(childName)}
                    className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
                  >
                    <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
                      {childName}
                    </h4>
                    <p className="text-xs text-[#A39284] mt-1">點擊查看詳細內容</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <DetailPanel
        categoryName={activeCategory}
        tagName={activeTag}
        tagData={tagData}
        allData={allData}
        matchKeyword={parentMatchKeyword}
        onBack={backToCategory}
      />
    );
  }

  if (activeCategory) {
    const categoryDataOnly = allCategoryExplanations[activeCategory] || {};

    return (
      <div>
        <button
          onClick={backToOverview}
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#7F6D5F] hover:text-[#3A4F3F] transition-colors"
        >
          ← 返回分類總覽
        </button>

        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 md:p-8 shadow-[0_8px_24px_rgba(122,106,90,0.06)]">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-[#F4EFE7] px-3 py-1 text-[11px] font-semibold text-[#3A4F3F] mb-2">
              {activeCategory}
            </span>
            <h4 className="text-2xl font-black text-[#2F4638]">{activeCategory}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryDataOnly).map(([tagName, tagDataItem]) => (
              <button
                key={tagName}
                onClick={() => setTagView(tagName)}
                className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
              >
                <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
                  {tagName}
                </h4>
                <p className="text-xs text-[#A39284] mt-1">
                  {tagDataItem.children ? '點擊進入下一層' : '點擊查看詳細內容'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#2F4638]">
          類別解釋總覽
        </h3>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E8E0D6] to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {categories.map((categoryName) => (
          <button
            key={categoryName}
            onClick={() => setCategoryView(categoryName)}
            className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
          >
            <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
              {categoryName}
            </h4>
            <p className="text-xs text-[#A39284] mt-1">點擊進入下一層</p>
          </button>
        ))}
      </div>
    </div>
  );
}