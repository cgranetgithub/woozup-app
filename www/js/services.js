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
// var doLogin = function() {
//     $http.post(domain+'auth/login/',
//             {'username':'33667045021', 'password':'test'})
//     .success(function(data, status, headers, config) {
//     })
// };
// 
angular.module('starter.services', [])
.config(function($provide, $tastypieProvider) {
    var apiUrl = 'http://geoevent.herokuapp.com/api/v1/';
//     var apiUrl = 'http://127.0.0.1:8000/api/v1/'
    var authName = '+33667045021';
    var authKey = '51a3dffafa923c080532d4fe8d1e670262941fbf';
    $provide.value('apiUrl', apiUrl);
    $provide.value('authName', authName);
    $provide.value('authKey', authKey);
    $tastypieProvider.setResourceUrl(apiUrl);
    $tastypieProvider.setAuth(authName, authKey);
})
.factory('invite', ['$http', 'apiUrl', 'authName', 'authKey',
                    function($http, apiUrl, authName, authKey) {
    return function(userId) {
        auth = {'username':authName, 'api_key':authKey};
        $http.defaults.headers.common['Authorization'] = 'ApiKey '.concat(authName, ':', authKey);
        $http.post(apiUrl + 'user/invite/' + userId + '/');
    };
}])
.factory('accept', ['$http', 'apiUrl', 'authName', 'authKey',
                    function($http, apiUrl, authName, authKey) {
    return function(userId) {
        auth = {'username':authName, 'api_key':authKey};
        $http.defaults.headers.common['Authorization'] = 'ApiKey '.concat(authName, ':', authKey);
        $http.post(apiUrl + 'user/accept/' + userId + '/');
    };
}])
.factory('reject', ['$http', 'apiUrl', 'authName', 'authKey',
                    function($http, apiUrl, authName, authKey) {
    return function(userId) {
        auth = {'username':authName, 'api_key':authKey};
        $http.defaults.headers.common['Authorization'] = 'ApiKey '.concat(authName, ':', authKey);
        $http.post(apiUrl + 'user/reject/' + userId + '/');
    };
}])
.factory('eventData', function() {
    var eventData = {};
    eventData.setWhen = function(datetime){
        eventData.when = datetime;
    };
    eventData.setWhat = function(id){
        eventData.what = id;
    };
    return eventData;
})

// .factory('invite', ['tre', function(tre) { return tre; }])
// 
// .factory('Categories', function($resource, $http) {
//     return $resource(
//         domain + 'category/:id',
//         {'username':username, 'api_key':api_key},
//         {query: {
//             method: 'GET',
//             isArray: true,
//             transformResponse: tastypieDataTransformer($http)
//         }}
//     );
// })
// 
// .factory('Types', function($resource, $http) {
//     return $resource(
//         domain + 'event_type/:id',
//         {'username':username, 'api_key':api_key},
//         {query: {
//             method: 'GET',
//             isArray: true,
//             transformResponse: tastypieDataTransformer($http)
//         }}
//     );
// })
// 
// .factory('Events', function($resource, $http) {
//     return $resource(
//         domain + 'event/:id/',
//         {'username':username, 'api_key':api_key},
//         {query: {
//             method: 'GET',
//             isArray: true,
//             transformResponse: tastypieDataTransformer($http)
//         },
//         get: {
//             method: 'GET',
//             isArray: false,
//             transformResponse: tastypieDataTransformer($http)
//         }}
//     );
// });
