import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const publicDirectory = path.resolve(
  currentDirectory,
  '../public'
);

const versionFile = path.join(
  publicDirectory,
  'version.json'
);

fs.mkdirSync(publicDirectory, {
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

const versionData = {
  version: `v${version}`,
};

fs.writeFileSync(
  versionFile,
  JSON.stringify(versionData, null, 2),
  'utf8'
);

console.log(
  `version.json 已建立：${versionData.version}`
);