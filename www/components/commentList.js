function CommentListController($tastypieResource, GenericResourceList) {
    "use strict";
    var commentResource, ctrl, newComment, canLoadMore;
    ctrl = this;
    ctrl.load = function () {
        commentResource = new $tastypieResource('comment', {'event': ctrl.event.id});
        GenericResourceList.search(commentResource)
        .then(function(list) {
            ctrl.comments=list;
            ctrl.showButton = GenericResourceList.canLoadMore(commentResource);
        })
        .finally(function() {ctrl.$broadcast('scroll.refreshComplete');});
    };
    ctrl.loadMore = function () {
        GenericResourceList.loadMore(commentResource, ctrl.comments)
        .then(function(list) {
            ctrl.comments=list;
            ctrl.showButton = GenericResourceList.canLoadMore(commentResource);
        })
        .finally(function() {ctrl.$broadcast('scroll.infiniteScrollComplete');});
    };
    ctrl.sendComment = function(newComment) {
        if (newComment) {
            commentResource.objects.$create({
                event: 'api/v1/event/' + ctrl.event.id + '/',
                text: newComment
            }).$save().then(
                function(result){
//                     ctrl.comments.push(result);
                    ctrl.newComment = '';
                    
                }, function(error){
                    console.log(error);
                }
            ).finally(function(){ctrl.load()});
        }
    };
    ctrl.$onChanges = function (changesObj) {
        if (changesObj.event) {
            ctrl.load();
        }
    };
}

angular.module('woozup').component('commentList', {
  templateUrl: 'components/commentList.html',
  controller: CommentListController,
  bindings: {
//     comments: '<',
    event: '<'
//     reload: '='
  }
});
