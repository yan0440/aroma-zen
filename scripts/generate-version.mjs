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
  title: '重新設計名詞材料UI',
  changes: [
    '更改UI呈現風格',
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