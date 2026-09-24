# National Climate Adaptation Inventory — Frontend Demo

Clickable frontend prototype for the Oxfam in Bangladesh bid (BRD v0.1). Frontend only: all data is illustrative mock data held in the browser (localStorage). There is no backend.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (hash routing works on any static host)
```

Map tiles load from OpenStreetMap, so the demo machine needs internet access.

## Demo script (about 5 minutes)

1. **Home**: the six analytical questions, live stats, featured good practices and a maladaptation strip.
2. **বাংলা toggle** (top right): the whole UI and content switch to Bangla (FR-26).
3. **Explore map**: clustered markers coloured by class, indicative hazard zones, investment-by-division layer, filters, CSV/GeoJSON export (FR-14, FR-20, FR-22).
4. **Record detail**: open CAI-0003 (maladaptation) and CAI-0016 (good practice). Every record answers all six questions and shows BCR, MCDA radar, completeness and provenance (FR-15, FR-17).
5. **Dashboard**: investment by sector and division, BCR distribution, class split, funding-gap signal. Each chart downloads as PNG (FR-21).
6. **Submit data**: 7-step wizard with required-field checks, map pin, duplicate warning (try the title "Floating vegetable gardens"), draft save and consent (FR-01 to FR-10).
7. **Bulk upload**: click "Try with sample file" to see row-level errors, then import the valid rows (FR-02).
8. **View as → Reviewer**: the review queue with workflow states, verification level and audit trail (FR-11 to FR-13).
9. **View as → Administrator**: drag the MCDA weights or discount rate and watch every record re-score and re-classify live (FR-18, FR-25).
10. **Compare**: tick "Compare" on 2–3 cards (FR-16).

"Reset demo data" on the Admin page restores the seed data.

## Structure

```
src/
  data/taxonomy.js    controlled vocabularies, admin hierarchy, hazard zones
  data/records.js     26 illustrative interventions (2 pending review)
  lib/scoring.js      BCR (discounted), MCDA, classification, completeness
  lib/i18n.js         EN/BN UI strings
  lib/store.jsx       app state: language, role, records, settings, audit
  lib/export.js       flat CSV (UTF-8 BOM) and GeoJSON export
  components/         header, footer, filters, cards, maps
  pages/              Home, Explore, Inventory, RecordDetail, Dashboard,
                      Submit, BulkUpload, Review, Admin, Compare, About
```

Stack: React 19, Vite, React Router, Leaflet + react-leaflet(-cluster), Recharts. All open source, matching NFR-01.

## Branding note

The Oxfam logo and colours (#44841a green, #eaeade sand, #f16e22 orange) were taken from oxfam.org for this pitch to Oxfam. The official font (TStar) is proprietary, so Roboto / Roboto Condensed stand in, with Noto Sans Bengali for Bangla. Confirm brand use with Oxfam before showing the demo outside the bid.
