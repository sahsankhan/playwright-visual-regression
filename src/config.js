require('dotenv').config();

const uiBaseUrl = (process.env.UI_BASE_URL || 'https://practicesoftwaretesting.com').replace(/\/$/, '');
const apiBaseUrl = (process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com').replace(/\/$/, '');

module.exports = {
  uiBaseUrl,
  apiBaseUrl,
  productId: process.env.PRODUCT_ID || '01M2MTJ2QH6C62RDQHWFVAVE9Y',
  headless: process.env.HEADLESS !== 'false',
  timeoutMs: Number(process.env.TIMEOUT || 60_000),
  maxDiffPixelRatio: Number(process.env.MAX_DIFF_PIXEL_RATIO || 0.01),
};
