/*jslint browser: true*/
/*global angular, cordova, StatusBar*/

angular.module('starter.services', [])
    .config(function ($provide, $tastypieProvider) {
        "use strict";
        var hostname = 'http://geoevent.herokuapp.com/',
            apiUrl = hostname + 'api/v1/';
        // for debug
//        var hostname = 'http://192.168.1.101:8000/',
//             hostname = 'http://localhost:8000/',
            apiUrl = hostname + 'api/v1/';
        // #########
        $provide.value('apiUrl', apiUrl);
        $provide.value('hostname', hostname);
        $tastypieProvider.setResourceUrl(apiUrl);
    })
    // Race condition found when trying to use $ionicPlatform.ready in app.js and calling register to display id in AppCtrl.
    // Implementing it here as a factory with promises to ensure register function is called before trying to display the id.
    .factory(("ionPlatform"), function( $q ){
        var ready = $q.defer();

        ionic.Platform.ready(function( device ){
            ready.resolve( device );
        });

        return {
            ready: ready.promise
        }
    })
    .factory('setlast', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (position) {
                var where = '{ "type": "Point", "coordinates": ['
                            + position.coords.latitude + ', ' + position.coords.longitude + '] }';
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'userposition/setlast/', {'last': where});
            };
        }])
    .factory('setpicture', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (b64file) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'userprofile/setpicture/', b64file);
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
    .factory('join', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (eventId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'events/friends/join/' + eventId + '/');
            };
        }])
    .factory('leave', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (eventId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'events/friends/leave/' + eventId + '/');
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
                $http.get(apiUrl + 'logout/');
            };
        }])
    .factory('gcmRegister', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (data) {
                if ( data.registration_id ) {
                    $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                    $http.post(apiUrl + 'user/gcm/', data);
                }
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
            setAddress: function (address, coords) {
                data.location_address = address;
                data.location_coords = coords;
            },
            getWhere: function () {
                return {'name' : data.location_name,
                        'address': data.location_address,
                        'id': data.location_id,
                        'coords': data.location_coords};
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
            setNotifData: function (regid, devName, devId) {
                data.registrationId = regid,
                data.deviceName = devName,
                data.deviceId = devId
            },
            getNotifData: function () {
                return {'registration_id' : data.registrationId,
                        'name': data.deviceName,
                        'device_id': data.deviceId};
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
    .service('CheckauthService',
             function ($q, $http, $localstorage, apiUrl, UserData) {
            "use strict";
            return {
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
                }
            };
        })
    .service('LoginService',
             function ($q, $http, apiUrl, hostname, $localstorage, UserData) {
            "use strict";
            return {
                loginUser: function (authData, social) {
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        command = apiUrl + 'auth/login/';
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
                }
            };
        })
        .service('RegisterService',
             function ($q, $http, apiUrl, $localstorage, UserData) {
            "use strict";
            return {
                registerUser: function (authData) {
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        command = 'auth/register/';
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
        });
