var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/Util", "./Grid.FocusableRow", "./Grid"], function (require, exports, Util, FocusableRowGrid, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, activeReorderClass = "azc-grid-reorderRow-active", enabledReorderClass = "azc-grid-reorderRow-enabled", bodyRowsCoreDataBindAttribute = "attr: { \"data-grid-reorder\": true }", lineTemplate = "<div class='azc-grid-reorderRow-line azc-bg-muted'></div>", templateColGroup = "<col class='azc-grid-reorderRow-col' />", headerCell = "<th class='azc-grid-reorderRow-header'></th>", bodyRowsCoreCell = "<td class='azc-grid-reorderRow-cell azc-br-muted'><div></div></td>", mimeType = "application/x-azc-grid-row", guidRows = {};
        var ReorderRowExtension = (function (_super) {
            __extends(ReorderRowExtension, _super);
            /**
             * Creates the reorder row extension.
             *
             * @param options Options associated with the extension.
             */
            function ReorderRowExtension(options) {
                this._options = options || {};
                if (this._options.disabled === undefined) {
                    this._options.disabled = ko.observable(false);
                }
                this._gridGuid = Util.newGuid(), _super.call(this);
            }
            Object.defineProperty(ReorderRowExtension.prototype, "options", {
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
            ReorderRowExtension.prototype.afterCreate = function () {
                var _this = this;
                this._widget.element.append(lineTemplate);
                ko.computed(function () {
                    _this._widget.element.toggleClass(enabledReorderClass, !_this.options.disabled());
                });
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore"), header = templateEngine.getHtmlTemplate("header"), colgroup = templateEngine.getHtmlTemplate("colgroup");
                bodyRowsCore.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyRowsCore.prepend("tr", bodyRowsCoreCell);
                header.prepend("tr", headerCell);
                colgroup.prepend("colgroup", templateColGroup);
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.afterAttachEvents = function () {
                var _this = this;
                var that = this;
                this._widget.element.on("dragstart", "[draggable]", this._dragstartEventHandler = function (evt) {
                    // We must remove selection from the page if we are using IE, otherwise DOM elements get removed when dragging.
                    if (Util.DataTransfer.isLegacyDataTransfer()) {
                        global.getSelection().removeAllRanges();
                    }
                    var guid = Util.newGuid(), row = evt.target, dt = new Util.DataTransfer(evt.originalEvent.dataTransfer), dragImage = document.createElement("img");
                    dragImage.src = Util.blankGif;
                    guidRows[guid] = { rowMetadata: ko.dataFor(row), element: row };
                    dt.effectAllowed = "move";
                    dt.setDragImage(dragImage, -25, -25);
                    dt.setData(_this._getMimeType(), guid);
                }).on("drop", this._dropEventHandler = function (evt) {
                    var dt = new Util.DataTransfer(evt.originalEvent.dataTransfer), types = dt.types;
                    if (types.some(function (t) {
                        return t === _this._getMimeType();
                    })) {
                        dt.dropEffect = "move";
                        var guids = dt.getData(_this._getMimeType()).split(";"), rowMetadata = guids.map(function (guid) {
                            return guidRows[guid].rowMetadata;
                        }), eventObject = {
                            rowMetadata: rowMetadata,
                            clientX: evt.originalEvent.pageX,
                            clientY: evt.originalEvent.pageY,
                            position: _this._positionLine(evt)
                        };
                        evt.preventDefault();
                        // We need to call in a timer otherwise our dragend might be lost
                        setTimeout(function () {
                            _this._widget._trigger("rowReorder", Util.cloneEvent(evt, "rowReorder"), eventObject);
                            _this._widget.options.events("reorder", eventObject);
                        }, 0);
                    }
                }).on("dragend", this._dragendEventHandler = function (evt) {
                    guidRows = {}; // DragEnd will trigger even if we don't dragend in the widget
                    _this._widget.element.removeClass(activeReorderClass);
                }).on("mouseenter.azcGrid", "tbody tr[data-grid-reorder=true]:not([aria-disabled=true]) td.azc-grid-reorderRow-cell", this._mouseenterEventHandler = function (evt) {
                    if (that.options.disabled()) {
                        return;
                    }
                    $(this).closest("[role=row]").attr("draggable", "true");
                }).on("mouseleave.azcGrid", "tbody tr[data-grid-reorder=true]:not([aria-disabled=true]) td.azc-grid-reorderRow-cell", this._mouseleaveEventHandler = function (evt) {
                    $(this).closest("[role=row]").removeAttr("draggable");
                });
                $("html").on("dragover", this._dragoverEventHandler = function (evt) {
                    if ($.contains(_this._widget.element[0], evt.target)) {
                        var dt = new Util.DataTransfer(evt.originalEvent.dataTransfer), types = dt.types;
                        if (types && types.some(function (t) {
                            return t === _this._getMimeType();
                        })) {
                            _this._positionLine(evt);
                            evt.preventDefault();
                        }
                    }
                    else if (_this._widget.element.hasClass(activeReorderClass)) {
                        _this._widget.element.removeClass(activeReorderClass);
                    }
                });
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.getOrder = function () {
                return 21;
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.getDependencies = function () {
                return [new FocusableRowGrid.FocusableRowExtension()];
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.beforeCreate = function () {
                var _this = this;
                // Check for incompatible dependencies. We do not add them in our reference list.
                var incompatibleExtensions = ["azc-grid-editableRow"];
                this._widget.options.extensions.forEach(function (extension) {
                    if (incompatibleExtensions.indexOf(extension.getName()) >= 0) {
                        throw new Error("The extension " + extension.getName() + " is not compatible with the extension " + _this.getName() + ".");
                    }
                });
            };
            /**
             * See interface.
             */
            ReorderRowExtension.prototype.beforeDestroy = function () {
                this._widget.element.removeClass(activeReorderClass).removeClass(enabledReorderClass);
                if (this._dragstartEventHandler) {
                    this._widget.element.off("dragstart", this._dragstartEventHandler);
                    this._dragstartEventHandler = null;
                }
                if (this._dropEventHandler) {
                    this._widget.element.off("drop", this._dropEventHandler);
                    this._dropEventHandler = null;
                }
                if (this._dragendEventHandler) {
                    this._widget.element.off("dragend", this._dragendEventHandler);
                    this._dragendEventHandler = null;
                }
                if (this._dragoverEventHandler) {
                    this._widget.element.off("dragover", this._dragoverEventHandler);
                    this._dragoverEventHandler = null;
                }
                if (this._mouseenterEventHandler) {
                    this._widget.element.off("mouseenter.azcGrid", this._mouseenterEventHandler);
                    this._mouseenterEventHandler = null;
                }
                if (this._mouseleaveEventHandler) {
                    this._widget.element.off("mouseleave.azcGrid", this._mouseleaveEventHandler);
                    this._mouseleaveEventHandler = null;
                }
            };
            /**
             * See parent.
             */
            ReorderRowExtension.prototype.getName = function () {
                return ReorderRowExtension.Name;
            };
            /**
             * See parent.
             */
            ReorderRowExtension.prototype.getAdditionalColumns = function () {
                return 1;
            };
            ReorderRowExtension.prototype._getMimeType = function () {
                // DataTransfer cannot read the data on dragover.
                // In this case, we will have a different mimeType per grid so we cannot drag rows between grids.
                return (mimeType + "-" + this._gridGuid).toLowerCase();
            };
            ReorderRowExtension.prototype._positionLine = function (evt) {
                var positioned = false, target = $(evt.target), index = null;
                if (target.hasClass("azc-grid-reorderRow-line")) {
                    index = this._savedIndex;
                }
                else {
                    if ($.contains(this._widget.element[0], evt.target)) {
                        if (!this._widget.element.hasClass(activeReorderClass)) {
                            this._widget.element.addClass(activeReorderClass);
                        }
                        var row = target.closest("[data-grid-reorder=true]"), mouseEvent = evt.originalEvent;
                        // We are in the grid, let's try to find out if we are on top or bottom
                        if (row.length === 0) {
                            var reorderRows = this._widget.element.find("[data-grid-reorder=true]"), firstRow = reorderRows.first(), lastRow = reorderRows.last();
                            if (mouseEvent.pageY <= firstRow.offset().top) {
                                row = firstRow;
                            }
                            else {
                                row = lastRow;
                            }
                        }
                        index = row.index();
                        var rowHeight = row.outerHeight(), rowOffset = row.offset(), rowPosition = row.position(), line = this._widget.element.find(".azc-grid-reorderRow-line");
                        // We Math.floor in case our border collapses for IE
                        rowOffset.top = Math.floor(rowOffset.top);
                        rowPosition.top = Math.floor(rowPosition.top);
                        // Are we above or below the middle of the row?
                        // IE11 needs to round otherwise the height of the line changes.
                        if (mouseEvent.pageY - rowOffset.top < rowHeight / 2) {
                            line.css("top", Math.round(rowPosition.top));
                        }
                        else {
                            line.css("top", Math.round(rowPosition.top + rowHeight));
                            index++;
                        }
                        this._savedIndex = index;
                    }
                    else {
                        this._widget.element.removeClass(activeReorderClass);
                    }
                }
                return index;
            };
            /**
             * Name of the extension.
             */
            ReorderRowExtension.Name = "azc-grid-reorderRow";
            return ReorderRowExtension;
        })(Grid.Extension);
        Main.ReorderRowExtension = ReorderRowExtension;
    })(Main || (Main = {}));
    return Main;
});
