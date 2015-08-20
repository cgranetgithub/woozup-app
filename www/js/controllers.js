angular.module('starter.controllers',
               ['ionic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap',
               'starter.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function(e) {
//});

//Access $tastypieProvider in the controller
//Login sample:
// .controller('LoginCtrl', ['$scope', '$tastypie', '$http', function($scope, $tastypie, $http){
//     $scope.login = function(){
//         var data = {
//             userName: $scope.userName,
//             password: $scope.password
//         };
//         $http.post('/loginUrl', data).success(response){
//             $tastypie.setAuth(response.username, response.api_key);
//         }
//     }
// }])

.controller('HomeCtrl', function($scope, $state, $http) {
})

.controller('WhatCtrl',
            ['$scope', '$state', 'eventData', '$tastypieResource',
            function($scope, $state, eventData, $tastypieResource) {
    $scope.types = new $tastypieResource('event_type', {order_by:'order'});
    $scope.types.objects.$find();
    $scope.next = function(typeId) {
        eventData.setWhat(typeId);
        $state.go('new.when');
    };
    $scope.goToAgenda = function() {
        $state.go('events');
    };
}])
.directive('tileSize', function() {
    return function(scope, element, attr) {

      // Get parent elmenets width and subtract fixed width
      element.css({ 
        width: element.parent()[0].offsetWidth /4 + 'px' 
      });

    };
})

.controller('WhenCtrl',
            ['$scope', '$state', '$cordovaDatePicker', 'eventData', '$tastypieResource',
            function($scope, $state, $cordovaDatePicker, eventData, $tastypieResource) {

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
  
    $scope.date = new Date();
    $scope.time = $scope.date;
    $scope.showDatePicker = function() {
        var options = {mode: 'date', date: $scope.date, minDate: $scope.date}
        $cordovaDatePicker.show(options).then(function(date){
            $scope.date = date;
        });
    };
    $scope.showTimePicker = function() {
        var options = {mode: 'time', date: $scope.time, minuteInterval: 15, is24Hour: true}
        $cordovaDatePicker.show(options).then(function(time){
            console.log(time);
            if (typeof time != 'undefined') {
                $scope.time = time;
            }
        });
    };
    $scope.next = function(date, time) {
        var d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                         time.getUTCHours(), time.getUTCMinutes());
        eventData.setWhen(d);
        $state.go('new.where');
    };
    $scope.events = new $tastypieResource('event');
    $scope.events.objects.$find();
}])

.controller('WhereCtrl',
            ['$scope', '$state', 'eventData', '$cordovaGeolocation', '$tastypieResource', 
            function($scope, $state, eventData, $cordovaGeolocation, $tastypieResource) {
    var typeResource = null;
    eventType = new $tastypieResource('event_type');
    eventType.objects.$get({id:parseInt(eventData.what)}).then(
        function(result){
            typeResource = result['resource_uri'];
        },
        function(error){
            console.log(error);
        }
    )
    $scope.initialize = function() {
        var whereiam = new google.maps.LatLng(48.8567, 2.3508);
        var mapOptions = {
            center: whereiam,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: false,
            mapTypeControl: false,
            panControl: false,
            streetViewControl: false,
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
                var whereiam = new google.maps.LatLng(position.coords.latitude,
                                                    position.coords.longitude);
                $scope.map.setCenter(whereiam);
            }, function(err) {
                alert('Unable to get location: ' + err.message);
            });
        var input = document.getElementById('pac-input');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({map: map});
//         marker.addListener('click', function() {
//             infowindow.open(map, marker);
//         });
        autocomplete.addListener('place_changed', function() {
            infowindow.close();
            var place = autocomplete.getPlace();
            if (!place.geometry) { return; }
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(18);
            }
            // Set the position of the marker using the place ID and location.
            marker.setPlace({
                placeId: place.place_id,
                location: place.geometry.location
            });
            marker.setVisible(true);

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Place ID: ' + place.place_id + '<br>' +
                place.formatted_address);
            infowindow.open(map, marker);
        });
        map.addListener('click', function(e) {
            place = e.latLng;
            marker.setPosition(place);
            infowindow.open(map, marker);
        });
        $scope.map = map;        
    }
        
    $scope.next = function(where) {
        var where = '{ "type": "Point", "coordinates": [1.1, 1.1] }';
        console.log(typeResource, eventData.when, where);
        event = new $tastypieResource('event');
        event.objects.$create({
            start: eventData.when,
            event_type: typeResource,
            position: where,
        }).$save().then(
            function(result){
                console.log(result);
                $state.go('new.done');
            },
            function(error){
                console.log(error);
                $state.go('new.what');
            }
        );
    };
}])

.controller('DoneCtrl', ['$scope', '$state', function($scope, $state) {
}])

.controller('EventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $state, $tastypieResource) {
}])
.controller('MyEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $state, $tastypieResource) {
    $scope.title = "Mes sorties";
    $scope.events = new $tastypieResource('myevent', {order_by:'start'});
    $scope.events.objects.$find();
}])
.controller('FriendsEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $state, $tastypieResource) {
    $scope.title = "Les sorties de mes amis";
    $scope.events = new $tastypieResource('friendevent', {order_by:'start'});
    $scope.events.objects.$find();
}])
.controller('AllEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $state, $tastypieResource) {
    $scope.title = "Toutes les sorties";
    $scope.events = new $tastypieResource('event', {order_by:'start'});
    $scope.events.objects.$find();
}])

.controller('EventCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $stateParams, $tastypieResource) {
    event = new $tastypieResource('event');
    event.objects.$get({id:parseInt($stateParams['params']['eventId'])}).then(
        function(result){
            $scope.event = result;
        },
        function(error){
            console.log(error);
        }
    );
}])
.controller('FriendsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function($scope, $state, $tastypieResource) {
}])
.controller('NewFriendsCtrl',
            ['$scope', '$tastypieResource', 'invite',
            function($scope, $tastypieResource, invite) {
    $scope.friends = new $tastypieResource('friends/new');
    $scope.friends.objects.$find();
    $scope.title = "Inviter mes amis";
    $scope.buttonTitle = "Inviter";
    $scope.buttonAction = function(userId) {
        invite(userId);
    };
}])
.controller('MyFriendsCtrl',
            ['$scope', '$tastypieResource',
            function($scope, $tastypieResource) {
    $scope.friends = new $tastypieResource('friends/my');
    $scope.friends.objects.$find();
    $scope.title = "Mes amis"
    $scope.buttonTitle = "Voir";
//     $scope.buttonAction = function(userId) {
//         invite(userId);
//     };
}])
.controller('PendingFriendsCtrl',
            ['$scope', '$tastypieResource', 'accept',
            function($scope, $tastypieResource, accept) {
    $scope.friends = new $tastypieResource('friends/pending');
    $scope.friends.objects.$find();
    $scope.title = "Invitations en attente"
    $scope.buttonTitle = "Accepter";
    $scope.buttonAction = function(userId) {
        accept(userId);
    };
}]);
