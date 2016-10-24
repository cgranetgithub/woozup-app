/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')
.controller('JournalCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
//     $ionicLoading.show({template: "Chargement"});
//     $scope.title = "Mes sorties";
    $scope.records = [];
    var nextPages = function (result) {
        var i;
        if (result) {
            for (i = 0; i < result.objects.length; i += 1) {
                $scope.records.push(result.objects[i]);
            }
        }
    };
    console.log('here');
    var diaryResource;
    diaryResource = new $tastypieResource('record');
    diaryResource.objects.$find().then(
        function (result) {
            console.log(result);
            nextPages(result);
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (error) {
            console.log(error);
            $ionicLoading.hide();
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
        }
    );
    $scope.loadMore = function () {
        if (diaryResource.page.meta && diaryResource.page.meta.next) {
            diaryResource.page.next().then(
                function (result) {
                    console.log(result);
                    nextPages(result);
                }, function (error) {
                    console.log(error);
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('network');});
                });
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };
//     $ionicLoading.h  ide();
}]);
