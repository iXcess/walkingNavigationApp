/*
 * This javascript file contains all the dependencies function from the main page.
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

/*
 * Persistent storing of paths into local storage 
 * whenever the index.html is reloaded using jsonp request.
 */
function storePaths(params) {

	// Check for localStorage availability and store the data
	// in localStorage
	if (typeof(Storage) !== "undefined") {
		let pathJSON = JSON.stringify(params);

		localStorage.setItem(STORAGE_KEY, pathJSON);
	}
	else {
		errorHandler(1);
	}
}


/*
 * Displays the path in index.html after pulling data from server
 * Input: The updated path array from shared.js
 */
function displayPaths(array) {

	let ul = document.getElementById("pathList");
	let construct = "";
	let index = 0;
	let tag1 = "<li class=\"mdl-list__item\" onclick=\"setAndDisplayPath(";
	let tag2 = ")\"><span class=\"mdl-list__item-primary-content\"><span>";
	let tag3 = "</span></span><li><span class=\"noOfTurns mdl-shadow--2dp\">";
	let tag4 = " turns</span><span class=\"distance mdl-shadow--2dp\">";
	let tag5 = " m</span>";

	for (let item of array) {

		if (index === 0) {
			construct += "<li class='mdl-list__item pathDisplayOptions'><span class=\"mdl-list__item-primary-content\"><span>" + "Server Routes" + "</span></li>"
		}
		if (index === 2) {
			construct += "<li class='mdl-list__item pathDisplayOptions'><span class=\"mdl-list__item-primary-content\"><span>" + "User Routes" + "</span></li>"
		}

		construct += tag1 + index + tag2 + item.title + tag3 + item.noOfTurns + tag4 + item.distance + tag5;
		index++;
	}

	ul.innerHTML = construct;
}


/*
 * Store the index value to be accessed in the nav page
 * and then load the nav page.
 * Input: Index value of the selected path.
 */
function setAndDisplayPath(index) {

	if (typeof(localStorage) !== "undefined") {
		localStorage.setItem(SELECTED_KEY, index);
		location.href = "navigate.html";

	}
	else {
		errorHandler(1);
	}
}

/*
 * Not a core function, a function to manipulate the DOM
 * element of the header.
 */
function displayHeaderMsg() {

	let messageRef = document.getElementById("displayMessage");
	let messages = ["Where do you want to go today?","你今天想去哪？","Hvor skal du hen?","今日どこに行きますか","Gdzie idziesz?","куда ты идешь","Ke mana hendak anda pergi?","Wohin gehst du?"];
	let choice = Math.floor(Math.random() * messages.length);

	messageRef.innerHTML = messages[choice];
}

// =============================================================================================================================== //


// Main execution starts

getWebService(DOMAIN_URL,pathRequestData);
setInterval(() => {
	displayHeaderMsg();
}, 3000);

// Set delay to make sure googleAPI is fully loaded.
setTimeout(() => {
	displayPaths(pathList); 
}, 1000);



