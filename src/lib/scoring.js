// Analytics engine (FR-17, FR-18, FR-19). Runs client-side for the demo.

export const DEFAULT_SETTINGS = {
  discountRate: 0.1, // r — to be agreed at inception (BRD open question 6)
  horizon: 20, // T in years — cap on each record's lifetime
  weights: { effectiveness: 30, sustainability: 20, equity: 20, cost: 15, ownership: 15 },
  goodThreshold: 3.5,
  failThreshold: 2.5,
}

// BCR = Σ B_t/(1+r)^t ÷ Σ (C_t + M_t)/(1+r)^t. Capital cost at t=0; benefits and O&M from t=1..T.
export function bcr(rec, { discountRate: r, horizon }) {
  if (rec.benefit == null || !rec.capex) return null
  const T = Math.min(rec.lifetime || horizon, horizon)
  let pvB = 0
  let pvC = rec.capex
  for (let t = 1; t <= T; t++) {
    const d = Math.pow(1 + r, t)
    pvB += rec.benefit / d
    pvC += (rec.maint || 0) / d
  }
  return pvB / pvC
}

// Map BCR onto the 0–5 criterion scale so cost-efficiency can join the multi-criteria score.
export function costScore(ratio) {
  if (ratio == null) return null
  if (ratio >= 3) return 5
  if (ratio >= 2) return 4
  if (ratio >= 1.5) return 3.5
  if (ratio >= 1) return 3
  if (ratio >= 0.5) return 1.5
  return 0.5
}

export function mcda(rec, settings, ratio = bcr(rec, settings)) {
  const w = settings.weights
  const crit = { ...rec.scores, cost: costScore(ratio) }
  let sum = 0
  let wsum = 0
  for (const k of Object.keys(w)) {
    if (crit[k] == null) continue // missing criterion: re-normalise over the rest
    sum += crit[k] * w[k]
    wsum += w[k]
  }
  return wsum ? sum / wsum : null
}

// good | mal | wip
export function classify(rec, settings, score, ratio) {
  if (rec.status !== 'past') return 'wip'
  if (rec.survival === 'failed') return 'mal'
  if (score < settings.failThreshold || (ratio != null && ratio < 1 && score < settings.goodThreshold)) return 'mal'
  if (score >= settings.goodThreshold && (ratio == null || ratio >= 1)) return 'good'
  return 'wip'
}

export function evaluate(rec, settings) {
  const ratio = bcr(rec, settings)
  const score = mcda(rec, settings, ratio)
  return { bcr: ratio, mcda: score, cls: classify(rec, settings, score, ratio) }
}

// Share of dictionary fields filled (DR-06).
const COMPLETENESS_FIELDS = ['title', 'status', 'start', 'division', 'district', 'upazila', 'lat', 'hazards', 'sector', 'type',
  'vulnerability', 'description', 'implementer', 'funder', 'capex', 'maint', 'benefit', 'beneficiaries', 'consultMethod',
  'survival', 'benefitsDirect', 'benefitsIndirect', 'lessons', 'source', 'policy']

export function completeness(rec) {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const v = rec[f]
    if (v == null || v === '') return false
    if (Array.isArray(v)) return v.length > 0
    return true
  }).length
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100)
}
