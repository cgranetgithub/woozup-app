angular.module('starter.controllers', [])

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

.controller('HomeCtrl', function($scope, $state) {
//   $state.go('app.categories');
})

.controller('WhatCtrl', function($scope, Categories, Events) {
  $scope.categories = Categories.all();
//   $scope.events = Events.friends();
})

.controller('WhenCtrl', function($scope, $stateParams, Events) {
  console.log($stateParams);
//   $scope.events = Events.friends($stateParams.datetime);
})

.controller('WhereCtrl', function($scope) {
})

.controller('EventsCtrl', function($scope, Events) {
  $scope.events = Events.all();
})

.controller('EventCtrl', function($scope, $stateParams, Events) {
  $scope.event = Events.get($stateParams.eventId);
});
