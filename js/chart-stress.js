// Household spending under financial stress – linked stacked bars + connected dot plot.
// Keep the chart specification in this file so each visualization is modular.
//
// Data: data/spending_by_financial_stress_2015_16.csv (one row per stress level per spending type)
//   stress_level, stress_short, stress_order, type (Basic | Discretionary), weekly_spend ($/week),
//   total_spend (basic + discretionary), share_pct (type's share of total),
//   change_vs_none_pct ((value − value with no stress indicators) / value with none × 100)
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16 (Graph 3).
//
// Left: how big the weekly budget is at each stress level, split basic / discretionary.
// Right: how far each type falls compared with households reporting no stress.
// Hover a stress level in the left panel to highlight it in both panels.

const STRESS_DATA = {
  "url": "data/spending_by_financial_stress_2015_16.csv",
  "format": {
    "type": "csv",
    "parse": {
      "stress_order": "number", "weekly_spend": "number", "total_spend": "number",
      "share_pct": "number", "change_vs_none_pct": "number"
    }
  }
};

const STRESS_X = {
  "field": "stress_short",
  "type": "ordinal",
  "sort": { "field": "stress_order", "op": "min" },
  "title": "Number of financial stress indicators reported",
  "axis": { "labelAngle": 0, "labelFontSize": 11, "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66", "domain": false, "ticks": false }
};

const STRESS_COLOUR = {
  "field": "type",
  "type": "nominal",
  "scale": { "domain": ["Basic", "Discretionary"], "range": ["#2b7a78", "#d17a36"] },
  "legend": { "title": null, "orient": "top", "direction": "horizontal", "labelFontSize": 11, "symbolType": "square" }
};

const STRESS_TOOLTIP = [
  { "field": "stress_level", "type": "nominal", "title": "Financial stress" },
  { "field": "type", "type": "nominal", "title": "Spending type" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend", "format": "$,.0f" },
  { "field": "share_pct", "type": "quantitative", "title": "Share of household spending (%)", "format": ".1f" },
  { "field": "change_vs_none_pct", "type": "quantitative", "title": "Change vs no stress (%)", "format": "+.1f" },
  { "field": "total_spend", "type": "quantitative", "title": "Total basic + discretionary", "format": "$,.0f" }
];

// Highlight rule shared by both panels.
const STRESS_HIGHLIGHT = {
  "condition": { "param": "stress_hover", "empty": true, "value": 1 },
  "value": 0.3
};

// Scale and axis for the % change panel (0 line drawn darker).
const STRESS_CHANGE_SCALE = { "domain": [-55, 5] };
const STRESS_CHANGE_AXIS = {
  "format": "+.0f",
  "values": [0, -10, -20, -30, -40, -50],
  "grid": true,
  "gridColor": { "condition": { "test": "datum.value === 0", "value": "#7c8983" }, "value": "#e3e8e8" },
  "domain": false,
  "ticks": false,
  "labelFontSize": 10,
  "titleFontSize": 11,
  "titleFontWeight": 500,
  "titleColor": "#5b6b66"
};

const spec_chart_stress = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Under financial stress, the extras are cut first",
    "subtitle": "Average weekly household spending by number of financial stress indicators, Australia, 2015-16",
    "anchor": "start",
    "fontSize": 15,
    "fontWeight": 600,
    "color": "#1b2a2e",
    "subtitleFontSize": 11,
    "subtitleColor": "#5b6b66"
  },
  "data": STRESS_DATA,
  "hconcat": [
    // A. Stacked bars: the size and split of the weekly budget.
    {
      "title": { "text": "Weekly budget", "fontSize": 12, "fontWeight": 600, "color": "#1b2a2e", "anchor": "start" },
      "width": 300,
      "height": 280,
      "encoding": { "x": STRESS_X },
      "layer": [
        {
          "params": [
            {
              "name": "stress_hover",
              "select": { "type": "point", "fields": ["stress_short"], "on": "pointerover", "clear": "pointerout" }
            }
          ],
          "mark": { "type": "bar", "width": { "band": 0.62 }, "stroke": "#ffffff", "strokeWidth": 1 },
          "encoding": {
            "y": {
              "field": "weekly_spend",
              "type": "quantitative",
              "stack": "zero",
              "title": "$ per week",
              "scale": { "domain": [0, 1700] },
              "axis": { "format": "$,.0f", "values": [0, 400, 800, 1200, 1600], "grid": true, "gridColor": "#e3e8e8", "domain": false, "ticks": false, "labelFontSize": 10, "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66" }
            },
            "color": STRESS_COLOUR,
            "order": { "field": "type", "sort": "ascending" },
            "opacity": STRESS_HIGHLIGHT,
            "tooltip": STRESS_TOOLTIP
          }
        },
        // Total on top of each bar.
        {
          "transform": [{ "filter": "datum.type === 'Discretionary'" }],
          "mark": { "type": "text", "dy": -7, "fontSize": 11, "fontWeight": 600, "color": "#1b2a2e" },
          "encoding": {
            "y": { "field": "total_spend", "type": "quantitative" },
            "text": { "field": "total_spend", "type": "quantitative", "format": "$,.0f" },
            "opacity": STRESS_HIGHLIGHT
          }
        },
        // Discretionary share inside the orange segment.
        {
          "transform": [
            { "filter": "datum.type === 'Discretionary'" },
            { "calculate": "datum.total_spend - datum.weekly_spend / 2", "as": "mid" },
            { "calculate": "format(datum.share_pct, '.0f') + '%'", "as": "share_label" }
          ],
          "mark": { "type": "text", "fontSize": 10, "fontWeight": 600, "color": "#ffffff" },
          "encoding": {
            "y": { "field": "mid", "type": "quantitative" },
            "text": { "field": "share_label", "type": "nominal" },
            "opacity": STRESS_HIGHLIGHT
          }
        }
      ]
    },
    // B. Connected dot plot: % change compared with households reporting no stress.
    {
      "title": { "text": "Change vs households with no stress", "fontSize": 12, "fontWeight": 600, "color": "#1b2a2e", "anchor": "start" },
      "width": 300,
      "height": 280,
      "layer": [
        // Shaded gap between the two lines (how much harder discretionary is cut).
        {
          "transform": [
            { "pivot": "type", "value": "change_vs_none_pct", "groupby": ["stress_short", "stress_order"] }
          ],
          "mark": { "type": "area", "color": "#d17a36", "opacity": 0.12, "interpolate": "linear" },
          "encoding": {
            "x": STRESS_X,
            "y": { "field": "Basic", "type": "quantitative", "scale": STRESS_CHANGE_SCALE, "axis": STRESS_CHANGE_AXIS, "title": "% change" },
            "y2": { "field": "Discretionary" }
          }
        },
        {
          "mark": { "type": "line", "strokeWidth": 2.5, "interpolate": "linear" },
          "encoding": {
            "x": STRESS_X,
            "y": { "field": "change_vs_none_pct", "type": "quantitative" },
            "color": STRESS_COLOUR,
            "detail": { "field": "type" }
          }
        },
        {
          "mark": { "type": "circle", "size": 80, "stroke": "#ffffff", "strokeWidth": 1.5 },
          "encoding": {
            "x": STRESS_X,
            "y": { "field": "change_vs_none_pct", "type": "quantitative" },
            "color": STRESS_COLOUR,
            "opacity": STRESS_HIGHLIGHT,
            "tooltip": STRESS_TOOLTIP
          }
        },
        // Labels to the right of the last points.
        {
          "transform": [
            { "filter": "datum.stress_order === 5" },
            { "calculate": "datum.type + ' ' + format(datum.change_vs_none_pct, '+.0f') + '%'", "as": "end_label" }
          ],
          "mark": { "type": "text", "align": "left", "baseline": "middle", "dx": 10, "fontSize": 11, "fontWeight": 600 },
          "encoding": {
            "x": STRESS_X,
            "y": { "field": "change_vs_none_pct", "type": "quantitative" },
            "color": STRESS_COLOUR,
            "text": { "field": "end_label", "type": "nominal" }
          }
        }
      ]
    }
  ],
  "spacing": 36,
  "resolve": { "legend": { "color": "shared" } },
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-stress', spec_chart_stress, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-stress:', error));
