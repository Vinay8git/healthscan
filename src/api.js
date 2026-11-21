const HEADERS = {
  'User-Agent':
    'HealthScan/1.1 (ingredient safety research app)',
};

const SOURCES = [
  {
    type: 'Food',
    base:
      'https://world.openfoodfacts.org/api/v2/product/',
  },

  {
    type: 'Beauty',
    base:
      'https://world.openbeautyfacts.org/api/v2/product/',
  },

  {
    type: 'General Products',
    base:
      'https://world.openproductsfacts.org/api/v2/product/',
  },
];

export function normalizeBarcode(code) {
  return String(
    code ?? ''
  ).replace(/\D/g, '');
}

export function validateBarcode(code) {
  const normalized =
    normalizeBarcode(code);

  if (
    ![8, 12, 13, 14].includes(
      normalized.length
    )
  ) {
    throw new Error(
      'Enter a valid 8, 12, 13 or 14 digit barcode.'
    );
  }

  return normalized;
}

export async function lookupBarcode(code) {
  const normalized =
    validateBarcode(code);

  const errors = [];

  for (const source of SOURCES) {
    try {
      const response =
        await fetch(
          `${source.base}${normalized}.json`,
          {
            headers: HEADERS,
          }
        );

      if (!response.ok) {
        errors.push(
          `${source.type}: HTTP ${response.status}`
        );
        continue;
      }

      const data =
        await response.json();

      if (
        data.status === 1 &&
        data.product
      ) {
        return normalizeProduct(
          data.product,
          normalized,
          source.type
        );
      }
    } catch (error) {
      errors.push(
        `${source.type}: ${
          error?.message ||
          'request failed'
        }`
      );
    }
  }

  throw new Error(
    'Product not found in the public barcode databases. Try scanning or photographing the ingredient panel instead.'
  );
}

function normalizeProduct(
  product,
  barcode,
  type
) {
  const ingredients =
    product.ingredients_text ||
    product.ingredients_text_en ||
    (
      Array.isArray(
        product.ingredients
      )
        ? product.ingredients
            .map(
              (ingredient) =>
                ingredient.text ||
                ingredient.id ||
                ''
            )
            .filter(Boolean)
            .join(', ')
        : ''
    );

  return {
    barcode,

    type,

    name:
      product.product_name ||
      product.product_name_en ||
      'Unknown product',

    brand:
      product.brands || '',

    image:
      product.image_front_url ||
      product.image_url ||
      '',

    ingredients:
      ingredients || '',

    nutriscore:
      product.nutriscore_grade ||
      product.nutrition_grades ||
      null,

    nova:
      product.nova_group ||
      null,

    quantity:
      product.quantity ||
      '',

    categories:
      product.categories ||
      '',

    countries:
      product.countries ||
      '',

    source:
      'Open Facts public databases',
  };
}