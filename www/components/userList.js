function UserListController() {
}

angular.module('woozup').component('userList', {
  templateUrl: 'components/userList.html',
  controller: UserListController,
  bindings: {
    users: '='
  }
});
