function InviteListController(sendInvite, ignoreInvite) {
    this.send = function (invite) {
        this.invites.splice(this.invites.indexOf(invite), 1);
        sendInvite(invite.id);
    };
    this.ignore = function (invite) {
        this.invites.splice(this.invites.indexOf(invite), 1);
        ignoreInvite(invite.id);
    };
}

angular.module('woozup').component('inviteList', {
  templateUrl: 'components/inviteList.html',
  controller: InviteListController,
  bindings: {
    invites: '<'
  }
});
