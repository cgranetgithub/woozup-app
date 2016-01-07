/*jslint browser: true*/
/*global angular, cordova, StatusBar*/

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova',
                            'starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform, $cordovaDevice, UserData, pushNotifReg,
                   $cordovaDialogs, $state) {
        "use strict";
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the
            // accessory bar above the keyboard for form inputs)
            if (window.cordova && window.cordova.plugins
                    && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            // won't work in browser, normal (cordova)
            var push = PushNotification.init({
                "android": {"senderID": "496829276290"},
                "ios": {"alert": "true", "badge": "true", "sound": "true"},
                "windows": {}
            } );
            push.on('registration', function(data) {
                UserData.setNotifData(data.registrationId,
                                     $cordovaDevice.getModel(),
                                     $cordovaDevice.getUUID(),
                                     ionic.Platform.platform()
                                     );
                pushNotifReg(UserData.getNotifData()); // !!! important
            });
            push.on('notification', function(data) {
                function onConfirm(buttonIndex) {
                    if (buttonIndex == '2') {
                        switch(data.additionalData.reason) {
                        case 'eventchanged':
                            $state.go('event', {'eventId': data.additionalData.id});
                            break;
                        case 'eventcanceled':
                            $state.go('events.agenda');
                            break;
                        case 'newevent':
                            $state.go('event', {'eventId': data.additionalData.id});
                            break;
                        case 'joinevent':
                            $state.go('event', {'eventId': data.additionalData.id});
                            break;
                        case 'leftevent':
                            $state.go('event', {'eventId': data.additionalData.id});
                            break;
                        case 'friendrequest':
                            $state.go('friends.pending');
                            break;
                        case 'friendaccept':
                            $state.go('friends.my');
                            break;
                        default:
                            $state.go('checkauth');
                        }
                    }
                }

                navigator.notification.confirm(
                    data.message,            // message
                    onConfirm,               // callback to invoke with index of button pressed
                    data.additionalData.ttl, // title
                    ['Fermer','Voir']        // buttonLabels (1, 2)
                );
            });
            push.on('error', function(e) {
                console.error(e.message);
            });
            var alertDismissed = function () {},
                onOffline = function () {
                    navigator.notification.alert(
                        'La connection à Internet a été perdu', //message
                        alertDismissed,         // callback
                        'Perte de connection',  // title
                        'OK'                    // buttonName
                    )
                    $state.go('checkauth');
                };
            document.addEventListener("offline", onOffline, false);
        });
    })

    .config(function ($ionicConfigProvider) {
        "use strict";
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.tabs.position('top');
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.navBar.positionPrimaryButtons('left');
        $ionicConfigProvider.navBar.positionSecondaryButtons('right');
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        "use strict";
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('logout', {
                cache: false,
                url: '/logout',
                templateUrl: 'templates/checkauth.html',
                controller: 'LogoutCtrl'
            })
            .state('checkauth', {
                cache: false,
                url: '/checkauth',
                templateUrl: 'templates/checkauth.html',
                controller: 'CheckauthCtrl'
            })
            .state('connect', {
                cache: false,
                url: '/connect',
                templateUrl: 'templates/connect.html',
                controller: 'ConnectCtrl'
            })
            .state('login', {
                cache: false,
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('register', {
                cache: false,
                url: '/register',
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            })
            .state('picture', {
                cache: false,
                url: '/picture',
                templateUrl: 'templates/picture.html',
                controller: 'PictureCtrl'
            })
            .state('profile', {
                cache: false,
                url: '/profile',
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
            })
            .state('what', {
                cache: false,
                url: "/what",
                templateUrl: "templates/what.html",
                controller: 'WhatCtrl'
            })
            .state('when', {
                cache: false,
                url: '/when',
                templateUrl: 'templates/when.html',
                controller: 'WhenCtrl'
            })
            .state('where', {
                cache: false,
                url: '/where',
                templateUrl: 'templates/where.html',
                controller: 'WhereCtrl'
            })
            .state('done', {
                cache: false,
                url: '/done',
                templateUrl: 'templates/done.html',
                controller: 'DoneCtrl'
            })
            .state('events', {
                cache: false,
                url: '/events',
                abstract: true,
                templateUrl: 'templates/events.html',
                controller: 'EventsCtrl'
            })
            .state('events.friends', {
                cache: false,
                url: '/friends',
                views: {
                    'friendsevents': {
                        templateUrl: 'templates/eventlist.html',
                        controller: 'FriendsEventsCtrl'
                    }
                }
            })
            .state('events.agenda', {
                cache: false,
                url: '/agenda',
                views: {
                    'agendaevents': {
                        templateUrl: 'templates/eventlist.html',
                        controller: 'AgendaEventsCtrl'
                    }
                }
            })
            .state('event', {
                cache: false,
                url: '/event/:eventId',
                templateUrl: 'templates/event.html',
                controller: 'EventCtrl'
            })
            .state('friends', {
                cache: false,
                url: '/friends',
                abstract: true,
                templateUrl: 'templates/friends.html',
                controller: 'FriendsCtrl'
            })
            .state('friends.new', {
                cache: false,
                url: '/new',
                views: {
                    'newfriends': {
                        templateUrl: 'templates/people.html',
                        controller: 'NewFriendsCtrl'
                    }
                }
            })
            .state('friends.my', {
                cache: false,
                url: '/my',
                views: {
                    'myfriends': {
                        templateUrl: 'templates/people.html',
                        controller: 'MyFriendsCtrl'
                    }
                }
            })
            .state('friends.pending', {
                cache: false,
                url: '/pending',
                views: {
                    'pendingfriends': {
                        templateUrl: 'templates/people.html',
                        controller: 'PendingFriendsCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/checkauth');
    });

/* DEBUG STUFF : */
function fb_init() {
    'use strict';
    if (window.cordova === undefined) {
        /* browser stuff: we must wait that FB is properly set before trying using Facebook API */
        setTimeout(fb_init, 500);
        return;
    }
    if (window.cordova.platformId === "browser") {
        if (typeof (FB) !== "undefined") {
            console.log("FB init");
            window.facebookConnectPlugin.browserInit("948253448566545");
        } else {
            setTimeout(fb_init, 500);
            return;
        }
    }
    facebookConnectPlugin.getLoginStatus(
        function (obj) {
            console.log('Connected');
        },
        function (obj) {
        }
    );
}

(function () {
    'use strict';
    setTimeout(fb_init, 1000);
})();
