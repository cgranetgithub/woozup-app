/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/*jslint browser:true*/
/*global monitorConnection, checkConnection, Connection*/
/*global start_watchPosition, stop_watchPosition, geoloc_options*/
/*global fill_contact*/
/*global $*/
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        /* now monitor state of network */
        app.offline();
        if (checkConnection() === Connection.NONE) {
            app.offline();
        } else {
            app.online();
        }
        
        monitorConnection(app.online, app.offline);
        start_watchPosition(app.receivedGPS, app.errorGPS);

        $('#btn_show_contacts').bind('click', function() {
            $('#main_page').hide();
            $('#contact_page').show();
            fill_contact();
        });

        $('#gps_accurate').bind('click', function() {
            console.log('OnOff updated');
            stop_watchPosition();
            app.errorGPS();
            geoloc_options.enableHighAccuracy = $('#gps_accurate').attr('checked');
            start_watchPosition(app.receivedGPS, app.errorGPS);
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    online: function() {
        var state = document.getElementById('networkState');
        var receivedElement = state.querySelector('p');
        receivedElement.setAttribute('style', 'background-color: green');
    },
    offline: function() {
        var state = document.getElementById('networkState');
        var receivedElement = state.querySelector('p');
        receivedElement.setAttribute('style', 'background-color: red');
    },
    receivedGPS: function(position) {
        var state = document.getElementById('geolocState');
        var receivedElement = state.querySelector('p');
        receivedElement.setAttribute('style', 'background-color: green');

        state = document.getElementById('geolocPosition');
        state.setAttribute('style', 'background-color: green');
        var date = new Date(position.timestamp);
        state.innerHTML = position.coords.latitude
                        + ", "
                        + position.coords.longitude
                        + "<br />"
                        + " at "
                        + date;
    },
    errorGPS: function(positionError) {
        var state = document.getElementById('geolocState');
        var receivedElement = state.querySelector('p');
        receivedElement.setAttribute('style', 'background-color: red');

        if (positionError !== undefined) {
            state = document.getElementById('geolocPosition');
            state.setAttribute('style', 'background-color: red');
            state.innerHTML = positionError.message;
        }
    }
};

app.initialize();
