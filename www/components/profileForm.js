function ProfileFormController(CameraService, $ionicLoading, ProfileService, $ionicPopup) {
    "use strict";
    var ctrl = this;
    ctrl.openModal = function() {
        // picture choice popup
        var myPopup = $ionicPopup.show({
//             templateURL: 'template/imgcropmodal.html',
            title: 'Choisir une photo',
//             subTitle: 'Please use normal things',
//             scope: $scope,
            buttons: [
            {
                text: 'Dans la galerie',
                type: 'button-stable',
                onTap: photoFromGallery
            },
            {
                text: 'Prendre une photo',
                type: 'button-stable',
                onTap: photoFromCamera
            }
            ]
        });
        myPopup.then(function(res) {
        });      
    };
    // camera
    var photoFromCamera = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromCamera().then(
            function (imageURI) {
                ctrl.image = "data:image/jpeg;base64," + imageURI;
                ctrl.imageUpdate({'image':imageURI});
                $ionicLoading.hide();
            }, function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
    };
    var photoFromGallery = function () {
        $ionicLoading.show({template: "Chargement de la photo"});
        CameraService.photoFromGallery().then(
            function (imageURI) {
                ctrl.image = "data:image/jpeg;base64," + imageURI;
                ctrl.imageUpdate({'image':imageURI});
                $ionicLoading.hide();
            }, function (err) {
                console.log(err);
                $ionicLoading.hide();
            }
        );
    };
//     ctrl.next = function () {
//         ProfileService.setprofile({'first_name': ctrl.firstname});
// 
//         if (ctrl.image) {
//             var b64 = ctrl.image.split(',')[1],
//                 file_field = {
//                     "name": "2016.jpg",
//                     "file": b64,
//                 };
//             console.log(file_field);
//             ProfileService.setpicture(file_field).then(
//                 function (res) {$ionicLoading.hide();},
//                 function (err) {$ionicLoading.hide();}
//             );
//         };
//     };
}

angular.module('woozup').component('profileForm', {
  templateUrl: 'components/profileForm.html',
  controller: ProfileFormController,
  bindings: {
    image: '=',
    firstName: '=',
    nameUpdate: '&',
    imageUpdate: '&'
  }
});
