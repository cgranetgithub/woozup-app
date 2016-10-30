/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
angular.module('woozup.controllers')

.controller('PendingFriendsCtrl', ['$tastypieResource', '$ionicLoading', 'acceptFriend', 'rejectFriend', '$scope', '$state', 'AuthService', function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend, $scope, $state, AuthService) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
    $ionicLoading.show({template: "Chargement"});
//     $scope.title = "Mes amis";
    $scope.displayButton = true;
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
    $scope.onSearchChange = function (word) {
        friendsResource = new $tastypieResource('friends/pending');
        $scope.friends = [];
        friendsResource.objects.$find().then(
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
        if (friendsResource.page.meta && friendsResource.page.meta.next) {
            friendsResource.page.next().then(function (result) {
                nextPages(result);
            });
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.inviteFriendButton = function (friend) {
        $scope.friends.splice(friend.$index, 1);
        acceptFriend(friend.id);
    };
    $scope.ignoreFriendButton = function (friend) {
        $scope.friends.splice(friend.$index, 1);
        rejectFriend(friend.id);
    };
}])

.controller('JournalFriendCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService) {
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
