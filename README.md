## Hey ESRI

A project to showcase various services provided by ESRI. And to incorporate NLP to support service over voice command.

This project is built using Ionic | Angular | Capacitor.

## Features

1) Explore Tab: Contains search widget, zoom widget and custom current location button.
2) Hey ESRI Tab: Contains speech recognisation feature where user can perform below tasks via voice command
                 - Search location: Example - **Search** Boulder, **Search** Denver, etc.
                 - Directions: Example - Give Me **Directions** **From** Boulder **To** Denver, Find **Directions** **From** Boulder **To** Denver, Give Me **Direction** **From** Boulder **To** Denver, Find **Direction** **From** Boulder **To** Denver
                 - Find nearby places: Example - Find **nearby** food, Find **near by** gas station
                 - Navigate to current location: Example  - My **current location**, Show me my **current location**, Give my **current location**
   Note: text in bold must be in your speech in order for speech recognisation agent to serve your request
3) Directions Tab: Contains directions wizard where user can manually enter source and destionation, and get the directions.

- Current location of the user is diplayed on the map with pin icon, user can click on the pin to get current address and longitude-latitude details.
- When the route is displayed on the map for directions service, user can click on the source/destination to get step-by-step navigations.
- On getting results for nearby places, user can click on each places to get the address.

## Builds

App is available on 
- ios devices
- Web

Note: Web version has limitations with speech recognisation hence **Hey ESRI** tab do not work well with web version of the app.

## Running it locally

1. Install required environments
```
[Ionic environment Setup](https://ionicframework.com/docs/intro/environment)
[Install Ionic CLI](https://ionicframework.com/docs/intro/cli)
[Capacitor Environment Setup](https://capacitorjs.com/docs/getting-started/environment-setup)
[Capacitor ios](https://capacitorjs.com/docs/ios)
```

2. Clone and Update environment files
```
git clone https://github.com/sachi097/hey-esri.git
add [arcgis developer](https://developers.arcgis.com/sign-up/) api key in hey-esri/src/environments/environment.ts file and in environments.prod.ts (for production)
```
3. For web
```
ionic serve
```

4. For ios (assuming you have installed xcode and other required enviroments as per step)
```
ionic cap run ios --livereload --external
```
## Working Video

(video)[link]

## Future Works

1. Include features like current weather, weather predictions, disaster predictions.
2. Intigrate Natural Langauage Processing to enhance speech to service abilities. Currently, speech to service works over bunch of pre-defined speech patterns. Hence, NLP will eliminate pre-defined speech patterns.
3. Enhance user interface and build app for android devices.

## Find problems or have suggestions

Please feel free to drop questions, comments and raise issues.
You are welcome to create PRs.
