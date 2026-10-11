// Connected scatter scaffold. Illustrative values; match region and time periods before interpreting.
const spec_chart_8_housing_spending = {
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
  "height": 270,
  "data": {
    "url": "data/housing_spending_time_ILLUSTRATIVE.csv"
  },
  "mark": {
    "type": "line",
    "point": {
      "filled": true,
      "size": 90
    },
    "strokeWidth": 2
  },
  "encoding": {
    "x": {
      "field": "median_weekly_rent_aud",
      "type": "quantitative",
      "title": "Median weekly rent (AUD)"
    },
    "y": {
      "field": "monthly_spend_aud",
      "type": "quantitative",
      "title": "Monthly expenditure (AUD)"
    },
    "color": {
      "field": "region",
      "type": "nominal",
      "title": "Region",
      "scale": {
        "scheme": "tableau10"
      }
    },
    "detail": {
      "field": "region"
    },
    "order": {
      "field": "year",
      "type": "ordinal"
    },
    "tooltip": [
      {
        "field": "region"
      },
      {
        "field": "year"
      },
      {
        "field": "median_weekly_rent_aud",
        "title": "Weekly rent (AUD)"
      },
      {
        "field": "monthly_spend_aud",
        "title": "Monthly spend (AUD)"
      }
    ]
  }
};

vegaEmbed('#chart-housing-scatter', spec_chart_8_housing_spending, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-housing-scatter:', error));
