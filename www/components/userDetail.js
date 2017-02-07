function UserDetailController(UserService, $scope, GenericResourceList, $tastypieResource, UserData) {
    var ctrl = this;
    if (ctrl.userId != UserData.getUserId()) {
        ctrl.notMe = true;
    } else {
        ctrl.notMe = false;
    }
//     ctrl.toogle2events = function() {
//         ctrl.showEvents = true;
//         ctrl.showFriends = false    ;
//     };
//     ctrl.toogle2friends = function() {
//         ctrl.showEvents = false;
//         ctrl.showFriends = true;
//     };
//     ctrl.toogle2events();
//     UserService.getFriendsCount(ctrl.userId).then(
//         function(result) {
//             ctrl.friends = angular.fromJson(result['data']);
//         }, function(error) {
//             console.log(error);
//         }
//     );
    UserService.getEventsCount(ctrl.userId).then(
        function(result) {
            ctrl.events = angular.fromJson(result['data']);
        }, function(error) {
            console.log(error);
        }
    );
//     ctrl.friendsResource = new $tastypieResource('friends/mine');
//     ctrl.onSearchChange = function () {
//         ctrl.resourceList = null;
//         GenericResourceList.search(ctrl.friendsResource, {})
//         .then(function(list) {ctrl.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
//     };
//     ctrl.onSearchChange('');
//     ctrl.loadMore = function () {
//         GenericResourceList.loadMore(ctrl.friendsResource, ctrl.resourceList)
//         .then(function(list) {ctrl.resourceList=list;})
//         .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
//     };
    ctrl.eventsResource = new $tastypieResource('event', {order_by:"-start"});
}

angular.module('woozup').component('userDetail', {
    templateUrl: 'components/userDetail.html',
    controller: UserDetailController,
    bindings: {
        user: '<',
        userId: '<',
        buttonClicked: '&'
    }
});
