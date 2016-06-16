var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarButton"], function (require, exports, ToolbarButton) {
    var Main;
    (function (Main) {
        "use strict";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates an executable button.
             *
             * @param type The type of the button.
             */
            function ViewModel(type) {
                _super.call(this, type);
            }
            return ViewModel;
        })(ToolbarButton.ViewModel);
        Main.ViewModel = ViewModel;
    })(Main || (Main = {}));
    return Main;
});
