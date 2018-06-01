/*
 * This javascript file contains all the dependencies function from the navigation page.
 * The main execution code of this page is written at the far bottom.
 *
 * Contributor: 
 * 1. Kok Yuan Ting 29269016
 * 2. Lau Lee Yan 	29338328
 * 3. Liew Ze Ching 28937031
 *
 * Last modified: 19/5/18
 */

'use strict';

// =============================================================================================================================== //
// Variables 
let map = null;
let currentPath = null;
let selectedPath = null;
let positionHistory = [];
let currentPathIndex = 0;
let id = null;
let marker = null;
let accCircle = null;
let waypointMarkers = [];
let userHeading = 0;
let startTime = null;
let currentSpeed = 0;
let prevLatLng = null;
let distanceTravelled = 0;
let userWalkedPath = [];
let currentGeoTs = 0;


// Accuracy Options for Geolocation API
let geoOptions = {
	enableHighAccuracy: true,
	timeout: 60000,
	maximumAge: 0
}

// =============================================================================================================================== //
// Functions

/*
 * Displays the map object into the canvas in nav page.
 */
function initMap() {
    // Initialise map, centred on Monash Malaysia Campus.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: selectedPath.latlng[0].lat,
            lng: selectedPath.latlng[0].lng,
        },
        zoom: 18,
        disableDefaultUI: true
    });

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
}

/*
 * Obtain the selected index from localStorage
 * then build the selected path object for easy access.
 */
function getSelectedPath() {

	let pathIndex = localStorage.getItem(SELECTED_KEY);
	selectedPath = pathList[pathIndex];

	let startNav = document.getElementById("startNavigation");
	startNav.innerHTML += "<p class=\"selectedPathTitle\">" + selectedPath.title + "</p>";
}

/*
 * Draw a polyline and place markers according the selectedPath points
 * ref: 1. https://developers.google.com/maps/documentation/javascript/reference/3/#Polyline
 *      2. https://developers.google.com/maps/documentation/javascript/examples/marker-remove
 */
function drawAndMarkPath() {

	// To refresh all the markers on the map
	if(waypointMarkers.length != 0) {

		for(let item of waypointMarkers) {
			item.setMap(null);
		}
		waypointMarkers = [];
	}

	for(let i = 0; i < selectedPath.latlng.length; i++) {

		let markerPosition = new google.maps.LatLng(selectedPath.latlng[i]);

		let waypointMarker = new google.maps.Marker({
			position: markerPosition,
			map: map
		});

		waypointMarkers.push(waypointMarker);
		
	}

	// Refreshed the polyline drawn on the map
	if (currentPath != null) {
		currentPath.setMap(null);
	}

    currentPath = new google.maps.Polyline({
        path: selectedPath.latlng,
        geodesic: true,
        strokeColor: 'black',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    // Display in map
    currentPath.setMap(map);

}

/*
 * Access the current geolocation and store it in an array and remove the start nav view
 * the geolocation.watchPosition() will update everytime the gps
 * location of the device changes.
 * ref: 1. https://developers.google.com/maps/documentation/javascript/reference/3/#InfoWindow
 *      2. https://www.w3schools.com/html/html5_geolocation.asp
 *      3. https://w3c.github.io/geolocation-api/#navi-geo
 */
function getCurrentGeolocation() {

	// Remove the div
	let ref = document.getElementById("startNavigation");
	ref.style.display = "none";
	// Display the bottom info and direction window
	ref = document.getElementById("footerInfo");
	ref.style.display = "block";
	ref = document.getElementById("directionWindow");
	ref.style.display = "block";

	// Try HTML5 geolocation.
	if (navigator.geolocation) {

	    id = navigator.geolocation.watchPosition((position) => {
	    	// Success

	    	if (Date.now() != currentGeoTs) {
	    		
	    		currentGeoTs = Date.now();
	    		let pos = {
	    		    lat: position.coords.latitude,
	    		    lng: position.coords.longitude,
	    		    acc: position.coords.accuracy
	    		};

	    		positionHistory.push(pos);
	    		displayAccuracyCircle(pos);
	    		displayMarker(pos);
	    		main(pos);
	    		map.setCenter(pos);
	    	}
	    }, 
	    // Fail
	    errorHandler(2),
	    // Options 
	    geoOptions);
	} else {
	    errorHandler(3);
	}

}

/*
 * This displays the marker in the position given in the parameter
 * ref: https://developers.google.com/maps/documentation/javascript/markers
 */
function displayMarker(pos) {

	// Refreshed the marker drawn on the map
	if (marker != null) {
		marker.setMap(null);
	}


	marker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: {
      		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      		scale: 4,
      		rotation: userHeading
    	}
	});


}

/*
 * This displays the visual representation of GPS accuracy
 * ref: https://developers.google.com/maps/documentation/javascript/examples/circle-simple
 */
 function displayAccuracyCircle(pos) {
 		let currentAcc = pos.acc;
 		let circleColor = null;

 		if(currentAcc < 30) {
 			circleColor = "#00FF00";
 		}
 		else {
 			circleColor = "#FF0000";
 		}

 		// Refreshed the marker drawn on the map
 		if (accCircle != null) {
 			accCircle.setMap(null);
 		}


 		accCircle = new google.maps.Circle({
 			strokeColor: circleColor,
 			strokeOpacity: 0.8,
 			strokeWeight: 2,
 			fillColor: circleColor,
 			fillOpacity: 0.35,
 			center: pos,
 			map: map,
 			radius: pos.acc
 		});

 }

/*
 * This is the main function which will be called everytime watchposition() gets updated.
 * Function performs calculation for the required data and display them as visuals
 */
function main(pos) {

	let string = "";
	let tag1 = "<li class=\"infoWindowList\"><span style='margin: 5%'>";
	let tag2 = "</span><span style='float: right; margin-right: 5%;'>";
	let tag3 = "</span></li>";
	let display = document.getElementById("infoWindow");
	let distanceFromNextPoint = computeDistance(pos,selectedPath.latlng[currentPathIndex]);
	let highAccuracy = (pos.acc < 160) ? true : false;

	// If all the path has been dequeue (reached last point)
	if (selectedPath.latlng.length == 0) {
		// End the geolocation service
		navigator.geolocation.clearWatch(id);
		document.getElementById("shadowDiv").style.display = 'block';
		document.getElementById("inputTitleField").style.display = 'block';
	}

	// Only updates when accuracy is high
	if (highAccuracy) {

		if (userHeading > 180) {
			userHeading -= 360;
		}
	
		// Compute location heading
		let locationHeading = computeHeading(pos,selectedPath.latlng[currentPathIndex]);
	
		// Check if the user has reached a checkpoint when accuracy is high to prevent false positive
		if (distanceFromNextPoint <= pos.acc && highAccuracy) {
			// Remove the visited paths on the map
			selectedPath.dequeue();
			drawAndMarkPath();
		}
	
		// Start the timer to keep track of the amount of time elapsed, used to calculate average walking speed
		if (startTime === null) {
			startTime = Date.now();		
			prevLatLng = pos;
		}
		else {
			let millis = Date.now() - startTime;
			distanceTravelled += computeDistance(pos,prevLatLng);
			currentSpeed = distanceTravelled/Math.floor(millis/1000);
			prevLatLng = pos;
			//string += tag1 + "millis:" + millis + "m" + tag3;
		}
	
		// Display data into a list under the map
		string = tag1 + "Coordinates" + tag2 + pos.lat.toFixed(4) + ", " + pos.lng.toFixed(4) + tag3; 
		string += tag1 + "Accuracy" + tag2 + pos.acc + " m" + tag3;
		string += tag1 + "Next Point" + tag2 + distanceFromNextPoint.toFixed(1) + " m" + tag3;
		string += tag1 + "Average Speed" + tag2 + currentSpeed.toFixed(0) + " m/s" + tag3;
		string += tag1 + "Distance Travelled" + tag2 + distanceTravelled.toFixed(0) + " m" +  tag3;
		let distanceRemaining = (selectedPath.distance - distanceTravelled);
		string += tag1 + "Distance Remaining" + tag2 + distanceRemaining.toFixed(0) + " m" + tag3;
		let eta = (distanceRemaining/currentSpeed) / 60;
		if (eta === Infinity) eta = 0;
		string += tag1 + "ETA" + tag2 + eta.toFixed(0) + "min" + tag3;
		string += tag1 + "Heading" + tag2 + userHeading + tag3;
	
		getDirection(userHeading,locationHeading);
	
		// Display data into the actual interface
		let leftInfo = document.getElementById("leftInfo");
		leftInfo.innerHTML = "<div class='speedInfo'><span style='font-size: 24px'>" + currentSpeed.toFixed(0) + "</span><br>m/s" + "</div>";
	
		let midInfo = document.getElementById("midInfo");
		midInfo.innerHTML = "<div class='distanceInfo'>" + distanceRemaining.toFixed(0) + "m remaining" + "</div>";
		midInfo.innerHTML += "<div class='ETAInfo'>" + "ETA " + eta.toFixed(0) + "min</div>";
	}
	else {
		console.log("Low accuracy!")
		string = tag1 + "Accuracy" + tag2 + pos.acc + " m" + tag3;
		displayMessage("Accuracy is too low! Please get away from covers.")
	}

	display.innerHTML = string;
	
}

/*
 * This function will get the relative direction in degrees.
 * Function then displays a visual command of where the user should head next
 */
function getDirection(userHeading,locationHeading) {

	let headingDiff = locationHeading - userHeading;
	let action = "";
	let actionWindow = document.getElementById("directionText");

	let svg = document.getElementById("direction");

	if (headingDiff > 100 || headingDiff < -100)
	{
	    svg.src = "images/uturn.svg";
	    action = "U-TURN";
	}
	else if (headingDiff < 100 && headingDiff > 80 )
	{
	    svg.src = "images/right.svg";
	    action = "TURN RIGHT";
	}
	else if (headingDiff > -100 && headingDiff < -80)
	{
	    svg.src = "images/left.svg";
	    action = "TURN LEFT";
	}
	
	else if (headingDiff < 80 && headingDiff > 30)
	{
	    svg.src = "images/slight_right.svg";
	    action = "SLIGHT RIGHT";
	}
	else if (headingDiff > -80 && headingDiff < -30)
	{
	    svg.src = "images/slight_left.svg";
	    action = "SLIGHT LEFT";
	}
	else
	{
	   svg.src = "images/straight.svg";
	   action = "HEAD STRAIGHT";
	}

	actionWindow.innerHTML = action;
}

/*
 * Compute the distance between two points
 */
function computeDistance(point1,point2) {

	let firstPoint = new google.maps.LatLng(point1);
	let nextPoint = new google.maps.LatLng(point2);


	return google.maps.geometry.spherical.computeDistanceBetween(firstPoint,nextPoint);
}

/*
 * Compute the heading between two points
 */
function computeHeading(point1,point2) {

	let firstPoint = new google.maps.LatLng(point1);
	let nextPoint = new google.maps.LatLng(point2);


	return google.maps.geometry.spherical.computeHeading(firstPoint,nextPoint);
}

// =============================================================================================================================== //
// Main execution

/* From W3C DeviceOrientation Event specification:
 * http://w3c.github.io/deviceorientation/spec-source-orientation.html
 * Code below checks for orientation capability
 */ 
if ('ondeviceorientationabsolute' in window) {

	window.addEventListener('deviceorientationabsolute', function(e) {
		if (e.webkitCompassHeading) {
			userHeading = e.webkitCompassHeading;
		}
		else {
			userHeading = 360 - e.alpha;
		}
		//let bearing = document.getElementById('bearing');
		//bearing.innerHTML = userHeading + "<br>";
	});
} 
else if ('ondeviceorientation' in window) {

	window.addEventListener('deviceorientation', function(e) {
		if (e.webkitCompassHeading) {
			userHeading = e.webkitCompassHeading;
		}
		else {
			userHeading = 360 - e.alpha;
		}
		let bearing = document.getElementById('bearing');
		bearing.innerHTML = userHeading + "<br>";
	});
}
else {
	errorHandler(4);
}


// Set delay to make sure googleAPI is fully loaded.
setTimeout(() => {
	getSelectedPath();
	initMap();	
	drawAndMarkPath();
}, 200);
