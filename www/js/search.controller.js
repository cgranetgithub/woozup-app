/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/

angular.module('woozup.controllers')

.controller('SearchCtrl', ['$tastypieResource', '$ionicLoading', '$q', '$scope', '$state', 'AuthService', 'sortContacts', function ($tastypieResource, $ionicLoading, $q, $scope, $state, AuthService, sortContacts) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
    sortContacts();
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
                $scope.users = [];
                nextPages(result);
            }, function (error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        ).finally(function() {
//             $ionicLoading.hide();
//             $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.onSearchChange('');
    $scope.loadMore = function () {
        if (usersResource && usersResource.page.meta && usersResource.page.meta.next) {
            usersResource.page.next().then(
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
