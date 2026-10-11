// Converted from your supplied Vega-Lite specification.
// Keep the chart specification in this file so each visualization is modular.
const spec_chart_2_heatmap = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": {
    "step": 34
  },
  "params": [
    {
      "name": "month",
      "value": "Aug 2026",
      "bind": {
        "input": "select",
        "options": [
          "Jul 2026",
          "Aug 2026"
        ],
        "name": "Month: "
      }
    }
  ],
  "data": {
    "url": "data/category_state_spending.csv",
    "format": {
      "type": "csv",
      "parse": {
        "change_pct": "number"
      }
    }
  },
  "transform": [
    {
      "filter": "datum.month === month"
    }
  ],
  "encoding": {
    "x": {
      "field": "state",
      "type": "ordinal",
      "sort": [
        "NSW",
        "Vic",
        "Qld",
        "SA",
        "WA",
        "Tas",
        "NT",
        "ACT"
      ],
      "title": null,
      "axis": {
        "orient": "top",
        "labelAngle": 0,
        "labelFontSize": 12,
        "domain": false,
        "ticks": false
      }
    },
    "y": {
      "field": "category",
      "type": "ordinal",
      "sort": [
        "Food",
        "Alcoholic beverages and tobacco",
        "Clothing and footwear",
        "Furnishings and household equipment",
        "Health",
        "Transport",
        "Recreation and culture",
        "Hotels, cafes and restaurants",
        "Miscellaneous goods and services",
        "Total"
      ],
      "title": null,
      "axis": {
        "labelLimit": 240,
        "labelFontSize": 12,
        "domain": false,
        "ticks": false
      }
    }
  },
  "layer": [
    {
      "mark": {
        "type": "rect",
        "stroke": "#ffffff",
        "strokeWidth": 2
      },
      "encoding": {
        "color": {
          "field": "change_pct",
          "type": "quantitative",
          "scale": {
            "domain": [
              -5,
              0,
              5
            ],
            "range": [
              "#c0562b",
              "#f6efe7",
              "#0f5c63"
            ],
            "clamp": true
          },
          "legend": {
            "title": "Monthly change (%)",
            "orient": "bottom",
            "direction": "horizontal",
            "gradientLength": 240,
            "format": "+.0f",
            "values": [
              -4,
              -2,
              0,
              2,
              4
            ]
          }
        },
        "tooltip": [
          {
            "field": "category",
            "type": "nominal",
            "title": "Category"
          },
          {
            "field": "state",
            "type": "nominal",
            "title": "State"
          },
          {
            "field": "month",
            "type": "nominal",
            "title": "Month"
          },
          {
            "field": "change_pct",
            "type": "quantitative",
            "title": "Change (%)",
            "format": "+.1f"
          }
        ]
      }
    },
    {
      "mark": {
        "type": "text",
        "fontSize": 11
      },
      "encoding": {
        "text": {
          "field": "change_pct",
          "type": "quantitative",
          "format": "+.1f"
        },
        "color": {
          "condition": {
            "test": "abs(datum.change_pct) > 3",
            "value": "#ffffff"
          },
          "value": "#1b2a2e"
        }
      }
    }
  ],
  "config": {
    "view": {
      "stroke": null
    }
  }
};

vegaEmbed('#chart-heatmap', spec_chart_2_heatmap, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-2-heatmap:', error));
