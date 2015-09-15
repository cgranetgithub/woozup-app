/*jslint browser: true, devel: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('starter.controllers',
               ['ionic', 'ngCordova', 'ngResourceTastypie',
               'ui.bootstrap', 'starter.services'])

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
    .controller('CheckauthCtrl',
        function ($tastypie, $state, UserData, CheckauthService, sortContacts) {
            "use strict";
            CheckauthService.checkUserAuth()
                .success(function () {
                    var options,
                        filter = ["displayName", "name"],
                        lastCheck = window.localStorage.contact_sync,
                        curDate = new Date();

                    $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                    $state.go('new.what');

                    if (!navigator.contacts) {
                        return;
                    }
                    if (lastCheck && (curDate.getTime() / 1000) - lastCheck < 7 * 3600 * 24) {
                        return;
                    }

                    options = new ContactFindOptions();
                    options.filter = "";
                    options.multiple = true;

                    navigator.contacts.find(filter,
                        function (contacts) {
                            var stuff = {};

                            window.localStorage.contact_sync = curDate;

                            if (contacts === null) {
                                console.log("No contact retrieved");
                                return;
                            }

                            contacts.forEach(function (entry) {
                                var thumb;

                                if (!entry.phoneNumbers ||  !entry.phoneNumbers.length
                                        || !entry.emails || !entry.emails.length) {
                                    return;
                                }

                                if (entry.photos && entry.photos.length) {
                                    thumb = entry.photos[0].value;
                                }

                                entry.phoneNumbers.forEach(function (phone) {
                                    entry.emails.forEach(function (email) {
                                        stuff[phone.value] = {
                                            'email': email.value,
                                            'name': entry.name.formatted,
                                            'photo': thumb
                                        };
                                    });
                                });

                            });

                            sortContacts(stuff);
                        },
                        function () {
                            // an error has occured, try to resync next day
                            window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
                            console.log("Error");
                        }, options);

                })
                .error(function () {
                    $state.go('connect');
                });
        })

    .controller('ConnectCtrl',
        function ($tastypie, $scope, $state, UserData, CheckauthService, LoginService, $ionicPopup) {
            "use strict";

            $scope.fbLogin = function () {
                facebookConnectPlugin.login([],
                    function (obj) {
                        var authData = {
                            "provider": "facebook",
                            "access_token": obj.authResponse.accessToken
                        };
                        /* we have to call registerbyToken from service LoginService */
                        LoginService.loginUser(authData, "facebook")
                            .success(function () {
                                $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                                $state.go('new.what');
                            }).error(function () {
                                $ionicPopup.alert({
                                    title: "Problème lors de la création du compte",
                                    template: "Veuillez réssayer"
                                });
                            });
                    },
                    function (obj) {
                    }
                );
            };
        })

    .controller('RegisterCtrl',
        function ($tastypie, $scope, RegisterService, $ionicPopup, $state, UserData) {
            "use strict";
            $scope.data = {};
            $scope.register = function () {
                var authData = {'username': $scope.data.username,
                                'password': $scope.data.password,
                                'name': $scope.data.firstname};
                RegisterService.registerUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        $state.go('new.what');
                    }).error(function () {
                        $ionicPopup.alert({
                            title: "Problème lors de la création du compte",
                            template: "Veuillez réssayer"
                        });
                    });
            };
        })

    .controller('LoginCtrl',
        function ($tastypie, $scope, LoginService, $ionicPopup, $state, UserData) {
            "use strict";
            $scope.data = {};
            $scope.login = function () {
                var authData = {'username': $scope.data.username,
                                'password': $scope.data.password};
                LoginService.loginUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        $state.go('new.what');
                    }).error(function () {
                        var alertPopup = $ionicPopup.alert({
                            title: "Erreur d'identification",
                            template: "Vérifiez votre login / mot de passe"
                        });
                    });
            };
        })

    .controller('HomeCtrl', function ($scope, $state) {
        "use strict";
        $scope.next = function () {
            $state.go('checkauth', {}, { reload: true });
        };
    })

    .controller('WhatCtrl',
        function ($tastypieResource, $cordovaGeolocation, $scope, $state,
                  setlast, EventData, UserData, $ionicPopup) {
            "use strict";

            var posOptions = {timeout: 5000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (loc) {
                    setlast(loc);
                    UserData.setWhere(loc.coords);
                }, function (err) {
                    console.log(err);
                    $scope.userposition = new $tastypieResource('userposition', {});
                    $scope.userposition.objects.$get({id: UserData.getUserId()}).then(
                        function (result) {
                            UserData.setWhere(result.last);
                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                    var alertPopup = $ionicPopup.alert({
                        title: "Erreur de géolocalisation",
                        template: "Je n'arrive pas à vous localiser. Merci d'activer le GPS et le wifi."
                    });
                });
            $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
            $scope.types.objects.$find();
            $scope.next = function (typeId) {
                $scope.types.objects.$get({id: typeId}).then(
                    function (result) {
                        EventData.setWhat(result);
                        $state.go('new.when', {}, { reload: true });
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            };
        })
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
        function ($tastypieResource, $scope, $state, EventData) {
            "use strict";
            $scope.when = {};
            $scope.when.date = new Date();
            $scope.title = EventData.getWhat().name;
            $scope.next = function () {
                EventData.setWhen($scope.when.date);
                $state.go('new.where', {}, { reload: true });
            };
            $scope.$watch("when.date", function (newValue, oldValue) {
                newValue.setHours(0);
                newValue.setMinutes(0);
                $scope.events = new $tastypieResource('friendsevents',
                                                      {order_by: 'start',
                                                       start__gte: newValue});
                $scope.events.objects.$find();
            });
        })

    .controller('WhereCtrl',
        function ($scope, $state, $filter, EventData, UserData) {
            "use strict";
            /*global document: false */
            /*global google: false */
            var setpos = function (position) {
                var where = '{ "type": "Point", "coordinates": ['
                            + position.lat() + ', ' + position.lng() + '] }';
                EventData.setWhere(where);
            };
            $scope.title = EventData.getWhat().name + ', le ' + $filter('date')(EventData.getWhen(), 'EEEE d MMMM');
            $scope.buttonTitle = "Valider";
            $scope.initialize = function () {
                var lat, long;
                if (UserData.getWhere()) {
                    lat = UserData.getWhere().latitude;
                    long = UserData.getWhere().longitude;
                } else {
                    lat = 48.8567;
                    long = 2.3508;
                }
                var initpos = new google.maps.LatLng(lat, long),
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
                    input = document.getElementById('pac-input'),
                    autocomplete = new google.maps.places.Autocomplete(input),
                    infowindow = new google.maps.InfoWindow(),
                    marker = new google.maps.Marker({map: map});
        //         marker.addListener('click', function () {
        //             infowindow.open(map, marker);
        //         });
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
                    var position = e.latLng;
                    marker.setPosition(position);
                    infowindow.open(map, marker);
                    setpos(position);
                });
                $scope.map = map;
            };
            $scope.next = function () {
                $state.go('new.done', {}, { reload: true });
            };
        })

    .controller('DoneCtrl',
        function ($tastypieResource, $scope, $state, EventData) {
            "use strict";
            $scope.event = {};
            $scope.event.type = EventData.getWhat();
            $scope.event.title = EventData.getWhat().name;
            $scope.event.where = EventData.getWhere();
            $scope.event.start = EventData.getWhen();
            $scope.event.start.setHours(EventData.getWhen().getHours() + 1);
            $scope.event.start.setMinutes(0);
            $scope.next = function () {
                var event = new $tastypieResource('myevents');
                event.objects.$create({
                    name: $scope.event.title,
                    start: $scope.event.start,
                    event_type: EventData.getWhat().resource_uri,
                    position: EventData.getWhere(),
                }).$save().then(
                    function () {
                        $state.go('events.agenda', {}, { reload: true });
                    },
                    function (error) {
                        console.log(error);
                        $state.go('checkauth', {}, { reload: true });
                    }
                );
            };
        })

    .controller('EventsCtrl',
        function ($scope) {
            "use strict";
            $scope.friends_title = "Ce que mes amis ont prévu";
//                 $scope.mine_title = "Mes sorties";
            $scope.agendaTitle = "Mon agenda";
        })

    .controller('FriendsEventsCtrl',
        function ($scope, $tastypieResource) {
            "use strict";
            $scope.title = "Ce que mes amis ont prévu";
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            $scope.events = new $tastypieResource('friendsevents',
                                                  {order_by: 'start', start__gte: today});
            $scope.events.objects.$find();
        })
    .controller('AgendaEventsCtrl',
        function ($scope, $tastypieResource) {
            "use strict";
            $scope.title = "Mon agenda";
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            $scope.events = new $tastypieResource('myagenda',
                                                  {order_by: 'start', start__gte: today});
            $scope.events.objects.$find();
        })
    .controller('EventCtrl',
        function ($window, $state, $scope, $stateParams, $tastypieResource,
                  join, leave, UserData) {
            "use strict";
            var event = new $tastypieResource('allevents');
            $scope.buttonTitle = "Chargement";
            $scope.buttonAction = function (eventId) {};
            console.log($stateParams);
            event.objects.$get({id: parseInt($stateParams.eventId, 10)}).then(
                function (result) {
                    $scope.event = result;
                    var my_id = UserData.getUserId(),
                        index,
                        participants = result.participants,
                        found = false;
                    if (my_id === result.owner.user.id) {
                        $scope.buttonTitle = "J'annule";
                        $scope.buttonAction = function (eventId) {
                            var myevent = new $tastypieResource('myevents');
                            myevent.objects.$delete({id: eventId});
                            $state.go('events.agenda', {}, { reload: true });
                        };
                    } else {
                        for (index = 0; index < participants.length; index += 1) {
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
                },
                function (error) {
                    $scope.buttonTitle = "Erreur de chargement";
                    console.log(error);
                }
            );
        })
    .controller('FriendsCtrl',
        function ($scope, $tastypieResource) {
            "use strict";
            var newFriends = new $tastypieResource('friends/new'),
                pendingFriends = new $tastypieResource('friends/pending');
            newFriends.objects.$find().then(
                function (result) {
                    $scope.new.badge = result.meta.total_count;
                }
            );
            pendingFriends.objects.$find().then(
                function (result) {
                    $scope.pending.badge = result.meta.total_count;
                }
            );
            $scope.my = {title: "Mes amis"};
            $scope.new = {title: "Ajouter des amis",
                            badge: 0};
            $scope.pending = {title: "Invitations en attente",
                                badge: 0};
        })
    .controller('NewFriendsCtrl',
        function ($scope, $tastypieResource, inviteFriend, sendInvite, ignoreInvite) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/new');
            $scope.friends.objects.$find();
            $scope.invites = new $tastypieResource('invite',
                                                   {status__exact: 'NEW'});
            $scope.invites.objects.$find();
            $scope.title = "Ajouter des amis";
            $scope.buttonTitle = "Inviter";
            $scope.friendButtonAction = function (userId) {
                inviteFriend(userId);
            };
            $scope.inviteButtonAction = function (inviteId) {
                sendInvite(inviteId);
            };
            $scope.ignoreButtonAction = function (inviteId) {
                ignoreInvite(inviteId);
            };
        })
    .controller('MyFriendsCtrl',
        function ($scope, $tastypieResource) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/my');
            $scope.friends.objects.$find();
            $scope.title = "Mes amis";
            $scope.buttonTitle = "Retirer";
        //     $scope.buttonAction = function (userId) {
        //         invite(userId);
        //     };
        })
    .controller('PendingFriendsCtrl',
        function ($scope, $tastypieResource, accept) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/pending');
            $scope.friends.objects.$find();
            $scope.title = "Invitations en attente";
            $scope.buttonTitle = "Accepter";
            $scope.buttonAction = function (userId) {
                accept(userId);
            };
        });
