/* eslint-disable no-restricted-syntax */
import { readFile } from 'fs/promises';

const json = JSON.parse(
  await readFile(new URL('../unitTestCoverage/coverage-summary.json', import.meta.url)),
);

let count = 0;
for (const [file, coverage] of Object.entries(json)) {
  if (file !== 'total') {
    if (coverage.lines.pct <= 20) {
      console.log(file);
      count += 1;
    }
  }
}

console.log(`********** TOTAL: ${count} ********* `);
