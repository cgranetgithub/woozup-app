function UserDetailController(UserService) {
    var ctrl = this;
    UserService.getFriendsCount(ctrl.userId).then(
        function(result) {
            ctrl.friends = angular.fromJson(result['data']);
        }, function(error) {
            console.log(error);
        }
    );
    UserService.getEventsCount(ctrl.userId).then(
        function(result) {
            ctrl.events = angular.fromJson(result['data']);
        }, function(error) {
            console.log(error);
        }
    );
}

angular.module('woozup').component('userDetail', {
    templateUrl: 'components/userDetail.html',
    controller: UserDetailController,
    bindings: {
        user: '<',
        userId: '<'
    }
});
