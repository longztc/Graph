define(["require", "exports"], function (require, exports) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * The type of the toolbar item.
         */
        (function (ToolbarItemType) {
            /**
             * Not a valid type.
             */
            ToolbarItemType[ToolbarItemType["None"] = 0] = "None";
            /**
             * An items that visually groups other toolbar items.
             */
            ToolbarItemType[ToolbarItemType["Group"] = 1] = "Group";
            /**
             * A toolbar button that opens a link.
             */
            ToolbarItemType[ToolbarItemType["OpenLinkButton"] = 2] = "OpenLinkButton";
            /**
             * A toolbar button that opens a blade.
             */
            ToolbarItemType[ToolbarItemType["OpenBladeButton"] = 3] = "OpenBladeButton";
            /**
             * A toolbar button that is associated to a command.
             */
            ToolbarItemType[ToolbarItemType["CommandButton"] = 4] = "CommandButton";
            /**
             * A toolbar button that opens a dialog before executing a command.
             */
            ToolbarItemType[ToolbarItemType["DialogButton"] = 5] = "DialogButton";
            /**
             * A toolbar button and can be toggled (between ON and OFF states).
             */
            ToolbarItemType[ToolbarItemType["ToggleButton"] = 6] = "ToggleButton";
        })(Main.ToolbarItemType || (Main.ToolbarItemType = {}));
        var ToolbarItemType = Main.ToolbarItemType;
    })(Main || (Main = {}));
    return Main;
});
