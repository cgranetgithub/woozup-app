function EventListController($tastypieResource, $state, InviteService, GenericResourceList, $scope) {
    "use strict";
    var ctrl = this, load, nextPages, canLoadMore;
//     today = new Date();
    canLoadMore = function() {
        if (ctrl.eventsResource.page.meta && ctrl.eventsResource.page.meta.next) {
            ctrl.showButton = true;
        } else {
            ctrl.showButton = false;
        }
    };
    nextPages = function (list, result) {
        var i, j, event;
        if (result) {
            for (i = 0; i < result.objects.length; i += 1) {
                event = result.objects[i];
                event.ownership = false;
                if (event.owner.id == ctrl.userId) {
                    event.ownership = true;
                }
                j = 0;
                event.participate = false;
                while (event.participants[j]) {
                    if (event.participants[j].id == ctrl.userId) {
                        event.participate = true;
                        break;
                    }
                    j++;
                }
                list.push(event);
            }
        }
        return list;
    };
//     today.setHours(today.getUTCHours()-2);
//     today.setMinutes(0);
//     ctrl.eventsResource = new $tastypieResource('event',
//                         {order_by: 'start', start__gte: today, 'canceled': false});
    ctrl.load = function () {
        GenericResourceList.search(ctrl.eventsResource, nextPages)
        .then(function(list) {
            ctrl.events=list;
            canLoadMore();
        })
        .finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    };
    ctrl.load();
    ctrl.loadMore = function () {
        GenericResourceList.loadMore(ctrl.eventsResource, ctrl.events)
        .then(function(list) {
            ctrl.events=list;
            canLoadMore();
        })
        .finally(function() {$scope.$broadcast('scroll.infiniteScrollComplete');});
    };
    
//     ctrl.cancelEvent = function (event) {
//     // don't forget calendar sync if reactivate this code
//         var myevent = new $tastypieResource('event');
//         myevent.objects.$delete({id: event.id}).finally(function(){ctrl.load();});
//     };
    ctrl.editEvent = function (event) {
        $state.go("event", {"eventId":event.id});
    };
//     ctrl.joinEvent = function (event) {
//     // don't forget calendar sync if reactivate this code
//         InviteService.join(event.id).finally(function(){ctrl.load();});
//     };
//     ctrl.leaveEvent = function (event) {
//     // don't forget calendar sync if reactivate this code
//         InviteService.leave(event.id).finally(function(){ctrl.load();});
//     };
}

angular.module('woozup').component('eventList', {
  templateUrl: 'components/eventList.html',
  controller: EventListController,
  bindings: {
    userId: '<',
    refresher: '<',
    moreManual: '<',
    moreInfinite: '<',
    eventsResource: '<'
  }
});
