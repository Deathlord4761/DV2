// Household spending categories ranked over time – bump chart, Australia 1984 to 2015-16.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data: data/category_rank_1984_2016.csv (one row per survey per category; no totals)
//   survey, year_order, category, category_short, weekly_spend ($/week, not adjusted for inflation),
//   share_pct (% of total goods & services spending in that survey),
//   rank (1 = the category households spent most on in that survey, ranked by $/week;
//         the one exact tie – Communication and Personal care at $6.60 in 1984 – is broken by
//         which is larger in 2015-16)
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, datacube 1
//   ("Household expenditure, 1984 to 2015-16"), Table 1.1.
//
// How it reads
//   Each line is a spending category; its height is its rank in each survey. Housing climbs from
//   3rd (1984) to 1st (2009-10 onwards); clothing falls from 6th to 11th; education rises from last
//   to 10th. One category is highlighted with its share of the budget printed on each point.
//   Pick the highlighted category from the dropdown or by clicking a point on the chart.

const RANK_DATA = {
  "url": "data/category_rank_1984_2016.csv",
  "format": {
    "type": "csv",
    "parse": {
      "year_order": "number", "weekly_spend": "number", "share_pct": "number", "rank": "number"
    }
  }
};

// Dropdown options, in rank order for 1984.
const RANK_CATEGORIES = [
  "Food", "Transport", "Housing", "Recreation", "Furnishings", "Clothing", "Miscellaneous",
  "Medical & health", "Alcohol", "Fuel & power", "Household services", "Communication",
  "Personal care", "Tobacco", "Education"
];

const RANK_FOCUS = "#0f5c63";
const RANK_MUTED = "#d3dbd8";
const RANK_W = 560;
const RANK_ROW = 28;

const RANK_X = {
  "field": "survey",
  "type": "ordinal",
  "sort": { "field": "year_order", "op": "min" },
  "scale": { "padding": 0.1 },
  "title": "ABS Household Expenditure Survey",
  "axis": {
    "orient": "top", "offset": 18, "labelAngle": 0, "labelFontSize": 12, "labelFontWeight": 600, "labelColor": "#1b2a2e",
    "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66", "titlePadding": 8,
    "domain": false, "ticks": false, "grid": true, "gridColor": "#eef1f0"
  }
};

const RANK_Y = {
  "field": "rank",
  "type": "quantitative",
  "scale": { "domain": [1, 15], "reverse": true, "nice": false },
  "axis": null
};

const RANK_TOOLTIP = [
  { "field": "category", "type": "nominal", "title": "Category" },
  { "field": "survey", "type": "nominal", "title": "Survey" },
  { "field": "rank", "type": "quantitative", "title": "Rank (1 = biggest)" },
  { "field": "share_pct", "type": "quantitative", "title": "Share of spending (%)", "format": ".1f" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend (not inflation-adjusted)", "format": "$,.2f" }
];

const RANK_IS_FOCUS = { "param": "focus", "empty": false };

const spec_chart_category_rank = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": RANK_DATA,
  "width": RANK_W,
  "height": RANK_ROW * 14,
  "encoding": { "x": RANK_X, "y": RANK_Y },
  "layer": [
    // 1. All category lines, muted.
    {
      "mark": { "type": "line", "strokeWidth": 1.6, "color": RANK_MUTED, "interpolate": "monotone" },
      "encoding": { "detail": { "field": "category_short" } }
    },
    // 2. All points, muted. This layer holds the click/dropdown selection.
    {
      "params": [
        {
          "name": "focus",
          "value": [{ "category_short": "Housing" }],
          "select": { "type": "point", "fields": ["category_short"], "on": "click", "clear": false },
          "bind": { "input": "select", "options": RANK_CATEGORIES, "name": "Highlight: " }
        }
      ],
      "mark": { "type": "circle", "size": 70, "color": RANK_MUTED, "opacity": 1, "cursor": "pointer" },
      "encoding": { "tooltip": RANK_TOOLTIP }
    },
    // 3. The highlighted category's line, drawn on top.
    {
      "transform": [{ "filter": RANK_IS_FOCUS }],
      "mark": { "type": "line", "strokeWidth": 3.5, "color": RANK_FOCUS, "interpolate": "monotone" }
    },
    // 4. Its points, with the share of spending printed just above each one.
    {
      "transform": [{ "filter": RANK_IS_FOCUS }],
      "mark": { "type": "circle", "size": 170, "color": RANK_FOCUS, "opacity": 1, "stroke": "#ffffff", "strokeWidth": 2 },
      "encoding": { "tooltip": RANK_TOOLTIP }
    },
    // White outline drawn first, so the label stays readable where grey lines pass behind it.
    {
      "transform": [
        { "filter": RANK_IS_FOCUS },
        { "calculate": "format(datum.share_pct, '.1f') + '%'", "as": "share_label" }
      ],
      "mark": {
        "type": "text", "dy": -16, "fontSize": 12, "fontWeight": 700,
        "color": "#ffffff", "stroke": "#ffffff", "strokeWidth": 5, "strokeJoin": "round"
      },
      "encoding": { "text": { "field": "share_label", "type": "nominal" } }
    },
    {
      "transform": [
        { "filter": RANK_IS_FOCUS },
        { "calculate": "format(datum.share_pct, '.1f') + '%'", "as": "share_label" }
      ],
      "mark": { "type": "text", "dy": -16, "fontSize": 12, "fontWeight": 700, "color": RANK_FOCUS },
      "encoding": { "text": { "field": "share_label", "type": "nominal" }, "tooltip": RANK_TOOLTIP }
    },
    // 5. Category names at both ends (bold + coloured for the highlighted category).
    {
      "transform": [
        { "filter": "datum.year_order === 1" },
        { "calculate": "datum.rank + '. ' + datum.category_short", "as": "end_label" }
      ],
      "mark": { "type": "text", "align": "right", "dx": -14, "fontSize": 11 },
      "encoding": {
        "text": { "field": "end_label", "type": "nominal" },
        "color": { "condition": { ...RANK_IS_FOCUS, "value": RANK_FOCUS }, "value": "#5b6b66" },
        "fontWeight": { "condition": { ...RANK_IS_FOCUS, "value": 700 }, "value": 400 }
      }
    },
    {
      "transform": [
        { "filter": "datum.year_order === 7" },
        { "calculate": "datum.rank + '. ' + datum.category_short", "as": "end_label" }
      ],
      "mark": { "type": "text", "align": "left", "dx": 14, "fontSize": 11 },
      "encoding": {
        "text": { "field": "end_label", "type": "nominal" },
        "color": { "condition": { ...RANK_IS_FOCUS, "value": RANK_FOCUS }, "value": "#5b6b66" },
        "fontWeight": { "condition": { ...RANK_IS_FOCUS, "value": 700 }, "value": 400 }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-category-rank', spec_chart_category_rank, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-category-rank:', error));
