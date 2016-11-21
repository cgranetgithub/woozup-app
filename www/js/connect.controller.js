angular.module('woozup.controllers')

.controller('ConnectCtrl', ['$tastypie', '$ionicLoading', '$ionicPopup', 'AuthService', '$scope', '$state', 'UserData', 'pushNotifReg', '$ionicHistory', '$timeout', function ($tastypie, $ionicLoading, $ionicPopup, AuthService, $scope, $state, UserData, pushNotifReg, $ionicHistory, $timeout) {
    "use strict";
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    $scope.backToStart = function() {
        $scope.data = {};
        $scope.wantResetPassword = false;
        $scope.registered = false;
        $scope.newNumber = false;
        $scope.validCode = false;
    };
    $scope.backToStart();
    // Timer (to avoid sending SMS too fast)
    var mytimeout = null;
    var onTimeout = function() {
        if ($scope.timer === 0) {
            $scope.$broadcast('timer-stopped', 0);
            $timeout.cancel(mytimeout);
            return;
        }
        $scope.timer--;
        mytimeout = $timeout(onTimeout, 1000);
    };
    var startTimer = function() {
        $scope.timer = 59;
        $scope.hideCodeButton = true;
        mytimeout = $timeout(onTimeout, 1000);
    };
    $scope.$on('timer-stopped', function(event, remaining) {
      if (remaining === 0) {
        $scope.hideCodeButton = false;
      }
    });
    // get code
    $scope.get_code = function() {
        AuthService.getCode({'phone_number': $scope.data.number}, false)
        .success(function () {
            $scope.newNumber = true;
            startTimer();
        }).error(function () {
            var alertPopup = $ionicPopup.alert({
                title: "Numéro invalide",
                template: "Ce numéro de téléphone n'a pas l'air correct."
            });
        });
    };
    // check number
    $scope.check_number = function () {
        $ionicLoading.show();
        AuthService.isRegistered({'phone_number': $scope.data.number}, false)
            .success(function () {
                $scope.registered = true;
                $ionicLoading.hide();
            }).error(function () {
                $scope.get_code();
                $ionicLoading.hide();
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
                    title: "Code incorrect",
                    template: "Ce code ne correspond pas à celui que nous avons envoyé."
                });
            });
    };
    // login
    $scope.login = function () {
        $ionicLoading.show({template: "Connexion"});
        var authData = {'username': $scope.data.number,
                        'password': $scope.data.password};
        AuthService.loginUser(authData, false)
            .success(function () {
                $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
                pushNotifReg(UserData.getNotifData());
//                 findContacts(sortContacts);
                $scope.registered = false;
                $scope.newNumber = false;
                $scope.validCode = false;
                $state.go('tab.home');
                $ionicLoading.hide();
            }).error(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: "Problème de connexion",
                    template: "Vérifie ton login / mot de passe"
                });
            });
    };
    // resetPwd
    $scope.forgetPwd = function() {
        var resetPopup = $ionicPopup.confirm({
            template: "Nous allons t'envoyer un code par SMS qui te permettra de définir un nouveau mot de passe",
            title: 'Mot de passe oublié',
//                 subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [
                {   text: 'Annuler' },
                {   text: '<b>OK</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                            $scope.wantResetPassword = true;
                            $scope.get_code();
                    }
                }
            ]
        });
    };
    $scope.resetPassword = function () {
        $ionicLoading.show();
        var authData = {'phone_number':$scope.data.number,
                        'code': $scope.data.code,
                        'password': $scope.data.password};
        AuthService.resetPassword(authData)
            .success(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: "Well done!",
                    template: "Ton mot de passe a bien été modifié."
                });
                $scope.backToStart();
            }).error(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: "Code incorrect",
                    template: "Ce code ne correspond pas à celui que nous avons envoyé."
                });
            });
    };
    // register - password popup
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
//                 findContacts(sortContacts);
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
//                     findContacts(sortContacts);
                    $state.go('tab.home');
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

.controller('LogoutCtrl', ['$ionicLoading', 'logout', '$state', function ($ionicLoading, logout, $state) {
        "use strict";
        $ionicLoading.show({template: "Déconnection"});
        logout();
        $state.go('connect');
        $ionicLoading.hide();
}])

.controller('CheckauthCtrl', ['$tastypie', '$ionicLoading', 'AuthService', '$state', 'UserData', 'pushNotifReg', '$ionicHistory', function ($tastypie, $ionicLoading, AuthService, $state, UserData, pushNotifReg, $ionicHistory) {
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
//             findContacts(sortContacts);
            $state.go('tab.home');
            $ionicLoading.hide();
        })
        .error(function () {
            $state.go('connect');
            $ionicLoading.hide();
        });
}])

.controller('NetworkCtrl', ['$ionicLoading', 'AuthService', '$state', '$ionicHistory', '$scope', '$window', function ($ionicLoading, AuthService, $state, $ionicHistory, $scope, $window) {
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
}]);
