// Household spending by category: August 2016 vs August 2026 – slope chart.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data: data/category_change_2016_2026.csv
//   category, breakdown, date, spending_m (monthly spending, $ million, current prices), change_pct_10y
//   change_pct_10y = (Aug 2026 − Aug 2016) / Aug 2016 × 100
// Source: ABS Monthly Household Spending Indicator, Australia.
// Goods + Services = Total and Discretionary + Non-discretionary = Total, so the two pairs are
// drawn with different line styles (solid / dashed) and Total as a thick dark reference line.
const spec_chart_slope = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "autosize": { "type": "fit-x", "contains": "padding" },
  "height": 420,
  "data": {
    "url": "data/category_change_2016_2026.csv",
    "format": {
      "type": "csv",
      "parse": { "date": "date", "spending_m": "number", "change_pct_10y": "number" }
    }
  },
  "transform": [
    { "calculate": "year(datum.date)", "as": "year" },
    { "calculate": "datum.spending_m / 1000", "as": "spending_b" },
    { "calculate": "datum.category === 'Total'", "as": "is_total" }
  ],
  "encoding": {
    "x": {
      "field": "year",
      "type": "quantitative",
      // Extra room either side of 2016 and 2026 for the labels.
      "scale": { "domain": [2007.6, 2031.4], "nice": false, "zero": false },
      "title": null,
      "axis": {
        "values": [2016, 2026],
        "labelExpr": "'Aug ' + datum.value",
        "labelFontSize": 12,
        "labelFontWeight": 600,
        "labelColor": "#1b2a2e",
        "orient": "top",
        "domain": false,
        "ticks": false,
        "grid": true,
        "gridColor": "#d6dcd9",
        "gridDash": [2, 3]
      }
    },
    "y": {
      "field": "spending_b",
      "type": "quantitative",
      "scale": { "domain": [15, 88], "nice": false, "zero": false },
      "axis": null
    },
    "color": {
      "field": "category",
      "type": "nominal",
      "scale": {
        "domain": ["Total", "Goods", "Services", "Discretionary", "Non-discretionary"],
        "range": ["#111111", "#2f4b7c", "#8fa3bf", "#2f4b7c", "#8fa3bf"]
      },
      "legend": null
    },
    "tooltip": [
      { "field": "category", "type": "nominal", "title": "Category" },
      { "field": "date", "type": "temporal", "title": "Month", "format": "%b %Y" },
      { "field": "spending_b", "type": "quantitative", "title": "Monthly spending ($b)", "format": "$,.1f" },
      { "field": "change_pct_10y", "type": "quantitative", "title": "Change since Aug 2016 (%)", "format": "+.1f" }
    ]
  },
  "layer": [
    // 1. Slope lines.
    {
      "mark": { "type": "line", "strokeCap": "round" },
      "encoding": {
        "detail": { "field": "category" },
        "strokeDash": {
          "field": "breakdown",
          "type": "nominal",
          "scale": {
            "domain": ["Total", "Goods vs services", "Discretionary vs non-discretionary"],
            "range": [[1, 0], [1, 0], [5, 3]]
          },
          "legend": {
            "title": null,
            "orient": "bottom",
            "direction": "horizontal",
            "labelFontSize": 11,
            "symbolStrokeColor": "#5b6b66",
            "values": ["Goods vs services", "Discretionary vs non-discretionary"],
            "labelLimit": 320
          }
        },
        "strokeWidth": {
          "condition": { "test": "datum.is_total", "value": 3.5 },
          "value": 2
        }
      }
    },
    // 2. End points.
    {
      "mark": { "type": "circle", "opacity": 1, "stroke": "#ffffff", "strokeWidth": 1.5 },
      "encoding": {
        "size": {
          "condition": { "test": "datum.is_total", "value": 110 },
          "value": 70
        }
      }
    },
    // 3. Left labels: category and Aug 2016 value.
    {
      "transform": [
        { "filter": "datum.year === 2016" },
        { "calculate": "datum.category + '  ' + format(datum.spending_b, '$,.1f') + 'b'", "as": "label" }
      ],
      "mark": { "type": "text", "align": "right", "baseline": "middle", "dx": -9, "fontSize": 11 },
      "encoding": {
        "text": { "field": "label", "type": "nominal" },
        "fontWeight": {
          "condition": { "test": "datum.is_total", "value": 700 },
          "value": 500
        }
      }
    },
    // 4. Right labels: Aug 2026 value and 10-year change.
    {
      "transform": [
        { "filter": "datum.year === 2026" },
        {
          "calculate": "format(datum.spending_b, '$,.1f') + 'b  ' + format(datum.change_pct_10y, '+.1f') + '%'",
          "as": "label"
        }
      ],
      "mark": { "type": "text", "align": "left", "baseline": "middle", "dx": 9, "fontSize": 11 },
      "encoding": {
        "text": { "field": "label", "type": "nominal" },
        "fontWeight": {
          "condition": { "test": "datum.is_total", "value": 700 },
          "value": 500
        }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-slope', spec_chart_slope, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-slope:', error));
