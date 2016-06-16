/// <reference path="../../../../Definitions/knockout.extensionstypes.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid.FocusableRow", "../../../Util/Util", "./Grid"], function (require, exports, FocusableRowGrid, Util, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, rowSelector = "> .azc-grid-container .azc-grid-full > tbody > tr[role=row]:not([aria-disabled=true])", rowHoveredDataBindClass = "css: { \"azc-external-hovered\": $data === $root.func.getPlugin(\"azc-grid-hoverableRow\")._hoveredRowMetadata() }", bodyCellDataBindAttribute = "attr: { \"data-activatable\": activatable(), tabindex: activatable() && !$parent.disabled() ? \"0\" : null, \"data-grid-cell-hovered\": $parent.hovered() === $data.itemKey ? \"true\" : \"false\" }";
        var FocusableRowHoverExtension = (function (_super) {
            __extends(FocusableRowHoverExtension, _super);
            /**
             * Creates the activateable row extension.
             *
             * @param options Options associated with the extension.
             */
            function FocusableRowHoverExtension(options) {
                this._options = options || {};
                this._hoverIDKey = this._options.hoverIDKey || ko.observable();
                this._hoveredID = this._options.hoveredID || ko.observable();
                this._hoveredRowMetadata = ko.observable(null);
                this._backupIdMax = 0;
                _super.call(this);
            }
            Object.defineProperty(FocusableRowHoverExtension.prototype, "options", {
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
            FocusableRowHoverExtension.prototype.beforeCreate = function () {
                this._focusableRowExtension = this._widget.getPlugin(FocusableRowGrid.FocusableRowExtension.Name);
                this._focusableRowExtension.externalHover = true;
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore");
                bodyRowsCore.addAttribute("tr", "data-bind", rowHoveredDataBindClass);
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    hovered: ko.observable(false)
                };
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.afterAttachEvents = function () {
                var _this = this;
                var that = this;
                this._widget.element.on("rowFocus.azcHovered", this._eventRowFocus = function (evt, FocusableRowEventObject) {
                    that._onRowFocus(evt, FocusableRowEventObject);
                }).on("mouseenter.azcHovered", rowSelector, this._eventRowMouseEnter = function (evt) {
                    var rowMetadata;
                    if (!_this._preventMouseHandler && evt.currentTarget) {
                        rowMetadata = ko.dataFor(evt.currentTarget);
                        that._hoveredRowMetadata(rowMetadata);
                    }
                }).on("mouseleave.azcHovered", rowSelector, this._eventRowMouseLeave = function (evt) {
                    if (!_this._preventMouseHandler) {
                        that._hoveredRowMetadata(null);
                    }
                }).on("blur.azcHovered", "tbody.azc-grid-groupdata", this._eventBlur = function (evt) {
                    if (that._focusedByEvent && that._hoveredRowMetadata()) {
                        that._hoveredRowMetadata(null);
                        that._focusedByEvent = false;
                    }
                }).on("focus.azcHovered", rowSelector, this._eventFocus = function (evt) {
                    if (!that._hoveredRowMetadata()) {
                        var rowMetadata;
                        if (evt.currentTarget) {
                            rowMetadata = ko.dataFor(evt.currentTarget);
                            that._hoveredRowMetadata(rowMetadata);
                            that._focusedByEvent = true;
                        }
                    }
                });
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.afterCreate = function () {
                var _this = this;
                var computedhoveredRow, rowMetadata, that = this, currentHoverID;
                this._rebuildIdRowMetadaMap();
                this._widget._addDisposablesToCleanUp(this._widget.options.items.subscribeArrayChanged(function (addItem) {
                    currentHoverID = ko.utils.unwrapObservable(addItem[_this._hoverIDKey()]);
                    if (!currentHoverID) {
                        currentHoverID = (_this._backupIdMax++).toString();
                    }
                    rowMetadata = _this._widget.getRowMetadata(addItem);
                    rowMetadata.hoverID = currentHoverID;
                    _this._idRowMetadataMap[currentHoverID] = rowMetadata;
                }, function (removedItem) {
                    rowMetadata = _this._widget.getRowMetadata(removedItem);
                    delete _this._idRowMetadataMap[rowMetadata.hoverID];
                }));
                this._widget._addDisposablesToCleanUp(this._hoveredID.subscribe(function (value) {
                    _this.hoverRowByHoverId(value);
                }));
                this._widget._addDisposablesToCleanUp(this._hoveredRowMetadata.subscribe(function (rowMetadata) {
                    var hoverID = rowMetadata ? rowMetadata.hoverID : null;
                    if (hoverID !== _this._hoveredID.peek()) {
                        _this._hoveredID(hoverID);
                    }
                }));
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.getOrder = function () {
                return 30;
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.getDependencies = function () {
                return [new FocusableRowGrid.FocusableRowExtension(this.options)];
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.beforeDestroy = function () {
                if (this._eventRowFocus) {
                    this._widget.element.off("rowFocus.azcHovered", this._eventRowFocus);
                    this._eventRowFocus = null;
                }
                if (this._eventRowMouseEnter) {
                    this._widget.element.off("mouseenter.azcHovered", this._eventRowMouseEnter);
                    this._eventRowMouseEnter = null;
                }
                if (this._eventRowMouseLeave) {
                    this._widget.element.off("mouseleave.azcHovered", this._eventRowMouseLeave);
                    this._eventRowMouseLeave = null;
                }
                if (this._eventBlur) {
                    this._widget.element.off("blur.azcHovered", "tbody.azc-grid-groupdata", this._eventBlur);
                    this._eventBlur = null;
                }
                if (this._eventFocus) {
                    this._widget.element.off("focus.azcHovered", rowSelector, this._eventFocus);
                    this._eventFocus = null;
                }
                this._resetPreventMouseHandlerTimer();
            };
            /**
             * See parent.
             */
            FocusableRowHoverExtension.prototype.getName = function () {
                return FocusableRowHoverExtension.Name;
            };
            /**
             * See interface.
             */
            FocusableRowHoverExtension.prototype.hoverRowByHoverId = function (hoverID) {
                var rowMetadata = this._getRowMetadataFromHoverID(hoverID);
                this.hoverRowByRowMetadata(rowMetadata);
            };
            FocusableRowHoverExtension.prototype.hoverRowByRowMetadata = function (rowMetadata, evt) {
                if (this._hoveredRowMetadata.peek() !== rowMetadata) {
                    if (this._inHoverRowByRowMetadata) {
                        var getCurrentCallStack = function () {
                            var error = new Error();
                            if (!error["stack"]) {
                                try {
                                    throw new Error();
                                }
                                catch (ex) {
                                    error = ex;
                                }
                            }
                            return error["stack"] || "";
                        };
                        console.error(" FocusableRowHoverExtension hoverRowByRowMetadata go into recursive called. Please verify." + getCurrentCallStack());
                        return;
                    }
                    try {
                        this._inHoverRowByRowMetadata = true;
                        this._hoveredRowMetadata(rowMetadata);
                        if (rowMetadata) {
                            var eventObject = {
                                hovered: rowMetadata
                            };
                            this._widget._trigger("rowHover", evt ? Util.cloneEvent(evt, "rowHover") : $.Event("rowHover"), eventObject);
                            this._widget.options.events("hover", eventObject);
                        }
                    }
                    finally {
                        this._inHoverRowByRowMetadata = false;
                    }
                }
            };
            FocusableRowHoverExtension.prototype._resetPreventMouseHandlerTimer = function () {
                this._preventMouseHandler = false;
                if (this._preventMouseHandlerTimer !== null) {
                    global.clearTimeout(this._preventMouseHandlerTimer);
                    this._preventMouseHandler = null;
                }
            };
            FocusableRowHoverExtension.prototype._onRowFocus = function (evt, focusableRowEventObject) {
                var _this = this;
                var focusableRowHoverMetadata, prevHoveredRowMetadata = this._hoveredRowMetadata(), hoverIDKey = this._hoverIDKey();
                this._focusedByEvent = !!evt;
                // NOTE: we need this timer here because when keyboard process might result in scroll.
                // Various grid user have different way of result in scroll. When scroll happen, We get MouseEnter and MouseLeave Event.
                // For example, filterCombo, trigger its own scorll into View after row focus changed.
                // That scroll into View will cost a lot of mouse enter and leave. Thus visually, change
                // hover background to under the mouse.
                // To prevent this, we put mouseHander in quarantine when KeyFoucsed is processed.
                if (this._focusedByEvent) {
                    this._resetPreventMouseHandlerTimer();
                    this._preventMouseHandler = true;
                    this._preventMouseHandlerTimer = global.setTimeout(function () {
                        _this._resetPreventMouseHandlerTimer();
                    }, 250);
                }
                if (focusableRowEventObject.focused) {
                    focusableRowHoverMetadata = focusableRowEventObject.focused;
                    this.hoverRowByRowMetadata(focusableRowHoverMetadata, evt);
                }
                else {
                    this.hoverRowByRowMetadata(null);
                }
            };
            FocusableRowHoverExtension.prototype._getRowMetadataFromHoverID = function (hoverID) {
                return !Util.isNullOrUndefined(hoverID) ? this._idRowMetadataMap[hoverID] : null;
            };
            FocusableRowHoverExtension.prototype._rebuildIdRowMetadaMap = function () {
                var _this = this;
                var rowMetadatas = this._widget._getAllRowMetadata(), hoverIdKey = this._hoverIDKey.peek(), currentHoverID, idRowMetadataMap = {};
                this._backupIdMax = 0;
                rowMetadatas.forEach(function (rowMetadata) {
                    currentHoverID = ko.utils.unwrapObservable(rowMetadata.item[hoverIdKey]);
                    if (!currentHoverID) {
                        currentHoverID = (_this._backupIdMax++).toString();
                    }
                    else {
                        if (typeof currentHoverID !== "string") {
                            currentHoverID = currentHoverID.toString();
                        }
                    }
                    idRowMetadataMap[currentHoverID] = rowMetadata;
                    rowMetadata.hoverID = currentHoverID;
                });
                this._idRowMetadataMap = idRowMetadataMap;
            };
            /**
             * Name of the extension.
             */
            FocusableRowHoverExtension.Name = "azc-grid-hoverableRow";
            return FocusableRowHoverExtension;
        })(Grid.Extension);
        Main.FocusableRowHoverExtension = FocusableRowHoverExtension;
    })(Main || (Main = {}));
    return Main;
});
