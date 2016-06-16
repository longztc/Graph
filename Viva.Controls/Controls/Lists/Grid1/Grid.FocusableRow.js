var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "../../../Util/ArrayUtil", "./Grid"], function (require, exports, Util, ArrayUtil, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, bodyRowsCoreDataBindAttribute = "attr: { \"aria-disabled\": disabled, \"data-grid-focusable\": true }", rowFocusDataBindAttribute = "attr: { tabindex: focused() ? \"0\" : null }", rowFocusDataBindClass = "css: { \"azc-row-disabled\": disabled() }", themeHoverClass = "azc-has-hover";
        var FocusableRowExtension = (function (_super) {
            __extends(FocusableRowExtension, _super);
            /**
             * Creates the focusable row extension.
             *
             * @param options Options associated with the extension.
             */
            function FocusableRowExtension(options) {
                this._options = options || {};
                if (this._options.focusable === undefined) {
                    this._options.focusable = ko.observable(true);
                }
                _super.call(this);
            }
            Object.defineProperty(FocusableRowExtension.prototype, "options", {
                /**
                 * Gets the options of the plugin.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            FocusableRowExtension.isEditableControl = function (element) {
                return element.is("input") || element.is("textarea") || element.is("select") || element.is("keygen");
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.afterCreate = function () {
                var _this = this;
                this._focusableComputed = ko.computed(function () {
                    if (_this.options.focusable()) {
                        _this._widget.element.attr("tabindex", 0);
                    }
                    else {
                        _this._widget.element.removeAttr("tabindex");
                    }
                });
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore");
                bodyRowsCore.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyRowsCore.addAttribute("tr", "data-bind", this._getRowFocusDataBindAttribute());
                bodyRowsCore.addAttribute("tr", "data-bind", rowFocusDataBindClass);
                if (!this.externalHover) {
                    bodyRowsCore.addAttribute("tr", "class", themeHoverClass);
                }
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    disabled: ko.observable(false),
                    focused: ko.observable(false)
                };
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.getOrder = function () {
                return 10;
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcGrid", "tbody tr[data-grid-focusable=true]:not([aria-disabled=true])", this._eventClick = function (evt) {
                    // We do not focus the row if we have the focus already in the row.
                    // This is mostly for Chrome which would blink the focus or if you focus in a input box.
                    if (!$.contains(this, global.document.activeElement)) {
                        var data = ko.dataFor(this);
                        // Rare care where the row might have changed while we were clicking, then we should not focus that row.
                        if (data) {
                            that._focusRow(this, data, evt);
                        }
                    }
                }).on("keydown.azcGrid", this._eventKeyDown = function (evt) {
                    var gridSelector = ".azc-grid", rowSelector = "tr[data-grid-focusable]", notDisabled = ":not([aria-disabled=true])", currentTarget = $(evt.target), grid = currentTarget.closest(gridSelector), isTopGrid = currentTarget.is(gridSelector), currentRow = !isTopGrid ? currentTarget.closest(rowSelector) : null, adjacentRow;
                    if (FocusableRowExtension.isEditableControl(currentTarget)) {
                        // We don't do anything if we are editing something
                        return;
                    }
                    switch (evt.which) {
                        case 38 /* Up */:
                            // Try to get the previous selectable row
                            adjacentRow = that._findPreviousFocusable(grid, currentRow);
                            evt.preventDefault();
                            break;
                        case 40 /* Down */:
                            // Try to get the next selectable row
                            adjacentRow = that._findNextFocusable(grid, currentRow);
                            evt.preventDefault();
                            break;
                    }
                    if (adjacentRow && adjacentRow.length) {
                        that._focusRow(adjacentRow, ko.dataFor(adjacentRow[0]), evt);
                    }
                }).on("mousedown.azcGrid", this._eventMouseDown = function () {
                    that._widget.element.addClass("azc-grid-mousedown");
                    // No need to remove the event, it will be removed automatically after one mouse up
                    // If the grid gets destroyed, calling this method won't do anything wrong.
                    $("body").one("mouseup", function () {
                        if (that._widget && that._widget.element) {
                            that._widget.element.removeClass("azc-grid-mousedown");
                        }
                    });
                });
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.beforeDestroy = function () {
                if (this._focusableComputed) {
                    this._focusableComputed.dispose();
                    this._focusableComputed = null;
                }
                if (this._eventClick) {
                    this._widget.element.off("click.azcGrid", this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcGrid", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
                if (this._eventMouseDown) {
                    this._widget.element.off("mousedown.azcGrid", this._eventMouseDown);
                    this._eventMouseDown = null;
                }
                this._widget.element.removeAttr("tabindex").removeClass("azc-grid-mousedown");
            };
            /**
             * See parent.
             */
            FocusableRowExtension.prototype.getName = function () {
                return FocusableRowExtension.Name;
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.focusRowByRowMetadata = function (rowMetadata) {
                var htmlRow = ArrayUtil.first(this._widget.element.find("tbody tr").toArray(), function (row) {
                    return ko.dataFor(row) === rowMetadata;
                });
                if (htmlRow) {
                    this._focusRow(htmlRow, rowMetadata);
                }
            };
            FocusableRowExtension.prototype._getRowFocusDataBindAttribute = function () {
                return rowFocusDataBindAttribute;
            };
            FocusableRowExtension.prototype._findPreviousFocusable = function (grid, row, wrapAround) {
                if (wrapAround === void 0) { wrapAround = true; }
                var root = row ? row.closest("table.azc-grid-full") : grid.find("table.azc-grid-full").eq(0), rowList = this._getFocusableList(root), i;
                if (row) {
                    for (i = rowList.length - 1; i >= 0; i--) {
                        if (row[0] === rowList[i]) {
                            if (i > 0) {
                                return $(rowList[i - 1]);
                            }
                        }
                    }
                }
                // If we didn't find the previous one, then we return the last one (when wrapAround is true)
                return wrapAround ? $(rowList[rowList.length - 1]) : null;
            };
            FocusableRowExtension.prototype._findNextFocusable = function (grid, row, wrapAround) {
                if (wrapAround === void 0) { wrapAround = true; }
                var root = row ? row.closest("table.azc-grid-full") : grid.find("table.azc-grid-full").eq(0), rowList = this._getFocusableList(root), i;
                if (row) {
                    for (i = 0; i < rowList.length; i++) {
                        if (row[0] === rowList[i]) {
                            if (i < rowList.length - 1) {
                                return $(rowList[i + 1]);
                            }
                        }
                    }
                }
                // If we didn't find the next one, then we return the first one (when wrapAround is true)
                return wrapAround ? $(rowList[0]) : null;
            };
            FocusableRowExtension.prototype._focusElement = function (row) {
                var rawRow = row[0];
                // IE10 requires two focus() because sometimes the focus might be delayed and appears to be on the body first
                // Let's use the DOMElement focus to be faster in performance
                rawRow.focus();
                rawRow.focus();
            };
            FocusableRowExtension.prototype._focusRow = function (row, rowMetadata, evt) {
                var $row = $(row), eventObject;
                // To focus a tr element, we must set its tabindex to 0 first
                if (this._lastTabbableRowMetadata) {
                    this._lastTabbableRowMetadata.focused(false);
                }
                this._lastTabbableRowMetadata = rowMetadata;
                rowMetadata.focused(true);
                this._focusElement($row);
                eventObject = {
                    focused: rowMetadata
                };
                // If the event is not passed in, we do not trigger an event.
                if (evt) {
                    this._widget._trigger("rowFocus", Util.cloneEvent(evt, "rowFocus"), eventObject);
                    this._widget.options.events("focus", eventObject);
                }
            };
            FocusableRowExtension.prototype._getFocusableList = function (table) {
                return table.find("> tbody > tr[data-grid-focusable]:not([aria-disabled=true])");
            };
            /**
             * Name of the extension.
             */
            FocusableRowExtension.Name = "azc-grid-focusableRow";
            return FocusableRowExtension;
        })(Grid.Extension);
        Main.FocusableRowExtension = FocusableRowExtension;
    })(Main || (Main = {}));
    return Main;
});
