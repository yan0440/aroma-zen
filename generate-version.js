import fs from 'fs';
import { execSync } from 'child_process';

// 取得最近一次的 commit hash 前 7 碼
const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
const timestamp = new Date().toISOString().slice(0, 10);
const version = `v${timestamp}-${gitHash}`;

// 將版本號寫入 public/version.json
fs.writeFileSync('public/version.json', JSON.stringify({ version }));
console.log(`版本已更新至: ${version}`);