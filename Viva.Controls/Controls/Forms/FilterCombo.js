var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./EditableCombo", "../Lists/Grid1/Grid.SelectableRow", "../Lists/Grid1/Grid.FocusableRowHover", "../Lists/Grid1/Grid.FocusableRow", "../Lists/Grid1/Grid.Scrollable", "../Lists/Grid1/Grid", "../../Util/StringUtil", "../../Util/ArrayUtil"], function (require, exports, EditableCombo, SelectableRowGrid, FocusableRowHoverGrid, FocusableRowGrid, ScrollableGrid, Grid, StringUtil, ArrayUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-filterCombo", widgetDropPopupClass = "azc-filterCombo-drop-popup", widgetBgDefaultClass = "azc-bg-default", rowFocusDataBindAttribute = "css: { \"azc-filterCombo-focus\": focused() }";
        var OverflowResult;
        (function (OverflowResult) {
            /**
             * Overflow not needed.
             */
            OverflowResult[OverflowResult["None"] = 0] = "None";
            /**
             * Element needs to be aligned to top.
             */
            OverflowResult[OverflowResult["AlignToTop"] = 1] = "AlignToTop";
            /**
             * Element needs to be aligned to bottom.
             */
            OverflowResult[OverflowResult["AlignToBottom"] = 2] = "AlignToBottom";
        })(OverflowResult || (OverflowResult = {}));
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the FilterCombo view model.
             */
            function ViewModel() {
                _super.call(this);
                /**
                 * Rows count.
                 */
                this.rowsCount = ko.observable(7);
                /**
                 * Column definitions.
                 */
                this.columns = ko.observableArray([]);
                /**
                 * Default column width.
                 */
                this.defaultColumnWidth = ko.observable("150px");
                /**
                 * Items displayed in the list.
                 */
                this.items = ko.observableArray([]);
                /**
                 * Key used to get the display value.
                 */
                this.valueKey = ko.observable("name");
                /**
                 * Filter text.
                 */
                this.filterText = ko.observable("");
                /**
                 * No rows message when no rows are displayed.
                 */
                this.noRowsMessage = ko.observable();
                /**
                 * Indicates if filtering is in progress now.
                 */
                this.filterInProgress = ko.observable(false);
                // Setting the defaults.
                this.value("");
                this.dropDownWidth(2 /* MinWidgetMaxContent */);
            }
            return ViewModel;
        })(EditableCombo.ViewModel);
        Main.ViewModel = ViewModel;
        var ScrollRowIntoViewExtension = (function (_super) {
            __extends(ScrollRowIntoViewExtension, _super);
            /**
             * Creates the scroll row into view extension.
             */
            function ScrollRowIntoViewExtension() {
                _super.call(this);
            }
            /**
             * See parent.
             */
            ScrollRowIntoViewExtension.prototype.getName = function () {
                return ScrollRowIntoViewExtension.Name;
            };
            /**
             * Scrolls the row into view.
             *
             * @param row The row.
             */
            ScrollRowIntoViewExtension.prototype.scrollIntoView = function (row) {
                if (row && row.length > 0) {
                    // Trying to keep the selected items within popup (assuming all the rows have same height).
                    var overflow = this._overflowExists(row.index());
                    if (overflow !== 0 /* None */) {
                        if (row && row.length > 0) {
                            // Scroll the row into view using the overflow result.
                            row.get(0).scrollIntoView(overflow === 1 /* AlignToTop */);
                        }
                    }
                }
            };
            /**
             * See interface.
             */
            ScrollRowIntoViewExtension.prototype.afterCreate = function () {
                var _this = this;
                this._afterCreateTimer = global.setTimeout(function () {
                    var rowCount = _this._widget.options.items().length;
                    _this._rowHeight = 0;
                    _this._containerHeight = 0;
                    if (rowCount > 0) {
                        // Calculating row height to be used during selection to make sure the selected row is visible.
                        _this._rowHeight = _this._widget.element.find(".azc-grid-full").height() / rowCount;
                        _this._containerHeight = _this._widget.element.find(".azc-grid-container").height();
                    }
                }, 150);
            };
            /**
             * See interface.
             */
            ScrollRowIntoViewExtension.prototype.beforeDestroy = function () {
                if (this._afterCreateTimer) {
                    global.clearTimeout(this._afterCreateTimer);
                    this._afterCreateTimer = null;
                }
            };
            ScrollRowIntoViewExtension.prototype._overflowExists = function (rowIndex) {
                var selectionTop, selectionBottom, scrollTop, scrollBottom;
                selectionTop = rowIndex * this._rowHeight;
                scrollTop = this._widget.element.find(".azc-grid-container").scrollTop();
                // Trying to determine top overflow exists.
                if (selectionTop < scrollTop) {
                    return 1 /* AlignToTop */;
                }
                selectionBottom = selectionTop + this._rowHeight;
                scrollBottom = scrollTop + this._containerHeight;
                // Trying to determine bottom overflow exists.
                if (selectionBottom > scrollBottom) {
                    return 2 /* AlignToBottom */;
                }
                // No overflow.
                return 0 /* None */;
            };
            /**
             * Name of the extension.
             */
            ScrollRowIntoViewExtension.Name = "azc-grid-scrollRowIntoView";
            return ScrollRowIntoViewExtension;
        })(Grid.Extension);
        Main.ScrollRowIntoViewExtension = ScrollRowIntoViewExtension;
        var SelectableRowExtension = (function (_super) {
            __extends(SelectableRowExtension, _super);
            /**
             * Creates the FilterCombo specific selectable row extension.
             *
             * @param options Options associated with the extension.
             */
            function SelectableRowExtension(options) {
                _super.call(this, options);
            }
            /**
             * See parent.
             */
            SelectableRowExtension.prototype.selectRows = function () {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                var scrollExtension, selectedRow;
                // Clear the previous selections first.
                this.unselectAllRows();
                // We need to call this way due to being rest parameters.
                _super.prototype.selectRows.apply(this, items);
                // Ensure the newly first selected row is visible.
                scrollExtension = this._widget.getPlugin(ScrollRowIntoViewExtension.Name);
                selectedRow = this.getSelectedRow();
                scrollExtension.scrollIntoView(selectedRow);
            };
            /**
             * See interface.
             */
            SelectableRowExtension.prototype.getDependencies = function () {
                // Creating FilterCombo specific FocusableRowExtension.
                return [new FocusableRowExtension()];
            };
            /**
             * Gets the first selected row.
             *
             * @return The first selected row.
             */
            SelectableRowExtension.prototype.getSelectedRow = function () {
                return this._widget.element.find("[role=row][aria-selected=true]:first");
            };
            return SelectableRowExtension;
        })(SelectableRowGrid.SelectableRowExtension);
        Main.SelectableRowExtension = SelectableRowExtension;
        var FocusableRowExtension = (function (_super) {
            __extends(FocusableRowExtension, _super);
            /**
             * Creates FilterCombo specific focusable row extension.
             *
             * @param options Options associated with the extension.
             */
            function FocusableRowExtension(options) {
                _super.call(this, options);
            }
            /**
             * Focuses first available row in the grid.
             *
             * @param evt The JQueryEventObejct generated from the keydown event.
             */
            FocusableRowExtension.prototype.focusFirst = function (evt) {
                var _this = this;
                this._focusFirstTimer = global.setTimeout(function () {
                    _this._focusOnGivenRow(_this._getFirstRow(), evt);
                }, 150);
            };
            /**
             * Focuses next available row in the grid.
             *
             * @param evt The JQueryEventObejct generated from the keydown event.
             * @param currentRow Current row, the row after which focus needs to be set to.
             */
            FocusableRowExtension.prototype.focusNext = function (evt, currentRow) {
                var nextFocusable = this._findNextFocusable(this._widget.element, this._getReferenceRow(currentRow));
                this._focusOnGivenRow(nextFocusable, evt);
            };
            /**
             * Focuses previous available row in the grid.
             *
             * @param evt The JQueryEventObject generated from the keydown event.
             * @param currentRow Current row, the row previous to which focus needs to be set to.
             */
            FocusableRowExtension.prototype.focusPrevious = function (evt, currentRow) {
                var previousFocusable = this._findPreviousFocusable(this._widget.element, this._getReferenceRow(currentRow));
                this._focusOnGivenRow(previousFocusable, evt);
            };
            /**
             * See parent.
             */
            FocusableRowExtension.prototype.getDependencies = function () {
                // Creating FilterCombo specific FocusableRowExtension.
                return [new ScrollRowIntoViewExtension()];
            };
            /**
             * Gets the focused rows.
             *
             * @return The focused rows.
             */
            FocusableRowExtension.prototype.getFocusedRows = function () {
                return this._widget.element.find(".azc-filterCombo-focus");
            };
            /**
             * See interface.
             */
            FocusableRowExtension.prototype.beforeDestroy = function () {
                _super.prototype.beforeDestroy.call(this);
                if (this._focusFirstTimer) {
                    global.clearTimeout(this._focusFirstTimer);
                    this._focusFirstTimer = null;
                }
            };
            FocusableRowExtension.prototype._getRowFocusDataBindAttribute = function () {
                return rowFocusDataBindAttribute;
            };
            FocusableRowExtension.prototype._focusElement = function (row) {
                // Normally, base focuses the grid row here. However, it should be a noop in this class
                // because we don't want the grid row to steal the focus from input.
            };
            FocusableRowExtension.prototype._findNextFocusable = function (grid, row) {
                return _super.prototype._findNextFocusable.call(this, grid, row, false);
            };
            FocusableRowExtension.prototype._findPreviousFocusable = function (grid, row) {
                return _super.prototype._findPreviousFocusable.call(this, grid, row, false);
            };
            FocusableRowExtension.prototype._focusOnGivenRow = function (row, evt) {
                var scrollExtension;
                if (row && row.length > 0) {
                    // Focus the given row.
                    var rowMetadata = ko.dataFor(row.get(0));
                    if (rowMetadata) {
                        this._focusRow(row, rowMetadata, evt);
                    }
                    // Ensure the newly focused row is visible
                    scrollExtension = this._widget.getPlugin(ScrollRowIntoViewExtension.Name);
                    scrollExtension.scrollIntoView(row);
                }
            };
            FocusableRowExtension.prototype._getFirstRow = function () {
                return this._widget.element.find("[role=row]:first");
            };
            FocusableRowExtension.prototype._getReferenceRow = function (selectedRow) {
                // Focused row is the reference row (if anything focused)
                var focusedRow = this.getFocusedRows();
                if (focusedRow.length === 0) {
                    // If nothing focused, the selected row gets the reference row.
                    focusedRow = selectedRow;
                }
                // If nothing is focused or selected, reference row becomes null,
                // which causes first or last item to be focused.
                return focusedRow.length > 0 ? focusedRow : null;
            };
            return FocusableRowExtension;
        })(FocusableRowGrid.FocusableRowExtension);
        Main.FocusableRowExtension = FocusableRowExtension;
        var ScrollableExtension = (function (_super) {
            __extends(ScrollableExtension, _super);
            /**
             * Creates the FilterCombo specific scrollable extension.
             *
             * @param options Options associated with the extension.
             */
            function ScrollableExtension(options) {
                options = $.extend(options, this._getScrollableOptions());
                _super.call(this, options);
            }
            ScrollableExtension.prototype._getScrollableOptions = function () {
                return {
                    updateViewportAsyncDebounceTime: 1,
                    defaultRowHeight: 26
                };
            };
            return ScrollableExtension;
        })(ScrollableGrid.ScrollableExtension);
        Main.ScrollableExtension = ScrollableExtension;
        var ScrollableExtensionDataProvider = (function () {
            /**
             * Creates the FilterCombo specific scrollable extension data provider.
             *
             * @param items List of items for scrollable.
             * @param afterPopulate Callback to run any post populate styling updates.
             */
            function ScrollableExtensionDataProvider(items, afterPopulate) {
                this.totalItemCount = ko.observable(items.length);
                this._items = items;
                this._afterPopulate = afterPopulate;
            }
            /**
            * Fetches items as requested by the data provider.
            *
            * @param skip Count of items to skip.
            * @param take Count of items to take.
            */
            ScrollableExtensionDataProvider.prototype.fetch = function (skip, take) {
                var deferred = Q.defer();
                deferred.resolve(this._getPagedItems(skip, take));
                if (this._afterPopulate) {
                    this._afterPopulate();
                }
                return deferred.promise;
            };
            ScrollableExtensionDataProvider.prototype._getPagedItems = function (position, count) {
                return this._items.slice(position, position + count);
            };
            return ScrollableExtensionDataProvider;
        })();
        Main.ScrollableExtensionDataProvider = ScrollableExtensionDataProvider;
        /**
         * INTERNAL: Exported for unit tests.
         * Manages the items of FilterCombo by providing APIs like getting previous/next item,
         * finding closest match, finding item by value.
         */
        var ItemSource = (function () {
            /**
             * Creates an instance of ItemSource.
             *
             * @param valueKey Key to obtain the display value from the Item.
             * @param items Initial set of items.
             * @param isDataSorted Flag based on which items are sorted or shown as is.
             */
            function ItemSource(valueKey, items, isDataSorted) {
                var _this = this;
                this._valueKey = valueKey;
                this._isDataSorted = isDataSorted || ko.observable(false);
                this.sortedItems = ko.computed(function () {
                    // Cloning items array not to change original items after sorting
                    var itemsClone = [].concat(items());
                    if (!_this._isDataSorted()) {
                        itemsClone = itemsClone.sort(function (a, b) {
                            return _this._compareItems(a, b);
                        });
                    }
                    return itemsClone;
                });
            }
            Object.defineProperty(ItemSource.prototype, "valueKey", {
                /**
                 * Gets the key used to obtain the value of the item.
                 *
                 * @return Key used to obtain item value.
                 */
                get: function () {
                    return this._valueKey;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Cleans up registered computeds and subscriptions.
             */
            ItemSource.prototype.dispose = function () {
                if (this.sortedItems) {
                    this.sortedItems.dispose();
                    this.sortedItems = null;
                }
            };
            /**
             * Finds the item starting with the specified string value.
             *
             * @param value Text to search in the items.
             * @return The matched item. If nothing matches, returns empty string.
             */
            ItemSource.prototype.findValueStartsWith = function (value) {
                var _this = this;
                var foundItem;
                if (value) {
                    value = value.toLocaleLowerCase();
                    foundItem = ArrayUtil.first(this.sortedItems(), function (i) {
                        var itemValue = _this._itemToValue(i);
                        return (itemValue || "").toLocaleLowerCase().indexOf(value) === 0;
                    });
                }
                return foundItem ? this._itemToValue(foundItem) : null;
            };
            /**
             * Finds an item by the specified value.
             *
             * @param value Value used to find the item.
             * @return The item containing the specified value.
             */
            ItemSource.prototype.findItemByValue = function (value) {
                return this.sortedItems()[this.findItemIndex(this._valueToItem(value))];
            };
            /**
             * Gets the value of the specified item.
             *
             * @param item Item used to get the value.
             * @return The value of the specified item.
             */
            ItemSource.prototype.getItemValue = function (item) {
                return this._itemToValue(item);
            };
            /**
             * Gets the next item of the specified item in the source.
             *
             * @param item Item used to get the next item.
             * @return The next item in the source.
             */
            ItemSource.prototype.getNextItem = function (item) {
                return this._getAdjacentItem(item, 1);
            };
            /**
             * Gets the previous item of the specified item in the source.
             *
             * @param item Item used to get the previous item.
             * @return The previous item in the source.
             */
            ItemSource.prototype.getPreviousItem = function (item) {
                return this._getAdjacentItem(item, -1);
            };
            /**
             * Gets the value of next item using the item containing the specified value.
             *
             * @param value Value used the find base item and then get the next item value.
             * @return The value of the next item.
             */
            ItemSource.prototype.getNextValue = function (value) {
                return this._getAdjacentValue(value, 1);
            };
            /**
             * Gets the value of previous item using the item containing the specified value.
             *
             * @param value Value used the find base item and then get the previous item value.
             * @return The value of the previous item.
             */
            ItemSource.prototype.getPreviousValue = function (value) {
                return this._getAdjacentValue(value, -1);
            };
            /**
             * Finds the index of the specified item.
             *
             * @param item The item to locate.
             * @return The index of the item.
             */
            ItemSource.prototype.findItemIndex = function (item) {
                var i, len, items = this.sortedItems(), sourceItem;
                if (item) {
                    for (i = 0, len = items.length; i < len; i++) {
                        sourceItem = items[i];
                        if (this._itemsEqual(item, sourceItem)) {
                            return i;
                        }
                    }
                }
                return -1;
            };
            ItemSource.prototype._getAdjacentValue = function (value, offset) {
                return this._itemToValue(this._getAdjacentItem(this._valueToItem(value), offset));
            };
            ItemSource.prototype._getAdjacentItem = function (item, offset) {
                if (offset === void 0) { offset = 0; }
                return this.sortedItems()[this.findItemIndex(item) + offset];
            };
            ItemSource.prototype._itemsEqual = function (a, b) {
                if (!a || !b) {
                    return false;
                }
                return this._compareItems(a, b) === 0;
            };
            ItemSource.prototype._compareItems = function (a, b) {
                var a1 = (this._itemToValue(a) || "").toLocaleLowerCase(), b1 = (this._itemToValue(b) || "").toLocaleLowerCase();
                if (a1 === b1) {
                    return 0;
                }
                else if (a1 > b1) {
                    return 1;
                }
                return -1;
            };
            ItemSource.prototype._valueToItem = function (value) {
                var item = {};
                item[this.valueKey()] = value;
                return item;
            };
            ItemSource.prototype._itemToValue = function (item) {
                if (item) {
                    return ko.utils.unwrapObservable(item[this.valueKey()]);
                }
                return null;
            };
            return ItemSource;
        })();
        Main.ItemSource = ItemSource;
        var DropAdapter = (function (_super) {
            __extends(DropAdapter, _super);
            function DropAdapter() {
                _super.call(this);
            }
            Object.defineProperty(DropAdapter.prototype, "combo", {
                /**
                 * Gets the typed combo instance.
                 */
                get: function () {
                    return this._combo;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DropAdapter.prototype, "hasItems", {
                get: function () {
                    return !!this._itemSource && this._itemSource.sortedItems().length > 0;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * See parent.
             */
            DropAdapter.prototype.setCombo = function (combo) {
                var _this = this;
                var items = combo.options.items;
                _super.prototype.setCombo.call(this, combo);
                this._itemSource = new ItemSource(this.combo.options.valueKey, items, this.combo.options.filterInProgress);
                if (this.combo.options.value()) {
                    this.combo.options.filterText(this.combo.options.value());
                }
                // Subscribe to value change to set filter text when value is set initially.
                this._comboValueSubscription = this.combo.options.value.subscribe(function (newValue) {
                    if (!_this.combo.options.filterText()) {
                        _this.combo.options.filterText(newValue || "");
                    }
                });
                if (this._canShowPopupDisposable) {
                    this._canShowPopupDisposable.dispose();
                    this._canShowPopupDisposable = null;
                }
                this._canShowPopupDisposable = ko.computed(function () {
                    _this.canShowPopup(!_this.combo.options.filterInProgress());
                });
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.valuesChanged = function () {
                // Hide drop popup if a value is selected or if nothing is set in value and filterText (when combo is not set/empty)
                var filterText = this.combo.options.filterText();
                if ((!this.combo.options.value() && !filterText) || this._itemSource.findItemByValue(filterText)) {
                    this.combo.hideDropPopup();
                }
                else {
                    // Update the drop popup with new data and set focus on first row
                    this.combo.showDropPopup();
                    this._selectRows();
                }
            };
            DropAdapter.prototype.dropClick = function (evt) {
                var extension;
                // Select the first row in drop popup if filterText is not null.
                if (this.widgetExists) {
                    if (this.combo.options.value()) {
                        this.combo.options.filterText("");
                        this._selectRows();
                    }
                    else {
                        extension = this._tryGetFocusableRowExtension();
                        if (extension) {
                            extension.focusFirst(evt);
                        }
                    }
                }
            };
            DropAdapter.prototype.keyUp = function (evt) {
                if (StringUtil.localeCompareIgnoreCase(this.combo.inputValue, this.combo.options.value()) !== 0) {
                    this.combo.options.filterText(this.combo.inputValue);
                }
                $(evt.target).change();
                return true;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.enterKey = function (evt) {
                this._selectFocusedRow();
                this.combo.hideDropPopup();
                return true;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.tabKey = function (evt) {
                this._selectFocusedRow();
                return true;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.downKey = function (evt) {
                var extension, rowMetadata;
                if (this.widgetExists) {
                    // If the dropdown is visible and down key is hit, we focus the next item in the list.
                    extension = this._tryGetFocusableRowExtension();
                    if (extension) {
                        var focusedRows = extension.getFocusedRows();
                    }
                    rowMetadata = focusedRows.length > 0 ? focusedRows.get(0) : undefined;
                    if (rowMetadata) {
                        extension.focusNext(evt, rowMetadata);
                    }
                    else {
                        extension.focusFirst(evt);
                    }
                }
                else {
                    // If the dropdown is not visible and down key is hit, we open dropDown and focus on selected item
                    if (this.combo.options.value()) {
                        this.combo.options.filterText("");
                        // Force filtering so that drop down is shown and right grid row is selected.
                        this.combo.options.filterText.valueHasMutated();
                    }
                    else {
                        // If no selected item, we focus on first item.
                        this.combo.showDropPopup(false);
                        if (this.widgetExists) {
                            extension = this._tryGetFocusableRowExtension();
                            if (extension) {
                                extension.focusFirst(evt);
                            }
                        }
                    }
                }
                return false;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.upKey = function (evt) {
                var extension, rowMetadata;
                if (this.widgetExists) {
                    // If the dropdown is visible and up key is hit, we focus the previous item in the list.
                    extension = this._tryGetFocusableRowExtension();
                    if (extension) {
                        var focusedRows = extension.getFocusedRows();
                        rowMetadata = focusedRows.length > 0 ? focusedRows.get(0) : undefined;
                        if (rowMetadata) {
                            extension.focusPrevious(evt, rowMetadata);
                        }
                    }
                }
                return false;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                if (this._itemsSubscription) {
                    this._itemsSubscription.dispose();
                    this._itemsSubscription = null;
                }
                if (this._comboFilterTextSubscription) {
                    this._comboFilterTextSubscription.dispose();
                    this._comboFilterTextSubscription = null;
                }
                if (this._comboValueSubscription) {
                    this._comboValueSubscription.dispose();
                    this._comboValueSubscription = null;
                }
                if (this._canShowPopupDisposable) {
                    this._canShowPopupDisposable.dispose();
                }
                // Dispose _itemSource instance if exists.
                if (this._itemSource) {
                    this._itemSource.dispose();
                    this._itemSource = null;
                }
                if (this._selectRowsTimer) {
                    global.clearTimeout(this._selectRowsTimer);
                    this._selectRowsTimer = null;
                }
            };
            DropAdapter.prototype._createWidget = function (combo, fixture) {
                var _this = this;
                var grid, viewModel, selectedItem, selectableRowOptions, scrollRowIntoViewExtension, selectableRowExtension, allSortedItems = this._itemSource.sortedItems();
                viewModel = new Grid.ViewModel();
                selectableRowOptions = {
                    mode: ko.observable(1 /* Single */)
                };
                selectableRowExtension = new SelectableRowExtension(selectableRowOptions);
                viewModel.extensions.push(selectableRowExtension);
                viewModel.extensions.push(new FocusableRowHoverGrid.FocusableRowHoverExtension());
                scrollRowIntoViewExtension = new ScrollRowIntoViewExtension();
                viewModel.extensions.push(scrollRowIntoViewExtension);
                viewModel.showHeader = false;
                var setNoRowsMessage = false;
                setNoRowsMessage = combo.options.value() && !this._itemSource.findItemByValue(combo.options.value());
                setNoRowsMessage = setNoRowsMessage || (!combo.options.value() && combo.options.items().length === 0);
                if (setNoRowsMessage) {
                    viewModel.noRowsMessage(combo.options.noRowsMessage());
                }
                if (combo.options.columns().length === 0) {
                    // No column specified. Use default columns.
                    viewModel.columns([
                        { name: ko.observable("Name"), itemKey: "name", width: combo.options.defaultColumnWidth }
                    ]);
                }
                else {
                    // Transferring combo columns to grid
                    viewModel.columns(combo.options.columns());
                }
                if (allSortedItems.length > 0) {
                    // Workaround for grid to not show noRowsMessage when items collection is empty.
                    viewModel.items([allSortedItems[0]]);
                }
                viewModel.events = function (type, args) {
                    if (type === "select") {
                        var itemValue = _this._itemSource.getItemValue(args.selected.item);
                        combo.options.value(itemValue);
                        combo.options.filterText(itemValue);
                    }
                };
                var dropPopup = combo.element.find(".azc-editableCombo-drop-popup");
                var maxRowContentWidth;
                var dataProvider = new ScrollableExtensionDataProvider(allSortedItems, function () {
                    var rowContents = dropPopup.find(".azc-grid-groupdata>tr[role='row']>td>div.azc-grid-cellContent");
                    if (!maxRowContentWidth) {
                        for (var i = 0; i < rowContents.length; i++) {
                            var currentRowContentWidth = $(rowContents[i]).width();
                            if (!maxRowContentWidth || maxRowContentWidth < currentRowContentWidth) {
                                maxRowContentWidth = currentRowContentWidth;
                            }
                        }
                    }
                    // Setting this only when single column is present, else widths of all columns would be using the same width
                    if (maxRowContentWidth && viewModel.columns().length === 1) {
                        var gridWidth = maxRowContentWidth + 5;
                        if (dropPopup.find(".azc-grid-full").width() !== gridWidth) {
                            dropPopup.find(".azc-grid-full").css({
                                "width": gridWidth
                            });
                        }
                    }
                });
                var scrollableExtension = new ScrollableExtension({ dataProvider: dataProvider });
                viewModel.extensions.push(scrollableExtension);
                // Set maximum rows visible in the dropdown
                var rowHeight = 26;
                var rowsToShow = combo.options.rowsCount();
                if (allSortedItems.length < combo.options.rowsCount()) {
                    rowsToShow = allSortedItems.length;
                }
                combo.element.find(".azc-editableCombo-drop-popup").height(rowHeight * rowsToShow + 3);
                grid = new Grid.Widget(fixture, viewModel);
                var minWidth = Math.max(combo.widget().width(), 150);
                dropPopup.find(".azc-grid-full").css({
                    "min-width": minWidth,
                    "max-width": Math.max(500, minWidth)
                });
                return grid;
            };
            DropAdapter.prototype._selectRows = function () {
                var _this = this;
                if (this.widgetExists) {
                    this._selectRowsTimer = global.setTimeout(function () {
                        // need to check that widget exists again because we're hitting a bug that appears
                        // to be the _widget is being yanked out from under us
                        if (_this.widgetExists) {
                            var selectableRowExtension = _this._tryGetSelectableRowExtension(), focusableRowExtension = _this._tryGetFocusableRowExtension(), scrollableExtension = _this._tryGetScrollableExtension(), selectedItem = _this._itemSource.findItemByValue(_this.combo.options.value()), selectedIndex, selectedRow, rowData;
                            if (selectedItem && scrollableExtension && selectableRowExtension && focusableRowExtension) {
                                selectedIndex = _this._itemSource.findItemIndex(selectedItem);
                                if (selectedIndex) {
                                    scrollableExtension.scrollTo(selectedIndex);
                                }
                                _this._selectRowsTimer = global.setTimeout(function () {
                                    if (_this.widgetExists) {
                                        selectableRowExtension.selectRows(selectedItem);
                                        selectedRow = selectableRowExtension.getSelectedRow();
                                        rowData = selectedRow.length > 0 ? selectedRow.get(0) : undefined;
                                        if (rowData) {
                                            focusableRowExtension.focusRowByRowMetadata(ko.dataFor(rowData));
                                        }
                                    }
                                }, 150);
                            }
                            else {
                                // No selected item, retrieve first item
                                focusableRowExtension.focusFirst();
                            }
                        }
                    }, 150);
                }
            };
            DropAdapter.prototype._selectFocusedRow = function () {
                var extension, rowMetadata;
                if (this.widgetExists) {
                    // If the dropdown is visible and enter key is hit, we set the value of the selected row.
                    extension = this._tryGetFocusableRowExtension();
                    if (extension) {
                        var focusedRows = extension.getFocusedRows();
                        rowMetadata = focusedRows.length > 0 ? focusedRows.get(0) : undefined;
                        if (rowMetadata) {
                            var rowData = ko.dataFor(rowMetadata);
                            this.combo.options.value(this._itemSource.getItemValue(rowData.item));
                        }
                    }
                }
            };
            DropAdapter.prototype._tryGetSelectableRowExtension = function () {
                var plugin = null;
                if (this._widget) {
                    plugin = this._widget.getPlugin(SelectableRowGrid.SelectableRowExtension.Name);
                }
                return plugin;
            };
            DropAdapter.prototype._tryGetFocusableRowExtension = function () {
                var plugin = null;
                if (this._widget) {
                    plugin = this._widget.getPlugin(FocusableRowGrid.FocusableRowExtension.Name);
                }
                return plugin;
            };
            DropAdapter.prototype._tryGetScrollableExtension = function () {
                var plugin = null;
                if (this._widget) {
                    plugin = this._widget.getPlugin(ScrollableGrid.ScrollableExtension.Name);
                }
                return plugin;
            };
            return DropAdapter;
        })(EditableCombo.DropAdapter);
        Main.DropAdapter = DropAdapter;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._cleanElement(widgetClass);
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
            Widget.prototype._createDropAdapter = function () {
                return new DropAdapter();
            };
            Widget.prototype._createDropPopup = function () {
                var dropPopup = _super.prototype._createDropPopup.call(this);
                dropPopup.addClass(widgetDropPopupClass).addClass(widgetBgDefaultClass);
                return dropPopup;
            };
            /**
             * See parent.
             */
            Widget.prototype._valueChanged = function () {
                // Intentionally empty to make sure that drop popup is not hidden.
            };
            Widget.prototype._parseValue = function (value) {
                return value;
            };
            Widget.prototype._formatValue = function (value) {
                return value;
            };
            Widget.prototype._isSameValue = function (a, b) {
                return a === b;
            };
            return Widget;
        })(EditableCombo.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
