var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid.SelectableRow", "../../../Util/Util", "./Grid"], function (require, exports, SelectableRowGrid, Util, Grid) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, cellSelector = "tbody tr[data-grid-activateable=true]:not([aria-disabled=true]) [" + Util.Constants.dataActivatableAttribute + "=true]", keyPressCellSelector = "tbody tr[data-grid-activateable=true]:not([aria-disabled=true])", tableDataBindAttribute = "css: { \"azc-grid-activateonselected\": $root.func.getPlugin(\"azc-grid-activateableRow\")._activateOnSelected }", bodyRowsCoreDataBindAttribute = "attr: { \"data-grid-activateable\": \"true\", \"data-grid-row-activated\": activated() ? \"true\" : \"false\" }", bodyCellDataBindAttribute = "attr: { \"data-activatable\": activatable(), tabindex: activatable() && !$parent.disabled() ? \"0\" : null, \"data-grid-cell-activated\": $parent.activated() === $data.itemKey ? \"true\" : \"false\" }";
        var SelectableRowActivateExtension = (function (_super) {
            __extends(SelectableRowActivateExtension, _super);
            /**
             * Creates the activateable row extension.
             *
             * @param options Options associated with the extension.
             */
            function SelectableRowActivateExtension(options) {
                this._options = options || {};
                this._activatedColumnKey = this._options.activatedColumnKey || ko.observable();
                this._primaryActivateColumnKey = this._options.primaryActivateColumnKey || ko.observable();
                this._activateOnSelected = this._options.activateOnSelected || ko.observable(false);
                this._preserveSelection = ko.observable(false);
                this._activatedRows = ko.observableArray([]);
                _super.call(this);
            }
            Object.defineProperty(SelectableRowActivateExtension.prototype, "options", {
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
            SelectableRowActivateExtension.prototype.getActivatedRows = function () {
                return this._widget._getAllRowMetadata().filter(function (rowMetadata) {
                    return !Util.isNullOrUndefined(rowMetadata.activated.peek());
                });
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.deactivateAllRows = function () {
                try {
                    this._preserveSelection(true);
                    this._widget._getAllRowMetadata().forEach(function (rowMetadata) {
                        rowMetadata.activated(null);
                    });
                }
                finally {
                    this._preserveSelection(false);
                }
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.deactivateRows = function () {
                var _this = this;
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                try {
                    this._preserveSelection(true);
                    items.forEach(function (item) {
                        _this._widget.getRowMetadata(item).activated(null);
                    });
                }
                finally {
                    this._preserveSelection(false);
                }
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.activateRows = function (columnKey) {
                var _this = this;
                var items = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    items[_i - 1] = arguments[_i];
                }
                if (Util.isNullOrUndefined(columnKey)) {
                    columnKey = this._primaryActivateColumnKey.peek();
                }
                if (!Util.isNullOrUndefined(columnKey) && columnKey.length > 0) {
                    items.forEach(function (item) {
                        _this._widget.getRowMetadata(item).activated(columnKey);
                    });
                }
                else {
                    this.deactivateRows.apply(this, items);
                }
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore"), bodyCell = templateEngine.getHtmlTemplate("bodyCell"), table = templateEngine.getHtmlTemplate("table");
                bodyRowsCore.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyCell.addAttribute("td", "data-bind", bodyCellDataBindAttribute);
                table.addAttribute("table", "data-bind", tableDataBindAttribute);
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    activated: ko.observable(null),
                    activatedInfo: ko.observable(null),
                    _activatedSubscribed: false
                };
            };
            /**
             * See inteface.
             */
            SelectableRowActivateExtension.prototype.getDefaultColumnProperties = function () {
                return {
                    activatable: ko.observable(false)
                };
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcActivationCell", cellSelector, this._eventClick = function (evt) {
                    that._handleActivationKeyPressOrClick(evt, this);
                }).on("keypress.azcActivationRow", keyPressCellSelector, this._eventKeyPress = function (evt) {
                    that._handleActivationKeyPressOrClick(evt, this);
                }).on("keypress.azcActivationCell", cellSelector, this._eventKeyPressCell = function (evt) {
                    that._handleActivationKeyPressOrClick(evt, this);
                    evt.stopPropagation();
                }).on("rowSelect.azcActivation", this._eventRowSelect = function (evt, selectableRowEventObject) {
                    that._onRowSelect(evt, selectableRowEventObject);
                }).on("focus.azcActivation", cellSelector, this._eventFocusHandler = function (evt) {
                    var $target = $(evt.currentTarget);
                    $target.closest("tr[data-grid-activateable=true]").addClass("azc-grid-virtualFocus");
                }).on("blur.azcActivation", cellSelector, this._eventBlurHandler = function (evt) {
                    var target = $(evt.currentTarget);
                    target.closest("tr[data-grid-activateable=true]").removeClass("azc-grid-virtualFocus");
                });
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.afterCreate = function () {
                var _this = this;
                var computedActivatedRow;
                this._selectableRowExtension = this._widget.getPlugin(SelectableRowGrid.SelectableRowExtension.Name);
                this._widget._getAllRowMetadata().filter(function (rowMetadata) {
                    return !Util.isNullOrUndefined(rowMetadata.activated.peek()) && rowMetadata.selected.peek();
                }).forEach(function (rowMetadata) {
                    rowMetadata.activated(null);
                });
                // Hook up the computed
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var columns = _this._widget.options.columns();
                    if (columns && columns.length > 0) {
                        _this._firstColumnKey = columns[0].itemKey;
                    }
                    else {
                        _this._firstColumnKey = null;
                    }
                }));
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var activateColumnKey = _this._activatedColumnKey(), selectedRows = _this._selectableRowExtension.getSelectedRows();
                    if (Util.isNullOrUndefined(activateColumnKey)) {
                        activateColumnKey = null;
                        _this._activatedInfo = null;
                    }
                    selectedRows.forEach(function (selectedRow) {
                        selectedRow.activated(activateColumnKey);
                        selectedRow.activatedInfo(_this._activatedInfo);
                    });
                }));
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    var that = _this, items = _this._widget.options.items(), allRowMetadata = _this._widget._getAllRowMetadata(), toBeWiredRowMetadata = allRowMetadata.filter(function (value) {
                        return !value._activatedSubscribed;
                    }), totalActivatedCount = allRowMetadata.filter(function (value) {
                        return !Util.isNullOrUndefined(value.activated.peek());
                    });
                    that._activatedRows(totalActivatedCount);
                    toBeWiredRowMetadata.forEach(function (rowMetadata) {
                        var entered = false, activateColumnKey;
                        that._widget._subscriptions.registerForDispose(rowMetadata.selected.subscribe(function (selected) {
                            if (!selected) {
                                // Deselected. we should deactivated the row.
                                if (!Util.isNullOrUndefined(rowMetadata.activated.peek())) {
                                    if (!entered) {
                                        try {
                                            entered = true;
                                            rowMetadata.activated(null);
                                        }
                                        finally {
                                            entered = false;
                                        }
                                    }
                                }
                            }
                            else {
                                // selected, we should activated this._activateOnSelected is true or we have a activateColumnKey.
                                activateColumnKey = that._activatedColumnKey();
                                if (Util.isNullOrUndefined(activateColumnKey)) {
                                    if (that._activateOnSelected.peek()) {
                                        activateColumnKey = that._primaryActivateColumnKey() || that._firstColumnKey;
                                    }
                                }
                                if (that._activatedColumnKey.peek() !== activateColumnKey) {
                                    that._activatedColumnKey(activateColumnKey);
                                }
                                // only change the activated key if it is not null or undefined.
                                if (!Util.isNullOrUndefined(activateColumnKey) && rowMetadata.activated.peek() !== activateColumnKey) {
                                    rowMetadata.activated(activateColumnKey);
                                }
                            }
                        }));
                        that._widget._subscriptions.registerForDispose(rowMetadata.activated.subscribe(function (activated) {
                            var activatedTest = !Util.isNullOrUndefined(activated), activedRows = that._activatedRows.peek(), firstIndex;
                            if (!that._preserveSelection.peek() && !activatedTest) {
                                if (!entered && rowMetadata.selected.peek()) {
                                    try {
                                        entered = true;
                                        rowMetadata.selected(false);
                                    }
                                    finally {
                                        entered = false;
                                    }
                                }
                            }
                            if (activatedTest) {
                                // activated should alays cause the row to be selected.
                                if (!entered && !rowMetadata.selected.peek()) {
                                    try {
                                        entered = true;
                                        rowMetadata.selected(true);
                                        if (that._activatedColumnKey.peek() !== activateColumnKey) {
                                            that._activatedColumnKey(activateColumnKey);
                                        }
                                    }
                                    finally {
                                        entered = false;
                                    }
                                }
                                if (!activedRows.some(function (value) {
                                    return value === rowMetadata;
                                })) {
                                    that._activatedRows.push(rowMetadata);
                                }
                            }
                            else {
                                firstIndex = activedRows.indexOf(rowMetadata);
                                if (firstIndex >= 0) {
                                    that._activatedRows.splice(firstIndex, 1);
                                }
                            }
                        }));
                        rowMetadata._activatedSubscribed = true;
                    });
                }));
                this._widget._addDisposablesToCleanUp(computedActivatedRow = ko.computed(function () {
                    var activatedRows = _this._activatedRows();
                    if (activatedRows.length === 0) {
                        _this._activatedColumnKey(null);
                    }
                    else {
                        activatedRows.forEach(function (activatedRow) {
                            if (activatedRow.activated.peek()) {
                                if (!activatedRow.selected.peek()) {
                                    activatedRow.selected(true);
                                }
                            }
                        });
                    }
                }));
                this._widget._addDisposablesToCleanUp(ko.computed(function () {
                    _this._widget.element.toggleClass("azc-grid-selectionActivates", _this._activateOnSelected());
                }));
                computedActivatedRow.extend({ throttle: 10 });
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.getOrder = function () {
                return 40;
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.getDependencies = function () {
                return [new SelectableRowGrid.SelectableRowExtension(this.options)];
            };
            /**
             * See interface.
             */
            SelectableRowActivateExtension.prototype.beforeDestroy = function () {
                if (this._eventClick) {
                    this._widget.element.off("click.azcActivationCell", this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventKeyPress) {
                    this._widget.element.off("keypress.azcActivationRow", this._eventKeyPress);
                    this._eventKeyPress = null;
                }
                if (this._eventKeyPressCell) {
                    this._widget.element.off("keypress.azcActivationCell", this._eventKeyPressCell);
                    this._eventKeyPressCell = null;
                }
                if (this._eventRowSelect) {
                    this._widget.element.off("rowSelect.azcActivation", this._eventRowSelect);
                    this._eventRowSelect = null;
                }
                if (this._eventFocusHandler) {
                    this._widget.element.off("focus.azcActivation", cellSelector, this._eventFocusHandler);
                    this._eventFocusHandler = null;
                }
                if (this._eventBlurHandler) {
                    this._widget.element.off("blur.azcActivation", cellSelector, this._eventBlurHandler);
                    this._eventBlurHandler = null;
                }
            };
            /**
             * See parent.
             */
            SelectableRowActivateExtension.prototype.getName = function () {
                return SelectableRowActivateExtension.Name;
            };
            /**
             * See parent.
             */
            SelectableRowActivateExtension.prototype.shouldNotChangeSelection = function (item, evt) {
                // On multi-select mode, we want the activation to open all activated blade.  Ctrl-Click to toggle.
                var mode = this._selectableRowExtension.options.mode ? this._selectableRowExtension.options.mode() : 0 /* Off */;
                if (mode === 3 /* MultipleReplace */ || mode === 3 /* MultipleReplace */) {
                    // See SelectableRowGrid.SelectableRowExtension.ts
                    // for now treating Ctrl and Shift as the same
                    if ($(item).attr("aria-selected") === "true" && !(evt.shiftKey || evt.ctrlKey)) {
                        // Note: DO NOT user evt.currentTarget here.  This evt is from RowSelection call back, thus the currentTarget will be <tr>
                        var $target = $(evt.target), dataActivatableElement = $target.attr(Util.Constants.dataActivatableAttribute) === "true" ? $target : $target.closest("[" + Util.Constants.dataActivatableAttribute + "=true]");
                        if (dataActivatableElement.length > 0 && $.contains(item, dataActivatableElement[0])) {
                            return true;
                        }
                    }
                }
                return false;
            };
            SelectableRowActivateExtension.prototype._changeActivation = function (item, evt) {
                var rowMetadata = ko.dataFor(item), $target = $(evt.currentTarget), $targetClosestTd = $target.closest("td[role='gridcell']"), $itemClosestTd = $(item).find("td[role='gridcell']"), $tdElement = $targetClosestTd[0] ? $targetClosestTd : $itemClosestTd, columnData = ko.dataFor($tdElement[0]), selected = rowMetadata.selected.peek(), activated = rowMetadata.activated.peek(), avoidChangeColumnKey = false, spaceEvent;
                if (selected) {
                    if ((evt.ctrlKey || evt.shiftKey)) {
                        if (activated === columnData.itemKey) {
                            avoidChangeColumnKey = true;
                        }
                    }
                }
                if (!selected || activated === columnData.itemKey) {
                    if (evt.type === "keypress") {
                        spaceEvent = Util.cloneEvent(evt, "keydown");
                        spaceEvent.which = 32 /* Space */;
                        $.extend(spaceEvent, {
                            which: 32 /* Space */,
                            target: item,
                            ctrlKey: evt.ctrlKey,
                            altKey: evt.altKey,
                            shiftKey: evt.shiftKey
                        });
                        evt.stopPropagation();
                        evt.preventDefault();
                        $(item).trigger(spaceEvent);
                    }
                }
                if (!avoidChangeColumnKey) {
                    this._activatedInfo = $target.attr(Util.Constants.dataActivateInfoAttribute);
                    this._activatedColumnKey(columnData.itemKey);
                }
            };
            SelectableRowActivateExtension.prototype._handleActivationKeyPressOrClick = function (evt, elem) {
                var that = this;
                if (evt.type === "keypress") {
                    if ((!evt.ctrlKey && evt.which === 13 /* Enter */) || (evt.ctrlKey && evt.which === 10) || (evt.which === 32 /* Space */)) {
                    }
                    else {
                        return;
                    }
                }
                var tr = $(elem).closest("tr[data-grid-activateable=true]");
                if (tr.length > 0) {
                    that._changeActivation(tr[0], evt);
                }
            };
            SelectableRowActivateExtension.prototype._onRowSelect = function (evt, selectableRowEventObject) {
                var activatableRowMetadata, columnKey = this._activatedColumnKey(), selectedRows, selectedRowCount = this._selectableRowExtension.getSelectedRows().length;
                if (columnKey && selectableRowEventObject.selected) {
                    activatableRowMetadata = selectableRowEventObject.selected;
                    activatableRowMetadata.activated(columnKey);
                }
                if (selectableRowEventObject.unselected && selectableRowEventObject.unselected.length > 0) {
                    selectableRowEventObject.unselected.forEach(function (selectedRow) {
                        selectedRow.activatedInfo(null);
                        selectedRow.activated(null);
                    });
                }
            };
            /**
             * Name of the extension.
             */
            SelectableRowActivateExtension.Name = "azc-grid-activateableRow";
            return SelectableRowActivateExtension;
        })(Grid.Extension);
        Main.SelectableRowActivateExtension = SelectableRowActivateExtension;
    })(Main || (Main = {}));
    return Main;
});
