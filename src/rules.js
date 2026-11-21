/*
 * HealthScan — Ingredient Intelligence Engine
 *
 * IMPORTANT:
 * This is an ingredient-screening heuristic, not a medical diagnosis
 * or universal safety certification.
 *
 * Score:
 *   85–100 = GOOD TO GO
 *   80–84  = AVERAGE
 *   0–79   = AVOID
 *
 * Critical carcinogenicity / critical toxic-metal findings:
 *   score = 0
 *   verdict = AVOID
 *   carcinogenDetected = true
 *
 * The engine intentionally distinguishes:
 * - carcinogenicity
 * - sensitisation/allergy
 * - endocrine/reproductive concern
 * - toxic metals
 * - regulatory concern
 * - preservatives
 * - additives
 * - nutritional concerns
 * - ingredient transparency
 *
 * It does NOT treat every additive, E-number, preservative,
 * synthetic ingredient or chemical name as inherently toxic.
 */

export const SCORE_THRESHOLDS = {
  GOOD_TO_GO: 85,
  AVERAGE: 80,
};

export const SEVERITY_POINTS = {
  critical: 100,
  very_high: 25,
  high: 15,
  moderate: 7,
  low: 2,
};

const source = (name, url) => ({ name, url });

export const RULE_SOURCES = {
  IARC: source(
    'IARC Monographs',
    'https://monographs.iarc.who.int/list-of-classifications/'
  ),

  FDA_ALLERGENS: source(
    'FDA — Allergens in Cosmetics',
    'https://www.fda.gov/cosmetics/cosmetic-ingredients/allergens-cosmetics'
  ),

  FDA_FRAGRANCE: source(
    'FDA — Fragrances in Cosmetics',
    'https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics'
  ),

  FDA_LABELING: source(
    'FDA — Cosmetic Labeling',
    'https://www.fda.gov/cosmetics/cosmetics-labeling-regulations/cosmetics-labeling-guide'
  ),

  EFSA_E171: source(
    'EFSA — Titanium dioxide E171',
    'https://www.efsa.europa.eu/en/news/titanium-dioxide-e171-no-longer-considered-safe-when-used-food-additive'
  ),

  EFSA_ADDITIVES: source(
    'EFSA — Food additives',
    'https://www.efsa.europa.eu/en/topics/topic/food-additives'
  ),

  EFSA_ASPARTAME: source(
    'EFSA — Aspartame',
    'https://www.efsa.europa.eu/en/topics/topic/aspartame'
  ),

  EU_COSMETICS: source(
    'EU Cosmetic Products Regulation',
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223'
  ),

  ECHA: source(
    'ECHA',
    'https://echa.europa.eu/'
  ),

  WHO: source(
    'World Health Organization',
    'https://www.who.int/'
  ),
};

function rule({
  key,
  label,
  category,
  severity = 'low',
  points,
  patterns = [],
  note,
  why,
  evidence = 'Review required',
  source: ruleSource,
  carcinogenicity = null,
  hardStop = false,
}) {
  return {
    key,
    label,
    category,
    severity,
    points: points ?? SEVERITY_POINTS[severity],
    patterns,
    note,
    why: why || note,
    evidence,
    source: ruleSource,
    carcinogenicity,
    hardStop,
  };
}

/* -------------------------------------------------------------------------- */
/* CARCINOGENICITY — HARD STOP                                                */
/* -------------------------------------------------------------------------- */

export const CARCINOGEN_RULES = [
  rule({
    key: 'benzene',
    label: 'Benzene',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [/\bbenzene\b/i],
    note: 'Carcinogenicity concern. IARC classifies benzene as carcinogenic to humans.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'formaldehyde',
    label: 'Formaldehyde / Formalin',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [/\bformaldehyde\b/i, /\bformalin\b/i],
    note: 'Formaldehyde is classified as carcinogenic to humans.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'ethylene_oxide',
    label: 'Ethylene oxide',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\bethylene\s+oxide\b/i,
      /\b1,2[-\s]?epoxyethane\b/i,
    ],
    note: 'Serious carcinogenicity concern.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'vinyl_chloride',
    label: 'Vinyl chloride',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\bvinyl\s+chloride\b/i,
      /\bchloroethene\b/i,
    ],
    note: 'Recognised human carcinogenic hazard.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'benzidine',
    label: 'Benzidine',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [/\bbenzidine\b/i],
    note: 'Recognised human carcinogenic hazard.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: '2_naphthylamine',
    label: '2-Naphthylamine',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\b2[-\s]?naphthylamine\b/i,
      /\bbeta[-\s]?naphthylamine\b/i,
    ],
    note: 'Recognised human carcinogenic hazard.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: '4_aminobiphenyl',
    label: '4-Aminobiphenyl',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\b4[-\s]?aminobiphenyl\b/i,
      /\bp[-\s]?aminobiphenyl\b/i,
    ],
    note: 'Recognised human carcinogenic hazard.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — carcinogenic to humans',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'aflatoxin',
    label: 'Aflatoxins',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [/\baflatoxin\b/i, /\baflatoxins\b/i],
    note: 'Aflatoxins are established carcinogenic hazards, particularly for the liver.',
    evidence: 'IARC Group 1',
    carcinogenicity: 'IARC Group 1 — aflatoxins',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'arsenic',
    label: 'Arsenic / inorganic arsenic compounds',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\binorganic\s+arsenic\b/i,
      /\barsenic\b/i,
      /\barsenite\b/i,
      /\barsenate\b/i,
    ],
    note: 'Serious toxic-metal and carcinogenicity concern.',
    evidence: 'IARC carcinogenicity / toxic-metal hazard',
    carcinogenicity: 'IARC Group 1 for arsenic and inorganic arsenic compounds',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'cadmium',
    label: 'Cadmium / cadmium compounds',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\bcadmium\b/i,
      /\bcadmium\s+sulfide\b/i,
      /\bcadmium\s+oxide\b/i,
    ],
    note: 'Serious toxic-metal and carcinogenicity concern.',
    evidence: 'IARC carcinogenicity / toxic-metal hazard',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'chromium_vi',
    label: 'Hexavalent chromium / Chromium(VI)',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\bchromium\s*\(\s*vi\s*\)/i,
      /\bchromium\s+vi\b/i,
      /\bhexavalent\s+chromium\b/i,
      /\bchromate\b/i,
      /\bdichromate\b/i,
    ],
    note: 'Chromium(VI) compounds are a recognised carcinogenic hazard.',
    evidence: 'IARC carcinogenicity classification',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'nickel_compounds',
    label: 'Nickel compounds',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [
      /\bnickel\s+compound/i,
      /\bnickel\s+oxide\b/i,
      /\bnickel\s+sulfide\b/i,
    ],
    note: 'Certain nickel compounds are recognised carcinogenic hazards.',
    evidence: 'IARC carcinogenicity classification',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'wood_dust',
    label: 'Wood dust',
    category: 'CARCINOGEN',
    severity: 'critical',
    patterns: [/\bwood\s+dust\b/i],
    note: 'Certain occupational wood-dust exposures are carcinogenic.',
    evidence: 'IARC carcinogenicity classification',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'acrylamide',
    label: 'Acrylamide',
    category: 'CARCINOGENICITY_CONCERN',
    severity: 'very_high',
    points: 25,
    patterns: [/\bacrylamide\b/i],
    note: 'Acrylamide is classified by IARC as probably carcinogenic to humans.',
    evidence: 'IARC Group 2A',
    carcinogenicity: 'IARC Group 2A — probably carcinogenic to humans',
    source: RULE_SOURCES.IARC,
  }),

  rule({
    key: 'styrene',
    label: 'Styrene',
    category: 'CARCINOGENICITY_CONCERN',
    severity: 'very_high',
    points: 25,
    patterns: [/\bstyrene\b/i],
    note: 'Styrene is classified by IARC as probably carcinogenic to humans.',
    evidence: 'IARC Group 2A',
    carcinogenicity: 'IARC Group 2A — probably carcinogenic to humans',
    source: RULE_SOURCES.IARC,
  }),
];

/* -------------------------------------------------------------------------- */
/* COSMETIC PRESERVATIVES / SENSITISERS                                      */
/* -------------------------------------------------------------------------- */

export const COSMETIC_RULES = [
  rule({
    key: 'methylisothiazolinone',
    label: 'Methylisothiazolinone (MIT / MI)',
    category: 'SENSITISER',
    severity: 'high',
    points: 18,
    patterns: [
      /\bmethyl\s*isothiazolinone\b/i,
      /\bmethylisothiazolinone\b/i,
      /\bMIT\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Strong contact-sensitisation concern.',
    why: 'MI/MIT is a recognised cosmetic preservative allergen and is restricted in certain cosmetic applications.',
    evidence: 'EU cosmetic restriction / FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'methylchloroisothiazolinone',
    label: 'Methylchloroisothiazolinone (MCI / CMIT)',
    category: 'SENSITISER',
    severity: 'high',
    points: 18,
    patterns: [
      /\bmethyl\s*chloro\s*isothiazolinone\b/i,
      /\bmethylchloroisothiazolinone\b/i,
      /\bCMIT\b(?=\s*[,;/.)]|\s*$)/i,
      /\bMCI\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Strong contact-sensitisation concern.',
    why: 'MCI/CMIT is a recognised cosmetic preservative allergen and is restricted in certain cosmetic applications.',
    evidence: 'EU cosmetic restriction / FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'mci_mit_mixture',
    label: 'MCI/MI preservative mixture',
    category: 'SENSITISER',
    severity: 'high',
    points: 20,
    patterns: [
      /\bmci\s*\/\s*mi\b/i,
      /\bmci\s*\/\s*mit\b/i,
      /\bmethylchloroisothiazolinone\s*\/\s*methylisothiazolinone\b/i,
    ],
    note: 'Preservative mixture associated with strong contact-sensitisation concern.',
    evidence: 'EU cosmetic restriction / FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'dmdm_hydantoin',
    label: 'DMDM Hydantoin',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 15,
    patterns: [
      /\bdmdm\s+hydantoin\b/i,
      /\bdmdmhydantoin\b/i,
    ],
    note: 'Formaldehyde-releasing preservative and sensitisation concern.',
    evidence: 'FDA allergen information / cosmetic preservative literature',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'quaternium_15',
    label: 'Quaternium-15',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 15,
    patterns: [
      /\bquaternium[-\s]?15\b/i,
      /\bquaternium15\b/i,
    ],
    note: 'Formaldehyde-releasing preservative and sensitisation concern.',
    evidence: 'FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'imidazolidinyl_urea',
    label: 'Imidazolidinyl Urea',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 12,
    patterns: [
      /\bimidazolidinyl\s+urea\b/i,
      /\bimidazolidinylurea\b/i,
    ],
    note: 'Formaldehyde-releasing preservative.',
    evidence: 'FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'diazolidinyl_urea',
    label: 'Diazolidinyl Urea',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 12,
    patterns: [
      /\bdiazolidinyl\s+urea\b/i,
      /\bdiazolidinylurea\b/i,
    ],
    note: 'Formaldehyde-releasing preservative.',
    evidence: 'FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'bronopol',
    label: 'Bronopol',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 12,
    patterns: [
      /\bbronopol\b/i,
      /\b2[-\s]?bromo[-\s]?2[-\s]?nitropropane[-\s]?1[,.-]?\s*3[-\s]?diol\b/i,
    ],
    note: 'Preservative that can release formaldehyde under certain conditions.',
    evidence: 'FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'sodium_hydroxymethylglycinate',
    label: 'Sodium Hydroxymethylglycinate',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 12,
    patterns: [
      /\bsodium\s+hydroxymethylglycinate\b/i,
      /\bsodium\s+hydroxymethyl\s+glycinate\b/i,
    ],
    note: 'Formaldehyde-releasing preservative.',
    evidence: 'FDA allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'parabens',
    label: 'Parabens',
    category: 'PRESERVATIVE',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bmethylparaben\b/i,
      /\bethylparaben\b/i,
      /\bpropylparaben\b/i,
      /\bbutylparaben\b/i,
      /\bisobutylparaben\b/i,
      /\bisopropylparaben\b/i,
      /\bparabens?\b/i,
    ],
    note: 'Preservative family requiring ingredient/context review.',
    evidence: 'Cosmetic regulatory and safety literature',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'phenoxyethanol',
    label: 'Phenoxyethanol',
    category: 'PRESERVATIVE',
    severity: 'low',
    points: 2,
    patterns: [/\bphenoxyethanol\b/i],
    note: 'Common cosmetic preservative. Flagged for transparency/review, not automatically classified as toxic.',
    evidence: 'Cosmetic preservative safety/regulation',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'benzyl_alcohol',
    label: 'Benzyl Alcohol',
    category: 'PRESERVATIVE',
    severity: 'low',
    points: 2,
    patterns: [/\bbenzyl\s+alcohol\b/i],
    note: 'Preservative/fragrance ingredient that may be relevant to sensitised users.',
    evidence: 'Cosmetic ingredient regulation',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'triclosan',
    label: 'Triclosan',
    category: 'REGULATORY_CONCERN',
    severity: 'high',
    points: 15,
    patterns: [/\btriclosan\b/i],
    note: 'Regulatory and environmental concern; product-category and jurisdiction matter.',
    evidence: 'Regulatory review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'triclocarban',
    label: 'Triclocarban',
    category: 'REGULATORY_CONCERN',
    severity: 'high',
    points: 15,
    patterns: [/\btriclocarban\b/i],
    note: 'Regulatory and environmental concern.',
    evidence: 'Regulatory review',
    source: RULE_SOURCES.ECHA,
  }),
];

/* -------------------------------------------------------------------------- */
/* ENDOCRINE / REPRODUCTIVE / PHTHALATES                                      */
/* -------------------------------------------------------------------------- */

export const ENDOCRINE_RULES = [
  rule({
    key: 'diethyl_phthalate',
    label: 'Diethyl Phthalate (DEP)',
    category: 'PHTHALATE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bdiethyl\s+phthalate\b/i,
      /\bDEP\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Phthalate requiring endocrine/reproductive and regulatory review.',
    evidence: 'Phthalate regulatory literature',
    source: RULE_SOURCES.ECHA,
  }),

  rule({
    key: 'dibutyl_phthalate',
    label: 'Dibutyl Phthalate (DBP)',
    category: 'PHTHALATE',
    severity: 'very_high',
    points: 22,
    patterns: [
      /\bdibutyl\s+phthalate\b/i,
      /\bDBP\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Phthalate associated with reproductive/endocrine regulatory concern.',
    evidence: 'EU regulatory classification',
    source: RULE_SOURCES.ECHA,
  }),

  rule({
    key: 'diethylhexyl_phthalate',
    label: 'Diethylhexyl Phthalate (DEHP)',
    category: 'PHTHALATE',
    severity: 'very_high',
    points: 22,
    patterns: [
      /\bdiethylhexyl\s+phthalate\b/i,
      /\bdi[-\s]?2[-\s]?ethylhexyl\s+phthalate\b/i,
      /\bDEHP\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Phthalate with serious reproductive/endocrine regulatory concern.',
    evidence: 'EU regulatory classification',
    source: RULE_SOURCES.ECHA,
  }),

  rule({
    key: 'diisononyl_phthalate',
    label: 'Diisononyl Phthalate (DINP)',
    category: 'PHTHALATE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bdiisononyl\s+phthalate\b/i,
      /\bDINP\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Phthalate requiring regulatory/exposure review.',
    evidence: 'ECHA / regulatory review',
    source: RULE_SOURCES.ECHA,
  }),

  rule({
    key: 'dibutyl_sebacate',
    label: 'Dibutyl Sebacate',
    category: 'FORMULATION_REVIEW',
    severity: 'low',
    points: 2,
    patterns: [/\bdibutyl\s+sebacate\b/i],
    note: 'Not a phthalate; flagged only for formulation review.',
    evidence: 'Ingredient identification',
  }),
];

/* -------------------------------------------------------------------------- */
/* FOOD SWEETENERS                                                            */
/* -------------------------------------------------------------------------- */

export const SWEETENER_RULES = [
  rule({
    key: 'aspartame',
    label: 'Aspartame',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\baspartame\b/i,
      /\be951\b/i,
    ],
    note: 'Artificial/non-sugar sweetener. Regulatory status and acceptable intake matter.',
    evidence: 'EFSA safety assessment',
    source: RULE_SOURCES.EFSA_ASPARTAME,
  }),

  rule({
    key: 'acesulfame_k',
    label: 'Acesulfame-K',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bacesulfame\s*k\b/i,
      /\bacesulfame\s+potassium\b/i,
      /\be950\b/i,
    ],
    note: 'High-intensity sweetener. Flagged as an artificial sweetener, not automatically as a carcinogen.',
    evidence: 'EFSA additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'sucralose',
    label: 'Sucralose',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsucralose\b/i,
      /\be955\b/i,
    ],
    note: 'High-intensity artificial sweetener.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'saccharin',
    label: 'Saccharin',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsaccharin\b/i,
      /\bsodium\s+saccharin\b/i,
      /\be954\b/i,
    ],
    note: 'High-intensity sweetener.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'cyclamate',
    label: 'Cyclamate',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bcyclamate\b/i,
      /\bsodium\s+cyclamate\b/i,
      /\be952\b/i,
    ],
    note: 'Artificial sweetener requiring regulatory/context review.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'neotame',
    label: 'Neotame',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bneotame\b/i,
      /\be961\b/i,
    ],
    note: 'High-intensity sweetener.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'advantame',
    label: 'Advantame',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\badvantame\b/i,
      /\be969\b/i,
    ],
    note: 'High-intensity sweetener.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'polyols',
    label: 'Polyols / Sugar Alcohols',
    category: 'POLYOL',
    severity: 'low',
    points: 2,
    patterns: [
      /\bsorbitol\b/i,
      /\bmannitol\b/i,
      /\bxylitol\b/i,
      /\bmaltitol\b/i,
      /\blactitol\b/i,
      /\berythritol\b/i,
      /\bisomalt\b/i,
      /\bpolyglycitol\b/i,
      /\bpolyol\b/i,
      /\bsugar\s+alcohol/i,
    ],
    note: 'Polyol/sugar alcohol detected. Large amounts may cause gastrointestinal effects in some people.',
    evidence: 'Food additive/nutrition review',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),
];

/* -------------------------------------------------------------------------- */
/* SUGARS / REFINED CARBOHYDRATES                                             */
/* -------------------------------------------------------------------------- */

export const SUGAR_RULES = [
  rule({
    key: 'added_sugar',
    label: 'Added / Refined Sugar',
    category: 'REFINED_SUGAR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\badded\s+sugar\b/i,
      /\brefined\s+sugar\b/i,
      /\bwhite\s+sugar\b/i,
      /\bsugar\b/i,
      /\bsucrose\b/i,
    ],
    note: 'Added/refined sugar detected.',
    evidence: 'Nutritional assessment',
  }),

  rule({
    key: 'glucose_syrup',
    label: 'Glucose Syrup',
    category: 'REFINED_SUGAR',
    severity: 'moderate',
    points: 6,
    patterns: [/\bglucose\s+syrup\b/i],
    note: 'Added concentrated sugar source.',
    evidence: 'Nutritional assessment',
  }),

  rule({
    key: 'hfcs',
    label: 'High-Fructose Corn Syrup',
    category: 'REFINED_SUGAR',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bhigh\s+fructose\s+corn\s+syrup\b/i,
      /\bhfcs\b/i,
    ],
    note: 'Concentrated added-sugar ingredient.',
    evidence: 'Nutritional assessment',
  }),

  rule({
    key: 'maltodextrin',
    label: 'Maltodextrin',
    category: 'REFINED_CARBOHYDRATE',
    severity: 'low',
    points: 2,
    patterns: [/\bmaltodextrin\b/i],
    note: 'Highly processed carbohydrate ingredient.',
    evidence: 'Nutritional/formulation review',
  }),

  rule({
    key: 'maida',
    label: 'Maida / Refined Wheat Flour',
    category: 'REFINED_CARBOHYDRATE',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\bmaida\b/i,
      /\brefined\s+wheat\s+flour\b/i,
      /\brefined\s+flour\b/i,
      /\brefined\s+wheat\b/i,
    ],
    note: 'Refined flour detected. This is a nutritional/processing concern, not a carcinogen.',
    evidence: 'Nutritional assessment',
  }),

  rule({
    key: 'glucose',
    label: 'Glucose / Dextrose',
    category: 'SUGAR',
    severity: 'low',
    points: 2,
    patterns: [
      /\bglucose\b/i,
      /\bdextrose\b/i,
    ],
    note: 'Simple sugar detected.',
    evidence: 'Nutritional assessment',
  }),
];

/* -------------------------------------------------------------------------- */
/* FATS / OILS                                                                */
/* -------------------------------------------------------------------------- */

export const FAT_RULES = [
  rule({
    key: 'partially_hydrogenated_oil',
    label: 'Partially Hydrogenated Oil',
    category: 'TRANS_FAT',
    severity: 'very_high',
    points: 25,
    patterns: [
      /\bpartially\s+hydrogenated\s+(vegetable\s+)?oil\b/i,
      /\bpartially\s+hydrogenated\s+fat\b/i,
      /\bpartially\s+hydrogenated\b/i,
    ],
    note: 'Partially hydrogenated oils can be a source of industrial trans fats.',
    evidence: 'Public-health/nutrition evidence',
  }),

  rule({
    key: 'hydrogenated_oil',
    label: 'Hydrogenated Vegetable Oil',
    category: 'HYDROGENATED_FAT',
    severity: 'high',
    points: 12,
    patterns: [
      /\bhydrogenated\s+vegetable\s+oil\b/i,
      /\bhydrogenated\s+oil\b/i,
      /\bhydrogenated\s+fat\b/i,
    ],
    note: 'Hydrogenated fat detected. Product formulation and trans-fat content should be checked.',
    evidence: 'Nutrition/formulation review',
  }),

  rule({
    key: 'vanaspati',
    label: 'Vanaspati',
    category: 'HYDROGENATED_FAT',
    severity: 'high',
    points: 12,
    patterns: [/\bvanaspati\b/i],
    note: 'Hydrogenated/solid vegetable fat commonly used in processed foods.',
    evidence: 'Nutrition/formulation review',
  }),

  rule({
    key: 'shortening',
    label: 'Vegetable Shortening',
    category: 'HYDROGENATED_FAT',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bvegetable\s+shortening\b/i,
      /\bshortening\b/i,
    ],
    note: 'Concentrated processed fat ingredient.',
    evidence: 'Nutrition/formulation review',
  }),

  rule({
    key: 'palm_oil',
    label: 'Palm Oil / Palm Fat',
    category: 'FAT_OIL',
    severity: 'low',
    points: 2,
    patterns: [
      /\bpalm\s+oil\b/i,
      /\bpalm\s+fat\b/i,
      /\bpalm\s+kernel\s+oil\b/i,
      /\bpalmolein\b/i,
    ],
    note: 'Palm-derived fat detected. Flagged as a formulation/nutrition concern, not a carcinogen.',
    evidence: 'Nutrition/formulation review',
  }),

  rule({
    key: 'interesterified_fat',
    label: 'Interesterified Fat',
    category: 'PROCESSED_FAT',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\binteresterified\s+fat\b/i,
      /\binteresterified\s+oil\b/i,
      /\binteresterified\b/i,
    ],
    note: 'Processed fat detected; nutritional context matters.',
    evidence: 'Nutrition/formulation review',
  }),
];

/* -------------------------------------------------------------------------- */
/* FOOD COLOURS                                                               */
/* -------------------------------------------------------------------------- */

export const COLOUR_RULES = [
  rule({
    key: 'tartrazine',
    label: 'Tartrazine / Yellow 5',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\btartrazine\b/i,
      /\byellow\s*5\b/i,
      /\be102\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'sunset_yellow',
    label: 'Sunset Yellow / Yellow 6',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsunset\s+yellow\b/i,
      /\byellow\s*6\b/i,
      /\be110\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'allura_red',
    label: 'Allura Red / Red 40',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\ballura\s+red\b/i,
      /\bred\s*40\b/i,
      /\be129\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'carmoisine',
    label: 'Carmoisine / Azorubine',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bcarmoisine\b/i,
      /\bazorubine\b/i,
      /\be122\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'ponceau',
    label: 'Ponceau 4R',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bponceau\s*4r\b/i,
      /\be124\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'erythrosine',
    label: 'Erythrosine / Red 3',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\berythrosine\b/i,
      /\bred\s*3\b/i,
      /\be127\b/i,
    ],
    note: 'Synthetic colour requiring regulatory/context review.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'brilliant_blue',
    label: 'Brilliant Blue / Blue 1',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'low',
    points: 2,
    patterns: [
      /\bbrilliant\s+blue\b/i,
      /\bblue\s*1\b/i,
      /\be133\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'indigo_carmine',
    label: 'Indigo Carmine / Blue 2',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'low',
    points: 2,
    patterns: [
      /\bindigo\s+carmine\b/i,
      /\bblue\s*2\b/i,
      /\be132\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'quinoline_yellow',
    label: 'Quinoline Yellow',
    category: 'ARTIFICIAL_COLOUR',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bquinoline\s+yellow\b/i,
      /\be104\b/i,
    ],
    note: 'Synthetic food colour.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'titanium_dioxide',
    label: 'Titanium Dioxide / E171',
    category: 'REGULATORY_CONCERN',
    severity: 'very_high',
    points: 25,
    patterns: [
      /\btitanium\s+dioxide\b/i,
      /\be171\b/i,
    ],
    note: 'High regulatory/genotoxicity concern when used as a food additive. Context matters because uses outside food are assessed separately.',
    evidence: 'EFSA food-additive safety assessment',
    source: RULE_SOURCES.EFSA_E171,
  }),
];

/* -------------------------------------------------------------------------- */
/* FOOD PRESERVATIVES / ADDITIVES                                            */
/* -------------------------------------------------------------------------- */

export const FOOD_ADDITIVE_RULES = [
  rule({
    key: 'sodium_nitrite',
    label: 'Sodium Nitrite / Nitrite',
    category: 'FOOD_PRESERVATIVE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bsodium\s+nitrite\b/i,
      /\bpotassium\s+nitrite\b/i,
      /\bnitrite\b/i,
      /\be250\b/i,
      /\be249\b/i,
    ],
    note: 'Nitrite preservative detected. Exposure, food type and quantity matter.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'nitrate',
    label: 'Nitrate / Sodium Nitrate',
    category: 'FOOD_PRESERVATIVE',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsodium\s+nitrate\b/i,
      /\bpotassium\s+nitrate\b/i,
      /\bnitrate\b/i,
      /\be251\b/i,
      /\be252\b/i,
    ],
    note: 'Nitrate preservative detected.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'sodium_benzoate',
    label: 'Sodium Benzoate / Benzoic Acid',
    category: 'FOOD_PRESERVATIVE',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\bsodium\s+benzoate\b/i,
      /\bbenzoic\s+acid\b/i,
      /\bbenzoate\b/i,
      /\be211\b/i,
      /\be210\b/i,
    ],
    note: 'Benzoate preservative detected.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'potassium_sorbate',
    label: 'Potassium Sorbate / Sorbic Acid',
    category: 'FOOD_PRESERVATIVE',
    severity: 'low',
    points: 2,
    patterns: [
      /\bpotassium\s+sorbate\b/i,
      /\bsorbic\s+acid\b/i,
      /\bsorbate\b/i,
      /\be202\b/i,
      /\be200\b/i,
    ],
    note: 'Sorbate preservative detected.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'sulphites',
    label: 'Sulphites / Sulfites',
    category: 'ALLERGEN',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsulphite\b/i,
      /\bsulfite\b/i,
      /\bsodium\s+metabisulphite\b/i,
      /\bsodium\s+metabisulfite\b/i,
      /\bsodium\s+sulphite\b/i,
      /\bsodium\s+sulfite\b/i,
      /\bpotassium\s+metabisulphite\b/i,
      /\be220\b/i,
      /\be221\b/i,
      /\be222\b/i,
      /\be223\b/i,
      /\be224\b/i,
      /\be226\b/i,
      /\be227\b/i,
      /\be228\b/i,
    ],
    note: 'Sulphite/sulfite preservative detected. Relevant to sensitive/allergic individuals.',
    evidence: 'Food-additive/allergen review',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'msg',
    label: 'MSG / Monosodium Glutamate',
    category: 'FLAVOUR_ENHANCER',
    severity: 'low',
    points: 2,
    patterns: [
      /\bmonosodium\s+glutamate\b/i,
      /\bmsg\b(?=\s*[,;/.)]|\s*$)/i,
      /\be621\b/i,
    ],
    note: 'Flavour enhancer. Flagged for transparency rather than classified as carcinogenic.',
    evidence: 'Food-additive safety assessment',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'disodium_guanylate',
    label: 'Disodium Guanylate',
    category: 'FLAVOUR_ENHANCER',
    severity: 'low',
    points: 2,
    patterns: [
      /\bdisodium\s+guanylate\b/i,
      /\be627\b/i,
    ],
    note: 'Flavour enhancer.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'disodium_inosinate',
    label: 'Disodium Inosinate',
    category: 'FLAVOUR_ENHANCER',
    severity: 'low',
    points: 2,
    patterns: [
      /\bdisodium\s+inosinate\b/i,
      /\be631\b/i,
    ],
    note: 'Flavour enhancer.',
    evidence: 'Food-additive regulation',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),
];

/* -------------------------------------------------------------------------- */
/* SURFACTANTS / COSMETIC FORMULATION                                         */
/* -------------------------------------------------------------------------- */

export const COSMETIC_FORMULATION_RULES = [
  rule({
    key: 'sls',
    label: 'Sodium Lauryl Sulfate (SLS)',
    category: 'SURFACTANT',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsodium\s+lauryl\s+sulfate\b/i,
      /\bsodium\s+lauryl\s+sulphate\b/i,
      /\bsls\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Strong cleansing surfactant that can be irritating/drying for some users.',
    evidence: 'Cosmetic ingredient review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'sles',
    label: 'Sodium Laureth Sulfate (SLES)',
    category: 'SURFACTANT',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bsodium\s+laureth\s+sulfate\b/i,
      /\bsodium\s+laureth\s+sulphate\b/i,
      /\bsles\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Cleansing surfactant that can be irritating for some users.',
    evidence: 'Cosmetic ingredient review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'ammonium_lauryl_sulfate',
    label: 'Ammonium Lauryl Sulfate',
    category: 'SURFACTANT',
    severity: 'low',
    points: 2,
    patterns: [
      /\bammonium\s+lauryl\s+sulfate\b/i,
      /\bammonium\s+lauryl\s+sulphate\b/i,
    ],
    note: 'Cleansing surfactant; irritation potential depends on formulation.',
    evidence: 'Cosmetic ingredient review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'sodium_coco_sulfate',
    label: 'Sodium Coco Sulfate',
    category: 'SURFACTANT',
    severity: 'low',
    points: 2,
    patterns: [
      /\bsodium\s+coco\s+sulfate\b/i,
      /\bsodium\s+coco\s+sulphate\b/i,
    ],
    note: 'Surfactant; irritation depends on formulation and exposure.',
    evidence: 'Cosmetic ingredient review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'cocamidopropyl_betaine',
    label: 'Cocamidopropyl Betaine',
    category: 'SURFACTANT',
    severity: 'low',
    points: 2,
    patterns: [/\bcocamidopropyl\s+betaine\b/i],
    note: 'Common surfactant that can cause contact reactions in some sensitised individuals.',
    evidence: 'Cosmetic ingredient review',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'formaldehyde_releasers_group',
    label: 'Formaldehyde-Releasing Preservative',
    category: 'FORMALDEHYDE_RELEASER',
    severity: 'high',
    points: 12,
    patterns: [
      /\bformaldehyde[-\s]?releas(?:ing|er)\b/i,
    ],
    note: 'Label explicitly indicates a formaldehyde-releasing preservative.',
    evidence: 'Cosmetic allergen/preservative review',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'parfum',
    label: 'Fragrance / Parfum',
    category: 'FRAGRANCE_TRANSPARENCY',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bfragrance\b/i,
      /\bparfum\b/i,
      /\bperfume\b/i,
      /\bfragrance\s+oil\b/i,
      /\bperfume\s+oil\b/i,
      /\bsynthetic\s+fragrance\b/i,
      /\bsynthetic\s+perfume\b/i,
    ],
    note: 'Fragrance mixture detected. The label may not identify every constituent fragrance chemical.',
    evidence: 'FDA fragrance labeling information',
    source: RULE_SOURCES.FDA_FRAGRANCE,
  }),

  rule({
    key: 'artificial_flavour',
    label: 'Artificial Flavour / Flavor',
    category: 'FLAVOUR',
    severity: 'low',
    points: 2,
    patterns: [
      /\bartificial\s+flavou?r\b/i,
      /\bartificial\s+flavo[u]?r\b/i,
    ],
    note: 'Artificial flavouring declared.',
    evidence: 'Food-label review',
    source: RULE_SOURCES.FDA_LABELING,
  }),

  rule({
    key: 'mineral_oil',
    label: 'Mineral Oil / Paraffinum Liquidum',
    category: 'COSMETIC_FORMULATION',
    severity: 'low',
    points: 2,
    patterns: [
      /\bmineral\s+oil\b/i,
      /\bparaffinum\s+liquidum\b/i,
      /\bliquid\s+paraffin\b/i,
    ],
    note: 'Petroleum-derived emollient. Refined cosmetic grades are regulated differently from contaminated/unrefined materials.',
    evidence: 'Cosmetic formulation review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'petrolatum',
    label: 'Petrolatum',
    category: 'COSMETIC_FORMULATION',
    severity: 'low',
    points: 2,
    patterns: [
      /\bpetrolatum\b/i,
      /\bpetroleum\s+jelly\b/i,
    ],
    note: 'Petroleum-derived occlusive. Safety depends on refining/purity requirements.',
    evidence: 'Cosmetic regulation',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'silicone',
    label: 'Silicone / Silicone Polymer',
    category: 'COSMETIC_FORMULATION',
    severity: 'low',
    points: 1,
    patterns: [
      /\bdimethicone\b/i,
      /\bamodimethicone\b/i,
      /\bcyclopentasiloxane\b/i,
      /\bcyclohexasiloxane\b/i,
      /\bsiloxane\b/i,
    ],
    note: 'Silicone formulation ingredient. Some cyclic siloxanes have environmental/regulatory concerns depending on substance and use.',
    evidence: 'Cosmetic regulatory review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),
];

/* -------------------------------------------------------------------------- */
/* HAIR DYES / COSMETIC WATCHLIST                                             */
/* -------------------------------------------------------------------------- */

export const PERSONAL_CARE_RULES = [
  rule({
    key: 'p_phenylenediamine',
    label: 'p-Phenylenediamine (PPD)',
    category: 'SENSITISER',
    severity: 'high',
    points: 15,
    patterns: [
      /\bp[-\s]?phenylenediamine\b/i,
      /\bparaphenylenediamine\b/i,
      /\bppd\b(?=\s*[,;/.)]|\s*$)/i,
    ],
    note: 'Strong hair-dye contact-sensitisation concern.',
    evidence: 'Cosmetic allergen information',
    source: RULE_SOURCES.FDA_ALLERGENS,
  }),

  rule({
    key: 'resorcinol',
    label: 'Resorcinol',
    category: 'HAIR_DYE',
    severity: 'moderate',
    points: 7,
    patterns: [/\bresorcinol\b/i],
    note: 'Hair-dye ingredient requiring concentration and regulatory-context review.',
    evidence: 'Cosmetic regulation',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'ammonia',
    label: 'Ammonia',
    category: 'IRRITANT',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bammonia\b/i,
      /\bammonium\s+hydroxide\b/i,
    ],
    note: 'Irritant/volatile formulation ingredient.',
    evidence: 'Cosmetic formulation review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'oxybenzone',
    label: 'Oxybenzone / Benzophenone-3',
    category: 'UV_FILTER',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\boxybenzone\b/i,
      /\bbenzophenone[-\s]?3\b/i,
    ],
    note: 'UV filter with regulatory/environmental review considerations.',
    evidence: 'Cosmetic regulatory review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'octinoxate',
    label: 'Octinoxate / Ethylhexyl Methoxycinnamate',
    category: 'UV_FILTER',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\boctinoxate\b/i,
      /\bethylhexyl\s+methoxycinnamate\b/i,
      /\boctyl\s+methoxycinnamate\b/i,
    ],
    note: 'UV filter with regulatory/environmental review considerations.',
    evidence: 'Cosmetic regulatory review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),
];

/* -------------------------------------------------------------------------- */
/* HOUSEHOLD / CLEANING                                                       */
/* -------------------------------------------------------------------------- */

export const HOUSEHOLD_RULES = [
  rule({
    key: 'sodium_hypochlorite',
    label: 'Sodium Hypochlorite / Bleach',
    category: 'HOUSEHOLD_IRRITANT',
    severity: 'high',
    points: 15,
    patterns: [
      /\bsodium\s+hypochlorite\b/i,
      /\bhypochlorite\b/i,
    ],
    note: 'Strong oxidising/irritating cleaning chemical. Never mix with acids or ammonia.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'hydrochloric_acid',
    label: 'Hydrochloric Acid',
    category: 'CORROSIVE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bhydrochloric\s+acid\b/i,
      /\bmuriatic\s+acid\b/i,
    ],
    note: 'Corrosive cleaning chemical.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'sulfuric_acid',
    label: 'Sulfuric Acid',
    category: 'CORROSIVE',
    severity: 'high',
    points: 20,
    patterns: [/\bsulfuric\s+acid\b/i, /\bsulphuric\s+acid\b/i],
    note: 'Highly corrosive chemical.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'hydrofluoric_acid',
    label: 'Hydrofluoric Acid',
    category: 'CRITICAL_CORROSIVE',
    severity: 'critical',
    patterns: [
      /\bhydrofluoric\s+acid\b/i,
      /\bhf\s+acid\b/i,
    ],
    note: 'Extremely hazardous corrosive/toxic chemical.',
    evidence: 'Chemical hazard classification',
    hardStop: true,
  }),

  rule({
    key: 'sodium_hydroxide',
    label: 'Sodium Hydroxide / Caustic Soda',
    category: 'CORROSIVE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bsodium\s+hydroxide\b/i,
      /\bcaustic\s+soda\b/i,
      /\blye\b/i,
    ],
    note: 'Strongly corrosive chemical.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'potassium_hydroxide',
    label: 'Potassium Hydroxide',
    category: 'CORROSIVE',
    severity: 'high',
    points: 15,
    patterns: [
      /\bpotassium\s+hydroxide\b/i,
      /\bcaustic\s+potash\b/i,
    ],
    note: 'Strongly corrosive chemical.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'quaternary_ammonium',
    label: 'Quaternary Ammonium Compound',
    category: 'HOUSEHOLD_CHEMICAL',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bquaternary\s+ammonium\b/i,
      /\bbenzalkonium\s+chloride\b/i,
      /\balkyl\s+dimethyl\s+benzyl\s+ammonium\b/i,
    ],
    note: 'Disinfectant/surfactant chemical. Concentration and intended use matter.',
    evidence: 'Chemical hazard review',
  }),

  rule({
    key: 'chlorine',
    label: 'Chlorine',
    category: 'HOUSEHOLD_CHEMICAL',
    severity: 'high',
    points: 12,
    patterns: [
      /\bchlorine\b/i,
    ],
    note: 'Reactive oxidising chemical; context and concentration matter.',
    evidence: 'Chemical hazard review',
  }),
];

/* -------------------------------------------------------------------------- */
/* CONTAMINANTS / HEAVY METALS                                                */
/* -------------------------------------------------------------------------- */

export const CONTAMINANT_RULES = [
  rule({
    key: 'lead',
    label: 'Lead',
    category: 'TOXIC_METAL',
    severity: 'critical',
    patterns: [
      /\blead\b/i,
      /\blead\s+acetate\b/i,
      /\blead\s+oxide\b/i,
    ],
    note: 'Serious neurotoxic heavy-metal hazard. Certain lead compounds are carcinogenic.',
    evidence: 'Toxic-metal / IARC hazard classification',
    carcinogenicity: 'Certain lead compounds are classified as carcinogenic',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),

  rule({
    key: 'mercury',
    label: 'Mercury',
    category: 'TOXIC_METAL',
    severity: 'critical',
    patterns: [
      /\bmercury\b/i,
      /\bmercuric\b/i,
      /\bmercurous\b/i,
    ],
    note: 'Serious neurotoxic heavy-metal hazard.',
    evidence: 'Toxic-metal hazard',
    source: RULE_SOURCES.WHO,
    hardStop: true,
  }),

  rule({
    key: 'thallium',
    label: 'Thallium',
    category: 'TOXIC_METAL',
    severity: 'critical',
    patterns: [/\bthallium\b/i],
    note: 'Highly toxic heavy metal.',
    evidence: 'Toxic-metal hazard',
    source: RULE_SOURCES.WHO,
    hardStop: true,
  }),

  rule({
    key: 'hexavalent_chromium_compounds',
    label: 'Hexavalent Chromium Compound',
    category: 'TOXIC_METAL',
    severity: 'critical',
    patterns: [
      /\bchromium\s*\(\s*vi\s*\)/i,
      /\bhexavalent\s+chromium\b/i,
      /\bchromate\b/i,
      /\bdichromate\b/i,
    ],
    note: 'Serious toxic-metal and carcinogenicity concern.',
    evidence: 'IARC hazard classification',
    source: RULE_SOURCES.IARC,
    hardStop: true,
  }),
];

/* -------------------------------------------------------------------------- */
/* TRANSPARENCY / HIDDEN INGREDIENTS                                          */
/* -------------------------------------------------------------------------- */

export const TRANSPARENCY_RULES = [
  rule({
  key: 'shampoo_base',
  label: 'Shampoo Base / Undisclosed Base Formulation',
  category: 'INGREDIENT_TRANSPARENCY',
  severity: 'high',
  points: 15,

  patterns: [
    /\bshampoo\s+base\b/i,
    /\bshamp[o0]+o\s+base\b/i,
    /\bshampoo\s+b[a4]se\b/i,
    /\bshampoo\s+basc\b/i,
    /\bshampoo\s+bas[e3]\b/i,
  ],

  note:
    'The label uses a broad "shampoo base" declaration instead of identifying the individual constituents. Some ingredients inside the base cannot be evaluated.',

  why:
    'HealthScan does not assume an unspecified shampoo base is harmless. Undisclosed constituents reduce ingredient transparency and prevent complete screening.',

  evidence:
    'Label transparency',

  source:
    RULE_SOURCES.FDA_LABELING,
}),

  rule({
    key: 'soap_base',
    label: 'Soap Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bsoap\s+base\b/i,
    ],
    note: 'The label uses "soap base" without identifying all constituent ingredients.',
  }),

  rule({
    key: 'cream_base',
    label: 'Cream / Creme Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bcream\s+base\b/i,
      /\bcreme\s+base\b/i,
    ],
    note: 'The label uses a broad cream-base declaration. Constituent ingredients cannot be fully evaluated.',
  }),

  rule({
    key: 'lotion_base',
    label: 'Lotion Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\blotion\s+base\b/i,
    ],
    note: 'The lotion base is not individually disclosed.',
  }),

  rule({
    key: 'conditioner_base',
    label: 'Conditioner Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bconditioner\s+base\b/i,
    ],
    note: 'The conditioner base is not individually disclosed.',
  }),

  rule({
    key: 'detergent_base',
    label: 'Detergent Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bdetergent\s+base\b/i,
    ],
    note: 'The detergent base is not individually disclosed.',
  }),

  rule({
    key: 'proprietary_blend',
    label: 'Proprietary Blend',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bproprietary\s+blend\b/i,
      /\bproprietary\s+ingredients?\b/i,
      /\bproprietary\s+formula\b/i,
    ],
    note: 'A proprietary blend can prevent consumers from determining every constituent ingredient and its quantity.',
  }),

  rule({
    key: 'other_ingredients',
    label: 'Other Ingredients',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\band\s+other\s+ingredients\b/i,
      /\bother\s+ingredients\b/i,
    ],
    note: 'Broad wording can make complete ingredient-level assessment impossible.',
  }),

  rule({
    key: 'qs',
    label: 'Q.S. / Quantity Sufficient',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bq\.?\s*s\.?\b/i,
      /\bquantity\s+sufficient\b/i,
      /\bq\.s\.\s*to\b/i,
    ],
    note: 'Q.S. describes quantity rather than identifying the underlying ingredient composition.',
  }),

  rule({
    key: 'generic_preservatives',
    label: 'Generic Preservatives Declaration',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\bgeneric\s+preservatives?\b/i,
      /\bpreservatives?\s+added\b/i,
      /\bpreservatives?\s*:\s*base\b/i,
    ],
    note: 'The label does not clearly identify each preservative.',
  }),

  rule({
    key: 'generic_colours',
    label: 'Generic Colour / Coloring Declaration',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bcolou?rs?\b/i,
      /\bcolouring\b/i,
      /\bcoloring\b/i,
      /\bcolour\s+added\b/i,
      /\bcolor\s+added\b/i,
    ],
    note: 'A generic colour declaration may not identify the specific colouring substance.',
  }),

  rule({
    key: 'generic_flavours',
    label: 'Generic Flavour / Flavor Declaration',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bnatural\s+flavou?rs?\b/i,
      /\bnatural\s+flavo[u]?rs?\b/i,
      /\bflavou?rs?\b/i,
      /\bflavo[u]?rs?\b/i,
    ],
    note: 'A broad flavour declaration may not identify every constituent flavouring substance.',
    source: RULE_SOURCES.FDA_FRAGRANCE,
  }),

  rule({
    key: 'excipients',
    label: 'Excipients / Inactive Ingredients',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'low',
    points: 2,
    patterns: [
      /\bexcipients?\b/i,
      /\binactive\s+ingredients?\b/i,
    ],
    note: 'This is a category heading rather than a specific ingredient. The actual excipients must be identified to assess them.',
  }),

  rule({
    key: 'base_generic',
    label: 'Generic Base',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 8,
    patterns: [
      /\bbase\b/i,
      /\bformulation\s+base\b/i,
      /\bvehicle\b/i,
    ],
    note: 'A generic "base" or "vehicle" can hide multiple formulation ingredients.',
  }),

  rule({
    key: 'fragrance_generic',
    label: 'Fragrance / Parfum — Constituents Not Fully Disclosed',
    category: 'INGREDIENT_TRANSPARENCY',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bfragrance\b/i,
      /\bparfum\b/i,
      /\bperfume\b/i,
    ],
    note: 'Fragrance may represent a mixture whose individual constituents are not all listed on the consumer label.',
    source: RULE_SOURCES.FDA_FRAGRANCE,
  }),
];

/* -------------------------------------------------------------------------- */
/* GENERAL WATCHLIST                                                          */
/* -------------------------------------------------------------------------- */

export const GENERAL_RULES = [
  rule({
    key: 'bha',
    label: 'BHA',
    category: 'ANTIOXIDANT',
    severity: 'moderate',
    points: 7,
    patterns: [
      /\bbha\b(?=\s*[,;/.)]|\s*$)/i,
      /\bbutylated\s+hydroxyanisole\b/i,
      /\be320\b/i,
    ],
    note: 'Synthetic antioxidant with regulatory and carcinogenicity-context considerations.',
    evidence: 'Food-additive/regulatory review',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'bht',
    label: 'BHT',
    category: 'ANTIOXIDANT',
    severity: 'moderate',
    points: 5,
    patterns: [
      /\bbht\b(?=\s*[,;/.)]|\s*$)/i,
      /\bbutylated\s+hydroxytoluene\b/i,
      /\be321\b/i,
    ],
    note: 'Synthetic antioxidant. Flagged for formulation review.',
    evidence: 'Food-additive/regulatory review',
    source: RULE_SOURCES.EFSA_ADDITIVES,
  }),

  rule({
    key: 'edta',
    label: 'EDTA / Disodium EDTA',
    category: 'CHELATING_AGENT',
    severity: 'low',
    points: 2,
    patterns: [
      /\bedta\b/i,
      /\bdisodium\s+edta\b/i,
      /\btetrasodium\s+edta\b/i,
      /\be385\b/i,
    ],
    note: 'Chelating agent. Flagged for formulation transparency.',
    evidence: 'Ingredient identification',
  }),

  rule({
    key: 'propylene_glycol',
    label: 'Propylene Glycol',
    category: 'FORMULATION',
    severity: 'low',
    points: 1,
    patterns: [
      /\bpropylene\s+glycol\b/i,
    ],
    note: 'Common solvent/humectant. Some users may experience irritation.',
    evidence: 'Ingredient identification',
  }),

  rule({
    key: 'alcohol_denat',
    label: 'Alcohol Denat.',
    category: 'FORMULATION',
    severity: 'low',
    points: 1,
    patterns: [
      /\balcohol\s+denat\b/i,
      /\bdenatured\s+alcohol\b/i,
    ],
    note: 'Volatile alcohol that can be drying/irritating depending on formulation.',
    evidence: 'Cosmetic formulation review',
    source: RULE_SOURCES.EU_COSMETICS,
  }),

  rule({
    key: 'artificial_sweetener_generic',
    label: 'Artificial Sweetener',
    category: 'ARTIFICIAL_SWEETENER',
    severity: 'moderate',
    points: 6,
    patterns: [
      /\bartificial\s+sweetener\b/i,
      /\bintense\s+sweetener\b/i,
    ],
    note: 'Generic artificial/intense sweetener declaration. Specific identity should be disclosed for proper assessment.',
    evidence: 'Food-label review',
  }),
];

/* -------------------------------------------------------------------------- */
/* ALL RULES                                                                  */
/* -------------------------------------------------------------------------- */

export const ALL_RULES = [
  ...CARCINOGEN_RULES,
  ...COSMETIC_RULES,
  ...ENDOCRINE_RULES,
  ...SWEETENER_RULES,
  ...SUGAR_RULES,
  ...FAT_RULES,
  ...COLOUR_RULES,
  ...FOOD_ADDITIVE_RULES,
  ...COSMETIC_FORMULATION_RULES,
  ...PERSONAL_CARE_RULES,
  ...HOUSEHOLD_RULES,
  ...CONTAMINANT_RULES,
  ...TRANSPARENCY_RULES,
  ...GENERAL_RULES,
];

export const RULES = ALL_RULES;

/* -------------------------------------------------------------------------- */
/* OCR NORMALISATION                                                          */
/* -------------------------------------------------------------------------- */

const OCR_FIXES = [
  [/shamp[o0]+o\s+b[a4]se/gi, 'shampoo base'],
  [/shampoo\s+b[a4]se/gi, 'shampoo base'],
  [/shamp00\s+base/gi, 'shampoo base'],
  [/shampoo\s+basc/gi, 'shampoo base'],
  [/shampoo\s+bas[e3]/gi, 'shampoo base'],

  [/q\s*[\.\,]?\s*s\s*[\.\,]?/gi, 'Q.S.'],
  [/\bq\s+s\b/gi, 'Q.S.'],
  [/\bq5\b/gi, 'Q.S.'],
  [/\bquantity\s+sufficien[ct]/gi, 'quantity sufficient'],

  [/shampoo\s*base\s*[:\-]?\s*q\s*\.?\s*s\.?/gi, 'shampoo base: Q.S.'],
  [
    /methyl\s*chloro\s*isothiazol\s*inone/gi,
    'methylchloroisothiazolinone',
  ],
  [
    /methyl\s*isothiazol\s*inone/gi,
    'methylisothiazolinone',
  ],
  [
    /methyl\s*isothiazolinon[e3]/gi,
    'methylisothiazolinone',
  ],
  [
    /dmdm\s*hydan\s*toin/gi,
    'DMDM hydantoin',
  ],
  [
    /imidazolidin\s*yl\s*urea/gi,
    'imidazolidinyl urea',
  ],
  [
    /diazolidin\s*yl\s*urea/gi,
    'diazolidinyl urea',
  ],
  [
    /quaternium\s*[- ]?15/gi,
    'quaternium-15',
  ],
  [
    /sodium\s+lauryl\s+sulphate/gi,
    'sodium lauryl sulfate',
  ],
  [
    /sodium\s+laureth\s+sulphate/gi,
    'sodium laureth sulfate',
  ],
  [
    /phenoxyethan[o0]l/gi,
    'phenoxyethanol',
  ],
  [
    /paraffin\s+liquidum/gi,
    'paraffinum liquidum',
  ],
  [
    /hydrogenated\s+vegetab[l1]e\s+oil/gi,
    'hydrogenated vegetable oil',
  ],
  [
    /methylisothiazolin[o0]ne/gi,
    'methylisothiazolinone',
  ],
];

export function normalizeOCRText(rawText = '') {
  let text = String(rawText)
    .replace(/\r/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[•·]/g, ',')
    .replace(/\u00a0/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  for (const [pattern, replacement] of OCR_FIXES) {
    text = text.replace(pattern, replacement);
  }

  return text
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function canonicalizeForMatch(text) {
  return normalizeOCRText(text)
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/* -------------------------------------------------------------------------- */
/* CANDIDATE INGREDIENT EXTRACTION                                            */
/* -------------------------------------------------------------------------- */

function splitCandidateIngredients(text) {
  const cleaned = canonicalizeForMatch(text)
    .replace(/\bingredients?\s*:\s*/gi, '')
    .replace(/\bcomposition\s*:\s*/gi, '')
    .replace(/\bexcipients?\s*:\s*/gi, '')
    .replace(/\bcontains\s*:\s*/gi, '');

  return cleaned
    .split(/[,;\n]+/)
    .map((x) => x.replace(/^[-–—:*]+/, '').trim())
    .filter(Boolean)
    .filter((x) => x.length >= 2 && x.length <= 180);
}

/* -------------------------------------------------------------------------- */
/* REGEX MATCHING                                                             */
/* -------------------------------------------------------------------------- */

function resetRegex(regex) {
  if (regex.global || regex.sticky) regex.lastIndex = 0;
  return regex;
}

function ruleMatches(ruleItem, text) {
  return ruleItem.patterns.some((pattern) => {
    resetRegex(pattern);
    return pattern.test(text);
  });
}

function uniqueByKey(items) {
  const map = new Map();

  for (const item of items) {
    if (!map.has(item.key)) {
      map.set(item.key, item);
    }
  }

  return [...map.values()];
}

function detectTransparencyFindings(text) {
  const normalized = canonicalizeForMatch(text);

  const matches = [];

  /*
   * Normal rule matching.
   */
  for (const rule of TRANSPARENCY_RULES) {
    const matched = rule.patterns.some((pattern) => {
      /*
       * Reset lastIndex for safety if a regex is ever changed
       * to use the global flag.
       */
      pattern.lastIndex = 0;

      return pattern.test(normalized);
    });

    if (matched) {
      matches.push(rule);
    }
  }

  /*
   * --------------------------------------------------------------------------
   * OCR-TOLERANT BASE / HIDDEN INGREDIENT DETECTION
   * --------------------------------------------------------------------------
   *
   * Ingredient labels frequently get OCR'd incorrectly.
   *
   * Examples:
   *
   * "Shamp00 Base"
   * "Shampoo  Base"
   * "Shampoo Basc"
   * "Shampoo Base Q S"
   * "Shampoo Base QS"
   * "Base Q.S."
   *
   * Do NOT depend solely on exact rule regexes.
   */

  const baseSignals = [
    /\bshamp(?:oo|0o|00)\s+bas[aece]\b/i,
    /\bshampoo\s+b[a4]se\b/i,
    /\bshampoo\s+base\b/i,
    /\bsoap\s+base\b/i,
    /\bcream\s+base\b/i,
    /\bcreme\s+base\b/i,
    /\blotion\s+base\b/i,
    /\bcleanser\s+base\b/i,
    /\bface\s*wash\s+base\b/i,
    /\bdetergent\s+base\b/i,
    /\bcleaning\s+base\b/i,
    /\bbase\s*(?:[:\-]|\s)+q\s*\.?\s*s\.?/i,
    /\bbase\s+(?:q\s*s|qs)\b/i,
    /\bbase\s+quantity\s+sufficient\b/i,
  ];

  const hasBaseSignal =
    baseSignals.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(normalized);
    });

  if (
    hasBaseSignal &&
    !matches.some(
      (finding) =>
        finding.key === 'shampoo_base' ||
        finding.key === 'soap_base' ||
        finding.key === 'cream_base' ||
        finding.key === 'cleanser_base' ||
        finding.key === 'detergent_base'
    )
  ) {
    /*
     * Generic fallback.
     *
     * This is especially important when OCR converts:
     *
     * Shampoo Base
     *
     * into:
     *
     * Shamp00 Base
     *
     */
    matches.push({
      key: 'undisclosed_base_fallback',
      label: 'Unspecified / undisclosed product base',
      severity: 'high',
      category: 'INGREDIENT_TRANSPARENCY',
      points: 15,
      patterns: [],
      note:
        'The label appears to declare a broad product base instead of identifying its individual constituents. Some ingredients inside the base cannot be evaluated.',
      why:
        'HealthScan does not assume an unspecified base is harmless. Undisclosed constituents reduce ingredient transparency and prevent complete screening.',
      evidence:
        'Label transparency',
      source: RULE_SOURCES.FDA_LABELING,
      carcinogenicity: null,
      hardStop: false,
    });
  }

  /*
   * --------------------------------------------------------------------------
   * OCR-TOLERANT Q.S. DETECTION
   * --------------------------------------------------------------------------
   */

  const quantitySufficientSignals = [
    /\bq\s*\.?\s*s\s*\.?\b/i,
    /\bq\s+s\b/i,
    /\bqs\b/i,
    /\bquantity\s+sufficient\b/i,
    /\bquantity\s+sufficien[ct]\b/i,
    /\bquantit[yi]\s+sufficien[ct]\b/i,
  ];

  const hasQuantitySufficient =
    quantitySufficientSignals.some(
      (pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(normalized);
      }
    );

  if (
    hasQuantitySufficient &&
    !matches.some(
      (finding) =>
        finding.key ===
        'quantity_sufficient'
    )
  ) {
    matches.push({
      key: 'quantity_sufficient_fallback',
      label: 'Q.S. / quantity sufficient',
      severity: 'moderate',
      category: 'INGREDIENT_TRANSPARENCY',
      points: 7,
      patterns: [],
      note:
        'The label uses Q.S. / quantity sufficient notation instead of stating an exact amount. The exact composition or quantity cannot be fully determined from the label alone.',
      why:
        'HealthScan treats Q.S. as a transparency signal because the label does not provide a precise quantity for the referenced component.',
      evidence:
        'Label transparency',
      source: RULE_SOURCES.FDA_LABELING,
      carcinogenicity: null,
      hardStop: false,
    });
  }

  /*
   * --------------------------------------------------------------------------
   * GENERIC "BASE" DETECTION
   * --------------------------------------------------------------------------
   *
   * This catches labels that simply say:
   *
   * "Base"
   * "Base: Q.S."
   * "Base q.s."
   * "Base ingredients"
   *
   * without a specific product type.
   */

  const genericBaseSignals = [
    /\bbase\s*[:\-]\s*q\s*\.?\s*s\.?/i,
    /\bbase\s+q\s*\.?\s*s\.?/i,
    /\bbase\s+qs\b/i,
    /\bbase\s+ingredients?\b/i,
    /\bproprietary\s+base\b/i,
    /\bformulation\s+base\b/i,
    /\bvehicle\s+base\b/i,
  ];

  const hasGenericBase =
    genericBaseSignals.some(
      (pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(normalized);
      }
    );

  if (
    hasGenericBase &&
    !matches.some(
      (finding) =>
        finding.category ===
        'INGREDIENT_TRANSPARENCY'
    )
  ) {
    matches.push({
      key: 'generic_undisclosed_base',
      label: 'Unspecified / undisclosed base',
      severity: 'high',
      category: 'INGREDIENT_TRANSPARENCY',
      points: 15,
      patterns: [],
      note:
        'The label uses a broad base/formulation declaration without identifying the individual constituents.',
      why:
        'A broad base declaration prevents HealthScan from evaluating all components of the formulation.',
      evidence:
        'Label transparency',
      source: RULE_SOURCES.FDA_LABELING,
      carcinogenicity: null,
      hardStop: false,
    });
  }

  return matches;
}

/* -------------------------------------------------------------------------- */
/* SCORING                                                                    */
/* -------------------------------------------------------------------------- */

function scoreFindings(findings) {
  const hardStop = findings.some((item) => item.hardStop === true);

  if (hardStop) {
    return {
      score: 0,
      verdict: 'AVOID',
      hardStop: true,
    };
  }

  const penalty = findings.reduce(
    (total, item) => total + Number(item.points || 0),
    0
  );

  const score = Math.max(
    0,
    Math.min(100, Math.round(100 - penalty))
  );

  let verdict = 'AVOID';

  if (score >= SCORE_THRESHOLDS.GOOD_TO_GO) {
    verdict = 'GOOD TO GO';
  } else if (score >= SCORE_THRESHOLDS.AVERAGE) {
    verdict = 'AVERAGE';
  }

  return {
    score,
    verdict,
    hardStop: false,
  };
}

function sortFindings(findings) {
  const order = {
    critical: 0,
    very_high: 1,
    high: 2,
    moderate: 3,
    low: 4,
  };

  return [...findings].sort((a, b) => {
    const severityDiff =
      (order[a.severity] ?? 99) -
      (order[b.severity] ?? 99);

    if (severityDiff !== 0) {
      return severityDiff;
    }

    return Number(b.points || 0) - Number(a.points || 0);
  });
}

/* -------------------------------------------------------------------------- */
/* ASSESSMENT CONFIDENCE                                                      */
/* -------------------------------------------------------------------------- */

function calculateAssessmentConfidence({
  ocrConfidence,
  text,
  transparencyFindings,
  ingredientCandidates,
}) {
  let confidence = 95;

  if (typeof ocrConfidence === 'number') {
    confidence = Math.min(
      confidence,
      Math.round(ocrConfidence)
    );
  }

  if (text.length < 40) {
    confidence -= 20;
  }

  if (ingredientCandidates.length < 2) {
    confidence -= 15;
  }

  if (transparencyFindings.length > 0) {
    confidence -= Math.min(
      30,
      transparencyFindings.length * 6
    );
  }

  if (
    !/\b(ingredients?|composition|excipients?|contains)\b/i.test(text)
  ) {
    confidence -= 10;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(confidence))
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN ANALYSIS                                                              */
/* -------------------------------------------------------------------------- */

export function analyzeIngredients(rawText = '', meta = {}) {
  const text = normalizeOCRText(rawText);
  const normalized = canonicalizeForMatch(text);

  if (!normalized) {
    return {
      text: '',
      normalizedText: '',
      findings: [],
      score: 0,
      verdict: 'AVOID',
      hardStop: false,
      carcinogenDetected: false,
      carcinogenicityConcerns: [],
      transparencyFindings: [],
      ingredientCandidates: [],
      ingredientCount: 0,
      confidence: meta.ocrConfidence ?? null,
      assessmentConfidence: 0,
      empty: true,
    };
  }

  const matchedRules = ALL_RULES.filter((item) =>
    ruleMatches(item, normalized)
  );

  const findings = sortFindings(
    uniqueByKey(matchedRules)
  );

  const transparencyFindings =
    detectTransparencyFindings(text);

  const allFindings = uniqueByKey([
  ...findings,
  ...transparencyFindings,
]);

const scoring = scoreFindings(allFindings);
const candidates = splitCandidateIngredients(text);

  const carcinogenFindings = findings.filter(
    (item) => item.category === 'CARCINOGEN'
  );

  const carcinogenicityConcerns = findings.filter(
    (item) =>
      item.category === 'CARCINOGEN' ||
      item.category === 'CARCINOGENICITY_CONCERN'
  );

  return {
    text,
    normalizedText: normalized,
    findings: sortFindings(allFindings),
    score: scoring.score,
    verdict: scoring.verdict,
    hardStop: scoring.hardStop,

    carcinogenDetected:
      carcinogenFindings.length > 0,

    carcinogenicityConcerns,

    transparencyFindings:
      sortFindings(transparencyFindings),

    ingredientCandidates: candidates,
    ingredientCount: candidates.length,

    confidence:
      meta.ocrConfidence ?? null,

    ocrPasses:
      meta.ocrPasses ?? null,

    ocrBestPsm:
      meta.ocrBestPsm ?? null,

    assessmentConfidence:
      calculateAssessmentConfidence({
        ocrConfidence: meta.ocrConfidence,
        text,
        transparencyFindings,
        ingredientCandidates: candidates,
      }),

    ocr: Boolean(meta.ocr),
  };
}

/* -------------------------------------------------------------------------- */
/* UI HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

export function getSeverityLabel(severity) {
  return (
    {
      critical: 'CRITICAL',
      very_high: 'VERY HIGH',
      high: 'HIGH',
      moderate: 'MODERATE',
      low: 'LOW',
    }[severity] || 'REVIEW'
  );
}

export function getEvidenceLabel(finding) {
  if (finding.carcinogenicity) {
    return finding.carcinogenicity;
  }

  return finding.evidence || 'Review required';
}

export function getScoreMessage(analysis) {
  if (analysis.carcinogenDetected) {
    return 'CARCINOGENICITY CONCERN DETECTED — AVOID AND RAISE VOICE.';
  }

  if (analysis.verdict === 'GOOD TO GO') {
    return 'No configured high-priority concerns were detected.';
  }

  if (analysis.verdict === 'AVERAGE') {
    return 'Some ingredients or formulation choices deserve review before purchase.';
  }

  return 'One or more significant concerns were detected. Review the flagged ingredients before purchase.';
}