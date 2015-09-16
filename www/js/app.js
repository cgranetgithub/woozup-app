/*jslint browser: true*/
/*global angular, cordova, StatusBar*/

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform) {
        "use strict";
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        "use strict";
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

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
            .state('new', {
                url: "/new",
                abstract: true,
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            })
            .state('new.what', {
                cache: false,
                url: "/what",
                views: {
                    'new': {
                        templateUrl: "templates/what.html",
                        controller: 'WhatCtrl'
                    }
                }
        //         resolve: {
        //             what: function(starter.services) {
        //             return starter.services.getWhat()
        //         }}
            })
            .state('new.when', {
                cache: false,
                url: '/when',
                views: {
                    'new': {
                        templateUrl: 'templates/when.html',
                        controller: 'WhenCtrl'
                    }
                }
        //         resolve: {
        //             when: function(starter.services) {
        //             return starter.services.getWhen()
        //         }}
            })
            .state('new.where', {
                cache: false,
                url: '/where',
                views: {
                    'new': {
                        templateUrl: 'templates/where.html',
                        controller: 'WhereCtrl'
                    }
                }
        //         resolve: {
        //             where: function(starter.services) {
        //             return starter.services.getWhere()
        //         }}
            })
            .state('new.done', {
                cache: false,
                url: '/done',
                views: {
                    'new': {
                        templateUrl: 'templates/done.html',
                        controller: 'DoneCtrl'
                    }
                }
            })
            .state('events', {
                cache: false,
                url: '/events',
                abstract: true,
                templateUrl: 'templates/events.html',
                controller: 'EventsCtrl'
            })
//             .state('events.mine', {
//                 cache: false,
//                 url: '/mine',
//                 views: {
//                     'myevents': {
//                         templateUrl: 'templates/eventlist.html',
//                         controller: 'MyEventsCtrl'
//                     }
//                 }
//             })
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
        if ( typeof(FB) !== "undefined" ) {
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

(function() {
    'use strict';
    setTimeout(fb_init, 1000);
})();
