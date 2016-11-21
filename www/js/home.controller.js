/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')
.controller('HomeCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', 'UserData', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService, UserData) {
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
    $scope.userid = UserData.getUserId();
    var today = new Date(), eventsResource,
        nextPages = function (result) {
                var i, j, event;
                if (result) {
                    for (i = 0; i < result.objects.length; i += 1) {
                        event = result.objects[i];
                        event.ownership = false;
                        if (event.owner.id == $scope.userid) {
                            event.ownership = true;
                        }
                        j = 0;
                        event.participate = false;
                        while (event.participants[j]) {
                            if (event.participants[j].id == $scope.userid) {
                                event.participate = true;
                                break;
                            }
                            j++;
                        }
                        $scope.events.push(event);
                    }
                }
            };
    today.setHours(0);
    today.setMinutes(0);
    eventsResource = new $tastypieResource('events/all',
                                    {order_by: 'start', start__gte: today});
    $scope.load = function () {
        $scope.events = null;
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
