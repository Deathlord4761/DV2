// Housing costs vs household spending over time – connected scatter plot.
// Keep the chart specification in this file so each visualization is modular.
//
// Data: data/housing_vs_spending_1984_2016.csv (one row per ABS Household Expenditure Survey)
//   survey, year_order, total_spend (average weekly goods & services spending, $),
//   housing_cost (average weekly current housing costs, selected dwelling, $),
//   housing_share_pct (housing_cost / total_spend × 100), other_spend (total_spend − housing_cost)
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, datacube 1
//   ("Household expenditure, 1984 to 2015-16"). Dollars are as published (not adjusted for inflation).
//
// How it reads
//   Each point is one survey. x = total weekly spending, y = weekly housing costs; the line joins the
//   surveys in time order. The dashed lines mark a constant share of spending going on housing
//   (10%, 15%, 20%, 25%): if the path climbs across them, housing is taking a bigger slice of the
//   budget over time, not just growing with everything else.

const HS_DATA = {
  "url": "data/housing_vs_spending_1984_2016.csv",
  "format": {
    "type": "csv",
    "parse": {
      "year_order": "number", "total_spend": "number", "housing_cost": "number",
      "housing_share_pct": "number", "other_spend": "number"
    }
  }
};

const HS_X_MAX = 1800, HS_Y_MAX = 320;
const HS_X = {
  "field": "total_spend",
  "type": "quantitative",
  "title": "Average weekly household spending on goods & services ($)",
  "scale": { "domain": [0, HS_X_MAX], "nice": false },
  "axis": { "format": "$,.0f", "values": [0, 400, 800, 1200, 1600], "grid": true, "gridColor": "#eef1f0", "domain": false, "ticks": false, "labelFontSize": 10, "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66" }
};
const HS_Y = {
  "field": "housing_cost",
  "type": "quantitative",
  "title": "Average weekly housing costs ($)",
  "scale": { "domain": [0, HS_Y_MAX], "nice": false },
  "axis": { "format": "$,.0f", "values": [0, 80, 160, 240, 320], "grid": true, "gridColor": "#eef1f0", "domain": false, "ticks": false, "labelFontSize": 10, "titleFontSize": 11, "titleFontWeight": 500, "titleColor": "#5b6b66" }
};

// Reference lines of constant housing share: housing = share × total.
const HS_SHARES = [10, 15, 20, 25].map(s => {
  const xEnd = Math.min(HS_X_MAX, HS_Y_MAX / (s / 100));
  return { "share": s, "x0": 0, "y0": 0, "x1": xEnd, "y1": xEnd * s / 100, "label": s + "% of spending" };
});

const HS_TOOLTIP = [
  { "field": "survey", "type": "nominal", "title": "Survey" },
  { "field": "total_spend", "type": "quantitative", "title": "Total weekly spending", "format": "$,.0f" },
  { "field": "housing_cost", "type": "quantitative", "title": "Weekly housing costs", "format": "$,.0f" },
  { "field": "housing_share_pct", "type": "quantitative", "title": "Housing share of spending (%)", "format": ".1f" }
];

const spec_chart_housing_scatter = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Housing is taking a bigger slice of a growing budget",
    "subtitle": "Average weekly housing costs vs total household spending, Australia, ABS surveys 1984 to 2015-16 (not adjusted for inflation)",
    "anchor": "start",
    "fontSize": 15,
    "fontWeight": 600,
    "color": "#1b2a2e",
    "subtitleFontSize": 11,
    "subtitleColor": "#5b6b66"
  },
  "width": "container",
  "height": 380,
  "layer": [
    // 1. Constant-share guide lines.
    {
      "data": { "values": HS_SHARES },
      "mark": { "type": "rule", "color": "#c9d3cf", "strokeDash": [4, 4], "strokeWidth": 1 },
      "encoding": {
        "x": { "field": "x0", "type": "quantitative", "scale": HS_X.scale },
        "y": { "field": "y0", "type": "quantitative", "scale": HS_Y.scale },
        "x2": { "field": "x1" },
        "y2": { "field": "y1" }
      }
    },
    {
      "data": { "values": HS_SHARES },
      "mark": { "type": "text", "align": "right", "baseline": "bottom", "dx": -4, "dy": -3, "fontSize": 10, "color": "#8a9792" },
      "encoding": {
        "x": { "field": "x1", "type": "quantitative" },
        "y": { "field": "y1", "type": "quantitative" },
        "text": { "field": "label", "type": "nominal" }
      }
    },
    // 2. Path joining the surveys in time order.
    {
      "data": HS_DATA,
      "mark": { "type": "line", "color": "#2b7a78", "strokeWidth": 2.5, "point": false },
      "encoding": {
        "x": HS_X,
        "y": HS_Y,
        "order": { "field": "year_order", "type": "quantitative" }
      }
    },
    // 3. One point per survey, coloured from light (oldest) to dark (newest).
    {
      "data": HS_DATA,
      "params": [{ "name": "hs_hover", "select": { "type": "point", "on": "pointerover", "clear": "pointerout" } }],
      "mark": { "type": "circle", "size": 110, "opacity": 1, "stroke": "#ffffff", "strokeWidth": 1.5 },
      "encoding": {
        "x": HS_X,
        "y": HS_Y,
        "color": {
          "field": "year_order",
          "type": "quantitative",
          "scale": { "range": ["#9fc9c4", "#0f5c63"] },
          "legend": null
        },
        "size": { "condition": { "param": "hs_hover", "empty": false, "value": 220 }, "value": 110 },
        "tooltip": HS_TOOLTIP
      }
    },
    // 4. Survey labels with the housing share. They alternate above-left / below-right of the
    //    rising path so the closely spaced 1988-89 to 1998-99 points don't collide.
    {
      "data": HS_DATA,
      "transform": [
        { "filter": "datum.year_order % 2 === 1" },
        { "calculate": "datum.survey + ' · ' + format(datum.housing_share_pct, '.0f') + '%'", "as": "point_label" }
      ],
      "mark": { "type": "text", "align": "right", "baseline": "bottom", "dx": -9, "dy": -6, "fontSize": 10.5, "fontWeight": 600, "color": "#1b2a2e" },
      "encoding": {
        "x": HS_X,
        "y": HS_Y,
        "text": { "field": "point_label", "type": "nominal" }
      }
    },
    {
      "data": HS_DATA,
      "transform": [
        { "filter": "datum.year_order % 2 === 0" },
        { "calculate": "datum.survey + ' · ' + format(datum.housing_share_pct, '.0f') + '%'", "as": "point_label" }
      ],
      "mark": { "type": "text", "align": "left", "baseline": "top", "dx": 9, "dy": 6, "fontSize": 10.5, "fontWeight": 600, "color": "#1b2a2e" },
      "encoding": {
        "x": HS_X,
        "y": HS_Y,
        "text": { "field": "point_label", "type": "nominal" }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-housing-scatter', spec_chart_housing_scatter, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-housing-scatter:', error));
