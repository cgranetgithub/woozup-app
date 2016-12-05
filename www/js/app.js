/*jslint browser: true, white: true*/
/*global angular, cordova, StatusBar, ionic, PushNotification*/

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'woozup' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'woozup.services' is found in services.js
// 'woozup.controllers' is found in controllers.js

angular.module('woozup', ['ionic', 'intlpnIonic', 'ngCordova', 'ui.bootstrap', 'woozup.controllers', 'woozup.services'])

.run(function ($ionicPlatform, $cordovaDevice, UserData, pushNotifReg, $cordovaDialogs, $state, AuthService, $cordovaPushV5, $rootScope) {
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
        // Push Notifications
        if (!ionic.Platform.is('linux') && !ionic.Platform.is('macintel')) {
            var alertDismissed, onOffline, onOnline, onResume, options;
            options = {
                "android": {"senderID": "496829276290", "forceShow":true, "sound":true, "vibrate":true, "icon": "ic_stat_android_hand_white", "iconColor": "#387ef5"},
                "ios": {"alert": "true", "badge": "true", "sound": "true"},
                "windows": {}
            };
            // initialize
            $cordovaPushV5.initialize(options).then(function() {
                // start listening for new notifications
                $cordovaPushV5.onNotification();
                // start listening for errors
                $cordovaPushV5.onError();
                // register to get registrationId
                $cordovaPushV5.register().then(function(registrationId) {
                    // save `registrationId` somewhere;
                    UserData.setNotifData(registrationId,
                                        $cordovaDevice.getModel(),
                                        $cordovaDevice.getUUID(),
                                        ionic.Platform.platform()
                                        );
                    pushNotifReg(UserData.getNotifData()); // !!! important
                })
            });
            // triggered every time notification received
            $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data){
                AuthService.checkUserAuth()
                .success(function () {
                    var onConfirm;
                    if (['eventchanged', 'newevent', 'joinevent', 'leftevent', 'newcomment'].indexOf(data.additionalData.reason) >= 0) {
                        onConfirm = function(buttonIndex) {
                            if (buttonIndex === 2) {
                                $state.go('event', {'eventId': data.additionalData.id});
                            }
                        }
                    } else if (['friendrequest', 'friendaccept'].indexOf(data.additionalData.reason) >= 0) {
                        onConfirm = function(buttonIndex) {
                            if (buttonIndex === 2) {
                                $state.go('user', {'userId': data.additionalData.id});
                            }
                        }
                    } else {
                        onConfirm = function(buttonIndex) {
                            console.log("unrecognized reason:", data.additionalData.reason, "buttonIndex", buttonIndex);
                        }
                    }
                    if (ionic.Platform.is('android')) {
                        onConfirm(2);
                    } else {
                        navigator.notification.confirm(
                            data.message,
                            onConfirm,
                            data.title,
                            ['Fermer','Voir'] // buttonLabels (1, 2)
                        );
                    }
                }).error(function (error) {
                    console.log(error);
                    $state.go('network');
                });
            });
            $rootScope.$on('$cordovaPushV5:errorOccurred', function(event, error) {
                console.log(error);
            });
            // actions in case of network status change
            onOffline = function () { $state.go('network'); };
            document.addEventListener("offline", onOffline, false);
            onOnline = function () { $state.go('checkauth'); };
            document.addEventListener("online", onOnline, false);
            // onResume = function () {
            //   $state.go('checkauth'); //don't do that because resume is called after requesting permission => you don't want any change in that case
            // };
            // document.addEventListener("resume", onResume, false);
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
