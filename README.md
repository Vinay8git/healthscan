# HealthScan

## An App to test the ingredients of any product using Barcode, Barcode Number, Ingredients List and Ingredients Picture
## Ingredients are scanned and filtered based on EU health guidelines
# HealthScan

A privacy-first React + Tailwind prototype for scanning a product barcode or ingredient-label photo and producing an explainable ingredient-screening verdict.

## Features
- Barcode lookup against Open Food Facts, Open Beauty Facts and Open Products Facts.
- Camera barcode scanning with `html5-qrcode`.
- Ingredient-photo OCR with Tesseract.js in the browser.
- Manual ingredient paste mode.
- Explainable 0–100 heuristic score with `GOOD TO GO`, `CAUTION`, and `AVOID` verdicts.
- Ingredient flags for sugars, palm oil, maida/refined flour, sweeteners, polyols, colours, flavours, preservatives, emulsifiers/stabilizers, SLS/SLES, fragrance, formaldehyde-related ingredients, parabens, phthalates, hydrogenated fats, MSG and a carcinogenicity/regulatory watchlist.
- No login, user database, or application server required for the MVP.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Architecture

`Barcode/Photo -> Product/OCR text -> Ingredient rules -> Explainable score -> Verdict`

The browser calls the public product databases directly for barcode reads. OCR is performed locally with Tesseract.js, so ingredient photos do not need to be uploaded to an application backend.

## Important product-design decision

Do not present the score as a medical toxicity score. The rules deliberately distinguish between a high-priority watchlist item and a normal formulation flag. Regulatory status is jurisdiction- and use-specific. Medicines should have a separate clinical/regulatory workflow before being labelled safe or unsafe.

## Research basis

The UI methodology was influenced by the public-facing patterns of Trustified (independent testing/transparency), Food Pharmer (ingredient/processing/additive analysis), and Fit Tuber (consumer-facing product/ingredient flags), while keeping the rule engine independent rather than copying their proprietary rankings.

For barcode data, the project uses Open Facts public APIs. See the official API documentation for product-by-barcode retrieval and barcode normalization.
