// Proportional-symbol map scaffold. Replace illustrative suburb coordinates and values.
const spec_map_3_proportional_symbol = {
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
  "height": 260,
  "data": {
    "url": "data/victoria_suburb_spending_ILLUSTRATIVE.csv"
  },
  "mark": {
    "type": "circle",
    "opacity": 0.78,
    "stroke": "#ffffff",
    "strokeWidth": 1
  },
  "encoding": {
    "longitude": {
      "field": "longitude",
      "type": "quantitative"
    },
    "latitude": {
      "field": "latitude",
      "type": "quantitative"
    },
    "size": {
      "field": "spending_aud",
      "type": "quantitative",
      "title": "Spending (AUD)",
      "scale": {
        "range": [
          40,
          700
        ]
      }
    },
    "color": {
      "field": "category",
      "type": "nominal",
      "title": "Category",
      "scale": {
        "scheme": "tableau10"
      }
    },
    "tooltip": [
      {
        "field": "suburb"
      },
      {
        "field": "category"
      },
      {
        "field": "spending_aud",
        "title": "Spending (AUD)"
      }
    ]
  },
  "projection": {
    "type": "mercator",
    "center": [
      145,
      -37.8
    ],
    "scale": 8000
  }
};

vegaEmbed('#chart-symbol-map', spec_map_3_proportional_symbol, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-symbol-map:', error));
