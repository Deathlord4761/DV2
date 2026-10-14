// Household spending by age of reference person – grouped radial bar chart.
// Keep the chart specification in this file so each visualization is modular.
//
// Data: data/spending_by_age_2015_16.csv (one row per age group per category; no totals)
//   age_group, age_order, category, category_short, cat_order, weekly_spend ($/week),
//   share_pct (% of the age group's total goods & services spending), rse_pct, reliability
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, Table 10.1.
//
// How it reads: the circle is split into one labelled sector per spending category (largest overall
// at 12 o'clock, then clockwise). Inside each sector there are 7 bars, one per age group, youngest
// (lightest) to oldest (darkest). Bar length uses a square-root scale so bar AREA tracks the value.
// Click an age group in the legend to highlight it across every category (shift-click for several).

const RADIAL_SIZE = 560;     // chart is square
const RADIAL_INNER = 38;     // hole in the middle (px)
const RADIAL_OUTER = 200;    // longest possible bar (px)
const RADIAL_LABEL = 236;    // radius of the category labels (px)

const RADIAL_AGES = ["15–24", "25–34", "35–44", "45–54", "55–64", "65–74", "75 and over"];
const RADIAL_AGE_COLOURS = ["#bfe0db", "#94c9c2", "#69afa8", "#43938e", "#2b7a78", "#1b5e5c", "#0e3f3e"];

// Angular layout: each category gets 8 slots – 7 age bars + 1 empty slot as a gap between sectors.
const RADIAL_SLOTS_PER_CATEGORY = 8;
const RADIAL_CATEGORIES = 15;
const RADIAL_THETA_SCALE = {
  "domain": [0, RADIAL_SLOTS_PER_CATEGORY * RADIAL_CATEGORIES],
  "range": [0, 6.2832],
  "zero": false,
  "nice": false
};

const RADIAL_RADIUS = {
  "field": "value",
  "type": "quantitative",
  "scale": {
    "type": "sqrt",
    "zero": true,
    "domainMax": { "expr": "measure === 'Share of spending (%)' ? 26 : 410" },
    "range": [RADIAL_INNER, RADIAL_OUTER]
  },
  "legend": null
};

const RADIAL_TOOLTIP = [
  { "field": "category", "type": "nominal", "title": "Category" },
  { "field": "age_group", "type": "nominal", "title": "Age of reference person" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend", "format": "$,.2f" },
  { "field": "share_pct", "type": "quantitative", "title": "Share of spending (%)", "format": ".1f" },
  { "field": "reliability", "type": "nominal", "title": "Reliability" }
];

// Guide rings: 5/10/15/20/25 % or $100/$200/$300/$400.
const RADIAL_RING_TRANSFORM = [
  { "calculate": "measure === 'Share of spending (%)' ? datum.i * 5 : datum.i * 100", "as": "value" },
  { "filter": "measure === 'Share of spending (%)' ? datum.value <= 25 : datum.value <= 400" }
];

const spec_chart_radial = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "How the household budget splits by age",
    "subtitle": {
      "expr": "measure + ' by category · each bar is an age group (light = younger, dark = older) · 2015-16'"
    },
    "anchor": "start",
    "fontSize": 15,
    "fontWeight": 600,
    "color": "#1b2a2e",
    "subtitleFontSize": 11,
    "subtitleColor": "#5b6b66"
  },
  "width": RADIAL_SIZE,
  "height": RADIAL_SIZE,
  "params": [
    {
      "name": "measure",
      "value": "Share of spending (%)",
      "bind": {
        "input": "radio",
        "options": ["Share of spending (%)", "Weekly spend ($)"],
        "name": "Show: "
      }
    }
  ],
  "data": {
    "url": "data/spending_by_age_2015_16.csv",
    "format": {
      "type": "csv",
      "parse": {
        "age_order": "number", "cat_order": "number", "weekly_spend": "number",
        "share_pct": "number", "rse_pct": "number"
      }
    }
  },
  "transform": [
    { "calculate": "(datum.cat_order - 1) * " + RADIAL_SLOTS_PER_CATEGORY + " + (datum.age_order - 1)", "as": "slot_start" },
    { "calculate": "datum.slot_start + 1", "as": "slot_end" },
    { "calculate": "(datum.cat_order - 1) * " + RADIAL_SLOTS_PER_CATEGORY + " + 3.5", "as": "cat_centre" },
    { "calculate": "measure === 'Share of spending (%)' ? datum.share_pct : datum.weekly_spend", "as": "value" }
  ],
  "layer": [
    // 1. Guide rings.
    {
      "data": { "sequence": { "start": 1, "stop": 6, "as": "i" } },
      "transform": RADIAL_RING_TRANSFORM,
      "mark": {
        "type": "arc",
        "theta": 0,
        "theta2": 6.2832,
        "fill": null,
        "stroke": "#d6dcd9",
        "strokeWidth": 1,
        "strokeDash": [2, 3]
      },
      "encoding": { "radius": RADIAL_RADIUS }
    },
    // 2. Ring labels, just left of 12 o'clock (in the gap before the first sector).
    {
      "data": { "sequence": { "start": 1, "stop": 6, "as": "i" } },
      "transform": [
        ...RADIAL_RING_TRANSFORM,
        { "calculate": "measure === 'Share of spending (%)' ? datum.value + '%' : '$' + datum.value", "as": "ring_label" }
      ],
      "mark": { "type": "text", "theta": 0, "fontSize": 9, "color": "#8a9792", "align": "right", "dx": -3, "dy": -4 },
      "encoding": {
        "radius": RADIAL_RADIUS,
        "text": { "field": "ring_label", "type": "nominal" }
      }
    },
    // 3. The bars: one per age group per category.
    {
      "params": [
        {
          "name": "age_pick",
          "select": { "type": "point", "fields": ["age_group"] },
          "bind": "legend"
        }
      ],
      "mark": { "type": "arc", "padAngle": 0.006, "stroke": "#ffffff", "strokeWidth": 0.5 },
      "encoding": {
        "theta": { "field": "slot_start", "type": "quantitative", "scale": RADIAL_THETA_SCALE },
        "theta2": { "field": "slot_end" },
        "radius": RADIAL_RADIUS,
        "color": {
          "field": "age_group",
          "type": "ordinal",
          "scale": { "domain": RADIAL_AGES, "range": RADIAL_AGE_COLOURS },
          "legend": {
            "title": "Age of reference person (click to highlight)",
            "orient": "bottom",
            "direction": "horizontal",
            "columns": 4,
            "symbolType": "square",
            "labelFontSize": 11,
            "titleFontSize": 11,
            "titleFontWeight": 600
          }
        },
        "opacity": {
          "condition": { "param": "age_pick", "empty": true, "value": 1 },
          "value": 0.15
        },
        // Estimates the ABS flags as "use with caution" are drawn paler.
        "fillOpacity": {
          "condition": { "test": "datum.reliability !== 'Reliable'", "value": 0.45 },
          "value": 1
        },
        "tooltip": RADIAL_TOOLTIP
      }
    },
    // 4. Category labels around the outside, centred on each sector.
    {
      "transform": [{ "filter": "datum.age_order === 1" }],
      "mark": {
        "type": "text",
        "radius": RADIAL_LABEL,
        "fontSize": 10.5,
        "fontWeight": 600,
        "color": "#1b2a2e"
      },
      "encoding": {
        "theta": { "field": "cat_centre", "type": "quantitative", "scale": RADIAL_THETA_SCALE },
        "text": { "field": "category_short", "type": "nominal" }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-radial', spec_chart_radial, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-radial:', error));
