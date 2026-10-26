// Capital city vs rest of state household spending – pie charts on a map, with a city selector.
// Keep the chart specification in this file so each visualization is modular.
// The chart title and subtitle are in index.html (above the chart), not in the spec.
//
// Data
//   data/australia-states.topojson   – state boundaries (feature "states", joined on properties.STATE_NAME)
//   data/spending_share_capital_vs_rest_2015_16.csv
//       region (selector value), state_name, area_type ("Greater capital city" | "Rest of state"),
//       area_label, category, cat_order, weekly_spend ($/week), share_pct (% of that area's total
//       goods & services spending), total_spend, note
// Source: ABS, Household Expenditure Survey, Australia: Summary of Results, 2015-16, datacube 13.
//
// Layout
//   The selected state is drawn in the left part of the chart. The two pies always sit in the same
//   place in a column on the right (capital city on top, rest of state below), so they can be large
//   without covering land and are easy to compare. A line joins the capital-city pie to the city.
//   Each map view (centre + scale) was calculated so the state fills the left area; the pie
//   positions below are the map coordinates of those fixed spots on the right.
//   Labels: every focus category shows its %, the largest focus category also shows its name,
//   and the grey "All other spending" slice is labelled inside the pie.

const PIEAUS_W = 760, PIEAUS_H = 600;
const PIEAUS_RADIUS = 88;

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
  "Australia": "Left: all eight capital cities combined · Right: all rest-of-state areas combined",
  "Darwin": "The ABS does not publish a Rest of NT estimate",
  "Canberra": "The ACT is entirely Greater Canberra, so there is no rest-of-territory pie"
};

// Map view for each selection (mercator centre + scale).
const PIEAUS_VIEWS = [
  { "region": "Australia", "center_lon": 133.0, "center_lat": -28.0, "scale": 700 },
  { "region": "Sydney",    "center_lon": 151.8715, "center_lat": -32.9776, "scale": 1880.0 },
  { "region": "Melbourne", "center_lon": 148.7857, "center_lat": -36.5955, "scale": 2615.7 },
  { "region": "Brisbane",  "center_lon": 151.4427, "center_lat": -20.2303, "scale": 1523.1 },
  { "region": "Adelaide",  "center_lon": 139.3571, "center_lat": -32.2041, "scale": 1972.5 },
  { "region": "Perth",     "center_lon": 127.6443, "center_lat": -24.8695, "scale": 1293.5 },
  { "region": "Hobart",    "center_lon": 147.9, "center_lat": -41.6342, "scale": 4911.1 },
  { "region": "Darwin",    "center_lon": 137.9683, "center_lat": -18.67, "scale": 1923.4 },
  { "region": "Canberra",  "center_lon": 149.3651, "center_lat": -35.5261, "scale": 29623.8 }
];

// Where each pie sits (map coordinates of the fixed spots in the right-hand column).
const PIEAUS_POSITIONS = [
  { "region": "Australia", "area_type": "Greater capital city",  "pie_lon": 120.7223, "pie_lat": -30.1459, "cap_lon": null, "cap_lat": null },
  { "region": "Australia", "area_type": "Rest of state",         "pie_lon": 145.2777, "pie_lat": -30.1459, "cap_lon": null, "cap_lat": null },
  { "region": "Sydney",    "area_type": "Greater capital city",  "pie_lon": 157.723, "pie_lat": -29.3272, "cap_lon": 151.21, "cap_lat": -33.87 },
  { "region": "Sydney",    "area_type": "Rest of state",         "pie_lon": 157.723, "pie_lat": -36.4831, "cap_lon": null, "cap_lat": null },
  { "region": "Melbourne", "area_type": "Greater capital city",  "pie_lon": 152.9914, "pie_lat": -34.0945, "cap_lon": 144.96, "cap_lat": -37.81 },
  { "region": "Melbourne", "area_type": "Rest of state",         "pie_lon": 152.9914, "pie_lat": -39.018, "cap_lon": null, "cap_lat": null },
  { "region": "Brisbane",  "area_type": "Greater capital city",  "pie_lon": 158.6653, "pie_lat": -15.2157, "cap_lon": 153.03, "cap_lat": -27.47 },
  { "region": "Brisbane",  "area_type": "Rest of state",         "pie_lon": 158.6653, "pie_lat": -25.0883, "cap_lon": null, "cap_lat": null },
  { "region": "Adelaide",  "area_type": "Greater capital city",  "pie_lon": 144.9342, "pie_lat": -28.6994, "cap_lon": 138.6, "cap_lat": -34.93 },
  { "region": "Adelaide",  "area_type": "Rest of state",         "pie_lon": 144.9342, "pie_lat": -35.5789, "cap_lon": null, "cap_lat": null },
  { "region": "Perth",     "area_type": "Greater capital city",  "pie_lon": 136.149, "pie_lat": -19.1228, "cap_lon": 115.86, "cap_lat": -31.95 },
  { "region": "Perth",     "area_type": "Rest of state",         "pie_lon": 136.149, "pie_lat": -30.3611, "cap_lon": null, "cap_lat": null },
  { "region": "Hobart",    "area_type": "Greater capital city",  "pie_lon": 150.14, "pie_lat": -40.4019, "cap_lon": 147.33, "cap_lat": -42.88 },
  { "region": "Hobart",    "area_type": "Rest of state",         "pie_lon": 150.14, "pie_lat": -42.8434, "cap_lon": null, "cap_lat": null },
  { "region": "Darwin",    "area_type": "Greater capital city",  "pie_lon": 143.6877, "pie_lat": -18.67, "cap_lon": 130.84, "cap_lat": -12.46 },
  { "region": "Canberra",  "area_type": "Greater capital city",  "pie_lon": 149.7364, "pie_lat": -35.5261, "cap_lon": 149.13, "cap_lat": -35.28 }
];

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
const PIEAUS_COLOURS = ["#117733", "#DDCC77", "#66CCEE", "#CC6677", "#882255", "#e1e5e3"];
const PIEAUS_SHORT = {
  "Food & non-alcoholic drinks": "Food", "Meals out & fast food": "Meals out", "Transport": "Transport",
  "Medical care & health": "Health", "Clothing & footwear": "Clothing"
};

// Build Vega expression lookups like {'Sydney': 1590, ...}[region] from the constants above.
function pieAusLookup(obj) {
  return "{" + Object.entries(obj).map(([k, v]) => "'" + k + "': " + JSON.stringify(v).replace(/"/g, "'")).join(", ") + "}[region]";
}
const PIEAUS_CENTER_EXPR = pieAusLookup(Object.fromEntries(PIEAUS_VIEWS.map(v => [v.region, [v.center_lon, v.center_lat]])));
const PIEAUS_SCALE_EXPR = pieAusLookup(Object.fromEntries(PIEAUS_VIEWS.map(v => [v.region, v.scale])));
const PIEAUS_STATE_EXPR = pieAusLookup(PIEAUS_STATE_OF);
const PIEAUS_NOTE_EXPR = pieAusLookup(PIEAUS_NOTES);
const PIEAUS_SHORT_EXPR = "{" + Object.entries(PIEAUS_SHORT).map(([k, v]) => "'" + k + "': '" + v + "'").join(", ") + "}[datum.category]";

const PIEAUS_SHARE_DATA = {
  "url": "data/spending_share_capital_vs_rest_2015_16.csv",
  "format": {
    "type": "csv",
    "parse": { "cat_order": "number", "weekly_spend": "number", "share_pct": "number", "total_spend": "number" }
  }
};

// Keep the selected region, work out each slice's start/end (normalised so each pie is exactly 100%),
// flag the largest focus category, and attach the pie's map position.
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
  { "calculate": "datum.category !== 'All other spending'", "as": "is_focus" },
  { "calculate": "datum.is_focus ? datum.share_pct : null", "as": "focus_share" },
  { "joinaggregate": [{ "op": "max", "field": "focus_share", "as": "top_focus" }], "groupby": ["area_type"] },
  { "calculate": "datum.is_focus && datum.share_pct === datum.top_focus", "as": "is_top" },
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

// Outside labels: "%" for each focus slice, "Name %" for the largest one.
// Slices on the right half are left-aligned, slices on the left half right-aligned, so text never
// runs back into the pie.
function pieAusOuterLabels(side) {
  const right = side === "right";
  return {
    "data": PIEAUS_SHARE_DATA,
    "transform": [
      ...PIEAUS_SLICE_TRANSFORM,
      { "filter": "datum.is_focus && (datum.mid_pct " + (right ? "<" : ">=") + " 50)" },
      {
        "calculate": "datum.is_top ? " + PIEAUS_SHORT_EXPR + " + ' ' + format(datum.share_pct, '.0f') + '%' : format(datum.share_pct, '.0f') + '%'",
        "as": "pct_label"
      }
    ],
    "mark": {
      "type": "text", "radius": PIEAUS_RADIUS + 10, "align": right ? "left" : "right", "baseline": "middle",
      "fontSize": 12, "color": "#1b2a2e"
    },
    "encoding": {
      ...PIEAUS_POS,
      "theta": { "field": "mid_pct", "type": "quantitative", "scale": PIEAUS_THETA_SCALE, "stack": null },
      "text": { "field": "pct_label", "type": "nominal" },
      "fontWeight": { "condition": { "test": "datum.is_top", "value": 700 }, "value": 500 },
      "tooltip": PIEAUS_TOOLTIP
    }
  };
}

const spec_chart_pie_map_aus = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  // Title/subtitle are in index.html. Only the note for some selections stays here.
  "title": {
    "text": { "expr": "isValid(" + PIEAUS_NOTE_EXPR + ") ? " + PIEAUS_NOTE_EXPR + " : ''" },
    "anchor": "start",
    "fontSize": 11,
    "fontWeight": 400,
    "color": "#5b6b66"
  },
  "width": PIEAUS_W,
  "height": PIEAUS_H,
  "params": [
    {
      "name": "region",
      "value": "Australia",
      "bind": { "input": "select", "options": PIEAUS_REGIONS, "labels": PIEAUS_REGION_LABELS, "name": "City: " }
    }
  ],
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
    // 2. Line from the capital-city pie to the city.
    {
      "data": { "values": PIEAUS_POSITIONS },
      "transform": [{ "filter": "datum.region === region && isValid(datum.cap_lon)" }],
      "mark": { "type": "rule", "color": "#7c8983", "strokeWidth": 1, "strokeDash": [4, 3] },
      "encoding": {
        ...PIEAUS_POS,
        "longitude2": { "field": "cap_lon" },
        "latitude2": { "field": "cap_lat" }
      }
    },
    // 3. Marker + name for the selected capital.
    {
      "data": { "values": PIEAUS_CAPITALS },
      "transform": [{ "filter": "datum.city === region" }],
      "mark": { "type": "circle", "size": 60, "color": "#1b2a2e", "opacity": 1 },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "tooltip": [{ "field": "city", "type": "nominal", "title": "Capital city" }]
      }
    },
    {
      "data": { "values": PIEAUS_CAPITALS },
      "transform": [{ "filter": "datum.city === region" }],
      "mark": { "type": "text", "dx": 8, "dy": -8, "align": "left", "fontSize": 12, "fontWeight": 600, "color": "#1b2a2e" },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude": { "field": "lat", "type": "quantitative" },
        "text": { "field": "city", "type": "nominal" }
      }
    },
    // 4. The pies.
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": PIEAUS_SLICE_TRANSFORM,
      "mark": { "type": "arc", "outerRadius": PIEAUS_RADIUS, "stroke": "#ffffff", "strokeWidth": 1.5 },
      "encoding": {
        ...PIEAUS_POS,
        "theta": { "field": "start_pct", "type": "quantitative", "scale": PIEAUS_THETA_SCALE, "stack": null },
        "theta2": { "field": "end_pct" },
        "color": {
          "field": "category",
          "type": "nominal",
          "scale": { "domain": PIEAUS_CATEGORIES, "range": PIEAUS_COLOURS },
          "legend": {
            "title": null,
            "orient": "bottom",
            "direction": "horizontal",
            "columns": 3,
            "symbolType": "square",
            "labelFontSize": 12,
            "labelLimit": 220
          }
        },
        "tooltip": PIEAUS_TOOLTIP
      }
    },
    // 5. Outside labels for the five focus categories.
    pieAusOuterLabels("right"),
    pieAusOuterLabels("left"),
    // 6. "All other spending" labelled inside its (large, grey) slice.
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": [
        ...PIEAUS_SLICE_TRANSFORM,
        { "filter": "!datum.is_focus" },
        { "calculate": "['All other', format(datum.share_pct, '.0f') + '%']", "as": "other_label" }
      ],
      "mark": { "type": "text", "radius": PIEAUS_RADIUS * 0.55, "fontSize": 12, "fontWeight": 600, "color": "#5b6b66", "lineHeight": 14 },
      "encoding": {
        ...PIEAUS_POS,
        "theta": { "field": "mid_pct", "type": "quantitative", "scale": PIEAUS_THETA_SCALE, "stack": null },
        "text": { "field": "other_label" },
        "tooltip": PIEAUS_TOOLTIP
      }
    },
    // 7. Area name + weekly total above each pie.
    {
      "data": PIEAUS_SHARE_DATA,
      "transform": [
        ...PIEAUS_SLICE_TRANSFORM,
        { "filter": "datum.cat_order === 1" },
        { "calculate": "[datum.area_label, format(datum.total_spend, '$,.0f') + ' a week']", "as": "pie_title" }
      ],
      "mark": { "type": "text", "dy": -(PIEAUS_RADIUS + 32), "fontSize": 13, "fontWeight": 700, "color": "#1b2a2e", "lineHeight": 16 },
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
