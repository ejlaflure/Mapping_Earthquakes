// Add console.log to check to see if our code is working.
console.log("working");

// Create the street layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: API_KEY
});

// Create the satellite view tile layer that will be an option for our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the dark view tile layer that will be an option for our map.
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});


// Create a base layer that holds all three maps.
let baseMaps = {
  "Street Map": streets,
  "Satellite Map": satelliteStreets,
  "Dark Map": dark
};

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [39.5, -15.5],
	zoom: 3,
	layers: [streets]
});

// Create the earthquake and tectonic plates layers for our map.
let earthquakes = new L.layerGroup();
let plates = new L.layerGroup();

// We define an objects that contains the overlays.
let overlays = {
	"Earthquakes": earthquakes,
	"Tectonic Plates": plates
};

// Add a control to the map that will allow the user to change which layers that are visible.
L.control.layers(baseMaps, overlays, {
	collapsed: false
}).addTo(map);

// Accessing the GeoJSON URLs
let earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let plateData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Create a style for the plateData.
let myStyle = {
	color: "brown",
	fillColor: "clear",
	weight: 3
}

// Grabbing our tectonic plate GeoJSON data.
d3.json(plateData).then(function(data) {
    console.log(data);
  	// Creating a GeoJSON layer with the retrieved data.
  	L.geoJson(data, {
		style: myStyle
		}).addTo(plates);
	},
	// Add the techtonic plate layer to our map.
	plates.addTo(map)
);

// Grabbing our GeoJSON earthquake data.
d3.json(earthquakeData).then(function(data) {
	console.log(data);

	// Function returns the style data for each of the earthquakes we plot on the map. 
	// We pass the magnitude of the earthquake into a function to calculate the radius.
	function styleInfo(feature) {
		return {
	  		opacity: 1,
	  		fillOpacity: 1,
	  		fillColor: getColor(feature.properties.mag),
	  		color: "#000000",
	  		radius: getRadius(feature.properties.mag),
	  		stroke: true,
	  		weight: 0.5
		};
  	};
	
	// This function determines the radius of the earthquake marker based on its magnitude.
	// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
	function getRadius(magnitude) {
		if (magnitude === 0) {
	  		return 1;
		};
		return magnitude * 4;
	};

	// This function determines the color of the circle based on the magnitude of the earthquake.
	function getColor(magnitude) {
		if (magnitude > 5) {
			return "#ea2c2c";
		};
		if (magnitude > 4) {
			return "#ea822c";
		};
		if (magnitude > 3) {
			return "#ee9c00";
		};
		if (magnitude > 2) {
			return "#eecc00";
		};
		if (magnitude > 1) {
			return "#d4ee00";
		};
		return "#98ee00";
	};
	
  	// Creating a GeoJSON layer with the retrieved data.
  	L.geoJson(data, {
		// We turn each feature into a circleMarker on the map.
		pointToLayer: function(feature, latlng) {
			console.log(data);
			return L.circleMarker(latlng);
		},
		// We set the style for each circleMarker using our styleInfo function.
		style: styleInfo,
		// We create a popup for each circleMarker to display the magnitude and
		// location of the earthquake after the marker has been created and styled.
		onEachFeature: function(feature, layer) {
			layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
		}
	}).addTo(earthquakes);

	// Add the earthquake layer to our map.
	earthquakes.addTo(map);

	// Create a legend control object.
	let legend = L.control({
		position: "bottomright"
	});

	// Then add all the details for the legend.
	legend.onAdd = function() {
		let div = L.DomUtil.create("div", "info legend");

		const magnitudes = [0, 1, 2, 3, 4, 5];
		const colors = [
		"#98ee00",
		"#d4ee00",
		"#eecc00",
		"#ee9c00",
		"#ea822c",
		"#ea2c2c"
		];

		// Looping through our intervals to generate a label with a colored square for each interval.
		for (var i = 0; i < magnitudes.length; i++) {
			console.log(colors[i]);
			div.innerHTML += 
			"<i style='background: " + colors[i] + "'></i> " + magnitudes[i] + 
			(magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
		}
		return div;
	};
	legend.addTo(map);
});