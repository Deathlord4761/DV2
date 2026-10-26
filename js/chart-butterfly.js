// Average weekly household spending: Greater capital city vs Rest of state – butterfly chart.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data: data/weekly_spending_city_vs_rest_2015_16.csv (one row per category per area)
//   rank, category, category_short, area, weekly_spend ($ per week), gap_dollars, gap_pct
//   gap_dollars = capital − rest of state;  gap_pct = gap_dollars / rest of state × 100
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16 (Graph 2).
// Notes from source: capital city estimates for the ACT relate to total ACT; Very Remote SA1s excluded
// (about 22% of the NT population).

const BUTTERFLY_DATA = {
  "url": "data/weekly_spending_city_vs_rest_2015_16.csv",
  "format": {
    "type": "csv",
    "parse": { "rank": "number", "weekly_spend": "number", "gap_dollars": "number", "gap_pct": "number" }
  }
};

const BUTTERFLY_Y = {
  "field": "category_short",
  "type": "nominal",
  "sort": { "field": "rank", "op": "min", "order": "ascending" },
  "axis": null
};

// Same x scale on both sides so bar lengths are directly comparable.
const BUTTERFLY_X_DOMAIN = [0, 370];
const BUTTERFLY_SIDE_WIDTH = 170;
const BUTTERFLY_ROW = { "step": 24 };

const BUTTERFLY_TOOLTIP = [
  { "field": "category", "type": "nominal", "title": "Category" },
  { "field": "area", "type": "nominal", "title": "Area" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend", "format": "$,.2f" },
  { "field": "gap_dollars", "type": "quantitative", "title": "Capital city minus rest of state", "format": "+$,.2f" },
  { "field": "gap_pct", "type": "quantitative", "title": "Capital city vs rest of state (%)", "format": "+.1f" }
];

// One side of the butterfly. side: "left" (bars grow leftwards) | "right"
function butterflySide(area, colour, side) {
  const isLeft = side === "left";
  return {
    "width": BUTTERFLY_SIDE_WIDTH,
    "height": BUTTERFLY_ROW,
    "title": {
      "text": area,
      "fontSize": 12,
      "fontWeight": 600,
      "color": colour,
      "anchor": isLeft ? "end" : "start"
    },
    "transform": [{ "filter": "datum.area === '" + area + "'" }],
    "encoding": {
      "y": BUTTERFLY_Y,
      "x": {
        "field": "weekly_spend",
        "type": "quantitative",
        "scale": { "domain": BUTTERFLY_X_DOMAIN, "reverse": isLeft, "nice": false },
        "title": "$ per week",
        "axis": {
          "values": [0, 100, 200, 300],
          "format": "$,.0f",
          "grid": true,
          "gridColor": "#e3e8e8",
          "domain": false,
          "ticks": false,
          "labelFontSize": 10,
          "titleFontSize": 10,
          "titleFontWeight": 500,
          "titleColor": "#5b6b66"
        }
      },
      "tooltip": BUTTERFLY_TOOLTIP
    },
    "layer": [
      {
        "mark": {
          "type": "bar",
          "color": colour,
          "height": { "band": 0.72 },
          "cornerRadiusTopLeft": isLeft ? 2 : 0,
          "cornerRadiusBottomLeft": isLeft ? 2 : 0,
          "cornerRadiusTopRight": isLeft ? 0 : 2,
          "cornerRadiusBottomRight": isLeft ? 0 : 2
        }
      },
      {
        "mark": {
          "type": "text",
          "align": isLeft ? "right" : "left",
          "baseline": "middle",
          "dx": isLeft ? -4 : 4,
          "fontSize": 10,
          "color": "#1b2a2e"
        },
        "encoding": {
          "text": { "field": "weekly_spend", "type": "quantitative", "format": "$,.0f" }
        }
      }
    ]
  };
}

const spec_chart_butterfly = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": BUTTERFLY_DATA,
  "hconcat": [
    butterflySide("Greater capital city", "#2b7a78", "left"),
    // Centre column: category labels.
    {
      "width": 140,
      "height": BUTTERFLY_ROW,
      "transform": [{ "filter": "datum.area === 'Greater capital city'" }],
      "mark": { "type": "text", "align": "center", "baseline": "middle", "fontSize": 11, "color": "#1b2a2e" },
      "encoding": {
        "y": BUTTERFLY_Y,
        "text": { "field": "category_short", "type": "nominal" },
        "fontWeight": {
          "condition": { "test": "datum.gap_dollars < 0", "value": 700 },
          "value": 500
        },
        "tooltip": BUTTERFLY_TOOLTIP
      }
    },
    butterflySide("Rest of state", "#d17a36", "right")
  ],
  "spacing": 0,
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans",
    "concat": { "spacing": 0 }
  }
};

vegaEmbed('#chart-butterfly', spec_chart_butterfly, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-butterfly:', error));
