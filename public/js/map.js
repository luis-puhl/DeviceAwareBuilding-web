/* eslint no-undef: 0 */
google.maps.event.addDomListener(window, 'load', init);
function init() {
	var mapOptions = {
		center: new google.maps.LatLng(-22.344478, -49.029336),
		zoom: 21,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.DEFAULT,
		},
		disableDoubleClickZoom: true,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		},
		scaleControl: true,
		scrollwheel: true,
		panControl: true,
		streetViewControl: true,
		draggable : true,
		overviewMapControl: true,
		overviewMapControlOptions: {
			opened: false,
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
	}
	var mapElement = document.getElementById('map');
	var map = new google.maps.Map(mapElement, mapOptions);
	var locations = [
		['Ltia Salao', '', 'undefined', 'undefined', 'undefined',	-22.344522, -49.029235,
		'/img/solid-pin-blue.png'],
		['Ltia Aula', '', 'undefined', 'undefined', 'undefined',	-22.344337, -49.029390,
		'/img/solid-pin-green.png']
	];
	for (let i = 0; i < locations.length; i++) {
		if (locations[i][1] =='undefined'){ description ='';} else { description = locations[i][1];}
		if (locations[i][2] =='undefined'){ telephone ='';} else { telephone = locations[i][2];}
		if (locations[i][3] =='undefined'){ email ='';} else { email = locations[i][3];}
		if (locations[i][4] =='undefined'){ web ='';} else { web = locations[i][4];}
		if (locations[i][7] =='undefined'){ markericon ='';} else { markericon = locations[i][7];}
		marker = new google.maps.Marker({
			icon: markericon,
			position: new google.maps.LatLng(locations[i][5], locations[i][6]),
			map: map,
			title: locations[i][0],
			desc: description,
			tel: telephone,
			email: email,
			web: web
		});
		link = '';
		bindInfoWindow(marker, map, locations[i][0], description, telephone, email, web, link);
	}
	function bindInfoWindow(marker, map, title, desc, telephone, email, web, link) {
		var infoWindowVisible = (function () {
				var currentlyVisible = false;
				return function (visible) {
					if (visible !== undefined) {
						currentlyVisible = visible;
					}
					return currentlyVisible;
				};
			}());
			iw = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function() {
				if (infoWindowVisible()) {
					iw.close();
					infoWindowVisible(false);
				} else {
					var html = "<div class='gm-popup'><h4>"+title+"</h4><p>"+desc+"<p>"+link+"</div>";
					iw = new google.maps.InfoWindow({content:html});
					iw.open(map,marker);
					infoWindowVisible(true);
				}
		});
		google.maps.event.addListener(iw, 'closeclick', function () {
			infoWindowVisible(false);
		});
	}
}
