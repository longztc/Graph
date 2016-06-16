var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../../Util/TemplateEngine", "../../Base/ExtensibleControl", "../../Base/Base", "../../../Util/Util", "../../../Util/ArrayUtil", "./Grid.Formatters"], function (require, exports, TemplateEngine, ExtensibleControl, Base, Util, ArrayUtil, FormattersGrid) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-grid", widgetHeaderHiddenClass = "azc-grid-headerHidden", template = "<!-- ko template: { name: 'table', templateEngine: customTemplateEngine } --><!-- /ko -->", templateTable = "<div class='azc-grid-container azc-br-muted'>" + "<div class='azc-grid-tableContainer azc-br-muted'>" + "<div class='azc-grid-tableScrollContainer azc-br-muted'>" + "<!-- ko if: data.columns().length -->" + "<table aria-readonly='true' class='azc-grid-tableHeader'>" + "<caption data-bind='text: data.summary'></caption>" + "<!-- ko template: { name: 'header', templateEngine: customTemplateEngine } --><!-- /ko -->" + "</table>" + "<div class='azc-grid-tableContent'>" + "<table aria-readonly='true' class='azc-grid-full'>" + "<!-- ko template: { name: 'colgroup', templateEngine: customTemplateEngine } --><!-- /ko -->" + "<!-- ko template: { name: 'body', templateEngine: customTemplateEngine } --><!-- /ko -->" + "</table>" + "</div>" + "<!-- /ko -->" + "</div>" + "</div>" + "</div>", templateHeader = "<!-- ko template: { name: 'colgroup', templateEngine: customTemplateEngine } --><!-- /ko -->" + "<thead>" + "<tr><!-- ko template: { name: \"headerCell\", foreach: data.columns, templateEngine: customTemplateEngine } --><!-- /ko --></tr>" + "</thead>", templateColGroup = "<colgroup>" + "<!-- ko template: { name: \"headerColumn\", foreach: data.columns, templateEngine: customTemplateEngine } --><!-- /ko -->" + "</colgroup>", templateHeaderColumn = "<col data-bind='attr: { \"class\": \"col\" + $index() }, style: { width: width }' />", templateHeaderCell = "<th role='columnheader' data-bind='attr: { \"class\": cssClass + \" azc-grid-unsortablecolumnheader\"}'>" + "<a>" + "<span class='azc-grid-headerlabel' data-bind='text: name'></span>" + "</a>" + "</th>", templateBody = "<!-- ko template: { name: ko.pureComputed(function () { return data.items().length ? 'bodyCore' : 'bodyNoItems'; }), data: $data, templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateBodyCore = "<tbody class='azc-grid-groupdata' role='rowgroup'>" + "<!-- ko template: { name: 'bodyRows', foreach: data.items, templateEngine: customTemplateEngine } --><!-- /ko -->" + "</tbody>", templateBodyNoItems = "<tbody class='azc-grid-empty' data-bind='if: data.noRowsMessage'><tr><td class='azc-br-muted' data-bind='attr: { colspan: func._getTotalColumns() }, html: data.noRowsMessage'></td></tr></tbody>", templateBodyRows = "<!-- ko template: { name: 'bodyRowsCore', data: $root.func.getRowMetadata($data), templateEngine: $root.customTemplateEngine } --><!-- /ko -->", templateBodyRowsCore = "<tr role='row' data-bind='attr: { \"class\": cssClass }'>" + "<!-- ko template: { name: 'bodyCell', foreach: $root.data.columns, templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "</tr>", templateBodyCell = "<td role='gridcell' data-bind='template: { name: \"bodyCellContent\", templateEngine: $root.customTemplateEngine }, attr: { \"class\": itemKey === \"infoBalloon\" ? \"azc-grid-infoBalloon azc-br-muted\" + cssClass : \"azc-br-muted \" + cssClass }'></td>", templateBodyCellContent = "<div class='azc-grid-cellContent' data-bind='css: { \"azc-grid-cell-ellipse\": $data.enableEllipse, \"azc-grid-cell-fullheight\": $data.fullHeight }, htmlBinding: $root.func._cellFormat($parentContext.$parentContext.$index, $index, $parent, $data)'></div>";
        var slice = Array.prototype.slice, map = {};
        // Viva Control handled by the formatter.
        // We are not making it public.
        ko.bindingHandlers["vivaControl"] = {
            registerCallback: function (callback) {
                var guid = Util.newGuid();
                // Creating a temporary GUID so we can reference it.
                map[guid] = callback;
                return guid;
            },
            unregisterGuid: function (guid) {
                delete map[guid];
            },
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var guid = ko.utils.unwrapObservable(valueAccessor()), vivaControl = map[guid];
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    var disposables = vivaControl().disposables;
                    ko.bindingHandlers["vivaControl"].unregisterGuid(guid);
                    if (disposables && disposables.length > 0) {
                        disposables.forEach(function (item) {
                            item.dispose();
                        });
                        disposables.splice(0, disposables.length);
                    }
                });
                return ko.bindingHandlers["privateTemplate"]["init"](element, vivaControl, allBindingsAccessor, viewModel, bindingContext);
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var guid = ko.utils.unwrapObservable(valueAccessor()), vivaControl = map[guid];
                return ko.bindingHandlers["privateTemplate"]["update"](element, vivaControl, allBindingsAccessor, viewModel, bindingContext);
            }
        };
        (function (SortOrder) {
            /**
             * Unsorted.
             */
            SortOrder[SortOrder["Unsorted"] = 0] = "Unsorted";
            /**
             * Ascending.
             */
            SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
            /**
             * Descending.
             */
            SortOrder[SortOrder["Descending"] = 2] = "Descending";
        })(Main.SortOrder || (Main.SortOrder = {}));
        var SortOrder = Main.SortOrder;
        var Extension = (function (_super) {
            __extends(Extension, _super);
            function Extension() {
                _super.apply(this, arguments);
            }
            return Extension;
        })(ExtensibleControl.Extension);
        Main.Extension = Extension;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Summary of the table.
                 */
                this.summary = ko.observable();
                /**
                 * Shows the column header.
                 */
                this.showHeader = true;
                /**
                 * Column definitions.
                 */
                this.columns = ko.observableArray();
                /**
                 * Items displayed in the table based on the column definitions.
                 */
                this.items = ko.observableArray([]);
                /**
                 * No rows message when no items are displayed.
                 */
                this.noRowsMessage = ko.observable();
                /**
                 * Important events which the viewModel might want to react.
                 */
                this.events = $.noop;
                /**
                 * Resource URIs.
                 */
                this.uri = {};
                /**
                 * Resource Texts.
                 */
                this.text = {};
            }
            return ViewModel;
        })(ExtensibleControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                this._columnCount = 0;
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._extensionTrigger("beforeCreate");
                this._setTemplates();
                this.element.addClass(widgetClass).html(template);
                if (!this.options.showHeader) {
                    this.element.addClass(widgetHeaderHiddenClass);
                }
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._attachEvents();
                this._extensionTrigger("afterCreate");
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._extensionTrigger("beforeDestroy");
                this._detachEvents();
                this._cleanElement(widgetClass, widgetHeaderHiddenClass);
                _super.prototype.dispose.call(this);
                this._extensionTrigger("afterDestroy");
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets the row metadata based on a data item.
             *
             * @param item Data item associated with the row metadata.
             * @return One row metadata.
             */
            Widget.prototype.getRowMetadata = function (item) {
                if (typeof item !== "object" || !item) {
                    return null;
                }
                var predicate = function (m) {
                    return m && m.item === item;
                }, rowMetadata = ArrayUtil.first(this._allRowMetadata, predicate), optionsRowMetadata;
                if (!rowMetadata) {
                    // We will create a row metadata even if we don't have the item.
                    // We might simply evict it later.
                    rowMetadata = this._getNewRowMetadataEntries();
                    rowMetadata.item = item;
                    // Use an appropriate client-supplied row metadata object if we can find it
                    optionsRowMetadata = this.options.rowMetadata ? ArrayUtil.first(this.options.rowMetadata, predicate) : null;
                    if (optionsRowMetadata) {
                        // We found one, let's extend the properties
                        $.extend(true, rowMetadata, optionsRowMetadata);
                    }
                    this._allRowMetadata.push(rowMetadata);
                }
                return rowMetadata;
            };
            Widget.prototype._getAllRowMetadata = function () {
                if (!this._allRowMetadataInitialized) {
                    this._updateAllRowMetadata();
                    this._allRowMetadataInitialized = true;
                }
                return this._allRowMetadata;
            };
            /**
             * See parent.
             */
            Widget.prototype._initializePlugins = function (viewModel) {
                // Make sure this variable is initialized before plugins get initialized.
                this._allRowMetadata = [];
                _super.prototype._initializePlugins.call(this, viewModel);
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                var columnSubscription;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.columns.subscribe(columnSubscription = function (value) {
                    _this._normalizeColumns(value);
                }));
                columnSubscription(viewModel.columns());
                this._subscriptions.registerForDispose(viewModel.items.subscribe(function (value) {
                    var newRowMetadata = [], oldRowMetadata = [];
                    _this._allRowMetadata.forEach(function (oneRowMetadata) {
                        var found = value.some(function (item) {
                            return oneRowMetadata.item === item;
                        });
                        if (found) {
                            newRowMetadata.push(oneRowMetadata);
                        }
                        else {
                            oldRowMetadata.push(oneRowMetadata);
                        }
                    });
                    // Let's ask all plugins if they are ok we delete each metadata.
                    oldRowMetadata.forEach(function (oneOldRowMetadata) {
                        if (_this._extensionTrigger("shouldRetainRowMetadata", oneOldRowMetadata).some(function (v) {
                            return v === true;
                        })) {
                            newRowMetadata.push(oneOldRowMetadata);
                        }
                    });
                    _this._allRowMetadata = newRowMetadata;
                    _this._updateAllRowMetadata();
                }));
            };
            Widget.prototype._attachEvents = function () {
                this._extensionTrigger("beforeAttachEvents");
                this.element.on("mouseenter.azcGrid", "> .azc-grid-container .azc-grid-full > tbody > tr > td .azc-grid-cellContent, > .azc-grid-container .azc-grid-tableHeader > thead > tr > th .azc-grid-headerlabel", this._mouseEnterTooltipHandler = function () {
                    var $this = $(this), originalTitle = $this.attr("title");
                    if ($this.find(">div,>span").length === 0) {
                        if (originalTitle !== $this.text()) {
                            if (this.offsetWidth < this.scrollWidth) {
                                $this.attr("title", $this.text());
                            }
                            else if (originalTitle) {
                                $this.removeAttr("title");
                            }
                        }
                    }
                });
                this._extensionTrigger("afterAttachEvents");
            };
            Widget.prototype._detachEvents = function () {
                this._extensionTrigger("beforeDetachEvents");
                if (this._mouseEnterTooltipHandler) {
                    this.element.off("mouseenter.azcGrid", this._mouseEnterTooltipHandler);
                    this._mouseEnterTooltipHandler = null;
                }
                this._extensionTrigger("afterDetachEvents");
            };
            Widget.prototype._getNewRowMetadataEntries = function () {
                var mergedDefaultRowMetadataProperties = {
                    item: null,
                    cssClass: ko.observable("")
                }, defaultRowMetadataProperties = this._extensionTrigger("getDefaultRowMetadataProperties");
                defaultRowMetadataProperties.forEach(function (defaultRowMetadataProperty) {
                    $.extend(true, mergedDefaultRowMetadataProperties, defaultRowMetadataProperty);
                });
                return mergedDefaultRowMetadataProperties;
            };
            Widget.prototype._getNewColumnEntries = function () {
                var mergedDefaultColumnProperties = {
                    name: ko.observable(""),
                    itemKey: "",
                    formatter: FormattersGrid.text,
                    cssClass: "",
                    width: ko.observable(null)
                }, defaultColumnProperties = this._extensionTrigger("getDefaultColumnProperties");
                defaultColumnProperties.forEach(function (defaultColumnProperty) {
                    $.extend(true, mergedDefaultColumnProperties, defaultColumnProperty);
                });
                return mergedDefaultColumnProperties;
            };
            Widget.prototype._normalizeColumns = function (columns) {
                var columnEntries = this._getNewColumnEntries(), columnKeys = Object.keys(columnEntries), getNewColumnEntry = false, i = columns.length;
                while (i--) {
                    columnKeys.forEach(function (columnKey) {
                        if (columns[i][columnKey] === undefined) {
                            columns[i][columnKey] = columnEntries[columnKey];
                            getNewColumnEntry = true;
                        }
                    });
                    // Generates a unique columnId.
                    if (Util.isNullOrUndefined(columns[i].columnId)) {
                        columns[i].columnId = (this._columnCount++).toString();
                    }
                    if (getNewColumnEntry) {
                        columnEntries = this._getNewColumnEntries();
                        getNewColumnEntry = false;
                    }
                }
            };
            Widget.prototype._getTotalColumns = function () {
                var columns = this.options.columns().length;
                var additionalColumns = this._extensionTrigger("getAdditionalColumns");
                additionalColumns.forEach(function (extraColumns) {
                    columns += extraColumns;
                });
                return columns;
            };
            Widget.prototype._cellFormat = function (rowNumber, columnNumber, rowMetadata, columnDefinition) {
                return (columnDefinition.formatter || FormattersGrid.text)(rowMetadata.item[columnDefinition.itemKey], {
                    item: rowMetadata.item,
                    rowNumber: rowNumber,
                    columnNumber: columnNumber,
                    rowMetadata: rowMetadata,
                    column: columnDefinition
                });
            };
            Widget.prototype._setTemplates = function () {
                this._extensionTrigger("beforeSetTemplates", this._templateEngine);
                this._templateEngine.setTemplate("table", templateTable);
                this._templateEngine.setTemplate("header", templateHeader);
                this._templateEngine.setTemplate("headerColumn", templateHeaderColumn);
                this._templateEngine.setTemplate("colgroup", templateColGroup);
                this._templateEngine.setTemplate("headerCell", templateHeaderCell);
                this._templateEngine.setTemplate("body", templateBody);
                this._templateEngine.setTemplate("bodyCore", templateBodyCore);
                this._templateEngine.setTemplate("bodyNoItems", templateBodyNoItems);
                this._templateEngine.setTemplate("bodyRows", templateBodyRows);
                this._templateEngine.setTemplate("bodyRowsCore", templateBodyRowsCore);
                this._templateEngine.setTemplate("bodyCell", templateBodyCell);
                this._templateEngine.setTemplate("bodyCellContent", templateBodyCellContent);
                this._extensionTrigger("afterSetTemplates", this._templateEngine);
            };
            Widget.prototype._updateAllRowMetadata = function () {
                var _this = this;
                var items = this.options.items();
                if (items && items.length > 0) {
                    items.forEach(function (item) {
                        _this.getRowMetadata(item);
                    });
                }
            };
            return Widget;
        })(ExtensibleControl.Widget);
        Main.Widget = Widget;
        var Col = (function () {
            function Col() {
                this.name = ko.observable();
                this.itemKey = "";
                this.formatter = null;
                this.sortFormatter = null;
                this.filterFormatter = null;
                this.cssClass = "";
                this.width = ko.observable(null);
                this.columnId = null;
            }
            return Col;
        })();
        ko.bindingHandlers["azcGrid"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
