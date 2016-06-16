define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * The type of the toolbar group.
         */
        (function (ToolbarGroupType) {
            /**
             * Default group
             */
            ToolbarGroupType[ToolbarGroupType["None"] = 0] = "None";
            /**
             * Group has a collection of toggle button items which behave like radio group.
             */
            ToolbarGroupType[ToolbarGroupType["OptionsGroup"] = 1] = "OptionsGroup";
        })(Main.ToolbarGroupType || (Main.ToolbarGroupType = {}));
        var ToolbarGroupType = Main.ToolbarGroupType;
    })(Main || (Main = {}));
    return Main;
});
