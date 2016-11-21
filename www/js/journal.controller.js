/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')

.controller('PendingFriendsCtrl', ['$tastypieResource', '$ionicLoading', 'acceptFriend', 'rejectFriend', '$scope', '$state', 'AuthService', function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend, $scope, $state, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
//     $ionicLoading.show({template: "Chargement"});
    $scope.friends = [];
    $scope.search = '';
    var friendsResource,
        nextPages = function (result) {
            var i;
            if (result) {
                for (i = 0; i < result.objects.length; i += 1) {
                    $scope.friends.push(result.objects[i]);
                }
            }
        };
    friendsResource = new $tastypieResource('friends/pending');
    $scope.onSearchChange = function (word) {
        friendsResource.objects.$find().then(
            function (result) {
                $scope.friends = [];
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
    $scope.onSearchChange('');
    $scope.loadMore = function () {
        if (friendsResource.page.meta && friendsResource.page.meta.next) {
            friendsResource.page.next().then(
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
}])


.controller('JournalFriendCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
//     $ionicLoading.show({template: "Chargement"});
//     $scope.title = "Mes sorties";
    $scope.records = null;
    var nextPages = function (result) {
        var i;
        if (result) {
            for (i = 0; i < result.objects.length; i += 1) {
                $scope.records.push(result.objects[i]);
            }
        }
    };
    var diaryResource = new $tastypieResource('record');
    $scope.load = function() {
        $scope.records = null;
        diaryResource.objects.$find().then(
            function (result) {
                $scope.records = [];
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
        if (diaryResource.page.meta && diaryResource.page.meta.next) {
            diaryResource.page.next().then(
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
