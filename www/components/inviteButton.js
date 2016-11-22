function InviteButtonController(LinkService, acceptFriend, rejectFriend) {
    var ctrl = this, link, myStatus, otherStatus;
    ctrl.showButton = false;
    LinkService.getLink(ctrl.userId).then(
        function(result) {
            var link = angular.fromJson(result['data']);
            if (link) {
                if (link.receiver.id == ctrl.userId) {
                    myStatus = link.sender_status;
                    otherStatus = link.receiver_status;
                } else {
                    otherStatus = link.sender_status;
                    myStatus = link.receiver_status;
                };
                if (myStatus != "ACC") {
                    ctrl.showButton = true;
                    ctrl.buttonTitle = "Se connecter";
                    ctrl.buttonAction = acceptFriend;
                } else if (otherStatus == "PEN") {
                    ctrl.showButton = true;
                    ctrl.buttonTitle = "Demande déjà envoyée";
                    ctrl.buttonAction = null;
                } else if (otherStatus == "ACC") {
                    ctrl.showButton = true;
                    ctrl.buttonTitle = "Bloquer";
                    ctrl.buttonAction = rejectFriend;
                };
            } else {
                ctrl.showButton = true;
                ctrl.buttonTitle = "Se connecter";
                ctrl.buttonAction = acceptFriend;
            };
        }, function(error) {
            console.log(error);
        }
    );
}

angular.module('woozup').component('inviteButton', {
    templateUrl: 'components/inviteButton.html',
    controller: InviteButtonController,
    bindings: {
        userId: '<',
        showButton: '<'
    }
});
