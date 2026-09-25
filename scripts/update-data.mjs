import fs from 'node:fs/promises';

const snapshot = {
  generatedAt: new Date().toISOString(),
  status: 'scaffold',
  note: 'Connect an approved official API/feed or controlled export here. Preserve source URLs and timestamps. Do not scrape a source against its terms.'
};

await fs.writeFile('data/current.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log('Updated data/current.json scaffold');
