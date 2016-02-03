/*jslint browser: true*/
/*global angular, cordova, StatusBar*/

angular.module('starter.services', [])
    .config(['$provide', '$tastypieProvider', function ($provide, $tastypieProvider) {
        "use strict";
        var hostname = 'http://www.woozup.social/',
            apiUrl = hostname + 'api/v1/';
// #### for debug
    //  var hostname = 'http://192.168.1.10:8000/',
//          hostname = 'http://localhost:8000/',
        //  apiUrl = hostname + 'api/v1/';
// #########
        $provide.value('apiUrl', apiUrl);
        $provide.value('hostname', hostname);
        $tastypieProvider.setResourceUrl(apiUrl);
    }])
    .factory('setlast', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (position) {
                var where = '{ "type": "Point", "coordinates": ['
                            + position.coords.latitude + ', ' + position.coords.longitude + '] }';
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http({
                    method: 'POST',
                    url: apiUrl + 'userposition/setlast/',
                    data: {'last': where},
                    timeout: 5000
                }).then(function successCallback(response) {
                }, function errorCallback(response) {
                });
            };
        }])
    .factory('sendInvite', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (inviteId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'invite/send/' + inviteId + '/');
            };
        }])
    .factory('ignoreInvite', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (inviteId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'invite/ignore/' + inviteId + '/');
            };
        }])
    .factory('inviteFriend', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (userId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'user/invite/' + userId + '/');
            };
        }])
    .factory('ignoreFriend', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (userId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'user/ignore/' + userId + '/');
            };
        }])
    .factory('acceptFriend', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (userId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'user/accept/' + userId + '/');
            };
        }])
    .factory('rejectFriend', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (userId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'user/reject/' + userId + '/');
            };
        }])
    .factory('sortContacts', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (contacts) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'contact/sort/', contacts);
            };
        }])
    .factory('logout', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function () {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.get(apiUrl + 'user/logout/');
            };
        }])
    .factory('pushNotifReg', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (data) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'user/push_notif_reg/', data);
            };
        }])
    .factory('resetPassword', ['$http', 'apiUrl',
        function ($http, apiUrl) {
            "use strict";
            return function (data) {
                $http.post(apiUrl + 'auth/reset_password/', data);
            };
        }])
    .factory('EventData', function () {
        "use strict";
        var data = {};
        return {
            setWhat: function (id) {
                data.what = id;
            },
            getWhat: function () {
                return data.what;
            },
            setWhen: function (datetime) {
                data.when = datetime;
            },
            getWhen: function () {
                return data.when;
            },
            setPlace: function (name, id) {
                data.location_name = name;
                data.location_id = id;
            },
            setAddress: function (address, lat, lng) {
                data.location_address = address;
                data.location_lat = lat;
                data.location_lng = lng;
            },
            getWhere: function () {
                return {'name' : data.location_name,
                        'address': data.location_address,
                        'id': data.location_id,
                        'lat': data.location_lat,
                        'lng': data.location_lng
                };
            }
        };
    })
    .factory('UserData', function () {
        "use strict";
        var data = {};
        return {
            setWhere: function (position) {
                data.where = position;
            },
            getWhere: function () {
                return data.where;
            },
            setUserId: function (userId) {
                data.userId = userId;
            },
            getUserId: function () {
                return parseInt(data.userId, 10);
            },
            setUserName: function (userName) {
                data.userName = userName;
            },
            getUserName: function () {
                return data.userName;
            },
            setApiKey: function (apiKey) {
                data.apiKey = apiKey;
            },
            getApiKey: function () {
                return data.apiKey;
            },
            setNotifData: function (regid, devName, devId, platform) {
                data.registrationId = regid,
                data.deviceName = devName,
                data.deviceId = devId,
                data.platform = platform
            },
            getNotifData: function () {
                return {'registration_id' : data.registrationId,
                        'name': data.deviceName,
                        'device_id': data.deviceId,
                        'platform': data.platform
                };
            }
        };
    })
    .factory('$localstorage', ['$window', function ($window) {
        "use strict";
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }])
    .service('InviteService', ['$q', '$http', '$localstorage', 'apiUrl',
        function ($q, $http, $localstorage, apiUrl) {
            "use strict";
            return {
                join: function (eventId) {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        userName = $localstorage.get('username'),
                        apiKey   = $localstorage.get('apikey');
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.post(apiUrl + 'events/friends/join/' + eventId + '/')
                        .then(function () {
                            deferred.resolve('succeeded');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('failed');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                leave: function (eventId) {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        userName = $localstorage.get('username'),
                        apiKey   = $localstorage.get('apikey');
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.post(apiUrl + 'events/friends/leave/' + eventId + '/')
                        .then(function () {
                            deferred.resolve('succeeded');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('failed');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                }
            };
    }])
    .service('ProfileService', ['$q', '$http', '$localstorage', 'apiUrl',
        function ($q, $http, $localstorage, apiUrl) {
            "use strict";
            return {
                setpicture: function (b64file) {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        userName = $localstorage.get('username'),
                        apiKey   = $localstorage.get('apikey');
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.post(apiUrl + 'userprofile/setpicture/', b64file)
                        .then(function () {
                            deferred.resolve('succeeded');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('failed');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                setprofile: function (profileData) {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        userName = $localstorage.get('username'),
                        apiKey   = $localstorage.get('apikey');
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.post(apiUrl + 'userprofile/setprofile/', profileData)
                        .then(function () {
                            deferred.resolve('succeeded');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('failed');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                }
            }
    }])
    .service('CameraService', ['$q', '$cordovaCamera',
        function ($q, $cordovaCamera) {
            "use strict";
            return {
                photoFromCamera: function () {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        options = {
                            quality: 75,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.CAMERA,
                        //       allowEdit: true,
                            encodingType: Camera.EncodingType.JPEG, //important for orientation
                        //       targetWidth: 300,
                        //       targetHeight: 300,
                        //       popoverOptions: CameraPopoverOptions,
                            saveToPhotoAlbum: false,
                            correctOrientation: true
                        };
                    $cordovaCamera.getPicture(options).then(
                        function (imageURI) {
//                             $scope.myImage = imageURI;
                            deferred.resolve(imageURI);
                        }, function (err) {
                            console.log(err);
                            deferred.reject('failed');
                        });
    //             $cordovaCamera.cleanup() // .then(...); // only for FILE_URI
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                photoFromGallery: function () {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        options = {
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            encodingType: Camera.EncodingType.PNG,
                            mediaType: Camera.MediaType.PICTURE
                        };
                    $cordovaCamera.getPicture(options).then(
                        function (imageURI) {
//                             $scope.myImage = imageURI;
                            deferred.resolve(imageURI);
                        }, function (err) {
                            console.log(err);
                            deferred.reject('failed');
                        });
    //             $cordovaCamera.cleanup() // .then(...); // only for FILE_URI
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                }
            }
    }])
    .service('AuthService', ['$q', '$http', '$localstorage', 'apiUrl', 'UserData',
        function ($q, $http, $localstorage, apiUrl, UserData) {
            "use strict";
            return {
                pingAuth: function () {
                    var deferred = $q.defer(),
                        promise  = deferred.promise;
//                         userId   = $localstorage.get('userid'),
//                         userName = $localstorage.get('username'),
//                         apiKey   = $localstorage.get('apikey');
//                     $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.get(apiUrl + 'auth/ping/')
                        .then(function () {
//                             UserData.setUserName(userName);
//                             UserData.setApiKey(apiKey);
//                             UserData.setUserId(userId);
                            deferred.resolve('success');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('error!');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                checkUserAuth: function () {
                    var deferred = $q.defer(),
                        promise  = deferred.promise,
                        userId   = $localstorage.get('userid'),
                        userName = $localstorage.get('username'),
                        apiKey   = $localstorage.get('apikey');
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
                    $http.get(apiUrl + 'user/check_auth/')
                        .then(function () {
                            UserData.setUserName(userName);
                            UserData.setApiKey(apiKey);
                            UserData.setUserId(userId);
                            deferred.resolve('Authenticated');
                        }, function (error) {
                            console.log(error);
                            deferred.reject('Not Authenticated!');
                        });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                loginUser: function (authData, social) {
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        command = apiUrl + 'auth/login_by_email/';
                    if (social) {
                        command = hostname + 'register-by-token/' + social + '/';
                    }
                    $http.post(command, authData
                        ).then(function (response) {
                        $localstorage.set('userid', response.data.userid);
                        $localstorage.set('username', response.data.username);
                        $localstorage.set('apikey', response.data.api_key);
                        UserData.setUserName(response.data.username);
                        UserData.setApiKey(response.data.api_key);
                        UserData.setUserId(response.data.userid);
                        deferred.resolve('Welcome!');
                    }, function (error) {
                        console.log(error);
                        deferred.reject('Wrong credentials!');
                    });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                },
                registerUser: function (authData) {
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        command = 'auth/register_by_email/';
                    $http.post(apiUrl + command, authData
                        ).then(function (response) {
                        $localstorage.set('userid', response.data.userid);
                        $localstorage.set('username', response.data.username);
                        $localstorage.set('apikey', response.data.api_key);
                        UserData.setUserName(response.data.username);
                        UserData.setApiKey(response.data.api_key);
                        UserData.setUserId(response.data.userid);
                        deferred.resolve('Welcome!');
                    }, function (error) {
                        console.log(error);
                        if (error.data) {
                            if (error.data.reason) {
                                console.log("server return error:", error.data.reason);
                            }
                            if (error.data.code) {
                                deferred.reject(error.data.code);
                            }
                        }
                        deferred.reject(0);
                    });
                    promise.success = function (fn) {
                        promise.then(fn);
                        return promise;
                    };
                    promise.error = function (fn) {
                        promise.then(null, fn);
                        return promise;
                    };
                    return promise;
                }
            };
        }]);
    // Race condition found when trying to use $ionicPlatform.ready in app.js and calling register to display id in AppCtrl.
    // Implementing it here as a factory with promises to ensure register function is called before trying to display the id.
//     .factory(("ionPlatform"), function( $q ){
//         var ready = $q.defer();
//
//         ionic.Platform.ready(function( device ){
//             ready.resolve( device );
//         });
//
//         return {
//             ready: ready.promise
//         }
//     })
