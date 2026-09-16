/** @param {import('@playwright/test').Page} page */
async function waitForVisible(page, selector, timeout = 45_000) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
  } catch (error) {
    const title = await page.title().catch(() => '');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    throw new Error(
      `Timed out waiting for ${selector} at ${page.url()} (title: "${title}"). ` +
        `Body starts with: ${bodyText.replace(/\s+/g, ' ').slice(0, 300)}`,
    );
  }
}

/** @param {import('@playwright/test').Page} page */
async function prepareCatalogPage(page) {
  await page.waitForLoadState('domcontentloaded');
  await waitForVisible(page, '[data-test="product-name"]');
  await page.waitForTimeout(500);
}

/** @param {import('@playwright/test').Page} page */
function dynamicMasks(page) {
  return [
    page.locator('.testing-notification-bar'),
    page.locator('[data-test="nav-profile"]'),
    page.locator('#chat-button, .grecaptcha-badge'),
  ];
}

/** @param {import('@playwright/test').Page} page */
async function prepareProductPage(page) {
  await page.waitForLoadState('domcontentloaded');
  await waitForVisible(page, '[data-test="add-to-cart"]');
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
}

module.exports = {
  prepareCatalogPage,
  prepareProductPage,
  dynamicMasks,
};
