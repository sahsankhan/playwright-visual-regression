/** @param {import('@playwright/test').Page} page */
async function prepareCatalogPage(page) {
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.locator('[data-test="product-name"]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', () => {}, { once: true });
      }
    });
  });
  await page.waitForTimeout(300);
}

/** @param {import('@playwright/test').Page} page */
function dynamicMasks(page) {
  return [
    page.locator('.testing-notification-bar'),
    page.locator('[data-test="nav-profile"]'),
  ];
}

/** @param {import('@playwright/test').Page} page */
async function prepareProductPage(page) {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.locator('[data-test="add-to-cart"]').waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
}

module.exports = {
  prepareCatalogPage,
  prepareProductPage,
  dynamicMasks,
};
