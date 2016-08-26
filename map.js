window.onload = function () {

  var documentSettings = {};

  function createMarkerIcon(icon, prefix, markerColor, iconColor) {
    return L.AwesomeMarkers.icon({
      icon: icon,
      prefix: prefix,
      markerColor: markerColor,
      iconColor: iconColor
    });
  }

  function centerAndZoomMap(points) {
    var mapCenter = L.latLng();
    var mapZoom = 0;

    // center and zoom map based on points or to user-specified zoom and center
    if (documentSettings["Initial Center Latitude:"] !== '' && documentSettings["Initial Center Longitude:"] !== '') {
      // center and zoom
      mapCenter = L.latLng(documentSettings["Initial Center Latitude:"], documentSettings["Initial Center Longitude:"]);
      map.setView(mapCenter);
    } else {
      var groupBounds = points.getBounds();
      mapZoom = map.getBoundsZoom(groupBounds);
      mapCenter = groupBounds.getCenter();
    }

    if (documentSettings["Initial Zoom:"] !== '') {
      mapZoom = parseInt(documentSettings["Initial Zoom:"]);
    }

    map.setView(mapCenter, mapZoom);

    // once map is recentered, open popup in center of map
    if (documentSettings["Info Popup Text:"] !== '') {
      initInfoPopup(documentSettings["Info Popup Text:"], mapCenter);
    };
  }

  // possibly refactor this so you can add points to layers without knowing what all the layers are beforehand
  // run this function after document is loaded but before mapPoints()
  function determineLayers(points) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in points) {
      var pointLayerNameFromSpreadsheet = points[i].Layer;
      if (layerNamesFromSpreadsheet.indexOf(pointLayerNameFromSpreadsheet) === -1) {
        layerNamesFromSpreadsheet.push(pointLayerNameFromSpreadsheet);
      }
    }

    // if none of the points have named layers or if there was only one name, return no layers
    if (layerNamesFromSpreadsheet.length === 1) {
      layers = undefined;
    } else {
      for (var i in layerNamesFromSpreadsheet) {
        var layerNameFromSpreadsheet = layerNamesFromSpreadsheet[i];
        layers[layerNameFromSpreadsheet] = L.layerGroup();
        layers[layerNameFromSpreadsheet].addTo(map);
      }
    }
    return layers;
  }

  // only run this after Tabletop has loaded (onTabletopLoad())
  function mapPoints(points, layers) {
    var markerArray = [];
    // check that map has loaded before adding points to it?
    for (var i in points) {
      var point = points[i];
      if (point.Latitude !== "" && point.Longitude !== "") {
        var marker = L.marker([point.Latitude, point.Longitude], {
          icon: createMarkerIcon(point['Marker Icon'], 'fa', point['Marker Color'].toLowerCase(), point['Marker Icon Color'])
        }).bindPopup("<b>" + point["Title"] + "</b><br>" + point["Description"]);
        if (layers !== undefined && layers.length !== 1) {
          marker.addTo(layers[point.Layer]);
        }
        markerArray.push(marker);
      }
    }

    var group = L.featureGroup(markerArray);
    // if layers.length === 0, add points to map instead of layer
    if (layers === undefined || layers.length === 0) {
      clusterMarkers(group);
    } else {
      L.control.layers(null, layers, {
        collapsed: false
      }).addTo(map);
    }
    centerAndZoomMap(group);

  }

  // reformulate documentSettings as a dictionary, e.g.
  // {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  function createDocumentSettings(settings) {

    documentSettings = {};

    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customization;
    }
  }

  function clusterMarkers(group) {
    // cluster markers, or don't
    if (documentSettings["Markercluster:"] === 'on') {
        var cluster = L.markerClusterGroup({
            polygonOptions: {
                opacity: 0.3,
                weight: 3
            }
        });
        cluster.addLayer(group);
        map.addLayer(cluster);
    } else {
        map.addLayer(group);
    }
  }

  function onTabletopLoad() {
    createDocumentSettings(tabletop.sheets(constants.informationSheetName).elements);
    addBaseMap();
    document.title = documentSettings["Webpage Title:"];
    var points = tabletop.sheets(constants.pointsSheetName).elements;
    var layers = determineLayers(points);
    mapPoints(points, layers);
  }

  var tabletop = Tabletop.init( { key: constants.googleDocID, // from constants.js
    callback: function(data, tabletop) { onTabletopLoad() }
  });

  function initInfoPopup(info, coordinates) {
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }

  function addBaseMap() {
    var basemap = documentSettings["Tile Provider:"] === '' ? 'Stamen.TonerLite' : documentSettings["Tile Provider:"];

    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);

    L.control.attribution({
      position: 'bottomleft'
    }).addTo(map);

    var attributionHTML = document.getElementsByClassName("leaflet-control-attribution")[0].innerHTML;
    var mapCreatorAttribution = documentSettings["Your Name:"] === '' ? '' : 'Map data: ' + documentSettings["Your Name:"] + '<br>';
    attributionHTML = mapCreatorAttribution + '<a href="http://mapsfor.us/">Mapsfor.us</a> created by <a href="http://www.codeforatlanta.org/">Code for Atlanta</a><br>' + attributionHTML;
    document.getElementsByClassName("leaflet-control-attribution")[0].innerHTML = attributionHTML;
  }
};
