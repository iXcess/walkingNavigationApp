/*
 * This javascript file contains all the dependencies function from all the page.
 * The main execution code of this page is written at the far bottom.
 *
 * Contributor: 
 * 1. Kok Yuan Ting 29269016
 * 2. Lau Lee Yan   29338328
 * 3. Liew Ze Ching 28937031
 *
 * Last modified: 19/5/18
 */

 'use strict';

 let pathList = [];

 const DOMAIN_URL = "https://eng1003.monash/api/campusnav/";
 const GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/js";
 const STORAGE_KEY = "availablePaths";
 const SELECTED_KEY = "selectedPath";
 const ADDED_ROUTE_KEY = "addedPaths";
 let styledMapType = null;

 let googleApiRequestData = {
    "v": 3,
    "key": "AIzaSyBpvAOT4tY_62P62YjabOJTKJKkIqIrGLE",
    "libraries": "geometry",

 }
 let pathRequestData = {
    "campus": "sunway",
    "callback": "storePaths"
 }

 function initiateMapType() {
    let d = new Date();
    let currentHour = d.getHours();

      if(currentHour < 7 || currentHour > 19) {
        styledMapType = new google.maps.StyledMapType(
            [
              {
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#252525"
                  }
                ]
              },
              {
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#ffffff"
                  }
                ]
              },
              {
                "elementType": "labels.text.stroke",
                "stylers": [
                  {
                    "color": "#212121"
                  }
                ]
              },
              {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#757575"
                  }
                ]
              },
              {
                "featureType": "administrative.land_parcel",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "color": "#151515"
                  }
                ]
              },
              {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#181818"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "color": "#2c2c2c"
                  }
                ]
              },
              {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#373737"
                  }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#3c3c3c"
                  }
                ]
              },
              {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#4e4e4e"
                  }
                ]
              },
              {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#efefef"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#000000"
                  }
                ]
              }
            ], {
                name: 'Styled map'
            }
        );

      } else {
        styledMapType = new google.maps.StyledMapType(
            [
              {
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#f4f0f1"
                  }
                ]
              },
              {
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#111111"
                  }
                ]
              },
              {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#bdbdbd"
                  }
                ]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#4fd8c8"
                  }
                ]
              },
              {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#e5e5e5"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#ffffff"
                  }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#e9e9e9"
                  }
                ]
              },
              {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#3b3b3b"
                  }
                ]
              },
              {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#eeeeee"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                  {
                    "color": "#c9c9c9"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "color": "#ddfffc"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#9e9e9e"
                  }
                ]
              }
            ], {
                name: 'Styled map'
            }
        );
      }
 }

 /*
  * Data Provider
  * This function builds up a valid jsonp url for GET request.
  */
 function getWebService(url,data) {

    // Build URL parameters from data object.
     let params = "";
     // For each key in data object...
     for (let key in data)
     {
         if (data.hasOwnProperty(key))
         {
             if (params.length == 0)
             {
                 // First parameter starts with '?'
                 params += "?";
             }
             else
             {
                 // Subsequent parameter separated by '&'
                 params += "&";
             }

             let encodedKey = encodeURIComponent(key);
             let encodedValue = encodeURIComponent(data[key]);

             params += encodedKey + "=" + encodedValue;
          }
     }

     let script = document.createElement('script');
     script.src = url + params;

     document.body.appendChild(script);
 }

 /*
  * PathList class is initialised with all the available paths
  */
 function initialisePaths() {

    let fromStorage = localStorage.getItem(STORAGE_KEY);
    let params = JSON.parse(fromStorage);

    // Initialising all the paths
    let paths = new PathList();
    paths.initialiseFromPathListPDO(params);

    fromStorage = localStorage.getItem(ADDED_ROUTE_KEY);
    params = JSON.parse(fromStorage);

    paths.initialiseFromPathListPDO(params);
    pathList = paths.pathList();
 }

 /*
  * Takes in the error number and display them with toast
  * 1 - localStorage not supported
  * 2 - Geolocation update failed
  * 3 - Geolocation not supported
  * 4 - Compass not available
  * 5 - AddRoute title or path not defined
  */
function errorHandler(errorNumber) {

    let errorMsg = [
        "LocalStorage not supported",
        "Geolocation updated failed",
        "Geolocation is not supported for this device",
        "Compass is not supported for this device",
        "Please set the title and the points!"
    ];

    console.log(errorMsg[errorNumber-1]);
    displayMessage(errorMsg[errorNumber-1]);
}

 class Path {

    constructor() {
        // Private attributes:
        this._latlng = [];
        this._title = "";
        this._noOfTurns = 0;
        this._distance = 0;
    }

    // Public methods:

    get title() {
        return this._title;
    }

    get latlng() {
        return this._latlng;
    }

    get noOfTurns() {
        return this._noOfTurns;
    }

    get distance() {
        return this._distance;
    }

    set title(title) {
        this._title = title;
    }

    set latlng(latlng) {
        this._latlng = latlng;
    }

    set noOfTurns(noOfTurns) {
        this._noOfTurns = noOfTurns;
    }

    set distance(distance) {
        this._distance = distance;
    }

    dequeue() {
        this._latlng.shift();
    }

    initialiseFromPathPDO(entity) {
        // Initialise the instance via the mutator methods from the PDO object.

        this._title = entity.title;
        this._latlng = entity.locations;
        this._noOfTurns = this._calculateNoOfTurns();
        this._distance = this._calculateDistance();
    }

    // Private methods:

    // No of turns is just number of points - 2
    _calculateNoOfTurns() {
        return this._latlng.length - 2;
    }

    _calculateDistance() {

        let totalDistance = 0;
        for (let i = 0; i < this._latlng.length - 1; i++) {

            // Conversion of the points to LatLng object to be
            // used as a parameter in the geometry.spherical class
            // ref: https://developers.google.com/maps/documentation/javascript/reference/3/#spherical
            let point1 = new google.maps.LatLng(this._latlng[i]);
            let point2 = new google.maps.LatLng(this._latlng[i+1]);

            totalDistance += google.maps.geometry.spherical.computeDistanceBetween(point1,point2);
        }

        return totalDistance.toFixed(1);
    }

 }

 class PathList{

    constructor() {

        // Private attributes:
        this._pathList = [];
    }

    // Public methods:

    pathList() {
        return this._pathList;
    }

    // This function creates all the instances of paths and store it in _pathList
    // pathObjects are raw object obtained from the server.
    // Each single path entity contains "locations","prerecordedRoutesIndex", and "title".
    initialiseFromPathListPDO(pathObjects) {

        for (let eachPath in pathObjects) {
            let individualPath = pathObjects[eachPath];
            let newPath = new Path();

            // Initialise each path
            newPath.initialiseFromPathPDO(individualPath);
            this._pathList.push(newPath);
        }

    }

}


// Main execution starts

getWebService(GOOGLE_API_URL,googleApiRequestData);

// Set delay to make sure googleAPI is fully loaded.
setTimeout(() => {
    initiateMapType();
    initialisePaths();
}, 200);




