(function () {

  var map;
  var directionsService;
  var directionsDisplay;
  var userLocation;
  var markerCollection = [];

  var ICONS = {
    'UNSELECTED': 'img/book-marker-unselected.png',
    'SELECTED': 'img/book-marker-selected.png'
  };

function initialise() {

  
  var mapOptions = {
    center: new google.maps.LatLng(-41.187518, 174.956622),
    zoom: 5,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP]
    },
 
  };

  map = new google.maps.Map(document.querySelector("#bookshops-map"), mapOptions);

  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);

  var resetMapButton = document.createElement("div");
  resetMapButton.innerHTML = "<button id='zoomOut'>Zoom out</button>";
  map.controls[google.maps.ControlPosition.TOP].push(resetMapButton);
  resetMapButton.addEventListener("click", function() {
    // deselectAllMarkers
    map.setCenter(mapOptions.center);
    map.setZoom(mapOptions.zoom);
  });
  
  loadBookshopsJSON();

}

function loadBookshopsJSON() {
  jQuery.getJSON('js/oldbooks.json', processBookshopsJSON);

if (navigator.geolocation) {
      // geolocation is supported
      navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var location_accuracy = new google.maps.Circle({
          'map': map,
          'center': userLocation,
          'radius': position.coords.accuracy,
          'fillColor': '#E95C42',
          'fillOpacity': 0.7,
          'strokeColor': '#FFFFFF', 
          'strokeOpacity': 0.7,
          'strokeWeight': 1
        });
        var location = new google.maps.Marker({
          'map': map,
          'position': userLocation
        });
      });
    }
  }


google.maps.event.addDomListener(window, 'load', initialise);

function processBookshopsJSON(bookshops) {
    console.log(bookshops);

    // sort islands array from north to south
    bookshops.sort(function (shopA, shopB) {
      if (shopA.lat < shopB.lat) {
        return 1; // A comes first - correct order
      } else {
        return -1; // B comes first - reverse the order
      }
    });

    for(var i = 0; i < bookshops.length; i += 1) {
      var shop = bookshops[i];
      addMarker(shop);
    }
   
  }

  function addMarker(shop) {
    var marker = new google.maps.Marker({
      'map': map,
      'position': new google.maps.LatLng(shop.lat, shop.lng),
      'title': shop.name,
      'animation': google.maps.Animation.DROP,
      'icon': ICONS.UNSELECTED
    });

    markerCollection.push(marker);

    var infoWindow = new google.maps.InfoWindow({
      'content': "<div><h3>" + shop.name + "</h3><p>" + shop.content + "</p><p>" + shop.type + "</div>",
      maxWidth: 200

    });


    google.maps.event.addDomListener(marker, "click", function(){
      infoWindow.open(map, marker);
      setDirectionsTo(marker);
      selectMarker(marker);
    });
  }

function selectMarker(marker) {
  deselectAllMarkers();
  marker.setIcon(ICONS.SELECTED);
  marker.setZIndex(1000);
  map.setZoom(12);
  map.panTo(marker.getPosition());
}

function deselectAllMarkers() {
  for (var i = 0; i < markerCollection.length; i+= 1) {
    markerCollection[i].setIcon(ICONS.UNSELECTED);
    markerCollection[i].setZIndex(null);
  }
}

function setDirectionsTo(marker) {
  if(userLocation) {
    var routeRequest = {
      origin: userLocation,
      destination: marker.getPosition(),
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(routeRequest, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    })
  }
}



})();
