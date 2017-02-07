/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')
.controller('HomeCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', 'UserData', 'GenericResourceList', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService, UserData, GenericResourceList) {
    "use strict";
    var today = new Date();
    today.setHours(today.getUTCHours()-2);
    today.setMinutes(0);
    $scope.eventsResource = new $tastypieResource('event', {order_by: 'start', start__gte: today, 'canceled': false});
//     $scope.findMoreFriends = function() {
//         $state.go('tab.people');
//     };
    $scope.createEvent = function() {
        $state.go('tab.new');
    };
    $scope.userid = UserData.getUserId();
}]);
