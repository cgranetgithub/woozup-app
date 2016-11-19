function EventListController($tastypieResource, $state, InviteService) {
    "use strict";
    this.cancelEvent = function (event) {
        var myevent = new $tastypieResource('events/mine');
        myevent.objects.$delete({id: event.id});
        this.reload();
    };
    this.editEvent = function (event) {
        $state.go("event", {"eventId":event.id});
    };
    this.commentEvent = function (event) {
    };
    this.joinEvent = function (event) {
        InviteService.join(event.id);
        this.reload();
    };
    this.leaveEvent = function (event) {
        InviteService.leave(event.id);
        this.reload();
    };
}

angular.module('woozup').component('eventList', {
  templateUrl: 'components/eventList.html',
  controller: EventListController,
  bindings: {
    events: '<',
    userid: '<',
    reload: '='
  }
});
