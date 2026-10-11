// Connected dot plot using published ABS national category changes (May and July 2026).
const spec_chart_3_connected_dot = {
  "config": {
    "view": {
      "stroke": null
    },
    "axis": {
      "labelFont": "DM Sans",
      "titleFont": "DM Sans",
      "labelColor": "#52616b",
      "titleColor": "#25343b",
      "gridColor": "#e9eeec"
    },
    "legend": {
      "labelFont": "DM Sans",
      "titleFont": "DM Sans",
      "labelColor": "#52616b"
    }
  },
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": {
    "step": 26
  },
  "data": {
    "url": "data/abs_category_monthly_change.csv"
  },
  "transform": [
    {
      "filter": "datum.category !== 'Total'"
    },
    {
      "fold": [
        "May_2026_pct",
        "July_2026_pct"
      ],
      "as": [
        "period",
        "change_pct"
      ]
    },
    {
      "calculate": "datum.period === 'May_2026_pct' ? 'May 2026' : 'July 2026'",
      "as": "period_label"
    }
  ],
  "mark": {
    "type": "line",
    "point": {
      "filled": true,
      "size": 65
    },
    "strokeWidth": 2
  },
  "encoding": {
    "y": {
      "field": "category",
      "type": "ordinal",
      "title": null,
      "sort": "-x",
      "axis": {
        "labelLimit": 190
      }
    },
    "x": {
      "field": "change_pct",
      "type": "quantitative",
      "title": "Monthly change (%)",
      "scale": {
        "zero": false
      }
    },
    "detail": {
      "field": "category"
    },
    "color": {
      "field": "period_label",
      "type": "nominal",
      "title": "Period",
      "scale": {
        "domain": [
          "May 2026",
          "July 2026"
        ],
        "range": [
          "#9fb5b0",
          "#bf5d42"
        ]
      }
    },
    "tooltip": [
      {
        "field": "category"
      },
      {
        "field": "period_label",
        "title": "Period"
      },
      {
        "field": "change_pct",
        "title": "Change (%)",
        "format": "+.1f"
      }
    ]
  }
};

vegaEmbed('#chart-connected-dot', spec_chart_3_connected_dot, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-connected-dot:', error));
