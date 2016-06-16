var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./GroupDropDown", "./DatePicker", "./TimePicker", "../../Util/DateUtil", "../Base/Base", "../Base/ValidatableControl", "../../Util/Util"], function (require, exports, GroupDropDown, DatePicker, TimePicker, DateUtil, Base, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-dateTimePicker", widgetDatePickerClass = "azc-datePicker", widgetTimePickerClass = "azc-timePicker", widgetTimezoneDropDownClass = "azc-timezoneDropDown", template = "<div class=" + widgetDatePickerClass + " data-bind='azcDatePicker: data.datePicker'></div>" + "<div class=" + widgetTimePickerClass + " data-bind='azcTimePicker: data.timePicker'></div>" + "<div class=" + widgetTimezoneDropDownClass + " data-bind='azcGroupDropDown: data.timezonesDropdown, visible: data.showTimezoneDropdown'></div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                var _this = this;
                _super.call(this);
                this.datePicker = new DatePicker.ViewModel();
                this.timePicker = new TimePicker.ViewModel();
                this.value = ko.observable(null);
                this.enabledDateTimeRange = ko.observable(new DateUtil.DateTimeRange());
                this.showTimezoneDropdown = ko.observable(false);
                this._initializeTimezonesDropdown();
                // enable validation
                this.valid = ko.pureComputed(function () {
                    return _this.datePicker.valid() && _this.timePicker.valid();
                });
            }
            ViewModel.prototype._initializeTimezonesDropdown = function () {
                var _this = this;
                var itemSetting = new GroupDropDown.ItemSetting({
                    textKey: "text",
                    valueKey: "value"
                }), dropDownItems = GroupDropDown.ViewModel.createDropdownItemsFromArray(DateUtil.getLocaleValues().timezones, itemSetting, null);
                this.timezonesDropdown = new GroupDropDown.ViewModel();
                ko.utils.arrayForEach(dropDownItems, function (item) {
                    _this.timezonesDropdown.items.push(item);
                });
                this.timezonesDropdown.value(-(new Date().getTimezoneOffset())); // set timezone to user's local timezone
            };
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                // Apply the content template
                this.element.addClass(widgetClass).html(template);
                // linking
                this.options.datePicker.enabledDateTimeRange = this.options.enabledDateTimeRange;
                this.options.timePicker.enabledDateTimeRange = this.options.enabledDateTimeRange;
                this.options.enabledDateTimeRange().timezoneOffset(this.options.timezonesDropdown.value()); // bind selected timezone offset for validation
                // synchronize DatePicker and TimePicker values
                this.options.timePicker.value(this._getDisplayDate());
                this.options.datePicker.value(this._getDisplayDate());
                this._bindDescendants();
            }
            Object.defineProperty(Widget.prototype, "options", {
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
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
            /**
             * See base.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.timePicker.value.subscribe(function (newValue) {
                    if (!DateUtil.compareDatesBySeconds(newValue, _this._getDisplayDate())) {
                        var newDate = DateUtil.getLocalDate(newValue, _this.options.timezonesDropdown.value());
                        viewModel.value(newDate);
                    }
                }));
                this._subscriptions.registerForDispose(viewModel.datePicker.value.subscribe(function (newValue) {
                    if (!DateUtil.compareDatesBySeconds(newValue, _this._getDisplayDate())) {
                        var newDate = DateUtil.getLocalDate(newValue, _this.options.timezonesDropdown.value());
                        viewModel.value(newDate);
                    }
                }));
                this._subscriptions.registerForDispose(viewModel.timezonesDropdown.value.subscribe(function (newValue) {
                    viewModel.enabledDateTimeRange().timezoneOffset(newValue);
                    viewModel.value(DateUtil.getLocalDate(viewModel.datePicker.value(), newValue));
                    // HACK jjed: enforce validation by creating a new object, because display date (DatePicker.value and TimePicker.value) do not change (only the actual value), and date/time pickers are not being changed - is there a better way to do that?
                    if (!Util.isNullOrUndefined(_this.options.timePicker.value())) {
                        _this.options.timePicker.value(new Date(_this.options.timePicker.value().getTime()));
                    }
                    if (!Util.isNullOrUndefined(_this.options.datePicker.value())) {
                        _this.options.datePicker.value(new Date(_this.options.datePicker.value().getTime()));
                    }
                }));
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    if (newValue && !DateUtil.compareDatesBySeconds(_this._getDisplayDate(), viewModel.timePicker.value())) {
                        viewModel.timePicker.value(_this._getDisplayDate());
                    }
                    if (newValue && !DateUtil.compareDatesBySeconds(_this._getDisplayDate(), viewModel.datePicker.value())) {
                        viewModel.datePicker.value(_this._getDisplayDate());
                    }
                }));
            };
            Widget.prototype._getDisplayDate = function () {
                return DateUtil.getDateWithOffset(this.options.value(), this.options.timezonesDropdown.value());
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcDateTimePicker"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
