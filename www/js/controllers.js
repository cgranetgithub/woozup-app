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

    .controller('CheckauthCtrl',
        function ($tastypie, $state, UserData, CheckauthService, sortContacts) {
            "use strict";
            CheckauthService.checkUserAuth()
                .success(function () {
                    $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                    $state.go('new.what');

                    var options,
                        filter = ["displayName", "name"],
                        lastCheck = undefined, //window.localStorage.contact_sync,
                        curDate = new Date();

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
                            var stuff = [];

                            window.localStorage.contact_sync = curDate;

                            if (contacts === null) {
                                console.log("No contact retrieved");
                                return;
                            }

                            var helper = function (tab, k) {
                                var t = [];

                                k = k || "value";
                                if (!tab) {
                                    return t;
                                }

                                for (var i=0; i<tab.length; i+=1) {
                                    t.push(tab[i][k]);
                                }
                                return t;
                            };

                            contacts.forEach(function (entry) {
                                if ((!entry.phoneNumbers ||  !entry.phoneNumbers.length)
                                     && (!entry.emails || !entry.emails.length)) {
                                    console.log("skipping " + entry.name.formatted);
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
                        },
                        function () {
                            // an error has occured, try to resync next day
                            window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
                            console.log("Error");
                        }, options
                    );
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
                var authData = {'email': $scope.data.email,
                                'username': $scope.data.email,
                                'password': $scope.data.password,
                                'name': $scope.data.firstname,
                                'number': $scope.data.number
                };
                RegisterService.registerUser(authData, false)
                    .success(function () {
                        $tastypie.setAuth(UserData.getUserName(), UserData.getApiKey());
                        $state.go('picture');
                    }).error(function (err) {
                        var message;
                        switch(err) {
                            case '200':
                                message = "Cet utilisateur est déjà enregistré."
                                break;
                            default:
                                message = "Entrez votre prénom, un email et un mot de passe, puis réessayez"
                        } 
                        $ionicPopup.alert({
                            title: "Problème lors de la création du compte",
                            template: message
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

    .controller('PictureCtrl',
                function ($tastypieResource, $scope, $state, $cordovaCamera,
                          UserData, setpicture) {
        "use strict";
        $scope.myImage='';
        $scope.myCroppedImage='';
        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function($scope){
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        $scope.userprofile = new $tastypieResource('userprofile', {});
        $scope.userprofile.objects.$get({id: UserData.getUserId()}).then(
            function (result) {
                $scope.userprofile = result;
            },
            function (error) {
                console.log(error);
            })
            
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
                correctOrientation:true
            };
            $cordovaCamera.getPicture(options).then(function (imageURI) {
                $scope.myImage = imageURI;
            }, function(err) {
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
            }, function(err) {
                console.log(err);
            });
        };
        $scope.photoFromFB = function () {
            $scope.myImage='http://localhost:8100/img/logo.png';
        };
        $scope.next = function (croppedImage) {
            var b64 = croppedImage.split(',')[1];
            var file_field = {
                "name": "myfile.png",
                "file": b64,
//                 "content_type": "image/png"
            }
            setpicture(file_field);
            $state.go('new.what');
        };
    })

    .controller('ProfileCtrl',
                function ($tastypieResource, $scope, $state, $cordovaCamera,
                          UserData, setpicture) {
        "use strict";
        $scope.data = {'first_name' : '', 'last_name' : '', 'email' : '',
                       'number' : '', 'gender' : ''};
        $scope.userprofile = new $tastypieResource('userprofile', {});
        $scope.userprofile.objects.$get({id: UserData.getUserId()}).then(
            function (result) {
                $scope.profile = result;
                $scope.data.first_name = result.user.first_name;
                $scope.data.last_name = result.user.last_name;
                $scope.data.email = result.user.email;
                $scope.data.number = result.number;
                $scope.data.gender = result.gender;
            },
            function (error) {
                console.log(error);
            }
        );
        $scope.save = function () {
            
        }
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
            var map, geocoder, marker,
                infowindow=null, placeinfowindow=null, lastinfowindow=null,
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
                    google.maps.event.addListenerOnce(this, 'map_changed',function () {
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
                    var address = '', position = e.latLng;
                    setAddress('', position);
                    marker.setPosition(position);
                    marker.setVisible(true);
                    geocoder.geocode({'location': position}, function(results, status, address) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                address = results[0].formatted_address;
                                setAddress(address, position);
                                $scope.button.title = address;
                                $scope.$apply(function() { $scope.button.title = address; });
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
        function ($tastypieResource, $scope, $state, EventData) {
            "use strict";
            var date = new Date();
            $scope.event = {};
            $scope.event.type = EventData.getWhat();
            $scope.event.title = EventData.getWhat().name;
            $scope.event.where = EventData.getWhere();
            $scope.event.start = EventData.getWhen();
            $scope.event.start.setHours(date.getHours() + 1);
            $scope.event.start.setMinutes(0);
            $scope.next = function () {
                var event = new $tastypieResource('myevents');
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
            $scope.home = function () {
                $state.go('new.what');
            };
        })

    .controller('FriendsEventsCtrl',
        function ($scope, $state, $tastypieResource) {
            "use strict";
            $scope.title = "Ce que mes amis ont prévu";
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            $scope.events = new $tastypieResource('friendsevents',
                                                  {order_by: 'start', start__gte: today});
            $scope.events.objects.$find();
            $scope.home = function () {
                $state.go('new.what');
            };
        })
    .controller('AgendaEventsCtrl',
        function ($scope, $state, $tastypieResource) {
            "use strict";
            $scope.title = "Mon agenda";
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            $scope.events = new $tastypieResource('myagenda',
                                                  {order_by: 'start', start__gte: today});
            $scope.events.objects.$find();
            $scope.home = function () {
                $state.go('new.what');
            };
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
                    console.log(my_id, result.owner.user.id);
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
            $scope.home = function () {
                $state.go('new.what');
            };
        })
    .controller('FriendsCtrl',
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
            $scope.my = {title: "Mes amis"};
            $scope.new = {title: "Ajouter des amis",
                            badge: 0};
            $scope.pending = {title: "Invitations en attente",
                                badge: 0};
            $scope.home = function () {
                $state.go('new.what');
            };
        })
    .controller('NewFriendsCtrl',
        function ($scope, $state, $tastypieResource,
                  inviteFriend, ignoreFriend, sendInvite, ignoreInvite) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/new');
            $scope.friends.objects.$find();
            $scope.invites = new $tastypieResource('invite',
                                                   {status__exact: 'NEW'});
            $scope.invites.objects.$find();
            $scope.title = "Ajouter des amis";
            $scope.acceptFriendButton = function (userId) {
                inviteFriend(userId);
            };
            $scope.ignoreFriendButton = function (userId) {
                ignoreFriend(userId);
            };
            $scope.sendInviteButton = function (inviteId) {
                sendInvite(inviteId);
            };
            $scope.ignoreInviteButton = function (inviteId) {
                ignoreInvite(inviteId);
            };
            $scope.home = function () {
                $state.go('new.what');
            };
        })
    .controller('MyFriendsCtrl',
        function ($scope, $state, $tastypieResource) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/my');
            $scope.friends.objects.$find();
            $scope.title = "Mes amis";
            $scope.buttonTitle = "Retirer";
            $scope.home = function () {
                $state.go('new.what');
            };
        })
    .controller('PendingFriendsCtrl',
        function ($scope, $state, $tastypieResource, acceptFriend, rejectFriend) {
            "use strict";
            $scope.friends = new $tastypieResource('friends/pending');
            $scope.friends.objects.$find();
            $scope.title = "Invitations en attente";
            $scope.acceptFriendButton = function (userId) {
                acceptFriend(userId);
            };
            $scope.ignoreFriendButton = function (userId) {
                rejectFriend(userId);
            };
            $scope.home = function () {
                $state.go('new.what');
            };
        });
