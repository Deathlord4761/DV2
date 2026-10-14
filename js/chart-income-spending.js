// Disposable income vs spending by state – connected dot plot (dumbbell).
// Keep the chart specification in this file so each visualization is modular.
//
// Data: data/income_vs_spending_by_state_2015_16.csv (one row per state/territory + Australia)
//   state, state_name, level (State/territory | National), disposable_income ($/week),
//   spending ($/week on goods & services), left_over (income − spending), spending_pct_income, note
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16 (Graph 1).
// NT excludes very remote areas (about 22% of the NT population).
//
// How it reads: the teal dot is weekly disposable income, the orange dot is weekly spending on
// goods and services. The bar between them is what is left over each week. States are sorted by
// income; Australia is shown last as the reference row.

const INCOME_TOOLTIP = [
  { "field": "state_name", "type": "nominal", "title": "State / territory" },
  { "field": "disposable_income", "type": "quantitative", "title": "Disposable income / week", "format": "$,.0f" },
  { "field": "spending", "type": "quantitative", "title": "Spending on goods & services / week", "format": "$,.0f" },
  { "field": "left_over", "type": "quantitative", "title": "Left over / week", "format": "$,.0f" },
  { "field": "spending_pct_income", "type": "quantitative", "title": "Spending as % of income", "format": ".1f" },
  { "field": "note", "type": "nominal", "title": "Note" }
];

const spec_chart_income_spending = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "What's left after the weekly spend",
    "subtitle": "Average weekly household disposable income vs spending on goods and services, 2015-16",
    "anchor": "start",
    "fontSize": 15,
    "fontWeight": 600,
    "color": "#1b2a2e",
    "subtitleFontSize": 11,
    "subtitleColor": "#5b6b66"
  },
  "width": "container",
  "height": { "step": 36 },
  "data": {
    "url": "data/income_vs_spending_by_state_2015_16.csv",
    "format": {
      "type": "csv",
      "parse": {
        "disposable_income": "number", "spending": "number",
        "left_over": "number", "spending_pct_income": "number"
      }
    }
  },
  "transform": [
    // States sorted by income (highest first); Australia always last.
    { "calculate": "datum.level === 'National' ? -1 : datum.disposable_income", "as": "sort_key" },
    { "calculate": "(datum.disposable_income + datum.spending) / 2", "as": "mid" }
  ],
  "encoding": {
    "y": {
      "field": "state",
      "type": "nominal",
      "sort": { "field": "sort_key", "order": "descending" },
      "title": null,
      "axis": {
        "domain": false,
        "ticks": false,
        "labelFontSize": 12,
        "labelPadding": 8,
        "labelColor": "#1b2a2e",
        "labelFontWeight": { "condition": { "test": "datum.value === 'Aust'", "value": 700 }, "value": 500 }
      }
    }
  },
  "layer": [
    // 1. Bar between the two dots = money left over.
    {
      "mark": { "type": "rule", "strokeWidth": 7, "strokeCap": "round", "color": "#dfe5e2" },
      "encoding": {
        "x": {
          "field": "spending",
          "type": "quantitative",
          "scale": { "domain": [1000, 2320], "nice": false },
          "title": "$ per week",
          "axis": {
            "format": "$,.0f",
            "values": [1000, 1200, 1400, 1600, 1800, 2000, 2200],
            "grid": true,
            "gridColor": "#eef1f0",
            "domain": false,
            "ticks": false,
            "labelFontSize": 10,
            "titleFontSize": 11,
            "titleFontWeight": 500,
            "titleColor": "#5b6b66"
          }
        },
        "x2": { "field": "disposable_income" },
        "tooltip": INCOME_TOOLTIP
      }
    },
    // 2. "Left over" label above the bar.
    {
      "mark": { "type": "text", "dy": -11, "fontSize": 10, "color": "#5b6b66" },
      "encoding": {
        "x": { "field": "mid", "type": "quantitative" },
        "text": { "field": "left_over", "type": "quantitative", "format": "$,.0f" },
        "fontWeight": { "condition": { "test": "datum.level === 'National'", "value": 700 }, "value": 400 }
      }
    },
    // 3. The two dots: income and spending.
    {
      "transform": [
        { "fold": ["disposable_income", "spending"], "as": ["measure_key", "amount"] },
        {
          "calculate": "datum.measure_key === 'disposable_income' ? 'Disposable income' : 'Spending on goods & services'",
          "as": "measure"
        }
      ],
      "mark": { "type": "circle", "size": 130, "opacity": 1, "stroke": "#ffffff", "strokeWidth": 1.5 },
      "encoding": {
        "x": { "field": "amount", "type": "quantitative" },
        "color": {
          "field": "measure",
          "type": "nominal",
          "scale": {
            "domain": ["Disposable income", "Spending on goods & services"],
            "range": ["#2b7a78", "#d17a36"]
          },
          "legend": {
            "title": null,
            "orient": "top",
            "direction": "horizontal",
            "labelFontSize": 11,
            "symbolStrokeColor": "#ffffff"
          }
        },
        "tooltip": INCOME_TOOLTIP
      }
    },
    // 4. Share of income spent, to the right of the income dot.
    {
      "transform": [{ "calculate": "format(datum.spending_pct_income, '.0f') + '% spent'", "as": "pct_label" }],
      "mark": { "type": "text", "align": "left", "baseline": "middle", "dx": 11, "fontSize": 10, "color": "#1b2a2e" },
      "encoding": {
        "x": { "field": "disposable_income", "type": "quantitative" },
        "text": { "field": "pct_label", "type": "nominal" },
        "fontWeight": { "condition": { "test": "datum.level === 'National'", "value": 700 }, "value": 400 }
      }
    }
  ],
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-income-spending', spec_chart_income_spending, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-income-spending:', error));
