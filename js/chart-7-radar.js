// Radar-style polar chart. The index data is illustrative and not official.
const spec_chart_7_radar = {
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
    "url": "data/age_group_profile_ILLUSTRATIVE.csv"
  },
  "transform": [
    {
      "filter": "datum.age_group === '18–24' || datum.age_group === '35–44' || datum.age_group === '65+'"
    },
    {
      "window": [
        {
          "op": "row_number",
          "as": "order"
        }
      ],
      "sort": [
        {
          "field": "category",
          "order": "ascending"
        }
      ],
      "groupby": [
        "age_group"
      ]
    }
  ],
  "mark": {
    "type": "line",
    "point": {
      "filled": true,
      "size": 45
    },
    "strokeWidth": 2
  },
  "encoding": {
    "theta": {
      "field": "order",
      "type": "quantitative",
      "scale": {
        "domain": [
          1,
          6
        ]
      },
      "axis": null
    },
    "radius": {
      "field": "spending_index_1_to_5",
      "type": "quantitative",
      "scale": {
        "domain": [
          0,
          5
        ]
      },
      "axis": {
        "grid": true,
        "tickCount": 5
      }
    },
    "color": {
      "field": "age_group",
      "type": "nominal",
      "title": "Age group",
      "scale": {
        "range": [
          "#bf5d42",
          "#527f78",
          "#d2a24c"
        ]
      }
    },
    "detail": {
      "field": "age_group"
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
        "title": "Index"
      }
    ]
  }
};

vegaEmbed('#chart-radar', spec_chart_7_radar, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-radar:', error));
