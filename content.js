var workplaces = [
	{
		address: "Gamla Stan, 111 28 Stockholm",
		transitMode: "transit",
		transitName: "T-bana",
		timeLimit: 1800
	},
	{
		address: "Skansen, Stockholm",
		transitMode: "bicycling",
		transitName: "bicycle",
		timeLimit: 1800
	}
];

var apiKeys = [
	"YOUR_API_KEY_HERE"
];
var currentApiKeyId = 0;

function processRoutes(routes) {
	return {
		duration: routes[0].legs[0].duration,
		end_address: routes[0].legs[0].end_address
	};
}

function getCommuteTime(origin, dest, mode, targetDomElement, callback, errorCallback) {
	//mode - transit, bicycling

	var searchUrl = "https://maps.googleapis.com/maps/api/directions/json"+
		"?key="+apiKeys[currentApiKeyId]+
		"&origin="+encodeURI(origin)+"&destination="+encodeURI(dest)+"&mode="+mode+
		"&alternatives=true&units=metric&transit_mode=subway";
	
	var x = new XMLHttpRequest();
	x.open('GET', searchUrl);
	x.responseType = 'json';
	
	x.onload = function() {
		var response = x.response;
		//console.log(response);
		
		if (!response || !response.routes || response.routes.length === 0 ||
			!response.status || response.status !== "OK") {
			
			if(response && response.status && response.status === "OVER_QUERY_LIMIT") {
				errorCallback(
					"OVER_QUERY_LIMIT",
					targetDomElement
				);
				
				//console.log("API key #"+currentApiKeyId+" depleted. Trying to switch over.");
				if(currentApiKeyId + 1 < apiKeys.length) {
					currentApiKeyId++;
					//console.log("Switched to API key #"+currentApiKeyId);
					return getCommuteTime(origin, dest, mode, targetDomElement, callback, errorCallback);				
				}
				
				return;
			}

			errorCallback(
				"Incorrect response from Google API.\nOrigin "+origin+"\nDestination "+dest,
				targetDomElement
			);
			return;
		}
		
		callback(processRoutes(response.routes), targetDomElement);
	};
	
	x.onerror = function() {
		errorCallback('Network error.', targetDomElement);
	};
	
	x.send();
}

function getTimeDiv(item, position) {
	var timeDiv;
	if(item.children.length <= 2+position) {
		timeDiv = document.createElement("div");
	}
	else {
		timeDiv = item.children[2+position];
	}
	
	item.appendChild(timeDiv);
	return timeDiv;
}

function getTimeLi(item, position) {
	var timeLi;
	var descriptionElement = item.children[3];

	if(descriptionElement.children.length <= 1+position) {
		timeLi = document.createElement("p");
	}
	else {
		timeLi = descriptionElement.children[1+position];
	}
	
	timeLi.style = "margin: 0;";
	descriptionElement.appendChild(timeLi);
	descriptionElement.style = "height: 125px;"
	return timeLi;
}

function displayTime(timeTaken, domElement, transit, timeLimit) {
	var color = "green";
	if (timeTaken.duration.value > timeLimit) {
		color = "red";
	}
	
	domElement.innerHTML = '<span class="item-link" style="color:'+color+';">- '+timeTaken.duration.text+' ('+transit+' to '+timeTaken.end_address+')</span>';
}

function displayError(errorMessage, domElement, transit, end_address) {
	console.log('Cannot get commute time. ' + errorMessage);
	
	var resultMessage = "Unknown";
	if(errorMessage === "OVER_QUERY_LIMIT") {
		resultMessage = "Reached daily limit";
	}
	
	domElement.innerHTML = '<span class="item-link">- '+resultMessage+' ('+transit+' to '+end_address+')</span>';
}

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.text === 'display_commute') {
		var city = "Stockholms län";
		var street = "";
		var items;
		if (msg.slutPriser) {
			items = document.getElementsByClassName("sold-property-listing__location");
		}
		else {
			items = document.getElementsByClassName("listing-post__details");
		}
		
		for (var i = 0; i < items.length; i++) {
			if (msg.slutPriser) {
				street = items[i].children[0].children[1].innerHTML;
				
				if (items[i].children[1].childNodes.length == 5) {
					city = items[i].children[1].childNodes[3].innerText + items[i].children[1].childNodes[4].textContent.trim();
				}
				else if (items[i].children[1].childNodes.length == 3) {
					city = items[i].children[1].childNodes[2].textContent.trim();
				}
			}
			else {
				if(items[i].children.length < 4) {
					continue;
				}
				
				var locationDetails = items[i].children[1];
			
				city = locationDetails.children[1].innerHTML.trim();
				street = locationDetails.children[2].childNodes[2].textContent.trim();
				street = street.split(",")[0];
			}
			
			var origin = street+', '+city;
			var position = 0;
			workplaces.forEach(function(entry) {
				var domInsertion;
				if (msg.slutPriser) {
					domInsertion = getTimeDiv(items[i], position);
				}
				else {
					domInsertion = getTimeLi(items[i], position);
				}
				
				getCommuteTime(
					origin,
					entry.address,
					entry.transitMode,
					domInsertion,
					function(timeTaken, domElement) {
						displayTime(timeTaken, domElement, entry.transitName, entry.timeLimit);
					},
					function(errorMessage, domElement) {
						displayError(errorMessage, domElement, entry.transitName, entry.address);
					}
				);
				
				position++;
			});
		}

        return true;
    }
	
	return false;
});
