const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join('docs', 'assets');

function findAttachmentFiles(rootDir) {
  const found = { expected: null, actual: null, diff: null };

  if (!fs.existsSync(rootDir)) {
    return found;
  }

  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      const lower = entry.name.toLowerCase();
      if (lower.includes('expected') && lower.endsWith('.png')) {
        found.expected = fullPath;
      } else if (lower.includes('actual') && lower.endsWith('.png')) {
        found.actual = fullPath;
      } else if (lower.includes('diff') && lower.endsWith('.png')) {
        found.diff = fullPath;
      }
    }
  }

  return found;
}

function copyAsset(source, filename) {
  if (!source) {
    return false;
  }
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(source, path.join(assetsDir, filename));
  return true;
}

console.log('Running intentional visual diff demo (@demo) — expect failure...\n');

if (fs.existsSync('test-results')) {
  fs.rmSync('test-results', { recursive: true, force: true });
}

const result = spawnSync('npx', ['playwright', 'test', '--grep', '@demo'], {
  shell: true,
  stdio: 'inherit',
  env: process.env,
});

const attachments = findAttachmentFiles('test-results');
const copied = {
  expected: copyAsset(attachments.expected, 'home-catalog-expected.png'),
  actual: copyAsset(attachments.actual, 'home-catalog-actual.png'),
  diff: copyAsset(attachments.diff, 'home-catalog-diff.png'),
};

console.log('\nCaptured README assets:');
console.log(`  expected: ${copied.expected ? 'docs/assets/home-catalog-expected.png' : 'MISSING'}`);
console.log(`  actual:   ${copied.actual ? 'docs/assets/home-catalog-actual.png' : 'MISSING'}`);
console.log(`  diff:     ${copied.diff ? 'docs/assets/home-catalog-diff.png' : 'MISSING'}`);

if (!copied.diff) {
  console.error('\nDiff image was not captured. Check test-results/ after the demo run.');
  process.exit(1);
}

if (result.status === 0) {
  console.error('\nDemo test passed unexpectedly — it should fail to produce a diff.');
  process.exit(1);
}

console.log('\nDone. Commit docs/assets/*.png and reference them in README.');
process.exit(0);
