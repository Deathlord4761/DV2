// Grouped bar chart. Data is illustrative; replace with sourced age cohort data.
const spec_chart_6_age_bars = {
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
    "url": "data/age_group_profile_ILLUSTRATIVE.csv"
  },
  "transform": [
    {
      "filter": "datum.category === 'Food' || datum.category === 'Housing' || datum.category === 'Transport'"
    }
  ],
  "mark": {
    "type": "bar",
    "cornerRadiusEnd": 3
  },
  "encoding": {
    "x": {
      "field": "age_group",
      "type": "ordinal",
      "title": null,
      "axis": {
        "labelAngle": -35
      }
    },
    "xOffset": {
      "field": "category"
    },
    "y": {
      "field": "spending_index_1_to_5",
      "type": "quantitative",
      "title": "Illustrative index (1–5)",
      "scale": {
        "domain": [
          0,
          5
        ]
      }
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
        "field": "age_group"
      },
      {
        "field": "category"
      },
      {
        "field": "spending_index_1_to_5",
        "title": "Index",
        "format": ".1f"
      }
    ]
  }
};

vegaEmbed('#chart-age-bars', spec_chart_6_age_bars, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-age-bars:', error));
