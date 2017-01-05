# Leaflet Maps with Google Sheets
Create Leaflet maps with a linked Google Sheets template.
- friendly and easy-to-learn searchable map tool with flexibility for advanced users
- clickable point data layers with custom marker icons and pop-up images
- color-coded polygon data layers with numeric or text legends
- upload and geocode addresses, and set map options, in the Google Sheet template
- host your live web map and polygon data with GitHub Pages
- responsive web design for both small and large devices
- built entirely with open-source code, and no usage limits

## Demo
- Leaflet Map https://jackdougherty.github.io/leaflet-maps-with-google-sheets/index.html
- Google Sheet template https://docs.google.com/spreadsheets/d/1ZxvU8eGyuN9M8GxTU9acKVJv70iC3px_m3EVFsOHN9g/edit#gid=0

## BETA version
- Report bugs and suggest features in [Issues](https://github.com/JackDougherty/leaflet-maps-with-google-sheets/issues)

## Create your own
- Requires: sign up for free accounts on Google Drive and GitHub
- Fork/copy this GitHub code repo and publish in your Settings > GitHub Pages
- File > Make a Copy of Google Sheets template, and File > Publish
- Paste your Google Sheets URL into the google-doc-url.js file on GitHub
- Customize your map settings in your Google Sheets Options tab
- Geocode address data and customize markers in the Points tab
- Upload polygon/polyline GeoJSON data to GitHub geometry folder and modify in Sheets tabs

Step-by-step illustrated tutorial (in progress) at http://datavizforall.org/leaflet/with-google-sheets/

## Credits (and licenses)
Created by [Ilya Ilyankou](https://github.com/ilyankou) and Jack Dougherty, using a [Google Sheets](https://www.google.com/sheets/about/) template, with these open-source components:
- Code for Atlanta mapsfor.us (2016) https://github.com/codeforatlanta/mapsforus (BSD-3-Clause)
- Leaflet v1.0.1 https://github.com/Leaflet/Leaflet (BSD-2-Clause)
- jQuery v3.1.0 https://jquery.org (MIT)
- leaflet-providers (v1.1.15, manually updated Carto https) https://github.com/leaflet-extras/leaflet-providers (BSD-2-Clause)
- Mapzen leaflet-geocoder (customized version) https://github.com/ilyankou/leaflet-geocoder (based on v1.7.1, with API key) https://github.com/mapzen/leaflet-geocoder (MIT)
- leaflet-locatecontrol (v0.55.0) https://github.com/domoritz/leaflet-locatecontrol (MIT)
- Leaflet.markercluster (v1.0.0) https://github.com/Leaflet/Leaflet.markercluster (MIT)
- Font Awesome (v4.6.3 via CDN) https://cdn.fontawesome.com (MIT, SIL OFL 1.1)
- Leaflet.awesome-markers (v2.0.2) https://github.com/lvoogdt/Leaflet.awesome-markers (MIT)
- Single Element CSS Spinner (31 May 2016) https://github.com/lukehaas/css-loaders (MIT)
- Tabletop.js, gives spreadsheets legs, by returning Google Sheets data in JSON format (v1.4.3) https://github.com/jsoma/tabletop (MIT)
- Google Colour Palette Generator (2015) https://github.com/google/palette.js (MIT)
- Google Sheets Geocoding Macro (2016) https://github.com/nuket/google-sheets-geocoding-macro (no license)
- ADD MORE DETAILS ON: polylabels.js, which contains two libraries: https://github.com/mapbox/polylabel + TinyQueue (https://github.com/mourner/tinyqueue needed for polylabel to work)
- ADD MORE DETAILS ON: jQuery-csv (jQuery Plugin) MIT License, by Evan Plaice. https://github.com/evanplaice/jquery-csv
