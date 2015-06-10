var domain = "http://geoevent.herokuapp.com/api/v1/"
// var domain = "http://127.0.0.1:8000/api/v1/"

angular.module('starter.controllers', ['ngCordova'])

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

.controller('HomeCtrl', function($scope, $http) {
    $scope.doLogin = function() {
        $http.post(domain+'auth/login/',
                   {'username':'33667045021', 'password':'test'})
        .success(function(data, status, headers, config) {
    console.log(data, status, headers, config)
  })
    };
})

.controller('WhatCtrl', function($scope, Types, Events) {
  $scope.types = Types.query();
})

.controller('WhenCtrl', function($scope, $cordovaDatePicker, $stateParams, Events) {
//   $scope.events = Events.friends($stateParams.datetime);
  $scope.date = new Date();
  $scope.showDatePicker = function() {
    var options = {
      mode: 'date',
      date: $scope.date,
      minDate: $scope.date
    }
    $cordovaDatePicker.show(options).then(function(date){
        alert(date);
    });
  };
  $scope.showTimePicker = function() {
    var options = {
      mode: 'time',
      date: $scope.date,
      minuteInterval: 15
    }
    $cordovaDatePicker.show(options).then(function(time){
        alert(time);
    });
  };
  $scope.events = Events.query();
})

.controller('WhereCtrl', function($scope) {
})

.controller('EventsCtrl', function($scope, Events) {
  $scope.events = Events.all();
})

.controller('EventCtrl', function($scope, $stateParams, Events) {
  $scope.event = Events.get($stateParams.eventId);
});
