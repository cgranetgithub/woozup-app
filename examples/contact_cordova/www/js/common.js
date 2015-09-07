/*jslint browser:true, devel:true */
/*global Connection*/
/*global ContactFindOptions, ContactError*/
/*global $*/

'use strict';

/* for network-information */
function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    console.log('Connection type: ' + states[networkState]);
    return networkState;
}

function monitorConnection(online, offline) {
    document.addEventListener("offline", offline, false);
    document.addEventListener("online", online, false);
}

/* for geolocation */

var geoloc_watchId;
var geoloc_options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 5000
};

function getCurrentPosition(on_success, on_error) {
    navigator.geolocation.getCurrentPosition(on_success, on_error, geoloc_options); 
}

function start_watchPosition(on_success, on_error) {
    if (geoloc_watchId !== undefined) {
        return;
    }
    geoloc_watchId = navigator.geolocation.watchPosition(on_success, on_error);
}

function stop_watchPosition() {
    if (geoloc_watchId !== undefined) { 
        navigator.geolocation.clearWatch(geoloc_watchId);
        geoloc_watchId = undefined;
    }
}

var contact_in_progress = false;
function fill_contact() {
    var p = $('#contact_list');
    if ( contact_in_progress ) {
        console.log("Already in progress");
        return;
    }
    console.log("In progress");
    contact_in_progress = true;
    function onSuccess(contacts) {
        var i, j;
        var txt = "";
        contact_in_progress = false;

        if (contacts === null) {
            console.log("contacts is null");
            return;
        }

        /* ANDROID has : 
        id
        rawId
        displayName
        name
        nickname
        phoneNumbers
        emails
        addresses
        ims
        organizations
        birthday
        note
        photos
        categories
        urls
        */

        txt = "<ul>";
        for (i = 0; i < contacts.length; i++) {
            txt += "<li>" 
                 + contacts[i].id  + " " 
                 + contacts[i].name.formatted + " ";
            if (contacts[i].phoneNumbers && contacts[i].phoneNumbers.length > 0) {
                txt += "(M)";
                for(j = 0; j < contacts[i].phoneNumbers.length; j++) {
                    console.log(contacts[i].phoneNumbers[j].value);
                }
            }
            if (contacts[i].photos && contacts[i].photos.length > 0) {
                txt += "(P)";
                for(j = 0; j < contacts[i].photos.length; j++) {
                    console.log(contacts[i].photos[j].value);
                    if (contacts[i].photos[j].type === "url") { 
                        txt += "<img src='" + contacts[i].photos[j].value + "' />";
                    } else {
                        txt += "inline";
                    }
                }
            }
            if (contacts[i].emails && contacts[i].emails.length > 0) {
                txt += "(E)";
                for(j = 0; j < contacts[i].emails.length; j++) {
                    console.log(contacts[i].emails[j].value);
                }
            }
            txt += "</li>";
        }
        txt += "</ul>";
        p.html(txt);
    }

    function onError(contactError) {
        var msg = "";
        switch(contactError.code) {
            case ContactError.UNKNOWN_ERROR:
                msg = 'ContactError.UNKNOWN_ERROR';
                break;
            case ContactError.INVALID_ARGUMENT_ERROR:
                msg = 'ContactError.INVALID_ARGUMENT_ERROR';
                break;
            case ContactError.PENDING_OPERATION_ERROR:
                msg = "ContactError.PENDING_OPERATION_ERROR";
                break;
            case ContactError.IO_ERROR:
                msg = "ContactError.IO_ERROR";
                break;
            case ContactError.NOT_SUPPORTED_ERROR:
                msg = "ContactError.NOT_SUPPORTED_ERROR";
                break;
            case ContactError.PERMISSION_DENIED_ERROR:
                msg = "ContactError.PERMISSION_DENIED_ERROR";
                break;
            default:
                msg = "!!!!!";
        }
        console.log(contactError.code + " / " + msg);
        p.html(msg);
    }

    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var filter = ["displayName", "name"];
    navigator.contacts.find(filter, onSuccess, onError, options);
}
