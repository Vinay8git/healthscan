import { PaddleOCR } from '@paddleocr/paddleocr-js';

/*
|--------------------------------------------------------------------------
| HealthScan OCR — PaddleOCR.js
|--------------------------------------------------------------------------
|
| Browser-side OCR using PaddleOCR PP-OCRv5.
|
| Design goals:
|
| 1. No Tesseract.
| 2. No OCR diagnostics shown to users.
| 3. One OCR worker/model reused across scans.
| 4. Multiple image preprocessing variants.
| 5. Multiple variants can be sent to PaddleOCR in one prediction call.
| 6. OCR results are fused.
| 7. Ingredient-specific text gets additional normalization.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Singleton OCR instance
|--------------------------------------------------------------------------
|
| Loading an OCR model repeatedly is expensive.
|
| We initialize PaddleOCR once and reuse it for subsequent scans.
|--------------------------------------------------------------------------
*/

let paddleOCRPromise = null;

function getPaddleOCR() {
  if (!paddleOCRPromise) {
    paddleOCRPromise = PaddleOCR.create({
      /*
       * English is the primary model for ingredient labels.
       *
       * PP-OCRv5 supports English and many other languages.
       */
      lang: 'en',

      /*
       * Current high-quality PP-OCR generation.
       */
      ocrVersion: 'PP-OCRv5',

      /*
       * Keep OCR work away from the main UI thread.
       */
      worker: true,

      /*
       * WASM is the safest browser runtime.
       *
       * SIMD and multithreading are enabled where supported.
       */
      ortOptions: {
        backend: 'wasm',
        wasmPaths:
          'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
        numThreads: 2,
        simd: true,
      },
    });
  }

  return paddleOCRPromise;
}

/*
|--------------------------------------------------------------------------
| Image loading
|--------------------------------------------------------------------------
*/

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

/*
|--------------------------------------------------------------------------
| Clamp
|--------------------------------------------------------------------------
*/

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

/*
|--------------------------------------------------------------------------
| Canvas creation
|--------------------------------------------------------------------------
*/

function createBaseCanvas(
  image,
  scale = 2
) {
  const sourceWidth =
    image.naturalWidth ||
    image.width;

  const sourceHeight =
    image.naturalHeight ||
    image.height;

  /*
   * PaddleOCR can process large images, but extremely large images
   * create unnecessary browser memory pressure.
   */
  const maxDimension = 3000;

  const sourceLongestSide =
    Math.max(
      sourceWidth,
      sourceHeight
    );

  const effectiveScale = Math.min(
    scale,
    maxDimension /
      Math.max(
        1,
        sourceLongestSide
      )
  );

  const width = Math.max(
    900,
    Math.round(
      sourceWidth *
        effectiveScale
    )
  );

  const height = Math.max(
    600,
    Math.round(
      sourceHeight *
        effectiveScale
    )
  );

  const canvas =
    document.createElement(
      'canvas'
    );

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext(
      '2d',
      {
        willReadFrequently: true,
      }
    );

  if (!ctx) {
    throw new Error(
      'Could not initialize image processing.'
    );
  }

  ctx.imageSmoothingEnabled =
    true;

  ctx.imageSmoothingQuality =
    'high';

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  return canvas;
}

/*
|--------------------------------------------------------------------------
| Grayscale + contrast
|--------------------------------------------------------------------------
*/

function enhanceContrast(
  canvas,
  contrast = 1.25,
  brightness = 1
) {
  const output =
    document.createElement(
      'canvas'
    );

  output.width =
    canvas.width;

  output.height =
    canvas.height;

  const ctx =
    output.getContext(
      '2d',
      {
        willReadFrequently: true,
      }
    );

  if (!ctx) {
    return canvas;
  }

  ctx.drawImage(
    canvas,
    0,
    0
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      output.width,
      output.height
    );

  const pixels =
    imageData.data;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    let gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;

    /*
     * Contrast around midpoint.
     */
    gray =
      (gray - 128) *
        contrast +
      128;

    gray *= brightness;

    gray = clamp(
      gray,
      0,
      255
    );

    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return output;
}

/*
|--------------------------------------------------------------------------
| Adaptive-ish threshold
|--------------------------------------------------------------------------
|
| A global threshold is not always ideal for product photography.
| We therefore create only a couple of threshold variants and let
| PaddleOCR's detector decide which text regions are useful.
|--------------------------------------------------------------------------
*/

function thresholdCanvas(
  canvas,
  threshold
) {
  const output =
    document.createElement(
      'canvas'
    );

  output.width =
    canvas.width;

  output.height =
    canvas.height;

  const ctx =
    output.getContext(
      '2d',
      {
        willReadFrequently: true,
      }
    );

  if (!ctx) {
    return canvas;
  }

  ctx.drawImage(
    canvas,
    0,
    0
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      output.width,
      output.height
    );

  const pixels =
    imageData.data;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;

    const value =
      gray >= threshold
        ? 255
        : 0;

    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return output;
}

/*
|--------------------------------------------------------------------------
| Sharpen
|--------------------------------------------------------------------------
|
| Lightweight browser sharpening.
|--------------------------------------------------------------------------
*/

function sharpenCanvas(
  canvas
) {
  const output =
    document.createElement(
      'canvas'
    );

  output.width =
    canvas.width;

  output.height =
    canvas.height;

  const ctx =
    output.getContext(
      '2d'
    );

  if (!ctx) {
    return canvas;
  }

  /*
   * CSS filtering is much cheaper than implementing a full convolution
   * kernel in JavaScript.
   */
  ctx.filter =
    'contrast(1.08) brightness(1.02)';

  ctx.drawImage(
    canvas,
    0,
    0
  );

  ctx.filter =
    'none';

  return output;
}

/*
|--------------------------------------------------------------------------
| Rotate canvas
|--------------------------------------------------------------------------
*/

function rotateCanvas(
  canvas,
  degrees
) {
  if (
    degrees !== 90 &&
    degrees !== 180 &&
    degrees !== 270
  ) {
    return canvas;
  }

  const rotated =
    document.createElement(
      'canvas'
    );

  const swap =
    degrees === 90 ||
    degrees === 270;

  rotated.width =
    swap
      ? canvas.height
      : canvas.width;

  rotated.height =
    swap
      ? canvas.width
      : canvas.height;

  const ctx =
    rotated.getContext(
      '2d'
    );

  if (!ctx) {
    return canvas;
  }

  ctx.translate(
    rotated.width / 2,
    rotated.height / 2
  );

  ctx.rotate(
    (degrees * Math.PI) /
      180
  );

  ctx.drawImage(
    canvas,
    -canvas.width / 2,
    -canvas.height / 2
  );

  return rotated;
}

/*
|--------------------------------------------------------------------------
| Generate OCR variants
|--------------------------------------------------------------------------
|
| We deliberately create several views of the same photograph:
|
| 1. Original enhanced
| 2. High contrast
| 3. Sharpened
| 4. Threshold 145
| 5. Threshold 175
| 6. Rotated 90°
|
| PaddleOCR will receive them together.
|--------------------------------------------------------------------------
*/

function buildOCRVariants(
  image
) {
  const base =
    createBaseCanvas(
      image,
      2.4
    );

  const contrast =
    enhanceContrast(
      base,
      1.35,
      1.02
    );

  const strongContrast =
    enhanceContrast(
      base,
      1.55,
      1.03
    );

  const sharpened =
    sharpenCanvas(
      contrast
    );

  const threshold145 =
    thresholdCanvas(
      strongContrast,
      145
    );

  const threshold175 =
    thresholdCanvas(
      strongContrast,
      175
    );

  const rotated90 =
    rotateCanvas(
      sharpened,
      90
    );

  return [
    base,
    contrast,
    sharpened,
    threshold145,
    threshold175,
    rotated90,
  ];
}

/*
|--------------------------------------------------------------------------
| OCR text cleanup
|--------------------------------------------------------------------------
*/

function normalizeLine(
  value
) {
  return String(value || '')
    .replace(/[|]/g, 'I')
    .replace(
      /[\u2018\u2019]/g,
      "'"
    )
    .replace(
      /[\u201C\u201D]/g,
      '"'
    )
    .replace(
      /[\u2010-\u2015]/g,
      '-'
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

/*
|--------------------------------------------------------------------------
| Domain-specific OCR corrections
|--------------------------------------------------------------------------
|
| This is intentionally much smaller than the old regex-heavy approach.
|
| PaddleOCR should do the recognition.
|
| These corrections are only for extremely common ingredient-label OCR
| confusions.
|--------------------------------------------------------------------------
*/

const OCR_CORRECTIONS = [
  [
    /\bshamp[o0]+o\s+b[a4]se\b/gi,
    'shampoo base',
  ],

  [
    /\bshampoo\s+basc\b/gi,
    'shampoo base',
  ],

  [
    /\bshamp00\s+base\b/gi,
    'shampoo base',
  ],

  [
    /\bq\s*[\.,]?\s*s\s*[\.,]?\b/gi,
    'Q.S.',
  ],

  [
    /\bq5\b/gi,
    'Q.S.',
  ],

  [
    /methyl\s*chloro\s*isothiazol\s*inone/gi,
    'methylchloroisothiazolinone',
  ],

  [
    /methyl\s*isothiazol\s*inone/gi,
    'methylisothiazolinone',
  ],

  [
    /dmdm\s*hydan\s*toin/gi,
    'DMDM hydantoin',
  ],

  [
    /phenoxyethan[o0]l/gi,
    'phenoxyethanol',
  ],

  [
    /sodium\s+lauryl\s+sulphate/gi,
    'sodium lauryl sulfate',
  ],

  [
    /sodium\s+laureth\s+sulphate/gi,
    'sodium laureth sulfate',
  ],
];

function applyOCRCorrections(
  text
) {
  let result =
    String(text || '');

  for (
    const [pattern, replacement]
    of OCR_CORRECTIONS
  ) {
    /*
     * Guard against malformed correction entries.
     */
    if (
      pattern instanceof RegExp
    ) {
      result =
        result.replace(
          pattern,
          replacement
        );
    }
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| Extract PaddleOCR items
|--------------------------------------------------------------------------
*/

function extractItems(
  paddleResult
) {
  const items =
    Array.isArray(
      paddleResult?.items
    )
      ? paddleResult.items
      : [];

  return items
    .map(
      (item) => ({
        text: normalizeLine(
          item?.text
        ),
        score:
          Number(
            item?.score || 0
          ),
        poly:
          item?.poly || null,
      })
    )
    .filter(
      (item) =>
        item.text.length >= 2
    );
}

/*
|--------------------------------------------------------------------------
| Ingredient relevance
|--------------------------------------------------------------------------
*/

const INGREDIENT_STRUCTURE = /\b(ingredients?|composition|excipients?|contains|active\s+ingredients?|inactive\s+ingredients?|preservatives?)\b/i;

const INGREDIENT_WORDS = /\b(aqua|water|glycerin|glycerol|sodium|potassium|chloride|sulfate|sulphate|benzoate|sorbate|acid|oil|extract|fragrance|perfume|color|colour|preservative|paraben|phenoxyethanol|methylisothiazolinone|methylchloroisothiazolinone|dimethicone|stearate|palmitate|hydroxide|carbonate)\b/gi;

/*
|--------------------------------------------------------------------------
| Candidate result score
|--------------------------------------------------------------------------
|
| Internal only.
|
| Never expose this number to the user.
|--------------------------------------------------------------------------
*/

function scoreText(
  text,
  confidence
) {
  let score =
    Number(confidence || 0);

  if (
    INGREDIENT_STRUCTURE.test(
      text
    )
  ) {
    score += 45;
  }

  const ingredientMatches =
    text.match(
      INGREDIENT_WORDS
    ) || [];

  score += Math.min(
    35,
    ingredientMatches.length *
      3
  );

  score += Math.min(
    20,
    (
      text.match(
        /[A-Za-z]{3,}/g
      ) || []
    ).length
  );

  return score;
}

/*
|--------------------------------------------------------------------------
| Fuse results from all variants
|--------------------------------------------------------------------------
*/

function fusePaddleResults(
  paddleResults
) {
  const allItems = [];

  for (
    const result
    of paddleResults
  ) {
    const items =
      extractItems(result);

    for (
      const item
      of items
    ) {
      allItems.push(item);
    }
  }

  if (!allItems.length) {
    return {
      text: '',
      internalQuality: 0,
    };
  }

  /*
   * Rank lines by:
   *
   * - PaddleOCR recognition confidence
   * - ingredient relevance
   * - structural relevance
   */
  const ranked =
    [...allItems].sort(
      (a, b) =>
        scoreText(
          b.text,
          b.score
        ) -
        scoreText(
          a.text,
          a.score
        )
    );

  /*
   * Deduplicate near-identical OCR lines.
   */
  const selected = [];
  const seen = new Set();

  for (
    const item
    of ranked
  ) {
    const normalized =
      item.text
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          ' '
        )
        .trim();

    if (
      !normalized ||
      seen.has(normalized)
    ) {
      continue;
    }

    seen.add(normalized);

    selected.push(item);

    /*
     * Prevent pathological output from many detections.
     */
    if (
      selected.length >= 150
    ) {
      break;
    }
  }

  /*
   * Reconstruct text in a useful order.
   *
   * PaddleOCR polygons allow us to estimate reading order.
   */
  selected.sort(
    (a, b) => {
      const ay =
        Array.isArray(a.poly) &&
        a.poly.length
          ? Math.min(
              ...a.poly.map(
                (point) =>
                  Number(
                    point?.[1] || 0
                  )
              )
            )
          : 0;

      const by =
        Array.isArray(b.poly) &&
        b.poly.length
          ? Math.min(
              ...b.poly.map(
                (point) =>
                  Number(
                    point?.[1] || 0
                  )
              )
            )
          : 0;

      if (
        Math.abs(ay - by) <
        20
      ) {
        return 0;
      }

      return ay - by;
    }
  );

  const lines =
    selected.map(
      (item) =>
        item.text
    );

  let text =
    lines.join('\n');

  /*
   * Apply final domain corrections.
   */
  text =
    applyOCRCorrections(
      text
    );

  /*
   * Internal quality.
   */
  const bestConfidence =
    Math.max(
      ...allItems.map(
        (item) =>
          item.score
      )
    );

  const hasStructure =
    INGREDIENT_STRUCTURE.test(
      text
    );

  const wordCount =
    (
      text.match(
        /[A-Za-z]{2,}/g
      ) || []
    ).length;

  const quality =
    Math.round(
      Math.min(
        100,
        bestConfidence * 100 +
          (hasStructure
            ? 15
            : 0) +
          Math.min(
            wordCount,
            20
          )
      )
    );

  return {
    text:
      text.trim(),

    internalQuality:
      quality,
  };
}

/*
|--------------------------------------------------------------------------
| Main OCR API
|--------------------------------------------------------------------------
*/

export async function runIngredientOCR(
  file,
  {
    onProgress,
  } = {}
) {
  if (!file) {
    throw new Error(
      'No image selected.'
    );
  }

  if (
    !file.type?.startsWith(
      'image/'
    )
  ) {
    throw new Error(
      'Please select an image file.'
    );
  }

  /*
   * Generic progress only.
   *
   * Do NOT expose OCR engine details or confidence values.
   */
  if (
    typeof onProgress ===
    'function'
  ) {
    onProgress({
      stage: 'preparing',
    });
  }

  const image =
    await loadImage(file);

  const variants =
    buildOCRVariants(
      image
    );

  if (
    typeof onProgress ===
    'function'
  ) {
    onProgress({
      stage: 'reading',
    });
  }

  /*
   * Get the singleton PaddleOCR instance.
   */
  const ocr =
    await getPaddleOCR();

  /*
   * One prediction call over multiple image variants.
   *
   * This is considerably cleaner than creating a Tesseract worker
   * for every OCR pass.
   */
  const results =
    await ocr.predict(
      variants,
      {
        /*
         * Large enough to capture small ingredient text.
         */
        textDetLimitSideLen:
          2048,

        /*
         * Detection threshold.
         */
        textDetThresh:
          0.20,

        /*
         * Text box threshold.
         */
        textDetBoxThresh:
          0.35,

        /*
         * Recognition threshold.
         *
         * We keep this reasonably permissive because the fusion layer
         * performs the final selection.
         */
        textRecScoreThresh:
          0.25,
      }
    );

  if (
    typeof onProgress ===
    'function'
  ) {
    onProgress({
      stage: 'finalizing',
    });
  }

  const fused =
    fusePaddleResults(
      results
    );

  if (
    !fused.text ||
    fused.text.length < 8
  ) {
    throw new Error(
      'We could not read enough of the label. Please take a closer, sharper photo of the ingredient panel.'
    );
  }

  /*
   * PUBLIC RESULT
   *
   * Only text and an internal quality signal are returned.
   *
   * No:
   * - OCR engine information
   * - OCR pass count
   * - PSM
   * - raw confidence
   * - Paddle metrics
   */
  return {
    text: fused.text,
    internalQuality:
      fused.internalQuality,
  };
}