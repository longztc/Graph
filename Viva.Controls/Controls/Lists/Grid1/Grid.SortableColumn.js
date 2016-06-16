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
        var template = "<th role='columnheader' data-bind='style: { width: width }, attr: { \"aria-sort\": sortOrder() === 1 ? \"ascending\" : (sortOrder() === 2 ? \"descending\" : null), \"class\": \"azc-grid-sortableColumn-header \" + cssClass }'>" + "<a href='#' data-bind='attr: { title: sortOrder() === 1 ? $root.data.text.ascending : (sortOrder() === 2 ? $root.data.text.descending : \"\") }'>" + "<span class='azc-grid-headerlabel' data-bind='text: name'></span>" + "<span class='azc-grid-sortableColumn-sortImage' data-bind='css: sortOrder() === 1 ? \"azc-grid-sortableColumn-sortImage-ascending\" : (sortOrder() === 2 ? \"azc-grid-sortableColumn-sortImage-descending\" : \"\")'></span>" + "</a>" + "</th>";
        var SortableColumnExtension = (function (_super) {
            __extends(SortableColumnExtension, _super);
            function SortableColumnExtension() {
                _super.apply(this, arguments);
            }
            /**
             * See interface.
             */
            SortableColumnExtension.prototype.getSortedColumn = function () {
                var findResult = this._widget.element.find("th[aria-sort=ascending], th[aria-sort=descending]");
                if (findResult.length) {
                    return ko.dataFor(findResult[0]);
                }
                return null;
            };
            /**
             * See interface.
             */
            SortableColumnExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
                if (!(instance.options.text["ascending"])) {
                    instance.options.text["ascending"] = "Ascending";
                }
                if (!(instance.options.text["descending"])) {
                    instance.options.text["descending"] = "Descending";
                }
            };
            /**
             * See interface.
             */
            SortableColumnExtension.prototype.afterSetTemplates = function (templateEngine) {
                var headerCell = templateEngine.getTemplate("headerCell");
                templateEngine.setTemplate("headerCell", "<!-- ko if: sortable -->" + template + "<!-- /ko --><!-- ko ifnot: sortable -->" + headerCell + "<!-- /ko -->");
            };
            /**
             * See interface.
             */
            SortableColumnExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcGrid", "thead[class!=azc-grid-empty] th a", this._eventSortingClickHandler = function (evt) {
                    var column = ko.dataFor(this), sortOrder = 1 /* Ascending */, currentlySortedColumn, eventObject;
                    if (!column.sortable) {
                        evt.preventDefault();
                        return;
                    }
                    currentlySortedColumn = that.getSortedColumn();
                    if (currentlySortedColumn !== null && currentlySortedColumn !== column) {
                        currentlySortedColumn.sortOrder(0 /* Unsorted */);
                    }
                    if (column.sortOrder() === 1 /* Ascending */) {
                        sortOrder = 2 /* Descending */;
                    }
                    column.sortOrder(sortOrder);
                    eventObject = {
                        column: column,
                        sortOrder: sortOrder
                    };
                    that._widget._trigger("columnSort", Util.cloneEvent(evt, "columnSort"), eventObject);
                    that._widget.options.events("sort", eventObject);
                    evt.preventDefault();
                });
            };
            /**
             * See inteface.
             */
            SortableColumnExtension.prototype.getDefaultColumnProperties = function () {
                return {
                    sortable: true,
                    sortOrder: ko.observable(0 /* Unsorted */)
                };
            };
            /**
             * See interface.
             */
            SortableColumnExtension.prototype.beforeDestroy = function () {
                if (this._eventSortingClickHandler) {
                    this._widget.element.off("click.azcGrid", this._eventSortingClickHandler);
                    this._eventSortingClickHandler = null;
                }
            };
            /**
             * See parent.
             */
            SortableColumnExtension.prototype.getName = function () {
                return SortableColumnExtension.Name;
            };
            /**
             * Name of the extension.
             */
            SortableColumnExtension.Name = "azc-grid-sortableColumn";
            return SortableColumnExtension;
        })(Grid.Extension);
        Main.SortableColumnExtension = SortableColumnExtension;
    })(Main || (Main = {}));
    return Main;
});
