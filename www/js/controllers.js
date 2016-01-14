/*jslint browser: true, devel: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

var gps_in_progress = false;

angular.module('starter.controllers',
               ['ionic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap',
                'ngImgCrop', 'starter.services', 'ngMap', 'google.places'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function (e) {
//});

    .controller('LogoutCtrl', ['$ionicLoading', 'logout', '$state',
        function ($ionicLoading, logout, $state) {
            "use strict";
            $ionicLoading.show({template: "Déconnection"});
            logout();
            $state.go('connect');
            $ionicLoading.hide();
        }])

    .controller('CheckauthCtrl', ['$tastypie', '$ionicLoading', 'AuthService',
                'sortContacts', '$cordovaDevice', '$state', 'UserData',
                'pushNotifReg', '$ionicHistory', 
        function ($tastypie, $ionicLoading,
                  AuthService, sortContacts, $cordovaDevice,
                  $state, UserData, pushNotifReg, $ionicHistory) {
            "use strict";
            $ionicLoading.show({template: "Vérification de l'identité"});
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            // verify authentication
            AuthService.checkUserAuth()
                .success(function () {
                    $tastypie.setAuth(UserData.getUserName(),
                                      UserData.getApiKey());
                    pushNotifReg(UserData.getNotifData());
                    findContacts(sortContacts);
                    $state.go('events.friends');
                    $ionicLoading.hide();
                })
                .error(function () {
                    $state.go('connect');
                    $ionicLoading.hide();
                });
        }])

    .controller('ConnectCtrl', ['$tastypie', '$ionicPopup', 'AuthService',
                'sortContacts', '$scope', '$state', 'UserData', 'pushNotifReg',
                '$ionicHistory',
        function ($tastypie, $ionicPopup, AuthService, sortContacts,
                  $scope, $state, UserData, pushNotifReg, $ionicHistory) {
            "use strict";
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            // Facebook connect method
            $scope.fbLogin = function () {
                facebookConnectPlugin.login([], function (obj) {
                    var authData = {
                        "provider": "facebook",
                        "access_token": obj.authResponse.accessToken
                    };
                    /* we have to call registerbyToken from service AuthService */
                    AuthService.loginUser(authData, "facebook")
                        .success(function () {
                            $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                            pushNotifReg(UserData.getNotifData());
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
        }])

    .controller('RegisterCtrl', ['$tastypie', '$ionicPopup', '$ionicLoading',
                'AuthService', 'sortContacts', '$scope', '$state', 'UserData',
                'pushNotifReg', '$ionicHistory',
        function ($tastypie, $ionicPopup, $ionicLoading, AuthService,
                  sortContacts, $scope, $state, UserData, pushNotifReg,
                  $ionicHistory) {
            "use strict";
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $scope.data = {};
            $scope.regex_username = new RegExp("^[0-9A-Za-z-_@+.]{4,30}$");
            $scope.regex_password = new RegExp("^.{6,20}$");

            $scope.register = function () {
                $ionicLoading.show({template: "Création du compte"});
                var authData = {'email': $scope.data.email,
                                'password': $scope.data.password,
                        };
                AuthService.registerUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        pushNotifReg(UserData.getNotifData());
                        findContacts(sortContacts);
                        $state.go('picture');
                        $ionicLoading.hide();
                    }).error(function (err) {
                        var message;
                        switch (err) {
                        case '10':
                            message = "Saisir un nom d'utilisateur et un mot de passe";
                            break;
                        case '200':
                            message = "Désolé, ce nom d'utilisateur est déjà pris.";
                            break;
                        case '150':
                            message = "Cet utilisateur a été désactivé. Contactez Woozup.";
                            break;
                        default:
                            message = "Problème lors de la création du compte. Veuillez réessayez plus tard.";
                        }
                        $ionicPopup.alert({
                            title: "Problème lors de la création du compte",
                            template: message
                        });
                        $ionicLoading.hide();
                    });
            };
        }])

    .controller('LoginCtrl', ['$tastypie', '$ionicLoading', 'AuthService',
                '$ionicPopup', 'sortContacts', '$scope', '$state', 'UserData',
                'pushNotifReg', 'resetPassword', '$ionicHistory',
        function ($tastypie, $ionicLoading, AuthService, $ionicPopup,
                  sortContacts, $scope, $state, UserData, pushNotifReg,
                  resetPassword, $ionicHistory) {
            "use strict";
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $scope.data = {};
            $scope.login = function () {
                $ionicLoading.show({template: "Connexion"});
                var authData = {'login': $scope.data.login,
                                'password': $scope.data.password};
                AuthService.loginUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        pushNotifReg(UserData.getNotifData());
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
            $scope.reset = function () {
                $scope.data = {};
                var myPopup = $ionicPopup.show({
                    template: '<input type="email" ng-model="data.email">',
                    title: 'Entrez votre adresse email',
                    subTitle: 'Un email va vous être envoyé à cette adresse pour changer votre mot de passe',
                    scope: $scope,
                    buttons: [
                        { text: 'Annuler' },
                        {
                            text: "<b>Envoyer l'email</b>",
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.email) {
                                    //don't allow the user to close unless he enters email
                                    e.preventDefault();
                                } else {
                                    resetPassword({'email': $scope.data.email});
                                }
                            }
                        }
                    ]
                });
                myPopup.then(function(res) {});
            }
        }])

    .controller('PictureCtrl', ['$tastypieResource', '$cordovaCamera',
                '$ionicLoading', '$scope', '$state', '$ionicActionSheet',
                'AuthService', 'UserData', 'setpicture', 'setprofile',
                '$ionicPlatform', '$ionicHistory',
        function ($tastypieResource, $cordovaCamera, $ionicLoading, $scope,
                  $state, $ionicActionSheet, AuthService,
                  UserData, setpicture, setprofile, $ionicPlatform,
                  $ionicHistory) {
            "use strict";
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            // disable back button
            var deregister = $ionicPlatform.registerBackButtonAction(function () {}, 101);
            $ionicLoading.show({template: "Chargement"});
            $scope.data = {'first_name': UserData.getUserName()};
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
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
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
            // ActionSheet (present picture selection methods to user)
            $scope.pictureMethods = function() {
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: "Prendre une photo" },
                        { text: 'Choisir dans la galerie' }
                    ],
                    titleText: '<b>Choisir une photo pour mon profil</b>',
                    buttonClicked: function(index) {
                        switch (index) {
                        case 0:
                            $scope.photoFromCamera();
                            break;
                        case 1:
                            $scope.photoFromGallery()
                            break;
                        }
                        return true;
                    }
                });
            };
            $scope.next = function (croppedImage) {
                $ionicLoading.show({template: "Sauvegarde du profil"});
                var b64 = croppedImage.split(',')[1],
                    file_field = {
                        "name": "myfile.png",
                        "file": b64,
                    };
                setprofile({'first_name': $scope.data.first_name});
                setpicture(file_field);
                $state.go('friends.new');
                // enable back button again
                deregister();
                $ionicLoading.hide();
            };
        }])

    .controller('ProfileCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
                'AuthService', 'UserData', 'setprofile', '$state',
        function ($tastypieResource, $ionicLoading, $scope,
                  AuthService, UserData, setprofile, $state) {
            "use strict";
            $ionicLoading.show({template: "Chargement"});
            $scope.title = UserData.getUserName();
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
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
            $scope.save = function () {
                $ionicLoading.show({template: "Mise à jour du profil"});
                setprofile({
                    'first_name': $scope.data.first_name,
                    'last_name': $scope.data.last_name,
                    'email': $scope.data.email,
                    'number': $scope.data.number,
                    'gender': $scope.data.gender
                });
                $ionicLoading.hide();
            };
        }])

    .controller('WhatCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
                '$state', 'EventData', 'AuthService',
        function ($tastypieResource, $ionicLoading, $scope, $state,
                  EventData, AuthService) {
            "use strict";
            $scope.title = "Nouveau rendez-vous"
            $ionicLoading.show({template: "Chargement"});
            $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
            $scope.types.objects.$find().then(
                function () { $ionicLoading.hide(); },
                function (error) {
                    console.log(error);
                    $ionicLoading.hide();                    
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
            $scope.next = function (typeId) {
                $ionicLoading.show({template: "Chargement"});
                $scope.types.objects.$get({id: typeId}).then(
                    function (result) {
                        EventData.setWhat(result);
                        $state.go('when');
//                         $state.go('when', {}, { reload: true });
                        $ionicLoading.hide();
                    },
                    function (error) {
                        console.log(error);
                        $ionicLoading.hide();
                    }
                );
            };
        }])

    .controller('WhenCtrl', ['$scope', '$state', 'EventData',
        function ($scope, $state, EventData) {
            "use strict";
            $scope.when = {};
            $scope.when.date = new Date();
            $scope.when.mindate = new Date();
            $scope.title = EventData.getWhat().name;
            $scope.backgroundUrl = EventData.getWhat().background;
            $scope.next = function () {
                EventData.setWhen($scope.when.date);
                $state.go('where', {}, { reload: true });
//                 $state.go('where');
            };
//             $scope.$watch("when.date", function (newValue, oldValue) {
//                 newValue.setHours(0);
//                 newValue.setMinutes(0);
//                 $scope.events = new $tastypieResource('events/friends',
//                                                       {order_by: 'start',
//                                                        start__gte: newValue});
//                 $scope.events.objects.$find();
//             });
        }])

    .controller('WhereCtrl', ['$scope', '$log', '$state', '$filter', 'EventData',
                'UserData', 'NgMap',
        function ($scope, $log, $state, $filter, EventData, UserData, NgMap) {
            "use strict";
            /*global google: false */
            // initialize coords
            $scope.$log = $log;
            var lat = 48.8567, lng = 2.3508, vm = this,
                geocoder = new google.maps.Geocoder,
//                 setAddress = function (address, lat, lng) {
//                     var coords = '{ "type": "Point", "coordinates": ['
//                                  + lat + ', ' + lng + '] }';
//                     EventData.setAddress(address, coords);
//                 },
                coordChanged = function(latLng, addr) {
                    vm.lat = latLng.lat().toString();
                    vm.lng = latLng.lng().toString();
                    if (addr) {
                        vm.where = addr;
                        EventData.setAddress(vm.where, vm.lat, vm.lng);
                    } else {
                        geocoder.geocode({'location': latLng},
                                        function (results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    $scope.$apply(function () {
                                        vm.where = results[0].formatted_address;
                                        EventData.setAddress(vm.where,
                                                             vm.lat, vm.lng);
                                    });
                                }
                            }
                        });
                    }
                };
            vm.$log = $log;
            vm.backgroundUrl = EventData.getWhat().background;
            vm.title = EventData.getWhat().name + ', le ' + $filter('date')(EventData.getWhen(), 'EEEE d MMMM');
            if (EventData.getWhere() && EventData.getWhere().lat && 
                    EventData.getWhere().lng) {
                $log.log(EventData.getWhere());
                lat = EventData.getWhere().lat;
                lng = EventData.getWhere().lng;
            } else if (UserData.getWhere()) {
                lat = UserData.getWhere().latitude;
                lng = UserData.getWhere().longitude;
            }
            var pos = new google.maps.LatLng(lat, lng);
            coordChanged(pos, null);
            NgMap.getMap().then(function(map) {
                $log.log('markers', map.markers);
                // disable POI (to avoid info window)
                var styles = [{
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]   
                }];
                map.setOptions({styles: styles});
                vm.map = map;
            });
            // when autocomplete changes, center on the place,
            // show marker and set address in button
            vm.placeChanged = function() {
                $log.log(vm.place);
                if (vm.place.geometry) {
                    EventData.setPlace(vm.place.name, vm.place.place_id);
                    vm.map.setCenter(vm.place.geometry.location);
                    coordChanged(vm.place.geometry.location,
                                vm.place.formatted_address
                    );
                }
            }
            // on click event, show marker and set address in button
            vm.onClick= function(event) {
                EventData.setPlace('', '');
                coordChanged(event.latLng);
            };
            vm.next = function () {
                $state.go('done', {});
                for (var key in vm.map.markers) {
                    vm.map.markers[key].setMap(null);
                }
            };
            vm.back = function () {
                $state.go('when', {});
                for (var key in vm.map.markers) {
                    vm.map.markers[key].setMap(null);
                }
            };
        }])

    .controller('DoneCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
                '$state', 'EventData', 'AuthService',
        function ($tastypieResource, $ionicLoading, $scope, $state,
                  EventData, AuthService) {
            "use strict";
            var date = new Date();
            $scope.backgroundUrl = EventData.getWhat().background;
            $scope.event = {};
            $scope.event.type = EventData.getWhat();
            $scope.event.title = EventData.getWhat().name;
            $scope.event.where = EventData.getWhere();
            $scope.event.start = EventData.getWhen();
            $scope.event.start.setHours(date.getHours() + 1);
            $scope.event.start.setMinutes(0);
            $scope.next = function () {
                $ionicLoading.show({template: "Création du rendez-vous"});
                var event = new $tastypieResource('events/mine'),
                    coords = '{ "type": "Point", "coordinates": ['
                                 + $scope.event.where.lat + ', '
                                 + $scope.event.where.lng + '] }';
                event.objects.$create({
                    name: $scope.event.title,
                    start: $scope.event.start,
                    event_type: EventData.getWhat().resource_uri,
                    location_name: $scope.event.where.name,
                    location_address: $scope.event.where.address,
                    location_id: $scope.event.where.id,
                    location_coords: coords
                }).$save().then(
                    function () {
                        $state.go('events.agenda', {}, { reload: true });
                        $ionicLoading.hide();
                    },
                    function (error) {
                        console.log(error);
                        $ionicLoading.hide();
                        // verify authentication
                        AuthService.checkUserAuth().success()
                            .error(function () {$state.go('connect');});
                    }
                );
            };
            $scope.where = function () {
//                 $state.go('where');
                $state.go('where', {}, { reload: true });
            };
        }])

    .controller('EventsCtrl', ['$tastypieResource', '$cordovaGeolocation',
                '$ionicPopup', '$scope', '$state', 'setlast', 'UserData',
                'AuthService', 
        function ($tastypieResource, $cordovaGeolocation, $ionicPopup,
                  $scope, $state, setlast, UserData, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $scope.friendsEventTitle = "Ce que mes amis ont prévu";
            $scope.FriendsTitle = "Mes amis";
            $scope.agendaTitle = "Mon agenda";
            if (gps_in_progress) {
                return;
            }
            gps_in_progress = true;
            var posOptions = {timeout: 5000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (loc) {
                    gps_in_progress = false;
                    setlast(loc);
                    UserData.setWhere(loc.coords);
                }, function (err) {
                    gps_in_progress = false;
                    console.log(err);
                    $scope.userposition = new $tastypieResource('userposition', {});
                    $scope.userposition.objects.$get({id: UserData.getUserId()}).then(
                        function (result) {
                            UserData.setWhere(result.last);
                        },
                        function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('connect');});
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
        }])

    .controller('FriendsEventsCtrl', ['$scope', '$state', '$tastypieResource',
                '$ionicLoading', 'AuthService',
        function ($scope, $state, $tastypieResource, $ionicLoading,
                  AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
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
            eventsResource.objects.$find().then(
                function (result) {
                    nextPages(result);
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
            $scope.loadMore = function () {
                if (eventsResource.page.meta && eventsResource.page.meta.next) {
                    eventsResource.page.next().then(
                        function (result) {
                            nextPages(result);
                        }, function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('connect');});
                        });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.home = function () {
                $state.go('events.agenda');
            };
            $ionicLoading.hide();
        }])
    .controller('AgendaEventsCtrl', ['$scope', '$state', '$tastypieResource',
                '$ionicLoading', 'AuthService',
        function ($scope, $state, $tastypieResource, $ionicLoading,
                  AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
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
            eventsResource.objects.$find().then(
                function (result) {
                    nextPages(result);
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
            $scope.loadMore = function () {
                if (eventsResource.page.meta && eventsResource.page.meta.next) {
                    eventsResource.page.next().then(
                        function (result) {
                            nextPages(result);
                        }, function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('connect');});
                        }
                    );
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
        }])
    .controller('EventCtrl', ['$window', '$state', '$scope', '$stateParams',
                '$tastypieResource', 'join', 'leave', 'UserData', 'AuthService',
        function ($window, $state, $scope, $stateParams, $tastypieResource,
                  join, leave, UserData, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('connect');});
            $scope.buttonTitle = "Chargement";
            var event = new $tastypieResource('events/all'),
                updateEvent = function () {
                    event.objects.$get({id: parseInt($stateParams.eventId, 10)}).then(
                        function (result) {
                            $scope.event = result;
                            var my_id = UserData.getUserId(),
                                index,
                                participants = result.participants,
                                found = false;
                            if (!result.canceled) {
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
                                            leaveAndReload(eventId);
            //                                 $window.location.reload(true);
                                        };
                                    } else {
                                        $scope.buttonTitle = "Je participe";
                                        $scope.buttonAction = function (eventId) {
                                            joinAndReload(eventId);
            //                                 $window.location.reload(true);
                                        };
                                    }
                                }
                            }
                        }, function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('connect');});
                            $scope.buttonTitle = "Erreur de chargement";
                        })
                },
               leaveAndReload = function (eventId) {
                    leave(eventId);
                    updateEvent();
                },
               joinAndReload = function (eventId) {
                    join(eventId);
                    updateEvent();
                };
            updateEvent();
            $scope.home = function () {
                $state.go('events.agenda');
            };
        }])
    .controller('FriendsCtrl', ['$scope', '$state', '$tastypieResource',
        function ($scope, $state, $tastypieResource) {
            "use strict";
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
        }])
    .controller('NewFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$q',
                '$scope', '$state', 'sendInvite', 'ignoreInvite', 'inviteFriend',
                'ignoreFriend', 'AuthService',
        function ($tastypieResource, $ionicLoading, $q, $scope, $state, sendInvite,
                  ignoreInvite, inviteFriend, ignoreFriend, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
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
                    $q.all([invitePage, friendsPage]).then(
                        function (arrayOfResults) {
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
                        }, function (arrayOfErrors) {
                            console.log(arrayOfErrors);
                            $ionicLoading.hide();
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('connect');});
                        }
                    );
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
        }])
    .controller('MyFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
                '$state', 'AuthService',
        function ($tastypieResource, $ionicLoading, $scope, $state, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
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
            friendsResource.objects.$find().then(
                function (result) {
                    nextPages(result);
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (error) {
                    console.log(error);
                    // verify authentication
                    $ionicLoading.hide();
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
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
        }])
    .controller('PendingFriendsCtrl', ['$tastypieResource', '$ionicLoading',
                'acceptFriend', 'rejectFriend', '$scope', '$state', 'AuthService',
        function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend,
                  $scope, $state, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
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
            friendsResource.objects.$find().then(
                function (result) {
                    nextPages(result);
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('connect');});
                }
            );
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
        }]);

    
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
            if (!entry.phoneNumbers || !entry.phoneNumbers.length) {
//                || !entry.emails || !entry.emails.length) {
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
        // send to server by chunk
        var i, j, temparray, chunk = 30;
        for (i=0, j=stuff.length; i<j; i+=chunk) {
            temparray = stuff.slice(i,i+chunk);
            sortContacts(temparray);
        }
    }, function () {
        // an error has occured, try to resync next day
        window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
        console.log("Error");
    }, options);
};
