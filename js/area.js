var _, styles, map, ggl, svg, g;
_ = require("prelude-ls");
d3.selectAll('#map').style({
  "height": "800px",
  "width": "1200px"
});
styles = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#000000'
      }
    ]
  }, {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#000000'
      }
    ]
  }, {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "all",
    "elementType": "labels",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#152f40'
      }
    ]
  }, {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#41afa6'
      }
    ]
  }, {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#000000'
      }
    ]
  }, {
    "featureType": "administrative",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "on"
      }, {
        "color": '#41afa6'
      }
    ]
  }
];
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
      "stroke": '#f1f075',
      "stroke-width": "2px"
    });
  };
  resetview();
  map.on("viewreset", resetview);
  return d3.csv("./data/2012_立法委員選舉_台北.csv", function(err, fillData){
    var vote_data, color;
    vote_data = _.Obj.map(function(it){
      var k, d;
      k = null;
      d = null;
      _.map(function(c){
        if (c["政黨"] === "中國國民黨") {
          k = c;
        }
        if (c["政黨"] === "民主進步黨") {
          return d = c;
        }
      })(
      it);
      return k["得票率"] - d["得票率"];
    })(
    _.groupBy(function(it){
      return it["地區"];
    })(
    _.map(function(it){
      it["得票率"] = +it["得票率"].split("%")[0];
      return it;
    })(
    fillData)));
    color = d3.scale.linear().domain([-50, 50]).range(["green", "blue"]).interpolate(d3.interpolateHsl);
    return feature.style({
      "fill": function(it){
        var p, n;
        p = it["properties"];
        n = p["COUNTY"] + p["TOWN"] + p["VILLAGE"];
        return color(vote_data[n]);
      },
      "opacity": 0.7
    });
  });
});