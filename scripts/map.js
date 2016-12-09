window.onload = function () {

  var documentSettings = {};
  var markerColors = [];

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
    if (getSetting('_initLat') !== '' && getSetting('_initLon') !== '') {
      // center and zoom
      mapCenter = L.latLng(getSetting('_initLat'), getSetting('_initLon'));
      map.setView(mapCenter);
    } else {
      var groupBounds = points.getBounds();
      mapZoom = map.getBoundsZoom(groupBounds);
      mapCenter = groupBounds.getCenter();
    }

    if (getSetting('_initZoom') !== '') {
      mapZoom = parseInt(getSetting('_initZoom'));
    }

    map.setView(mapCenter, mapZoom);
  }


  // possibly refactor this so you can add points to layers without knowing what all the layers are beforehand
  // run this function after document is loaded but before mapPoints()
  function determineLayers(points) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in points) {
      var pointLayerNameFromSpreadsheet = points[i].Group;
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

      // If icon contains '.', assume it's a path to a custom icon,
      // otherwise create a Font Awesome icon
      var icon = (point['Marker Icon'].indexOf('.') > 0)
        ? L.icon({iconUrl: point['Marker Icon']})
        : createMarkerIcon(point['Marker Icon'],
              'fa',
              point['Marker Color'].toLowerCase(),
              point['Marker Icon Color']);

      if (point.Latitude !== '' && point.Longitude !== '') {
        var marker = L.marker([point.Latitude, point.Longitude], {icon: icon})
          .bindPopup("<b>" + point['Title'] + '</b><br>' +
          (point['Image'] ? ('<img src="' + point['Image'] + '"><br>') : '') +
          point['Description']);

        if (layers !== undefined && layers.length !== 1) {
          marker.addTo(layers[point.Group]);
        }

        markerArray.push(marker);
      }
    }

    var group = L.featureGroup(markerArray);
    // if layers.length === 0, add points to map instead of layer
    if (layers === undefined || layers.length === 0) {
      clusterMarkers(group);
    } else {
      var pos = (getSetting('_layersPos') == 'off')
        ? 'topleft'
        : getSetting('_layersPos');

      var pointsLegend = L.control.layers(null, layers, {
        collapsed: false,
        position: pos,
      }).addTo(map);

      pointsLegend._container.id = 'points-legend';

      if (getSetting('_layersPos') == 'off') {
        $('.leaflet-control-layers').hide();
      }
    }

    $('<h6>' + getSetting('_pointsTitle') + '</h6>')
      .insertBefore('.leaflet-control-layers-base')
      .click(function() {
        $('.leaflet-control-layers-overlays').toggle();
      });

    centerAndZoomMap(group);
  }

  /**
   * Store bucket info for Polygons
   */
  var popupProperties = []; // properties to be shown in popup window
  var polygonLayers = []; // GeoJSON layers
  var divisors = [];  // sets of divisors
  var colors = [];  // sets of colors
  var isNumerical = []; // array of true/false values for each set
  var geoJsonLayer;
  var pLayer; // number representing current layer among layers in legend

  function processPolygons() {
    popupProperties = getSetting('_popupProp').split(';');
    polygonLayers = getSetting('_polygonLayers').split(';');

    for (i in popupProperties) {
      popupProperties[i] = popupProperties[i].split(',');
    }

    for (i in polygonLayers) {
      polygonLayers[i] = polygonLayers[i].split(',');
    }

    divisors = getSetting('_bucketDivisors').split(';');

    if (divisors.length != polygonLayers.length) {
      alert('Error in Polygons: The number of sets of divisors has to match the number of properties');
      return;
    }

    colors = getSetting('_bucketColors').split(';');

    for (i = 0; i < divisors.length; i++) {
      divisors[i] = divisors[i].split(',');
      for (j = 0; j < divisors[i].length; j++) {
        divisors[i][j] = divisors[i][j].trim();
      }
      if (!colors[i]) {
        colors[i] = [];
      } else {
        colors[i] = colors[i].split(',');
      }
    }

    for (i = 0; i < divisors.length; i++) {
      if (divisors[i].length == 0) {
        alert('Error in Polygons: The number of divisors should be > 0');
        return; // Stop here
      } else if (colors[i].length == 0) {
        // If no colors specified, generate the colors
        colors[i] = palette(trySetting('_colorScheme', 'tol-sq'), divisors[i].length);
        for (j = 0; j < colors[i].length; j++) {
          colors[i][j] = '#' + colors[i][j].trim();
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

    var legendPos = trySetting('_legendPosition', 'off');
    var legend = L.control({position: (legendPos == 'off') ? 'topleft' : legendPos});

    legend.onAdd = function(map) {
      var content = '<h6>' + getSetting('_legendTitle') + '</h6><form>';

      for (i in polygonLayers) {
        var layer = polygonLayers[i][1]
          ? polygonLayers[i][1].trim()
          : polygonLayers[i][0].trim();

        content += '<label><input type="radio" name="prop" value="' + i + '"> ';
        content += layer + '</label><br>';
      }

      content += '<label><input type="radio" name="prop" value="-1"> Off</label></form><div class="legend-scale">';

      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = content;
      div.innerHTML += '</div>';
      return div;
    };

    legend.addTo(map);

    $('.legend h6').click(function() {
      if ($('input[name=prop]:checked').val() != '-1') {
        $(this).siblings().toggle();
      } else {
        $('.legend>form').toggle();
      }
    });

    if (legendPos == 'off') {
      $('.legend').hide();
    }
  }

  /**
   * Generates CSS for each polygon in polygons
   */
  function polygonStyle(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: trySetting('_outlineColor', 'white'),
      dashArray: '3',
      fillOpacity: trySetting('_colorOpacity', '0.7'),
      fillColor: getColor(feature.properties[polygonLayers[pLayer][0].trim()])
    };
  }


  /**
   * Returns a color for polygon property with value d
   */
  function getColor(d) {
    var i;

    if (isNumerical[pLayer]) {
      i = colors[pLayer].length - 1;
      while (d < divisors[pLayer][i]) i -= 1;
    } else {
      for (i = 0; i < colors[pLayer].length - 1; i++) {
        if (d == divisors[pLayer][i]) break;
      }
    }

    return colors[pLayer][i].trim();
  }


  /**
   * Generates popup windows for every polygon
   */
  function onEachFeature(feature, layer) {
    var info = '';

    for (i in popupProperties) {
      if (popupProperties[i] == '') {
        continue;
      }
      info += popupProperties[i][1]
        ? popupProperties[i][1].trim()
        : popupProperties[i][0].trim();

      info += ': <b>' + feature.properties[popupProperties[i][0].trim()] + '</b><br>';
    }

    if (getSetting('_polygonDisplayImages') == 'on') {
      if (feature.properties['img']) {
        info += '<img src="' + feature.properties['img'] + '">';
      }
    }

    layer.bindPopup(info);

    // Add polygon label if needed
    if (getSetting('_polygonLabel') != '') {
      var myTextLabel = L.marker(polylabel(layer.feature.geometry.coordinates, 1.0).reverse(), {
          icon: L.divIcon({
              className: 'polygon-label',
              html: feature.properties[getSetting('_polygonLabel')],
          })
      });
      myTextLabel.addTo(map);
    }
  }

  /**
   * Loads polygons from layer p
   */
  function updatePolygons(p) {
    if (p == '-1') {
      $('.legend-scale').hide();
      map.removeLayer(geoJsonLayer);
      $('.polygon-label').hide();
      return;
    }

    pLayer = p;

    if (!geoJsonLayer) {
      // Load the very first time polygons-sample.geojson
      $.getJSON(getSetting('_geojsonURL'), function(data) {
        geoJsonLayer = L.geoJson(data, {
          style: polygonStyle,
          onEachFeature: onEachFeature
        }).addTo(map);
      });
      togglePolygonLabels();
    } else if (!map.hasLayer(geoJsonLayer)) {
      // Load every time after 'Off'
      geoJsonLayer.addTo(map);
      geoJsonLayer.setStyle(polygonStyle);
      togglePolygonLabels();

      // Toggle polylines (turn them off and then on) so they remain on top
      doubleClickPolylines();
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

  /**
   * Perform double click on polyline legend checkboxes so that they get
   * redrawn and thus get on top of polygons
   */
  function doubleClickPolylines() {
    $('#polylines-legend form label input').each(function(i) {
      $(this).click().click();
    });
  }

  function clusterMarkers(group) {
    if (getSetting('_markercluster') === 'on') {
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


  /**
   * Here all data processing from the spreadsheet happens
   */
  function onTabletopLoad() {
    var options = tabletop.sheets(constants.optionsSheetName).elements;
    var polygons = tabletop.sheets(constants.polygonsSheetName).elements;
    createDocumentSettings(options.concat(polygons));

    document.title = getSetting('_pageTitle');
    addBaseMap();

    // Add point markers to the map
    var points = tabletop.sheets(constants.pointsSheetName).elements;
    var layers = determineLayers(points);
    mapPoints(points, layers);

    // Add polygons to the map
    if (getSetting('_geojsonURL')) {
      processPolygons();
      $('input:radio[name="prop"]').change(function() {
        updatePolygons($(this).val());
      });
      $('input:radio[name="prop"][value="0"]').click();
    }

    // Add polylines
    var polylines = tabletop.sheets(constants.polylinesSheetName).elements;
    processPolylines(polylines);

    // Add Mapzen search control
    if (getSetting('_mapSearch') == 'on') {
      L.control.geocoder(trySetting('_mapzenKey', 'mapzen-VBmxRzC'), {
        focus: true,
        position: trySetting('_mapSearchPos', 'topright'),
        zoom: trySetting('_searchZoom', 12),
        circle: true,
        circleRadius: trySetting('_searchCircleRadius', 1),
        autocomplete: true,
      }).addTo(map);
    }

    // Add location control
    if (getSetting('_locateControlPos') !== 'off') {
      var locationControl = L.control.locate({
        keepCurrentZoomLevel: true,
        returnToPrevBounds: true,
        position: trySetting('_locateControlPos', 'topright')
      }).addTo(map);
    }

    // Add zoom control
    L.control.zoom({position: trySetting('_zoomPos', 'topleft')}).addTo(map);

    map.on('zoomend', function() {
      togglePolygonLabels();
    });

    addTitle();

    // Change Map attribution to include author's info + urls
    changeAttribution();

    // Generate color squares for marker layers control
    $('.leaflet-control-layers-overlays div span').each(function(i) {
      $(this).prepend('&nbsp;<i class="fa fa-map-marker" style="color: '
        + markerColors[i]
        + '"></i>');
    });

    // All processing has been done, so hide the loader and make the map visible
    $('#map').css('visibility', 'visible');
    $('.loader').hide();

    // Open intro popup window in the center of the map
    if (getSetting('_introPopupText') != '') {
      initIntroPopup(getSetting('_introPopupText'), map.getCenter());
    };
  }

  /**
   * Adds title and subtitle from the spreadsheet to the map
   */
  function addTitle() {
    var dispTitle = getSetting('_displayTitle');

    if (dispTitle !== 'off') {
      var title = '<h3>' + getSetting('_pageTitle') + '</h3>';
      var subtitle = '<h6>' + getSetting('_subtitle') + '</h6>';

      if (dispTitle == 'on map') {
        $('div.leaflet-top').prepend('<div class="map-title">' + title + subtitle + '</div>');
      } else if (dispTitle == 'in points legend') {
        $('#points-legend').prepend(title + subtitle);
      } else if (dispTitle == 'in polygons legend') {
        $('.legend').prepend(title + subtitle);
      }

      // If set to be displayed in polylines legend, this happens in
      // processPolylines() as <div> for the legend is created later, after the
      // first polyline geojson is processed.
    }
  }


  /**
   * Adds polylines to the map
   */
  function processPolylines(p) {
    if (!p || p.length == 0) return;

    var pos = (getSetting('_polylinePos') == 'off')
      ? 'topleft'
      : getSetting('_polylinePos');

    var polylinesLegend = L.control.layers(null, null, {
  	  position: pos,
  	  collapsed: false,
  	}).addTo(map);

    for (i = 0; i < p.length; i++) {
      $.getJSON(p[i]['GeoJSON URL'], function(index) {
        return function(data) {
          latlng = data['features'][0].geometry.coordinates;

          // Reverse [lon, lat] to [lat, lon] for each point
          for (j in latlng) {
            a = latlng[j][0];
            b = latlng[j][1];
            latlng[j] = [b, a];
          }

          line = L.polyline(latlng, {
            color: (p[index]['Color'] == '') ? 'grey' : p[index]['Color'],
            weight: trySetting('_polylineWeight', 2),
          }).addTo(map);

          if (p[index]['Description'] && p[index]['Description'] != '') {
            line.bindPopup(p[index]['Description']);
          }

          polylinesLegend.addOverlay(line,
            '<i class="color-line" style="background-color:' + p[index]['Color']
            + '"></i> ' + p[index]['Display Name']);

          if (index == 0) {
            polylinesLegend._container.id = 'polylines-legend';

            if (getSetting('_polylineTitle') != '') {
              $('#polylines-legend').prepend('<h6>' + getSetting('_polylineTitle') + '</h6>');

              // Add map title if set to be displayed in polylines legend
              if (getSetting('_displayTitle') == 'in polylines legend') {
                var title = '<h3>' + getSetting('_pageTitle') + '</h3>';
                var subtitle = '<h6>' + getSetting('_subtitle') + '</h6>';
                $('#polylines-legend').prepend(title + subtitle);
              }

              $('#polylines-legend h6').click(function() {
                $('#polylines-legend>form').toggle();
              });

              if (getSetting('_polylinePos') == 'off') {
                $('#polylines-legend').hide();
              }
            }
          }
        };
      }(i));
    }
  }


  function initIntroPopup(info, coordinates) {
    // This is a pop-up for mobile device
    if (window.matchMedia("only screen and (max-width: 760px)").matches) {
      $('body').append('<div id="mobile-intro-popup"><p>' + info +
        '</p><div id="mobile-intro-popup-close"><i class="fa fa-times"></i></div></div>');

      $('#mobile-intro-popup-close').click(function() {
        $("#mobile-intro-popup").hide();
      })
      return;
    }

    /* And this is a standard popup for bigger screens */
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }

  /**
   * Turns on and off polygon text labels depending on current map zoom
   */
  function togglePolygonLabels() {
    if (map.getZoom() <= trySetting('_polygonLabelMaxZoom', 9)) {
      $('.polygon-label').hide();
    } else {
      if ($('input[name=prop]:checked').val() != '-1') {
        $('.polygon-label').show();
      }
    }
  }

  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = 'View <a href="' + googleDocURL + '" target="_blank">data</a>';
    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a> with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }


  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'Stamen.TonerLite');
    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);
    L.control.attribution({
      position: trySetting('_attrPos', 'bottomright')
    }).addTo(map);
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  /**
   * Returns the value of setting named s from constants.js
   * or def if setting is either not set or does not exist
   * Both arguments are strings
   * e.g. trySetting('_authorName', 'No Author')
   */
  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  /**
   * Triggers the load of the spreadsheet and map creation
   */
  var tabletop = Tabletop.init({
    key: googleDocURL,
    callback: function(data, tabletop) { onTabletopLoad(); }
  });


  /**
   * Reformulates documentSettings as a dictionary, e.g.
   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
   */
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

};
