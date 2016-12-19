/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('PendingFriendsCtrl', ['$tastypieResource', 'acceptFriend', 'rejectFriend', '$scope', '$state', 'GenericResourceList', function ($tastypieResource, acceptFriend, rejectFriend, $scope, $state, GenericResourceList) {
    "use strict";
    $scope.friendsResource = new $tastypieResource('friends/pending');
//     $scope.onSearchChange = function () {
//         $scope.resourceList = null;
//         GenericResourceList.search(friendsResource, {})
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
//     };
//     $scope.onSearchChange('');
//     $scope.loadMore = function () {
//         GenericResourceList.loadMore(friendsResource, $scope.resourceList)
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
}])

.controller('SuggestedFriendsCtrl', ['$tastypieResource', 'acceptFriend', 'rejectFriend', '$scope', '$state', 'GenericResourceList', function ($tastypieResource, acceptFriend, rejectFriend, $scope, $state, GenericResourceList) {
    "use strict";
    $scope.friendsResource = new $tastypieResource('friends/new');
//     $scope.onSearchChange = function () {
//         $scope.resourceList = null;
//         GenericResourceList.search(friendsResource, {})
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
//     };
//     $scope.onSearchChange('');
//     $scope.loadMore = function () {
//         GenericResourceList.loadMore(friendsResource, $scope.resourceList)
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
}])

.controller('InvitesCtrl', ['$tastypieResource', 'acceptFriend', 'rejectFriend', '$scope', 'sortContacts', 'GenericResourceList', function ($tastypieResource, acceptFriend, rejectFriend, $scope, sortContacts, GenericResourceList) {
    "use strict";
    sortContacts();
//     $scope.invitesResource = new $tastypieResource('invite', {status__exact: 'NEW', order_by: 'name', name__icontains: word});
//     $scope.search = '';
//     $scope.onSearchChange = function (word) {
//         $scope.resourceList = null;
//         invitesResource = new $tastypieResource('invite', {status__exact: 'NEW', order_by: 'name', name__icontains: word});
//         GenericResourceList.search(invitesResource, {})
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
//     };
//     $scope.onSearchChange('');
//     $scope.loadMore = function () {
//         GenericResourceList.loadMore(invitesResource, $scope.resourceList)
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
}])

.controller('SearchFriendsCtrl', ['$tastypieResource', 'acceptFriend', 'rejectFriend', '$scope', '$state', 'GenericResourceList', function ($tastypieResource, acceptFriend, rejectFriend, $scope, $state, GenericResourceList) {
    "use strict";
    $scope.usersResource = new $tastypieResource('user', {order_by: 'first_name'});
    $scope.search = '';
    $scope.onSearchChange = function (word) {
        $scope.word = word;
        console.log(word);
//         $scope.resourceList = null;
        $scope.usersResource = new $tastypieResource('user', {order_by: 'first_name', first_name__icontains: word});
//         GenericResourceList.search(usersResource, {})
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    $scope.onSearchChange('');
//     $scope.loadMore = function () {
//         GenericResourceList.loadMore(usersResource, $scope.resourceList)
//         .then(function(list) {$scope.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
}]);
