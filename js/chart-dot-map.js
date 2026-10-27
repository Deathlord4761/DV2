// Household spending dot-density map – Victoria, by LGA geography.
// Keep the chart specification in this file so each visualization is modular.
// Colours follow the page-wide key: the five spending categories have their own colours (food green, meals out sand, transport sky blue, health rose, clothing wine – Paul Tol colour-blind-safe colours).
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data
//   data/LGA_POLYGON.json                       – Victorian LGA boundaries (all 87 drawn)
//   data/lga_area_vic.csv                       – LGA_NAME, area (Greater Melbourne | Rest of Victoria)
//   data/dot_density_spending_vic_2015_16.csv   – one row per dot: region, category, lon, lat, lga, draw_order
//   ONE DOT = $1 MILLION OF HOUSEHOLD SPENDING PER WEEK.
//
// How the dots were made
//   Weekly spend per household (ABS HES 2015-16, datacube 13, Tables 13.1, 13.3A, 13.5, 13.9A)
//   × number of households (Tables 13.2, 13.6) = total $ per week for each area and category.
//   That total, in $ millions and rounded, is the number of dots. Each dot is placed at a random
//   point inside an LGA belonging to its area (Greater Melbourne or Rest of Victoria).
//   The ABS does not publish spending for individual LGAs, so dots show how much is spent in each
//   AREA and roughly where people live within Victoria, not which suburb spends more.
//   Rest of Victoria "meals out" is a derived estimate (Victoria minus Melbourne, household-weighted).

const DOT_W = 430, DOT_H = 330;

const DOT_CATEGORIES = ["Food (excl. meals out)", "Meals out & fast food", "Transport", "Medical care & health", "Clothing & footwear"];
const DOT_COLOURS = ["#117733", "#DDCC77", "#66CCEE", "#CC6677", "#882255"];

// Extent of the Greater Melbourne zoom (also drawn as a dashed box on the Victoria map).
const DOT_METRO_BOX = { "west": 144.42, "east": 146.22, "north": -37.38, "south": -38.52 };

// Dot positions are loaded from a separate file: data/dot_density_spending_vic_2015_16.csv
//   columns: region, category, lon, lat, lga, draw_order (one row per dot)
const DOT_AREAS = ["Greater Melbourne", "Rest of Victoria"];
const DOT_DATA = {
  "url": "data/dot_density_spending_vic_2015_16.csv",
  "format": { "type": "csv", "parse": { "lon": "number", "lat": "number", "draw_order": "number" } }
};

// Dropdown: show all dots, or only one category's dots (helps where dots overlap).
const DOT_ALL = "All categories";
const DOT_SHOW_OPTIONS = [DOT_ALL, ...DOT_CATEGORIES];
const DOT_FILTER = "dot_show === '" + DOT_ALL + "' || datum.category === dot_show";

// Dot counts per area for each dropdown option (1 dot = $1 million a week). Used in the panel
// subtitles. These match the number of rows in the CSV for each area and category.
const DOT_TOTALS = {
  "All categories": [1027, 307],
  "Food (excl. meals out)": [275, 88],
  "Meals out & fast food": [156, 36],
  "Transport": [372, 123],
  "Medical care & health": [138, 41],
  "Clothing & footwear": [86, 19]
};
// Builds e.g. {'All categories': 1027, 'Transport': 372, ...}[dot_show] for one area.
function dotTotalExpr(areaIndex) {
  return "{" + DOT_SHOW_OPTIONS.map(o => "'" + o + "': " + DOT_TOTALS[o][areaIndex]).join(", ") + "}[dot_show]";
}

function dotPanel(view) {
  const isMetro = view === "metro";

  const dots = {
    "data": DOT_DATA,
    "transform": [{ "filter": DOT_FILTER }],
    "mark": { "type": "circle", "size": isMetro ? 22 : 9, "opacity": 0.9, "clip": true },
    "encoding": {
      "longitude": { "field": "lon", "type": "quantitative" },
      "latitude": { "field": "lat", "type": "quantitative" },
      "color": {
        "field": "category",
        "type": "nominal",
        "scale": { "domain": DOT_CATEGORIES, "range": DOT_COLOURS },
        "legend": {
          "title": "One dot = $1m of household spending per week",
          "orient": "bottom",
          "direction": "horizontal",
          "columns": 3,
          "symbolType": "circle",
          "symbolSize": 70,
          "labelFontSize": 11,
          "titleFontSize": 11,
          "labelLimit": 200
        }
      },
      "order": { "field": "draw_order", "type": "quantitative" },
      "tooltip": [
        { "field": "category", "type": "nominal", "title": "Category" },
        { "field": "region", "type": "nominal", "title": "Area" },
        { "field": "lga", "type": "nominal", "title": "LGA (dot placed in)" }
      ]
    }
  };

  const layers = [
    // LGAs, shaded by area.
    {
      "data": { "url": "data/LGA_POLYGON.json", "format": { "type": "topojson", "feature": "LGA_POLYGON" } },
      "transform": [
        { "lookup": "properties.LGA_NAME", "from": { "data": { "url": "data/lga_area_vic.csv" }, "key": "LGA_NAME", "fields": ["area"] } }
      ],
      "mark": { "type": "geoshape", "stroke": "#ffffff", "strokeWidth": 0.6, "clip": true },
      "encoding": {
        "fill": {
          "field": "area",
          "type": "nominal",
          "scale": { "domain": ["Greater Melbourne", "Rest of Victoria"], "range": ["#ebebe6", "#f7f7f4"] },
          "legend": { "title": null, "orient": "top", "direction": "horizontal", "symbolType": "square", "labelFontSize": 11 }
        },
        "tooltip": [
          { "field": "properties.LGA_NAME", "type": "nominal", "title": "LGA" },
          { "field": "area", "type": "nominal", "title": "Area" }
        ]
      }
    },
    dots
  ];

  if (!isMetro) {
    layers.push({
      "data": {
        "values": {
          "type": "Feature", "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [DOT_METRO_BOX.west, DOT_METRO_BOX.north], [DOT_METRO_BOX.east, DOT_METRO_BOX.north],
              [DOT_METRO_BOX.east, DOT_METRO_BOX.south], [DOT_METRO_BOX.west, DOT_METRO_BOX.south],
              [DOT_METRO_BOX.west, DOT_METRO_BOX.north]
            ]]
          }
        },
        "format": { "type": "json" }
      },
      "mark": { "type": "geoshape", "fill": null, "stroke": "#27332f", "strokeWidth": 1, "strokeDash": [3, 2] }
    });
  }

  return {
    "title": {
      "text": isMetro ? "Greater Melbourne (zoomed)" : "Victoria",
      "subtitle": {
        "expr": isMetro
          ? "'Greater Melbourne: $' + format(" + dotTotalExpr(0) + ", ',') + 'm a week' + (dot_show === '" + DOT_ALL + "' ? ' across the five categories' : ' on ' + lower(dot_show))"
          : "'Rest of Victoria: $' + format(" + dotTotalExpr(1) + ", ',') + 'm a week' + (dot_show === '" + DOT_ALL + "' ? ' across the five categories' : ' on ' + lower(dot_show))"
      },
      "fontSize": 13, "fontWeight": 700, "color": "#1b2a2e", "anchor": "start",
      "subtitleFontSize": 11, "subtitleColor": "#5b6b66"
    },
    "width": DOT_W,
    "height": DOT_H,
    "projection": isMetro
      ? {
          "type": "mercator",
          "center": [(DOT_METRO_BOX.west + DOT_METRO_BOX.east) / 2, (DOT_METRO_BOX.north + DOT_METRO_BOX.south) / 2],
          "scale": 12500,
          "translate": [DOT_W / 2, DOT_H / 2]
        }
      : { "type": "mercator" },
    "layer": layers
  };
}

const spec_chart_dot_map = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "params": [
    {
      "name": "dot_show",
      "value": DOT_ALL,
      "bind": { "input": "select", "options": DOT_SHOW_OPTIONS, "name": "Show dots for: " }
    }
  ],
  "hconcat": [dotPanel("vic"), dotPanel("metro")],
  "spacing": 24,
  "resolve": {
    "scale": { "color": "shared", "fill": "shared" },
    "legend": { "color": "shared", "fill": "shared" }
  },
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-dot-map', spec_chart_dot_map, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-dot-map:', error));
