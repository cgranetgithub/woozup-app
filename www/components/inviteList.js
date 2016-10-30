function InviteListController() {
}

angular.module('woozup').component('inviteList', {
  templateUrl: 'components/inviteList.html',
  controller: InviteListController,
  bindings: {
    invites: '='
  }
});
