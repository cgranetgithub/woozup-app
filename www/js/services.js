/*jslint browser: true*/
/*global angular, cordova, StatusBar*/

// var tastypieDataTransformer = function ($http) {
//     return $http.defaults.transformResponse.concat([
//         function (data, headersGetter) {
//             return data.objects;
//         }
//     ])
// };
// 
// var domain = "http://geoevent.herokuapp.com/api/v1/"
// // var domain = "http://127.0.0.1:8000/api/v1/"
// var api_key = "51a3dffafa923c080532d4fe8d1e670262941fbf"
// var username = '33667045021'
// 
// var doLogin = function () {
//     $http.post(domain+'auth/login/',
//             {'username':'33667045021', 'password':'test'})
//     .success(function (data, status, headers, config) {
//     })
// };
// 
angular.module('starter.services', [])
    .config(function ($provide, $tastypieProvider) {
        "use strict";
        var hostname = 'http://geoevent.herokuapp.com/';
//         var hostname = 'http://192.168.1.86:8000/'
        var apiUrl = hostname + 'api/v1/';
        $provide.value('apiUrl', apiUrl);
        $provide.value('hostname', hostname);
        $tastypieProvider.setResourceUrl(apiUrl);
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
                $http.post(apiUrl + 'friendsevents/join/' + eventId + '/');
            };
        }])
    .factory('leave', ['$http', 'apiUrl', 'UserData',
        function ($http, apiUrl, UserData) {
            "use strict";
            return function (eventId) {
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUserName(), ':', UserData.getApiKey());
                $http.post(apiUrl + 'friendsevents/leave/' + eventId + '/');
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
            setWhere: function (position) {
                data.where = position;
            },
            getWhere: function () {
                return data.where;
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
                return data.userId;
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
                        command = hostname + 'register_by_access_token/';
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
                registerUser: function (authData, social) {
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
                        console.log("server return error:", error.data.reason);
                        deferred.reject(error.data.code);
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
