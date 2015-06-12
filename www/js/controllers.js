angular.module('starter.controllers', ['ionic', 'ngCordova', 'ngResourceTastypie'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function(e) {
//});

//Access $tastypieProvider in the controller
//Login sample:
// .controller('LoginCtrl', ['$scope', '$tastypie', '$http', function($scope, $tastypie, $http){
//     $scope.login = function(){
//         var data = {
//             userName: $scope.userName,
//             password: $scope.password
//         };
//         $http.post('/loginUrl', data).success(response){
//             $tastypie.setAuth(response.username, response.api_key);
//         }
//     }
// }])

.controller('HomeCtrl', function($scope, $state, $http) {
    $scope.goToFriends = function() {
        $state.go('friends');
    };
    $scope.goToAgenda = function() {
        $state.go('events');
    };
    $scope.goToAccount = function() {
        $state.go('new.where');
    };
})

.controller('WhatCtrl', ['$scope', '$state', '$tastypieResource', function($scope, $state, $tastypieResource) {
    $scope.types = new $tastypieResource('event_type');
    $scope.types.objects.$find();
    $scope.next = function() {
        $state.go('new.when');
    };
}])

.controller('WhenCtrl', ['$scope', '$state', '$tastypieResource', '$cordovaDatePicker', function($scope, $state, $tastypieResource, $cordovaDatePicker) {
    $scope.date = new Date();
    $scope.showDatePicker = function() {
        var options = {mode: 'date', date: $scope.date, minDate: $scope.date}
        $cordovaDatePicker.show(options).then(function(date){
            alert(date);
        });
    };
    $scope.showTimePicker = function() {
        var options = {mode: 'time', date: $scope.date, minuteInterval: 15}
        $cordovaDatePicker.show(options).then(function(time){
            alert(time);
        });
    };
    $scope.next = function() {
        $state.go('new.where');
    };
    $scope.events = new $tastypieResource('event');
    $scope.events.objects.$find();
}])

.controller('WhereCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.next = function() {
        $state.go('new.done');
    };
}])

.controller('DoneCtrl', ['$scope', '$state', function($scope, $state) {
}])

.controller('EventsCtrl', ['$scope', '$state', '$tastypieResource', function($scope, $state, $tastypieResource) {
    $scope.events = new $tastypieResource('event');
    $scope.events.objects.$find();
}])

.controller('EventCtrl', ['$scope', '$state', '$tastypieResource', function($scope, $stateParams, $tastypieResource) {
    event = new $tastypieResource('event');
    event.objects.$get({id:parseInt($stateParams['params']['eventId'])}).then(
        function(result){
            console.log(result);
            $scope.event = result;
        },
        function(error){
            console.log(error);
        }
    );
}])
.controller('FriendsCtrl', ['$scope', '$state', '$tastypieResource', function($scope, $state, $tastypieResource) {
    $scope.friends = new $tastypieResource('friend');
    $scope.friends.objects.$find();
}])
.controller('PendingCtrl', ['$scope', '$state', '$tastypieResource', function($scope, $state, $tastypieResource) {
    $scope.friends = new $tastypieResource('pending');
    $scope.friends.objects.$find();
}]);
