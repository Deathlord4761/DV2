// Median weekly rent – proportional symbol maps (House vs Unit), Victoria by LGA.
// Keep the chart specification in this file so each visualization is modular.
//
// No data is embedded here. Everything is joined on LGA_NAME (upper case, as in the TopoJSON):
//   data/LGA_POLYGON.json   – LGA boundaries (all 87 Victorian LGAs are drawn)
//   data/rent_by_lga.csv    – LGA_NAME, region, area, unit_rent, house_rent, period
//   data/LGA_CENTROIDS.csv  – LGA_NAME, lon, lat (circle position), label_lon, label_lat (label position)
// To add a region, add a row to rent_by_lga.csv. LGAs without a row (or with a blank value) stay blank.
// area = "Greater Melbourne" puts the region in the zoomed Melbourne map; anything else is labelled on the Victoria map.

const RENT_CSV = "data/rent_by_lga.csv";
const CENTROID_CSV = "data/LGA_CENTROIDS.csv";
const LGA_TOPOJSON = "data/LGA_POLYGON.json";

const RENT_FORMAT = { "type": "csv", "parse": { "unit_rent": "number", "house_rent": "number" } };
const CENTROID_FORMAT = { "type": "csv", "parse": { "lon": "number", "lat": "number", "label_lon": "number", "label_lat": "number" } };

// Extent of the Greater Melbourne zoom (also drawn as a dashed box on the Victoria map).
const METRO_BOX = { "west": 144.42, "east": 145.58, "north": -37.47, "south": -38.17 };

// One map panel.
//   housing: "House" | "Unit"   field: column in rent_by_lga.csv   view: "vic" | "metro"
function rentMapPanel(housing, field, colour, view) {
  const isMetro = view === "metro";

  // Which rent rows get a circle / a label in this view.
  const symbolFilter = isMetro
    ? "isValid(datum.rent) && datum.area === 'Greater Melbourne'"
    : "isValid(datum.rent)";
  const labelFilter = isMetro
    ? "isValid(datum.rent) && datum.area === 'Greater Melbourne'"
    : "isValid(datum.rent) && datum.area !== 'Greater Melbourne'";

  // Rent rows joined to their LGA centroid.
  const rentWithPositions = [
    { "calculate": "datum['" + field + "']", "as": "rent" },
    {
      "lookup": "LGA_NAME",
      "from": {
        "data": { "url": CENTROID_CSV, "format": CENTROID_FORMAT },
        "key": "LGA_NAME",
        "fields": ["lon", "lat", "label_lon", "label_lat"]
      }
    }
  ];

  const layers = [
    // 1. All LGAs. Regions with rent data get a light tint; regions without data stay blank.
    {
      "data": { "url": LGA_TOPOJSON, "format": { "type": "topojson", "feature": "LGA_POLYGON" } },
      "transform": [
        {
          "lookup": "properties.LGA_NAME",
          "from": {
            "data": { "url": RENT_CSV, "format": RENT_FORMAT },
            "key": "LGA_NAME",
            "fields": ["region", field]
          }
        },
        { "calculate": "datum['" + field + "']", "as": "rent" },
        {
          "calculate": "isValid(datum.rent) ? format(datum.rent, '$,.0f') : 'No data'",
          "as": "rent_label"
        }
      ],
      "mark": { "type": "geoshape", "strokeWidth": 0.6, "clip": true },
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
          { "field": "rent_label", "type": "nominal", "title": housing + " median rent / week" }
        ]
      }
    }
  ];

  // 2. Victoria view only: dashed box showing the Melbourne zoom extent.
  if (!isMetro) {
    layers.push({
      "data": {
        "values": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [METRO_BOX.west, METRO_BOX.north],
              [METRO_BOX.east, METRO_BOX.north],
              [METRO_BOX.east, METRO_BOX.south],
              [METRO_BOX.west, METRO_BOX.south],
              [METRO_BOX.west, METRO_BOX.north]
            ]]
          }
        },
        "format": { "type": "json" }
      },
      "mark": { "type": "geoshape", "fill": null, "stroke": "#27332f", "strokeWidth": 1, "strokeDash": [3, 2] }
    });
  }

  layers.push(
    // 3. Leader lines from each symbol to its label.
    {
      "data": { "url": RENT_CSV, "format": RENT_FORMAT },
      "transform": [...rentWithPositions, { "filter": labelFilter }],
      "mark": { "type": "rule", "color": "#9aa6a1", "strokeWidth": 0.8, "clip": true },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "longitude2": { "field": "label_lon" },
        "latitude2": { "field": "label_lat" }
      }
    },
    // 4. Proportional symbols (circle area scales with rent). Larger circles drawn first.
    {
      "data": { "url": RENT_CSV, "format": RENT_FORMAT },
      "transform": [...rentWithPositions, { "filter": symbolFilter }],
      "mark": {
        "type": "circle",
        "color": colour,
        "opacity": 0.82,
        "stroke": "#ffffff",
        "strokeWidth": 1.5,
        "clip": true
      },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "size": {
          "field": "rent",
          "type": "quantitative",
          "scale": { "domain": [350, 1200], "range": [40, 900] },
          "legend": {
            "title": "Median weekly rent (AUD)",
            "format": "$,.0f",
            "values": [400, 600, 800, 1000, 1200],
            "symbolFillColor": "#9aa6a1",
            "symbolStrokeColor": "#ffffff"
          }
        },
        "order": { "field": "rent", "sort": "descending" },
        "tooltip": [
          { "field": "region", "type": "nominal", "title": "Region" },
          { "field": "LGA_NAME", "type": "nominal", "title": "LGA name in map" },
          { "field": "area", "type": "nominal", "title": "Area" },
          { "field": "rent", "type": "quantitative", "title": housing + " median rent / week", "format": "$,.0f" },
          { "field": "period", "type": "nominal", "title": "Period" }
        ]
      }
    },
    // 5. Labels: region name + rent.
    {
      "data": { "url": RENT_CSV, "format": RENT_FORMAT },
      "transform": [
        ...rentWithPositions,
        { "filter": labelFilter },
        { "calculate": "datum.region + '\\n' + format(datum.rent, '$,.0f')", "as": "label" }
      ],
      "mark": {
        "type": "text",
        "fontSize": 10,
        "fontWeight": "bold",
        "color": "#27332f",
        "lineBreak": "\n",
        "align": "center",
        "baseline": "middle",
        "clip": true
      },
      "encoding": {
        "longitude": { "field": "label_lon", "type": "quantitative" },
        "latitude": { "field": "label_lat", "type": "quantitative" },
        "text": { "field": "label", "type": "nominal" }
      }
    }
  );

  const W = 430, H = 330;
  return {
    "title": {
      "text": (housing === "House" ? "Houses" : "Units") + (isMetro ? " · Greater Melbourne" : " · Victoria"),
      "fontSize": 14,
      "fontWeight": 600,
      "color": colour,
      "anchor": "start"
    },
    "width": W,
    "height": H,
    // Victoria view fits to the LGA layer; Melbourne view is a fixed zoom matching METRO_BOX.
    "projection": isMetro
      ? {
          "type": "mercator",
          "center": [(METRO_BOX.west + METRO_BOX.east) / 2, (METRO_BOX.north + METRO_BOX.south) / 2],
          "scale": 21000,
          "translate": [W / 2, H / 2]
        }
      : { "type": "mercator" },
    "layer": layers
  };
}

// Same size scale and legend on all four maps so circles are directly comparable.
const SHARED_SIZE = { "scale": { "size": "shared" }, "legend": { "size": "shared" } };

const spec_map_rent = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Median weekly rent by Victorian LGA",
    "subtitle": "Houses vs units · December 2024 · AUD per week · blank LGAs have no data"
  },
  "hconcat": [
    {
      "vconcat": [
        rentMapPanel("House", "house_rent", "#d17a36", "vic"),
        rentMapPanel("House", "house_rent", "#d17a36", "metro")
      ],
      "spacing": 16,
      "resolve": SHARED_SIZE
    },
    {
      "vconcat": [
        rentMapPanel("Unit", "unit_rent", "#2b7a78", "vic"),
        rentMapPanel("Unit", "unit_rent", "#2b7a78", "metro")
      ],
      "spacing": 16,
      "resolve": SHARED_SIZE
    }
  ],
  "spacing": 24,
  "resolve": SHARED_SIZE,
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
