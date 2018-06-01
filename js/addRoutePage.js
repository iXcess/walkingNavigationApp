/*
 * This javascript file contains all the dependencies function from the addRoute.js.
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
let currentSetPosition = null;
let currentPositionIndex = 0;
let currentPath = null;
let finalPath = null;
let setLatLng = [];
let markers = [];
let firstPoint = true;

// =============================================================================================================================== //
// Functions

/*
 * Displays the map object into the canvas in nav page.
 */
function initMap() {

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition((position) => {

	    	currentSetPosition = {
	    		lat: position.coords.latitude,
	            lng: position.coords.longitude
	    	};

	    	console.log(currentSetPosition.lat + "1");
	        // Initialise map, centred on user current location
	        map = new google.maps.Map(document.getElementById('map'), {
	            center: {
	                lat: position.coords.latitude,
	                lng: position.coords.longitude
	            },
	            zoom: 18,
	            disableDefaultUI: true
	        });

	        map.mapTypes.set('styled_map', styledMapType);
    		map.setMapTypeId('styled_map');
	        displayDraggableMarker(currentSetPosition);
	    }, errorHandler(2));
	} else {
	    errorHandler(3);
	}

}

/*
 * This displays the marker in the position given in the parameter
 * ref: https://developers.google.com/maps/documentation/javascript/markers
 */
function displayDraggableMarker(pos) {

	let marker = new google.maps.Marker({
		position: pos,
		map: map,
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	// Update the position of the marker everytime the drag event ends
	marker.addListener('dragend', () => {

		currentSetPosition = {
			lat: marker.getPosition().lat(),
			lng: marker.getPosition().lng()
		}

	});

	markers.push(marker);
}

/*
 * Draw a polyline according the selectedPath points
 * ref: 1. https://developers.google.com/maps/documentation/javascript/reference/3/#Polyline
 *      2. https://developers.google.com/maps/documentation/javascript/examples/marker-remove
 */
function drawPath() {

	// Refreshed the polyline drawn on the map
	if (currentPath != null) {
		currentPath.setMap(null);
		finalPath.setMap(null);
	}

    currentPath = new google.maps.Polyline({
        path: setLatLng.slice(0,-1),
        geodesic: true,
        // Lime Green - #00FF00, Hot Pink - #FF69B4
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    finalPath = new google.maps.Polyline({
        path: setLatLng.slice(-2),
        geodesic: true,
        // Lime Green - #00FF00, Hot Pink - #FF69B4
        strokeColor: '#FF69B4',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    // Display in map
    currentPath.setMap(map);
    finalPath.setMap(map);

}

/*
 * This function will save a point in a path and then immediately 
 * add a new draggable marker for user to add a new point.
 */
function setPoint() {
	setLatLng.push(currentSetPosition);

	// Let the previous marker to be non draggable
	markers[currentPositionIndex].draggable = false;
	currentPositionIndex++;

	if(!firstPoint) {
		drawPath();
	}

	firstPoint = false;
	displayDraggableMarker(currentSetPosition);	
}

/*
 * This function will undo the latest setPoint
 */
function undoPoint() {
	// Do nothing if nothing haven't been set yet
	if (setLatLng.length === 0) return;

	setLatLng.pop();
	currentPositionIndex--;
	markers[currentPositionIndex].setMap(null);
	markers.splice(currentPositionIndex, 1);
	drawPath();
}

/*
 * This function will move the draggable marker into the current new map center
 */
function moveMarker() {

	markers[currentPositionIndex].setMap(null);
	markers.pop();

	let pos = map.getCenter();

	// Enable setPoint to work without 'dragend' event
	currentSetPosition = {
		lat: pos.lat(),
		lng: pos.lng()
	}

	let marker = new google.maps.Marker({
		position: pos,
		map: map,
		animation: google.maps.Animation.DROP,
		draggable: true
	});

	// Update the position of the marker everytime the drag event ends
	marker.addListener('dragend', () => {

		currentSetPosition = {
			lat: marker.getPosition().lat(),
			lng: marker.getPosition().lng()
		}

	});

	markers.push(marker);
}

/*
 * Pan map to center
 */
function panToCenter() {

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition((position) => {

	    	let pos = {
	    		lat: position.coords.latitude,
	            lng: position.coords.longitude
	    	};

	    	map.panTo(pos);
	    }, errorHandler(2));
	} else {
	    errorHandler(3);
	}

}

/*
 * This function will create display a pop-up using css
 */
function proceed() {
	let ref = document.getElementById("shadowDiv");
	ref.style.display = 'block';
	ref = document.getElementById("inputTitleField");
	ref.style.display = 'block';
}

/*
 * This function persist the entire path newly defined by the user into localStorage
 */
function finalisePath() {

	let titleInput = document.getElementById("titleInput");

	console.log(titleInput.value);

	if (titleInput.value === "" || setLatLng.length < 2) {
		errorHandler(5);
	}
	else {

		let params = null;
		let path = [{
			title: titleInput.value,
			locations: setLatLng,
		}];

		let fromStorage = localStorage.getItem(ADDED_ROUTE_KEY);

		if (fromStorage === null) {
			params = path;
		}
		else {
			params = JSON.parse(fromStorage);
			params.push(path[0]);
		}
		

		// Check for localStorage availability and store the data
		// in localStorage
		if (typeof(Storage) !== "undefined") {
			let pathJSON = JSON.stringify(params);

			// Set this to another part of localstorage
			// So it will not get erased everytime mainpage loads
			localStorage.setItem(ADDED_ROUTE_KEY, pathJSON);
		}
		else {
			errorHandler(1);
		}	
	}
	

}

// =============================================================================================================================== //
// Main execution

// Set delay to make sure googleAPI is fully loaded.
setTimeout(() => {
	initMap(); 
}, 200);
