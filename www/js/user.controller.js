/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('UserCtrl', ['$tastypieResource', '$ionicHistory', '$ionicLoading', '$scope', '$stateParams', 'AuthService', '$state', function ($tastypieResource, $ionicHistory, $ionicLoading, $scope, $stateParams, AuthService, $state) {
    "use strict";
    $ionicLoading.show({template: "Chargement"});
    $scope.goBackAction = function() {
        if ($ionicHistory.viewHistory().backView) {
            $ionicHistory.goBack();
        } else {
            $state.go('tab.home');
        }
    };
    var userresource = new $tastypieResource('user', {});
    userresource.objects.$get({id: parseInt($stateParams.userId, 10)}).then(
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
