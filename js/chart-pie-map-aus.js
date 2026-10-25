// Capital city vs rest of state household spending – pie charts on a map, with a city selector.
// Keep the chart specification in this file so each visualization is modular.
//
// Data
//   data/australia-states.topojson   – state boundaries (same file map-1a.js uses; feature "states",
//                                      joined on properties.STATE_NAME)
//   data/spending_share_capital_vs_rest_2015_16.csv
//       region (selector value), state_name, area_type ("Greater capital city" | "Rest of state"),
//       area_label, category, cat_order, weekly_spend ($/week), share_pct (% of that area's total
//       goods & services spending), total_spend, note
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, datacube 13
//   (Tables 13.1, 13.3A, 13.5, 13.7, 13.9A, 13.2, 13.6, 13.8).
//
// Notes
// - The ABS does not publish spending by category for LGAs. The finest urban/rural split is
//   Greater Capital City vs Rest of State, so each state gets (up to) two pies.
// - "Meals out & fast food" is the HES equivalent of hotels, cafes and restaurants. It is taken out
//   of Food so nothing is counted twice. For "Rest of state" it is a derived estimate (see CSV note).
// - Darwin: the ABS does not publish Rest of NT. Canberra: the ACT is all Greater Canberra.

const PIEAUS_W = 640, PIEAUS_H = 520;
const PIEAUS_RADIUS = 58;

const PIEAUS_REGIONS = ["Australia", "Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth", "Hobart", "Darwin", "Canberra"];
const PIEAUS_REGION_LABELS = [
  "All of Australia", "Sydney (NSW)", "Melbourne (Vic)", "Brisbane (Qld)", "Adelaide (SA)",
  "Perth (WA)", "Hobart (Tas)", "Darwin (NT)", "Canberra (ACT)"
];
const PIEAUS_STATE_OF = {
  "Sydney": "New South Wales", "Melbourne": "Victoria", "Brisbane": "Queensland",
  "Adelaide": "South Australia", "Perth": "Western Australia", "Hobart": "Tasmania",
  "Darwin": "Northern Territory", "Canberra": "Australian Capital Territory"
};
const PIEAUS_NOTES = {
  "Australia": "Left pie: all eight capital cities combined · right pie: all rest-of-state areas combined",
  "Darwin": "The ABS does not publish a Rest of NT estimate",
  "Canberra": "The ACT is entirely Greater Canberra, so there is no rest-of-territory pie"
};

// Map view for each selection (mercator centre + scale), so the map zooms to the chosen state.
const PIEAUS_VIEWS = [
  { "region": "Australia", "center_lon": 133.3,  "center_lat": -28.427, "scale": 720 },
  { "region": "Sydney",    "center_lon": 148.65, "center_lat": -32.978, "scale": 1590 },
  { "region": "Melbourne", "center_lon": 145.5,  "center_lat": -37.22,  "scale": 2200 },
  { "region": "Brisbane",  "center_lon": 147.75, "center_lat": -20.23,  "scale": 900 },
  { "region": "Adelaide",  "center_lon": 135.0,  "center_lat": -32.473, "scale": 1190 },
  { "region": "Perth",     "center_lon": 119.35, "center_lat": -24.87,  "scale": 750 },
  { "region": "Hobart",    "center_lon": 146.9,  "center_lat": -41.634, "scale": 3200 },
  { "region": "Darwin",    "center_lon": 131.85, "center_lat": -18.429, "scale": 1080 },
  { "region": "Canberra",  "center_lon": 149.3,  "center_lat": -35.509, "scale": 6100 }
];

// Where each pie sits. Capital pies sit offshore with a leader line to the city (cap_lon/cap_lat).
const PIEAUS_POSITIONS = [
  // "All of Australia" has no map behind it, so these two just sit side by side in the middle.
  { "region": "Australia", "area_type": "Greater capital city", "pie_lon": 122.95, "pie_lat": -28.427, "cap_lon": null, "cap_lat": null },
  { "region": "Australia", "area_type": "Rest of state",        "pie_lon": 143.65, "pie_lat": -28.427, "cap_lon": null, "cap_lat": null },
  { "region": "Sydney",    "area_type": "Greater capital city", "pie_lon": 156.4, "pie_lat": -35.6,  "cap_lon": 151.21, "cap_lat": -33.87 },
  { "region": "Sydney",    "area_type": "Rest of state",        "pie_lon": 146.2, "pie_lat": -32.3,  "cap_lon": null,   "cap_lat": null },
  { "region": "Melbourne", "area_type": "Greater capital city", "pie_lon": 143.9, "pie_lat": -40.4,  "cap_lon": 144.96, "cap_lat": -37.81 },
  { "region": "Melbourne", "area_type": "Rest of state",        "pie_lon": 143.0, "pie_lat": -36.3,  "cap_lon": null,   "cap_lat": null },
  { "region": "Brisbane",  "area_type": "Greater capital city", "pie_lon": 157.6, "pie_lat": -24.8,  "cap_lon": 153.03, "cap_lat": -27.47 },
  { "region": "Brisbane",  "area_type": "Rest of state",        "pie_lon": 144.4, "pie_lat": -22.3,  "cap_lon": null,   "cap_lat": null },
  { "region": "Adelaide",  "area_type": "Greater capital city", "pie_lon": 135.0, "pie_lat": -38.6,  "cap_lon": 138.6,  "cap_lat": -34.93 },
  { "region": "Adelaide",  "area_type": "Rest of state",        "pie_lon": 135.2, "pie_lat": -29.6,  "cap_lon": null,   "cap_lat": null },
  { "region": "Perth",     "area_type": "Greater capital city", "pie_lon": 109.6, "pie_lat": -29.5,  "cap_lon": 115.86, "cap_lat": -31.95 },
  { "region": "Perth",     "area_type": "Rest of state",        "pie_lon": 121.6, "pie_lat": -25.4,  "cap_lon": null,   "cap_lat": null },
  { "region": "Hobart",    "area_type": "Greater capital city", "pie_lon": 150.1, "pie_lat": -43.0,  "cap_lon": 147.33, "cap_lat": -42.88 },
  { "region": "Hobart",    "area_type": "Rest of state",        "pie_lon": 146.0, "pie_lat": -41.85, "cap_lon": null,   "cap_lat": null },
  { "region": "Darwin",    "area_type": "Greater capital city", "pie_lon": 125.6, "pie_lat": -10.4,  "cap_lon": 130.84, "cap_lat": -12.46 },
  { "region": "Canberra",  "area_type": "Greater capital city", "pie_lon": 151.0, "pie_lat": -35.7,  "cap_lon": 149.13, "cap_lat": -35.28 }
];

// Capital city markers (only the selected city is drawn).
const PIEAUS_CAPITALS = [
  { "city": "Sydney", "lon": 151.21, "lat": -33.87 }, { "city": "Melbourne", "lon": 144.96, "lat": -37.81 },
  { "city": "Brisbane", "lon": 153.03, "lat": -27.47 }, { "city": "Adelaide", "lon": 138.60, "lat": -34.93 },
  { "city": "Perth", "lon": 115.86, "lat": -31.95 }, { "city": "Hobart", "lon": 147.33, "lat": -42.88 },
  { "city": "Darwin", "lon": 130.84, "lat": -12.46 }, { "city": "Canberra", "lon": 149.13, "lat": -35.28 }
];

const PIEAUS_CATEGORIES = [
  "Food & non-alcoholic drinks", "Meals out & fast food", "Transport",
  "Medical care & health", "Clothing & footwear", "All other spending"
];
const PIEAUS_COLOURS = ["#2b7a78", "#c0562b", "#d17a36", "#7a5c99", "#d2a24c", "#dcdfdd"];

// Build Vega expression lookups like {'Sydney': 1590, ...}[region] from the constants above.
function pieAusLookup(obj) {
  return "{" + Object.entries(obj).map(([k, v]) => "'" + k + "': " + JSON.stringify(v).replace(/"/g, "'")).join(", ") + "}[region]";
}
const PIEAUS_CENTER_EXPR = pieAusLookup(Object.fromEntries(PIEAUS_VIEWS.map(v => [v.region, [v.center_lon, v.center_lat]])));
const PIEAUS_SCALE_EXPR = pieAusLookup(Object.fromEntries(PIEAUS_VIEWS.map(v => [v.region, v.scale])));
const PIEAUS_STATE_EXPR = pieAusLookup(PIEAUS_STATE_OF);
const PIEAUS_NOTE_EXPR = pieAusLookup(PIEAUS_NOTES);

const PIEAUS_SHARE_DATA = {
  "url": "data/spending_share_capital_vs_rest_2015_16.csv",
  "format": {
    "type": "csv",
    "parse": { "cat_order": "number", "weekly_spend": "number", "share_pct": "number", "total_spend": "number" }
  }
};

// Keep the selected region, work out each slice's start/end (normalised so each pie is exactly
// 100% even after rounding), and attach the pie's map position.
const PIEAUS_SLICE_TRANSFORM = [
  { "filter": "datum.region === region" },
  { "joinaggregate": [{ "op": "sum", "field": "share_pct", "as": "pie_total" }], "groupby": ["area_type"] },
  {
    "window": [{ "op": "sum", "field": "share_pct", "as": "cum_pct" }],
    "groupby": ["area_type"],
    "sort": [{ "field": "cat_order", "order": "ascending" }],
    "frame": [null, 0]
  },
  { "calculate": "datum.cum_pct / datum.pie_total * 100", "as": "end_pct" },
  { "calculate": "(datum.cum_pct - datum.share_pct) / datum.pie_total * 100", "as": "start_pct" },
  { "calculate": "(datum.start_pct + datum.end_pct) / 2", "as": "mid_pct" },
  { "calculate": "datum.region + '|' + datum.area_type", "as": "pos_key" },
  {
    "lookup": "pos_key",
    "from": {
      "data": { "values": PIEAUS_POSITIONS.map(p => ({ ...p, "pos_key": p.region + "|" + p.area_type })) },
      "key": "pos_key",
      "fields": ["pie_lon", "pie_lat"]
    }
  }
];

const PIEAUS_THETA_SCALE = { "domain": [0, 100], "range": [0, 6.2832], "zero": true, "nice": false };

const PIEAUS_TOOLTIP = [
  { "field": "area_label", "type": "nominal", "title": "Area" },
  { "field": "category", "type": "nominal", "title": "Category" },
  { "field": "share_pct", "type": "quantitative", "title": "Share of the area's spending (%)", "format": ".1f" },
  { "field": "weekly_spend", "type": "quantitative", "title": "Average weekly spend", "format": "$,.2f" },
  { "field": "total_spend", "type": "quantitative", "title": "Area total goods & services / week", "format": "$,.0f" },
  { "field": "note", "type": "nominal", "title": "Source / method" }
];

const PIEAUS_POS = {
  "longitude": { "field": "pie_lon", "type": "quantitative" },
  "latitude": { "field": "pie_lat", "type": "quantitative" }
};

const spec_chart_pie_map_aus = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": {
    "text": "Where the household budget goes: capital city vs rest of state",
    "subtitle": { "expr": "'Share of total weekly spending on goods and services, 2015-16' + (isValid(" + PIEAUS_NOTE_EXPR + ") ? ' · ' + " + PIEAUS_NOTE_EXPR + " : '')" },
    "anchor": "start",
    "fontSize": 15,
    "fontWeight": 600,
    "color": "#1b2a2e",
    "subtitleFontSize": 11,
    "subtitleColor": "#5b6b66"
  },
  "width": PIEAUS_W,
  "height": PIEAUS_H,
  "params": [
    {
      "name": "region",
      "value": "Sydney",
      "bind": { "input": "select", "options": PIEAUS_REGIONS, "labels": PIEAUS_REGION_LABELS, "name": "City: " }
    }
  ],
  // The projection is driven by the selector, so the map zooms to the chosen state.
  "projection": {
    "type": "mercator",
    "center": { "expr": PIEAUS_CENTER_EXPR },
    "scale": { "expr": PIEAUS_SCALE_EXPR },
    "translate": [PIEAUS_W / 2, PIEAUS_H / 2]
  },
  "layer": [
    // 1. The selected state only (nothing is drawn for "All of Australia").
    {
      "data": { "url": "data/australia-states.topojson", "format": { "type": "topojson", "feature": "states" } },
      "transform": [{ "filter": "region !== 'Australia' && datum.properties.STATE_NAME === " + PIEAUS_STATE_EXPR }],
      "mark": { "type": "geoshape", "fill": "#e6ecea", "stroke": "#c9d3cf", "strokeWidth": 1, "clip": true },
      "encoding": {
        "tooltip": [{ "field": "properties.STATE_NAME", "type": "nominal", "title": "State / territory" }]
      }
    },
    // 2. Leader line from each capital-city pie to its city.
    {
      "data": { "values": PIEAUS_POSITIONS },
      "transform": [{ "filter": "datum.region === region && isValid(datum.cap_lon)" }],
      "mark": { "type": "rule", "color": "#7c8983", "strokeWidth": 1, "clip": true },
      "encoding": {
        ...PIEAUS_POS,
        "longitude2": { "field": "cap_lon" },
        "latitude2": { "field": "cap_lat" }
      }
    },
    // 3. Marker + name for the selected capital only.
    {
      "data": { "values": PIEAUS_CAPITALS },
      "transform": [{ "filter": "datum.city === region" }],
      "mark": { "type": "circle", "size": 26, "color": "#27332f", "opacity": 1, "clip": true },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "tooltip": [{ "field": "city", "type": "nominal", "title": "Capital city" }]
      }
    },
    {
      "data": { "values": PIEAUS_CAPITALS },
      "transform": [{ "filter": "datum.city === region" }],
      "mark": { "type": "text", "dx": 6, "dy": -6, "align": "left", "fontSize": 10, "color": "#5b6b66", "clip": true },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "text": { "field": "city", "type": "nominal" }
      }
    },
    // 4. The pies: one arc per category.
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": PIEAUS_SLICE_TRANSFORM,
      "mark": { "type": "arc", "outerRadius": PIEAUS_RADIUS, "stroke": "#ffffff", "strokeWidth": 1.2 },
      "encoding": {
        ...PIEAUS_POS,
        "theta": { "field": "start_pct", "type": "quantitative", "scale": PIEAUS_THETA_SCALE, "stack": null },
        "theta2": { "field": "end_pct" },
        "color": {
          "field": "category",
          "type": "nominal",
          "scale": { "domain": PIEAUS_CATEGORIES, "range": PIEAUS_COLOURS },
          "legend": {
            "title": "Spending category",
            "orient": "bottom",
            "direction": "horizontal",
            "columns": 3,
            "symbolType": "square",
            "labelFontSize": 11,
            "titleFontSize": 11,
            "labelLimit": 200
          }
        },
        "tooltip": PIEAUS_TOOLTIP
      }
    },
    // 5. % labels outside each focus slice (not the grey "other" slice).
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": [
        ...PIEAUS_SLICE_TRANSFORM,
        { "filter": "datum.category !== 'All other spending'" },
        { "calculate": "format(datum.share_pct, '.0f') + '%'", "as": "pct_label" }
      ],
      "mark": { "type": "text", "radius": PIEAUS_RADIUS + 17, "fontSize": 10, "fontWeight": 600, "color": "#1b2a2e" },
      "encoding": {
        ...PIEAUS_POS,
        "theta": { "field": "mid_pct", "type": "quantitative", "scale": PIEAUS_THETA_SCALE, "stack": null },
        "text": { "field": "pct_label", "type": "nominal" },
        "tooltip": PIEAUS_TOOLTIP
      }
    },
    // 6. Area name + weekly total above each pie.
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": [
        ...PIEAUS_SLICE_TRANSFORM,
        { "filter": "datum.cat_order === 1" },
        { "calculate": "[datum.area_label, format(datum.total_spend, '$,.0f') + ' per week']", "as": "pie_title" }
      ],
      "mark": { "type": "text", "dy": -(PIEAUS_RADIUS + 38), "fontSize": 12, "fontWeight": 700, "color": "#1b2a2e", "lineHeight": 14 },
      "encoding": {
        ...PIEAUS_POS,
        "text": { "field": "pie_title" }
      }
    }
  ],
  "resolve": { "scale": { "theta": "shared" } },
  "config": {
    "view": { "stroke": null },
    "font": "DM Sans"
  }
};

vegaEmbed('#chart-pie-map-aus', spec_chart_pie_map_aus, { actions: false, renderer: 'svg' })
  .catch(error => console.error('Could not render chart-pie-map-aus:', error));
