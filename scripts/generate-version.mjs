import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const projectDirectory = path.resolve(
  currentDirectory,
  '..'
);

const publicDirectory = path.join(
  projectDirectory,
  'public'
);

const srcDirectory = path.join(
  projectDirectory,
  'src'
);

const publicVersionFile = path.join(
  publicDirectory,
  'version.json'
);

const generatedVersionFile = path.join(
  srcDirectory,
  'generatedVersion.js'
);

/*
 * 每次發布前修改這裡。
 * 請只列出這次實際完成並要發布的功能。
 */
const releaseNotes = {
  title: '重新設計程式UI，內容更新',
  changes: [
    '登入狀態改為跟著分頁保存。回到前台瀏覽百科不會再被登出，重新整理頁面也維持登入。',
    '新增五分鐘閒置自動登出。離開座位超過五分鐘，系統會自動登出並回到首頁，保護後台資料。',
    '只有按「登出」或關閉分頁才會真正登出。',
    '圖卡內容重新整理。穴道卡依序顯示經絡、國際代碼、部位，下方是穴道名、英文名與主治；方劑卡顯示作用標籤，下方是中文名、別名、來源與功效。',
    '方劑新增「作用標籤」，可以一次加入多個標籤，例如扶正、解表。',
    '別名、來源、功效沒有填寫時會自動隱藏，卡片不再出現空白欄位。',
  ],
};

fs.mkdirSync(publicDirectory, {
  recursive: true,
});

fs.mkdirSync(srcDirectory, {
  recursive: true,
});

const now = new Date();

const version = [
  now.getUTCFullYear(),
  String(now.getUTCMonth() + 1).padStart(2, '0'),
  String(now.getUTCDate()).padStart(2, '0'),
  String(now.getUTCHours()).padStart(2, '0'),
  String(now.getUTCMinutes()).padStart(2, '0'),
  String(now.getUTCSeconds()).padStart(2, '0'),
].join('-');

const appVersion = `v${version}`;

const release = {
  version: appVersion,
  publishedAt: now.toISOString(),
  title: releaseNotes.title,
  changes: releaseNotes.changes,
};

const generatedVersionJs = [
  `export const APP_VERSION = ${JSON.stringify(appVersion)};`,
  '',
  `export const APP_RELEASE = ${JSON.stringify(
    release,
    null,
    2
  )};`,
  '',
].join('\n');

fs.writeFileSync(
  publicVersionFile,
  JSON.stringify(release, null, 2),
  'utf8'
);

fs.writeFileSync(
  generatedVersionFile,
  generatedVersionJs,
  'utf8'
);

console.log(`版本號已產生：${appVersion}`);
console.log(`已更新：${publicVersionFile}`);
console.log(`已更新：${generatedVersionFile}`);