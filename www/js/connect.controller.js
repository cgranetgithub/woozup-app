angular.module('woozup.controllers')
.controller('ConnectCtrl', ['$tastypie', '$ionicLoading', '$ionicPopup', 'AuthService', 'sortContacts', '$scope', '$state', 'UserData', 'pushNotifReg', '$ionicHistory',
    function ($tastypie, $ionicLoading, $ionicPopup, AuthService, sortContacts, $scope, $state, UserData, pushNotifReg, $ionicHistory) {
        "use strict";
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $scope.data = {};
        $scope.newNumber = false;
        $scope.validCode = false;
        // get code
        $scope.get_code = function () {
            $ionicLoading.show();
            AuthService.getCode({'phone_number': $scope.data.number}, false)
                .success(function () {
                    $scope.newNumber = true;
                    $ionicLoading.hide();
                }).error(function () {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: "Problème",
                        template: "Réessaie"
                    });
                });
        };
        // verif code
        $scope.verif_code = function () {
            $ionicLoading.show();
            AuthService.verifCode({'phone_number': $scope.data.number, 'code': $scope.data.code}, false)
                .success(function () {
                    $scope.validCode = true;
                    $ionicLoading.hide();
                }).error(function () {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: "Problème",
                        template: "Réessaie"
                    });
                });
        };
        // password popup
        $scope.showPopup = function() {
            var passwordPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="data.password">',
                title: 'Choisis un mot de passe',
//                 subTitle: 'Please use normal things',
                scope: $scope,
                buttons: [
                    {   text: 'Annuler' },
                    {   text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.password) {
                                e.preventDefault();
                            } else {
                                $ionicLoading.show();
                                return $scope.data.password;
                            }
                        }
                    }
                ]
            });
            passwordPopup.then(function(res) {
                var authData = {
                    'username': $scope.data.number,
                    'password': $scope.data.password,
                    'number': $scope.data.number,
                    'code': $scope.data.code
                };
                AuthService.registerUser(authData, false)
                .success(function () {
                    $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
                    pushNotifReg(UserData.getNotifData());
                    findContacts(sortContacts);
                    $state.go('picture');
                    $ionicLoading.hide();
                }).error(function (err) {
                    var message;
                    switch (err) {
                    case '10':
                        message = "Saisis un nom d'utilisateur et un mot de passe";
                        break;
                    case '200':
                        message = "Désolé, ce nom d'utilisateur est déjà pris.";
                        break;
                    case '150':
                        message = "Cet utilisateur a été désactivé. Contacte Woozup pour plus d'info.";
                        break;
                    default:
                        message = "Problème lors de la création de ton compte.";
                    }
                    $ionicPopup.alert({
                        title: "Problème lors de la création de ton compte",
                        template: message
                    });
                    $ionicLoading.hide();
                });
            })
        };
        // Facebook connect method
        $scope.fbLogin = function () {
            facebookConnectPlugin.login([], function (obj) {
                var authData = {
                    "provider": "facebook",
                    "access_token": obj.authResponse.accessToken
                };
                /* we have to call registerbyToken from service AuthService */
                AuthService.loginUser(authData, "facebook")
                    .success(function () {
                        $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
                        pushNotifReg(UserData.getNotifData());
                        findContacts(sortContacts);
                        $state.go('menu.events.new');
                    }).error(function () {
                        $ionicPopup.alert({
                            title: "Problème lors de la création du compte",
                            template: "Réessaie plus tard"
                        });
                    });
            }, function (obj) {
                console.log(obj);
            });
        };
    }])
