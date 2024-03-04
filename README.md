## Hey ESRI

A project to showcase various services provided by ESRI. And to incorporate NLP to support services over voice command.

This project is built using Ionic | Angular | Capacitor.

## Features

1) Explore Tab: Contains search widget, zoom widget and custom current location button.
2) Hey ESRI Tab: Contains speech recognition feature where user can perform below tasks via voice command
   - Search location: Example - **Search** Boulder, **Search** Denver, etc.
   - Directions: Example - Give Me **Directions** **From** Boulder **To** Denver, Find **Directions** **From** Boulder **To** Denver, Give Me **Direction** **From** Boulder **To** Denver, Find **Direction** **From** Boulder **To** Denver
   - Find nearby places: Example - Find **nearby** food, Find **nearby** gas station
   - Navigate to current location: Example  - My **current location**, Show me my **current location**, Give my **current location**
     
   Note: text in bold must be in your speech in order for speech recognition agent to serve your request
4) Directions Tab: Contains directions wizard where user can manually enter source and destination, and get the directions.

- Current location of the user is displayed on the map with pin icon, user can click on the pin to get current address and longitude-latitude details.
- When the route is displayed on the map for directions service, user can click on the source/destination to get step-by-step navigations.
- On getting results for nearby places, user can click on each places to get the address.

## Builds

App is available on 
- ios devices
- [Web](https://sparkling-banoffee-c32411.netlify.app)

Note: Web version has limitations with speech recognition hence **Hey ESRI** tab do not work well with web version of the app.

## Running it locally

1. Install required environments

- [Ionic environment Setup](https://ionicframework.com/docs/intro/environment)
- [Install Ionic CLI](https://ionicframework.com/docs/intro/cli)
- [Capacitor Environment Setup](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor ios](https://capacitorjs.com/docs/ios)


2. Clone repository
```
git clone https://github.com/sachi097/hey-esri.git
```

3. Update environment files
   
- add [ArcGIS Developers](https://developers.arcgis.com/sign-up/) api key in hey-esri/src/environments/environment.ts file and in environments.prod.ts (for production)

5. For web
```
ionic serve
```

5. For ios (assuming you have installed xcode and other required enviroments as per step)
```
ionic cap run ios --livereload --external
```

## Working Video

(Demo)[https://youtu.be/-tLXjn2hBHU]

## Future Works

1. Include features like current weather, weather predictions, disaster predictions.
2. Integrate Natural Language Processing to enhance speech to service abilities. Currently, speech to service works over bunch of pre-defined speech patterns. Hence, NLP will eliminate pre-defined speech patterns.
3. Enhance user interface and build app for android devices.

## Useful links

- [Map](https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html) - Class to create map instance with base map.
- [Basemap](https://developers.arcgis.com/javascript/latest/api-reference/esri-Basemap.html) - A basemap is a collection of layers that provide geographic context to a map or scene.
- [⁠MapView](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html) - A MapView displays a 2D view of a Map instance.
- [Widget](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html) - To add show search, zoom and locator widgets on the map. 
- [Find Places](https://developers.arcgis.com/javascript/latest/tutorials/find-places/) - To find nearby places ex: food, gas station, coffee shop, hotel, and etc.
- [Reverse Geocoding](https://developers.arcgis.com/javascript/latest/tutorials/reverse-geocode/) - To convert point [longitude, latitude] to address or place.
- [MarkerSymbol](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-MarkerSymbol.html) - Used to draw Point graphics in a FeatureLayer or individual graphics in a 2D MapView.
- [MarkerSymbol Samples](https://developers.arcgis.com/javascript/3/samples/portal_symbols/index.html) -  Portal to explore available ESRI marker symbols.
- [ArcGIS Maps SDK for JS](https://developers.arcgis.com/javascript/latest/) - ArcGIS API for JavaScript, is a developer product for building mapping and spatial analysis applications for the web.

## Found problems or have suggestions

Please feel free to drop questions, comments and raise issues.
You are welcome to create PRs.

## Please star the repository if you like it
