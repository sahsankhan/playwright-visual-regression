const { defineConfig, devices } = require('@playwright/test');
const { uiBaseUrl, headless, timeoutMs, maxDiffPixelRatio } = require('./src/config');

const isCi = Boolean(process.env.CI);

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: 1,
  timeout: timeoutMs,
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{platform}{ext}',
  reporter: isCi
    ? [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'reports/visual-results.json' }],
        ['github'],
        ['list'],
      ]
    : [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'reports/visual-results.json' }],
        ['list'],
      ],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  use: {
    baseURL: uiBaseUrl,
    headless,
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        launchOptions: {
          args: ['--font-render-hinting=none', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
});
