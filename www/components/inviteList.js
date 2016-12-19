function InviteListController(sendInvite, ignoreInvite, $scope, GenericResourceList, $tastypieResource) {
    var ctrl = this, invitesResource;
    ctrl.send = function (invite) {
        ctrl.invites.splice(ctrl.invites.indexOf(invite), 1);
        sendInvite(invite.id);
    };
    ctrl.ignore = function (invite) {
        ctrl.invites.splice(ctrl.invites.indexOf(invite), 1);
        ignoreInvite(invite.id);
    };
    ctrl.search = '';
    ctrl.onSearchChange = function (word) {
        ctrl.invites = null;
        invitesResource = new $tastypieResource('invite', {status__exact: 'NEW', order_by: 'name', name__icontains: word});
        GenericResourceList.search(invitesResource)
        .then(function(list) {ctrl.invites=list;})
        .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    ctrl.onSearchChange('');
    ctrl.loadMore = function () {
        GenericResourceList.loadMore(invitesResource, ctrl.invites)
        .then(function(list) {ctrl.invites=list;})
        .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
    };
    
}

angular.module('woozup').component('inviteList', {
  templateUrl: 'components/inviteList.html',
  controller: InviteListController,
  bindings: {
  }
});
