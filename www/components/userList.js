function UserListController(acceptFriend, rejectFriend) {
    this.yesaction = function (user) {
        console.log(user);
        this.users.splice(user.$index, 1);
//         this.users.splice(this.users.indexOf(user), 1);
        acceptFriend(user.id);
    };
    this.noaction = function (user) {
        this.users.splice(user.$index, 1);
//         this.users.splice(this.users.indexOf(user), 1);
        rejectFriend(user.id);
    };
}

angular.module('woozup').component('userList', {
    templateUrl: 'components/userList.html',
    controller: UserListController,
    bindings: {
        users: '<',
        displaybutton: '<',
        small: '<'
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
