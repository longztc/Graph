var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Grid.FocusableRow", "./Grid", "../../../Util/Util"], function (require, exports, FocusableRowGrid, Grid, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var $ = jQuery, global = window, bodyRowsCoreDataBindAttribute = "attr: { \"data-grid-selectable\": true, \"aria-selected\": selected() ? \"true\" : \"false\" }", rowSelectedDataBindClass = "css: { \"azc-list-selected\": selected() }", tableDataBindAttribute = "css: { \"azc-grid-multiselectable\": $root.func.getPlugin(\"azc-grid-selectableRow\")._multiselect }", overlayColumnTemplate = "<col class='azc-grid-selectableRow-overlay-col' />", overlayHeaderTemplate = "<th class='azc-grid-selectableRow-overlay-header' aria-hidden='true'></th>", overlayContentTemplate = "<td class='azc-grid-selectableRow-overlay-cell azc-br-muted' aria-hidden='true'>" + "<div class='azc-grid-selectableRow-overlay-origin'>" + "<div class='azc-grid-selectableRow-overlay-container' data-bind='htmlBinding: $root.func.getPlugin(\"azc-grid-selectableRow\")._overlayFormat($data)'></div>" + "</div>" + "</td>";
        (function (RowSelectionMode) {
            /**
             * The grid does not support selection of rows.
             */
            RowSelectionMode[RowSelectionMode["Off"] = 0] = "Off";
            /**
             * At most one row in the grid can be selected at a time.
             */
            RowSelectionMode[RowSelectionMode["Single"] = 1] = "Single";
            /**
             * By default, multiple items can be in the selected state.
             * Clicking on an unselected item will add it to the list of selected items.
             * Clicking on a selected item will remove it from the list of selected items.
             */
            RowSelectionMode[RowSelectionMode["MultipleAdd"] = 2] = "MultipleAdd";
            /**
             * When Ctrl or Shift is not used,
             * Clicking on an unselected item will remove the selection of existing items and select the new one.
             * The Ctrl or Shift keys can be used to preserve existing selections.
             * This behavior is a close approximation to Windows Explorer.
             */
            RowSelectionMode[RowSelectionMode["MultipleReplace"] = 3] = "MultipleReplace";
            /**
             * One row in the grid can be selected at a time. If no selection provided, the first item will be selected.
             */
            RowSelectionMode[RowSelectionMode["AlwaysSingle"] = 4] = "AlwaysSingle";
        })(Main.RowSelectionMode || (Main.RowSelectionMode = {}));
        var RowSelectionMode = Main.RowSelectionMode;
        var SelectableRowExtension = (function (_super) {
            __extends(SelectableRowExtension, _super);
            /**
             * Creates the selectable row extension.
             *
             * @param options Options associated with the extension.
             */
            function SelectableRowExtension(options) {
                var _this = this;
                this._options = options || {};
                if (this._options.mode === undefined) {
                    this._options.mode = ko.observable(1 /* Single */);
                }
                this._multiselect = ko.computed(function () {
                    var mode = _this._options.mode();
                    return (mode === 2 /* MultipleAdd */) || (mode === 3 /* MultipleReplace */);
                });
                this._options.mode.subscribe(function (value) {
                    if (_this._widget) {
                        var focusableRowPlugin = _this._widget.getPlugin(FocusableRowGrid.FocusableRowExtension.Name);
                        if (focusableRowPlugin) {
                            if (value === 0 /* Off */) {
                                focusableRowPlugin.options.focusable(false);
                            }
                            else {
                                focusableRowPlugin.options.focusable(true);
                            }
                        }
                        if (value === 4 /* AlwaysSingle */ || value === 1 /* Single */) {
                            var items, item, index, selected = _this.getSelectedRows(), length = selected ? selected.length : 0;
                            selected = _this.getSelectedRows();
                            length = selected ? selected.length : 0;
                            if (length >= 1) {
                                for (index = 1; index < length; index++) {
                                    selected[index].selected(false);
                                }
                            }
                            else {
                                if (value === 4 /* AlwaysSingle */) {
                                    items = _this._widget.options.items();
                                    if (items && items.length > 0) {
                                        item = _this._widget.getRowMetadata(items[0]);
                                        item.selected(true);
                                    }
                                }
                            }
                        }
                    }
                });
                _super.call(this);
            }
            Object.defineProperty(SelectableRowExtension.prototype, "options", {
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
            SelectableRowExtension.prototype.getSelectedRows = function () {
                var items, rowMetadataArray = this._widget.options.rowMetadata;
                return this._widget._getAllRowMetadata().filter(function (rowMetadata) {
                    return rowMetadata.selected.peek();
                });
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.unselectAllRows = function () {
                this._widget._getAllRowMetadata().forEach(function (rowMetadata) {
                    rowMetadata.selected(false);
                });
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.unselectRows = function () {
                var _this = this;
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                items.forEach(function (item) {
                    _this._widget.getRowMetadata(item).selected(false);
                });
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.selectRows = function () {
                var _this = this;
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                items.forEach(function (item) {
                    _this._widget.getRowMetadata(item).selected(true);
                });
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.setInstance = function (instance) {
                _super.prototype.setInstance.call(this, instance);
                this._options.mode.valueHasMutated(); // TODO jsgoupil: Call the subscription once
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.afterSetTemplates = function (templateEngine) {
                var bodyRowsCore = templateEngine.getHtmlTemplate("bodyRowsCore"), header = templateEngine.getHtmlTemplate("header"), table = templateEngine.getHtmlTemplate("table");
                bodyRowsCore.addAttribute("tr", "data-bind", bodyRowsCoreDataBindAttribute);
                bodyRowsCore.addAttribute("tr", "data-bind", rowSelectedDataBindClass);
                table.addAttribute("table", "data-bind", tableDataBindAttribute);
                if (this.options.overlayFormatter) {
                    bodyRowsCore.append("tr", overlayContentTemplate);
                    header.append("tr", overlayHeaderTemplate);
                    header.append("colgroup", overlayColumnTemplate);
                }
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.getDefaultRowMetadataProperties = function () {
                return {
                    selected: ko.observable(false)
                };
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype._changeSelection = function (item, evt) {
                var selectMode = this.options.mode(), multipleSelections, disableRequireSingleModeAssistKey = this.options.disableRequireSingleModeAssistKey ? this.options.disableRequireSingleModeAssistKey.peek() : false;
                if (this._widget._extensionTrigger("shouldNotChangeSelection", item, evt).some(function (value) {
                    return !!value;
                })) {
                    return;
                }
                switch (selectMode) {
                    case 0 /* Off */:
                        return;
                    case 1 /* Single */:
                    case 4 /* AlwaysSingle */:
                        multipleSelections = false;
                        break;
                    case 2 /* MultipleAdd */:
                        multipleSelections = true;
                        break;
                    case 3 /* MultipleReplace */:
                        // for now treating Ctrl and Shift as the same
                        multipleSelections = evt.ctrlKey || evt.shiftKey;
                        break;
                    default:
                        throw new Error("Unknown selection mode: " + selectMode + ".");
                }
                var rowMetadata = ko.dataFor(item), selected = null, unselected = [], isSelected = rowMetadata.selected(), eventObject, foundIndex = -1, len;
                if (!multipleSelections) {
                    unselected = this.getSelectedRows();
                    for (len = unselected.length - 1; len >= 0; len--) {
                        var value = unselected[len];
                        if (value !== rowMetadata) {
                        }
                        else {
                            foundIndex = len;
                        }
                    }
                    if (foundIndex < 0) {
                        // in singleSelect case, we always make sure it is selected. (since we just unselect all rows.)
                        // if we happen to click on the same item, it will show up in both unselected (see above) and selected. for the event.
                        selected = rowMetadata;
                    }
                    else {
                        // original selected.
                        if (selectMode === 1 /* Single */ && (disableRequireSingleModeAssistKey || evt.ctrlKey || evt.shiftKey)) {
                        }
                        else {
                            // one of the multi select modes or AlwaysSingle. don't do anything. since it was already selected.
                            unselected.splice(foundIndex, 1);
                        }
                    }
                }
                else {
                    // in multiselect case, we toggle the selection.
                    if (!isSelected) {
                        selected = rowMetadata;
                    }
                    else {
                        unselected = [rowMetadata];
                    }
                }
                // Process the selection changes if there are any.
                if (selected || unselected.length > 0) {
                    eventObject = {
                        selected: selected,
                        unselected: unselected
                    };
                    this._widget._trigger("beforeRowSelect", Util.cloneEvent(evt, "beforeRowSelect"), eventObject);
                    // Commit unselection
                    unselected.forEach(function (rowMetadata) {
                        rowMetadata.selected(false);
                    });
                    // Commit selection
                    if (selected) {
                        selected.selected(true);
                    }
                    this._widget._trigger("rowSelect", Util.cloneEvent(evt, "rowSelect"), eventObject);
                    this._widget.options.events("select", eventObject);
                }
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.afterAttachEvents = function () {
                var that = this;
                this._widget.element.on("click.azcGrid", "tbody tr[data-grid-selectable=true]:not([aria-disabled=true])", this._eventClick = function (evt) {
                    that._changeSelection(this, evt);
                    // Stop propagation of the event that causes selection to change.
                    evt.stopPropagation();
                }).on("keydown.azcGrid", this._eventKeyDown = function (evt) {
                    var rowSelector = "tr[data-grid-selectable]", currentTarget = $(evt.target), activeElement;
                    if (that._options.mode() === 0 /* Off */) {
                        return;
                    }
                    if (FocusableRowGrid.FocusableRowExtension.isEditableControl(currentTarget)) {
                        // We don't do anything if we are editing something
                        return;
                    }
                    switch (evt.which) {
                        case 32 /* Space */:
                            // Space will do the same as clicking on the row
                            activeElement = global.document.activeElement;
                            if (currentTarget.is(rowSelector) && (evt.target === activeElement || $.contains(currentTarget[0], activeElement))) {
                                that._changeSelection((currentTarget[0]), evt);
                                evt.preventDefault();
                            }
                    }
                });
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.getOrder = function () {
                return 20;
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.getDependencies = function () {
                return [new FocusableRowGrid.FocusableRowExtension()];
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.beforeDestroy = function () {
                if (this._eventClick) {
                    this._widget.element.off("click.azcGrid", this._eventClick);
                    this._eventClick = null;
                }
                if (this._eventKeyDown) {
                    this._widget.element.off("keydown.azcGrid", this._eventKeyDown);
                    this._eventKeyDown = null;
                }
                if (this._multiselect) {
                    this._multiselect.dispose();
                    this._multiselect = null;
                }
            };
            /**
             * See parent.
             */
            SelectableRowExtension.prototype.getName = function () {
                return SelectableRowExtension.Name;
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.getAdditionalColumns = function () {
                if (this.options.overlayFormatter) {
                    return 1;
                }
                return 0;
            };
            SelectableRowExtension.prototype._overlayFormat = function (rowMetadata) {
                if (this.options.overlayFormatter) {
                    return this.options.overlayFormatter(rowMetadata.selected());
                }
                return "";
            };
            /**
             * Name of the extension.
             */
            SelectableRowExtension.Name = "azc-grid-selectableRow";
            return SelectableRowExtension;
        })(Grid.Extension);
        Main.SelectableRowExtension = SelectableRowExtension;
    })(Main || (Main = {}));
    return Main;
});
