/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/

angular.module('woozup.controllers')

.controller('NewEventCtrl', ['$tastypieResource', '$ionicLoading', '$ionicModal', 'AuthService', '$scope', '$state', 'UserData', 'NgMap', 'GenericResourceList', function ($tastypieResource, $ionicLoading, $ionicModal, AuthService, $scope, $state, UserData, NgMap, GenericResourceList) {
    "use strict";
    // WHEN ------------------------
    $scope.now = new Date();
    $scope.now.setHours($scope.now.getHours() + 1);
    $scope.now.setMinutes(0);
//     $scope.when = date;
    $scope.options = {minDate:$scope.now, showWeeks:false, startingDay:1};
    $scope.setWhen = function (when) {
        $scope.when = when;
        $scope.whenModal.hide();
    };
    // WHAT ------------------------
    $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
    $scope.types.objects.$find().then(
        function () {
//             $scope.what = $scope.types.page.objects[0];
        },
        function (error) {
            console.log(error);
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
        }
    );
    $scope.setWhat = function (type) {
        $scope.what = type;
        $scope.whatModal.hide();
    };
    $scope.titleUpdate = function(title) {
        $scope.title = title;
    };
    // WHO ------------------------
    var invitees = [];
    var invitedContacts = [];
    $scope.all = {checked: false};
    var nextPages = function (list, result) {
            var i;
            if (result) {
                for (i = 0; i < result.objects.length; i += 1) {
                    var item = result.objects[i];
                    if ($scope.all.checked) { item.checked = true; }
                    list.push(item);
                }
            }
        return list;
    };
    $scope.progressValue = 0;
//     $scope.showGetContacts = false;
//     $scope.getContacts = function() {
//         Contacts.retrieve().then(
//             function(success) {console.log(success);},
//             function(error) {console.log(error);}
//             ).finally(function() {
//                 function sleep(ms) {
//                     return new Promise(resolve => setTimeout(resolve, ms));
//                 }
//                 $scope.progressMax = 100;
//                 var id = setInterval(progress, 100);
//                 function progress() {
//                     if ($scope.progressValue >= $scope.progressMax) {
//                         clearInterval(id);
//                         loadContacts();
//                         $scope.progressValue = 0;
//                     } else {
//                         $scope.progressValue++;
//                     }
//                     $scope.$apply();
//                 }                
//             });
//     };
    // registered users
    $scope.friends = [];
    var friendsResource = new $tastypieResource('suggestions', {order_by: 'first_name'});
    var loadMoreFriends = function () {
        GenericResourceList.loadMore(friendsResource, $scope.friends, nextPages)
        .then(function(list) {
            $scope.friends=list;
            if (GenericResourceList.canLoadMore(friendsResource)) {
                loadMoreFriends();
            }
        })
        .finally(function() {});
    };
    var loadFriends = function () {
        GenericResourceList.search(friendsResource, nextPages)
        .then(function(list) {
            $scope.friends = list;
            loadMoreFriends();
        })
        .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    loadFriends();
    // contacts
    $scope.contacts = [];
    var contactsResource = new $tastypieResource('contact', {order_by: 'name'});
    var loadMoreContacts = function () {
        GenericResourceList.loadMore(contactsResource, $scope.contacts, nextPages)
        .then(function(list) {
            if (list.length == 0) {
//                 $scope.showGetContacts = true;
            }
            $scope.contacts = list;
            if (GenericResourceList.canLoadMore(contactsResource)) {
                loadMoreContacts();
            }
        })
        .finally(function() {});
    };
    var loadContacts = function () {
        GenericResourceList.search(contactsResource, nextPages)
        .then(function(list) {
            $scope.contacts = list;
            loadMoreContacts();
        })
        .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    loadContacts();
    //
    $scope.allChanged = function () {
        for (var i = 0; i < $scope.friends.length; i++) {
            $scope.friends[i].checked = $scope.all.checked;
        };
        for (var i = 0; i < $scope.contacts.length; i++) {
            $scope.contacts[i].checked = $scope.all.checked;
        };
    };
    $scope.itemChanged = function () {
        $scope.all.checked = false;
    };
    $scope.reload = function() {
        loadFriends();
        loadContacts();
    }
    $scope.setWho = function () {
        invitees = [];
        invitedContacts = [];
        for (var i = 0; i < $scope.friends.length; i++) {
            var item = $scope.friends[i];
            if (item.checked) {
                // hack, to be improve with better API
                var resUrl = '/api/v1/user/' + item.id + '/';
                invitees.push(resUrl);
            };
        };
        for (var i = 0; i < $scope.contacts.length; i++) {
            var item = $scope.contacts[i];
            if (item.checked) {
                // hack, to be improve with better API
                var resUrl = '/api/v1/contact/' + item.id + '/';
                invitedContacts.push(resUrl);
            };
        };
        $scope.who = invitees.length + invitedContacts.length;
        $scope.whoModal.hide();
    };
    // WHERE ------------------------
    $scope.location = {
        lat: 48.8567, lng: 2.3508,
        address: null, goecoord: null
    };
    $scope.geocoder = new google.maps.Geocoder();
    NgMap.getMap().then(function(map) {
        // disable POI (to avoid info window)
        var styles = [{
            featureType: "poi",
            stylers: [{ visibility: "off" }]
        }];
        map.setOptions({styles: styles});
        $scope.map = map;
    });
    $scope.coordChanged = function(latLng, addr) {
        $scope.location.lat = latLng.lat().toString();
        $scope.location.lng = latLng.lng().toString();
        if (addr) {
            $scope.location.address = addr;
        } else {
            $scope.geocoder.geocode({'location': latLng}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        $scope.$apply(function () {
                            $scope.location.address = results[0].formatted_address;
                        });
                    }
                }
            });
        }
    };
    if ($scope.location.lat && $scope.location.lng) {
    } else if (UserData.getWhere()) {
        $scope.location.lat = UserData.getWhere().latitude;
        $scope.location.lng = UserData.getWhere().longitude;
    }
    var pos = new google.maps.LatLng($scope.location.lat, $scope.location.lng);
    $scope.coordChanged(pos, null);
    // when autocomplete changes, center on the place,
    // show marker and set address in button
    $scope.place = null;
    $scope.placeChanged = function() {
        $scope.place = this.getPlace();;
        if ($scope.place && $scope.place.geometry) {
            $scope.map.setCenter($scope.place.geometry.location);
            $scope.coordChanged($scope.place.geometry.location, $scope.place.formatted_address);
        }
    };
    $scope.disableTap = function(event) {

        var input = event.target;

        // Get the predictions element
        var container = document.getElementsByClassName('pac-container');
        container = angular.element(container);

        // Apply css to ensure the container overlays the other elements, and
        // events occur on the element not behind it
        container.css('z-index', '5000');
        container.css('pointer-events', 'auto');

        // Disable ionic data tap
        container.attr('data-tap-disabled', 'true');

        // Leave the input field if a prediction is chosen
        container.on('click', function(){
            input.blur();
        });
    };
    // on click event, show marker and set address in button
    $scope.onClick= function(event) {
        $scope.coordChanged(event.latLng, null);
    };
    $scope.setWhere = function () {
        $scope.where = $scope.location;
        $scope.where.geocoord = '{ "type": "Point", "coordinates": [' + $scope.location.lat + ', ' + $scope.location.lng + '] }';
        $scope.whereModal.hide();
    };
// Event creation
    $scope.create = function() {
        $ionicLoading.show({template: "Création du rendez-vous"});
        var event = new $tastypieResource('events/mine');
        var eventName = $scope.what.description;
        if ($scope.title) {
            eventName = $scope.title;
        };
        event.objects.$create({
            name: eventName,
            start: $scope.when,
            event_type: $scope.what.resource_uri,
            location_name: $scope.where.name,
            location_address: $scope.where.address,
//             location_id: $scope.where.id,
            location_coords: $scope.where.geocoords,
            invitees: invitees,
            contacts: invitedContacts
        }).$save().then(
            function () {
                $ionicLoading.hide();
                $state.go('tab.account');
            },
            function (error) {
                console.log(error);
                $ionicLoading.hide();
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        );
    };
// load modals
    $ionicModal.fromTemplateUrl('templates/event/what.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.whatModal = modal;
    });
    $ionicModal.fromTemplateUrl('templates/event/when.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.whenModal = modal;
    });
    $ionicModal.fromTemplateUrl('templates/event/where.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.whereModal = modal;
    });
    $ionicModal.fromTemplateUrl('templates/event/who.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.whoModal = modal;
    });
    $scope.showWho = function() {
        $scope.whoModal.show();
    };
// Cleanup the modals when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.whatModal.remove();
        $scope.whenModal.remove();
        $scope.whereModal.remove();
        $scope.whoModal.remove();
    });
}])

.controller('EventCtrl', ['$window', '$state', '$scope', '$stateParams', '$tastypieResource', 'InviteService', 'UserData', 'AuthService', '$ionicHistory', '$ionicLoading', function ($window, $state, $scope, $stateParams, $tastypieResource, InviteService, UserData, AuthService, $ionicHistory, $ionicLoading) {
    "use strict";
    var eventResource, commentResource, loadEvent, leaveAndReload, joinAndReload;
    $scope.goBackAction = function() {
        if ($ionicHistory.viewHistory().backView) {
            $ionicHistory.goBack();
        } else {
            $state.go('tab.account');
        }
    };
    eventResource = new $tastypieResource('event');
    loadEvent = function() {
        $scope.buttonTitle = null;
        eventResource.objects.$get({id: parseInt($stateParams.eventId, 10)}).then(
            function (result) {
                $scope.event = result;
                var my_id = UserData.getUserId(),
                    index,
                    participants = result.participants,
                    found = false;
                if (!result.canceled) {
                    if (my_id === result.owner.id) {
                        $scope.buttonTitle = "J'annule";
                        $scope.buttonAction = function (eventId) {
                            var myevent = new $tastypieResource('events/mine');
                            myevent.objects.$delete({id: eventId});
                            $state.go('tab.account', {}, { reload: true });
                        };
                    } else {
                        for (index = 0; index < participants.length; index += 1) {
                            if (my_id === participants[index].id) {
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
                            $scope.buttonTitle = "Je viens";
                            $scope.buttonAction = function (eventId) {
                                joinAndReload(eventId);
//                                 $window.location.reload(true);
                            };
                        }
                    }
                }
            }, function(error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
                $scope.buttonTitle = "Erreur de chargement";
            });
    };
    loadEvent();
    leaveAndReload = function(eventId) {
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
    joinAndReload = function(eventId) {
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
}]);
