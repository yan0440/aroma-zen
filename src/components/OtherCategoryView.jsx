import React, { useState } from 'react';
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

function getMatchedNamesByTag(allData, categoryName, keyword) {
  return Array.from(
    new Set(
      allData
        .filter((item) => item?.category === categoryName)
        .filter((item) => tagIncludes(getItemTag(item), keyword))
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
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [activeChildTag, setActiveChildTag] = useState(null);

  const categories = Object.keys(allCategoryExplanations);

  // 第三層：子分類（辛溫解表 / 辛涼解表）
  if (activeCategory && activeTag && activeChildTag) {
    const tagData = allCategoryExplanations[activeCategory]?.[activeTag]?.children?.[activeChildTag];

    return (
      <DetailPanel
        categoryName={activeCategory}
        tagName={activeChildTag}
        tagData={tagData}
        allData={allData}
        matchKeyword={activeChildTag}
        onBack={() => setActiveChildTag(null)}
      />
    );
  }

  // 第二層：中藥下的標籤（例如：解表藥）
  if (activeCategory && activeTag) {
    const tagData = allCategoryExplanations[activeCategory]?.[activeTag];
    const hasChildren = tagData?.children && Object.keys(tagData.children).length > 0;

    if (hasChildren) {
      // 解表藥本身也要做搜尋，用 "解表" 當關鍵字
      const parentMatchKeyword = activeTag === '解表藥' ? '解表' : activeTag;
      const parentMatched = getMatchedNamesByTag(allData, activeCategory, parentMatchKeyword);

      return (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 md:p-8 shadow-[0_8px_24px_rgba(122,106,90,0.06)]">
          <button
            onClick={() => setActiveTag(null)}
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
                {parentMatched.length > 0 ? (
                  parentMatched.map((name) => (
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

            <div>
              <h5 className="text-sm font-bold text-[#2F4638] mb-3">下一層分類</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tagData.children).map(([childName, childData]) => (
                  <button
                    key={childName}
                    onClick={() => setActiveChildTag(childName)}
                    className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
                  >
                    <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
                      {childName}
                    </h4>
                    <p className="text-xs text-[#A39284] mt-1">
                      點擊查看詳細內容
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 沒有 children 的標籤
    return (
      <DetailPanel
        categoryName={activeCategory}
        tagName={activeTag}
        tagData={tagData}
        allData={allData}
        matchKeyword={activeTag}
        onBack={() => setActiveTag(null)}
      />
    );
  }

  // 第一層：分類總覽（中藥 / 穴道 / 精油 / 方劑 / 書籍）
  if (activeCategory) {
    const categoryData = allCategoryExplanations[activeCategory] || {};

    return (
      <div>
        <button
          onClick={() => setActiveCategory(null)}
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
            {Object.entries(categoryData).map(([tagName, tagData]) => (
              <button
                key={tagName}
                onClick={() => setActiveTag(tagName)}
                className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
              >
                <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
                  {tagName}
                </h4>
                <p className="text-xs text-[#A39284] mt-1">
                  {tagData.children ? '點擊進入下一層' : '點擊查看詳細內容'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 第 0 層：所有分類按鈕
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
            onClick={() => setActiveCategory(categoryName)}
            className="rounded-2xl border border-[#E7DED4] bg-white px-4 py-5 text-left hover:bg-[#F3E1C5] hover:border-[#C8A97E] transition-all"
          >
            <h4 className="text-sm md:text-base font-bold text-[#2F4638]">
              {categoryName}
            </h4>
            <p className="text-xs text-[#A39284] mt-1">
              點擊進入下一層
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}