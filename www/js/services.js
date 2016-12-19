/*jslint browser: true, white: true*/
/*global angular, cordova, StatusBar, Camera, backend_url*/

angular.module('woozup.services', ['ngResourceTastypie'])
.config(['$provide', '$tastypieProvider', function ($provide, $tastypieProvider) {
    "use strict";
    var hostname = backend_url,
        apiUrl = hostname + 'api/v1/';
    $provide.value('apiUrl', apiUrl);
    $provide.value('hostname', hostname);
//     $tastypieProvider.setResourceUrl(apiUrl);
    
    $tastypieProvider.add('woozup', {
            url: apiUrl,
            username: 'username',
            apikey: 'apikey'
    });
}])
.factory('setlast', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (position) {
        var where = '{ "type": "Point", "coordinates": ['
                    + position.coords.latitude + ', ' + position.coords.longitude + '] }';
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
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
.factory('sendInvite', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (inviteId) {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'invite/send/' + inviteId + '/');
    };
}])
.factory('ignoreInvite', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (inviteId) {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'invite/ignore/' + inviteId + '/');
    };
}])
.factory('acceptFriend', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (userId) {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'user/accept/' + userId + '/');
    };
}])
.factory('rejectFriend', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (userId) {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'user/reject/' + userId + '/');
    };
}])
.factory('logout', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function () {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.get(apiUrl + 'user/logout/');
    };
}])
.factory('pushNotifReg', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function (data) {
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'user/push_notif_reg/', data);
    };
}])
.factory('resetPassword', ['$http', 'apiUrl', function ($http, apiUrl) {
    "use strict";
    return function (data) {
        $http.post(apiUrl + 'auth/reset_password/', data);
    };
}])
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
        getUsername: function () {
            return data.userName;
        },
        setApiKey: function (apiKey) {
            data.apiKey = apiKey;
        },
        getApiKey: function () {
            return data.apiKey;
        },
        setNotifData: function (regid, devName, devId, platform) {
            data.registrationId = regid;
            data.deviceName = devName;
            data.deviceId = devId;
            data.platform = platform;
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
.service('LinkService', ['$q', '$http', '$localstorage', 'apiUrl', function ($q, $http, $localstorage, apiUrl) {
    "use strict";
    return {
        getLink: function (userId) {
            var deferred = $q.defer(),
                promise  = deferred.promise,
                userName = $localstorage.get('username'),
                apiKey   = $localstorage.get('apikey');
            $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
            $http.get(apiUrl + 'link/withuser/' + userId + '/')
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
.service('UserService', ['$q', '$http', '$localstorage', 'apiUrl', function ($q, $http, $localstorage, apiUrl) {
    "use strict";
    return {
        getFriendsCount: function (userId) {
            var deferred = $q.defer(),
                promise  = deferred.promise,
                userName = $localstorage.get('username'),
                apiKey   = $localstorage.get('apikey');
            $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
            $http.get(apiUrl + 'user/friendscount/' + userId + '/')
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
        getEventsCount: function (userId) {
            var deferred = $q.defer(),
                promise  = deferred.promise,
                userName = $localstorage.get('username'),
                apiKey   = $localstorage.get('apikey');
            $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
            $http.get(apiUrl + 'user/eventscount/' + userId + '/')
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
.service('InviteService', ['$q', '$http', '$localstorage', 'apiUrl', function ($q, $http, $localstorage, apiUrl) {
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
                    deferred.reject(error);
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
                    deferred.reject(error);
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
.service('ProfileService', ['$q', '$http', '$localstorage', 'apiUrl', function ($q, $http, $localstorage, apiUrl) {
    "use strict";
    return {
        setpicture: function (b64file) {
            var deferred = $q.defer(),
                promise  = deferred.promise,
                userName = $localstorage.get('username'),
                apiKey   = $localstorage.get('apikey');
            $http.defaults.headers.common.Authorization = 'ApiKey '.concat(userName, ':', apiKey);
            $http.post(apiUrl + 'profile/setpicture/', b64file)
                .then(function () {
                    deferred.resolve('succeeded');
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
            $http.post(apiUrl + 'user/setprofile/', profileData)
                .then(function () {
                    deferred.resolve('succeeded');
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
.service('CameraService', ['$q', '$cordovaCamera', function ($q, $cordovaCamera) {
    "use strict";
    return {
        photoFromCamera: function () {
            var deferred = $q.defer(),
                promise  = deferred.promise,
                options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG, //important for orientation
                        targetWidth: 300,
                        targetHeight: 300,
                //       popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: false,
                    cameraDirection: Camera.Direction.FRONT
                };
            $cordovaCamera.getPicture(options).then(
                function (imageURI) {
//                             $scope.myImage = imageURI;
                    deferred.resolve(imageURI);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
//                             encodingType: Camera.EncodingType.PNG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: true,
//                             encodingType: Camera.EncodingType.JPEG, //important for orientation
                    targetWidth: 300,
                    targetHeight: 300
                };
            $cordovaCamera.getPicture(options).then(
                function (imageURI) {
//                             $scope.myImage = imageURI;
                    deferred.resolve(imageURI);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
    };
}])
.service('AuthService', ['$q', '$http', '$localstorage', 'apiUrl', 'UserData', '$tastypie', function ($q, $http, $localstorage, apiUrl, UserData, $tastypie) {
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
                    deferred.reject(error);
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
                .then(function (res) {
                    $tastypie.setProviderAuth('woozup', userName, apiKey)
                    UserData.setUserName(userName);
                    UserData.setApiKey(apiKey);
                    UserData.setUserId(userId);
                    deferred.resolve(res);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
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
//                         command = apiUrl + 'auth/login_by_email/';
                command = apiUrl + 'auth/login/';
            if (social) {
                command = apiUrl + 'register-by-token/' + social + '/';
            }
            $http.post(command, authData
                ).then(function (response) {
                $tastypie.setProviderAuth('woozup', response.data.username, response.data.api_key)
                $localstorage.set('userid', response.data.userid);
                $localstorage.set('username', response.data.username);
                $localstorage.set('apikey', response.data.api_key);
                UserData.setUserName(response.data.username);
                UserData.setApiKey(response.data.api_key);
                UserData.setUserId(response.data.userid);
                deferred.resolve('Welcome!');
            }, function (error) {
                console.log(error);
                deferred.reject(error);
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
                command = 'auth/register/';
            $http.post(apiUrl + command, authData
                ).then(function (response) {
                $tastypie.setProviderAuth('woozup', response.data.username, response.data.api_key)
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
        },
        getCode: function (authData) {
            var deferred = $q.defer(),
                promise = deferred.promise,
                command = 'auth/get_code/';
            $http.post(apiUrl + command, authData
                ).then(function (response) {
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
        },
        verifCode: function (authData) {
            var deferred = $q.defer(),
                promise = deferred.promise,
                command = 'auth/verif_code/';
            $http.post(apiUrl + command, authData
                ).then(function (response) {
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
        },
        isRegistered: function (authData) {
            var deferred = $q.defer(),
                promise = deferred.promise,
                command = 'auth/is_registered/';
            $http.post(apiUrl + command, authData
                ).then(function (response) {
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
        },
        resetPassword: function (authData) {
            var deferred = $q.defer(),
                promise = deferred.promise,
                command = 'auth/reset_password/';
            $http.post(apiUrl + command, authData
                ).then(function (response) {
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
