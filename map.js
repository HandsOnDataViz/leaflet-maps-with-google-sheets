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
    if (documentSettings[constants._initLat] !== '' && documentSettings[constants._initLon] !== '') {
      // center and zoom
      mapCenter = L.latLng(documentSettings[constants._initLat], documentSettings[constants._initLon]);
      map.setView(mapCenter);
    } else {
      var groupBounds = points.getBounds();
      mapZoom = map.getBoundsZoom(groupBounds);
      mapCenter = groupBounds.getCenter();
    }

    if (documentSettings[constants._initZoom] !== '') {
      mapZoom = parseInt(documentSettings[constants._initZoom]);
    }

    map.setView(mapCenter, mapZoom);

    // once map is recentered, open popup in center of map
    if (documentSettings[constants._infoPopupText] !== '') {
      initInfoPopup(documentSettings[constants._infoPopupText], mapCenter);
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
      if (point.Latitude !== '' && point.Longitude !== '') {
        var marker = L.marker([point.Latitude, point.Longitude], {
          icon: createMarkerIcon(point['Marker Icon'],
                'fa',
                point['Marker Color'].toLowerCase(),
                point['Marker Icon Color'])
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
        collapsed: false,
        position: decideBetween('_layersPos', 'topleft')
      }).addTo(map);
    }

    L.control.zoom({position: decideBetween('_zoomPos', 'topleft')}).addTo(map);

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
    if (documentSettings[constants._markercluster] === 'on') {
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
    document.title = documentSettings[constants._pageTitle];
    var points = tabletop.sheets(constants.pointsSheetName).elements;
    var layers = determineLayers(points);
    mapPoints(points, layers);

    $('<h6>' + documentSettings[constants._pointsTitle] + '</h6>').insertBefore('.leaflet-control-layers-base');
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
    var basemap = decideBetween('_tileProvider', 'Stamen.TonerLite');

    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);

    L.control.attribution({
      position: decideBetween('_attrPos', 'bottomright')
    }).addTo(map);

    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var mapCreatorAttribution = '';

    if (documentSettings[constants._authorName] && documentSettings[constants._authorEmail]) {
      mapCreatorAttribution = 'Map data: <a href="mailto:' + documentSettings[constants._authorEmail];
      mapCreatorAttribution += '">' + documentSettings[constants._authorName] + '</a><br>';
    } else if (documentSettings[constants._authorName]) {
      mapCreatorAttribution = 'Map data: ' + documentSettings[constants._authorName] + '<br>';
    }

    $('.leaflet-control-attribution')[0].innerHTML = mapCreatorAttribution + attributionHTML;
  }

  function decideBetween(opt, def) {
    if (!documentSettings[constants[opt]] || documentSettings[constants[opt]] === '') {
      return def;
    }
    return documentSettings[constants[opt]];
  }

};
