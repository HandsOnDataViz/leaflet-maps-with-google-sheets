# Leaflet Maps with Google Sheets
Create Leaflet maps with a linked Google Sheets template.
- friendly and easy-to-learn searchable map tool with flexibility for advanced users
- create clickable point maps with marker icons, images, and layer controls
- design color-coded polygon maps with dynamic numeric or text legends
- upload and geocode address data, and set map options, in Google Sheets
- host your polygon data and live web map with GitHub Pages
- responsive web design for both small and large devices
- built entirely with open-source code, and no usage limits

## Demo
- Leaflet Map https://jackdougherty.github.io/leaflet-maps-with-google-sheets/index.html
- Google Sheet template https://docs.google.com/spreadsheets/d/1ZxvU8eGyuN9M8GxTU9acKVJv70iC3px_m3EVFsOHN9g/edit#gid=0

## BETA version
- Report bugs and see TO DO items in [Issues](https://github.com/JackDougherty/leaflet-maps-with-google-sheets/issues)

## Create your own map

Design and host your own map on the public web, add your point and/or polygon data, and customize its appearance. *Quick directions for now -- with illustrations to come soon*

These steps require that you sign up and log into a:
- free GitHub account (https://github.com/) to edit two lines of open-source code
- free Google Drive account (https://drive.google.com) to copy and edit the Google Sheets template

#### A) Fork/copy this code repository and publish with GitHub Pages
- Click the Fork button, in the upper-right corner of this code repository, to create a copy of the code in your account.
- Reminder to fix later: if you have already created a fork of this repo, for your second version you will need to (rename original? clone or download?)
- Your new repository will have a web address in this format: 
```
https://github.com/USERNAME/leaflet-maps-with-google-sheets
```
- Click the Settings button, in the upper-right section of your new repository.
- On the Settings page, scroll down to the GitHub Pages section, select Source > master branch, and click Save.
- GitHub Pages has published the *default* map from your code repository as a live public web page, which you can view by clicking on the link displayed after "Your site is published at...". It will appear in this format: 
```
https://USERNAME.github.io/leaflet-maps-with-google-sheets/
```
- Copy the link to your live web page above.
- Go back to your GitHub code repository home page.
- Click on the README.md file. To edit this file, click the pencil symbol in the upper-right.
- In the Demo section, paste the link to your live web page from above.
- Scroll down and click the green Commit Changes button, which saves your edits to your GitHub repo.
- Go back to your GitHub repo home page. The new link you pasted to your default map should appear in the lower half of this page. Test it.
- Reminder to fix later: need to remove the dev branch from this public repo to avoid confusing newcomers.

#### B) Make a copy and publish the Google Sheets template
- Your live web map currently displays data from the *default* Google Sheet template. To insert your own data, you will need to make a copy and edit one line of code in your GitHub repository.
- In your GitHub repo home page, click on the [Google Sheet template link]( https://docs.google.com/spreadsheets/d/1ZxvU8eGyuN9M8GxTU9acKVJv70iC3px_m3EVFsOHN9g/edit#gid=0).
- Make sure that you are logged into your Google Drive account, and select File > Make a Copy. Insert a new name to associate it with your new map data, and save it in a folder where you can find it again later, then click OK.
- In your new Google Sheet, click File > Publish to the Web. (Leave the drop-downs as "Entire Document" and "Web page"). Click Publish. All data that you enter below will be *public*.
- In your browser address bar, copy the long ID for your new Google Sheet, appears between "/d/" and "/edit...". It will look similar this:
![](https://github.com/JackDougherty/leaflet-maps-with-google-sheets/blob/master/tutorial/lmwgs-google-sheet-id.jpg)

- In your GitHub repo home page, click on the file named GoogleDocID.js, and click the pencil symbol to edit it.
- Replace the default Google Sheet ID by pasting your own from above. Do not erase the quote marks.
- Scroll down and click the green Commit Changes button to save your edits.

#### C) Add your point and/or polygon data and customize your map
- Go back to your live web map, which now displays data from your new Google Sheet. Keep both open in separate browser tabs or windows. When you make changes to your Google Sheet, click the refresh button in the live map to update the display.
- The Google Sheet contains three tabs (labeled at the bottom): Options, Points, Polygons.
- In the Options tab, type in your map title, use drop-downs to select map background, and so forth.
- In the Points tab, each row represents a point on your map. Type or paste in data, image links, addresses, and so forth.
  - To geocode addresses inside this Google Sheet, select the Address-Latitude-Longtiude columns, and click the Geocode > Selected Cells (Address to Lat Long) menu. (Geocoding is an add-on feature that does not appear in default Google Sheets.)
  - Group related points into Categories that you can define, which will appear as layers on the map.
- In the Polygons tab... TO DO: explain how polygon data must be prepared in GeoJSON format and uploaded into your GitHub repo (see example: ct-towns-density.geojson); refer to http://DataVizForAll.org tutorials on how to prepare your polygon data
  - find polygon data
  - refer to tutorial on how GeoJSON data is organized by "properties" -- refer to book and include this exercise: Open your GeoJSON polygon map file with http://geojson.io or http://mapshaper.org to view property categories (such as "name") and values for each item
  - if needed, convert polygon data from shapefile or KML format into GeoJSON format with http://geojson.io
  - if needed, edit polygon data and join/merge tables of new data with http://mapshaper.org

## Credits (and licenses)
Created by [Ilya Ilyankou](https://github.com/ilyankou) and Jack Dougherty, using a [Google Sheets](https://www.google.com/sheets/about/) template, with these open-source components:
- Code for Atlanta mapsfor.us (2016) https://github.com/codeforatlanta/mapsforus (BSD-3-Clause)
- Leaflet v1.0.1 https://github.com/Leaflet/Leaflet (BSD-2-Clause)
- jQuery v3.1.0 https://jquery.org (MIT)
- leaflet-providers (v1.1.15) https://github.com/leaflet-extras/leaflet-providers (BSD-2-Clause)
- Mapzen leaflet-geocoder (customized version) https://github.com/ilyankou/leaflet-geocoder (based on v1.7.1, with API key) https://github.com/mapzen/leaflet-geocoder (MIT)
- leaflet-locatecontrol (v0.55.0) https://github.com/domoritz/leaflet-locatecontrol (MIT)
- Leaflet.markercluster (v1.0.0) https://github.com/Leaflet/Leaflet.markercluster (MIT)
- Font Awesome (current version via CDN) https://cdn.fontawesome.com (MIT, SIL OFL 1.1)
- Leaflet.awesome-markers (v2.0.2) https://github.com/lvoogdt/Leaflet.awesome-markers (MIT)
- Single Element CSS Spinner (31 May 2016) https://github.com/lukehaas/css-loaders (MIT)
- Tabletop.js, gives spreadsheets legs, by returning Google Sheets data in JSON format (v1.4.3) https://github.com/jsoma/tabletop (MIT)
- Google Colour Palette Generator (2015) https://github.com/google/palette.js (MIT)
- Google Sheets Geocoding Macro (2016) https://github.com/nuket/google-sheets-geocoding-macro (no license)
