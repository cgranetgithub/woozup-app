function resultToList(list, result) {
    var i;
    if (result) {
        for (i = 0; i < result.objects.length; i += 1) {
            list.push(result.objects[i]);
        }
    }
    return list;
};


angular.module('woozup.services')

.service('GenericResourceList', ['$q', 'AuthService', '$state', function ($q, AuthService, $state) {
    "use strict";
    return {
        search: function (resource, nextPages) {
//         search: function (resource, params, nextPages) {
            nextPages = nextPages || resultToList
//             params = params || {}
            var deferred = $q.defer(),
                promise  = deferred.promise;
//             resource.objects.$find(params).then(
            resource.objects.$find().then(
                function (result) {
                    var list = [];
                    list = nextPages(list, result);
                    deferred.resolve(list);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('network');});
                }
            );
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
        loadMore: function (resource, list, nextPages) {
            nextPages = nextPages || resultToList
            var deferred = $q.defer(),
                promise  = deferred.promise;
            if (resource.page.meta && resource.page.meta.next) {
                resource.page.next().then(
                    function (result) {
                        list = nextPages(list, result);
                        deferred.resolve(list);
                    }, function (error) {
                        console.log(error);
                        deferred.reject(error);
                        // verify authentication
                        AuthService.checkUserAuth().success()
                            .error(function () {$state.go('network');});
                    })
            } else {
                deferred.resolve(list);
            }
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
        canLoadMore: function(resource) {
            if (resource.page.meta && resource.page.meta.next) {
                return true;
            } else {
                return false;
            }
        }
    };
}]);



function helper(tab, k) {
    var t = [], i;
    k = k || "value";
    if (!tab) { return t; }
    for (i = 0; i < tab.length; i += 1) {
        t.push(tab[i][k]);
    }
    return t;
};

angular.module('woozup.services')
.service('Contacts', ['$http', 'apiUrl', 'UserData', '$q', function ($http, apiUrl, UserData, $q) {
    "use strict";
    return {
        retrieve: function () {
            console.log('start');
            var deferred = $q.defer(),
                promise  = deferred.promise;
            // contacts founds (by "navigator.contacts.find")
            function onSuccess(contacts) {
                console.log('Found ' + contacts.length + ' contacts.');
                if (contacts === null) {
                    console.log("No contact retrieved");
                    deferred.reject(0);
                    return 0;
                }
                var stuff = [];
                contacts.forEach(function (entry) {
                    if (!entry.phoneNumbers || !entry.phoneNumbers.length) {
                        console.log("skip contact with no number");
                        return;
                    }
                    try {
                        stuff.push({
                            'name': entry.name.formatted,
                            'numbers': helper(entry.phoneNumbers).join(', '),
                            'photo': helper(entry.photos).join(', '),
                        });
                    } catch(e) {
                        console.log(e);
                    }
                });
                // send to server by chunk
                var i, j, temparray, chunk = 30;
                $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
                for (i=0, j=stuff.length; i<j; i+=chunk) {
                    temparray = stuff.slice(i,i+chunk);
                    $http.post(apiUrl + 'contact/sort/', temparray)
                    .then(function(success){
                        console.log('post');
                    }, function(error){
                        console.log(error);
                    });
                }
                console.log('end');
                deferred.resolve(stuff.length);
                return stuff.length;
            };
            
            // error while finding contacts (by "navigator.contacts.find")
            function onError(contactError) {
                console.log(contactError);
                deferred.reject(-1);
                return -1;
            };

            if (navigator.contacts) {
                console.log('cordova contact available');
                // find all contacts using cordova contacts
                var options      = new ContactFindOptions();
                options.filter   = "";
                options.multiple = true;
                options.desiredFields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumbers, navigator.contacts.fieldType.photos];
                options.hasPhoneNumber = true;
                var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
                navigator.contacts.find(fields, onSuccess, onError, options);
            } else {
                console.log('cordova contact not available');
                deferred.reject(-1);
            }
                
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };
            console.log('end');
            return promise;
        }
    };
}]);

/* DEBUG STUFF : */
// function fb_init() {
//     'use strict';
//     if (window.cordova === undefined) {
        /* browser stuff: we must wait that FB is properly set before trying using Facebook API */
//         setTimeout(fb_init, 500);
//         return;
//     }
//     if (window.cordova.platformId === "browser") {
//         if (typeof (FB) !== "undefined") {
//             console.log("FB init");
//             window.facebookConnectPlugin.browserInit("948253448566545");
//         } else {
//             setTimeout(fb_init, 500);
//             return;
//         }
//     }
//     facebookConnectPlugin.getLoginStatus(
//         function (obj) {
//             console.log('Connected');
//         },
//         function (obj) {
//         }
//     );
// }
//
// (function () {
//     'use strict';
//     setTimeout(fb_init, 1000);
// })();

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

// function findContacts() {
//     "use strict";
//     var options,
//         filter = ["displayName", "name"],
//         lastCheck, //window.localStorage.contact_sync,
//         curDate = new Date();
//     if (!navigator.contacts) { return; }
// //                     if (lastCheck && (curDate.getTime() / 1000) - lastCheck < 7 * 3600 * 24) {
// //                         return;
// //                     }
//     options = new ContactFindOptions();
//     options.filter = "";
//     options.multiple = true;
//     navigator.contacts.find(filter, function (contacts) {
//         if (contacts === null) {
//             console.log("No contact retrieved");
//             return;
//         }
//         var stuff = [],
//             helper = function (tab, k) {
//                 var t = [], i;
//                 k = k || "value";
//                 if (!tab) { return t; }
//                 for (i = 0; i < tab.length; i += 1) {
//                     t.push(tab[i][k]);
//                 }
//                 return t;
//             };
//         contacts.forEach(function (entry) {
//             if (!entry.phoneNumbers || !entry.phoneNumbers.length) {
// //                || !entry.emails || !entry.emails.length) {
// //                 console.log("skipping " + entry.name.formatted);
//                 return;
//             }
// 
//             stuff.push({
//                 'name': entry.name.formatted,
// //                 'emails': helper(entry.emails).join(', '),
//                 'numbers': helper(entry.phoneNumbers).join(', '),
//                 'photo': helper(entry.photos).join(', '),
//             });
//         });
// //         console.log(stuff);
//         return stuff;
// //         // send to server by chunk
// //         var i, j, temparray, chunk = 30;
// //         for (i=0, j=stuff.length; i<j; i+=chunk) {
// //             temparray = stuff.slice(i,i+chunk);
// // //             sortContacts(temparray);
// //             console.log(temparray);
// //             return temparray;
// //         }
//     }, function () {
//         // an error has occured, try to resync next day
//         window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
//         console.log("Error");
//     }, options);
// };