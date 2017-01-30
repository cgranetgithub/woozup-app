/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

var gps_in_progress = false;
// var findContacts = null;

angular.module('woozup.controllers', ['ionic', 'intlpnIonic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap', 'ngMap', 'woozup.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function (e) {
//});

.controller('TabCtrl', ['AuthService', '$scope', '$tastypieResource', function (AuthService, $scope, $tastypieResource) {
    "use strict";
//     var newFriends, pendingFriends;
//     newFriends = new $tastypieResource('friends/new');
//     pendingFriends = new $tastypieResource('friends/pending');
//     $scope.notif = 0;
//     newFriends.objects.$find().then(
//         function (result) {
//             $scope.notif = result.meta.total_count;
//         });
//     pendingFriends.objects.$find().then(
//         function (result) {
//             $scope.notif = result.meta.total_count;
//         });
}]);

//     .controller('EventsCtrl', ['$tastypieResource', '$cordovaGeolocation',
//                 '$ionicPopup', '$scope', '$state', 'setlast', 'UserData',
//                 'AuthService',
//         function ($tastypieResource, $cordovaGeolocation, $ionicPopup,
//                   $scope, $state, setlast, UserData, AuthService) {
//             "use strict";
//             // verify authentication
//             AuthService.checkUserAuth().success()
//                 .error(function () {$state.go('network');});
//             $scope.friendsEventTitle = "Ce que mes amis ont prévu";
//             $scope.newTitle = "Nouveau rendez-vous";
//             $scope.agendaTitle = "Mon agenda";
//             if (gps_in_progress) {
//                 return;
//             }
//             gps_in_progress = true;
//             var posOptions = {timeout: 5000, enableHighAccuracy: false};
//             $cordovaGeolocation
//                 .getCurrentPosition(posOptions)
//                 .then(function (loc) {
//                     gps_in_progress = false;
//                     setlast(loc);
//                     UserData.setWhere(loc.coords);
//                 }, function (err) {
//                     gps_in_progress = false;
//                     console.log(err);
//                     $scope.userposition = new $tastypieResource('userposition', {});
//                     $scope.userposition.objects.$get({id: UserData.getUserId()}).then(
//                         function (result) {
//                             UserData.setWhere(result.last);
//                         },
//                         function (error) {
//                             console.log(error);
//                             // verify authentication
//                             AuthService.checkUserAuth().success()
//                                 .error(function () {$state.go('network');});
//                         }
//                     );
//                     var alertPopup = $ionicPopup.alert({
//                         title: "Problème de géolocalisation",
//                         template: "Je n'arrive pas à te localiser. J'ai besoin du GPS et du wifi pour trouver les rendez-vous proches de toi."
//                     });
//                 });
//         }])
// 
//     .controller('AgendaEventsCtrl', ['$scope', '$state', '$tastypieResource',
//                 '$ionicLoading', 'AuthService',
//         function ($scope, $state, $tastypieResource, $ionicLoading,
//                   AuthService) {
//             "use strict";
//             // verify authentication
//             AuthService.checkUserAuth().success()
//                 .error(function () {$state.go('network');});
//             $ionicLoading.show({template: "Chargement"});
//             $scope.title = "Mes sorties";
//             $scope.events = [];
//             var today = new Date(), eventsResource,
//                 nextPages = function (result) {
//                         var i;
//                         if (result) {
//                             for (i = 0; i < result.objects.length; i += 1) {
//                                 $scope.events.push(result.objects[i]);
//                             }
//                         }
//                     };
//             today.setHours(0);
//             today.setMinutes(0);
//             eventsResource = new $tastypieResource('events/agenda',
//                                         {order_by: 'start', start__gte: today});
//             eventsResource.objects.$find().then(
//                 function (result) {
//                     nextPages(result);
//                     $ionicLoading.hide();
//                     $scope.$broadcast('scroll.infiniteScrollComplete');
//                 }, function (error) {
//                     console.log(error);
//                     $ionicLoading.hide();
//                     // verify authentication
//                     AuthService.checkUserAuth().success()
//                         .error(function () {$state.go('network');});
//                 }
//             );
//             $scope.loadMore = function () {
//                 if (eventsResource.page.meta && eventsResource.page.meta.next) {
//                     eventsResource.page.next().then(
//                         function (result) {
//                             nextPages(result);
//                         }, function (error) {
//                             console.log(error);
//                             // verify authentication
//                             AuthService.checkUserAuth().success()
//                                 .error(function () {$state.go('network');});
//                         }
//                     );
//                 }
//                 $scope.$broadcast('scroll.infiniteScrollComplete');
//             };
//         }])
//     .controller('FriendsCtrl', ['$scope', '$state', '$tastypieResource',
//                 'UserData',
//         function ($scope, $state, $tastypieResource, UserData) {
//             "use strict";
//             var newFriends = new $tastypieResource('friends/new'),
//                 pendingFriends = new $tastypieResource('friends/pending'),
//                 invites = new $tastypieResource('invite',
//                                                 {status__exact: 'NEW'}),
//                 profile = new $tastypieResource('user', {});
//             profile.objects.$get({id: UserData.getUserId()}).then(
//                 function (result) {
//                     $scope.userprofile = result;
//                 }
//             );
//             newFriends.objects.$find().then(
//                 function (result) {
//                     $scope.new.badge += result.meta.total_count;
//                 }
//             );
//             invites.objects.$find().then(
//                 function (result) {
//                     $scope.new.badge += result.meta.total_count;
//                 }
//             );
//             pendingFriends.objects.$find().then(
//                 function (result) {
//                     $scope.pending.badge = result.meta.total_count;
//                 }
//             );
//             $scope.friendsEventTitle = "Ce que mes amis ont prévu";
//             $scope.friendsTitle = "Mes amis";
//             $scope.agendaTitle = "Mon agenda";
//             $scope.my = {title: "Mes amis"};
//             $scope.new = {title: "Ajouter des amis", badge: 0};
//             $scope.pending = {title: "Invitations reçues", badge: 0};
//         }])

//     .controller('MyFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
//                 '$state', 'AuthService',
//         function ($tastypieResource, $ionicLoading, $scope, $state, AuthService) {
//             "use strict";
//             // verify authentication
//             AuthService.checkUserAuth().success()
//                 .error(function () {$state.go('network');});
//             $ionicLoading.show({template: "Chargement"});
//             $scope.title = "Mes amis";
//             $scope.displayButton = false;
//             $scope.friends = [];
//             $scope.search = '';
//             var friendsResource,
//                 nextPages = function (result) {
//                     var i;
//                     if (result) {
//                         for (i = 0; i < result.objects.length; i += 1) {
//                             $scope.friends.push(result.objects[i]);
//                         }
//                     }
//                 };
//             $scope.onSearchChange = function (word) {
//                 friendsResource = new $tastypieResource('friends/mine', {
//                                         order_by: 'first_name',
//                                         first_name__icontains: word
//                 });
//                 $scope.friends = [];
//                 friendsResource.objects.$find().then(
//                     function (result) {
//                         nextPages(result);
//                         $ionicLoading.hide();
//                         $scope.$broadcast('scroll.infiniteScrollComplete');
//                     }, function (error) {
//                         console.log(error);
//                         // verify authentication
//                         $ionicLoading.hide();
//                         AuthService.checkUserAuth().success()
//                             .error(function () {$state.go('network');});
//                     }
//                 );
//             };
//             $scope.onSearchChange('');
//             $scope.loadMore = function () {
//                 if (friendsResource.page.meta && friendsResource.page.meta.next) {
//                     friendsResource.page.next().then(function (result) {
//                         nextPages(result);
//                     });
//                 }
//                 $scope.$broadcast('scroll.infiniteScrollComplete');
//             };
//         }])
//     .controller('PendingFriendsCtrl', ['$tastypieResource', '$ionicLoading',
//                 'acceptFriend', 'rejectFriend', '$scope', '$state', 'AuthService',
//         function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend,
//                   $scope, $state, AuthService) {
//             "use strict";
//             // verify authentication
//             AuthService.checkUserAuth().success()
//                 .error(function () {$state.go('network');});
//             $ionicLoading.show({template: "Chargement"});
//             $scope.title = "Mes amis";
//             $scope.displayButton = true;
//             $scope.friends = [];
//             $scope.search = '';
//             var friendsResource,
//                 nextPages = function (result) {
//                     var i;
//                     if (result) {
//                         for (i = 0; i < result.objects.length; i += 1) {
//                             $scope.friends.push(result.objects[i]);
//                         }
//                     }
//                 };
//             $scope.onSearchChange = function (word) {
//                 friendsResource = new $tastypieResource('friends/pending', {
//                                         order_by: 'first_name',
//                                         first_name__icontains: word
//                 });
//                 $scope.friends = [];
//                 friendsResource.objects.$find().then(
//                     function (result) {
//                         nextPages(result);
//                         $ionicLoading.hide();
//                         $scope.$broadcast('scroll.infiniteScrollComplete');
//                     }, function (error) {
//                         console.log(error);
//                         $ionicLoading.hide();
//                         // verify authentication
//                         AuthService.checkUserAuth().success()
//                             .error(function () {$state.go('network');});
//                     }
//                 );
//             };
//             $scope.onSearchChange('');
//             $scope.loadMore = function () {
//                 if (friendsResource.page.meta && friendsResource.page.meta.next) {
//                     friendsResource.page.next().then(function (result) {
//                         nextPages(result);
//                     });
//                 }
//                 $scope.$broadcast('scroll.infiniteScrollComplete');
//             };
//             $scope.inviteFriendButton = function (friend) {
//                 $scope.friends.splice(friend.$index, 1);
//                 acceptFriend(friend.user.id);
//             };
//             $scope.ignoreFriendButton = function (friend) {
//                 $scope.friends.splice(friend.$index, 1);
//                 rejectFriend(friend.user.id);
//             };
//         }]);
