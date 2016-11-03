/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/

angular.module('woozup.controllers')

.controller('SearchCtrl', ['$tastypieResource', '$ionicLoading', '$q', '$scope', '$state', 'AuthService', function ($tastypieResource, $ionicLoading, $q, $scope, $state, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
    $scope.users = [];
    $scope.search = '';
    var usersResource,
        nextPages = function (usersPage) {
            var i;
            if (usersPage) {
                for (i = 0; i < usersPage.objects.length; i += 1) {
                    $scope.users.push(usersPage.objects[i]);
                }
            }
        };
    usersResource = new $tastypieResource('user', {order_by: 'first_name'});
    $scope.onSearchChange = function (word) {
        usersResource = new $tastypieResource('user', {
                            order_by: 'first_name',
                            first_name__icontains: word
        });
        $scope.users = [];
//         nextPages(usersResource.objects.$find());
        usersResource.objects.$find().then(
            function (result) {
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
    };
    $scope.onSearchChange('');
    $scope.loadMore = function () {
        var nextUserPage = null;
        if (usersResource && usersResource.page.meta && usersResource.page.meta.next) {
            usersResource.page.next().then(
                function (result) {
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
}]);