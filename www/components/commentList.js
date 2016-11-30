function CommentListController($tastypieResource, $state, AuthService) {
    "use strict";
    var commentResource, ctrl, nextPages, newComment;
    ctrl = this;
    nextPages = function (result) {
        var i;
        if (result) {
            for (i = 0; i < result.objects.length; i += 1) {
                ctrl.comments.push(result.objects[i]);
            }
        }
    };
    commentResource = new $tastypieResource('comments');
    ctrl.load = function () {
        commentResource.objects.$find({'event': ctrl.event.id}).then(
            function (result) {
                ctrl.comments = [];
                nextPages(result);
            }, function (error) {
                console.log(error);
                // verify authentication
                AuthService.checkUserAuth().success()
                    .error(function () {$state.go('network');});
            }
        ).finally(function() {
            ctrl.$broadcast('scroll.refreshComplete');
        });
    };
    ctrl.loadMore = function () {
        if (commentResource.page.meta && commentResource.page.meta.next) {
            commentResource.page.next().then(
                function (result) {
                    nextPages(result);
                }, function (error) {
                    console.log(error);
                    // verify authentication
                    AuthService.checkUserAuth().success()
                        .error(function () {$state.go('network');});
                }
            ).finally(function() {
                ctrl.$broadcast('scroll.infiniteScrollComplete');
            });
        } else {
            ctrl.$broadcast('scroll.infiniteScrollComplete');
        }
    };
    ctrl.sendComment = function(newComment) {
        if (newComment) {
            commentResource.objects.$create({
                event: 'api/v1/events/all/' + ctrl.event.id + '/',
                text: newComment
            }).$save().then(
                function(result){
                    ctrl.comments.push(result);
                    ctrl.newComment = '';
                    
                }, function(error){
                    console.log(error);
                }
            );
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
