// Monthly change in household spending by state – choropleth map.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart). The small heading inside the
// chart shows the month currently selected.
const spec_map_1a = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "autosize": { "type": "fit-x", "contains": "padding" },
  "height": 340,
  "params": [
    {
      "name": "month",
      "value": "2026-07-01",
      "bind": {
        "input": "select",
        "options": [
          "2026-05-01",
          "2026-06-01",
          "2026-07-01",
          "2026-08-01"
        ],
        "labels": [
          "May 2026",
          "Jun 2026",
          "Jul 2026",
          "Aug 2026"
        ],
        "name": "Month: "
      }
    }
  ],
  "title": {
    "text": {
      "expr": "{'2026-05-01':'May 2026', '2026-06-01':'Jun 2026','2026-07-01':'Jul 2026','2026-08-01':'Aug 2026'}[month]"
    },
    "anchor": "start",
    "fontSize": 13,
    "fontWeight": 600,
    "color": "#1b2a2e"
  },
  "projection": {
    "type": "mercator"
  },
  "layer": [
    {
      "data": {
        "url": "data/australia-states.topojson",
        "format": {
          "type": "topojson",
          "feature": "states"
        }
      },
      "mark": {
        "type": "geoshape",
        "fill": "#e3e8e8",
        "stroke": "#ffffff",
        "strokeWidth": 1
      }
    },
    {
      "data": {
        "url": "data/state_spending_monthly_updated.csv",
        "format": {
          "type": "csv",
          "parse": {
            "change_pct": "number"
          }
        }
      },
      "transform": [
        {
          "filter": "datum.date === month"
        },
        {
          "lookup": "state",
          "from": {
            "data": {
              "url": "data/australia-states.topojson",
              "format": {
                "type": "topojson",
                "feature": "states"
              }
            },
            "key": "properties.STATE_NAME"
          },
          "as": "geo"
        }
      ],
      "mark": {
        "type": "geoshape",
        "stroke": "#ffffff",
        "strokeWidth": 1
      },
      "encoding": {
        "shape": {
          "field": "geo",
          "type": "geojson"
        },
        "color": {
          "field": "change_pct",
          "type": "quantitative",
          "scale": {
            "domain": [
              -2.5,
              0,
              2.5
            ],
            "range": [
              "#c0562b",
              "#f6efe7",
              "#0f5c63"
            ],
            "clamp": true
          },
          "legend": {
            "title": "Monthly change (%)",
            "orient": "bottom",
            "direction": "horizontal",
            "gradientLength": 200,
            "format": "+.1f",
            "values": [
              -2,
              -1,
              0,
              1,
              2
            ]
          }
        },
        "tooltip": [
          {
            "field": "state",
            "type": "nominal",
            "title": "State"
          },
          {
            "field": "change_pct",
            "type": "quantitative",
            "title": "Change (%)",
            "format": "+.1f"
          }
        ]
      }
    },
    {
      "data": {
        "url": "data/state_spending_monthly_updated.csv",
        "format": {
          "type": "csv",
          "parse": {
            "change_pct": "number"
          }
        }
      },
      "transform": [
        {
          "filter": "datum.date === month"
        },
        {
          "lookup": "state",
          "from": {
            "data": {
              "values": [
                {
                  "state": "New South Wales",
                  "lon": 146.9,
                  "lat": -32.6
                },
                {
                  "state": "Victoria",
                  "lon": 143.6,
                  "lat": -36.9
                },
                {
                  "state": "Queensland",
                  "lon": 144.5,
                  "lat": -22.5
                },
                {
                  "state": "South Australia",
                  "lon": 135.2,
                  "lat": -30.2
                },
                {
                  "state": "Western Australia",
                  "lon": 122.2,
                  "lat": -25.8
                },
                {
                  "state": "Tasmania",
                  "lon": 146.6,
                  "lat": -42.1
                },
                {
                  "state": "Northern Territory",
                  "lon": 133.4,
                  "lat": -19.4
                },
                {
                  "state": "Australian Capital Territory",
                  "lon": 152.0,
                  "lat": -35.4
                }
              ]
            },
            "key": "state",
            "fields": [
              "lon",
              "lat"
            ]
          }
        },
        {
          "calculate": "datum.code + ' ' + format(datum.change_pct, '+.1f')",
          "as": "label"
        }
      ],
      "mark": {
        "type": "text",
        "fontSize": 11,
        "fontWeight": 600
      },
      "encoding": {
        "longitude": {
          "field": "lon",
          "type": "quantitative"
        },
        "latitude": {
          "field": "lat",
          "type": "quantitative"
        },
        "text": {
          "field": "label",
          "type": "nominal"
        },
        "color": {
          "condition": {
            "test": "abs(datum.change_pct) > 1.6",
            "value": "#ffffff"
          },
          "value": "#1b2a2e"
        }
      }
    }
  ],
  "config": {
    "view": {
      "stroke": null
    },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-map-1a', spec_map_1a, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render map-1a:', error));
