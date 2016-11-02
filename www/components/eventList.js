function EventListController() {
}

angular.module('woozup').component('eventList', {
  templateUrl: 'components/eventList.html',
  controller: EventListController,
  bindings: {
    events: '<'
  }
});
