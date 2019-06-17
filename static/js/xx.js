var queryEarthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
var queryTPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"



d3.json(queryEarthquakes, function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquake) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place , magnitude and time of the earthquake
  var earthquakes = L.geoJson(earthquake, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "<br> Magnitude: " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {
          radius: circleRadius(feature.properties.mag),
          fillColor: circleColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
        })
    }
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


//Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
function circleRadius(value) {
  return value * 15000
}

//Create color range for the circle diameter 
function circleColor(d) {
  return d > 7 ? "red" :
    d > 6 ? "pink" :
      d > 5 ? "purple" :
        d > 4 ? "yellowgreen" :
          d > 3 ? "yellow" :
            "skyblue";
}

function createMap(earthquakes) {

  // Define basemap layers
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    id: "mapbox.grayscale",
    accessToken: API_KEY
  });

  var outdoorMap = L.tileLayer("https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.outdoor",
    accessToken: API_KEY
  });

  var tPlates = new L.LayerGroup();
  // Add Fault lines data
  d3.json(queryTPlates, function (plate) {
    // Adding our geoJSON data, along with style information, to the tectonicplates
    // layer.
    L.geoJson(plate, {
      weight: 2,
      color: "black"
    })
      .addTo(tPlates);
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoor": outdoorMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tPlates
  };

  // Create our map, giving it the darkmap, earthquakes, and plates layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [grayscaleMap, earthquakes, tPlates]
  });


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [2, 3, 4, 5, 6, 7],
    labels = [];

// loop through our density intervals and generate a label with a colored square for each interval
for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + circleColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;
  };
  legend.addTo(myMap);
}

  