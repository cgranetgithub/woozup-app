/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('UserCtrl', ['$tastypieResource', '$ionicHistory', '$ionicLoading', '$scope', '$stateParams', 'AuthService', '$state', 'UserData', function ($tastypieResource, $ionicHistory, $ionicLoading, $scope, $stateParams, AuthService, $state, UserData) {
    "use strict";
    var myId = UserData.getUserId();
    $scope.userId = parseInt($stateParams.userId, 10);
    $scope.goBackAction = function() {
        if ($ionicHistory.viewHistory().backView) {
            $ionicHistory.goBack();
        } else {
            $state.go('tab.home');
        }
    };
    if (!$scope.userId) {
        return;
    };
    if ($scope.userId == myId) {
        $state.go('tab.account');
    };
    $ionicLoading.show({template: "Chargement"});
    var userresource = new $tastypieResource('user', {});
    userresource.objects.$get({id: $scope.userId}).then(
        function (result) {
            $scope.user = result;
            $ionicLoading.hide();
        },
        function (error) {
            console.log(error);
            $ionicLoading.hide();
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
        }
    );
    $scope.events = [];
    var eventsResource = new $tastypieResource('events/mine');
    eventsResource.objects.$find().then(
        function (result) {
            $scope.events = result.objects;
        }
    );
    $scope.friends = [];
    var friendsResource = new $tastypieResource('friends/mine');
    friendsResource.objects.$find().then(
        function (result) {
            $scope.friends = result.objects;
        }
    );
}]);
