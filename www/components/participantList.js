function ParticipantListController(acceptFriend, rejectFriend, $state, GenericResourceList, $scope) {
    "use strict";
    var ctrl = this;
}

angular.module('woozup').component('participantList', {
    templateUrl: 'components/participantList.html',
    controller: ParticipantListController,
    bindings: {
        userid: '<',
        users: '<'
    }
});
