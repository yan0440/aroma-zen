// components/InfoCard.jsx
import React from 'react';

function firstValue(item, keys) {
  for (const key of keys) {
    const value = key.includes('.')
      ? key.split('.').reduce((current, part) => current?.[part], item)
      : item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function InfoRow({ label, value, className = '' }) {
  const text = String(value || '').trim();
  if (!text) return null;
  return (
    <div className={className}>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#A39284]">
        {label}
      </div>
      <div className="whitespace-pre-wrap break-words text-sm leading-5 text-[#6B7A6E]">
        {text}
      </div>
    </div>
  );
}

export default function InfoCard({ item = {}, onClick }) {
  const tags = [
    item.category,
    item.tag,
    item.constitutionTag,
    item.chemicalTag,
    item.acuTable?.meridian,
  ].filter(Boolean);

  const isOil = item.category === '精油';
  const englishName = firstValue(item, ['englishName', 'english', '英文名', '英文名稱']);
  const indications = firstValue(item, ['indications', 'effect', '主治', '主治功效', '功效']);
  const subtitle = englishName || item.acuTable?.code || '';
  const summary = firstValue(item, ['description', 'effect', 'indications']) || '暫無描述';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-[#E5E0D8]/60 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="rounded bg-[#F0EDE6] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7A6E]">
            {tag}
          </span>
        ))}
      </div>

      <h3 className="mb-1 text-xl font-black text-[#3A4F3F] transition-colors group-hover:text-[#6B9080]">
        {item.name || '未命名'}
      </h3>

      {subtitle && (
        <p className="mb-3 text-xs italic text-[#A39284] font-serif">
          {subtitle}
        </p>
      )}

      {isOil ? (
        <div className="space-y-3">
          <InfoRow label="英文名" value={englishName} />
          <InfoRow label="主治" value={indications} />
          <InfoRow label="簡介" value={item.description} />
        </div>
      ) : (
        <p className="line-clamp-3 text-sm leading-relaxed text-[#6B7A6E]">
          {summary}
        </p>
      )}
    </div>
  );
}
