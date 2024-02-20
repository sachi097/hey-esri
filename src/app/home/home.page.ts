import { ChangeDetectorRef, Component, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { solve } from '@arcgis/core/rest/route';
import Color from '@arcgis/core/Color';
import RouteResult from '@arcgis/core/rest/support/RouteResult';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import Widget from '@arcgis/core/widgets/Widget';
import RouteLayer from '@arcgis/core/layers/RouteLayer';
import Directions from '@arcgis/core/widgets/Directions';
import Search from '@arcgis/core/widgets/Search';
import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import Zoom from '@arcgis/core/widgets/Zoom';
import Point from '@arcgis/core/geometry/Point';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { locationToAddress, addressToLocations } from "@arcgis/core/rest/locator";
import AddressCandidate from "@arcgis/core/rest/support/AddressCandidate";
import { Geolocation } from '@capacitor/geolocation';
import { IonModal, SegmentCustomEvent, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { suggestionResponse, suggestion, addressCandidate } from '../services/suggestions.service';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('directionsModal')
  directionsModal!: IonModal;
  @ViewChild('sourceModal')
  sourceModal!: IonModal;
  @ViewChild('destinationModal')
  destinationModal!: IonModal;
  @ViewChild('navigationModal')
  navigationModal!: IonModal;
  @ViewChild('speechModal')
  speechModal!: IonModal;

  private view: MapView = new MapView;
  private zoomWidget: Zoom = new Zoom;
  private locatorWidget: HTMLElement | null = null;
  private searchWidget: Search = new Search;
  private directionsWidget: Directions = new Directions;
  private currentLocation: Point = new Point;
  private apiKey = environment.apiKey;
  private geoCodeUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer?f=json&token=" + this.apiKey;
  private routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World?f=json&token=" + this.apiKey;
  public sourceQueryText = "";
  public destinationQueryText = "";
  public source: suggestion = {
    isCollection: false,
    magicKey: "",
    text: ""
  };
  public destination: suggestion = {
    isCollection: false,
    magicKey: "",
    text: ""
  };
  public sourceSuggestions: suggestion[] = [];
  public destinationSuggestions: suggestion[] = [];
  public navigations: Graphic[] = [];
  public recording = false;
  public detectedText = "";
  private processTimeSet = false;
  private reverseGeoCodingDetails: AddressCandidate = new AddressCandidate;

  constructor(private http: HttpClient, private toastCtrl: ToastController, private changeDetectorRef: ChangeDetectorRef) {
    SpeechRecognition.requestPermissions();
  }

  async ngOnInit() {

    const position = await Geolocation.getCurrentPosition();
    this.currentLocation = new Point({
      longitude: position.coords.longitude,
      latitude: position.coords.latitude
    })

    esriConfig.apiKey = this.apiKey;
    const map = new Map({
      basemap: "osm"
    });

    this.view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 16,
      center: this.currentLocation,
      ui: {
        components: ["attribution"]
      }
    });

    this.zoomWidget = new Zoom({
      view: this.view,
      layout: "horizontal"
    });

    this.locatorWidget = document.getElementById("myOwnLocatorButton");
    this.locatorWidget?.addEventListener("click", async () => await this.locatorAction(this.view));

    this.view.ui.add(["myOwnLocatorButton", this.zoomWidget], "bottom-left");

    this.searchWidget = new Search({
      view: this.view
    });

    this.view.ui.add(this.searchWidget, "bottom-right");
    this.reverseGeoCodingDetails = await locationToAddress(this.geoCodeUrl, { location: this.currentLocation });
    this.addAddressInfo(this.view, this.reverseGeoCodingDetails);

    this.directionsModal.ionModalWillPresent.subscribe(() => {
      this.clearDirections();
    });

    this.speechModal.ionModalWillPresent.subscribe(() => {
      this.speakText("Hey there! How can I help you?");
    });

  }

  trackBySuggestion: TrackByFunction<suggestion> = (index, suggestion: suggestion) => (suggestion.magicKey + index);

  trackByNavigation: TrackByFunction<Graphic> = (index, navigation: Graphic) => (navigation.getObjectId() + index);

  locatorAction(view: MapView) {
    var gotoOption = {
      animate: true,
      duration: 600,
    };
    return view.goTo({
      target: this.currentLocation,
      zoom: 16
    }, gotoOption);
  }

  addAddressInfo(view: MapView, reverseGeoCodingDetails: AddressCandidate) {
    var symbol = new PictureMarkerSymbol({ "angle": 0, "xoffset": 0, "yoffset": 10, "url": "http://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png", "width": 30, "height": 40 });
    const currentPositionGraphic = new Graphic({
      geometry: this.currentLocation,
      symbol: symbol,
      popupTemplate: {
        title: "Your Location",
        content: reverseGeoCodingDetails.attributes.LongLabel +
          "<br><br>" +
          reverseGeoCodingDetails.location.longitude.toFixed(5) +
          ", " +
          reverseGeoCodingDetails.location.latitude.toFixed(5)
      }
    });
    view.graphics.add(currentPositionGraphic);
  }

  segmentOnChange(event: SegmentCustomEvent) {
    switch (event.detail.value) {
      case "explore":
        this.locatorAction(this.view);
        this.clearDirections();
        break;
      case "speak":
        this.clearDirections();
        break;
      case "directions":
        const routeLayer = new RouteLayer();
        this.view.map.layers.add(routeLayer);
        break;
    }
  }

  removeWidgets(widgets: (HTMLElement | Widget)[]) {
    widgets.forEach(widget => {
      if (widget.id != "myOwnLocatorButton") {
        this.view.ui.remove(widget.id);
      }
    });
  }

  async findDirections() {
    if (this.source.text && this.destination.text) {
      var navigationGraphics = this.view.graphics.toArray().slice(1);
      const routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: this.view.graphics.toArray().slice(1)
        }),
        returnDirections: true
      });
      const routeData = await solve(this.routeUrl, routeParams);
      routeData.routeResults.forEach((result: RouteResult) => {
        result.route.symbol = {
          type: "simple-line",
          color: new Color([5, 150, 255]),
          // @ts-ignore
          width: 5
        };
        this.view.graphics.add(result.route);
        this.view.center = new Point((this.view.graphics.toArray().slice(1))[0].geometry);
        this.view.zoom = 10;
      });
      if (routeData.routeResults.length > 0) {
        this.navigations = routeData.routeResults[0].directions.features;
        navigationGraphics.forEach((graphic: Graphic) => {
          graphic.set("popupTemplate", {
            title: "Navigations",
            content: ""
          });
          this.navigations.forEach(function (result, i) {
            graphic.popupTemplate.content += result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)" + "</br>";
          });
        });
      }
      this.directionsModal?.dismiss();
    }
    else {
      const toast = await this.toastCtrl.create({
        message: "Select Source and Destination",
        duration: 1000,
        color: 'dark',
        position: 'top'
      });
      await toast.present();
    }
  }

  clearDirections() {
    const addedGraphics = this.view.graphics.toArray().slice(1);
    addedGraphics.forEach((graphic: Graphic) => {
      this.view.graphics.remove(graphic);
    })
    this.source = {
      isCollection: false,
      magicKey: "",
      text: ""
    };
    this.destination = {
      isCollection: false,
      magicKey: "",
      text: ""
    };
  }

  sourceQuery(fromModal: boolean) {
    this.sourceSuggestions = [];
    if (this.sourceQueryText) {
      this.http.get<suggestionResponse>("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&token=" + this.apiKey + "&text=" + this.sourceQueryText).subscribe((response) => {
        this.sourceSuggestions = response.suggestions;
        if (!fromModal) {
          this.selectSource(this.sourceSuggestions[0]);
        }
      });
    }
  }

  destinationQuery(fromModal: boolean) {
    this.destinationSuggestions = [];
    if (this.destinationQueryText) {
      this.http.get<suggestionResponse>("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&token=" + this.apiKey + "&text=" + this.destinationQueryText).subscribe((response) => {
        this.destinationSuggestions = response.suggestions;
        if (!fromModal) {
          this.selectDestination(this.destinationSuggestions[0]);
        }
      });
    }
  }

  selectSource(source: suggestion) {
    this.source = source;
    this.findAddressCandidates(this.source, "source");
    this.sourceModal?.dismiss();
    this.sourceQueryText = "";
    this.sourceSuggestions = [];
  }

  selectDestination(destination: suggestion) {
    this.destination = destination;
    this.findAddressCandidates(this.destination, "destination");
    this.destinationModal?.dismiss();
    this.destinationQueryText = "";
    this.destinationSuggestions = [];
  }

  findAddressCandidates(address: suggestion, type: string) {
    this.http.get<addressCandidate>("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&token=" + this.apiKey + "&singleLine=" + address.text + "&magicKey=" + address.magicKey).subscribe((response) => {
      this.addGraphic(type, new Point(response.candidates[0].location))
    });
  }

  addGraphic(type: string, point: Point) {
    const graphic = new Graphic({
      symbol: {
        // @ts-ignore
        type: "simple-marker",
        color: (type === "source") ? "green" : "red",
        size: "15px"
      },
      geometry: point
    });
    this.view.graphics.add(graphic);
  }

  addNearByPlaceGraphic(address: AddressCandidate) {
    this.view.graphics.add(
      new Graphic({
        attributes: address.attributes,
        geometry: address.location,
        symbol: {
          // @ts-ignore
          type: "simple-marker",
          color: "skyblue",
          size: "12px",
        },

        popupTemplate: {
          title: "{PlaceName}",
          content: "{Place_addr}"
        }
      })
    );
  }

  findNearByPlaces(category: string) {
    addressToLocations(this.geoCodeUrl, {
      address: {
        "field_name": this.reverseGeoCodingDetails.attributes.LongLabel
      },
      location: this.view.center,
      categories: [category],
      maxLocations: 25,
      outFields: ["Place_addr", "PlaceName"]
    }).then((results) => {
      this.clearDirections();
      results.forEach((result) => {
        this.addNearByPlaceGraphic(result);
      });
      this.view.zoom = 15;
    }).catch(async () => {
      const toast = await this.toastCtrl.create({
        message: "Sorry no result found",
        duration: 1000,
        color: 'dark',
        position: 'top'
      });
      await toast.present();
    });

  }


  async startRecorder() {
    const { available } = await SpeechRecognition.available();
    if (available) {
      this.recording = true;
      SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
        popup: false
      });
      SpeechRecognition.addListener("partialResults", (data: any) => {
        if (data.matches && data.matches.length > 0) {
          this.detectedText = data.matches[0];
          if (!this.processTimeSet) {
            this.processTimeSet = true;
            setTimeout(() => {
              this.processText();
            }, 3000);
          }
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  async stopRecorder() {
    this.recording = false;
    await SpeechRecognition.removeAllListeners();
    await SpeechRecognition.stop();
  }

  async processText() {
    this.stopRecorder();
    var currentSpeech = this.detectedText.trim().toLocaleLowerCase();
    if (currentSpeech.search("direction") !== -1 || currentSpeech.search("directions") !== -1) {
      this.searchWidget.clear();
      if (currentSpeech.search("from") !== -1 && currentSpeech.search("to") !== -1) {
        var source = currentSpeech.split("from")[1];
        var destination = currentSpeech.split("to")[1];
        this.sourceQueryText = source.trim().split(" ")[0];
        this.destinationQueryText = destination.trim().split(" ")[0];
        this.sourceQuery(false);
        this.destinationQuery(false);
        await this.speakText("Okay! Please Wait.");
        this.findDirections();
        this.speechModal.dismiss();
        this.detectedText = "";

      }
      if (currentSpeech.search("clear directions") !== -1) {
        await this.speakText("Okay! Please Wait.");
        this.clearDirections();
        this.speechModal.dismiss();
        this.detectedText = "";
      }
    }
    else if (currentSpeech.search("search") !== -1 && currentSpeech.search("nearby") === -1 && currentSpeech.search("near by") === -1) {
      this.clearDirections();
      if (currentSpeech.search("clear search") !== -1 || currentSpeech.search("clear current search") !== -1) {
        await this.speakText("Okay! Taking you to your current location.");
        this.searchWidget.clear();
        this.locatorAction(this.view);
        this.speechModal.dismiss();
        this.detectedText = "";
      }
      else {
        var searchTerm = currentSpeech.split("search")[1];
        await this.speakText("Okay! Please Wait.");
        this.searchWidget.search(searchTerm);
        this.speechModal.dismiss();
        this.detectedText = "";
      }
    }
    else if (currentSpeech.search("current location") !== -1) {
      this.clearDirections();
      await this.speakText("Okay! Please Wait.");
      this.searchWidget.clear();
      this.locatorAction(this.view);
      this.speechModal.dismiss();
      this.detectedText = "";
    }
    else if (currentSpeech.search("hey") !== -1 || currentSpeech.search("hello") !== -1 || currentSpeech.search("hi") !== -1) {
      await this.speakText("Hi! Hope you are having wonderful time with Hey ESRI.");
      this.detectedText = "";
    }
    else if (currentSpeech.search("nearby") !== -1 || currentSpeech.search("near by") !== -1) {
      this.clearDirections();
      var category = currentSpeech.split("nearby")[1] || currentSpeech.split("near by")[1];
      await this.speakText("Okay! Please Wait.");
      this.findNearByPlaces(category.trim());
      this.speechModal.dismiss();
      this.detectedText = "";
    }
    else {
      await this.speakText("Sorry! I did not get you.");
      this.detectedText = "";
    }
    this.processTimeSet = false;
  }

  async speakText(text: string) {
    await TextToSpeech.speak({
      text: text,
      lang: "en-US"
    });
  }

}
