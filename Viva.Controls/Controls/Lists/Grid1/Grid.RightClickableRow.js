var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./Grid"], function (require, exports, Util, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window;
        var RightClickableRowExtension = (function (_super) {
            __extends(RightClickableRowExtension, _super);
            /**
             * Creates the right clickable row extension.
             *
             * @param options Options associated with the extension.
             */
            function RightClickableRowExtension(options) {
                this._options = options || {};
                if (this._options.disabled === undefined) {
                    this._options.disabled = ko.observable(false);
                }
                _super.call(this);
            }
            Object.defineProperty(RightClickableRowExtension.prototype, "options", {
                /**
                 * Gets the options of the plugin.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See interface.
             */
            RightClickableRowExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("contextmenu.azcGrid", "tbody[class!=azc-grid-empty] tr", this._eventRightClick = function (evt) {
                    var eventObject;
                    if (that._options.disabled()) {
                        return;
                    }
                    if (evt.which === 3 /* Right */) {
                        if (evt.ctrlKey) {
                            // Do not trigger a right click if CTRL was pressed.
                            return;
                        }
                        eventObject = {
                            rowMetadata: ko.dataFor(this),
                            clientX: evt.clientX,
                            clientY: evt.clientY
                        };
                        that._widget._trigger("rowRightClick", Util.cloneEvent(evt, "rowRightClick"), eventObject, evt.target);
                        that._widget.options.events("rowRightClick", eventObject);
                    }
                });
            };
            /**
             * See interface.
             */
            RightClickableRowExtension.prototype.beforeDestroy = function () {
                if (this._eventRightClick) {
                    this._widget.element.off("contextmenu.azcGrid", this._eventRightClick);
                    this._eventRightClick = null;
                }
            };
            /**
             * See parent.
             */
            RightClickableRowExtension.prototype.getName = function () {
                return RightClickableRowExtension.Name;
            };
            /**
             * Name of the extension.
             */
            RightClickableRowExtension.Name = "azc-grid-rightClickableRow";
            return RightClickableRowExtension;
        })(Grid.Extension);
        Main.RightClickableRowExtension = RightClickableRowExtension;
    })(Main || (Main = {}));
    return Main;
});
