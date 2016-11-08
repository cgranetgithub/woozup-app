/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')
.controller('HomeCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth()
        .success()
        .error(function () {$state.go('network');});
//     $ionicLoading.show({template: "Chargement"});
//     $scope.title = "Mes sorties";
    $scope.findMoreFriends = function() {
        $state.go('findMoreFriends');
    };
    var today = new Date(), eventsResource,
        nextPages = function (result) {
                var i;
                if (result) {
                    for (i = 0; i < result.objects.length; i += 1) {
                        $scope.events.push(result.objects[i]);
                    }
                }
            };
    today.setHours(0);
    today.setMinutes(0);
    eventsResource = new $tastypieResource('events/all',
                                    {order_by: 'start', start__gte: today});
    $scope.load = function () {
        eventsResource.objects.$find().then(
            function (result) {
                $scope.events = [];
                nextPages(result);
            }, function (error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        ).finally(function() {
//             $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.load();
    $scope.loadMore = function () {
        if (eventsResource.page.meta && eventsResource.page.meta.next) {
            eventsResource.page.next().then(
                function (result) {
                    nextPages(result);
                }, function (error) {
                    console.log(error);
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('network');});
                }
            ).finally(function() {
//                 $ionicLoading.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        } else {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    };
}]);
