/*jslint browser: true, devel: true*/
/*global angular, cordova, StatusBar*/

angular.module('starter.controllers',
               ['ionic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap',
               'starter.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function (e) {
//});

//Access $tastypieProvider in the controller
//Login sample:
// .controller('LoginCtrl', ['$scope', '$tastypie', '$http', function ($scope, $tastypie, $http) {
//     $scope.login = function () {
//         var data = {
//             userName: $scope.userName,
//             password: $scope.password
//         };
//         $http.post('/loginUrl', data).success(response) {
//             $tastypie.setAuth(response.username, response.api_key);
//         }
//     }
// }])

    .controller('HomeCtrl', function () {
        "use strict";
    })

    .controller('WhatCtrl',
            ['$scope', '$state', 'eventData', '$tastypieResource',
            function ($scope, $state, eventData, $tastypieResource) {
                "use strict";
                $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
                $scope.types.objects.$find();
                $scope.next = function (typeId) {
                    eventData.setWhat(typeId);
                    $state.go('new.when');
                };
                $scope.goToAgenda = function () {
                    $state.go('events');
                };
            }])
//     .directive('tileSize', function () {
//         return function (scope, element, attr) {
// 
//             // Get parent elmenets width and subtract fixed width
//             element.css({ 
//                 width: element.parent()[0].offsetWidth /4 + 'px' 
//             });
//         };
//     })

    .controller('WhenCtrl',
            ['$scope', '$state', '$cordovaDatePicker', 'eventData',
            function ($scope, $state, $cordovaDatePicker, eventData) {
                "use strict";
                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.date = new Date();
                $scope.time = $scope.date;
                $scope.showDatePicker = function () {
                    var options = {mode: 'date', date: $scope.date, minDate: $scope.date};
                    $cordovaDatePicker.show(options).then(function (date) {
                        $scope.date = date;
                    });
                };
                $scope.showTimePicker = function () {
                    var options = {mode: 'time', date: $scope.time, minuteInterval: 15, is24Hour: true};
                    $cordovaDatePicker.show(options).then(function (time) {
                        if (time !== 'undefined') {
                            $scope.time = time;
                        }
                    });
                };
                $scope.next = function (date, time) {
                    var d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                                    time.getUTCHours(), time.getUTCMinutes());
                    eventData.setWhen(d);
                    $state.go('new.where');
                };
//                 $scope.events = new $tastypieResource('event');
//                 $scope.events.objects.$find();
            }])

    .controller('WhereCtrl',
            ['$scope', '$state', 'eventData', '$cordovaGeolocation', '$tastypieResource',
            function ($scope, $state, eventData, $cordovaGeolocation, $tastypieResource) {
                "use strict";
                /*global document: false */
                /*global google: false */
                var typeResource = null,
                    eventType = new $tastypieResource('event_type'),
                    position = new google.maps.LatLng(48.8567, 2.3508);
                eventType.objects.$get({id: parseInt(eventData.what, 10)}).then(
                    function (result) {
                        typeResource = result.resource_uri;
                    },
                    function (error) {
                        console.log(error);
                    }
                );
                $scope.initialize = function () {
                    var initpos = new google.maps.LatLng(48.8567, 2.3508),
                        mapOptions = {
                            center: initpos,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            zoomControl: false,
                            mapTypeControl: false,
                            panControl: false,
                            streetViewControl: false,
                        },
                        map = new google.maps.Map(document.getElementById("map"),
                                                  mapOptions),
                        posOptions = {timeout: 10000, enableHighAccuracy: false},
                        input = document.getElementById('pac-input'),
                        autocomplete = new google.maps.places.Autocomplete(input),
                        infowindow = new google.maps.InfoWindow(),
                        marker = new google.maps.Marker({map: map});
            //         marker.addListener('click', function () {
            //             infowindow.open(map, marker);
            //         });
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (loc) {
                            var mypos = new google.maps.LatLng(loc.coords.latitude,
                                                                loc.coords.longitude);
                            $scope.map.setCenter(mypos);
                        }, function (err) {
                            alert('Unable to get location: ' + err.message);
                        });
                    autocomplete.bindTo('bounds', map);
                    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
                    autocomplete.addListener('place_changed', function () {
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
                    map.addListener('click', function (e) {
                        position = e.latLng;
                        marker.setPosition(position);
                        infowindow.open(map, marker);
                    });
                    $scope.map = map;
                };
                $scope.next = function (where) {
            //         var where = '{ "type": "Point", "coordinates": [1.1, 1.1] }';
                    where = '{ "type": "Point", "coordinates": ['
                                + position.lat() + ', ' + position.lng() + '] }';
                    console.log(typeResource, eventData.when, where);
                    var event = new $tastypieResource('myevents');
                    event.objects.$create({
                        start: eventData.when,
                        event_type: typeResource,
                        position: where,
                    }).$save().then(
                        function (result) {
                            console.log(result);
                            $state.go('new.done');
                        },
                        function (error) {
                            console.log(error);
                            $state.go('new.what');
                        }
                    );
                };
            }])

    .controller('DoneCtrl',
            ['$scope', '$state',
            function ($scope, $state) {
                "use strict";
            }])

    .controller('EventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function ($scope, $state, $tastypieResource) {
                "use strict";
                $scope.friends_title = "Ce que mes amis ont prévu";
                $scope.mine_title = "Mes sorties";
                $scope.all_title = "Mon agenda";
            }])
    .controller('MyEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function ($scope, $state, $tastypieResource) {
                "use strict";
                $scope.title = "Mes sorties";
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                $scope.events = new $tastypieResource('myevents', {order_by: 'start', start__gte: today});
                $scope.events.objects.$find();
            }])
    .controller('FriendsEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function ($scope, $state, $tastypieResource) {
                "use strict";
                $scope.title = "Ce que mes amis ont prévu";
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                $scope.events = new $tastypieResource('friendsevents', {order_by: 'start', start__gte: today});
                $scope.events.objects.$find();
            }])
    .controller('AllEventsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function ($scope, $state, $tastypieResource) {
                "use strict";
                $scope.title = "Mon agenda";
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                $scope.events = new $tastypieResource('myagenda', {order_by: 'start', start__gte: today});
                $scope.events.objects.$find();
            }])
    .controller('EventCtrl',
            ['$window', '$state', '$scope', '$state', '$tastypieResource', 'join', 'leave',
            function ($window, $state, $scope, $stateParams, $tastypieResource, join, leave) {
                "use strict";
                var event = new $tastypieResource('allevents');
                $scope.buttonTitle = "Chargement";
                $scope.buttonAction = function (eventId) {};
                event.objects.$get({id: parseInt($stateParams.params.eventId, 10)}).then(
                    function (result) {
                        $scope.event = result;
                        var my_id = 489,
                            index,
                            participants = result.participants,
                            found = false;
                        if (my_id === result.owner.user.id) {
                            $scope.buttonTitle = "J'annule";
                            $scope.buttonAction = function (eventId) {
                                var myevent = new $tastypieResource('myevents');
                                myevent.objects.$delete({id: eventId});
                                $state.go('events.mine');
                            };
                        } else {
                            for (index = 0; index < participants.length; index++) {
                                if (my_id === participants[index].user.id) {
                                    found = true;
                                }
                            }
                            if (found) {
                                $scope.buttonTitle = "J'annule";
                                $scope.buttonAction = function (eventId) {
                                    leave(eventId);
                                    $window.location.reload(true);
                                };
                            } else {
                                $scope.buttonTitle = "Je participe";
                                $scope.buttonAction = function (eventId) {
                                    join(eventId);
                                    $window.location.reload(true);
                                };
                            }
                        }
                        console.log(result.owner.user.id, result.participants);
                    },
                    function (error) {
                        $scope.buttonTitle = "Erreur de chargement";
                        console.log(error);
                    }
                );
            }])
    .controller('FriendsCtrl',
            ['$scope', '$state', '$tastypieResource',
            function ($scope, $state, $tastypieResource) {
                "use strict";
                $scope.new_title = "Ajouter des amis";
                $scope.my_title = "Mes amis";
                $scope.pending_title = "Invitations en attente";
            }])
    .controller('NewFriendsCtrl',
            ['$scope', '$tastypieResource', 'invite',
            function ($scope, $tastypieResource, invite) {
                "use strict";
                $scope.friends = new $tastypieResource('friends/new');
                $scope.friends.objects.$find();
                $scope.title = "Ajouter des amis";
                $scope.buttonTitle = "Inviter";
                $scope.buttonAction = function (userId) {
                    invite(userId);
                };
            }])
    .controller('MyFriendsCtrl',
            ['$scope', '$tastypieResource',
            function ($scope, $tastypieResource) {
                "use strict";
                $scope.friends = new $tastypieResource('friends/my');
                $scope.friends.objects.$find();
                $scope.title = "Mes amis";
                $scope.buttonTitle = "Voir";
            //     $scope.buttonAction = function (userId) {
            //         invite(userId);
            //     };
            }])
    .controller('PendingFriendsCtrl',
            ['$scope', '$tastypieResource', 'accept',
            function ($scope, $tastypieResource, accept) {
                "use strict";
                $scope.friends = new $tastypieResource('friends/pending');
                $scope.friends.objects.$find();
                $scope.title = "Invitations en attente";
                $scope.buttonTitle = "Accepter";
                $scope.buttonAction = function (userId) {
                    accept(userId);
                };
            }]);
