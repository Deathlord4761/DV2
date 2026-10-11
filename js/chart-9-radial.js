// Radial composition chart. Replace illustrative budget shares with a source-backed category breakdown.
const spec_chart_9_radial = {
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
  "height": 250,
  "data": {
    "url": "data/budget_composition_ILLUSTRATIVE.csv"
  },
  "mark": {
    "type": "arc",
    "innerRadius": 55,
    "outerRadius": 105,
    "stroke": "#ffffff",
    "strokeWidth": 2
  },
  "encoding": {
    "theta": {
      "field": "share_pct",
      "type": "quantitative",
      "stack": true
    },
    "color": {
      "field": "category",
      "type": "nominal",
      "title": null,
      "scale": {
        "scheme": "tableau10"
      }
    },
    "tooltip": [
      {
        "field": "category"
      },
      {
        "field": "share_pct",
        "title": "Illustrative share (%)"
      }
    ]
  }
};

vegaEmbed('#chart-radial', spec_chart_9_radial, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-radial:', error));
