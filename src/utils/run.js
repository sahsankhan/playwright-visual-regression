const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateVisualSummary, summaryPath } = require('./visualReport');

const args = process.argv.slice(2);
const headed = args.includes('--headed');
const playwrightArgs = args.filter((arg) => arg !== '--headed');

if (headed) {
  process.env.HEADLESS = 'false';
}

const result = spawnSync('npx', ['playwright', 'test', ...playwrightArgs], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (fs.existsSync(path.join('reports', 'visual-results.json'))) {
  generateVisualSummary();
}

const openTarget = fs.existsSync(summaryPath)
  ? path.resolve(summaryPath)
  : path.resolve('playwright-report', 'index.html');

if (!process.env.CI && fs.existsSync(openTarget)) {
  if (process.platform === 'win32') {
    spawnSync('cmd', ['/c', 'start', '', openTarget], { stdio: 'ignore' });
  } else if (process.platform === 'darwin') {
    spawnSync('open', [openTarget], { stdio: 'ignore' });
  } else {
    spawnSync('xdg-open', [openTarget], { stdio: 'ignore' });
  }
}

process.exit(result.status === null ? 1 : result.status);
