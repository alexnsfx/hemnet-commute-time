var slutPriserRegex = /^https?:\/\/(?:[^./?#]+\.)?hemnet\.se\/salda\/bostader/;
var tillSaluRegex = /^https?:\/\/(?:[^./?#]+\.)?hemnet\.se\/bostader/;

chrome.webNavigation.onCompleted.addListener(function (details) {
	var message = {text: 'display_commute'};
	if (slutPriserRegex.test(details.url)) {
		message.slutPriser = true;
		chrome.tabs.sendMessage(details.tabId, message);
	}
	else if (tillSaluRegex.test(details.url)) {
		message.slutPriser = false;
		chrome.tabs.sendMessage(details.tabId, message);
	}
	else {
		console.log("Page not supported: " + details.url);
	}
});
