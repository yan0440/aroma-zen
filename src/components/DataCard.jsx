import React, { memo, useCallback, useMemo } from 'react';
import { getCategoryLabel } from '../config/categories';

const BOLD_KEYWORDS = ['肌肉', '神經', '血管'];

const getLocationLabel = (location) => {
  const text = String(location || '').trim();
  if (!text) return '';
  const locationRules = [
    { label: '頭面部', keywords: ['面部', '頭側部'] },
    { label: '頸肩部', keywords: ['鎖骨', '頸', '脖', '項', '喉', '肩', '頸部'] },
    { label: '胸腹部', keywords: ['胸', '乳', '心前區', '腹', '臍', '肚', '胸部', '腹部'] },
    { label: '背腰部', keywords: ['背', '脊', '腰', '骶', '脊柱', '背部', '腰部'] },
    { label: '上肢部', keywords: ['臂內', '上臂', '前臂', '肘', '手', '腕', '掌', '指', '肩臂'] },
    { label: '下肢部', keywords: ['髖', '臀', '大腿', '膝', '小腿', '踝', '足', '腳', '趾', '下肢'] },
    { label: '全身', keywords: ['全身', '身體', '軀幹'] },
  ];
  const matchedRule = locationRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  return matchedRule ? matchedRule.label : '';
};

const getCategoryType = (category) => {
  const value = String(category || '').trim();
  return {
    isOil: value === '精油',
    isAcupuncture: value === '穴道' || value === '穴位' || value === '腧穴',
    isChineseMedicine: value === '中藥' || value === '中医' || value === '藥材' || value === '药材',
  };
};

const firstValue = (item, keys) => {
  for (const key of keys) {
    const value = key.split('.').reduce((current, part) => current?.[part], item);
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
};

const DataCard = memo(function DataCard({ item = {}, onSelectItem }) {
  const { isOil, isAcupuncture, isChineseMedicine } = useMemo(() => getCategoryType(item.category), [item.category]);
  const englishName = String(firstValue(item, ['englishName', 'english', '英文名', '英文名稱', 'latin']) || '').trim();
  const indications = String(firstValue(item, ['indications', 'effect', '主治', '主治功效', '功效']) || '').trim();
  const meridian = String(firstValue(item, ['meridian', 'acuTable.meridian']) || '').trim();
  const location = String(firstValue(item, ['acuDetails.location', 'location']) || '').trim();
  const locationLabel = isAcupuncture ? getLocationLabel(location) : '';
  const tags = useMemo(() => {
    const values = [item.tag, item.type, item.constitutionTag, item.chemicalTag];
    if (isAcupuncture) values.push(item.meridian, item.acuTable?.meridian);
    return values.flatMap((value) => Array.isArray(value) ? value : [value]).map((value) => String(value || '').trim()).filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);
  }, [item.tag, item.type, item.constitutionTag, item.chemicalTag, item.meridian, item.acuTable?.meridian, isAcupuncture]);
  const handleClick = useCallback(() => onSelectItem?.(item), [item, onSelectItem]);
  const handleKeyDown = useCallback((event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectItem?.(item); } }, [item, onSelectItem]);
  const subtitle = isOil ? englishName : isAcupuncture ? item.acuTable?.code || '' : item.category === '其他' ? item.type || item.alias || '' : item.alias || '';

  return <div onClick={handleClick} role="button" tabIndex={0} onKeyDown={handleKeyDown} className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-7">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6B9080] via-[#C8A97E] to-[#D9C6B0] opacity-70" />
    <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#F4EFE7] px-3 py-1 text-[13px] font-semibold tracking-wider text-[#3A4F3F]">{getCategoryLabel(item.category)}</span>{tags.map((tag, index) => <span key={`tag-${index}-${tag}`} className="rounded-full border border-[#E7DED4] bg-white px-3 py-1 text-[13px] font-medium text-[#7C8A80]">{tag}</span>)}</div>
    <h3 className="text-[22px] font-black leading-tight tracking-tight text-[#2F4638] transition-colors group-hover:text-[#6B9080] md:text-[26px]">{item.name || '未命名'}</h3>
    {isOil && <div className="mt-3 space-y-2"><div className="text-[15px] italic text-[#6B7280]">{englishName || '尚未填寫英文名'}</div><div><div className="mb-1 text-[11px] font-bold tracking-wider text-[#A39284]"></div><div className="line-clamp-3 whitespace-pre-wrap break-words text-[15px] leading-6 text-[#3A4F3F]">{indications || ''}</div></div></div>}
    {isAcupuncture && <div className="mt-3 space-y-1">{englishName && <div className="text-[15px] text-[#6B7280]">{englishName}</div>}{locationLabel && <div className="text-[15px] font-semibold text-[#3A4F3F]">{locationLabel}</div>}</div>}
    {isChineseMedicine && <div className="mt-2 space-y-1">{englishName && <div className="text-[15px] text-[#6B7280]">{englishName}</div>}{meridian && <div className="text-[15px] font-semibold text-[#3A4F3F]">{meridian}</div>}</div>}
    {!isOil && !isAcupuncture && !isChineseMedicine && subtitle && <div className="mt-3 text-[15px] italic text-[#6B7280]">{subtitle}</div>}
    <div className="mt-5 flex items-center justify-between border-t border-[#EEE6DC] pt-4"><span className="text-[14px] text-[#A39284]">點擊查看詳細內容</span></div>
  </div>;
});

export default DataCard;
