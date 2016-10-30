function RecordListController() {
}

angular.module('woozup').component('recordList', {
  templateUrl: 'components/recordList.html',
  controller: RecordListController,
  bindings: {
    records: '='
  }
});
