  
var map,
	markers = [],
	fb = new Firebase("https://newhavenhack.firebaseio.com/markers"),
	scope, compile, firebase;

function MainController($scope, $compile, $firebase) {
	console.log(arguments);
	scope = $scope;
	compile = $compile;
	firebase = $firebase;
}


function initialize() {
	
	var myLatLng = new google.maps.LatLng(41.3127341,-72.92376569999999);


	fb.on("child_added", function(snapshot) {
		placeMarker(snapshot.name(), snapshot.val());
	});

	fb.on("child_changed", function(snapshot) {
		placeMarker(snapshot.name(), snapshot.val());
	});

	fb.on("child_removed", function(snapshot) {
		var id = snapshot.name();
		if(markers[id]) markers[id].setMap(null);
	});

	var mapOptions = {
		center: myLatLng,
		zoom: 15
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
	var icons = {
		parking: {
			icon: iconBase + 'parking_lot_maps.png'
		},
		library: {
			icon: iconBase + 'library_maps.png'
		},
		info: {
			icon: iconBase + 'info-i_maps.png'
		}
	};

	// var contentString = '<div uid="%MARKER_ID%"><input type="text" placeholder="Title" autofocus name="title">'+
	// 	'<br><input type="text" placeholder="Time" name="time">'+
	// 	'<br><textarea type="text" placeholder="Description" name="description"></textarea>'+
	// 	'<br><input type="submit" onclick="updateMarker(\'%MARKER_ID%\')"></div>';
	// '<div id="siteNotice">'+
	// '</div>'+
	// ''
	// '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
	// '<div id="bodyContent">'+
	// '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
	// 'sandstone rock formation in the southern part of the '+
	// 'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
	// 'south west of the nearest large town, Alice Springs; 450&#160;km '+
	// '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
	// 'features of the Uluru - Kata Tjuta National Park. Uluru is '+
	// 'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
	// 'Aboriginal people of the area. It has many springs, waterholes, '+
	// 'rock caves and ancient paintings. Uluru is listed as a World '+
	// 'Heritage Site.</p>'+
	// '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
	// 'http://en.wikipedia.org/w/index.php?title=Uluru</a> '+
	// '(last visited June 22, 2009).</p>'+
	// '</div>'+
	// '</div>';

	google.maps.event.addListener(map, 'click', function(event) {
	fb.push({lat: event.latLng.lat(), lng: event.latLng.lng()});
	});

	window.updateMarker = function(id) {

		fb.child(id).update({
			title: document.querySelector("[uid="+id+"] [name=title]").value,
			description: document.querySelector("[uid="+id+"] [name=description]").value,
			time: document.querySelector("[uid="+id+"] [name=time]").value
		});
	};

	function placeMarker(id, location) {

		if(markers[id]) {
			markers[id].setMap(null);
			delete markers[id];
		}


		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(location.lat, location.lng), 
			map: map,
			icon: 'http://nwex.co.uk/images/smilies/turd.gif'
		});


		google.maps.event.addListener(marker, 'click', function() {
			
			scope.$apply(function() {
				
				firebase(fb.child(id)).$bind(scope, "user");

				var element = compile(document.getElementById("markerEdit").innerHTML)(scope)[0];

				console.log(document.getElementById("markerEdit").innerHTML, element[0]);
				
				var infowindow = new google.maps.InfoWindow();
				infowindow.setContent(element);

				infowindow.open(map,marker);
				
			});
			
		});
	}

	//handleNoGeolocation();
	
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude,
			                         position.coords.longitude);

			// var infowindow = new google.maps.InfoWindow({
			// 	map: map,
			// 	position: pos,
			// 	content: 'Location found using HTML5.'
			// });

			map.setCenter(pos);
		});
	}
	
	angular.module("map", ['firebase'])
	
	angular.bootstrap(document, ['map']);

}

google.maps.event.addDomListener(window, 'load', initialize);