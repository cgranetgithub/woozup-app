/*jslint browser: true, devel: true, maxerr: 999, white: true, vars: true, newcap: true*/
/*global angular, cordova, StatusBar, ContactFindOptions, facebookConnectPlugin*/

angular.module('woozup.controllers')

.controller('ProfileCtrl', ['$tastypieResource', '$ionicLoading', '$scope', 'AuthService', 'UserData', 'ProfileService', '$state', '$ionicModal', 'CameraService', function ($tastypieResource, $ionicLoading, $scope, AuthService, UserData, ProfileService, $state, $ionicModal, CameraService) {
    "use strict";
    $scope.loadProfile = function() {
        $ionicLoading.show({template: "Chargement"});
        $scope.userresource = new $tastypieResource('user', {});
        $scope.userresource.objects.$get({id: UserData.getUserId()}).then(
            function (result) {
                $scope.user = result;
                $scope.title = result.first_name;
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
    };
    $scope.loadProfile();
    // modal window
    $ionicModal.fromTemplateUrl('templates/imgcropmodal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    // camera
    $scope.myImage = '';
    $scope.myCroppedImage = '';
    $scope.photoFromCamera = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromCamera().then(
            function (imageURI) {
                $scope.myImage = imageURI;
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
                $scope.myImage = imageURI;
                $ionicLoading.hide();
            }, function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
    };
    $scope.savePicture = function (croppedImage) {
        $ionicLoading.show({template: "Sauvegarde du profil"});
        var b64 = croppedImage.split(',')[1],
            file_field = {
                "name": "myfile.png",
                "file": b64,
            };
        ProfileService.setpicture(file_field).then(
            function (res) {
                $scope.loadProfile();
                $ionicLoading.hide();
            },
            function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
        $scope.closeModal();
    };
    $scope.saveProfile = function () {
        $ionicLoading.show({template: "Mise à jour du profil"});
        ProfileService.setprofile({
            'first_name': $scope.data.first_name,
            'last_name': $scope.data.last_name,
//                     'email': $scope.data.email,
            'number': $scope.data.number,
            'gender': $scope.data.gender
        }).then(function () {
            $scope.loadProfile();
            $ionicLoading.hide();
        }, function (error) {
            $scope.loadProfile();
            $ionicLoading.hide();
        });
    };
}])

.controller('PictureCtrl', ['$tastypieResource', 'CameraService', '$ionicLoading', '$scope', '$state', 'AuthService', 'UserData', 'ProfileService', '$ionicModal', '$ionicPopup', '$ionicPlatform', '$ionicHistory', function ($tastypieResource, CameraService, $ionicLoading, $scope, $state, AuthService, UserData, ProfileService, $ionicModal, $ionicPopup, $ionicPlatform, $ionicHistory) {
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
        $scope.data = {};
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
            console.log('Tapped!', res);
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
    $scope.myCroppedImage = '';
    $scope.photoFromCamera = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromCamera().then(
            function (imageURI) {
                $scope.myImage = imageURI;
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
                $scope.myImage = imageURI;
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
                    "name": "myfile.png",
                    "file": b64,
                };
            ProfileService.setpicture(file_field).then(
                function (res) {$ionicLoading.hide();},
                function (err) {$ionicLoading.hide();}
            );
        };
        $state.go('tab.home');

        // enable back button again
        deregister();
    };
}]);
