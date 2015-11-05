/*global FB, $, facebookConnectPlugin*/
/*jslint browser: true*/

var app = {
    // Application Constructor
    initialize: function() {
        'use strict';
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        'use strict';
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        'use strict';
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        'use strict';
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var fb_permissions = null;

app.initialize();

function fb_show_login() {
    'use strict';
    $('#fb-login').show();
    $('#fb-logout').hide();
    $('#fb-connected').hide();
}

function fb_show_logout() {
    'use strict';
    $('#fb-login').hide();
    $('#fb-logout').show();
    $('#fb-connected').show();
}

function fb_login() {
    'use strict';
    console.log("login with FB");
    facebookConnectPlugin.login( [],
        function (obj) {
            fb_get_perms();
            console.log("success");
            console.log(obj);
            fb_show_logout();
        },
        function (obj) {
            console.log("failure");
            console.log(obj);
        }
    );
}

function fb_logout() {
    'use strict';
    console.log("logout from FB");
    facebookConnectPlugin.logout(
        function (obj) {
            fb_permissions = null;
            console.log("propery disconnected from FB");
            console.dir(obj);
            fb_show_login();
        },
        function (obj) {
            console.log("something has failed while trying to disconnected from FB");
            console.dir(obj);
        }

    );
}

function fb_get_perms() {
    'use strict';
    facebookConnectPlugin.api("/me/permissions", [],
        function (success) {
            var i;
            console.log("perms ");
            console.dir(success);
            fb_permissions = [];
            for (i = 0; i < success.data.length; i += 1) {
                if (success.data[i].status === 'granted') {
                    fb_permissions.push(success.data[i].permission);
                }
            }
        }, function (error) {
            console.log("failed to retrieve permissions");
            console.dir(error);
        }
    );
}

function fb_friends() {
    'use strict';

    var p = "user_friends", u = "/me/friends";
    facebookConnectPlugin.login([p],
        function (obj) {
            console.log(p + " granted");
            facebookConnectPlugin.api(u, [p],
                function (obj) {
                    console.log("OK ?");
                    console.log(obj);
                },
                function (obj) {
                    console.log("Failed : "  + obj);
                }
            );
        }, function (obj) {
            console.log("perm not granted ?");
        }
    );
}

function fb_photos_granted(perm) {
    'use strict';
    var u = '/me/photos/uploaded?fields=created_time,images,picture';
    /*  picture is a thumbnail of 100px
    and images is a list of image with various ratio */
    facebookConnectPlugin.api(u, [perm],
        function (success) {
            var i = 0;
            console.log("photos ok");
            console.dir(success);
            for (i = 0; i < success.data.length; i += 1) {
                var item = success.data[i];
                var img = $('<img />', {
                    id: item.id,
                    src: item.picture
                });
                img.appendTo($('#fb-pictures'));
                /*
                $('#fb-picture').attr('src', "https://graph.facebook.com/" + success.data[i].id);
                console.log("https://graph.facebook.com/" + success.data[i].id);
                */
            }
        },
        function (error) {
            console.log("photos bad");
    });
}

function fb_photos() {
    'use strict';
    var perm = 'user_photos';

    if (fb_permissions.indexOf(perm) > -1) {
        fb_photos_granted(perm);
    } else {
        /* permission not found, we must ask to user */
        facebookConnectPlugin.login([perm],
            function (success) {
                /* refresh permissions ? */
                console.dir(success);
                fb_get_perms();
                fb_photos_granted(perm);
            },
            function (error) {
                console.log("Failed to retrieve " + perm + " permission");
        });
    }
}

function fb_init() {
    'use strict';
    if (window.cordova === undefined) {
        /* browser stuff: we must wait that FB is properly set before trying using Facebook API */
        setTimeout(fb_init, 500);
        return;
    }
    if (window.cordova.platformId === "browser") {
        if (typeof(FB) !== "undefined") {
            console.log("FB init");
            window.facebookConnectPlugin.browserInit("948253448566545");
        } else {
            setTimeout(fb_init, 500);
            return;
        }
    }
    facebookConnectPlugin.getLoginStatus(
        function (obj) {
            console.log('Connected');
            console.dir(obj);
            if (obj.authResponse === undefined) {
                fb_show_login();
            } else {
                fb_get_perms();
                fb_show_logout();
            }
        },
        function (obj) {
            console.log('Not connected');
            console.dir(obj);
        }
    );
}


$(function () {
    'use strict';
    setTimeout(fb_init, 1000);
    $('#fb-login').bind("click", fb_login);
    $('#fb-logout').bind("click", fb_logout);
    $('#fb-friends').bind("click", fb_friends);
    $('#fb-permissions').bind("click", fb_get_perms);
    $('#fb-photos').bind("click", fb_photos);
});
