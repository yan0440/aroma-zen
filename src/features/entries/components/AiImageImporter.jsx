/**
 * AI 圖片匯入器
 *
 * 作用：
 * - 上傳圖片
 * - 解析圖片內容
 * - 取得 AI 回傳資料
 * - 將資料回傳給 AddEntryPage
 */

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

const GEMINI_MODEL =
  'gemini-3.5-flash-lite';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_IMAGE_SIZE = 7 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

function parseAiJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('AI 沒有回傳內容');
  }

  const cleanedText = text
    .replace(/^\uFEFF/, '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const arrayStart = cleanedText.indexOf('[');
  const objectStart = cleanedText.indexOf('{');

  if (arrayStart === -1 && objectStart === -1) {
    throw new Error('AI 回傳的內容不是 JSON');
  }

  const isArray = arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart);
  const start = isArray ? arrayStart : objectStart;
  const end = isArray ? cleanedText.lastIndexOf(']') : cleanedText.lastIndexOf('}');

  if (end === -1 || end <= start) {
    throw new Error('AI 回傳的 JSON 不完整');
  }

  const jsonText = cleanedText.slice(start, end + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('JSON 解析失敗：', jsonText, error);
    throw new Error('AI 回傳格式錯誤，請再試一次。');
  }
}

function createPrompt(category) {
  return `你是「本草與芳香數位百科」的資料整理助手。

目前表單分類是：
${category || ''}

請讀取這個圖片或 PDF 文件，將文件中的內容整理成百科表單資料。

如果是 PDF，請讀取文件中的文字、表格、圖片與段落。
只能使用文件中實際看得到的資料。
文件中沒有的資料請填入空字串。
不要自行推測、補充或捏造醫療資料。

欄位對應規則：

共同欄位：
- 名稱 → name
- 簡介描述 → description
- 核心標籤 → tag
- 別名 → alias
- 外文名 → englishName
- 拉丁學名 → latin
- 來源 → source
- 功效 → effect
- 主治 → indications
- 文獻別錄 → literature
- 注意禁忌 → contraindication
- 註 → note
- 科名或科屬 → family
- 性味 → nature
- 歸經 → meridian
- 重要產地 → origin
- 用法用量 → dosage

精油欄位：
- 植物種類／萃取部位 → typePart
- 萃取方法 → method
- 五行／陰陽屬性 → property
- 類比音符 → noteAnalogy
- 主宰星球 → planet
- 適用體質標籤 → constitutionTag
- 化學屬性標籤 → chemicalTag
- 氣味 → oilDetails.scent
- 外觀描述 → oilDetails.appearance
- 應用歷史與相關神話 → oilDetails.historyMyth
- 化學結構 → oilDetails.chemistry
- 屬性補充 → oilDetails.attribute
- 注意事項 → oilDetails.caution
- 心靈療效 → oilDetails.mindEffect
- 身體療效 → oilDetails.bodyEffect
- 皮膚療效 → oilDetails.skinEffect
- 體質適用 → oilDetails.constitution
- 適合調和的精油 → oilDetails.blendingOils
- 精油配方 → oilDetails.formulas
- 按摩基底油 → oilDetails.carrierOils
- 使用方法 → oilDetails.usage

精油欄位限制：
- 植物種類／萃取部位只能放在 typePart。
- 萃取方法只能放在 method。
- 五行／陰陽屬性只能放在 property。
- 類比音符只能放在 noteAnalogy。
- 主宰星球只能放在 planet。
- 屬性補充只能放在 oilDetails.attribute。
- 使用方法只能放在 oilDetails.usage。
- 不可以把 typePart 或 method 放到 oilDetails.usage。
- 不可以把 noteAnalogy 或 planet 放到 oilDetails.attribute。

穴道欄位：
- 國際代碼 → acuTable.code
- 經絡 → acuTable.meridian
- 穴道別名 → acuTable.alias
- 位置 → acuDetails.location
- 操作 → acuDetails.operation
- 主治 → acuDetails.indications
- 類別 → acuDetails.type
- 釋名 → acuDetails.nameExpl
- 解剖 → acuDetails.anatomy
- 古代功效 → acuDetails.effectAncient
- 現代功效 → acuDetails.effectModern
- 配穴 → acuDetails.matchingPoints

書籍欄位：
- 作者／編著 → bookDetails.author
- 篇、章、節、目、子目 → bookDetails.chapters
- 階層名稱放在 title。
- 章節正文放在 text。
- 子階層放在 children。

書籍章節節點格式：
{
  "id": "",
  "title": "",
  "type": "folder",
  "text": "",
  "children": []
}

中藥欄位：
- 性狀 → traits
- 現代藥理 → pharmacology
- 現代應用 → contemporary
- 選方 → medicine
- 炮製儲藏 → preparation
- 附藥說明 → directions

方劑欄位：
- 製法用量 → preparation
- 方義 → analysis
- 方論 → discussion
- 辨證要點 → syndrome
- 加減 → modifications
- 現代應用 → modernApp
- 現代藥理 → modernPharmacology
- 附方 → prescription

目前分類是「${category || ''}」。
請優先填寫符合目前分類的欄位。
其他分類不相關的欄位請留空。

重要輸出規則：
1. 只能回傳合法 JSON。
2. 不要回傳 Markdown。
3. 不要使用三個反引號。
4. 不要在 JSON 前後加入說明。
5. 所有欄位名稱使用雙引號。
6. 所有文字值使用雙引號。
7. 不要有多餘逗號。
8. 如果只有一筆資料，回傳單一 JSON 物件。
9. 如果有多筆資料，最外層回傳 JSON 陣列。
10. 多筆資料時，每一筆都必須使用相同的完整欄位結構。
11. 文獻別錄遇到編號可以忽略編號。
12. 如果有編排符號「●」不要省略，且要換行。
13. 配穴、功效、解剖要省略「●」，且遇到開頭是「肌肉」、「神經」、「血管」就連內容一起換行。
14. 功效第一行視為主治，遇到「古典：」與「現代：」則歸類到「古代功效」與「現代功效」。
15. 如果文件內容不清楚，請填入空字串，不要猜測。
16. 請確保回傳內容能直接通過 JSON.parse()。

單筆資料格式：
{
  "name": "",
  "description": "",
  "tag": "",
  "englishName": "",
  "latin": "",
  "typePart": "",
  "method": "",
  "property": "",
  "noteAnalogy": "",
  "planet": "",
  "origin": "",
  "constitutionTag": "",
  "chemicalTag": "",
  "alias": "",
  "source": "",
  "effect": "",
  "indications": "",
  "literature": "",
  "contraindication": "",
  "note": "",
  "family": "",
  "nature": "",
  "meridian": "",
  "traits": "",
  "dosage": "",
  "pharmacology": "",
  "contemporary": "",
  "medicine": "",
  "preparation": "",
  "directions": "",
  "analysis": "",
  "discussion": "",
  "syndrome": "",
  "modifications": "",
  "modernApp": "",
  "modernPharmacology": "",
  "prescription": "",
  "acuTable": {
    "code": "",
    "meridian": "",
    "alias": ""
  },
  "acuDetails": {
    "location": "",
    "operation": "",
    "indications": "",
    "type": "",
    "nameExpl": "",
    "anatomy": "",
    "effectAncient": "",
    "effectModern": "",
    "matchingPoints": ""
  },
  "oilDetails": {
    "scent": "",
    "appearance": "",
    "historyMyth": "",
    "chemistry": "",
    "attribute": "",
    "caution": "",
    "mindEffect": "",
    "bodyEffect": "",
    "skinEffect": "",
    "constitution": "",
    "blendingOils": "",
    "formulas": "",
    "carrierOils": "",
    "usage": ""
  },
  "bookDetails": {
    "author": "",
    "chapters": []
  }
}`;
}

function normalizeFileMimeType(file) {
  if (file.type) return file.type;
  const lowerName = String(file.name || '').toLowerCase();
  if (lowerName.endsWith('.pdf')) return 'application/pdf';
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function getFriendlyApiError(status, apiMessage) {
  if (status === 400) return `Gemini 請求格式錯誤：${apiMessage || '請確認圖片、PDF 或模型設定。'}`;
  if (status === 401 || status === 403) return `Gemini API Key 無效、網域未被允許或專案沒有權限：${apiMessage || '請檢查 Vercel Production Key 與 Google API Key 限制。'}`;
  if (status === 404) return `找不到 Gemini 模型或 API 端點：${apiMessage || '請確認模型名稱與 API URL。'}`;
  if (status === 413) return '上傳檔案太大，請縮小圖片或 PDF 後再試。';
  if (status === 429) return 'Gemini 免費額度或請求次數已用完，請稍後再試。不要連續重複上傳。';
  return apiMessage || `Gemini API 呼叫失敗，HTTP ${status}`;
}

export default function AiImageImporter({
  category,
  disabled = false,
  isSaving = false,
  onData,
}) {
  const fileRef = useRef(null);
  const [isReading, setIsReading] = useState(false);
  const [message, setMessage] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 7000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const mimeType = normalizeFileMimeType(file);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(mimeType)) {
      setMessage('目前只支援 JPG、PNG、WEBP 或 PDF 檔案。');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const maxFileSize = mimeType === 'application/pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxFileSize) {
      setMessage(mimeType === 'application/pdf' ? 'PDF 大小不能超過 10MB。' : '圖片大小不能超過 7MB。');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim();

    console.log('[Gemini] API Key 狀態：', apiKey ? `已讀取，長度 ${apiKey.length}` : '未讀取');

    if (!apiKey) {
      setMessage('正式環境找不到 Gemini API Key，請確認 Vercel Production 已設定 VITE_GEMINI_API_KEY，並重新部署。');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setIsReading(true);
    setMessage('AI 正在讀取圖片或 PDF……');
    setDetectedItems([]);
    setSelectedIndex(0);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const commaIndex = result.indexOf(',');
          const data = commaIndex >= 0 ? result.slice(commaIndex + 1) : result;
          const cleanBase64 = data.replace(/\s/g, '').trim();
          if (!cleanBase64) {
            reject(new Error('檔案讀取失敗'));
            return;
          }
          resolve(cleanBase64);
        };
        reader.onerror = () => reject(new Error('檔案讀取失敗'));
        reader.readAsDataURL(file);
      });

      const prompt = createPrompt(category);
      const geminiUrl = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: String(base64) } }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0,
            maxOutputTokens: 8192,
          },
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiMessage = result?.error?.message || '';
        console.error('[Gemini] API 錯誤：', { status: response.status, statusText: response.statusText, message: apiMessage });
        throw new Error(getFriendlyApiError(response.status, apiMessage));
      }

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text.trim()) throw new Error('AI 沒有回傳任何內容');

      console.log('[Gemini] 已收到回應');
      const parsedData = parseAiJson(text);
      const items = Array.isArray(parsedData) ? parsedData : [parsedData];
      const validItems = items.filter((item) => item && typeof item === 'object' && !Array.isArray(item));

      if (validItems.length === 0) throw new Error('AI 沒有偵測到可用的百科資料');

      setDetectedItems(validItems);
      setSelectedIndex(0);
      setMessage(`✅ 偵測到 ${validItems.length} 筆資料，請選擇要填入的項目。`);
    } catch (error) {
      console.error('AI 辨識失敗：', error);
      setMessage(`AI 辨識失敗：${error?.message || '未知錯誤'}`);
    } finally {
      setIsReading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={handleFileChange} />

      <button type="button" disabled={disabled || isSaving || isReading} onClick={() => fileRef.current?.click()} className="rounded-full bg-[#D7A85D] px-6 py-2 font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60">
        {isReading ? 'AI 讀取中...' : '📄 AI 讀取'}
      </button>

      {message && <div className={`fixed bottom-6 right-6 z-[9999] min-w-[280px] max-w-[520px] whitespace-pre-wrap rounded-2xl border px-5 py-4 text-sm font-bold shadow-2xl ${message.startsWith('✅') ? 'border-[#B9D5B9] bg-[#F0F7F0] text-[#3A4F3F]' : 'border-[#F0B8B0] bg-[#FFF4F2] text-[#A64236]'}`}>{message}</div>}

      {detectedItems.length > 0 && <div className="fixed bottom-24 right-6 z-[9998] w-[320px] rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-2xl">
        <label className="mb-2 block text-sm font-bold text-[#3A4F3F]">選擇要填入的百科資料</label>
        <select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))} className="w-full rounded-xl border border-[#E5E0D8] px-3 py-2 text-sm outline-none">
          {detectedItems.map((item, index) => <option key={index} value={index}>{index + 1}. {item.name || '未命名資料'}</option>)}
        </select>
        <button type="button" onClick={() => { const selectedItem = detectedItems[selectedIndex]; if (!selectedItem) { setMessage('請先選擇一筆資料。'); return; } onData(selectedItem); setDetectedItems([]); setSelectedIndex(0); setMessage(`✅ 已將「${selectedItem.name || '資料'}」填入表單。`); }} className="mt-3 w-full rounded-xl bg-[#3A4F3F] px-4 py-2 font-bold text-white">填入目前表單</button>
        <button type="button" onClick={() => { setDetectedItems([]); setSelectedIndex(0); }} className="mt-2 w-full px-4 py-2 font-bold text-[#A39284]">取消</button>
      </div>}
    </div>
  );
}
