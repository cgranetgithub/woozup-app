/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

var gps_in_progress = false;
var findContacts = null;

angular.module('woozup.controllers', ['ionic', 'intlpnIonic', 'ngCordova', 'ngResourceTastypie', 'ui.bootstrap', 'ngImgCrop', 'ngMap', 'google.places', 'woozup.controllers', 'woozup.services'])

// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//$scope.$on('$ionicView.enter', function (e) {
//});

    .controller('LogoutCtrl', ['$ionicLoading', 'logout', '$state',
        function ($ionicLoading, logout, $state) {
            "use strict";
            $ionicLoading.show({template: "Déconnection"});
            logout();
            $state.go('connect');
            $ionicLoading.hide();
        }])

    .controller('CheckauthCtrl', ['$tastypie', '$ionicLoading', 'AuthService',
                'sortContacts', '$state', 'UserData', 'pushNotifReg',
                '$ionicHistory',
        function ($tastypie, $ionicLoading, AuthService, sortContacts,
                  $state, UserData, pushNotifReg, $ionicHistory) {
            "use strict";
            $ionicLoading.show({template: "Vérification de ton compte"});
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            // verify authentication
            AuthService.checkUserAuth()
                .success(function () {
                    $tastypie.setAuth(UserData.getUsername(),
                                      UserData.getApiKey());
                    pushNotifReg(UserData.getNotifData());
                    findContacts(sortContacts);
                    $state.go('tab.home');
                    $ionicLoading.hide();
                })
                .error(function () {
                    $state.go('connect');
                    $ionicLoading.hide();
                });
        }])

    .controller('NetworkCtrl', ['$ionicLoading', 'AuthService', '$state',
                '$ionicHistory', '$scope', '$window',
        function ($ionicLoading, AuthService, $state, $ionicHistory,
                  $scope, $window) {
            "use strict";
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $scope.retry = function () {
                $ionicLoading.show({template: "Tentative de connexion"});
                AuthService.pingAuth()
                    .success(function () {
                        $state.go('checkauth');
                        $ionicLoading.hide();
                    })
                    .error(function () {
                        $window.location.reload(true);
                        $ionicLoading.hide();
                    });
            };
        }])

//     .controller('DoneCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
//                 '$state', 'EventData', 'AuthService',
//         function ($tastypieResource, $ionicLoading, $scope, $state,
//                   EventData, AuthService) {
//             "use strict";
//             var date = new Date();
//             $scope.backgroundUrl = EventData.getWhat().background;
//             $scope.event = {};
//             $scope.event.type = EventData.getWhat();
//             $scope.event.title = EventData.getWhat().name;
//             $scope.event.where = EventData.getWhere();
//             $scope.event.start = EventData.getWhen();
//             $scope.event.start.setHours(date.getHours() + 1);
//             $scope.event.start.setMinutes(0);
// 
//             var invitees = EventData.getWho(),
//                 displayInvitees = [], apiInvitees = [];
//             for (var i = 0; i < invitees.length; i++) {
//                 displayInvitees.push(invitees[i].name);
//                 if (!invitees.all) {
//                     apiInvitees.push(invitees[i].resource_uri);
//                 }
//             }
//             console.log(displayInvitees, apiInvitees);
//             $scope.event.invitees = EventData.getWho();
//             $scope.next = function () {
//                 $ionicLoading.show({template: "Création du rendez-vous"});
//                 var event = new $tastypieResource('events/mine'),
//                     coords = '{ "type": "Point", "coordinates": ['
//                                  + $scope.event.where.lat + ', '
//                                  + $scope.event.where.lng + '] }';
//                 console.log(apiInvitees);
// 
//                 event.objects.$create({
//                     name: $scope.event.title,
//                     start: $scope.event.start,
//                     event_type: EventData.getWhat().resource_uri,
//                     location_name: $scope.event.where.name,
//                     location_address: $scope.event.where.address,
//                     location_id: $scope.event.where.id,
//                     location_coords: coords,
//                     invitees: apiInvitees
//                 }).$save().then(
//                     function () {
//                         $state.go('menu.events.agenda', {}, { reload: true });
//                         $ionicLoading.hide();
//                     },
//                     function (error) {
//                         console.log(error);
//                         $ionicLoading.hide();
//                         // verify authentication
//                         AuthService.checkUserAuth().success()
//                             .error(function () {$state.go('network');});
//                     }
//                 );
//             };
//             $scope.where = function () {
//                 $state.go('where');
// //                 $state.go('where', {}, { reload: true });
//             };
//         }])

    .controller('EventsCtrl', ['$tastypieResource', '$cordovaGeolocation',
                '$ionicPopup', '$scope', '$state', 'setlast', 'UserData',
                'AuthService',
        function ($tastypieResource, $cordovaGeolocation, $ionicPopup,
                  $scope, $state, setlast, UserData, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $scope.friendsEventTitle = "Ce que mes amis ont prévu";
            $scope.newTitle = "Nouveau rendez-vous";
            $scope.agendaTitle = "Mon agenda";
            if (gps_in_progress) {
                return;
            }
            gps_in_progress = true;
            var posOptions = {timeout: 5000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (loc) {
                    gps_in_progress = false;
                    setlast(loc);
                    UserData.setWhere(loc.coords);
                }, function (err) {
                    gps_in_progress = false;
                    console.log(err);
                    $scope.userposition = new $tastypieResource('userposition', {});
                    $scope.userposition.objects.$get({id: UserData.getUserId()}).then(
                        function (result) {
                            UserData.setWhere(result.last);
                        },
                        function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('network');});
                        }
                    );
                    var alertPopup = $ionicPopup.alert({
                        title: "Problème de géolocalisation",
                        template: "Je n'arrive pas à te localiser. J'ai besoin du GPS et du wifi pour trouver les rendez-vous proches de toi."
                    });
                });
        }])

    .controller('AgendaEventsCtrl', ['$scope', '$state', '$tastypieResource',
                '$ionicLoading', 'AuthService',
        function ($scope, $state, $tastypieResource, $ionicLoading,
                  AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes sorties";
            $scope.events = [];
            var today = new Date(), eventsResource,
                nextPages = function (result) {
                        var i;
                        if (result) {
                            for (i = 0; i < result.objects.length; i += 1) {
                                $scope.events.push(result.objects[i]);
                            }
                        }
                    };
            today.setHours(0);
            today.setMinutes(0);
            eventsResource = new $tastypieResource('events/agenda',
                                        {order_by: 'start', start__gte: today});
            eventsResource.objects.$find().then(
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
                    );
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
        }])
    .controller('EventCtrl', ['$window', '$state', '$scope', '$stateParams',
                '$tastypieResource', 'InviteService', 'UserData', 'AuthService',
                '$ionicHistory', '$ionicLoading',
        function ($window, $state, $scope, $stateParams, $tastypieResource,
                  InviteService, UserData, AuthService, $ionicHistory,
                  $ionicLoading) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $scope.buttonTitle = "Chargement";
            $scope.goBackAction = function() {
                if ($ionicHistory.viewHistory().backView) {
                    $ionicHistory.goBack();
                } else {
                    $state.go('menu.events.agenda');
                }
            };
            var event = new $tastypieResource('events/all'),
                loadEvent, leaveAndReload, joinAndReload;

                loadEvent = function () {
                    event.objects.$get({id: parseInt($stateParams.eventId, 10)}).then(
                        function (result) {
                            $scope.event = result;
                            var my_id = UserData.getUserId(),
                                index,
                                participants = result.participants,
                                found = false;
                            if (!result.canceled) {
                                if (my_id === result.owner.user.id) {
                                    $scope.buttonTitle = "J'annule";
                                    $scope.buttonAction = function (eventId) {
                                        var myevent = new $tastypieResource('events/mine');
                                        myevent.objects.$delete({id: eventId});
                                        $state.go('menu.events.agenda', {}, { reload: true });
                                    };
                                } else {
                                    for (index = 0; index < participants.length; index += 1) {
                                        if (my_id === participants[index].user.id) {
                                            found = true;
                                        }
                                    }
                                    if (found) {
                                        $scope.buttonTitle = "J'annule";
                                        $scope.buttonAction = function (eventId) {
                                            leaveAndReload(eventId);
            //                                 $window.location.reload(true);
                                        };
                                    } else {
                                        $scope.buttonTitle = "Je participe";
                                        $scope.buttonAction = function (eventId) {
                                            joinAndReload(eventId);
            //                                 $window.location.reload(true);
                                        };
                                    }
                                }
                            }
                        }, function (error) {
                            console.log(error);
                            // verify authentication
                            AuthService.checkUserAuth().success()
                                .error(function () {$state.go('network');});
                            $scope.buttonTitle = "Erreur de chargement";
                        });
                };
               leaveAndReload = function (eventId) {
                    $ionicLoading.show({template: "Chargement"});
                    InviteService.leave(eventId).then(
                        function () {
                            $ionicLoading.hide();
                            loadEvent();
                        },
                        function (error) {
                            $ionicLoading.hide();
                            loadEvent();
                        }
                    );
                };
               joinAndReload = function (eventId) {
                    $ionicLoading.show({template: "Chargement"});
                    InviteService.join(eventId).then(
                        function () {
                            $ionicLoading.hide();
                            loadEvent();
                        },
                        function (error) {
                            $ionicLoading.hide();
                            loadEvent();
                        }
                    );
                };
            loadEvent();
        }])
    .controller('FriendsCtrl', ['$scope', '$state', '$tastypieResource',
                'UserData',
        function ($scope, $state, $tastypieResource, UserData) {
            "use strict";
            var newFriends = new $tastypieResource('friends/new'),
                pendingFriends = new $tastypieResource('friends/pending'),
                invites = new $tastypieResource('invite',
                                                {status__exact: 'NEW'}),
                profile = new $tastypieResource('user', {});
            profile.objects.$get({id: UserData.getUserId()}).then(
                function (result) {
                    $scope.userprofile = result;
                }
            );
            newFriends.objects.$find().then(
                function (result) {
                    $scope.new.badge += result.meta.total_count;
                }
            );
            invites.objects.$find().then(
                function (result) {
                    $scope.new.badge += result.meta.total_count;
                }
            );
            pendingFriends.objects.$find().then(
                function (result) {
                    $scope.pending.badge = result.meta.total_count;
                }
            );
            $scope.friendsEventTitle = "Ce que mes amis ont prévu";
            $scope.friendsTitle = "Mes amis";
            $scope.agendaTitle = "Mon agenda";
            $scope.my = {title: "Mes amis"};
            $scope.new = {title: "Ajouter des amis", badge: 0};
            $scope.pending = {title: "Invitations reçues", badge: 0};
        }])
    .controller('NewFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$q',
                '$scope', '$state', 'sendInvite', 'ignoreInvite', 'inviteFriend',
                'ignoreFriend', 'AuthService',
        function ($tastypieResource, $ionicLoading, $q, $scope, $state, sendInvite,
                  ignoreInvite, inviteFriend, ignoreFriend, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
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
                inviteFriend(friend.user.id);
            };
            $scope.ignoreFriendButton = function (friend) {
                $scope.friends.splice($scope.friends.indexOf(friend), 1);
                ignoreFriend(friend.user.id);
            };
            $scope.sendInviteButton = function (invite) {
                $scope.invites.splice($scope.invites.indexOf(invite), 1);
                sendInvite(invite.id);
            };
            $scope.ignoreInviteButton = function (invite) {
                $scope.invites.splice($scope.invites.indexOf(invite), 1);
                ignoreInvite(invite.id);
            };
        }])
    .controller('MyFriendsCtrl', ['$tastypieResource', '$ionicLoading', '$scope',
                '$state', 'AuthService',
        function ($tastypieResource, $ionicLoading, $scope, $state, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
            $scope.displayButton = false;
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
                friendsResource = new $tastypieResource('friends/mine', {
                                        order_by: 'first_name',
                                        first_name__icontains: word
                });
                $scope.friends = [];
                friendsResource.objects.$find().then(
                    function (result) {
                        nextPages(result);
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function (error) {
                        console.log(error);
                        // verify authentication
                        $ionicLoading.hide();
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
        }])
    .controller('PendingFriendsCtrl', ['$tastypieResource', '$ionicLoading',
                'acceptFriend', 'rejectFriend', '$scope', '$state', 'AuthService',
        function ($tastypieResource, $ionicLoading, acceptFriend, rejectFriend,
                  $scope, $state, AuthService) {
            "use strict";
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
            $ionicLoading.show({template: "Chargement"});
            $scope.title = "Mes amis";
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
                friendsResource = new $tastypieResource('friends/pending', {
                                        order_by: 'first_name',
                                        first_name__icontains: word
                });
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
                acceptFriend(friend.user.id);
            };
            $scope.ignoreFriendButton = function (friend) {
                $scope.friends.splice(friend.$index, 1);
                rejectFriend(friend.user.id);
            };
        }]);


findContacts = function(sortContacts) {
    "use strict";
    var options,
        filter = ["displayName", "name"],
        lastCheck, //window.localStorage.contact_sync,
        curDate = new Date();
    if (!navigator.contacts) { return; }
//                     if (lastCheck && (curDate.getTime() / 1000) - lastCheck < 7 * 3600 * 24) {
//                         return;
//                     }
    options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    navigator.contacts.find(filter, function (contacts) {
        if (contacts === null) {
            console.log("No contact retrieved");
            return;
        }
        var stuff = [],
            helper = function (tab, k) {
                var t = [], i;
                k = k || "value";
                if (!tab) { return t; }
                for (i = 0; i < tab.length; i += 1) {
                    t.push(tab[i][k]);
                }
                return t;
            };
        contacts.forEach(function (entry) {
            if (!entry.phoneNumbers || !entry.phoneNumbers.length) {
//                || !entry.emails || !entry.emails.length) {
//                 console.log("skipping " + entry.name.formatted);
                return;
            }

            stuff.push({
                'name': entry.name.formatted,
//                 'emails': helper(entry.emails).join(', '),
                'numbers': helper(entry.phoneNumbers).join(', '),
                'photo': helper(entry.photos).join(', '),
            });
        });
        // send to server by chunk
        var i, j, temparray, chunk = 30;
        for (i=0, j=stuff.length; i<j; i+=chunk) {
            temparray = stuff.slice(i,i+chunk);
            sortContacts(temparray);
        }
    }, function () {
        // an error has occured, try to resync next day
        window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
        console.log("Error");
    }, options);
};
