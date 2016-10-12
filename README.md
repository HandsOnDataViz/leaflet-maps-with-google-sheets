# leaflet-map-google-sheets
Create a Leaflet point and polygon map from a Google Sheets template

**BETA** version -- share feedback in [Issues](https://github.com/JackDougherty/leaflet-map-google-sheets/issues)

## Jack's Demo
- Leaflet Map https://jackdougherty.github.io/leaflet-map-google-sheets/index.html
- Google Sheet template https://docs.google.com/spreadsheets/d/1ZxvU8eGyuN9M8GxTU9acKVJv70iC3px_m3EVFsOHN9g/edit#gid=0

## Ilya's Demo
- Leaflet Map https://ilyankou.github.io/leaflet-map-google-sheets/index.html
- Google Sheet template https://docs.google.com/spreadsheets/d/1BaAENFyC4w78tiLAQ8UU0YD4DJwDiQnpUMTo6Pb_pSA/edit#gid=164271551

## Create you own map

Quick directions for now -- with illustrations to come soon

Create and host your own map on the public web, add your point and/or polygon data, and customize its appearance.

These steps require that you sign up and log into a:
- free GitHub account (https://github.com/) to edit two lines of open-source code
- free Google Drive account (https://drive.google.com) to copy and edit the Google Sheets template

#### Fork/copy this code repository and publish with GitHub Pages
- Click the Fork button, in the upper-right corner of this code repository, to create a copy of the code in your account.
- Reminder to fix later: if you have already created a fork of this repo, for your second version you will need to (rename original? clone or download?)
- Your new repository will have a web address in this format: https://github.com/USERNAME/leaflet-map-google-sheets
- Click the Settings button, in the upper-right section of your new repository.
- On the Settings page, scroll down to the GitHub Pages section, select Source > master branch, and click Save.
- GitHub Pages has published the *default* map from your code repository as a live public web page, which you can view by clicking on the link displayed after "Your site is published at...". It will appear in this format: https://USERNAME.github.io/leaflet-map-google-sheets/
- Copy the link to your live web page above.
- Go back to your GitHub code repository home page.
- Click on the README.md file. To edit this file, click the pencil symbol in the upper-right.
- In the Demo section, paste the link to your live web page from above.
- Scroll down and click the green Commit Changes button, which saves your edits to your GitHub repo.
- Go back to your GitHub repo home page. The new link you pasted to your default map should appear in the lower half of this page. Test it.
- Reminder to fix later: need to remove the dev branch from this public repo to avoid confusing newcomers.

#### Make a copy and publish the Google Sheets template
- Your live web map currently displays data from the *default* Google Sheet template. To insert your own data, you will need to make a copy and edit one line of code in your GitHub repository.
- In your GitHub repo home page, click on the [Google Sheet template link]( https://docs.google.com/spreadsheets/d/1ZxvU8eGyuN9M8GxTU9acKVJv70iC3px_m3EVFsOHN9g/edit#gid=0).
- Make sure that you are logged into your Google Drive account, and select File > Make a Copy. Insert a new name to associate it with your new map data, and save it in a folder where you can find it again later, then click OK.
- In your new Google Sheet, click File > Publish to the Web. (Leave the drop-downs as "Entire Document" and "Web page"). Click Publish. All data that you enter below will be *public*.
- Your new Google Sheet has a long web address, which will be *similar* to this one:
```
https://docs.google.com/spreadsheets/d/1BaAENFyC4w78tiLAQ8UU0YD4DJwDiQnpUMTo6Pb_pSA/edit#gid=0
```
- Copy the Google Sheet ID, which appears between "/d/" and "/edit", *similar* to this:
```
1BaAENFyC4w78tiLAQ8UU0YD4DJwDiQnpUMTo6Pb_pSA
```
- In your GitHub repo home page, click on the file named GoogleDocID.js, and click the pencil symbol to edit it.
- Replace the default Google Sheet ID by pasting your own from above. Do not erase the quote marks.
- Scroll down and click the green Commit Changes button to save your edits.

#### Add your point and/or polygon data and customize your map
- Go back to your live web map, which now displays data from your new Google Sheet. Keep both open in separate browser tabs or windows. When you make changes to your Google Sheet, click the refresh button in the live map to update the display.
- The Google Sheet contains three tabs (labeled at the bottom): Options, Points, Polygons.
- In the Options tab, type in your map title, use drop-downs to select map background, and so forth.
- In the Points tab, each row represents a point on your map. Type or paste in data, image links, addresses, and so forth.
  - To geocode addresses inside this Google Sheet, select the Address-Latitude-Longtiude columns, and click the Geocode > Selected Cells (Address to Lat Long) menu. (Geocoding is an add-on feature that does not appear in default Google Sheets.)
  - Group related points into Categories that you can define, which will appear as layers on the map.
- In the Polygons tab... TO DO: explain how polygon data must be prepared in GeoJSON format and uploaded into your GitHub repo (see example: ct-towns-density.geojson); refer to http://DataVizForAll.org tutorials on how to prepare your polygon data
  - find polygon data
  - if needed, convert polygon data from shapefile or KML format into GeoJSON format with http://geojson.io
  - if needed, edit polygon data and join/merge tables of new data with http://mapshaper.org

## TO DO
- Bug testing
- Create better default point and polygon data that shows some meaning (Hartford area schools?)
- Rethink and revise labels and hints in Google Sheet, and modify contants.js to match
- Freeze the Settings column in Google Sheet to avoid accidental renaming?
- Create an alternative Google Sheets Macro to “Geocode Address from US Census API” with two extra columns for match quality; See http://www.census.gov/geo/maps-data/data/geocoder.html and click Documentation to read about this API
- Create option for more advanced users to save the contents of their finalized Google Sheet as three CSV files (Options, Points, Polygons), to be uploaded into GitHub repo, for a longer-term stable version of the map that is not tied to a dynamic Google Sheet


## Credits (and licenses)
Created by [Ilya Ilyankou](https://github.com/ilyankou) and Jack Dougherty, using a Google Sheets template, with these open-source components:
- mapsfor.us (2016) https://github.com/codeforatlanta/mapsforus (BSD-3-Clause)
- Leaflet v1.0.1 https://github.com/Leaflet/Leaflet (BSD-2-Clause)
- leaflet-providers (CHECK version) https://github.com/leaflet-extras/leaflet-providers (BSD-2-Clause)
- Mapzen leaflet-geocoder (customized v1.7.1; requires API key) https://github.com/mapzen/leaflet-geocoder (MIT)
- leaflet-locatecontrol (CHECK version)https://github.com/domoritz/leaflet-locatecontrol (MIT)
- Leaflet.markercluster (CHECK version) https://github.com/Leaflet/Leaflet.markercluster (MIT)
- Font Awesome (CHECK version) https://github.com/FortAwesome/Font-Awesome (MIT, SIL OFL 1.1)
- Leaflet.awesome-markers (CHECK version) https://github.com/lvoogdt/Leaflet.awesome-markers (MIT)
- Single Element CSS Spinner (31 May 2016) https://github.com/lukehaas/css-loaders (MIT)
- Tabletop (CHECK version) https://github.com/jsoma/tabletop (MIT)
- Google Colour Palette Generator (2015) https://github.com/google/palette.js (MIT)
- Google Sheets Geocoding Macro (2016) https://github.com/nuket/google-sheets-geocoding-macro (no license)
