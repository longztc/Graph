var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Lists/Grid1/Grid.Formatters.Helpers", "../Lists/Grid1/Grid.SelectableRow", "../Lists/Grid1/Grid.FocusableRowHover", "../Lists/Grid1/Grid", "./ComboDropBase", "../Lists/Grid1/Grid.Formatters", "../../Util/Util", "../Base/Base", "../Base/ValidatableControl", "./GroupDropDown", "../../Util/StringUtil", "../../Util/ArrayUtil"], function (require, exports, HelpersFormattersGrid, SelectableRowGrid, FocusableRowHoverGrid, Grid, ComboDropBase, FormattersGrid, Util, Base, ValidatableControl, GroupDropDown, StringUtil, ArrayUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var slice = Array.prototype.slice, global = window, $ = jQuery, _debugPreventHidePopup = false, baseWidgetClass = "azc-dropdown", widgetClass = "azc-multiSelectDropDown", widgetPopup = "azc-multiSelectDropDown-popup", widgetBgDefaultClass = "azc-bg-default", widgetArrowNormalClass = "azc-dropdown-arrow-normal", widgetArrowHoverClass = "azc-dropdown-arrow-hover", widgetFocusedClass = "azc-dropdown-hasfocus", widgetCurrentClass = "azc-dropdown-current", widgetSelectClass = "azc-dropdown-select", widgetInputClass = "azc-input", widgetInputElementClass = "azc-dropdown-input", uuid = 0, prefixId = "__azc-multiSelectDropDown", template = "<div class='azc-dropdown-wrapper " + widgetInputClass + "', data-bind='css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused()}'>" + "<input class='" + widgetInputElementClass + "' type='hidden' data-bind='attr: { name: func._name }, value: data.value' autocomplete='off' readonly='readonly' />" + "<!-- ko if: data.multiselect -->" + "<span class='" + widgetCurrentClass + "' data-bind='text: func._currentText'></span>" + "<!-- /ko -->" + "<!-- ko ifnot: data.multiselect -->" + "<span class='" + widgetCurrentClass + "' data-bind='htmlBinding: func._currentText'></span>" + "<!-- /ko -->" + "<span class='azc-dropdown-arrow' data-bind='css: func._arrowClass'></span>" + "<div class='" + widgetSelectClass + "'></div>" + "</div>";
        /**
         * Drop adapter using Grid
         */
        var DropAdapter = (function (_super) {
            __extends(DropAdapter, _super);
            function DropAdapter() {
                _super.apply(this, arguments);
            }
            /**
             * Helper function to get the Element that we want to style min-width.
             */
            DropAdapter.prototype.getInnerElement = function (fixture) {
                return fixture.find(".azc-grid-container");
            };
            /**
             * See parent. MultiSelect box doesn't allow typing.
             */
            DropAdapter.prototype.allowsTyping = function () {
                return false;
            };
            /**
             * See parent.  Not Yet implement.
             */
            DropAdapter.prototype.enterKey = function (evt) {
                if (this.widgetExists) {
                    //this.widget.handleEnter();
                    return false;
                }
                return true;
            };
            /**
             * See parent. Not Yet implement.
             */
            DropAdapter.prototype.downKey = function (evt) {
                if (this.widgetExists) {
                    //this.widget.handleKeyDown();
                    return false;
                }
                return true;
            };
            /**
             * See parent. Not Yet implement.
             */
            DropAdapter.prototype.upKey = function (evt) {
                if (this.widgetExists) {
                    //this.widget.handleKeyUp();
                    return false;
                }
                return true;
            };
            /**
             * See parent. Not Yet implement.
             */
            DropAdapter.prototype.leftKey = function (evt) {
                if (this.widgetExists) {
                    //this.widget.handleKeyLeft();
                    return false;
                }
                return true;
            };
            /**
             * See parent. Not Yet implement.
             */
            DropAdapter.prototype.rightKey = function (evt) {
                if (this.widgetExists) {
                    //this.widget.handleKeyRight();
                    return false;
                }
                return true;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype._createWidget = function (combo, fixture) {
                var grid;
                // Create a DatePanel control inside the drop popup.
                var selectableRowOptions = {}, gridOption = { showHeader: combo.options.showHeader || ko.observable(false) }, viewModel = new Grid.ViewModel(), widget = combo;
                widget._beforePopupWidgetCreated();
                if (!combo.options.multiselect || combo.options.multiselect()) {
                    selectableRowOptions.mode = ko.observable(2 /* MultipleAdd */);
                }
                else {
                    selectableRowOptions.mode = ko.observable(1 /* Single */);
                }
                viewModel.extensions.push(new SelectableRowGrid.SelectableRowExtension(selectableRowOptions));
                viewModel.extensions.push(new FocusableRowHoverGrid.FocusableRowHoverExtension());
                viewModel.summary = combo.options.dropdownPopupName || ko.observable("multiselect dropdown popup");
                viewModel.columns = combo.options.itemsData.displayColumns;
                viewModel.items = combo.options.itemsData.items;
                viewModel.rowMetadata = combo.options.itemsData.rowMetadata();
                viewModel.showHeader = gridOption.showHeader();
                grid = new Grid.Widget(fixture, viewModel);
                return grid;
            };
            return DropAdapter;
        })(ComboDropBase.DropAdapter);
        Main.DropAdapter = DropAdapter;
        var ItemsData = (function () {
            function ItemsData() {
                /**
                 * Data displayed in the table based on the column definitions.
                 */
                this.items = ko.observableArray([]);
                /**
                 * Row metadata used for the data.
                 */
                this.rowMetadata = ko.observableArray([]);
                /**
                 * Column definitions.
                 */
                this.displayColumns = ko.observableArray([]);
            }
            return ItemsData;
        })();
        Main.ItemsData = ItemsData;
        var ItemSetting = (function (_super) {
            __extends(ItemSetting, _super);
            function ItemSetting(settings, itemValue, disabledKey, selectedKey, groupIdKey, cellFormatter) {
                _super.call(this, settings);
                if (typeof settings !== "object") {
                    this.textKey = settings;
                    this.valueKey = itemValue;
                    this.disabledKey = disabledKey;
                    this.groupIdKey = groupIdKey;
                    this.selectedKey = selectedKey;
                    this.formatter = cellFormatter;
                }
            }
            return ItemSetting;
        })(GroupDropDown.ItemSetting);
        Main.ItemSetting = ItemSetting;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Turns on or off multiselect.
                 */
                this.multiselect = ko.observable(true);
                /**
                 * Show DropDown Grid header on or off.
                 */
                this.showHeader = ko.observable(false);
                /**
                 * Accessable name for the dropdown popup.
                 */
                this.dropdownPopupName = ko.observable("multiselect dropdown popup");
                /**
                 * Array of objects represent the groupDropDown menus.
                 */
                this.itemsData = new ItemsData();
                /**
                 * Indicate value/selection is initialized.
                 * If false, it will initialize the value from Items.selected states.
                 * If true, it will honor value and make sure the Items.selected states match current value.
                 */
                this.valueInitialized = false;
                /**
                 * The total select Rows ocunt currently in the drop down.
                 */
                this.selectedRowsCount = ko.observable(0);
                /**
                 * The displayString
                 */
                this.selectedDisplayString = ko.observable();
                /**
                 * Maximum select rows counts.  When max is reached, the control will disable all the unselected item.
                 */
                this.maxSelectAllowed = ko.observable();
                /**
                 * Display Text Format when it is under max allowed.
                 * By default. the format string is "{0} selected"
                 * The first argument({0}) is the selected rows count, for example, 3.
                 * The second argument({1}) is the input value is going to submit, for example, "val1;val2;val3".
                 * The third argument({2}) is the display value , for example, "display1;display2;display3".
                 */
                this.multiItemsDisplayFormat = ko.observable("");
                /**
                 * Display Text Format when max is reached.
                 * By default. the format string is "max {0} selected"
                 * The first argument({0}) is the selected rows count, for example, 3.
                 * The second argument({1}) is the input value is going to submit, for example, "val1;val2;val3".
                 * The third argument({2}) is the display value , for example, "display1;display2;display3".
                 */
                this.multiItemsMaxDisplayFormat = ko.observable("");
                /**
                 * Flag to allow max is reached, the control will disable all the unselected item and remember which item it disabled.
                 * If true, when the selectedRowsCount() >= maxSelectAllowed, widget will remember which items that are disabled by widget.
                 * Such that when later on, selectedRowsCount() < maxSelectAllowed, widget will enable those items it previoius disabled.
                 * If false, when the selectedRowsCount() > maxSelectAllowed,  widget will not track which item it disabled, it will disable all items that are unselected.
                 * when later on, selectedRowsCount() < maxSelectAllowed, widget will enable All item that are unselected
                 */
                this.trackMaxSelectDisabledItems = true;
                /**
                 * Flag to allow  max is reached, the control will disable all the unselected items.
                 * If true, when the selectedRowsCount() >= maxSelectAllowed, disable unselected bse on this.trackMaxSelectDisabledItems settings.
                 * Such that when later on, selectedRowsCount() < maxSelectAllowed, widget will enable those items are previously disabled.
                 */
                this.disableItemsWhenMaxReached = true;
                /**
                 * Value Separator for combining the selected item into a <input> value. For example, "val1;val2;val5".
                 * We use standard javascript split function.  Can be a string.
                 * By default, we use String.fromCharCode(0x1d). 0x1d is the <GS>, group separator, in ascii code which is not visible in the text box.
                 * If you need to see this in the display text, change it to different character, or string.
                 */
                this.valueSeparator = String.fromCharCode(0x1d);
                /**
                 * Display Separator for combining the selected item into a displayable string. For example, "display1;display2;display3".
                 * We use standard javascript split function.  Can be a string.
                 * By default, we use ";" -- since this need to be visible.
                 */
                this.displaySeparator = ";";
                /**
                 * Important events which the viewModel might want to react.
                 * Currently it fire 3 type of events, "select", "offMaxSelected",and "onMaxSelected".
                 *
                 * @param type Type of the event. For example, "select", "offMaxSelected", or "onMaxSelected".
                 * @param args optional arguments.
                 *       "select" with args type of Viva.Controls.Lists.Grid.SelectableRowEventObject.
                 *       "offMaxSelected"/"onMaxSelected" with args type of Viva.Controls.MultiSelectDropDown.MaxSelectedEventObject.
                 */
                this.events = $.noop;
            }
            /**
             * Helper function to create a DropdownItems from dataArray with given ItemSettings and groupInfos.
             *
             * @param dataArray Array of objects represent the groupDropDown menus.
             * @param itemSetting The setting to provide which fields in the prior array object to provide text, value, disable, and groupid.
             * @param groupInfos Object with the groupId -> groupInfo mapping to provide ko.observable for <optGroup> Label and disable.
             * @return ItemsData[] for the ko binding for the dropdown items.
             */
            ViewModel.createDropdownItemsFromArray = function (data, itemSetting, groupInfos) {
                var dropDownItems = new ItemsData(), columns, rowMetadata = [], textKey, disableKey, valueKey, selectedKey, cellFormatter = FormattersGrid.text, needToClone = false, itemSettingNames = [], cloneData = [];
                if (itemSetting) {
                    textKey = itemSetting.textKey;
                    valueKey = itemSetting.valueKey;
                    selectedKey = itemSetting.selectedKey;
                    disableKey = itemSetting.disabledKey;
                    cellFormatter = (itemSetting.formatter) ? itemSetting.formatter : FormattersGrid.text;
                    itemSettingNames = Object.getOwnPropertyNames(itemSetting) || [];
                }
                // if user never specified the textKey, we create a fake column for Grid.
                if (!textKey && !valueKey) {
                    needToClone = true;
                    textKey = valueKey = "__text";
                }
                else {
                    if (!textKey) {
                        textKey = valueKey;
                    }
                    else if (!valueKey) {
                        valueKey = textKey;
                    }
                }
                // default column name. file, and formatter.
                columns = [
                    {
                        name: ko.observable(""),
                        itemKey: textKey,
                        formatter: cellFormatter
                    }
                ];
                itemSettingNames = itemSettingNames.filter(function (value) {
                    if (value && value.length > 3) {
                        if (value.substring(value.length - 3) === "Key") {
                            if (value !== "textKey" && value !== "valueKey") {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                // For each item in the data, we create corresponding RowMetadata.
                // If display field is not specified field, we create an object and put the item on the __text column.
                data.forEach(function (item) {
                    var selected, disabled, cloneItem, thisRowMetadata = {};
                    if (needToClone) {
                        cloneItem = {
                            __text: item
                        };
                        cloneData.push(cloneItem);
                    }
                    thisRowMetadata.item = (needToClone) ? cloneItem : item;
                    itemSettingNames.forEach(function (itemKey) {
                        if (itemKey && itemKey.length > 3) {
                            var itemPropertyName = itemSetting[itemKey], metaDataKeyName = itemKey.substr(0, itemKey.length - 3), itemValue;
                            if (item.hasOwnProperty(itemPropertyName)) {
                                itemValue = item[itemPropertyName];
                                thisRowMetadata[metaDataKeyName] = ko.isObservable(itemValue) ? itemValue : ko.observable(itemValue);
                            }
                            else {
                                thisRowMetadata[metaDataKeyName] = ko.observable();
                            }
                        }
                    });
                    if (thisRowMetadata.selected === undefined) {
                        thisRowMetadata.selected = ko.observable(false);
                    }
                    if (thisRowMetadata.disabled === undefined) {
                        thisRowMetadata.disabled = ko.observable(false);
                    }
                    rowMetadata.push(thisRowMetadata);
                });
                dropDownItems.displayColumns(columns);
                rowMetadata.forEach(function (metadata) {
                    dropDownItems.rowMetadata.push(metadata);
                });
                if (needToClone) {
                    dropDownItems.items(cloneData);
                }
                else {
                    dropDownItems.items(data);
                }
                dropDownItems.valueKey = valueKey;
                return dropDownItems;
            };
            /**
             * Helper for the user to ensure the InputValue in-sync with the value property.
             *
             * @param ItemsData Data for the drop down items setting.
             */
            ViewModel.prototype.initializeItemsData = function (itemsData) {
                this.itemsData = itemsData;
                this._initializedSelectedRowsValue();
            };
            /**
             * Returns the current selected DropDownItemMetadata[].
             *
             * @return Array of DropDownItemMetatata.
             */
            ViewModel.prototype.getSelectedRows = function () {
                var rowsMetadata = this.itemsData.rowMetadata(), selectedItems = [];
                if (rowsMetadata) {
                    rowsMetadata.forEach(function (metadata) {
                        if (metadata.hasOwnProperty("selected")) {
                            if (metadata.selected.peek()) {
                                selectedItems.push(metadata);
                            }
                        }
                    });
                }
                return selectedItems;
            };
            /**
             * Converts the selectedRow Metadata into the input value. Used by widget.
             *
             * @param selectedRows The current selectedRows.
             * @return String for current selected items value, for example "val1;val2;val3".
             */
            ViewModel.prototype.convertToInputValue = function (selectedRows) {
                return ViewModel._convertSelectedRowsToString(selectedRows, this.itemsData.valueKey, this.valueSeparator);
            };
            /**
             * Converts the selectedRow Metadata into the display string.
             *
             * @param selectedRows The current selectedRows.
             * @return string of current selected items label, for example "display1;display;display3".
             */
            ViewModel.prototype.convertToDisplayString = function (selectedRows) {
                return ViewModel._convertSelectedRowsToString(selectedRows, this.itemsData.displayColumns()[0].itemKey, this.displaySeparator);
            };
            /**
             * Sets the input value base on the currented selected row.  It keep in sync with the SelectedRowsCount and value.
             *
             * @param selectedRows The current selectedRows.
             * @return Whether value is updated.
             */
            ViewModel.prototype.setInputValue = function (selectedRows) {
                var newValue = this.convertToInputValue(selectedRows), newDisplay = this.convertToDisplayString(selectedRows), value = this.value(), valueUpdated = false;
                this.selectedRowsCount(selectedRows.length);
                this.selectedDisplayString(newDisplay);
                if (!this._isSameValue(value, newValue) || (newValue === "" && value !== newValue)) {
                    this.value(newValue);
                    valueUpdated = true;
                }
                return valueUpdated;
            };
            /**
             * Compares if newValue is the same as initialValue.
             * In this Widget, it basically compares to array which parse by the separator.
             *
             * @param a Value 1.
             * @param b Value 2.
             * @return True if both values are the same.
             */
            ViewModel.prototype._isSameValue = function (a, b) {
                var aArray = this._convertInputValueToArray(a), bArray = this._convertInputValueToArray(b), index = 0, found = 0;
                if (aArray.length === bArray.length) {
                    for (index = 0; index < aArray.length; index++) {
                        found = bArray.indexOf(aArray[index]);
                        if (found < 0) {
                            break;
                        }
                        else {
                            bArray.splice(found, 1);
                        }
                    }
                    // if we found all match item, the bArray should be empty.
                    // if it is not empty, it means, there are some item in A is not exists in bArray.
                    return bArray.length === 0;
                }
                return false;
            };
            /**
             * Converts the value string (val1;val2;val3) into a array base on this.valueSeparator.  In addition, it also remove the empty strings.
             *
             * @param value The value of currently multiselected value, for example, "val1;val2;;val5";
             * @return array of the string values for example, ["val1", "val2", "val5"].
             * Note, the empty strings will be removed.
             */
            ViewModel.prototype._convertInputValueToArray = function (value) {
                var selectedValue = [], length = 0, index = 0;
                if (value) {
                    if (this.valueSeparator && value) {
                        selectedValue = value.split(this.valueSeparator);
                    }
                    while ((index = selectedValue.indexOf("", index)) >= 0) {
                        selectedValue.splice(index, 1);
                    }
                }
                return selectedValue;
            };
            /**
             * Helps to keep the DropDowmItem selected metadata synchronized with the  value string (val1;val2;val3).
             */
            ViewModel.prototype._initializedSelectedRowsValue = function () {
                if (!this.valueInitialized) {
                    var selectedItems = this.getSelectedRows();
                    this.selectedRowsCount(selectedItems.length);
                    this.setInputValue(selectedItems);
                    this.valueInitialized = true;
                }
            };
            ViewModel._convertSelectedRowsToString = function (selectedRows, keyValue, stringSeparator) {
                var newValue = "";
                selectedRows.forEach(function (selectedRow) {
                    var currentValue;
                    if (keyValue && selectedRow.item.hasOwnProperty(keyValue)) {
                        currentValue = selectedRow.item[keyValue];
                    }
                    else {
                        currentValue = selectedRow.item;
                    }
                    if (newValue) {
                        newValue += stringSeparator;
                    }
                    newValue += ko.utils.unwrapObservable(currentValue);
                });
                return newValue;
            };
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                this._rowSelectChangedNotify = ko.observable(0);
                this._currentText = ko.observable();
                this._arrowClass = ko.observable();
                this._preventCreateDropDown = false;
                this._maxSelectDisabled = [];
                this._preventValueUpdate = false;
                this._originalFirstColumnFormatter = FormattersGrid.text;
                this._timeoutHidePopUp = 10;
                this._timeoutPreventBlur = 200;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                var columns;
                this._setNormalArrow();
                // form need id for this select
                this._id = (prefixId + (uuid++));
                this._name = this.options.name || this._id;
                this.element.addClass(baseWidgetClass).addClass(widgetClass).html(template);
                this._updateFirstColumnFormatter();
                this._dropAdapter = this._createDropAdapter();
                this._select = this.element.find("." + widgetSelectClass);
                this._input = this.element.find("." + widgetInputElementClass);
                this._current = this.element.find("." + widgetCurrentClass);
                // bind hover event
                this._select.hover(function () {
                    _this._setHoverArrow();
                }, function () {
                    _this._setNormalArrow();
                }).on("focus." + widgetClass, function () {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetFocusedClass, true);
                }).on("blur." + widgetClass, function () {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetFocusedClass, false);
                });
                this._initializeComputeds();
                this._monitorRowMetadataChange(false);
                this._bindDescendants();
                this._afterCreate();
                this._supportsFocus(true);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._resetSelectedDisposables();
                this._hideDropPopup();
                this._detachEvents();
                _super.prototype.dispose.call(this);
                this._cleanElement(widgetFocusedClass, baseWidgetClass, widgetClass);
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (value) {
                    _this._selectedValueChanged(value);
                }));
                this._subscriptions.registerForDispose(viewModel.multiselect.subscribe(function (value) {
                    _this._multiselectChanged(value);
                }));
                this._subscriptions.registerForDispose(viewModel.maxSelectAllowed.subscribe(function (value) {
                    _this._maxSelectAllowedChanged(value);
                }));
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
             * Restores the focus on the input element to handle key events.
             */
            Widget.prototype.restoreFocus = function () {
                this._select.focus();
            };
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._select[0];
            };
            Widget.prototype._beforePopupWidgetCreated = function () {
                this._updateFirstColumnFormatter();
            };
            Widget.prototype._resetSelectedDisposables = function () {
                if (this._selectedDisposeables) {
                    this._selectedDisposeables.forEach(function (item) {
                        item.dispose();
                    });
                }
                this._selectedDisposeables = [];
            };
            Widget.prototype._updateFirstColumnFormatter = function () {
                var _this = this;
                if (this._prevItemData !== this.options.itemsData) {
                    this._prevItemData = this.options.itemsData;
                    this._resetSelectedDisposables();
                    var columns = this.options.itemsData.displayColumns();
                    if (columns && columns.length > 0) {
                        this._firstColumn = columns[0];
                        this._originalFirstColumnFormatter = this._firstColumn.formatter || FormattersGrid.text;
                    }
                    this._multiSelectFormatter = function (value, settings) {
                        var args = slice.call(arguments, 1), cellFormatter = _this._originalFirstColumnFormatter;
                        return "<span class='azc-multiSelectDropDown-popup-checkbox azc-br-default'>" + "<svg class='azc-check-svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns: xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='11px' height='11px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml: space='preserve' >" + "<path d ='M0.632,8.853L0.101,8.278C-0.037,8.126-0.037,7.885,0.123,7.74l1.534-1.418c0.073-0.066,0.16-0.101,0.255-0.101c0.108,0,0.204,0.044,0.276,0.123l4.218,4.523l7.258-9.296c0.073-0.094,0.182-0.145,0.298-0.145c0.088,0,0.167,0.029,0.233,0.081l1.659,1.28c0.081,0.059,0.13,0.145,0.145,0.248c0.007,0.101-0.015,0.204-0.081,0.276L6.595,15.246L0.632,8.853z'></path>" + "</svg>" + "</span>" + "<div class='azc-multiSelectDropDown-popup-value'>" + HelpersFormattersGrid.callFormatter(cellFormatter, value, args) + "</div>";
                    };
                    // always ensure the DisplayFormat to match the multiselect or single select
                    this._setDisplayFormatter(this.options.multiselect());
                    this._updateSelectedState(this.options.value(), false);
                    // after update the formatter, update the text
                    this._updateCurrentText();
                    this._selectedDisposeables.push(ko.computed(function () {
                        // setup monitor on the view models selected properties change on all rows such that programmicatlly change can be honnered.
                        _this._monitorRowMetadataChange(true);
                    }));
                }
            };
            Widget.prototype._toggleSelectionChangeTrigger = function () {
                this._rowSelectChangedNotify((this._rowSelectChangedNotify.peek() + 1) & 0xffff);
            };
            Widget.prototype._monitorRowMetadataChange = function (triggerChange) {
                if (triggerChange === void 0) { triggerChange = false; }
                var rowsMetadata = this.options.itemsData.rowMetadata(), selectedItems = [];
                if (rowsMetadata) {
                    rowsMetadata.forEach(function (metadata) {
                        if (metadata.hasOwnProperty("selected")) {
                            if (metadata.selected()) {
                                selectedItems.push(metadata);
                            }
                        }
                    });
                }
                if (triggerChange) {
                    this._toggleSelectionChangeTrigger();
                }
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    // We only need to do this on the select element that we have.
                    _this._input.prop("disabled", disabled);
                    _this._hideDropPopup();
                    // add tabindex to div if enabled. removed tabindex if disabled.
                    if (disabled) {
                        _this._select.removeAttr("tabindex");
                        _this._detachEvents();
                    }
                    else {
                        _this._select.attr("tabindex", 0);
                        _this._attachEvents();
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed({
                    read: function () {
                        _this._updateCurrentText();
                    },
                    deferEvaluation: true
                }));
                // Note:
                // Due to complicated Grid.ViewModel and value two way sync, there are a lot of observable / computed value in each function.
                // It will end up go in to recursion of function calls if we use ko.computed on these value.  Instead, we explicit on subscribe
                // on change explicitally except the last one.  Please do not change these to computed value.
                // Intialize initial value.
                this._selectedValueChanged(this.options.value());
                // Intialize multiselect initial value.
                this._multiselectChanged(this.options.multiselect());
                // Intialize the maxSelectAllowed.
                this._maxSelectAllowedChanged(this.options.maxSelectAllowed());
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var value = _this.options.multiItemsDisplayFormat();
                    _this._updateCurrentText();
                }));
                this._attachEvents();
                // setup monitor on the view models selected properties change on all rows such that programmicatlly change can be honnered.
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (!_this._preventValueUpdate) {
                        var rowSelectedChanged = _this._rowSelectChangedNotify(), originalSelectedItem = _this.options.getSelectedRows(), originalSelectedValue = _this.options.convertToInputValue(originalSelectedItem), value = _this.options.value();
                        if (!_this.options._isSameValue(value, originalSelectedValue)) {
                            _this._rowSelectChanged();
                        }
                    }
                }));
            };
            Widget.prototype._setNormalArrow = function () {
                this._arrowClass(widgetArrowNormalClass);
            };
            Widget.prototype._setHoverArrow = function () {
                this._arrowClass(widgetArrowHoverClass);
            };
            Widget.prototype._computeCurrentMultiItemsText = function () {
                var selectedCount = this.options.selectedRowsCount(), selectedDisplayString = this.options.selectedDisplayString(), value = this.options.value(), maxSelectAllowed = this.options.maxSelectAllowed(), displayText = this.options.multiItemsDisplayFormat() || "{0} selected"; // TODO lmchen: resource
                if (maxSelectAllowed) {
                    if (selectedCount >= maxSelectAllowed) {
                        displayText = this.options.multiItemsMaxDisplayFormat() || "max {0} selected"; // TODO lmchen: resource
                    }
                }
                return StringUtil.format(displayText, selectedCount, value, selectedDisplayString);
            };
            Widget.prototype._computeCurrentSingleItemText = function () {
                var result, text, selectedItems, multiselect = this.options.multiselect();
                if (!multiselect) {
                    selectedItems = this.options.getSelectedRows();
                    if (selectedItems.length === 1 && this._firstColumn && this._originalFirstColumnFormatter) {
                        text = selectedItems[0].item[this._firstColumn.itemKey];
                        result = this._originalFirstColumnFormatter(text);
                    }
                }
                return result;
            };
            Widget.prototype._updateCurrentText = function () {
                if (this.options.multiselect()) {
                    this._currentText(this._computeCurrentMultiItemsText());
                }
                else {
                    this._currentText(this._computeCurrentSingleItemText());
                }
            };
            Widget.prototype._maxSelectAllowedChanged = function (maxSelectAllowed) {
                if (maxSelectAllowed > 0) {
                    var selectedItems = this.options.getSelectedRows();
                    this._maxSelected(selectedItems, -1);
                }
                else {
                    if (this._maxSelectDisabled && this._maxSelectDisabled.length > 0) {
                        this._maxSelectDisabled.forEach(function (metadata) {
                            metadata.disabled(false);
                        });
                    }
                    this._maxSelectDisabled = [];
                }
            };
            /**
             * Handles viewmodel multiselect property changed.
             *
             * @param isMultiSelect True if options.multiselect() is true.
             */
            Widget.prototype._multiselectChanged = function (isMultiSelect) {
                // If it is not multiselected, we need to ensure one and only one entry is being selected.
                // If the currently selected is more than 1, we pick the first one.
                // If there is no currently selected row, we mimic the browser <select> default behavior.
                // That is, pick the first non-disabled items.  If all are disabled, pick the first item.
                if (!isMultiSelect) {
                    var selectedItems = this.options.getSelectedRows(), rowsMetadata = this.options.itemsData.rowMetadata(), firstNonDisable = null;
                    if (rowsMetadata.length > 0) {
                        if (selectedItems.length <= 0) {
                            // if none are selected, we first try to find the first non-disabled item.
                            // if all item are disabled, we pick the first item.
                            firstNonDisable = ArrayUtil.first(rowsMetadata, function (item) {
                                return !item.disabled();
                            });
                            this._setInputValue([firstNonDisable || rowsMetadata[0]]);
                        }
                        else if (selectedItems.length > 1) {
                            this._setInputValue([selectedItems[0]]);
                        }
                    }
                }
                // always ensure the DisplayFormat to match the multiselect or single select
                this._setDisplayFormatter(isMultiSelect);
                // after update the formatter, update the text
                this._updateCurrentText();
            };
            Widget.prototype._setDisplayFormatter = function (isMultiSelect) {
                if (this._originalFirstColumnFormatter && this._firstColumn) {
                    this._firstColumn.formatter = (isMultiSelect) ? this._multiSelectFormatter : this._originalFirstColumnFormatter;
                }
            };
            Widget.prototype._setInputValue = function (selectedRows) {
                if (this.options.setInputValue(selectedRows)) {
                    if (this._input) {
                        // Notify event change on the <input>.
                        // Grid rely on change event to update it dirty state.
                        var changeEvent = $.Event("change"), value = this.options.value();
                        this._input.trigger(changeEvent, value);
                    }
                }
            };
            Widget.prototype._selectedValueChanged = function (value) {
                this._updateSelectedState(value);
                this._updateCurrentText();
            };
            /**
             * Overriden by EditableCombo derivatives to create specific DropAdapter.
             *
             * @return The newly created DropAdapter.
             */
            Widget.prototype._createDropAdapter = function () {
                return new DropAdapter();
            };
            Widget.prototype._createDropPopup = function () {
                var width = this.element.width(), height = this.element.height(), offset = this.element.offset(), scrollTop = $(window).scrollTop(), scrollLeft = $(window).scrollLeft(), popup = $("<div class='azc-control azc-multiSelectDropDown-popup " + widgetBgDefaultClass + " " + widgetPopup + "' data-popup='true'></div>").attr("id", this._id);
                popup.css({
                    top: offset.top + height - scrollTop,
                    left: offset.left - scrollLeft
                });
                this._positionPopup(popup);
                return popup;
            };
            /**
             * Repositions the popup if it doesn't have enough space to be shown.
             *
             * @param popup The popup to reposition.
             */
            Widget.prototype._positionPopup = function (popup) {
                var top = 0, left = 0, offset = this.element.offset(), width = this.element.outerWidth(), height = this.element.outerHeight(), popupWidth = popup.outerWidth(), popupHeight = popup.outerHeight(), $global = $(global), documentWidth = $global.width(), documentHeight = $global.height(), scrollableParents = Util.getScrollableParents(this.element, false);
                // Add the body, we need its scrollTop
                if (scrollableParents.length === 0) {
                    scrollableParents = scrollableParents.add($("body"));
                }
                if (popupHeight === 0 || documentHeight - offset.top - height > popupHeight || offset.top - scrollableParents[0].scrollTop < popupHeight) {
                    top = offset.top + height;
                }
                else {
                    top = offset.top - popupHeight;
                }
                if (popupWidth === 0 || documentWidth - offset.left > popupWidth) {
                    left = offset.left;
                }
                else {
                    left = offset.left - (popupWidth - width);
                }
                popup.css({
                    top: parseInt(top.toString(), 10),
                    left: parseInt(left.toString(), 10)
                });
            };
            /**
             * Shows the drop popup. If already visible, hides it first.
             */
            Widget.prototype._showDropPopup = function () {
                var _this = this;
                if (!this.options.disabled()) {
                    var $drop = $("<div/>"), innerElement, widget, fontStyle = this.element.css(["font-family", "font-size", "font-weight"]);
                    // Destroy popup if exists
                    this._hideDropPopup();
                    // Create drop popup element
                    this._popup = this._createDropPopup();
                    $drop.appendTo(this._popup);
                    // Note that we want to inherit the font from the parent.
                    $drop.css(fontStyle);
                    widget = this._dropAdapter.createWidget(this, $drop);
                    widget.options.events = function (type, args) {
                        if (type === "select") {
                            _this._rowSelectChanged();
                            // forward the event.
                            _this.options.events("select", args);
                        }
                    };
                    innerElement = this._dropAdapter.getInnerElement($drop);
                    innerElement.css("min-width", this.element.width());
                    this._popup.appendTo(this.element);
                    this._positionPopup(this._popup);
                    this._scrollableParents = Util.getScrollableParents(this.element, false);
                    this._scrollableParents.on("scroll.multiselectDropDown", this._parentScrollHandler = function (evt) {
                        _this._hideDropPopup();
                    });
                    this._popup.on("mousedown." + widgetPopup, this._dropPopupMouseDownHandler = function (evt) {
                        _this._preventBlur();
                    }).on("focusin." + widgetPopup, this._dropPopupFocusInHandler = function (evt) {
                        _this._removeHidePopupTimer();
                        _this._preventBlur(function () {
                            _this.restoreFocus();
                        });
                    });
                    // We need to wire up the OnBlurHandler if it not already wired up.
                    if (!this._inputBlurHandler) {
                        this._select.on("blur." + widgetSelectClass, this._inputBlurHandler = function (evt) {
                            // we require another timer here to handle the case that IE/Chrome events sequence.
                            // In Chrome, DropPopup.MouseDown happen before the Select.Blur.  Such that Blur can be prevented by this._blurPrevented.
                            // In IE, Select.Blur happen before DropPopup.MouseDown().  this._blurPrevented have no effect.
                            // To handle IE case, we setup a shorter timer for hidePopup(), if Popup.FocusIn happen right after Blur happens.
                            // Popup.FocusIN will remove this timer (this._blurHidePopupHandle) see 5 line above.
                            // thus effectively prevent hidepopup() in IE cases.
                            _this._removeHidePopupTimer();
                            if (!_this._blurPrevented) {
                                _this._blurHidePopupHandle = global.setTimeout(function () {
                                    _this._hideDropPopup();
                                    _this._removeHidePopupTimer();
                                }, _this._timeoutHidePopUp);
                            }
                        });
                    }
                    this._select.attr("aria-owns", this._popup.attr("id")).attr("aria-expanded", true);
                }
            };
            /**
             * Hides the drop popup.
             */
            Widget.prototype._hideDropPopup = function () {
                if (_debugPreventHidePopup) {
                    return;
                }
                // clean up all the timers and setting relate to blur/popup
                this._blurPrevented = false;
                this._removeHidePopupTimer();
                this._removePreventingBlurTimer();
                // ensure the widget is destroy
                if (this._dropAdapter) {
                    this._dropAdapter.destroyWidget();
                }
                // unhook all the events.
                if (this._popup) {
                    if (this._dropPopupMouseDownHandler) {
                        this._popup.off("mousedown." + widgetPopup, this._dropPopupMouseDownHandler);
                        this._dropPopupMouseDownHandler = null;
                    }
                    if (this._dropPopupFocusInHandler) {
                        this._popup.off("focusin." + widgetPopup, this._dropPopupFocusInHandler);
                        this._dropPopupFocusInHandler = null;
                    }
                    this._popup.remove();
                    this._popup = null;
                }
                // Unsubscribe scroll event
                if (this._scrollableParents) {
                    this._scrollableParents.off("scroll.multiselectDropDown", this._parentScrollHandler);
                    this._scrollableParents = null;
                    this._parentScrollHandler = null;
                }
                if (this._inputBlurHandler) {
                    this._select.off("blur." + widgetSelectClass, this._inputBlurHandler);
                    this._inputBlurHandler = null;
                }
                if (this._select) {
                    this._select.removeAttr("aria-owns").attr("aria-expanded", false);
                }
            };
            /**
             * This notifies blur event not to Hides drop popup because
             * something in the drop area is clicked. For these scenarios,
             * drop popup still needs to be visible.
             *
             * @param func Function to execute after setting this.blurPrevented.
             */
            Widget.prototype._preventBlur = function (func) {
                var _this = this;
                this._blurPrevented = true;
                if (func) {
                    func();
                }
                // Reset the timer to clear the this._blurPrevented flag.
                // so the 0.2 second to allow the child div enough time to process all the tasks/message
                // it need to finish
                // clear the old timer if exists.
                this._removePreventingBlurTimer();
                // setup the new timer.
                this._blurPreventHandle = global.setTimeout(function () {
                    _this._cancelPreventingBlur();
                }, this._timeoutPreventBlur);
            };
            /**
             * Toggles the drop popup of the combo.
             */
            Widget.prototype._toggleDropPopup = function () {
                if (this._popup) {
                    this._hideDropPopup();
                }
                else {
                    this._showDropPopup();
                }
                this.restoreFocus();
            };
            Widget.prototype._cancelPreventingBlur = function () {
                this._blurPrevented = false;
                this._removePreventingBlurTimer();
            };
            /**
             * Clears the prevent blur timeout.
             */
            Widget.prototype._removePreventingBlurTimer = function () {
                if (this._blurPreventHandle) {
                    global.clearTimeout(this._blurPreventHandle);
                    this._blurPreventHandle = null;
                }
            };
            /**
             * Clears the hidePopup timeout.
             */
            Widget.prototype._removeHidePopupTimer = function () {
                if (this._blurHidePopupHandle) {
                    global.clearTimeout(this._blurHidePopupHandle);
                    this._blurHidePopupHandle = null;
                }
            };
            /**
             * Attaches event handlers.
             */
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._select.on("click." + widgetSelectClass, this._dropInputClickHandler = function (evt) {
                    _this._toggleDropPopup();
                }).on("keydown." + widgetSelectClass, this._inputKeyDownHandler = function (evt) {
                    return _this._onKeyDown(evt);
                });
                this.element.on("rowSelect", this._rowSelectHandler = function (evt) {
                    // Prevent selection events on the multiselect dropdown from propagating back to parent divs (in case this control is hosted in a grid)
                    evt.stopPropagation();
                });
            };
            /**
             * Detaches event handlers.
             */
            Widget.prototype._detachEvents = function () {
                if (this._dropInputClickHandler) {
                    this._select.off("click." + widgetSelectClass, this._dropInputClickHandler);
                    this._dropInputClickHandler = null;
                }
                if (this._inputBlurHandler) {
                    this._select.off("blur." + widgetSelectClass, this._inputBlurHandler);
                    this._inputBlurHandler = null;
                }
                if (this._inputKeyDownHandler) {
                    this._select.off("keydown." + widgetSelectClass, this._inputKeyDownHandler);
                    this._inputKeyDownHandler = null;
                }
                if (this._rowSelectHandler) {
                    this.element.off("rowSelect", this._rowSelectHandler);
                    this._rowSelectHandler = null;
                }
            };
            Widget.prototype._onKeyDown = function (evt) {
                if (this._dropAdapter && !this._dropAdapter.keyDown(evt)) {
                    // Adapter handled the keydown event itself and wants to prevet the default behavior.
                    return false;
                }
                switch (evt.which) {
                    case 9 /* Tab */:
                        // This will prevent drop popup to steal the focus, if drop popup is visible.
                        // If not visible, hideDropPopup is noop.
                        this._hideDropPopup();
                        break;
                    case 27 /* Escape */:
                        // Hides the drop popup if visible and then prevent the default behavior.
                        // Nothing to do otherwise.
                        if (this._popup) {
                            this._hideDropPopup();
                            return false;
                        }
                        break;
                    case 40 /* Down */:
                        if (evt.altKey) {
                            // Alt + down key opens up the drop popup if not already visible.
                            if (!this._popup) {
                                this._showDropPopup();
                                return false;
                            }
                        }
                        else {
                            // Adapter handles the down key.
                            if (this._dropAdapter) {
                                return this._dropAdapter.downKey(evt);
                            }
                        }
                        break;
                    case 38 /* Up */:
                        // Adapter handles the up key.
                        if (this._dropAdapter) {
                            return this._dropAdapter.upKey(evt);
                        }
                        break;
                    case 37 /* Left */:
                        // Adapter handles the left key.
                        if (this._dropAdapter) {
                            return this._dropAdapter.leftKey(evt);
                        }
                        break;
                    case 39 /* Right */:
                        // Adapter handles the right key.
                        if (this._dropAdapter) {
                            return this._dropAdapter.rightKey(evt);
                        }
                        break;
                    default:
                        // Adapter may prevent typing for certain conditions.
                        if (this._dropAdapter) {
                            if (!this._dropAdapter.allowsTyping()) {
                                return false;
                            }
                        }
                        break;
                }
                return true;
            };
            Widget.prototype._maxSelected = function (selectedItems, originalCount) {
                var _this = this;
                var rowsMetadata = this.options.itemsData.rowMetadata(), maxSelectdEventObject, onMaxSelected = false, offMaxSelected = false, selectedItemsCount = selectedItems.length, maxSelectAllowed = this.options.maxSelectAllowed();
                if (maxSelectAllowed) {
                    if (originalCount < 0) {
                        // special case when maxSelectAllowed changed.
                        onMaxSelected = selectedItemsCount >= maxSelectAllowed;
                        offMaxSelected = !onMaxSelected;
                    }
                    else {
                        if (selectedItemsCount >= maxSelectAllowed) {
                            if (originalCount < maxSelectAllowed) {
                                onMaxSelected = true;
                                offMaxSelected = false;
                            }
                            else {
                                onMaxSelected = true;
                                offMaxSelected = true;
                            }
                        }
                        else if (selectedItemsCount < maxSelectAllowed) {
                            if (originalCount >= maxSelectAllowed) {
                                onMaxSelected = false;
                                offMaxSelected = true;
                            }
                        }
                    }
                    // We always handle OffMaxSelected first. In the case that user programatically change the selected values, where the new selected and original are more than Max rows allowed.
                    // it will have to restore to original state and relook on what's does the new value trigger the disable of the other row.
                    if (offMaxSelected) {
                        maxSelectdEventObject = {
                            selectedItems: selectedItems,
                            originalSelectedCount: originalCount
                        };
                        this.options.events("offMaxSelected", maxSelectdEventObject);
                        if (this.options.disableItemsWhenMaxReached) {
                            if (this.options.trackMaxSelectDisabledItems) {
                                this._maxSelectDisabled.forEach(function (metadata) {
                                    metadata.disabled(false);
                                });
                            }
                            else {
                                // if it not tracking, for all. we enable every not selected item
                                rowsMetadata.forEach(function (metadata) {
                                    if (!metadata.selected()) {
                                        metadata.disabled(false);
                                    }
                                });
                            }
                        }
                        this._maxSelectDisabled = [];
                    }
                    if (onMaxSelected) {
                        this._maxSelectDisabled = [];
                        maxSelectdEventObject = {
                            selectedItems: selectedItems,
                            originalSelectedCount: originalCount
                        };
                        this.options.events("onMaxSelected", maxSelectdEventObject);
                        if (this.options.disableItemsWhenMaxReached) {
                            this._maxSelectDisabled.length = 0;
                            rowsMetadata.forEach(function (metadata) {
                                var disabled = metadata.disabled(), selected = metadata.selected();
                                if (!selected && !disabled) {
                                    metadata.disabled(true);
                                    if (_this.options.trackMaxSelectDisabledItems) {
                                        _this._maxSelectDisabled.push(metadata);
                                    }
                                }
                            });
                        }
                    }
                }
            };
            // Specific call back to allow the Adapter's widget
            Widget.prototype._rowSelectChanged = function () {
                if (!this._preventValueUpdate) {
                    var selectedItems = this.options.getSelectedRows(), rowsMetadata = this.options.itemsData.rowMetadata(), originalCount = this.options.selectedRowsCount(), maxSelectAllowed = this.options.maxSelectAllowed();
                    this._preventValueUpdate = true;
                    this._setInputValue(selectedItems);
                    this._preventValueUpdate = false;
                    if (maxSelectAllowed) {
                        this._maxSelected(selectedItems, originalCount);
                    }
                }
                if (!this.options.multiselect()) {
                    this._hideDropPopup();
                }
            };
            Widget.prototype._updateSelectedState = function (value, hidePopup) {
                if (hidePopup === void 0) { hidePopup = true; }
                if (!this._preventValueUpdate) {
                    var selectedValue = [], selectedItems = [], valueKey, rowsMetadata, originalSelectedItem = this.options.getSelectedRows(), originalSelectedValue = this.options.convertToInputValue(originalSelectedItem), originalCount = originalSelectedItem.length, singleSelect = !this.options.multiselect(), maxSelectAllowed = this.options.maxSelectAllowed();
                    if (!this.options._isSameValue(value, originalSelectedValue)) {
                        if (this.options.itemsData && this.options.itemsData.rowMetadata) {
                            rowsMetadata = this.options.itemsData.rowMetadata();
                            valueKey = this.options.itemsData.valueKey;
                        }
                        if (rowsMetadata) {
                            this._preventValueUpdate = true;
                            if (this.options.valueSeparator && value) {
                                selectedValue = value.split(this.options.valueSeparator);
                            }
                            // unselect all
                            rowsMetadata.forEach(function (metadata) {
                                metadata.selected(false);
                            });
                            // select those in the selected value.
                            if (selectedValue && selectedValue.length > 0) {
                                if (singleSelect) {
                                    selectedValue.length = 1;
                                }
                                rowsMetadata.forEach(function (metadata) {
                                    var dataItem = metadata.item, index, value;
                                    if (dataItem) {
                                        value = ko.utils.unwrapObservable(dataItem.hasOwnProperty(valueKey) ? dataItem[valueKey] : dataItem);
                                        index = selectedValue.indexOf(value);
                                        if (index >= 0) {
                                            metadata.selected(true);
                                            selectedItems.push(metadata);
                                            selectedValue.splice(index, 1);
                                        }
                                    }
                                });
                            }
                            this._setInputValue(selectedItems);
                            if (maxSelectAllowed) {
                                this._maxSelected(selectedItems, originalCount);
                            }
                            if (hidePopup) {
                                this._hideDropPopup();
                            }
                            this._preventValueUpdate = false;
                        }
                    }
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcMultiSelectDropDown"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
