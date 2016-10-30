/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('FindMoreFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$q', '$scope', '$state', 'sendInvite', 'ignoreInvite', 'inviteFriend', 'ignoreFriend', 'AuthService', '$ionicHistory', function ($tastypieResource, $ionicLoading, $q, $scope, $state, sendInvite, ignoreInvite, inviteFriend, ignoreFriend, AuthService, $ionicHistory) {
    "use strict";
    // verify authentication
    AuthService.checkUserAuth().success()
        .error(function () {$state.go('network');});
    $ionicLoading.show({template: "Chargement"});
    $scope.title = "Retrouver plus d'amis";
    $scope.goBackAction = function() {
        if ($ionicHistory.viewHistory().backView) {
            $ionicHistory.goBack();
        } else {
            $state.go('tab.home');
        }
    };
    $scope.displayButton = true;
    $scope.invites = [];
    $scope.friends = [];
    $scope.search = '';
    var invitesResource, friendsResource,
        nextPages = function (invitePage, friendsPage) {
            $q.all([invitePage, friendsPage]).then(
                function (arrayOfResults) {
                    var i;
                    if (arrayOfResults[0]) {
                        for (i = 0; i < arrayOfResults[0].objects.length; i += 1) {
                            $scope.invites.push(arrayOfResults[0].objects[i]);
                        }
                    }
                    if (arrayOfResults[1]) {
                        for (i = 0; i < arrayOfResults[1].objects.length; i += 1) {
                            $scope.friends.push(arrayOfResults[1].objects[i]);
                        }
                    }
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (arrayOfErrors) {
                    console.log(arrayOfErrors);
                    $ionicLoading.hide();
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('network');});
                }
            );
        };
    $scope.onSearchChange = function (word) {
        invitesResource = new $tastypieResource('invite', {
                            status__exact: 'NEW', order_by: 'name',
                            name__icontains: word
        });
        friendsResource = new $tastypieResource('friends/new', {
                            order_by: 'first_name',
                            first_name__icontains: word
        });
        $scope.invites = [];
        $scope.friends = [];
        nextPages(invitesResource.objects.$find(), friendsResource.objects.$find());
    };
    $scope.onSearchChange('');
    $scope.loadMore = function () {
        var nextInvitePage = null,
            nextFriendPage = null;
        if (invitesResource.page.meta && invitesResource.page.meta.next) {
            nextInvitePage = invitesResource.page.next();
        }
        if (friendsResource.page.meta && friendsResource.page.meta.next) {
            nextFriendPage = friendsResource.page.next();
        }
        nextPages(nextInvitePage, nextFriendPage);
    };
    $scope.inviteFriendButton = function (friend) {
        $scope.friends.splice($scope.friends.indexOf(friend), 1);
        inviteFriend(friend.id);
    };
    $scope.ignoreFriendButton = function (friend) {
        $scope.friends.splice($scope.friends.indexOf(friend), 1);
        ignoreFriend(friend.id);
    };
    $scope.sendInviteButton = function (invite) {
        $scope.invites.splice($scope.invites.indexOf(invite), 1);
        sendInvite(invite.id);
    };
    $scope.ignoreInviteButton = function (invite) {
        $scope.invites.splice($scope.invites.indexOf(invite), 1);
        ignoreInvite(invite.id);
    };
}]);
