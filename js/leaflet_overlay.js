var _, styles, map, ggl, svg, g;
_ = require("prelude-ls");
d3.selectAll('#map').style({
  "height": "800px",
  "width": "1200px"
});
styles = undefined;
map = new L.map("map", {
  center: [25.0172264, 121.506378],
  zoom: 12
});
ggl = new L.Google('ROADMAP', {
  mapOptions: {
    styles: styles
  }
});
map.addLayer(ggl);
svg = d3.select(map.getPanes().overlayPane).append("svg");
g = svg.append("g").attr({
  "class": "leaflet-zoom-hide"
});
d3.json("./data/taipeiCOUNTY.json", function(err, data){
  var projectPoint, transform, path, feature, resetview;
  data = topojson.feature(data, data["objects"]["VILLAGE"]);
  projectPoint = function(x, y){
    var point;
    point = map.latLngToLayerPoint(new L.LatLng(y, x));
    return this.stream.point(point.x, point.y);
  };
  transform = d3.geo.transform({
    point: projectPoint
  });
  path = d3.geo.path().projection(transform);
  feature = g.selectAll("path").data(data.features).enter().append("path").attr({
    "class": "area"
  }).style({
    "fill": "none"
  });
  resetview = function(){
    var bounds, topLeft, bottomRight;
    bounds = path.bounds(data);
    topLeft = bounds[0];
    bottomRight = bounds[1];
    svg.attr({
      "width": bottomRight[0] - topLeft[0],
      "height": bottomRight[1] - topLeft[1]
    }).style({
      "left": topLeft[0] + "px",
      "top": topLeft[1] + "px"
    });
    g.attr({
      "transform": "translate(" + (-topLeft[0]) + "," + (-topLeft[1]) + ")"
    });
    return feature.attr({
      "d": path
    }).style({
      "stroke": "red",
      "stroke-width": "5px"
    });
  };
  resetview();
  return map.on("viewreset", resetview);
});