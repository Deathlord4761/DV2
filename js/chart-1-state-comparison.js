// Fallback state comparison chart based on published ABS monthly changes.
const spec_chart_1_state_comparison = {
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
    "step": 27
  },
  "data": {
    "url": "data/abs_state_monthly_change.csv"
  },
  "mark": {
    "type": "bar",
    "cornerRadiusEnd": 3
  },
  "encoding": {
    "y": {
      "field": "state",
      "type": "ordinal",
      "title": null,
      "sort": "-x",
      "axis": {
        "labelLimit": 190
      }
    },
    "x": {
      "field": "July_2026_pct",
      "type": "quantitative",
      "title": "July 2026 change (%)",
      "scale": {
        "zero": false
      }
    },
    "color": {
      "field": "July_2026_pct",
      "type": "quantitative",
      "title": "Change (%)",
      "scale": {
        "scheme": "redblue",
        "domainMid": 0,
        "reverse": true
      }
    },
    "tooltip": [
      {
        "field": "state"
      },
      {
        "field": "July_2026_pct",
        "title": "July 2026 change (%)",
        "format": "+.1f"
      }
    ]
  }
};

vegaEmbed('#chart-state-comparison', spec_chart_1_state_comparison, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-state-comparison:', error));
