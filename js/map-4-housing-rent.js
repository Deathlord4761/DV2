// Housing chart scaffold. This is a ranked symbol comparison, not a geographic map until coordinates are added.
const spec_map_4_housing_rent = {
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
    "url": "data/victoria_rent_ILLUSTRATIVE.csv"
  },
  "mark": {
    "type": "circle",
    "filled": true,
    "opacity": 0.82,
    "stroke": "#ffffff",
    "strokeWidth": 1
  },
  "encoding": {
    "x": {
      "field": "median_weekly_rent_aud",
      "type": "quantitative",
      "title": "Median weekly rent (AUD)"
    },
    "y": {
      "field": "region",
      "type": "ordinal",
      "title": null,
      "sort": "-x"
    },
    "size": {
      "field": "median_weekly_rent_aud",
      "type": "quantitative",
      "title": "Rent"
    },
    "color": {
      "field": "area_type",
      "type": "nominal",
      "title": "Area type",
      "scale": {
        "range": [
          "#bf5d42",
          "#d2a24c",
          "#527f78"
        ]
      }
    },
    "tooltip": [
      {
        "field": "region"
      },
      {
        "field": "area_type"
      },
      {
        "field": "median_weekly_rent_aud",
        "title": "Weekly rent (AUD)"
      }
    ]
  }
};

vegaEmbed('#chart-housing-map', spec_map_4_housing_rent, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-housing-map:', error));
