function BubblesController($interval) {
    "use strict";
    var ctrl = this;
    ctrl.bubbles = [];
    function addDiv() {
        var top   = Math.floor((Math.random() *  110 -  10 ));
        var left  = Math.floor((Math.random() *  110 -  10 ));
        var color = Math.floor((Math.random() * 1000 +   1 ));
        var size  = Math.floor((Math.random() *  100 + 100 ));
        ctrl.bubbles.push({'style':'{"background-color":"hsla(' + color +', 87%, 56%, 0.2)", "width":"' + size + 'px", "z-index":"0", "height":"' + size + 'px", "top":"' + top + '%", "left":"' + left + '%"}'});
        if (ctrl.bubbles.length > 20) {
            ctrl.bubbles.splice(1, 1);
        }
    }
    $interval(addDiv, 500);
}

angular.module('woozup').component('bubbles', {
    templateUrl: 'components/bubbles.html',
    controller: BubblesController,
    bindings: {
    }
});
