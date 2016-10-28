/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/

angular.module('woozup.controllers')

.controller('NewEventCtrl', ['$tastypieResource', '$ionicLoading', '$ionicModal', 'AuthService', '$scope', '$state', 'UserData', 'NgMap',
    function ($tastypieResource, $ionicLoading, $ionicModal, AuthService, $scope, $state, UserData, NgMap) {
        "use strict";
    // WHEN ------------------------
        var date = new Date();
        date.setHours(date.getHours() + 1);
        date.setMinutes(0);
        $scope.when = date;
        $scope.options = {minDate:$scope.when, showWeeks:false, startingDay:1};
        $scope.setWhen = function (when) {
            $scope.when = when;
            $scope.whenModal.hide();
        };
    // WHAT ------------------------
        $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
        $scope.types.objects.$find().then(
            function () {
                $scope.what = $scope.types.page.objects[0];
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
    // WHO ------------------------
        $scope.friends = [];
        $scope.invitees = [];
        $scope.friendsResource = new $tastypieResource('friends/mine', {order_by: 'first_name'});
        var nextPages = function (result) {
                var i;
                if (result) {
                    for (i = 0; i < result.objects.length; i += 1) {
                        var item = result.objects[i];
                        if ($scope.all.checked) { item.checked = true; }
                        $scope.friends.push(item);
        }}};
        // get friends logic with pagination
        $scope.friendsResource.objects.$find().then(
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
        // pagination
        $scope.loadMore = function () {
            if ($scope.friendsResource.page.meta && $scope.friendsResource.page.meta.next) {
                $scope.friendsResource.page.next().then(function (result) {
                    nextPages(result);
                });
            };
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        $scope.all = {checked: false};
        $scope.allChanged = function () {
            for (var i = 0; i < $scope.friends.length; i++) {
                $scope.friends[i].checked = $scope.all.checked;
        }};
        $scope.itemChanged = function () {
            $scope.all.checked = false;
        };        
        $scope.setWho = function () {
            if (! $scope.all.checked) {
                for (var i = 0; i < $scope.friends.length; i++) {
                    var item = $scope.friends[i];
                    if (item.checked) {
                        $scope.invitees.push(item.resource_uri);
                    };
                };
            };
            $scope.whoModal.hide();
        };
    // WHERE ------------------------
        $scope.where = {
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
            $scope.where.lat = latLng.lat().toString();
            $scope.where.lng = latLng.lng().toString();
            if (addr) {
                $scope.where.address = addr;
            } else {
                $scope.geocoder.geocode({'location': latLng}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            $scope.$apply(function () {
                                $scope.where.address = results[0].formatted_address;
                            });
                        }
                    }
                });
            }
        };
        if ($scope.where.lat && $scope.where.lng) {
        } else if (UserData.getWhere()) {
            $scope.where.lat = UserData.getWhere().latitude;
            $scope.where.lng = UserData.getWhere().longitude;
        }
        var pos = new google.maps.LatLng($scope.where.lat, $scope.where.lng);
        $scope.coordChanged(pos, null);
        // when autocomplete changes, center on the place,
        // show marker and set address in button
        $scope.place = null;
        $scope.placeChanged = function(place) {
            $scope.place = place;
            if ($scope.place && $scope.place.geometry) {
                $scope.map.setCenter($scope.place.geometry.location);
                $scope.coordChanged($scope.place.geometry.location, $scope.place.formatted_address);
            }
        };
        // on click event, show marker and set address in button
        $scope.onClick= function(event) {
            $scope.coordChanged(event.latLng, null);
        };
        $scope.setWhere = function () {
            $scope.where.geocoord = '{ "type": "Point", "coordinates": [' + $scope.where.lat + ', ' + $scope.where.lng + '] }';
            $scope.whereModal.hide();
        };
    // Event creation
        $scope.create = function() {
            $ionicLoading.show({template: "Création du rendez-vous"});
            var event = new $tastypieResource('events/mine');
            event.objects.$create({
                name: $scope.what.description,
                start: $scope.when,
                event_type: $scope.what.resource_uri,
                location_name: $scope.where.name,
                location_address: $scope.where.address,
    //             location_id: $scope.where.id,
                location_coords: $scope.where.geocoords,
                invitees: $scope.invitees}
            ).$save().then(
                function () {
                    $ionicLoading.hide();
                    $state.go('tab.home');
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
    // Cleanup the modals when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.whatModal.remove();
            $scope.whenModal.remove();
            $scope.whereModal.remove();
            $scope.whoModal.remove();
        });
}]);
