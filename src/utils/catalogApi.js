const { apiBaseUrl, productId } = require('../config');

async function fetchStableProductId() {
  if (productId) {
    const pinned = await fetch(`${apiBaseUrl}/products/${productId}`);
    if (pinned.ok) {
      return productId;
    }
  }

  const response = await fetch(`${apiBaseUrl}/products`);
  if (!response.ok) {
    throw new Error(`Products API failed with ${response.status}`);
  }

  const body = await response.json();
  const products = Array.isArray(body) ? body : body.data;
  if (!Array.isArray(products)) {
    throw new Error('Products API returned an unexpected payload');
  }

  const preferred =
    products.find((item) => item.name === 'Combination Pliers' && item.in_stock) ||
    products.find((item) => item.in_stock) ||
    products[0];

  if (!preferred?.id) {
    throw new Error('No product returned from API');
  }

  return preferred.id;
}

module.exports = { fetchStableProductId };
