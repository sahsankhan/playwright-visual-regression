const { test, expect } = require('@playwright/test');
const { uiBaseUrl } = require('../src/config');
const { fetchFirstInStockProductId } = require('../src/utils/catalogApi');
const { prepareCatalogPage, prepareProductPage, dynamicMasks } = require('../src/utils/visualHelpers');

test.describe('Toolshop visual regression @smoke', () => {
  test('home catalog matches baseline', async ({ page }) => {
    await page.goto(`${uiBaseUrl}/`);
    await prepareCatalogPage(page);

    await expect(page).toHaveScreenshot('home-catalog.png', {
      fullPage: false,
      mask: dynamicMasks(page),
    });
  });

  test('product detail matches baseline', async ({ page }) => {
    const productId = await fetchFirstInStockProductId();
    await page.goto(`${uiBaseUrl}/product/${productId}`);
    await prepareProductPage(page);

    await expect(page).toHaveScreenshot('product-detail.png', {
      fullPage: false,
      mask: dynamicMasks(page),
    });
  });
});
