var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../../Util/Util", "./ValidatableControl"], function (require, exports, TemplateEngine, Util, ValidatableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uniqueId = 0, prefixId = "__azc-itemList", widgetClass = "azc-itemList", selectedClass = "azc-itemlist-selected", itemtemplateName = "itemTemplate", template = "<ul data-bind='template: { name: \"itemTemplate\", foreach: data.values, templateEngine: customTemplateEngine}, attr: { \"aria-disabled\": data.disabled, role: func._roleGroup, \"aria-labelledby\": data.label }'></ul>", itemTemplateString = "<li data-bind='text: text, attr: { role: $root.func._role, \"aria-checked\": selected() ? \"true\": \"false\", \"aria-disabled\": disabled() || $root.data.disabled() ? \"true\": \"false\", disabled: disabled() || $root.data.disabled(), tabindex: _tabindex }, css: { \"azc-itemlist-selected\": selected()}' />";
        /**
         * View model representing the properties for an item in item list.
         */
        var ItemValue = (function () {
            /**
             * Creates a new instance of view model representing the item in item list.
             *
             * @param text The text data binding for item.
             * @param value The value data binding for item.
             * @param selected The item is selected.
             * @param disabled The item is disabled.
             */
            function ItemValue(text, value, selected, disabled) {
                // To avoid recursive destroy been called.  We keep array of DestroyID.
                this._destroyIds = [];
                this._subscriptions = [];
                this.text = ko.observable();
                this.value = ko.observable();
                this.selected = ko.observable(false);
                this.disabled = ko.observable(false);
                this._tabindex = ko.observable(-1);
                this.text(text);
                this.value(value);
                if (selected) {
                    this.selected(selected);
                }
                if (disabled) {
                    this.disabled(true);
                }
            }
            /**
             * _checkExistsOrRegisterDestroyId.  This is utility function for the destroy method to avoid recursive
             *
             * @param destroyId Unique identifier for the destroy to identify itself.  In the javascript inheritance, this.destroy is always the same.
             *                  But super.dispose is unique since super is function scope.  Typically, use super.dispose as id. For root object, use null as Id.
             * @return whether this destroyMethod is already on the executed. If true, mean it is already been executed.
             */
            ItemValue.prototype._checkExistsOrRegisterDestroyId = function (destroyId) {
                return Util.existsOrRegisterId(this._destroyIds, destroyId);
            };
            /**
             * See interface.
             */
            ItemValue.prototype.isDestroyed = function () {
                return this._destroyIds.length > 0;
            };
            /**
             * Frees up the items resources.
             */
            ItemValue.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(null)) {
                    return;
                }
                this._disposeSubscriptions();
            };
            /**
             * Populates the view model from a key/value pairs object.
             * The keys should map to properties on the view model.
             * The values are applied to the corresponding keys.
             *
             * @param object An un-typed object with values to populate on the view model.
             */
            ItemValue.prototype.populateFromObject = function (object) {
                Util.shallowCopyToObserableFromObject(this, object, ["text", "value", "selected", "disabled"]);
            };
            /**
             * Helper method allowing you to subscribe to knockout objects.
             *
             * @param subscription The KnockoutSubscription associated with observable in ItemValue.
             */
            ItemValue.prototype._initializeSubscriptions = function (subscription) {
                this._subscriptions.push(subscription);
            };
            /**
             * Helper method allowing you to unsubscribe from previously subscribed functions.
             */
            ItemValue.prototype._disposeSubscriptions = function () {
                if (this._subscriptions) {
                    while (this._subscriptions.length) {
                        this._subscriptions.splice(0, 1)[0].dispose();
                    }
                }
            };
            return ItemValue;
        })();
        Main.ItemValue = ItemValue;
        /**
         * View model representing the properties for item list widget.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                _super.call(this);
                this.label = null;
                this.values = ko.observableArray();
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        /**
         * Abstract widget that handles value as a list.
         * Support ARIA with arrow keypress.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngineInstance = new TemplateEngine.StringTemplateEngine();
                this._setName();
                this._setRole();
                this._templateEngineInstance.setTemplate(itemtemplateName, this._attachItemTemplate());
                this.element.addClass(widgetClass).html(template);
                this._attachEvents();
                this._bindDescendants();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.off("keydown.itemList", "li").off("focusout.itemList", "li").off("focusin.itemList", "li").off("click.itemList", "li");
                this._cleanElement(widgetClass);
                _super.prototype.dispose.call(this);
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
                var elements = this.widget().find("li[tabindex='0']");
                return elements.length > 0 ? elements[0] : null;
            };
            /**
             * Set the options' name to the generated value if name is not set by the user.
             */
            Widget.prototype._setName = function () {
                if (!this.options.name) {
                    this.options.name = prefixId + (uniqueId++);
                }
            };
            Widget.prototype._setRole = function () {
                this._role = "item";
                this._roleGroup = "itemList";
            };
            /**
             * The ko data-bind template string for each list item used by the ItemList template engine.
             *
             * @return The template string for li.
             */
            Widget.prototype._attachItemTemplate = function () {
                return itemTemplateString;
            };
            Widget.prototype._set = function (value) {
                value.selected(true);
            };
            Widget.prototype._isSameValue = function (a, b) {
                return a === b || (a !== undefined && a !== null && b !== undefined && b !== null && a.text === b.text && a.value === b.value);
            };
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.values.subscribe(function () {
                    // TODO guruk: - handle dynamic ItemValue array changes.
                }));
                // subscribe to selected and disabled observable for each ItemValue.
                var itemValues = this.options.values();
                itemValues.forEach(function (item) {
                    item._initializeSubscriptions(item.selected.subscribe(_this._itemSelectedSubscriber(item), _this));
                    item._initializeSubscriptions(item.disabled.subscribe(_this._itemDisabledSubscriber(item), _this));
                    item.selected.notifySubscribers(item.selected());
                    item.disabled.notifySubscribers(item.disabled());
                });
                // subscribe to value observable.
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    _this._valueChangedSubscriber(newValue);
                }));
                viewModel.value.notifySubscribers(viewModel.value());
                // subscribe to disabled observable for the ItemList.
                this._subscriptions.registerForDispose(viewModel.disabled.subscribe(function (newValue) {
                    _this._widgetDisabledSubscriber(newValue);
                }));
                viewModel.disabled.notifySubscribers(viewModel.disabled());
            };
            Widget.prototype._disposeSubscriptions = function () {
                _super.prototype._disposeSubscriptions.call(this);
                var itemValues = this.options.values();
                itemValues.forEach(function (item) {
                    item._disposeSubscriptions();
                });
            };
            /**
             * Binds the view model with the element.
             *
             * @param extraViewModel Extra view model you can attach to the Knockout view model.
             */
            Widget.prototype._bindDescendants = function (extraViewModel) {
                var vm = { customTemplateEngine: this._templateEngineInstance }, finalVm = extraViewModel ? $.extend(null, vm, extraViewModel) : vm;
                _super.prototype._bindDescendants.call(this, finalVm);
            };
            // handler for item selected value changes.
            Widget.prototype._valueChangedSubscriber = function (newValue) {
                var _this = this;
                if (newValue) {
                    if (this.options.values.indexOf(newValue) < 0) {
                        throw new Error("View model item value must be set to one of the initialized values from view model's 'values' array.");
                    }
                    if (newValue.disabled()) {
                        throw new Error("View model's value must not have disabled property set to true.");
                    }
                    if (!newValue.selected()) {
                        newValue.selected(true);
                    }
                }
                var itemValues = this.options.values();
                itemValues.forEach(function (item) {
                    if (newValue) {
                        if (item !== newValue) {
                            _this._unselectItemValue(item);
                        }
                    }
                    else {
                        _this._unselectItemValue(item);
                    }
                });
                // Handle tabindex logic
                if (newValue) {
                    // set tabindex to 0 for the selected item.
                    newValue._tabindex(0);
                }
                else {
                    // set tabindex to 0 for the first and last item which is not disabled.
                    this._setUnselectedTabIndex();
                }
            };
            // handler for item list disabled changes.
            Widget.prototype._widgetDisabledSubscriber = function (newValue) {
                var value = this.options.value();
                if (newValue) {
                    this.element.attr("aria-disabled", "true");
                    if (value) {
                        value._tabindex(-1);
                    }
                }
                else {
                    this.element.removeAttr("aria-disabled");
                    this.options.value.notifySubscribers(value);
                }
            };
            // handler for item selected changes. Utilizes itemValue closure.
            Widget.prototype._itemSelectedSubscriber = function (itemValue) {
                return function (newValue) {
                    if (newValue) {
                        this.options.value(itemValue);
                    }
                    else {
                        if (itemValue === this.options.value()) {
                            this.options.value(null);
                        }
                    }
                };
            };
            // handler for item disabled changes. Utilizes itemValue closure.
            Widget.prototype._itemDisabledSubscriber = function (itemValue) {
                return function (newValue) {
                    var selected;
                    if (newValue) {
                        itemValue._tabindex(-1);
                        if (itemValue === this.options.value()) {
                            this.options.value(null);
                        }
                    }
                    else {
                        selected = itemValue.selected();
                        if (selected) {
                            itemValue.selected.notifySubscribers(selected);
                        }
                    }
                };
            };
            Widget.prototype._attachEvents = function () {
                var that = this;
                this.element.on("click.itemList", "li", function () {
                    var itemValue = ko.dataFor(this);
                    if (that.options.disabled() || itemValue.disabled() || itemValue.selected()) {
                        // do nothing if widget is disabled or item is disabled or selected.
                        return;
                    }
                    that._clicked(itemValue);
                }).on("focusin.itemList", "li", function () {
                    var itemValues, itemValue;
                    // Turn off any tabindex if we have nothing selected so we can tab out
                    if (that.element.find("[aria-checked=true]").length === 0) {
                        itemValues = that.options.values();
                        itemValue = ko.dataFor(this);
                        itemValues.forEach(function (item) {
                            if (itemValue !== item) {
                                item._tabindex(-1);
                            }
                        });
                    }
                }).on("focusout.itemList", "li", function () {
                    if (that.element.find("[aria-checked=true]").length === 0) {
                        that._setUnselectedTabIndex();
                    }
                }).on("keydown.itemList", "li", function (evt) {
                    var $this = $(this), index, item, items = $this.parent().find("li");
                    switch (evt.which) {
                        case 32 /* Space */:
                            $this.click();
                            return false;
                        case 37 /* Left */:
                        case 38 /* Up */:
                            for (index = $this.index() - 1; index >= 0; index--) {
                                item = items.eq(index);
                                if (!that._isItemDisabled(item)) {
                                    item.focus().click();
                                    return false; // Prevent the page to scroll
                                }
                            }
                            break;
                        case 39 /* Right */:
                        case 40 /* Down */:
                            for (index = $this.index() + 1; index <= that.options.values().length; index++) {
                                item = items.eq(index);
                                if (!that._isItemDisabled(item)) {
                                    item.focus().click();
                                    return false; // Prevent the page to scroll
                                }
                            }
                            break;
                    }
                });
            };
            Widget.prototype._clicked = function (value) {
                this._trigger("click", null, { value: value });
                this._set(value);
            };
            Widget.prototype._isItemDisabled = function (item) {
                return item.attr("aria-disabled") === "true";
            };
            // set tabindex to 0 for first and last item which is not disabled. Minor optimization traversing the itemList from both ends.
            Widget.prototype._setUnselectedTabIndex = function () {
                var i = 0, length = this.options.values().length, j = length - 1, firstFound = false, lastFound = false, values = this.options.values();
                if (!this.options.disabled()) {
                    for (i = 0; i <= j; i++, j--) {
                        if (!firstFound && !values[i].disabled()) {
                            values[i]._tabindex(0);
                            firstFound = true;
                        }
                        if (!lastFound && !values[j].disabled()) {
                            values[j]._tabindex(0);
                            lastFound = true;
                        }
                        if (firstFound && lastFound) {
                            break;
                        }
                    }
                }
            };
            Widget.prototype._unselectItemValue = function (value) {
                if (!value.disabled()) {
                    value.selected(false);
                    value._tabindex(-1);
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
