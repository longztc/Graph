var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarItemType", "../Base/Base"], function (require, exports, ToolbarItemType, Base) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * See interface.
         */
        var ToolbarItem = (function (_super) {
            __extends(ToolbarItem, _super);
            /**
             * Creates a toolbar item.
             */
            function ToolbarItem(type) {
                _super.call(this);
                /**
                 * See interface.
                 */
                this.type = 0 /* None */;
                /**
                 * See interface.
                 */
                this.visible = ko.observable(true);
                /**
                 * See interface.
                 */
                this.unauthorizedMessage = ko.observable();
                if (!ToolbarItemType.ToolbarItemType[type]) {
                    throw new Error("Invalid toolbar item type specified.");
                }
                this.type = type;
            }
            /**
             * See interface.
             */
            ToolbarItem.prototype.unauthorized = function (message) {
                if (!message) {
                    message = "No access";
                }
                this.unauthorizedMessage(message);
            };
            return ToolbarItem;
        })(Base.ViewModel);
        Main.ToolbarItem = ToolbarItem;
    })(Main || (Main = {}));
    return Main;
});
