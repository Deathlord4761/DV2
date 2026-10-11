# Modular Vega-Lite project

This follows the FIT3179-style separation of page, styles, JavaScript visualizations and data:
- `index.html`
- `style.css`
- `js/` — one JS file per chart/map, each containing a Vega-Lite spec and its own `vegaEmbed()` call
- `data/` — CSVs and expected geographic file paths

The three files you supplied are incorporated:
- `js/map-1a.js`
- `js/map-1b.js`
- `js/chart-2-heatmap.js`

The original `.vg.json` files are also kept at the project root for editing/reference.

## Run locally
From this folder:
`python -m http.server 8000`
Open `http://localhost:8000`.

## Important data notes
- `abs_category_monthly_change.csv` and `abs_state_monthly_change.csv` contain published monthly changes used in the earlier template.
- `state_spending_monthly.csv` has published values for May–July 2026; August rows are intentionally blank until populated from the relevant ABS release.
- `category_state_spending.csv` is illustrative ONLY, because the supplied heatmap expects state-by-category monthly changes and that full cross-tab was not provided in the files. Replace this CSV with the correct downloaded ABS state/category data before using the heatmap as evidence.
- All files containing `ILLUSTRATIVE` in the filename are placeholders, not official data.
- The map specifications expect `data/australia-states.topojson` with a TopoJSON object named `states` and `properties.STATE_NAME` matching full state names. This topology was not included in the uploads; add a verified state/territory TopoJSON file at that exact path.
- The supplied map specs currently select August 2026 by default. The map CSV intentionally leaves August values blank rather than inventing them; either change the default to July or populate August using the official ABS release.
- The supplied `map-1a.vg.json` and `map-1b.vg.json` have almost identical specifications, with different default months. They are both included as requested; consider whether you want both maps on the final page or only one.
- The supplied map specs' label layer uses `datum.code`; verify that this field exists in the joined map data. If not, replace with `datum.state` or add a state code field in the spec.
- Your heatmap spec expects `data/category_state_spending.csv` and the columns `month`, `state`, `category`, `change_pct`.
- Source: ABS Monthly Household Spending Indicator: https://www.abs.gov.au/statistics/economy/finance/monthly-household-spending-indicator/latest-release
- Spendmapp: https://geografia.com.au/spendmapp/
- Homes Victoria rental reports: https://www.dffh.vic.gov.au/publications/past-rental-reports
