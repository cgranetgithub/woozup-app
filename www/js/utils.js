function findContacts() {
    "use strict";
    var options,
        filter = ["displayName", "name"],
        lastCheck, //window.localStorage.contact_sync,
        curDate = new Date();
    if (!navigator.contacts) { return; }
//                     if (lastCheck && (curDate.getTime() / 1000) - lastCheck < 7 * 3600 * 24) {
//                         return;
//                     }
    options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    navigator.contacts.find(filter, function (contacts) {
        if (contacts === null) {
            console.log("No contact retrieved");
            return;
        }
        var stuff = [],
            helper = function (tab, k) {
                var t = [], i;
                k = k || "value";
                if (!tab) { return t; }
                for (i = 0; i < tab.length; i += 1) {
                    t.push(tab[i][k]);
                }
                return t;
            };
        contacts.forEach(function (entry) {
            if (!entry.phoneNumbers || !entry.phoneNumbers.length) {
//                || !entry.emails || !entry.emails.length) {
//                 console.log("skipping " + entry.name.formatted);
                return;
            }

            stuff.push({
                'name': entry.name.formatted,
//                 'emails': helper(entry.emails).join(', '),
                'numbers': helper(entry.phoneNumbers).join(', '),
                'photo': helper(entry.photos).join(', '),
            });
        });
        // send to server by chunk
        var i, j, temparray, chunk = 30;
        for (i=0, j=stuff.length; i<j; i+=chunk) {
            temparray = stuff.slice(i,i+chunk);
//             sortContacts(temparray);
            return temparray;
        }
    }, function () {
        // an error has occured, try to resync next day
        window.localStorage.contact_sync = curDate - 6 * 3600 * 24;
        console.log("Error");
    }, options);
};

angular.module('woozup.services')
.factory('sortContacts', ['$http', 'apiUrl', 'UserData', function ($http, apiUrl, UserData) {
    "use strict";
    return function () {
        var contacts = findContacts();
        $http.defaults.headers.common.Authorization = 'ApiKey '.concat(UserData.getUsername(), ':', UserData.getApiKey());
        $http.post(apiUrl + 'contact/sort/', contacts);
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
