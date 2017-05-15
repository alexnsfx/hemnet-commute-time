Hemnet commute time
======

This is a Google Chrome extension for https://www.hemnet.se. It allows to display the commute time between a place of interest and each of the Hemnet search results.

Configure your places of interest and your Google Maps API key in ```content.js```:

```javascript
{
	address: "Gamla Stan, Stockholm", 	// Address of the place you want to compare with
	transitMode: "transit",				// How to go there: [transit, bicycling]. Transit defaults to subway.
	transitName: "T-bana",				// Transportation name (display only)
	timeLimit: 1800						// In seconds. Above that limit the text is red, green otherwise.
}
```

Get your API key on https://developers.google.com/maps/documentation/javascript/get-api-key.

Possible improvements
------

- Only the first route from Google Maps API is processed. Some kind of averaging could be used.
- Only two places of interest fit on the 'For sale' page. More is possible but hard to read.
- No GUI to configure places of interest and API key.
- Only subway and bicycle are available
