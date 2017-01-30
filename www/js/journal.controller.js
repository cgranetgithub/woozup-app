/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/
// angular.module('woozup.controllers')
// 
// .controller('JournalCtrl', ['$scope', '$state', '$tastypieResource', '$ionicLoading', 'AuthService', 'GenericResourceList', function ($scope, $state, $tastypieResource, $ionicLoading, AuthService, GenericResourceList) {
//     "use strict";
//     $scope.records = null;
//     var journalResource = new $tastypieResource('record');
//     $scope.load = function () {
//         GenericResourceList.search(journalResource)
//         .then(function(list) {$scope.records=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
//     };
//     $scope.load();
//     $scope.loadMore = function () {
//         GenericResourceList.loadMore(journalResource, $scope.records)
//         .then(function(list) {$scope.records=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
// }]);
