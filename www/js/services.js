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
// angular.module('starter.services', ['ionic', 'ngResource'])
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
