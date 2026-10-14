// Median weekly rent – proportional symbol maps (House vs Unit), Victoria by LGA.
// Keep the chart specification in this file so each visualization is modular.
//
// Every LGA in data/LGA_POLYGON.json is drawn. LGAs without a rent value stay blank.
// To add or update a region, edit rent_data below:
//   map_name   must match LGA_NAME in the TopoJSON exactly (upper case)
//   lon / lat  where the circle sits (polygon centroid of the LGA)
//   label_lon / label_lat  where the label sits; a leader line joins it to the circle
const rent_data = [
  { "region": "Hume City",      "short": "Hume",           "map_name": "HUME",            "housing": "Unit",  "rent": 450, "lon": 144.8246, "lat": -37.5892, "label_lon": 145.05, "label_lat": -36.95 },
  { "region": "Hume City",      "short": "Hume",           "map_name": "HUME",            "housing": "House", "rent": 500, "lon": 144.8246, "lat": -37.5892, "label_lon": 145.05, "label_lat": -36.95 },
  { "region": "City of Monash", "short": "Monash",         "map_name": "MONASH",          "housing": "Unit",  "rent": 553, "lon": 145.1440, "lat": -37.8971, "label_lon": 145.95, "label_lat": -38.55 },
  { "region": "City of Monash", "short": "Monash",         "map_name": "MONASH",          "housing": "House", "rent": 651, "lon": 145.1440, "lat": -37.8971, "label_lon": 145.95, "label_lat": -38.55 },
  { "region": "Geelong",        "short": "Geelong",        "map_name": "GREATER GEELONG", "housing": "Unit",  "rent": 430, "lon": 144.4229, "lat": -38.0723, "label_lon": 143.85, "label_lat": -38.75 },
  { "region": "Geelong",        "short": "Geelong",        "map_name": "GREATER GEELONG", "housing": "House", "rent": 520, "lon": 144.4229, "lat": -38.0723, "label_lon": 143.85, "label_lat": -38.75 },
  { "region": "East Gippsland", "short": "East Gippsland", "map_name": "EAST GIPPSLAND",  "housing": "Unit",  "rent": 380, "lon": 148.2917, "lat": -37.3780, "label_lon": 148.30, "label_lat": -36.75 },
  { "region": "East Gippsland", "short": "East Gippsland", "map_name": "EAST GIPPSLAND",  "housing": "House", "rent": 480, "lon": 148.2917, "lat": -37.3780, "label_lon": 148.30, "label_lat": -36.75 },
  { "region": "City of Melton", "short": "Melton",         "map_name": "MELTON",          "housing": "Unit",  "rent": 376, "lon": 144.6253, "lat": -37.6938, "label_lon": 143.75, "label_lat": -37.25 },
  { "region": "City of Melton", "short": "Melton",         "map_name": "MELTON",          "housing": "House", "rent": 459, "lon": 144.6253, "lat": -37.6938, "label_lon": 143.75, "label_lat": -37.25 }
];

// One map panel. Both panels share the same layers; only the dwelling type and colour change.
function rentMapPanel(housing, dataset, colour) {
  return {
    "title": {
      "text": housing === "House" ? "Houses" : "Units",
      "fontSize": 14,
      "fontWeight": 600,
      "color": colour,
      "anchor": "start"
    },
    "width": 430,
    "height": 320,
    "projection": { "type": "mercator" },
    "layer": [
      // 1. All LGAs. Regions with data get a light tint; regions without data stay blank.
      {
        "data": {
          "url": "data/LGA_POLYGON.json",
          "format": { "type": "topojson", "feature": "LGA_POLYGON" }
        },
        "transform": [
          {
            "lookup": "properties.LGA_NAME",
            "from": { "data": { "name": dataset }, "key": "map_name", "fields": ["rent"] }
          },
          {
            "calculate": "isValid(datum.rent) ? format(datum.rent, '$,.0f') : 'No data'",
            "as": "rent_label"
          }
        ],
        "mark": { "type": "geoshape", "strokeWidth": 0.6 },
        "encoding": {
          "fill": {
            "condition": { "test": "isValid(datum.rent)", "value": "#e3e9e5" },
            "value": "#ffffff"
          },
          "stroke": {
            "condition": { "test": "isValid(datum.rent)", "value": "#7c8983" },
            "value": "#c9d0cc"
          },
          "tooltip": [
            { "field": "properties.LGA_NAME", "type": "nominal", "title": "LGA" },
            { "field": "rent_label", "type": "nominal", "title": "Median rent / week" }
          ]
        }
      },
      // 2. Leader lines from each symbol to its label.
      {
        "data": { "name": dataset },
        "mark": { "type": "rule", "color": "#9aa6a1", "strokeWidth": 0.8 },
        "encoding": {
          "longitude": { "field": "lon", "type": "quantitative" },
          "latitude": { "field": "lat", "type": "quantitative" },
          "longitude2": { "field": "label_lon" },
          "latitude2": { "field": "label_lat" }
        }
      },
      // 3. Proportional symbols (area scales with rent). Larger circles drawn first.
      {
        "data": { "name": dataset },
        "mark": {
          "type": "circle",
          "color": colour,
          "opacity": 0.82,
          "stroke": "#ffffff",
          "strokeWidth": 1.5
        },
        "encoding": {
          "longitude": { "field": "lon", "type": "quantitative" },
          "latitude": { "field": "lat", "type": "quantitative" },
          "size": {
            "field": "rent",
            "type": "quantitative",
            "scale": { "domain": [350, 700], "range": [60, 900] },
            "legend": {
              "title": "Median weekly rent (AUD)",
              "format": "$,.0f",
              "values": [400, 500, 600, 700],
              "symbolFillColor": "#9aa6a1",
              "symbolStrokeColor": "#ffffff"
            }
          },
          "order": { "field": "rent", "sort": "descending" },
          "tooltip": [
            { "field": "region", "type": "nominal", "title": "Region" },
            { "field": "map_name", "type": "nominal", "title": "LGA name in map" },
            { "field": "housing", "type": "nominal", "title": "Dwelling type" },
            { "field": "rent", "type": "quantitative", "title": "Median rent / week", "format": "$,.0f" }
          ]
        }
      },
      // 4. Labels: region name + rent.
      {
        "data": { "name": dataset },
        "transform": [
          { "calculate": "datum.short + '\\n' + format(datum.rent, '$,.0f')", "as": "label" }
        ],
        "mark": {
          "type": "text",
          "fontSize": 10,
          "fontWeight": "bold",
          "color": "#27332f",
          "lineBreak": "\n",
          "align": "center",
          "baseline": "middle"
        },
        "encoding": {
          "longitude": { "field": "label_lon", "type": "quantitative" },
          "latitude": { "field": "label_lat", "type": "quantitative" },
          "text": { "field": "label", "type": "nominal" }
        }
      }
    ]
  };
}

const spec_map_rent = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Median weekly rent by selected Victorian region",
    "subtitle": "Houses vs units · December 2024 · AUD per week · blank LGAs have no data"
  },
  "datasets": {
    "rent_house": rent_data.filter(d => d.housing === "House"),
    "rent_unit": rent_data.filter(d => d.housing === "Unit")
  },
  "hconcat": [
    rentMapPanel("House", "rent_house", "#d17a36"),
    rentMapPanel("Unit", "rent_unit", "#2b7a78")
  ],
  "spacing": 24,
  // Same size scale on both maps so circles are directly comparable.
  "resolve": { "scale": { "size": "shared" }, "legend": { "size": "shared" } },
  "config": {
    "background": "#ffffff",
    "view": { "stroke": null },
    "axis": { "grid": false },
    "legend": {
      "orient": "bottom",
      "direction": "horizontal",
      "labelFontSize": 11,
      "titleFontSize": 12
    },
    "title": {
      "font": "DM Sans",
      "fontSize": 19,
      "subtitleFontSize": 12,
      "anchor": "start"
    }
  }
};

vegaEmbed('#chart-map-rent', spec_map_rent, {
  actions: false,
  renderer: 'svg'
}).catch(error => console.error('Could not render rent map:', error));
