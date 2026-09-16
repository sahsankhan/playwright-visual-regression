const { test, expect } = require('@playwright/test');
const { uiBaseUrl, productId } = require('../src/config');
const { prepareCatalogPage, prepareProductPage, dynamicMasks } = require('../src/utils/visualHelpers');

test.describe('Toolshop visual regression @smoke', () => {
  test('home catalog matches baseline', async ({ page }) => {
    await page.goto(`${uiBaseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await prepareCatalogPage(page);

    await expect(page).toHaveScreenshot('home-catalog.png', {
      fullPage: false,
      mask: dynamicMasks(page),
    });
  });

  test('product detail matches baseline', async ({ page }) => {
    await page.goto(`${uiBaseUrl}/product/${productId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await prepareProductPage(page);

    await expect(page).toHaveScreenshot('product-detail.png', {
      fullPage: false,
      mask: dynamicMasks(page),
    });
  });
});

// Demo only — deliberately fails against the committed home-catalog baseline.
// Run: npm run demo:diff (generates docs/assets/* for README; not part of CI smoke).
test.describe('Intentional diff demo @demo', () => {
  test('home catalog detects injected navbar color change', async ({ page }) => {
    await page.goto(`${uiBaseUrl}/`);
    await prepareCatalogPage(page);

    await page.addStyleTag({
      content: 'nav.navbar, .navbar, header { background-color: #dc2626 !important; }',
    });

    await expect(page).toHaveScreenshot('home-catalog.png', {
      fullPage: false,
      mask: dynamicMasks(page),
    });
  });
});
