function UserDetailController() {
}

angular.module('woozup').component('userDetail', {
    templateUrl: 'components/userDetail.html',
    controller: UserDetailController,
    bindings: {
        user: '<',
        friends: '<',
        events: '<'
    }
});
