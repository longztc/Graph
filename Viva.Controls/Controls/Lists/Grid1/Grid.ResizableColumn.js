var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid"], function (require, exports, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, resizeInProgressClass = "azc-grid-resizing", handleTemplate = "<!-- ko if: $root.func.getPlugin(\"azc-grid-resizableColumn\").options.resizable() && hasHandle() -->" + "<div class='azc-grid-header-wrapper'>" + "<a>" + "<span class='azc-grid-headerlabel' data-bind'text: name'></span>" + "</a>" + "<div class='azc-grid-resizableColumn-handle'>" + "<div class='azc-grid-resizableColumn-handle-line azc-bg-muted'></div>" + "</div>" + "</div>" + "<!-- /ko -->";
        var ResizableColumnExtension = (function (_super) {
            __extends(ResizableColumnExtension, _super);
            /**
             * Creates the resizable column extension.
             *
             * @param options Options associated with the extension.
             */
            function ResizableColumnExtension(options) {
                _super.call(this);
                this._options = $.extend(this._getDefaultResizableColumnOptions(), options);
            }
            Object.defineProperty(ResizableColumnExtension.prototype, "options", {
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
            ResizableColumnExtension.prototype.afterSetTemplates = function (templateEngine) {
                var defaultTemplate = templateEngine.getHtmlTemplate("headerCell");
                defaultTemplate.append("th", handleTemplate);
            };
            /**
             * See interface.
             */
            ResizableColumnExtension.prototype.afterCreate = function () {
                var _this = this;
                var columnObjects = this._widget.options.columns();
                // Ensures that the last column doesn't have a resize handle.
                if (columnObjects.length > 0) {
                    this._lastColumnObject = columnObjects[columnObjects.length - 1];
                    this._lastColumnObject.hasHandle(false);
                }
                // Listens to changes to column objects.
                this._columnsSubscription = this._widget.options.columns.subscribe(function (columns) {
                    if (columns.length) {
                        if (_this._lastColumnObject) {
                            _this._lastColumnObject.hasHandle(true);
                        }
                        _this._lastColumnObject = columns[columns.length - 1];
                        _this._lastColumnObject.hasHandle(false);
                    }
                });
            };
            /**
             * See interface.
             */
            ResizableColumnExtension.prototype.afterAttachEvents = function () {
                var _this = this;
                var that = this;
                this._widget.element.on("mousedown.azcGridResizableColumn", ".azc-grid-resizableColumn-handle", this._mouseDownEventHandler = function (evt) {
                    var selectedColumn, nextColumn, selectedColumnObject, nextColumnObject;
                    _this._mouseDownPosition = evt.pageX;
                    _this._handle = $(evt.currentTarget);
                    _this._columns = _this._widget.element.find("th");
                    selectedColumn = _this._handle.parent().closest("th");
                    selectedColumnObject = ko.dataFor(selectedColumn[0]);
                    // Prevents unwanted selection.
                    evt.preventDefault();
                    // Prevents resize on disabled columns.
                    if (selectedColumnObject.disableResizable()) {
                        return;
                    }
                    // Prevents resize when there are no subsequent resizable columns.
                    nextColumn = _this._getNextResizableColumn(_this._columns, _this._widget.options.columns.indexOf(selectedColumnObject) + 1);
                    if (nextColumn === null) {
                        return;
                    }
                    nextColumnObject = ko.dataFor(nextColumn[0]);
                    // Checks to make sure width is an observable.
                    if (!ko.isObservable(selectedColumnObject.width) || !ko.isObservable(nextColumnObject.width)) {
                        return;
                    }
                    _this._resizeStart(selectedColumn, nextColumn);
                });
            };
            /**
             * See interface.
             */
            ResizableColumnExtension.prototype.getName = function () {
                return ResizableColumnExtension.Name;
            };
            /**
             * See interface.
             */
            ResizableColumnExtension.prototype.getOrder = function () {
                return 16;
            };
            /**
             * See interface.
             */
            ResizableColumnExtension.prototype.beforeDestroy = function () {
                if (this._mouseDownEventHandler) {
                    this._widget.element.off("mousedown.azcGridResizableColumn", this._mouseDownEventHandler);
                    this._mouseDownEventHandler = null;
                }
                if (this._mouseUpEventHandler) {
                    $(global.document).off("mouseup.azcGridResizableColumn", this._mouseUpEventHandler);
                    this._mouseUpEventHandler = null;
                }
                if (this._mouseMoveEventHandler) {
                    $(global.document).off("mousemove.azcGridResizableColumn", this._mouseMoveEventHandler);
                    this._mouseMoveEventHandler = null;
                }
                if (this._columnsSubscription) {
                    this._columnsSubscription.dispose();
                    this._columnsSubscription = null;
                }
                this._widget.element.removeClass(resizeInProgressClass);
            };
            /**
             * See inteface.
             */
            ResizableColumnExtension.prototype.getDefaultColumnProperties = function () {
                return {
                    disableResizable: ko.observable(false),
                    hasHandle: ko.observable(true)
                };
            };
            /**
             * Gets the default resizable options.
             *
             * @return The default options.
             */
            ResizableColumnExtension.prototype._getDefaultResizableColumnOptions = function () {
                return {
                    resizable: ko.observable(true),
                    resizeToPercent: ko.observable(true),
                    minWidth: 20
                };
            };
            /**
             * Starts the column resize.
             */
            ResizableColumnExtension.prototype._resizeStart = function (selectedColumn, nextColumn) {
                var _this = this;
                var handleLine, gridHeader = this._widget.element.find(".azc-grid-tableHeader"), gridContent = this._widget.element.find(".azc-grid-tableContent"), ghostLine = $("<div class='azc-grid-resizableColumn-ghostLine azc-bg-selected'></div>"), tableContainer = this._widget.element.find(".azc-grid-tableContainer"), minPosition = selectedColumn.offset().left + this._options.minWidth, maxPosition = nextColumn.offset().left + nextColumn.width() - this._options.minWidth, handleLinePosition, ghostLinePosition, gridHeaderHeight, gridContentHeight;
                // Positions the ghost line at the handle line.
                handleLine = this._handle.find(".azc-grid-resizableColumn-handle-line");
                handleLinePosition = handleLine.offset().left;
                ghostLinePosition = this._tableOffset(tableContainer, handleLinePosition);
                ghostLine.offset({ left: ghostLinePosition });
                // Necessary for IE.
                ghostLine.css("position", "absolute");
                // Sets the ghost line height.
                gridHeaderHeight = gridHeader.height();
                gridContentHeight = gridContent.height();
                ghostLine.height(gridHeaderHeight + gridContentHeight);
                // Appends the ghost line.
                tableContainer.append(ghostLine);
                $(global.document).on("mousemove.azcGridResizableColumn", this._mouseMoveEventHandler = function (evt) {
                    var mouseMovePosition = evt.pageX, ghostLinePosition = Math.min(Math.max(mouseMovePosition, minPosition), maxPosition);
                    // Prevents unwanted selection.
                    evt.preventDefault();
                    _this._widget.element.addClass(resizeInProgressClass);
                    // Moves ghost line.
                    ghostLine.offset({ left: ghostLinePosition });
                });
                $(global.document).one("mouseup.azcGridResizableColumn", this._mouseUpEventHandler = function (evt) {
                    var tableWidth, initialSelectedColumnWidth, initialNextColumnWidth, newSelectedColumnWidth, newNextColumnWidth, strSelectedColumnWidth, strNextColumnWidth, dragDistance, mouseUpPosition = evt.pageX, columnWidths = [], ghostLinePosition = Math.min(Math.max(mouseUpPosition, minPosition), maxPosition), nextColumnObject = ko.dataFor(nextColumn[0]), selectedColumnObject = ko.dataFor(selectedColumn[0]);
                    $(global.document).off("mousemove.azcGridResizableColumn", _this._mouseMoveEventHandler);
                    _this._mouseMoveEventHandler = null;
                    _this._widget.element.removeClass(resizeInProgressClass);
                    // Removes the ghost line.
                    ghostLine.remove();
                    // Calculates the new column widths.
                    initialSelectedColumnWidth = selectedColumn.width();
                    initialNextColumnWidth = nextColumn.width();
                    dragDistance = ghostLinePosition - _this._mouseDownPosition;
                    newSelectedColumnWidth = initialSelectedColumnWidth + dragDistance;
                    newNextColumnWidth = initialNextColumnWidth - dragDistance;
                    if (_this._options.resizeToPercent()) {
                        // Converts width to percent.
                        tableWidth = tableContainer.width();
                        strNextColumnWidth = _this._convertToPercent(tableWidth, newNextColumnWidth);
                        strSelectedColumnWidth = _this._convertToPercent(tableWidth, newSelectedColumnWidth);
                        // Updates next column width.
                        nextColumnObject.width(strNextColumnWidth);
                    }
                    else {
                        // Ensures that each column has a width.
                        _this._columns.each(function (index, elem) {
                            var column = $(elem), columnObject = ko.dataFor(elem);
                            if (columnObject.hasOwnProperty("width")) {
                                // Stores column widths to ensure we set correct values.
                                columnWidths.push(column.width().toString() + "px");
                            }
                            else {
                                column.width(column.width());
                            }
                        });
                        _this._widget.options.columns().forEach(function (columnObject, index) {
                            columnObject.width(columnWidths[index]);
                        });
                        // Gets selected column width in px.
                        strSelectedColumnWidth = newSelectedColumnWidth.toString() + "px";
                    }
                    // Updates selected column width.
                    selectedColumnObject.width(strSelectedColumnWidth);
                });
            };
            /**
             * Gets the corresponding col.
             *
             * @param column Grid.Column.
             * @return col.
            */
            ResizableColumnExtension.prototype._getCol = function (column) {
                return $(".col" + this._columns.index(column));
            };
            ResizableColumnExtension.prototype._getNextResizableColumn = function (columns, index) {
                var columnObjects = this._widget.options.columns(), columnToReturn, nextColumn, nextColumnObject;
                if (index === columnObjects.length) {
                    columnToReturn = null;
                }
                else {
                    nextColumnObject = columnObjects[index];
                    if (nextColumnObject.hasOwnProperty("disableResizable") && !nextColumnObject.disableResizable()) {
                        for (var i = 0; i < columns.length; i++) {
                            if (ko.dataFor(columns.eq(i)[0]).columnId === nextColumnObject.columnId) {
                                nextColumn = columns.eq(i);
                                break;
                            }
                        }
                        columnToReturn = nextColumn;
                    }
                    else {
                        index++;
                        columnToReturn = this._getNextResizableColumn(columns, index);
                    }
                }
                return columnToReturn;
            };
            /**
             * Calculates the percentage of a part value relative to a whole value.
             *
             * @param whole Whole value.
             * @param part Part value.
             * @return string percent.
            */
            ResizableColumnExtension.prototype._convertToPercent = function (whole, part) {
                if (whole > 0) {
                    return (part / whole * 100).toString() + "%";
                }
            };
            ResizableColumnExtension.prototype._tableOffset = function (table, offset) {
                return offset - table.offset().left;
            };
            /**
             * Name of the extension.
             */
            ResizableColumnExtension.Name = "azc-grid-resizableColumn";
            return ResizableColumnExtension;
        })(Grid.Extension);
        Main.ResizableColumnExtension = ResizableColumnExtension;
    })(Main || (Main = {}));
    return Main;
});
