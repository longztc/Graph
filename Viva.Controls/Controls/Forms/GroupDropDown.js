var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/Util", "../Base/ItemList", "../../Util/Detection", "../Base/Base", "../Base/ValidatableControl"], function (require, exports, Util, ItemList, Detection, Base, ValidatableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, globalFormControl = "azc-formControl", widgetInputClass = "azc-input", baseWidgetClass = "azc-dropdown", widgetClass = "azc-groupDropDown", widgetArrowNormalClass = "azc-dropdown-arrow-normal", widgetArrowHoverClass = "azc-dropdown-arrow-hover", widgetFocusedClass = "azc-dropdown-hasfocus", uuid = 0, prefixId = "__azc-groupDropDown", commentIfHasItems = "ko if: hasOwnProperty('items')", commentIfNotHasItems = "ko ifnot: hasOwnProperty('items')", commentEndKo = "/ko", itemTemplate = "<option data-bind='text: text, value: value, disable: disabled'></option>", template = "<div class='azc-dropdown-wrapper " + widgetInputClass + "' data-bind='css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }'>" + "<span class='azc-dropdown-current' data-bind='text: func._currentItemText'></span>" + "<span class='azc-dropdown-arrow' data-bind='css: func._arrowClass'></span>" + "<select class='azc-dropdown-select " + globalFormControl + "' data-bind='attr: { name: func._name }, foreach: $root.data.items, value: data.value, valueAllowUnset: true'>" + "<!--" + commentIfHasItems + "-->" + "<optgroup data-bind='disable: disabled, attr: {label: text}, foreach: items'>" + itemTemplate + "</optgroup>" + "<!-- /ko -->" + "<!--" + commentIfNotHasItems + "-->" + itemTemplate + "<!-- /ko -->" + "</select>" + "</div>";
        /**
         * GroupInfo is the ViewModel for a particular <optGroup>
         */
        var GroupInfo = (function () {
            function GroupInfo(text, disabled) {
                this.text = text;
                this.disable = disabled;
            }
            return GroupInfo;
        })();
        Main.GroupInfo = GroupInfo;
        /**
         * ItemSetting is the fields setting to inform the ViewModel.createItemValueFromData() that given array, which fields should be use as label, value, disable state and groupingId.
         */
        var ItemSetting = (function () {
            function ItemSetting(settings, itemValue, disabledKey, selectedKey, groupIdKey) {
                if (typeof settings === "object") {
                    Util.shallowCopyFromObject(this, settings);
                }
                else {
                    this.textKey = settings;
                    this.valueKey = itemValue;
                    this.disabledKey = disabledKey;
                    this.groupIdKey = groupIdKey;
                    this.selectedKey = selectedKey;
                }
            }
            return ItemSetting;
        })();
        Main.ItemSetting = ItemSetting;
        /**
         * OptionsGroupItem<TValue> is the implementaton to capture the html <optGroup> for Knockout mapping.
         */
        var OptionsGroupItem = (function () {
            function OptionsGroupItem() {
                /**
                 * Text for OptionsGroup item.
                 */
                this.text = ko.observable();
                /**
                 * OptionsGroup is disabled.
                 */
                this.disabled = ko.observable(false);
                /**
                 * children Options
                 */
                this.items = ko.observableArray();
            }
            return OptionsGroupItem;
        })();
        Main.OptionsGroupItem = OptionsGroupItem;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel(items) {
                _super.call(this);
                /**
                 * Items for populate the select/options.
                 */
                this.items = ko.observableArray();
                if (items) {
                    this.items = ko.observableArray(items);
                }
            }
            /**
             * Helper function to create a DropdownItems from dataArray with given ItemSettings and groupInfos.
             *
             * @param dataArray Array of objects represent the groupDropDown menus.
             * @param itemSetting The setting to provide which fields in the prior array object to provide text, value, disable, and groupId.
             * @param groupInfos Object with the groupId -> groupInfo mapping to provide ko.observable for <optGroup> Label and disable.
             * @return ItemList.Label[] for the ko binding for the dropdown items.
             */
            ViewModel.createDropdownItemsFromArray = function (dataArray, itemSetting, groupInfos) {
                var map = {}, groups = [], nongroup = [], itemsLength, labels = [], groupIdKey = (itemSetting) ? itemSetting.groupIdKey : null, i, groupId, optionGroup, nonGroupItem;
                dataArray = ko.utils.unwrapObservable(dataArray);
                if (!dataArray || dataArray.length === 0) {
                    return labels;
                }
                dataArray.forEach(function (item) {
                    var group, belongToGroup = false;
                    if (groupIdKey) {
                        group = item[groupIdKey];
                        if (group) {
                            if (!map.hasOwnProperty(group)) {
                                map[group] = [];
                                groups.push(group);
                            }
                            map[group].push(item);
                            belongToGroup = true;
                        }
                    }
                    if (!belongToGroup) {
                        nongroup.push(item);
                    }
                });
                // Loop through the list of found group and create OptionGroupItem for it.
                itemsLength = groups.length;
                for (i = 0; i < itemsLength; i++) {
                    groupId = groups[i], optionGroup = ViewModel.createOptionsGroupItem(groupId, map[groupId], groupInfos, itemSetting);
                    labels.push(optionGroup);
                }
                // For the items not in the group.  Create Option data for it.
                itemsLength = nongroup.length;
                for (i = 0; i < itemsLength; i++) {
                    nonGroupItem = ViewModel.createItemValueFromData(nongroup[i], itemSetting);
                    labels.push(nonGroupItem);
                }
                return labels;
            };
            /**
             * Utility function to create the ItemValue a single value for ItemValue which represent selection option tag.
             *
             * @param data the data for create an ItemVale for the <option>
             * @param itemSetting The setting to provide which fields in the prior array object to provide text, value, disable, and groupid.
             * @return A ItemList.ItemValue<TValue> for the ko binding view Model of a single <option> tag.
             */
            ViewModel.createItemValueFromData = function (data, itemSetting) {
                var item = new ItemList.ItemValue(null, null), text = data, value = data, disabled = false, selected = false;
                if (itemSetting) {
                    // hasOwnProperty() doesn't work with getter functions so even if hasOwnProperty fails
                    // we'll still check if the value is defined and use it if so
                    if (itemSetting.textKey) {
                        if (data.hasOwnProperty(itemSetting.textKey) || data[itemSetting.textKey]) {
                            text = data[itemSetting.textKey];
                        }
                    }
                    if (itemSetting.valueKey) {
                        if (data.hasOwnProperty(itemSetting.valueKey) || data[itemSetting.valueKey]) {
                            value = data[itemSetting.valueKey];
                        }
                    }
                    if (itemSetting.disabledKey) {
                        if (data.hasOwnProperty(itemSetting.disabledKey) || data[itemSetting.disabledKey]) {
                            disabled = data[itemSetting.disabledKey];
                            if (disabled === undefined) {
                                disabled = false;
                            }
                        }
                    }
                    if (itemSetting.selectedKey) {
                        if (data.hasOwnProperty(itemSetting.selectedKey) || data[itemSetting.selectedKey]) {
                            selected = data[itemSetting.selectedKey];
                            if (selected === undefined) {
                                selected = false;
                            }
                        }
                    }
                }
                item.populateFromObject({
                    text: ko.isObservable(text) ? text : ko.observable(text),
                    value: ko.isObservable(value) ? value : ko.observable(value),
                    disabled: ko.isObservable(disabled) ? disabled : ko.observable(disabled),
                    selected: ko.isObservable(selected) ? selected : ko.observable(selected)
                });
                return item;
            };
            /**
             * Utility function to create the OptionsGroupItems from a data array.  Represent select optGroup and option tag data structure.
             *
             * @param groupId The id used to identify the group. we use groupInfos[groupid] to retrive the ko.observable() for <optGroup> label and tag.
             * @param dataArray Array of objects represent the groupDropDown menus
             * @param groupInfos Object with the groupId -> groupInfo mapping to provide ko.observable for <optGroup> Label and disable.
             * @param itemSetting The setting to provide which fields in the prior array object to provide text, value, disable, and groupId.
             * @return An OptionsGroupItem<TValue> for the ko binding view Model of a single <optGroup> tag.
             */
            ViewModel.createOptionsGroupItem = function (groupId, dataArray, groupInfos, itemSetting) {
                var optionGroup = new OptionsGroupItem(), groupName = groupId, groupDisabled = false, groupInfo, options;
                if (groupInfos && groupInfos.hasOwnProperty(groupId)) {
                    groupInfo = groupInfos[groupId];
                    if (groupInfo) {
                        groupName = groupInfo.text;
                        groupDisabled = groupInfo.disable;
                    }
                }
                // preserve the original ko.observable or ko.computed
                optionGroup.text = ko.isObservable(groupName) ? groupName : ko.observable(groupName);
                optionGroup.disabled = ko.isObservable(groupDisabled) ? groupDisabled : ko.observable(groupDisabled);
                if (dataArray && dataArray.length > 0) {
                    // create children <option> ko structure.
                    options = dataArray.map(function (data) {
                        return ViewModel.createItemValueFromData(data, itemSetting);
                    });
                }
                optionGroup.items = ko.observableArray(options);
                return optionGroup;
            };
            /**
             * Returns drop down items that are of type ItemList.Value. This is a convenience for the view model consumer and is not used by the widget itself.
             *
             * @return The items from the that represent values that can be selected by the user.
             */
            ViewModel.prototype.valueItems = function () {
                var ret = [];
                this.items().forEach(function (item) {
                    if (item.value) {
                        ret.push(item);
                    }
                });
                return ret;
            };
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._arrowClass = ko.observable();
                var firstNonDisable;
                this._setNormalArrow();
                // form need id for this select
                this._name = this.options.name || (prefixId + (uuid++));
                // set up the computed value
                this._currentItemText = ko.computed(function () {
                    var retVal, foundOption, valueAny;
                    valueAny = _this.options.value();
                    foundOption = _this._findFirstMatchValue(valueAny);
                    if (foundOption) {
                        retVal = ko.utils.unwrapObservable(foundOption.text);
                    }
                    return retVal;
                });
                this._addDisposablesToCleanUp(this._currentItemText);
                this.element.addClass(baseWidgetClass).addClass(widgetClass).html(template);
                this._select = this.element.find("select.azc-dropdown-select");
                // bind hover event
                this._select.hover(function () {
                    _this._setHoverArrow();
                }, function () {
                    _this._setNormalArrow();
                });
                // bind focus/blur event
                this._select.on("focus", function () {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetFocusedClass, true);
                });
                this._select.on("blur", function () {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetFocusedClass, false);
                });
                if (Widget._isBrowserFireFox()) {
                    this._select.on("keyup." + widgetClass, function (evt, args) {
                        return _this._selectKeyUpHandler(evt, args);
                    });
                }
                // fix up IE9 select comment been removed issues.
                this.fixMissingComment(this._select);
                // if value is undefined, we fix up the behavior to be the first non-disabled item.
                if (this.options.value() === undefined) {
                    firstNonDisable = this._findFirstNonDisabledItem();
                    if (firstNonDisable) {
                        this.options.value(firstNonDisable.value());
                    }
                }
                this._initializeComputeds();
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
                if (this._select) {
                    this._select.off("mouseenter mouseleave"); // this is for unhook .hover()
                    this._select.off("focus." + widgetClass);
                    this._select.off("blur." + widgetClass);
                    if (Widget._isBrowserFireFox()) {
                        this._select.off("keyup." + widgetClass);
                    }
                    this._select = null;
                }
                _super.prototype.dispose.call(this);
                this._cleanElement(widgetFocusedClass, baseWidgetClass, widgetClass);
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
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._select[0];
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var value = _this.options.disabled();
                    // We only need to do this on the select element that we have.
                    _this._select.prop("disabled", value);
                }));
            };
            /**
             * Fix the IE9/IE8 engine remove the comments within the <select> block when DOM Element create from string.
             * As result, it remove the <-- ko if: --> from control template.
             * We explicitly detect this secnario and insert back the comment befor Knockout binding. Thus make this control works in IE8/IE9.
             *
             * @param select The select JQuery object after insersion of control template.
             */
            Widget.prototype.fixMissingComment = function (select) {
                var selectElement = select[0], firstNode = selectElement.firstChild, optGroupElement, option, optionElement;
                // The first Node of the select should be a <-- ko if: hasOwnProperty('items') -->
                // if the first Node is a <optgroup> then we are dealing with IE9/IE8 which remove the comments under <select>
                if (firstNode && firstNode.nodeName && firstNode.nodeName.toLowerCase() === "optgroup") {
                    optGroupElement = firstNode;
                    $(global.document.createComment(commentIfHasItems)).insertBefore(optGroupElement);
                    $(global.document.createComment(commentEndKo)).insertAfter(optGroupElement);
                    option = select.find(">option:first");
                    if (option) {
                        optionElement = option[0];
                        $(global.document.createComment(commentIfNotHasItems)).insertBefore(optionElement);
                        $(global.document.createComment(commentEndKo)).insertAfter(optionElement);
                    }
                }
            };
            Widget.prototype._setNormalArrow = function () {
                this._arrowClass(widgetArrowNormalClass);
            };
            Widget.prototype._setHoverArrow = function () {
                this._arrowClass(widgetArrowHoverClass);
            };
            Widget._isBrowserFireFox = function () {
                if (Widget._staticIsBrowserFireFox === undefined) {
                    Widget._staticIsBrowserFireFox = Detection.Detection.Browsers.firefox;
                }
                return Widget._staticIsBrowserFireFox;
            };
            Widget.prototype._selectKeyUpHandler = function (ev, args) {
                var keycode = ev.which;
                if (keycode) {
                    if (ev.altKey || ev.ctrlKey || keycode === 9 /* Tab */ || keycode === 16 /* Shift */) {
                        // do nothing
                        return true;
                    }
                    this._select.change();
                }
                return true;
            };
            Widget.prototype._findFirstMatchValue = function (value) {
                return this._findFirstMatchOption(function (item) {
                    return ko.utils.unwrapObservable(item.value) === value;
                });
            };
            Widget.prototype._findFirstNonDisabledItem = function () {
                return this._findFirstMatchOption(function (item) {
                    return !item.disabled();
                });
            };
            Widget.prototype._findFirstMatchOption = function (match) {
                var items, length, item, currentValue, index, i, foundValue, optGroup, childItems, childOption, childItemsLength;
                if (this.options && this.options.items) {
                    items = this.options.items();
                    length = items.length;
                    childItems = [];
                    for (index = 0; index < length; index++) {
                        item = items[index];
                        if (item.hasOwnProperty("items")) {
                            optGroup = item;
                            childItems = optGroup.items();
                            childItemsLength = childItems.length;
                            if (childItems) {
                                for (i = 0; i < childItemsLength; i++) {
                                    childOption = childItems[i];
                                    foundValue = childOption;
                                    if (match(foundValue)) {
                                        return foundValue;
                                    }
                                }
                            }
                        }
                        else {
                            foundValue = item;
                            if (match(foundValue)) {
                                return foundValue;
                            }
                        }
                    }
                }
                return null;
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcGroupDropDown"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
