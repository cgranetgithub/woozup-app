// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('new', {
        url: "/new",
        abstract: true,
        templateUrl: "templates/home.html",
        controller: 'HomeCtrl'
    })
    .state('new.what', {
        url: "/what",
        views: {
            'new': {
                templateUrl: "templates/what.html",
                controller: 'WhatCtrl'
    }}})
    .state('new.when', {
        url: '/when',
        views: {
            'new': {
                templateUrl: 'templates/when.html',
                controller: 'WhenCtrl'
    }}})
    .state('new.where', {
        url: '/where',
        views: {
            'new': {
                templateUrl: 'templates/where.html',
                controller: 'WhereCtrl'
    }}})
    .state('new.done', {
        url: '/done',
        views: {
            'new': {
                templateUrl: 'templates/done.html',
                controller: 'DoneCtrl'
    }}})
    .state('events', {
        url: '/events',
        templateUrl: 'templates/events.html',
        controller: 'EventsCtrl'
    })
    .state('event', {
        url: '/event/:eventId',
        templateUrl: 'templates/event.html',
        controller: 'EventCtrl'
    })
    .state('friends', {
        url: '/friends',
        abstract: true,
        templateUrl: 'templates/friends.html',
        controller: 'FriendsCtrl'
    })
    .state('friends.new', {
        url: '/new',
        views: {
            'friends': {
                templateUrl: 'templates/people.html',
                controller: 'NewFriendsCtrl'
    }}})
    .state('friends.my', {
        url: '/my',
        views: {
            'friends': {
                templateUrl: 'templates/people.html',
                controller: 'MyFriendsCtrl'
    }}})
    .state('friends.pending', {
        url: '/pending',
        views: {
            'friends': {
                templateUrl: 'templates/people.html',
                controller: 'PendingFriendsCtrl'
    }}});

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/new/what');

});
