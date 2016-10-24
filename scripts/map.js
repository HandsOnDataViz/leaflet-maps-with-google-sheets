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

  var markerColors = [];

  // possibly refactor this so you can add points to layers without knowing what all the layers are beforehand
  // run this function after document is loaded but before mapPoints()
  function determineLayers(points) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in points) {
      var pointLayerNameFromSpreadsheet = points[i].Layer;
      if (layerNamesFromSpreadsheet.indexOf(pointLayerNameFromSpreadsheet) === -1) {
        markerColors.push(points[i]['Marker Color']);
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
        }).bindPopup("<b>" + point['Title'] + '</b><br>' +
          (point['Image'] ? ('<img src="' + point['Image'] + '"><br>') : '') +
          point['Description']);
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

    $('<h6>' + documentSettings[constants._pointsTitle] + '</h6>').insertBefore('.leaflet-control-layers-base');
    centerAndZoomMap(group);
  }

  // Store bucket info for Polygons
  var prop = [];  // an array of bucket properties
  var propName = [];  // nice human names of prop
  var divisors = [];  // sets of divisors
  var colors = [];  // sets of colors
  var isNumerical = []; // array of true/false values
  var geoJsonLayer;
  var polygonLayer; // represents the number of radio button (properties switch)
  var polygons;

  function processPolygons(polygons) {
    prop = documentSettings[constants._bucketProp].split(' ').join('').split(';');
    propName = documentSettings[constants._bucketPropName].split(';');

    if (prop.length != propName.length) {
      alert('Error in Polygons: The number of properties and their aliases has to match');
      return;
    }

    divisors = documentSettings[constants._bucketDivisors].split(';');

    if (divisors.length != prop.length) {
      alert('Error in Polygons: The number of sets of divisors has to match the number of properties');
      return;
    }

    colors = documentSettings[constants._bucketColors].split(' ').join('').split(';');

    for (i = 0; i < divisors.length; i++) {
      divisors[i] = divisors[i].split(',');
      if (!colors[i]) {
        colors[i] = [];
      } else {
        colors[i] = colors[i].split(' ').join('').split(',');
      }
    }

    for (i = 0; i < divisors.length; i++) {
      if (divisors[i].length == 0) {
        alert('Error in Polygons: The number of divisors should be > 0');
        return; // Stop here
      } else if (colors[i].length == 0) {
        // If no colors specified, generate the colors
        colors[i] = palette(decideBetween('_colorScheme', 'tol-sq'), divisors[i].length);
        for (j = 0; j < colors[i].length; j++) {
          colors[i][j] = '#' + colors[i][j];
        }
      } else if (divisors[i].length != colors[i].length) {
        alert('Error in Polygons: The number of divisors should match the number of colors');
        return; // Stop here
      }
    }

    // For each set of divisors, decide whether textual or numerical
    for (i = 0; i < divisors.length; i++) {
      if (!isNaN(parseFloat(divisors[i][0].trim()))) {
        isNumerical[i] = true;
        for (j = 0; j < divisors[i].length; j++) {
          divisors[i][j] = parseFloat(divisors[i][j].trim());
        }
      } else {
        isNumerical[i] = false;
      }
    }

    var legendPos = decideBetween('_legendPosition', 'off');
    var legend;
    if (legendPos == 'off') {
      legend = L.control({position: 'topleft'});
    } else {
      legend = L.control({position: legendPos});
    }

    legend.onAdd = function (map) {
      var content = '<h6>' + documentSettings[constants._legendTitle] + '</h6><form>';

      for (i = 0; i < prop.length; i++) {
        content += '<input type="radio" name="prop" value="';
        content += i + '"> ' + propName[i] + '<br>';
      }

      content += '<input type="radio" name="prop" value="-1"> Off</form><div class="legend-scale">';

      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = content;
      div.innerHTML += '</div>';
      return div;
    };
    legend.addTo(map);

    if (legendPos == 'off') {
      $('.legend').hide();
    }
  }


  function polygonStyle(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: decideBetween('_outlineColor', 'white'),
      dashArray: '3',
      fillOpacity: decideBetween('_colorOpacity', '0.7'),
      fillColor: getColor(feature.properties[prop[polygonLayer]])
    };
  }


  function getColor(d) {
    var i;

    if (isNumerical[polygonLayer]) {
      i = colors[polygonLayer].length - 1;
      while (d < divisors[polygonLayer][i]) i--;
    } else {
      for (i = 0; i < colors[polygonLayer].length - 1; i++) {
        if (d == divisors[polygonLayer][i]) break;
      }
    }

    return colors[polygonLayer][i];
  }


  function onEachFeature(feature, layer) {
    var info = '';
    var imgUrl = '';
    for (i in polygons) {
      info += polygons[i][constants.polygonsPropName];
      info += ': <b>' + feature.properties[polygons[i][constants.polygonsProp]] + '</b><br>';
    }

    if (documentSettings[constants._polygonDisplayImages] == 'on') {
      imgUrl = feature.properties[polygons[i]['img']];
      // Attach image if url exists
      if (imgUrl) {
        info += '<img src="' + imgUrl + '">';
      }
    }
    layer.bindPopup(info);
  }


  function updatePolygons(p) {
    if (p == '-1') {
      $('.legend-scale').hide();
      map.removeLayer(geoJsonLayer);
      return;
    }

    polygonLayer = p;

    if (!geoJsonLayer) {
      // Load the very first time
      $.getJSON(documentSettings[constants._geojsonURL], function(data) {
        geoJsonLayer = L.geoJson(data, {
          style: polygonStyle,
          onEachFeature: onEachFeature
        }).addTo(map);
      });
    } else if (!map.hasLayer(geoJsonLayer)) {
      // Load every time after 'Off'
      geoJsonLayer.addTo(map);
      geoJsonLayer.setStyle(polygonStyle);
    } else {
      // Just update colors
      geoJsonLayer.setStyle(polygonStyle);
    }

    $('.legend-scale').html('');

    var labels = [];
    var from, to;

    for (var i = 0; i < divisors[p].length; i++) {
      from = divisors[p][i];
      to = divisors[p][i + 1];

      labels.push(
        '<i style="background:' + getColor(from) + '"></i> ' +
        from + ((to && isNumerical[p]) ? '&ndash;' + to : (isNumerical[p]) ? '+' : ''));
    }

    $('.legend-scale').html(labels.join('<br>'));
    $('.legend-scale').show();
  }


  // reformulate documentSettings as a dictionary, e.g.
  // {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
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
    createDocumentSettings(tabletop.sheets(constants.optionsSheetName).elements);
    document.title = documentSettings[constants._pageTitle];
    addBaseMap();

    var points = tabletop.sheets(constants.pointsSheetName).elements;
    polygons = tabletop.sheets(constants.polygonsSheetName).elements;
    var layers = determineLayers(points);

    mapPoints(points, layers);

    if (documentSettings[constants._geojsonURL]) {
      processPolygons(polygons);
      $('input:radio[name="prop"]').change(function() {
        updatePolygons($(this).val());
      });
      $('input:radio[name="prop"][value="0"]').click();
    }

    // Add search
    if (documentSettings[constants._mapSearch] == 'on') {
      var b = decideBetween('_searchBounds', '').split(')').join('').split('(').join('');
      var SW, NE;

      if (b) {
        b = b.split(',');
        SW = L.latLng(parseFloat(b[0]), parseFloat(b[1]));
        NE = L.latLng(parseFloat(b[2]), parseFloat(b[3]));
      }

      L.control.geocoder('mapzen-VBmxRzC', {
        focus: true,
        position: decideBetween('_mapSearchPos', 'topright'),
        bounds: (SW && NE) ? L.latLngBounds(SW, NE) : false,
        zoom: decideBetween('_searchZoom', 12),
        circle: true,
        circleRadius: decideBetween('_searchCircleRadius', 1),
        autocomplete: false,
        searchInsteadAutocomplete: true,
      }).addTo(map);
    }

    // Add location control
    if (documentSettings[constants._locateControlPos] !== 'off') {
      var locationControl = L.control.locate({
        keepCurrentZoomLevel: true,
        returnToPrevBounds: true,
        position: decideBetween('_locateControlPos', 'topright')
      }).addTo(map);
    }

    // Add zoom control
    L.control.zoom({position: decideBetween('_zoomPos', 'topleft')}).addTo(map);

    addTitle();
    changeAttribution();

    // Show map and hide the loader
    $('#map').css('visibility', 'visible');
    $('.loader').hide();

    // Generate color squares for marker layers control; prepend = before text, append = after text
    $('.leaflet-control-layers-overlays div span').each(function(i) {
      $(this).prepend('&nbsp;<i class="fa fa-map-marker" style="color: '
        + markerColors[i]
        + '"></i>');
    });
  }

  var tabletop = Tabletop.init( { key: googleDocID, // from constants.js
    callback: function(data, tabletop) { onTabletopLoad() }
  });


  function addTitle() {
    var title = documentSettings[constants._pageTitle];
    var dispTitle = documentSettings[constants._displayTitle];

    if (dispTitle !== 'off') {
      if (dispTitle == 'on map') {
        $('div.leaflet-left.leaflet-top').prepend('<h3>' + title + '</h3>');
      } else if (dispTitle == 'in points box') {
        $('.leaflet-control-layers-list').prepend('<h3>' + title + '</h3>');
      } else if (dispTitle == 'in polygons box') {
        $('.legend').prepend('<h3>' + title + '</h3>');
      }
    }
  }


  function initInfoPopup(info, coordinates) {
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }


  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;

    var credit = 'View <a href="https://docs.google.com/spreadsheets/d/'
      + googleDocID + '" target="_blank">data</a>';

    var name = documentSettings[constants._authorName];
    var url = documentSettings[constants._authorURL];

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + documentSettings[constants._githubRepo] + '">code</a> with ';

    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }


  function addBaseMap() {
    var basemap = decideBetween('_tileProvider', 'Stamen.TonerLite');

    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);

    L.control.attribution({
      position: decideBetween('_attrPos', 'bottomright')
    }).addTo(map);
  }


  // Returns the value of option named opt from constants.js
  // or def if option is either not set or does not exist
  // Both arguments are strings
  // e.g. decideBetween('_authorName', 'No Author')
  function decideBetween(opt, def) {
    if (!documentSettings[constants[opt]] || documentSettings[constants[opt]] === '') {
      return def;
    }
    return documentSettings[constants[opt]];
  }

};
