var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarGroupType", "./ToolbarItemType", "./ToolbarItem"], function (require, exports, ToolbarGroupType, ToolbarItemType, ToolbarItem) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * See interface.
         */
        var ToolbarGroup = (function (_super) {
            __extends(ToolbarGroup, _super);
            function ToolbarGroup(groupType) {
                if (groupType === void 0) { groupType = 0 /* None */; }
                _super.call(this, 1 /* Group */);
                /**
                 * See interface.
                 */
                this.items = ko.observableArray();
                this.groupType = groupType;
            }
            return ToolbarGroup;
        })(ToolbarItem.ToolbarItem);
        Main.ToolbarGroup = ToolbarGroup;
    })(Main || (Main = {}));
    return Main;
});
