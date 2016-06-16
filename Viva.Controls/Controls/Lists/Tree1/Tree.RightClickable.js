var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./Tree"], function (require, exports, Util, Tree) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window;
        var RightClickableExtension = (function (_super) {
            __extends(RightClickableExtension, _super);
            /**
             * Creates the right clickable extension.
             */
            function RightClickableExtension() {
                _super.call(this);
            }
            /**
             * See interface.
             */
            RightClickableExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("contextmenu.azcTreeView", ".azc-treeView-node", this._eventRightClick = function (evt) {
                    var eventObject, item;
                    if (evt.which === 3 /* Right */) {
                        if (evt.ctrlKey) {
                            // Do not trigger a right click if CTRL was pressed.
                            return;
                        }
                        item = ko.dataFor(this);
                        eventObject = {
                            item: item,
                            path: that._widget._buildPath(item),
                            clientX: evt.clientX,
                            clientY: evt.clientY
                        };
                        that._widget._trigger("itemRightClick", Util.cloneEvent(evt, "itemRightClick"), eventObject);
                        that._widget.options.events("itemRightClick", eventObject);
                    }
                });
            };
            /**
             * See interface.
             */
            RightClickableExtension.prototype.beforeDestroy = function () {
                if (this._eventRightClick) {
                    this._widget.element.off("contextmenu.azcTreeView", this._eventRightClick);
                    this._eventRightClick = null;
                }
            };
            /**
             * See parent.
             */
            RightClickableExtension.prototype.getName = function () {
                return RightClickableExtension.Name;
            };
            /**
             * Name of the extension.
             */
            RightClickableExtension.Name = "azc-treeView-rightClickable";
            return RightClickableExtension;
        })(Tree.Extension);
        Main.RightClickableExtension = RightClickableExtension;
    })(Main || (Main = {}));
    return Main;
});
