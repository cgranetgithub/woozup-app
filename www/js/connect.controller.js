angular.module('woozup.controllers')

.controller('ConnectCtrl', ['$tastypie', '$ionicLoading', '$ionicPopup', 'AuthService', 'ProfileService', '$scope', '$state', 'UserData', 'pushNotifReg', '$ionicHistory', '$timeout', '$q', '$localstorage', 'Contacts', function ($tastypie, $ionicLoading, $ionicPopup, AuthService, ProfileService, $scope, $state, UserData, pushNotifReg, $ionicHistory, $timeout, $q, $localstorage, Contacts) {
    "use strict";
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    // restore states
    $scope.data = {};
    $scope.wantResetPassword = $localstorage.get('wantResetPassword');
    $scope.registered = $localstorage.get('registered');
    $scope.newNumber = $localstorage.get('newNumber');
    $scope.validCode = $localstorage.get('validCode');
    //
    $scope.backToStart = function() {
        $scope.data = {};
        $scope.wantResetPassword = false;
        $scope.registered = false;
        $scope.newNumber = false;
        $scope.validCode = false;
        $localstorage.set('wantResetPassword', false);
        $localstorage.set('registered', false);
        $localstorage.set('newNumber', false);
        $localstorage.set('validCode', false);
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
            $localstorage.set('newNumber', true);
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
                $localstorage.set('registered', true);
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
                $localstorage.set('validCode', true);
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
                $localstorage.set('registered', false);
                $localstorage.set('newNumber', false);
                $localstorage.set('validCode', false);
                Contacts.retrieve();
                $state.go('tab.new');
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
                            $localstorage.set('wantResetPassword', true);
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
                'phone_number': $scope.data.number,
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
    // ======== FACEBOOK ==========
    
    // This is the success callback from the login method
    var fbLoginSuccessAndRegister = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var authResponse = response.authResponse;
        facebookConnectPlugin.getAccessToken(function(token) {
            var authData = {
                'access_token': token,
                'phone_number': $scope.data.number,
                'code': $scope.data.code
            };            
            AuthService.registerUser(authData, 'facebook')
            .then(function(success) {
                getFacebookProfileInfo(authResponse).then(
                function(profileInfo) {
                    var file_field = {
                    "name":"facebook",
                    "url_image": "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
                    };
                    ProfileService.setpicture(file_field).then(
                        function (res) {$ionicLoading.hide();},
                        function (err) {$ionicLoading.hide();}
                    );
        //                 authResponse: authResponse,
        //                 userID: profileInfo.id,
        //                 name: profileInfo.name,
        //                 email: profileInfo.email,
        //                 picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
        //             });
                    $ionicLoading.hide();
                    Contacts.retrieve();
                    $state.go('tab.new');
                }, function(fail) {
                    // Fail get profile info
                    console.log('profile info fail', fail);
                });
            }, function(error){
                console.log(error);
            });
        });
    };
    // This is the success callback from the login method
    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var authResponse = response.authResponse;
        facebookConnectPlugin.getAccessToken(function(token) {
            var authData = {
                'access_token': token,
                'phone_number': $scope.data.number,
            };            
            AuthService.loginUser(authData, 'facebook')
            .then(function(success) {
                    $ionicLoading.hide();
                    Contacts.retrieve();
                    $state.go('tab.new');
                }, function(fail) {
                    // Fail get profile info
                    console.log('FB login failed', fail);
                });
        }, function(error){
            console.log(error);
        });
    };
    
    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $ionicLoading.hide();
    };
    
    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();
        facebookConnectPlugin.api('/me?fields=name&access_token=' + authResponse.accessToken, null,
            function (response) {
                info.resolve(response);
            },
            function (response) {
                console.log(response);
                info.reject(response);
            }
        );
        return info.promise;
    };
    
    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {
        facebookConnectPlugin.getLoginStatus(
        function(success) {
            $ionicLoading.show({template: 'Connexion'});
            if (success.status === 'connected') {
                // The user is logged in and has authenticated your app,
                // response.authResponse supplies the user's ID, a valid access token, a signed request, and the time the access token and signed request each expire
                fbLoginSuccessAndRegister(success);
            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
                // Else the person is not logged into Facebook, so we're not sure if they are logged into this app or not.
                // Ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['user_friends', 'public_profile'], fbLoginSuccessAndRegister, fbLoginError);
            }
        });
    };
    $scope.facebookLogIn = function() {
        facebookConnectPlugin.getLoginStatus(
        function(success) {
            $ionicLoading.show({template: 'Connexion'});
            if (success.status === 'connected') {
                fbLoginSuccess(success);
            } else {
                facebookConnectPlugin.login(['user_friends', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
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

.controller('CheckauthCtrl', ['$tastypie', '$ionicLoading', 'AuthService', '$state', 'UserData', 'pushNotifReg', '$ionicHistory', 'Contacts', function ($tastypie, $ionicLoading, AuthService, $state, UserData, pushNotifReg, $ionicHistory, Contacts) {
    "use strict";
    $ionicLoading.show({template: "Vérification de ton compte"});
    $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    // verify authentication
    AuthService.checkUserAuth()
        .success(function (result) {
//             $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
//             pushNotifReg(UserData.getNotifData());
//             findContacts(sortContacts);
            var user = angular.fromJson(result['data']);
            if (user.first_name || user.last_name) {
                Contacts.retrieve();
                $state.go('tab.new');
            } else {
                $state.go('picture');
            }
            $ionicLoading.hide();
        })
        .error(function (error) {
            console.log(error);
            if (error.status == 401) {
                $state.go('connect');
            } else {
                $state.go('network');
            }
            $ionicLoading.hide();
        });
}])

.controller('NetworkCtrl', ['$ionicLoading', 'AuthService', '$state', '$ionicHistory', '$scope', '$window', '$interval', function ($ionicLoading, AuthService, $state, $ionicHistory, $scope, $window, $interval) {
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
