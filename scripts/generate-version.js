const fs = require('node:fs');
const path = require('node:path');

const version = new Date().toISOString().replace(/[:.]/g, '-');
const outputPath = path.resolve(__dirname, '../public/version.json');

const content = {
  version: `v${version}`,
};

fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');
console.log(`version.json generated: ${content.version}`);