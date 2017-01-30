/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('ProfileCtrl', ['$tastypieResource', '$scope', 'AuthService', 'UserData', 'ProfileService', '$state', '$ionicModal', '$ionicLoading', 'CameraService', function ($tastypieResource, $scope, AuthService, UserData, ProfileService, $state, $ionicModal, $ionicLoading, CameraService) {
    "use strict";
    $scope.userId = UserData.getUserId();
    var newname, newimage;
    // events
    var today = new Date();
    today.setHours(today.getUTCHours()-2);
    today.setMinutes(0);
    $scope.eventsResource = new $tastypieResource('event', {order_by: 'start', start__gte: today});
    //
    $scope.loadProfile = function() {
        $scope.userresource = new $tastypieResource('user');
        $scope.userresource.objects.$get({id: $scope.userId}).then(
            function (result) {
                $scope.user = result;
                $scope.firstname = result.first_name;
                $scope.image = result.profile.image;
            },
            function (error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        ).finally(function() {
        });
    };
    $scope.loadProfile();
    // modal window
    $ionicModal.fromTemplateUrl('templates/user/profileEdit.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.edit = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    $scope.save = function() {
        if (newname) {
            $ionicLoading.show({template: "Mise à jour"});
            ProfileService.setprofile({'first_name': newname})
                .then(function (res) {}, function (err) {console.log(err);})
                .finally(function() {
                    $scope.loadProfile();
                    $ionicLoading.hide();
                });
        }
        if (newimage) {
            var file_field = {"name": "2016.jpg", "file": newimage};
            $ionicLoading.show({template: "Mise à jour"});
            ProfileService.setpicture(file_field)
                .then(function (res) {}, function (err) {console.log(err);})
                .finally(function() {
                    $scope.loadProfile();
                    $ionicLoading.hide();
                });
        };
        $scope.closeModal();
    };
    $scope.nameUpdate = function(firstName) {
        newname = firstName;
        $scope.firstname = firstName;
    };
    $scope.imageUpdate = function(image) {
        newimage = image;
    };
}])

.controller('PictureCtrl', ['$tastypieResource', 'CameraService', '$ionicLoading', '$scope', '$state', 'AuthService', 'UserData', 'ProfileService', '$ionicModal', '$ionicPopup', '$ionicPlatform', '$ionicHistory', 'Contacts', function ($tastypieResource, CameraService, $ionicLoading, $scope, $state, AuthService, UserData, ProfileService, $ionicModal, $ionicPopup, $ionicPlatform, $ionicHistory, Contacts) {
    "use strict";
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    // disable back button
    var deregister = $ionicPlatform.registerBackButtonAction(function () {}, 101);
    //
    $ionicLoading.show({template: "Chargement"});
    $scope.data = {};
    $scope.userprofile = new $tastypieResource('user', {});
    $scope.userprofile.objects.$get({id: UserData.getUserId()}).then(
        function (result) {
            $scope.userprofile = result;
            $ionicLoading.hide();
        },
        function (error) {
            console.log(error);
            $ionicLoading.hide();
            // verify authentication
            AuthService.checkUserAuth().success()
                .error(function () {$state.go('network');});
        }
    );
    // modal window
//     $ionicModal.fromTemplateUrl('templates/imgcropmodal.html', {
//         scope: $scope,
//         animation: 'slide-in-up'
//     }).then(function(modal) {
//         $scope.modal = modal;
//     });
    $scope.openModal = function() {
        // picture choice popup
        var myPopup = $ionicPopup.show({
//             templateURL: 'template/imgcropmodal.html',
            title: 'Choisir une photo',
//             subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [
            {
                text: 'Dans la galerie',
                type: 'button-stable',
                onTap: $scope.photoFromGallery
            },
            {
                text: 'Prendre une photo',
                type: 'button-stable',
                onTap: $scope.photoFromCamera
            }
            ]
        });

        myPopup.then(function(res) {
        });      
        
        
        //         $scope.modal.show();
    };
//     $scope.closeModal = function() {
//         $scope.modal.hide();
//     };
    $scope.$on('$destroy', function() {
//         $scope.modal.remove();
    });
    // camera
    $scope.myImage = '';
//     $scope.myCroppedImage = '';
    $scope.photoFromCamera = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromCamera().then(
            function (imageURI) {
                $scope.myImage = "data:image/jpeg;base64," + imageURI;
                $ionicLoading.hide();
            }, function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
    };
    $scope.photoFromGallery = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromGallery().then(
            function (imageURI) {
                $scope.myImage = "data:image/jpeg;base64," + imageURI;
                $ionicLoading.hide();
            }, function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
    };
//     $scope.savePicture = function (croppedImage) {
//         $ionicLoading.show({template: "Sauvegarde du profil"});
//         $scope.myCroppedImage = croppedImage;
//         var b64 = croppedImage.split(',')[1],
//             file_field = {
//                 "name": "myfile.png",
//                 "file": b64,
//             };
//         ProfileService.setpicture(file_field).then(
//             function (res) {$ionicLoading.hide();},
//             function (err) {$ionicLoading.hide();}
//         );
//         $scope.closeModal();
//     };
    $scope.next = function () {
        ProfileService.setprofile({'first_name': $scope.data.first_name, 'last_name': $scope.data.last_name});

        if ($scope.myImage) {
            var b64 = $scope.myImage.split(',')[1],
                file_field = {
                    "name": "2016.jpg",
                    "file": b64,
                };
            ProfileService.setpicture(file_field).then(
                function (res) {$ionicLoading.hide();},
                function (err) {$ionicLoading.hide();}
            );
        };
        Contacts.retrieve();
        $state.go('tab.new');

        // enable back button again
        deregister();
    };
}]);
