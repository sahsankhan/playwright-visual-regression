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
async function stabilizePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
      html { scrollbar-width: none !important; }
      body { overflow: hidden !important; }
      .testing-notification-bar,
      [data-test="nav-profile"],
      #chat-button,
      .grecaptcha-badge,
      iframe[src*="recaptcha"] {
        display: none !important;
      }
    `,
  });
}

/** @param {import('@playwright/test').Page} page */
async function waitForImages(page) {
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll('.card img, [data-test="product-image"] img, img.card-img-top')];
    if (!images.length) {
      return true;
    }
    return images.every((img) => img.complete && img.naturalWidth > 0);
  }, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(400);
}

/** @param {import('@playwright/test').Page} page */
async function prepareCatalogPage(page) {
  await page.waitForLoadState('domcontentloaded');
  await waitForVisible(page, '[data-test="product-name"]');
  await stabilizePage(page);
  await waitForImages(page);
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
  await stabilizePage(page);
  await waitForImages(page);
}

module.exports = {
  prepareCatalogPage,
  prepareProductPage,
  dynamicMasks,
};
