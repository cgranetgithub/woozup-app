/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular*/

angular.module('woozup.controllers')

.controller('NewEventCtrl', ['$tastypieResource', '$ionicLoading', '$ionicModal', 'AuthService', '$scope', '$state', 'UserData', 'NgMap',
    function ($tastypieResource, $ionicLoading, $ionicModal, AuthService, $scope, $state, UserData, NgMap) {
        "use strict";
        var date = new Date();
        date.setHours(date.getHours() + 1);
        date.setMinutes(0);
        $scope.when = date;
        $scope.options = {minDate:$scope.when, showWeeks:false, startingDay:1};
        $scope.types = new $tastypieResource('event_type', {order_by: 'order'});
        $scope.types.objects.$find().then(
            function () {
                console.log($scope.types);
                $scope.what = $scope.types.page.objects[0];
            },
            function (error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        );
        $scope.friends = [];
        $scope.search = '';
        var friendsResource,
            nextPages = function (result) {
                var i;
                if (result) {
                    for (i = 0; i < result.objects.length; i += 1) {
                        var item = result.objects[i];
                        if ($scope.all.checked) {
                            item.checked = true;
                        }
                        $scope.friends.push(item);
                    }
                }
            };
        // get friends logic with pagination
        $scope.onSearchChange = function (word) {
            friendsResource = new $tastypieResource('friends/mine', {
//                                     order_by: 'first_name',
//                                     first_name__icontains: word
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
        // initial request to get friends
        $scope.onSearchChange('');
        // pagination
        $scope.loadMore = function () {
            if (friendsResource.page.meta && friendsResource.page.meta.next) {
                friendsResource.page.next().then(function (result) {
                    nextPages(result);
                });
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        $scope.all = {checked: false};
        $scope.allChanged = function () {
            for (var i = 0; i < $scope.friends.length; i++) {
                $scope.friends[i].checked = $scope.all.checked;
            }
        };
        $scope.itemChanged = function () {
            $scope.all.checked = false;
        };
        
        $scope.setWhat = function (type) {
            $scope.what = type;
            $scope.whatModal.hide();
        };
        
        // initialize coords
        var lat = 48.8567, lng = 2.3508, vm = this,
            geocoder = new google.maps.Geocoder(),
                setAddress = function (address, lat, lng) {
                    var coords = '{ "type": "Point", "coordinates": ['
                                 + lat + ', ' + lng + '] }';
//                     EventData.setAddress(address, coords);
                },
            coordChanged = function(latLng, addr) {
                vm.lat = latLng.lat().toString();
                vm.lng = latLng.lng().toString();
                if (addr) {
                    vm.where = addr;
//                     EventData.setAddress(vm.where, vm.lat, vm.lng);
                } else {
                    geocoder.geocode({'location': latLng},
                                    function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                $scope.$apply(function () {
                                    vm.where = results[0].formatted_address;
//                                     EventData.setAddress(vm.where,
//                                                             vm.lat, vm.lng);
                                });
                            }
                        }
                    });
                }
            };
//         vm.backgroundUrl = EventData.getWhat().background;
//         vm.title = EventData.getWhat().name + ', le ' + $filter('date')(EventData.getWhen(), 'EEEE d MMMM');
        if (vm.lat && vm.lng) {
            lat = vm.lat;
            lng = vm.lng;
        } else if (UserData.getWhere()) {
            lat = UserData.getWhere().latitude;
            lng = UserData.getWhere().longitude;
        }
        var pos = new google.maps.LatLng(lat, lng);
        coordChanged(pos, null);
        NgMap.getMap().then(function(map) {
//                 $log.log('markers', map.markers);
            // disable POI (to avoid info window)
            var styles = [{
                featureType: "poi",
                stylers: [{ visibility: "off" }]
            }];
            map.setOptions({styles: styles});
            vm.map = map;
        });
        // when autocomplete changes, center on the place,
        // show marker and set address in button
        vm.placeChanged = function() {
            if (vm.place.geometry) {
//                 EventData.setPlace(vm.place.name, vm.place.place_id);
                vm.map.setCenter(vm.place.geometry.location);
                coordChanged(vm.place.geometry.location,
                            vm.place.formatted_address
                );
            }
        };
        // on click event, show marker and set address in button
        vm.onClick= function(event) {
//             EventData.setPlace('', '');
            coordChanged(event.latLng);
        };
        
        
        
        
        $scope.setWhen = function (when) {
            $scope.when = when;
//             EventData.setWhen($scope.when.date);
            $scope.whenModal.hide();
        };
        $scope.setWhere = function () {
            $scope.whereModal.hide();
        };
        $scope.setWho = function () {
            $scope.whoModal.hide();
        };
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
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.whatModal.remove();
            $scope.whenModal.remove();
            $scope.whereModal.remove();
            $scope.whoModal.remove();
        });
}]);
