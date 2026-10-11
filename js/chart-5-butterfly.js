// Butterfly chart. Data is illustrative and must be replaced with a sourced dataset.
const spec_chart_5_butterfly = {
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
    "step": 28
  },
  "data": {
    "url": "data/regional_category_spending_ILLUSTRATIVE.csv"
  },
  "transform": [
    {
      "filter": "datum.area_type === 'Inner' || datum.area_type === 'Regional'"
    },
    {
      "aggregate": [
        {
          "op": "mean",
          "field": "monthly_spend_aud",
          "as": "spend"
        }
      ],
      "groupby": [
        "category",
        "area_type"
      ]
    },
    {
      "calculate": "datum.area_type === 'Inner' ? -datum.spend : datum.spend",
      "as": "signed_spend"
    }
  ],
  "mark": {
    "type": "bar",
    "cornerRadius": 2
  },
  "encoding": {
    "y": {
      "field": "category",
      "type": "ordinal",
      "title": null,
      "sort": "-x"
    },
    "x": {
      "field": "signed_spend",
      "type": "quantitative",
      "title": "Inner ← Monthly spend (AUD) → Regional",
      "axis": {
        "labelExpr": "abs(datum.value)"
      }
    },
    "color": {
      "field": "area_type",
      "type": "nominal",
      "title": null,
      "scale": {
        "domain": [
          "Inner",
          "Regional"
        ],
        "range": [
          "#bf5d42",
          "#527f78"
        ]
      }
    },
    "tooltip": [
      {
        "field": "category"
      },
      {
        "field": "area_type"
      },
      {
        "field": "spend",
        "title": "Monthly spend (AUD)"
      }
    ]
  }
};

vegaEmbed('#chart-butterfly', spec_chart_5_butterfly, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-butterfly:', error));
