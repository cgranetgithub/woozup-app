angular.module('woozup.controllers')

.controller('ConnectCtrl', ['$tastypie', '$ionicLoading', '$ionicPopup', 'AuthService', 'sortContacts', '$scope', '$state', 'UserData', 'pushNotifReg', '$ionicHistory',
    function ($tastypie, $ionicLoading, $ionicPopup, AuthService, sortContacts, $scope, $state, UserData, pushNotifReg, $ionicHistory) {
        "use strict";
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $scope.data = {};
        $scope.registered = false;
        $scope.newNumber = false;
        $scope.validCode = false;
        // check number
        $scope.check_number = function () {
            $ionicLoading.show();
            AuthService.isRegistered({'phone_number': $scope.data.number}, false)
                .success(function () {
                    $scope.registered = true;
                    $ionicLoading.hide();
                }).error(function () {
                    // get code
                    AuthService.getCode({'phone_number': $scope.data.number}, false)
                        .success(function () {
                            $scope.newNumber = true;
                            $ionicLoading.hide();
                        }).error(function () {
                            $ionicLoading.hide();
                            var alertPopup = $ionicPopup.alert({
                                title: "Numéro invalide",
                                template: "Ce numéro de téléphone n'a pas l'air correct."
                            });
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
                    findContacts(sortContacts);
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
    }]);


//     .controller('ConnectCtrl', ['$tastypie', '$ionicPopup', 'AuthService',
//                 'sortContacts', '$scope', '$state', 'UserData', 'pushNotifReg',
//                 '$ionicHistory',
//         function ($tastypie, $ionicPopup, AuthService, sortContacts,
//                   $scope, $state, UserData, pushNotifReg, $ionicHistory) {
//             "use strict";
//             $ionicHistory.nextViewOptions({
//                 disableAnimate: true,
//                 disableBack: true
//             });
//             $scope.data = {};
//             $scope.newNumber = false;
//             $scope.validCode = false;
//             // get code
//             $scope.get_code = function () {
//                 AuthService.getCode({'phone_number': $scope.data.number}, false)
//                     .success(function () {
//                         $scope.newNumber = true;
//                     }).error(function () {
//                         var alertPopup = $ionicPopup.alert({
//                             title: "Problème",
//                             template: "Réessaie"
//                         });
//                     });
//             };
//             // verif code
//             $scope.verif_code = function () {
//                 AuthService.verifCode({'phone_number': $scope.data.number, 'code': $scope.data.code}, false)
//                     .success(function () {
//                         $scope.validCode = true;
//                     }).error(function () {
//                         var alertPopup = $ionicPopup.alert({
//                             title: "Problème",
//                             template: "Réessaie"
//                         });
//                     });
//             };
//             // password popup
//             $scope.showPopup = function() {
//                 var passwordPopup = $ionicPopup.show({
//                     template: '<input type="password" ng-model="data.password">',
//                     title: 'Choisis un mot de passe',
//     //                 subTitle: 'Please use normal things',
//                     scope: $scope,
//                     buttons: [
//                         {   text: 'Annuler' },
//                         {   text: '<b>OK</b>',
//                             type: 'button-positive',
//                             onTap: function(e) {
//                                 if (!$scope.data.password) {
//                                     e.preventDefault();
//                                 } else {
//                                     return $scope.data.password;
//                                 }
//                             }
//                         }
//                     ]
//                 });
//                 passwordPopup.then(function(res) {
//                     console.log('Tapped!', res);
//                 });
//             };
//             // Facebook connect method
//             $scope.fbLogin = function () {
//                 facebookConnectPlugin.login([], function (obj) {
//                     var authData = {
//                         "provider": "facebook",
//                         "access_token": obj.authResponse.accessToken
//                     };
//                     /* we have to call registerbyToken from service AuthService */
//                     AuthService.loginUser(authData, "facebook")
//                         .success(function () {
//                             $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
//                             pushNotifReg(UserData.getNotifData());
//                             findContacts(sortContacts);
//                             $state.go('tab.new');
//                         }).error(function () {
//                             $ionicPopup.alert({
//                                 title: "Problème lors de la création du compte",
//                                 template: "Réessaie plus tard"
//                             });
//                         });
//                 }, function (obj) {
//                     console.log(obj);
//                 });
//             };
//         }])

//     .controller('RegisterCtrl', ['$tastypie', '$ionicPopup', '$ionicLoading',
//                 'AuthService', 'sortContacts', '$scope', '$state', 'UserData',
//                 'pushNotifReg', '$ionicHistory',
//         function ($tastypie, $ionicPopup, $ionicLoading, AuthService,
//                   sortContacts, $scope, $state, UserData, pushNotifReg,
//                   $ionicHistory) {
//             "use strict";
//             $ionicHistory.nextViewOptions({
//                 disableAnimate: true,
//                 disableBack: true
//             });
//             $scope.data = {};
// //             $scope.regex_username = new RegExp("^[0-9A-Za-z-_@+.]{4,30}$");
//             $scope.regex_password = new RegExp("^.{6,20}$");
// 
//             $scope.register = function () {
//                 // check connection
//                 $ionicLoading.show({template: "Vérification de la connexion"});
//                 AuthService.pingAuth()
//                     .success(function () {
//                         $ionicLoading.hide();
//                         // create user account
//                         $ionicLoading.show({template: "Création de ton compte"});
//                         var authData = {'username': $scope.data.login,
//                                         'password': $scope.data.password,
//                                 };
//                         AuthService.registerUser(authData, false)
//                             .success(function () {
//                                 $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
//                                 pushNotifReg(UserData.getNotifData());
//                                 findContacts(sortContacts);
//                                 $state.go('picture');
//                                 $ionicLoading.hide();
//                             }).error(function (err) {
//                                 var message;
//                                 switch (err) {
//                                 case '10':
//                                     message = "Saisir un nom d'utilisateur et un mot de passe";
//                                     break;
//                                 case '200':
//                                     message = "Désolé, ce nom d'utilisateur est déjà pris.";
//                                     break;
//                                 case '150':
//                                     message = "Cet utilisateur a été désactivé. Contacte Woozup pour plus d'info.";
//                                     break;
//                                 default:
//                                     message = "Problème lors de la création de ton compte.";
//                                 }
//                                 $ionicPopup.alert({
//                                     title: "Problème lors de la création de ton compte",
//                                     template: message
//                                 });
//                                 $ionicLoading.hide();
//                             });
//                     })
//                     .error(function () {
//                         $state.go('network');
//                         $ionicLoading.hide();
//                     });
//             };
//         }])

//     .controller('LoginCtrl', ['$tastypie', '$ionicLoading', 'AuthService',
//                 '$ionicPopup', 'sortContacts', '$scope', '$state', 'UserData',
//                 'pushNotifReg', 'resetPassword', '$ionicHistory',
//         function ($tastypie, $ionicLoading, AuthService, $ionicPopup,
//                   sortContacts, $scope, $state, UserData, pushNotifReg,
//                   resetPassword, $ionicHistory) {
//             "use strict";
//             $ionicHistory.nextViewOptions({
//                 disableAnimate: true,
//                 disableBack: true
//             });
//             $scope.data = {};
//             $scope.login = function () {
//                 // check connection
//                 $ionicLoading.show({template: "Vérification de la connexion"});
//                 AuthService.pingAuth()
//                     .success(function () {
//                         $ionicLoading.hide();
//                         // login
//                         $ionicLoading.show({template: "Connexion"});
//                         var authData = {'username': $scope.data.login,
//                                         'password': $scope.data.password};
//                         AuthService.loginUser(authData, false)
//                             .success(function () {
//                                 $tastypie.setAuth(UserData.getUsername(), UserData.getApiKey());
//                                 pushNotifReg(UserData.getNotifData());
//                                 findContacts(sortContacts);
//                                 $state.go('tab.new');
//                                 $ionicLoading.hide();
//                             }).error(function () {
//                                 $ionicLoading.hide();
//                                 var alertPopup = $ionicPopup.alert({
//                                     title: "Problème de connexion",
//                                     template: "Vérifie ton login / mot de passe"
//                                 });
//                             });
//                     })
//                     .error(function () {
//                         $state.go('network');
//                         $ionicLoading.hide();
//                     });
//             };
//             $scope.reset = function () {
//                 $scope.data = {};
//                 var myPopup = $ionicPopup.show({
//                     template: '<input type="email" ng-model="data.email">',
//                     title: 'Saisie ton adresse email',
//                     subTitle: "Un email va t'être envoyé avec un lien pour changer ton mot de passe",
//                     scope: $scope,
//                     buttons: [
//                         { text: 'Annuler' },
//                         {
//                             text: "<b>Envoyer l'email</b>",
//                             type: 'button-positive',
//                             onTap: function(e) {
//                                 if (!$scope.data.email) {
//                                     //don't allow the user to close unless he enters email
//                                     e.preventDefault();
//                                 } else {
//                                     resetPassword({'email': $scope.data.email});
//                                 }
//                             }
//                         }
//                     ]
//                 });
//                 myPopup.then(function(res) {});
//             };
//         }])

