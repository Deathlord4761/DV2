// Slope chart. Data is illustrative and must be replaced with a sourced dataset.
const spec_chart_4_slope = {
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
  "height": 230,
  "data": {
    "url": "data/regional_category_spending_ILLUSTRATIVE.csv"
  },
  "transform": [
    {
      "filter": "datum.category === 'Food' || datum.category === 'Transport' || datum.category === 'Housing' || datum.category === 'Health'"
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
    "x": {
      "field": "area_type",
      "type": "ordinal",
      "title": null,
      "sort": [
        "Inner",
        "Outer",
        "Regional"
      ]
    },
    "y": {
      "field": "monthly_spend_aud",
      "type": "quantitative",
      "title": "Monthly spend (AUD)"
    },
    "color": {
      "field": "category",
      "type": "nominal",
      "title": "Category",
      "scale": {
        "scheme": "tableau10"
      }
    },
    "detail": {
      "field": "category"
    },
    "tooltip": [
      {
        "field": "region"
      },
      {
        "field": "category"
      },
      {
        "field": "monthly_spend_aud",
        "title": "Monthly spend (AUD)"
      }
    ]
  }
};

vegaEmbed('#chart-slope', spec_chart_4_slope, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-slope:', error));
