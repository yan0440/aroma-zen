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

const generatedVersionFile = path.join(
  srcDirectory,
  'generatedVersion.js'
);

const publicVersionFile = path.join(
  publicDirectory,
  'version.json'
);

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

const versionJson = {
  version: appVersion,
};

fs.writeFileSync(
  publicVersionFile,
  JSON.stringify(versionJson, null, 2),
  'utf8'
);

fs.writeFileSync(
  generatedVersionFile,
  `export const APP_VERSION = '${appVersion}';\n`,
  'utf8'
);

console.log(`版本號已產生：${appVersion}`);