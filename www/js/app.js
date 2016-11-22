/*jslint browser: true, white: true*/
/*global angular, cordova, StatusBar, ionic, PushNotification*/

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'woozup' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'woozup.services' is found in services.js
// 'woozup.controllers' is found in controllers.js

angular.module('woozup', ['ionic', 'intlpnIonic', 'ngCordova', 'ui.bootstrap', 'woozup.controllers', 'woozup.services'])

.run(function ($ionicPlatform, $cordovaDevice, UserData, pushNotifReg, $cordovaDialogs, $state) {
    "use strict";
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the
        // accessory bar above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        if (!ionic.Platform.is('linux') && !ionic.Platform.is('macintel')) {
            var push = PushNotification.init({
                "android": {"senderID": "496829276290", "forceShow":true, "sound":true, "vibrate":true, "icon": "ic_stat_android_hand_white"},
                "ios": {"alert": "true", "badge": "true", "sound": "true"},
                "windows": {}
            } ),
                alertDismissed = function () {},
                onOffline = function () {
                    $state.go('connect');
//                         navigator.notification.alert(
//                             'La connexion à Internet a été perdue', //message
//                             alertDismissed,         // callback
//                             'Problème de connexion',  // title
//                             'OK'                    // buttonName
//                         );
                };
            document.addEventListener("offline", onOffline, false);
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
                    if (buttonIndex === '2') {
                        switch(data.additionalData.reason) {
                        case 'eventchanged':
                            $state.go('event', {'eventId': data.additionalData.id});
                            break;
                        case 'eventcanceled':
                            $state.go('event', {'eventId': data.additionalData.id});
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
                            $state.go('user', {'userId': data.additionalData.id});
                            break;
                        case 'friendaccept':
                            $state.go('user', {'userId': data.additionalData.id});
                            break;
                        default:
                            $state.go('checkauth');
                        }
                    }
                }
//                 navigator.notification.confirm(
//                     data.message,            // message
//                     onConfirm,               // callback to invoke with index of button pressed
//                     data.title, // title
//                     ['Fermer','Voir']        // buttonLabels (1, 2)
//                 );
            });
            push.on('error', function(e) {
                console.error(e.message);
            });
        }
    });
})

.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
    "use strict";
    $ionicConfigProvider.tabs.position('bottom');
//         $ionicConfigProvider.tabs.style('standard');
//         $ionicConfigProvider.views.maxCache(0);
//         $ionicConfigProvider.views.transition('none');
//         $ionicConfigProvider.navBar.alignTitle('center');
//         $ionicConfigProvider.navBar.positionPrimaryButtons('left');
//         $ionicConfigProvider.navBar.positionSecondaryButtons('right');
}])

.config(['$compileProvider', function($compileProvider) {
    "use strict";
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);
}])

.config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
    "use strict";
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        .state('logout', {
            cache: false,
            url: '/logout',
            templateUrl: 'templates/connect/checkauth.html',
            controller: 'LogoutCtrl'
        })
        .state('network', {
            cache: false,
            url: '/network',
            templateUrl: 'templates/connect/network.html',
            controller: 'NetworkCtrl'
        })
        .state('checkauth', {
            cache: false,
            url: '/checkauth',
            templateUrl: 'templates/connect/checkauth.html',
            controller: 'CheckauthCtrl'
        })
        .state('connect', {
            cache: false,
            url: '/connect',
            templateUrl: 'templates/connect/connect.html',
            controller: 'ConnectCtrl'
        })
        .state('picture', {
            cache: false,
            url: '/picture',
            templateUrl: 'templates/user/picture.html',
            controller: 'PictureCtrl'
        })
        .state('tab', {
            cache: false,
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html',
            controller: 'TabCtrl'
        })
        .state('tab.new', {
//                 cache: false,
            url: "/new",
            views: {
                'newevent': {
                    templateUrl: "templates/event/creation.html",
                    controller: 'NewEventCtrl'
                }
            }
        })
        .state('tab.home', {
            cache: false,
            url: '/home',
            views: {
                'home': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('tab.search', {
            cache: false,
            url: '/search',
            views: {
                'search': {
                    templateUrl: 'templates/search.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('tab.journal', {
            cache: false,
            url: '/journal',
            views: {
                'journal': {
                    templateUrl: "templates/journal.html",
//                         controller: 'JournalCtrl'
                }
            }
        })
        .state('tab.account', {
            cache: false,
            url: '/account',
            views: {
                'account': {
                    templateUrl: 'templates/user/profile.html',
                    controller: 'ProfileCtrl'
                }
            }
        })
        .state('findMoreFriends', {
            cache: false,
            url: '/findMoreFriends',
            templateUrl: 'templates/people.html',
            controller: 'FindMoreFriendsCtrl'
        })
//             .state('menu.friends.my', {
//                 cache: false,
//                 url: '/my',
//                 views: {
//                     'myfriends': {
//                         templateUrl: 'templates/people.html',
//                         controller: 'MyFriendsCtrl'
//                     }
//                 }
//             })
//             .state('menu.friends.pending', {
//                 cache: false,
//                 url: '/pending',
//                 views: {
//                     'pendingfriends': {
//                         templateUrl: 'templates/people.html',
//                         controller: 'PendingFriendsCtrl'
//                     }
//                 }
//             })
        .state('user', {
            cache: false,
            url: '/user/:userId',
            templateUrl: 'templates/user/userView.html',
            controller: 'UserCtrl'
        })
        .state('event', {
            cache: false,
            url: '/event/:eventId',
            templateUrl: 'templates/event/event.html',
            controller: 'EventCtrl'
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/checkauth');
}]);
