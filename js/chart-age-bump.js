// Household spending by age – bump chart of category rankings.
// Replaces the radial bar chart (chart-radial.js) with a form that is easier to read.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data: data/spending_by_age_ranked_2015_16.csv (one row per age group per category; no totals)
//   age_group, age_order, category, category_short, cat_order, weekly_spend ($/week),
//   share_pct (% of the age group's total goods & services spending), rse_pct, reliability,
//   rank (1 = the category the age group spends most on; ranked by $/week within the age group,
//         which gives the same order as share_pct without the ties caused by rounding)
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, Table 10.1.
//
// How it reads
//   Top (bump chart): each line is a spending category; its height is its rank in each age group.
//   Lines that climb are categories that matter more as people age (e.g. Medical & health),
//   lines that fall matter less (e.g. Education). One category is highlighted with its share
//   of the budget printed on each point.
//   Pick the highlighted category from the dropdown or by clicking a point on the chart.

const AGE_DATA = {
  "url": "data/spending_by_age_ranked_2015_16.csv",
  "format": {
    "type": "csv",
    "parse": {
      "age_order": "number", "cat_order": "number", "weekly_spend": "number",
      "share_pct": "number", "rse_pct": "number", "rank": "number"
    }
  }
};

// Dropdown options, in rank order for the youngest group.
const AGE_CATEGORIES = [
  "Housing", "Food", "Transport", "Recreation", "Education", "Miscellaneous", "Communication",
  "Clothing", "Furnishings", "Alcohol", "Fuel & power", "Medical & health", "Personal care",
  "Household services", "Tobacco"
];

const AGE_FOCUS = "#0f5c63";
const AGE_MUTED = "#d3dbd8";
const AGE_W = 560;
const AGE_ROW = 28;

const AGE_X = {
  "field": "age_group",
  "type": "ordinal",
  "sort": { "field": "age_order", "op": "min" },
  "scale": { "padding": 0.1 },
  "title": "Age of household reference person",
  "axis": {
    "orient": "top", "offset": 18, "labelAngle": 0, "labelFontSize": 12, "labelFontWeight": 600, "labelColor": "#1b2a2e",
    "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66", "titlePadding": 8,
    "domain": false, "ticks": false, "grid": true, "gridColor": "#eef1f0"
  }
};

const AGE_Y = {
  "field": "rank",
  "type": "quantitative",
  "scale": { "domain": [1, 15], "reverse": true, "nice": false },
  "axis": null
};

const AGE_TOOLTIP = [
  { "field": "category", "type": "nominal", "title": "Category" },
  { "field": "age_group", "type": "nominal", "title": "Age group" },
  { "field": "rank", "type": "quantitative", "title": "Rank (1 = biggest)" },
  { "field": "share_pct", "type": "quantitative", "title": "Share of spending (%)", "format": ".1f" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend", "format": "$,.2f" },
  { "field": "reliability", "type": "nominal", "title": "Reliability" }
];

const AGE_IS_FOCUS = { "param": "focus", "empty": false };

const spec_chart_age_bump = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": AGE_DATA,
  "width": AGE_W,
  "height": AGE_ROW * 14,
  "encoding": { "x": AGE_X, "y": AGE_Y },
  "layer": [
    // 1. All category lines, muted.
    {
      "mark": { "type": "line", "strokeWidth": 1.6, "color": AGE_MUTED, "interpolate": "monotone" },
      "encoding": { "detail": { "field": "category_short" } }
    },
    // 2. All points, muted. This layer holds the click/dropdown selection.
    {
      "params": [
        {
          "name": "focus",
          "value": [{ "category_short": "Medical & health" }],
          "select": { "type": "point", "fields": ["category_short"], "on": "click", "clear": false },
          "bind": { "input": "select", "options": AGE_CATEGORIES, "name": "Highlight: " }
        }
      ],
      "mark": { "type": "circle", "size": 70, "color": AGE_MUTED, "opacity": 1, "cursor": "pointer" },
      "encoding": { "tooltip": AGE_TOOLTIP }
    },
    // 3. The highlighted category's line, drawn on top.
    {
      "transform": [{ "filter": AGE_IS_FOCUS }],
      "mark": { "type": "line", "strokeWidth": 3.5, "color": AGE_FOCUS, "interpolate": "monotone" }
    },
    // 4. Its points, with the share of spending printed just above each one.
    {
      "transform": [{ "filter": AGE_IS_FOCUS }],
      "mark": { "type": "circle", "size": 170, "color": AGE_FOCUS, "opacity": 1, "stroke": "#ffffff", "strokeWidth": 2 },
      "encoding": { "tooltip": AGE_TOOLTIP }
    },
    // White outline drawn first, so the label stays readable where grey lines pass behind it.
    {
      "transform": [
        { "filter": AGE_IS_FOCUS },
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
        { "filter": AGE_IS_FOCUS },
        { "calculate": "format(datum.share_pct, '.1f') + '%'", "as": "share_label" }
      ],
      "mark": { "type": "text", "dy": -16, "fontSize": 12, "fontWeight": 700, "color": AGE_FOCUS },
      "encoding": { "text": { "field": "share_label", "type": "nominal" }, "tooltip": AGE_TOOLTIP }
    },
    // 5. Category names at both ends (bold + coloured for the highlighted category).
    {
      "transform": [
        { "filter": "datum.age_order === 1" },
        { "calculate": "datum.rank + '. ' + datum.category_short", "as": "end_label" }
      ],
      "mark": { "type": "text", "align": "right", "dx": -14, "fontSize": 11 },
      "encoding": {
        "text": { "field": "end_label", "type": "nominal" },
        "color": { "condition": { ...AGE_IS_FOCUS, "value": AGE_FOCUS }, "value": "#5b6b66" },
        "fontWeight": { "condition": { ...AGE_IS_FOCUS, "value": 700 }, "value": 400 }
      }
    },
    {
      "transform": [
        { "filter": "datum.age_order === 7" },
        { "calculate": "datum.rank + '. ' + datum.category_short", "as": "end_label" }
      ],
      "mark": { "type": "text", "align": "left", "dx": 14, "fontSize": 11 },
      "encoding": {
        "text": { "field": "end_label", "type": "nominal" },
        "color": { "condition": { ...AGE_IS_FOCUS, "value": AGE_FOCUS }, "value": "#5b6b66" },
        "fontWeight": { "condition": { ...AGE_IS_FOCUS, "value": 700 }, "value": 400 }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-age-bump', spec_chart_age_bump, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-age-bump:', error));
