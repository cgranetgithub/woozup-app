/*jslint browser: true, devel: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('starter.controllers',
               ['ionic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap',
               'google.places', 'ngImgCrop', 'starter.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function (e) {
//});

    .controller('LogoutCtrl',
            function ($tastypie, $ionicLoading, logout,
                      $state, UserData) {
            "use strict";
            $ionicLoading.show({template: "Déconnection"});
            logout();
            $state.go('connect');
            $ionicLoading.hide();
        })

    .controller('CheckauthCtrl',
        function ($scope, $rootScope, $cordovaPush, $ionicPlatform, $tastypie,
                  $ionicLoading, CheckauthService, sortContacts, $cordovaDevice,
                  $state, UserData, gcmRegister) {
            "use strict";
            $ionicLoading.show({template: "Vérification de l'identité"});
            CheckauthService.checkUserAuth()
                .success(function () {
                    $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                    gcmRegister(UserData.getNotifData());
                    findContacts(sortContacts);
                    $state.go('events.friends');
                    $ionicLoading.hide();
                })
                .error(function () {
                    $state.go('connect');
                    $ionicLoading.hide();
                });
        })

    .controller('ConnectCtrl',
        function ($tastypie, $ionicPopup, LoginService, sortContacts,
                  $scope, $state, UserData, gcmRegister) {
            "use strict";
            $scope.fbLogin = function () {
                facebookConnectPlugin.login([], function (obj) {
                    var authData = {
                        "provider": "facebook",
                        "access_token": obj.authResponse.accessToken
                    };
                    /* we have to call registerbyToken from service LoginService */
                    LoginService.loginUser(authData, "facebook")
                        .success(function () {
                            $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                            gcmRegister(UserData.getNotifData());
                            findContacts(sortContacts);
                            $state.go('friends.new');
                        }).error(function () {
                            $ionicPopup.alert({
                                title: "Problème lors de la création du compte",
                                template: "Veuillez réssayer"
                            });
                        });
                }, function (obj) {
                    console.log(obj);
                });
            };
        })

    .controller('RegisterCtrl',
        function ($tastypie, $ionicPopup, $ionicLoading, RegisterService, sortContacts,
                  $scope, $state, UserData, gcmRegister) {
            "use strict";
            $scope.data = {};
            $scope.register = function () {
                $ionicLoading.show({template: "Création du compte"});
                var authData = {'email': $scope.data.email,
                                'username': $scope.data.email,
                                'password': $scope.data.password,
                                'name': $scope.data.firstname,
                                'number': $scope.data.number
                        };
                RegisterService.registerUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        gcmRegister(UserData.getNotifData());
                        findContacts(sortContacts);
                        $state.go('picture');
                        $ionicLoading.hide();
                    }).error(function (err) {
                        var message;
                        switch (err) {
                        case '200':
                            message = "Cet utilisateur est déjà enregistré.";
                            break;
                        default:
                            message = "Entrez votre prénom, un email et un mot de passe, puis réessayez";
                        }
                        $ionicPopup.alert({
                            title: "Problème lors de la création du compte",
                            template: message
                        });
                        $ionicLoading.hide();
                    });
            };
        })

    .controller('LoginCtrl',
        function ($tastypie, $ionicLoading, LoginService, $ionicPopup, sortContacts,
                  $scope, $state, UserData, gcmRegister) {
            "use strict";
            $scope.data = {};
            $scope.login = function () {
                $ionicLoading.show({template: "Connexion"});
                var authData = {'username': $scope.data.username,
                                'password': $scope.data.password};
                LoginService.loginUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        gcmRegister(UserData.getNotifData());
                        findContacts(sortContacts);
                        $state.go('friends.new');
                        $ionicLoading.hide();
                    }).error(function () {
                        $ionicLoading.hide();
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

    .controller('PictureCtrl',
        function ($tastypieResource, $cordovaCamera, $ionicLoading, 
                  $scope, $state, CheckauthService, UserData, setpicture) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.myImage = '';
            $scope.myCroppedImage = '';
            var handleFileSelect = function (evt) {
                var file = evt.currentTarget.files[0],
                    reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function ($scope) {
                        $scope.myImage = evt.target.result;
                    });
                };
                reader.readAsDataURL(file);
            };
            $scope.userprofile = new $tastypieResource('userprofile', {});
            $scope.userprofile.objects.$get({id: UserData.getUserId()}).then(
                function (result) {
                    $scope.userprofile = result;
                    $ionicLoading.hide();
                },
                function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                }
            );
            $scope.photoFromCamera = function () {
                var options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                //       allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG, //important for orientation
                //       targetWidth: 300,
                //       targetHeight: 300,
                //       popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                $cordovaCamera.getPicture(options).then(function (imageURI) {
                    $scope.myImage = imageURI;
                }, function (err) {
                    console.log(err);
                });
    //             $cordovaCamera.cleanup() // .then(...); // only for FILE_URI
            };
            $scope.photoFromGallery = function () {
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.PNG,
                    mediaType: Camera.MediaType.PICTURE
                };
                $cordovaCamera.getPicture(options).then(function (imageURI) {
                    $scope.myImage = imageURI;
                }, function (err) {
                    console.log(err);
                });
            };
            $scope.photoFromFB = function () {
                $scope.myImage = 'http://localhost:8100/img/logo.png';
            };
            $scope.next = function (croppedImage) {
                var b64 = croppedImage.split(',')[1],
                    file_field = {
                        "name": "myfile.png",
                        "file": b64,
                    };
                setpicture(file_field);
                $state.go('friends.new');
            };
        })

    .controller('ProfileCtrl',
        function ($tastypieResource, $ionicLoading, $scope,
                  CheckauthService, UserData, setprofile) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.data = {'first_name' : '', 'last_name' : '', 'email' : '',
                        'number' : '', 'gender' : ''};
            $scope.userprofile = new $tastypieResource('userprofile', {});
            $scope.userprofile.objects.$get({id: UserData.getUserId()}).then(
                function (result) {
                    $scope.profile = result;
                    $scope.data.first_name = result.user.first_name;
                    $scope.data.last_name = result.user.last_name;
                    $scope.data.email = result.user.email;
                    $scope.data.number = result.phone_number;
                    $scope.data.gender = result.gender;
                    $ionicLoading.hide();
                },
                function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                }
            );
            $scope.save = function () {
                setprofile({
                    'first_name': $scope.data.first_name,
                    'last_name': $scope.data.last_name,
                    'email': $scope.data.email,
                    'number': $scope.data.number,
                    'gender': $scope.data.gender
                });
            };
        })

    .controller('WhatCtrl',
        function ($tastypieResource, $ionicLoading, $scope, $state,
                  EventData, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $scope.title = "Sélectionnez l'activité"
            $ionicLoading.show({template: "Chargement"});
            $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
            $scope.types.objects.$find().then(
                function () { $ionicLoading.hide(); },
                function () { $ionicLoading.hide(); }
            );
            $scope.next = function (typeId) {
                $ionicLoading.show({template: "Chargement"});
                $scope.types.objects.$get({id: typeId}).then(
                    function (result) {
                        EventData.setWhat(result);
                        $state.go('new.when', {}, { reload: true });
                        $ionicLoading.hide();
                    },
                    function (error) {
                        console.log(error);
                        $ionicLoading.hide();
                    }
                );
            };
        })

    .controller('WhenCtrl',
        function ($tastypieResource, $scope, $state, EventData, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
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
                $scope.events = new $tastypieResource('events/friends',
                                                      {order_by: 'start',
                                                       start__gte: newValue});
                $scope.events.objects.$find();
            });
        })

    .controller('WhereCtrl',
        function ($scope, $state, $filter, EventData, UserData, CheckauthService) {
            "use strict";
            /*global document: false */
            /*global google: false */
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            var map, geocoder, marker,
                infowindow = null, placeinfowindow = null, lastinfowindow = null,
                lat = 48.8567,
                long = 2.3508,
                setAddress = function (address, position) {
                    var coords = '{ "type": "Point", "coordinates": ['
                            + position.lat() + ', ' + position.lng() + '] }';
                    console.log(address, coords);
                    EventData.setAddress(address, coords);
                };
            $scope.title = EventData.getWhat().name + ', le ' + $filter('date')(EventData.getWhen(), 'EEEE d MMMM');
            $scope.button = {'title' : "Choisissez le lieu de rendez-vous"};
            $scope.place_changed = function () {
//                 infowindow.close();
//                 placeinfowindow.close();
                var place = $scope.place;
                if (!place.geometry) { return; }
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(18);
                }
//                     marker.setPlace({
//                         placeId: place.place_id,
//                         location: place.geometry.location
//                     });
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);
//                 infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
//                     'Place ID: ' + place.place_id + '<br>' +
//                     place.formatted_address);
//                 infowindow.open(map, marker);
                $scope.map.focus(); //make sure the keyboard hides
            };
            $scope.initialize = function () {
                if (UserData.getWhere()) {
                    lat = UserData.getWhere().latitude;
                    long = UserData.getWhere().longitude;
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
                    };
                map = new google.maps.Map(document.getElementById("map"),
                                          mapOptions);
                infowindow = new google.maps.InfoWindow();
                marker = new google.maps.Marker({map: map});
                geocoder = new google.maps.Geocoder;
                ///##### hack to get clic even on google places
                //keep a reference to the original setPosition-function
                var fx = google.maps.InfoWindow.prototype.setPosition;
                //override the built-in setPosition-method
                google.maps.InfoWindow.prototype.setPosition = function () {
                    //this property isn't documented, but as it seems
                    //it's only defined for InfoWindows opened on POI's
                    if (this.logAsInternal) {
                        placeinfowindow = this;
                        lastinfowindow = this;
                        google.maps.event.addListenerOnce(this, 'map_changed', function () {
                            var map = this.getMap();
                            //the infoWindow will be opened, usually after a click on a POI
                            if (map) {
                                //trigger the click
                                google.maps.event.trigger(map, 'click', {latLng: this.getPosition()});
                            }
                        });
                    }
                    //call the original setPosition-method
                    fx.apply(this, arguments);
                };
                ///#####
                map.addListener('click', function (e) {
                    $scope.$apply(function () {
                        $scope.map.focus(); //make sure the keyboard hides
                    });
                    
                    var address = '', position = e.latLng;
                    setAddress('', position);
                    marker.setPosition(position);
                    marker.setVisible(true);
                    geocoder.geocode({'location': position}, function (results, status, address) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                address = results[0].formatted_address;
                                setAddress(address, position);
                                $scope.button.title = address;
                                $scope.$apply(function () {
                                    $scope.button.title = address;
                                });
                                infowindow.setContent(address);
                                infowindow.open(map, marker);
                            }
                        }
                    });
                    console.log(placeinfowindow);
                    if (!placeinfowindow) {
//                         lastinfowindow.close();
                        infowindow.setContent(address);
                        infowindow.open(map, marker);
                        lastinfowindow = infowindow;
                    }
                    placeinfowindow = null;
                });
                $scope.map = map;
            };
            $scope.next = function () {
                $state.go('new.done', {}, { reload: true });
            };
        })

    .controller('DoneCtrl',
        function ($tastypieResource, $ionicLoading, $scope, $state,
                  EventData, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            var date = new Date();
            $scope.event = {};
            $scope.event.type = EventData.getWhat();
            $scope.event.title = EventData.getWhat().name;
            $scope.event.where = EventData.getWhere();
            $scope.event.start = EventData.getWhen();
            $scope.event.start.setHours(date.getHours() + 1);
            $scope.event.start.setMinutes(0);
            $scope.next = function () {
                $ionicLoading.show({template: "Création du rendez-vous"});
                var event = new $tastypieResource('events/mine');
                event.objects.$create({
                    name: $scope.event.title,
                    start: $scope.event.start,
                    event_type: EventData.getWhat().resource_uri,
                    location_name: $scope.event.where.name,
                    location_address: $scope.event.where.address,
                    location_id: $scope.event.where.id,
                    location_coords: $scope.event.where.coords
                }).$save().then(
                    function () {
                        $state.go('events.agenda', {}, { reload: true });
                        $ionicLoading.hide();
                    },
                    function (error) {
                        console.log(error);
                        $state.go('checkauth', {}, { reload: true });
                        $ionicLoading.hide();
                    }
                );
            };
        })

    .controller('EventsCtrl',
        function ($tastypieResource, $cordovaGeolocation, $ionicPopup,
                  $scope, $state, setlast, UserData, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $scope.friendsEventTitle = "Ce que mes amis ont prévu";
            $scope.FriendsTitle = "Mes amis";
            $scope.agendaTitle = "Mon agenda";
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
            $scope.home = function () {
                $state.go('events.agenda');
            };
        })

    .controller('FriendsEventsCtrl',
        function ($scope, $state, $tastypieResource, $ionicLoading,
                  CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes sorties";
            $scope.events = [];
            var today = new Date(), eventsResource,
                nextPages = function (result) {
                        var i;
                        if (result) {
                            for (i = 0; i < result.objects.length; i += 1) {
                                $scope.events.push(result.objects[i]);
                            }
                        }
                    };
            today.setHours(0);
            today.setMinutes(0);
            eventsResource = new $tastypieResource('events/friends',
                                            {order_by: 'start', start__gte: today});
            eventsResource.objects.$find().then(function (result) {
                nextPages(result);
                $ionicLoading.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.loadMore = function () {
                if (eventsResource.page.meta && eventsResource.page.meta.next) {
                    eventsResource.page.next().then(function (result) {
                        nextPages(result);
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
            $ionicLoading.hide();
        })
    .controller('AgendaEventsCtrl',
        function ($scope, $state, $tastypieResource, $ionicLoading,
                  CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes sorties";
            $scope.events = [];
            var today = new Date(), eventsResource,
                nextPages = function (result) {
                        var i;
                        if (result) {
                            for (i = 0; i < result.objects.length; i += 1) {
                                $scope.events.push(result.objects[i]);
                            }
                        }
                    };
            today.setHours(0);
            today.setMinutes(0);
            var eventsResource = new $tastypieResource('events/agenda',
                                        {order_by: 'start', start__gte: today});
            eventsResource.objects.$find().then(function (result) {
                nextPages(result);
                $ionicLoading.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.loadMore = function () {
                if (eventsResource.page.meta && eventsResource.page.meta.next) {
                    eventsResource.page.next().then(function (result) {
                        nextPages(result);
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.newEvent = function () {
                $state.go('new.what');
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
        })
    .controller('EventCtrl',
        function ($window, $state, $scope, $stateParams, $tastypieResource,
                  join, leave, UserData, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            var event = new $tastypieResource('events/all');
            $scope.buttonTitle = "Chargement";
            event.objects.$get({id: parseInt($stateParams.eventId, 10)}).then(
                function (result) {
                    $scope.event = result;
                    var my_id = UserData.getUserId(),
                        index,
                        participants = result.participants,
                        found = false;
                    console.log(my_id, result.owner.user.id);
                    if (my_id === result.owner.user.id) {
                        $scope.buttonTitle = "J'annule";
                        $scope.buttonAction = function (eventId) {
                            var myevent = new $tastypieResource('events/mine');
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
            $scope.home = function () {
                $state.go('events.agenda');
            };
        })
    .controller('FriendsCtrl',
        function ($scope, $state, $tastypieResource, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            var newFriends = new $tastypieResource('friends/new'),
                pendingFriends = new $tastypieResource('friends/pending'),
                invites = new $tastypieResource('invite',
                                                {status__exact: 'NEW'});
            newFriends.objects.$find().then(
                function (result) {
                    $scope.new.badge += result.meta.total_count;
                }
            );
            invites.objects.$find().then(
                function (result) {
                    $scope.new.badge += result.meta.total_count;
                }
            );
            pendingFriends.objects.$find().then(
                function (result) {
                    $scope.pending.badge = result.meta.total_count;
                }
            );
            $scope.agendaTitle = "Mes sorties";
            $scope.my = {title: "Mes amis"};
            $scope.new = {title: "Ajouter des amis", badge: 0};
            $scope.pending = {title: "Invitations en attente", badge: 0};
            $scope.home = function () { $state.go('events.agenda'); };
        })
    .controller('NewFriendsCtrl',
        function ($tastypieResource, $ionicLoading, $q, $scope, $state,
                  sendInvite, ignoreInvite, inviteFriend, ignoreFriend,
                  CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
            $scope.displayButton = true;
            $scope.invites = [];
            $scope.friends = [];
            var invitesResource = new $tastypieResource('invite',
                                            {status__exact: 'NEW', order_by: 'name'}),
                friendsResource = new $tastypieResource('friends/new',
                                                        {order_by: 'user__first_name'}),
                nextPages = function (invitePage, friendsPage) {
                    $q.all([invitePage, friendsPage]).then(function (arrayOfResults) {
                        var i;
                        if (arrayOfResults[0]) {
                            for (i = 0; i < arrayOfResults[0].objects.length; i += 1) {
                                $scope.invites.push(arrayOfResults[0].objects[i]);
                            }
                        }
                        if (arrayOfResults[1]) {
                            for (i = 0; i < arrayOfResults[1].objects.length; i += 1) {
                                $scope.friends.push(arrayOfResults[1].objects[i]);
                            }
                        }
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };
            nextPages(invitesResource.objects.$find(), friendsResource.objects.$find());
            $scope.loadMore = function () {
                var nextInvitePage = null,
                    nextFriendPage = null;
                if (invitesResource.page.meta && invitesResource.page.meta.next) {
                    nextInvitePage = invitesResource.page.next();
                }
                if (friendsResource.page.meta && friendsResource.page.meta.next) {
                    nextFriendPage = friendsResource.page.next();
                }
                nextPages(nextInvitePage, nextFriendPage);
            };
            $scope.inviteFriendButton = function (friend) {
                $scope.friends.splice($scope.friends.indexOf(friend), 1);
                inviteFriend(friend.user.id);
            };
            $scope.ignoreFriendButton = function (friend) {
                $scope.friends.splice($scope.friends.indexOf(friend), 1);
                ignoreFriend(friend.user.id);
            };
            $scope.sendInviteButton = function (invite) {
                $scope.invites.splice($scope.invites.indexOf(invite), 1);
                sendInvite(invite.id);
            };
            $scope.ignoreInviteButton = function (invite) {
                $scope.invites.splice($scope.invites.indexOf(invite), 1);
                ignoreInvite(invite.id);
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
        })
    .controller('MyFriendsCtrl',
        function ($tastypieResource, $ionicLoading, $scope, $state,
                  CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
            $scope.displayButton = false;
            $scope.friends = [];
            var friendsResource = new $tastypieResource('friends/mine',
                                                        {order_by: 'user__first_name'}),
                nextPages = function (result) {
                        var i;
                        if (result) {
                            for (i = 0; i < result.objects.length; i += 1) {
                                $scope.friends.push(result.objects[i]);
                            }
                        }
                    };
            friendsResource.objects.$find().then(function (result) {
                nextPages(result);
                $ionicLoading.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.loadMore = function () {
                if (friendsResource.page.meta && friendsResource.page.meta.next) {
                    friendsResource.page.next().then(function (result) {
                        nextPages(result);
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
        })
    .controller('PendingFriendsCtrl',
        function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend,
                  $scope, $state, CheckauthService) {
            "use strict";
            CheckauthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
            $scope.displayButton = true;
            $scope.friends = [];
            var friendsResource = new $tastypieResource('friends/pending',
                                                        {order_by: 'user__first_name'}),
                nextPages = function (result) {
                        var i;
                        if (result) {
                            for (i = 0; i < result.objects.length; i += 1) {
                                $scope.friends.push(result.objects[i]);
                            }
                        }
                    };
            friendsResource.objects.$find().then(function (result) {
                nextPages(result);
                $ionicLoading.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.loadMore = function () {
                if (friendsResource.page.meta && friendsResource.page.meta.next) {
                    friendsResource.page.next().then(function (result) {
                        nextPages(result);
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.inviteFriendButton = function (friend) {
                $scope.friends.splice(friend.$index, 1);
                acceptFriend(friend.user.id);
            };
            $scope.ignoreFriendButton = function (friend) {
                $scope.friends.splice(friend.$index, 1);
                rejectFriend(friend.user.id);
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
        });

    
findContacts = function(sortContacts) {
    var options,
        filter = ["displayName", "name"],
        lastCheck, //window.localStorage.contact_sync,
        curDate = new Date();
    if (!navigator.contacts) { return; }
//                     if (lastCheck && (curDate.getTime() / 1000) - lastCheck < 7 * 3600 * 24) {
//                         return;
//                     }
    options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    navigator.contacts.find(filter, function (contacts) {
        if (contacts === null) {
            console.log("No contact retrieved");
            return;
        }
        var stuff = [],
            helper = function (tab, k) {
                var t = [], i;
                k = k || "value";
                if (!tab) { return t; }
                for (i = 0; i < tab.length; i += 1) {
                    t.push(tab[i][k]);
                }
                return t;
            };
        contacts.forEach(function (entry) {
            if ((!entry.phoneNumbers ||  !entry.phoneNumbers.length)
                    && (!entry.emails || !entry.emails.length)) {
//                 console.log("skipping " + entry.name.formatted);
                return;
            }

            stuff.push({
                'name': entry.name.formatted,
                'emails': helper(entry.emails).join(', '),
                'numbers': helper(entry.phoneNumbers).join(', '),
                'photo': helper(entry.photos).join(', '),
            });
        });
        sortContacts(stuff);
    }, function () {
        // an error has occured, try to resync next day
        window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
        console.log("Error");
    }, options);
};
