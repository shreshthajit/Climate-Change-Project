// FR-22 / DR-01 / NFR-02: flat one-row-per-intervention export, CSV (UTF-8 BOM for Bangla in Excel) and GeoJSON.

const DIV_CODE = { barishal: '10', chattogram: '20', dhaka: '30', khulna: '40', mymensingh: '45', rajshahi: '50', rangpur: '55', sylhet: '60' }

export function flatten(r) {
  return {
    record_id: r.id,
    title_en: r.title.en,
    title_bn: r.title.bn,
    status: r.status,
    start_date: r.start,
    end_date: r.end,
    division: r.division,
    bbs_division_code: DIV_CODE[r.division],
    district: r.district,
    upazila: r.upazila,
    union: r.union,
    latitude: r.lat,
    longitude: r.lng,
    ecosystem: r.ecosystem,
    hazards: r.hazards.join(';'),
    sector: r.sector,
    intervention_type: r.type,
    implementer: r.implementer,
    supporting_partner: r.partner,
    funder: r.funder,
    governing_body: r.governing,
    actor_type: r.actorType,
    capital_cost_bdt: r.capex,
    annual_maintenance_bdt: r.maint,
    annual_avoided_loss_bdt: r.benefit ?? '',
    currency_original: r.currency,
    cost_year: r.costYear,
    design_life_years: r.lifetime,
    beneficiaries_total: r.beneficiaries.total,
    beneficiaries_women: r.beneficiaries.women,
    beneficiaries_youth: r.beneficiaries.youth,
    beneficiaries_pwd: r.beneficiaries.pwd,
    community_consulted: r.consulted ? 'Y' : 'N',
    consultation_method: r.consultMethod,
    survival_status: r.survival,
    bcr: r.bcr == null ? '' : r.bcr.toFixed(2),
    mcda_score: r.mcda == null ? '' : r.mcda.toFixed(2),
    effectiveness_class: r.cls,
    policy_tags: r.policy.join(';'),
    verification_level: r.verification,
    completeness_pct: r.completeness,
    source: r.source,
  }
}

function download(name, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
}

export function exportCsv(records, name = 'adaptation-inventory.csv') {
  download(name, '﻿' + toCsv(records.map(flatten)), 'text/csv;charset=utf-8')
}

export function exportGeoJson(records, name = 'adaptation-inventory.geojson') {
  const fc = {
    type: 'FeatureCollection',
    features: records.map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: flatten(r),
    })),
  }
  download(name, JSON.stringify(fc, null, 2), 'application/geo+json')
}

export function downloadText(name, content, type = 'text/csv;charset=utf-8') {
  download(name, content, type)
}
