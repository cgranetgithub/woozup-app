function UserListController(acceptFriend, rejectFriend, $state, GenericResourceList, $scope) {
    "use strict";
    var ctrl = this, load, canLoadMore;
    canLoadMore = function() {
        if (ctrl.usersResource.page.meta && ctrl.usersResource.page.meta.next) {
            ctrl.showButton = true;
        } else {
            ctrl.showButton = false;
        }
    };
    ctrl.onSearchChange = function (word) {
        GenericResourceList.search(ctrl.usersResource, {first_name__icontains: word})
        .then(function(list) {
            ctrl.users=list;
            canLoadMore();
        })
        .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    ctrl.onSearchChange('');
    ctrl.loadMore = function () {
        GenericResourceList.loadMore(ctrl.usersResource, ctrl.users)
        .then(function(list) {
            ctrl.users=list;
            canLoadMore();
        })
        .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
    };
        
    this.yesaction = function(user) {
        this.users.splice(user.$index, 1);
//         this.users.splice(this.users.indexOf(user), 1);
        acceptFriend(user.id);
    };
    this.noaction = function(user) {
        this.users.splice(user.$index, 1);
//         this.users.splice(this.users.indexOf(user), 1);
        rejectFriend(user.id);
    };
    this.editUser = function(user) {
        $state.go("user", {"userId":user.id});
    };
}

angular.module('woozup').component('userList', {
    templateUrl: 'components/userList.html',
    controller: UserListController,
    bindings: {
        userid: '<',
        displayButton: '<',
        small: '<',
        refresher: '<',
        moreManual: '<',
        moreInfinite: '<',
        searchEnabled: '<',
        usersResource: '<'
    }
});

//     this.inviteFriendButton = function (user) {
//         acceptFriend(user.id);
//     };
//     this.ignoreFriendButton = function (user) {
//         this.users.splice(user.$index, 1);
//         rejectFriend(user.id);
//     };

//     this.inviteFriendButton = function (user) {
//         inviteFriend(user.id);
//     };
//     this.ignoreFriendButton = function (user) {
//         this.users.splice(this.users.indexOf(user), 1);
//         ignoreFriend(user.id);
//     };
