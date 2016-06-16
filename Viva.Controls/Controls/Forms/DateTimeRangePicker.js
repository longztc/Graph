var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./DateTimePicker", "../../Util/DateUtil", "../Base/Base", "../Base/ValidatableControl", "../../Util/Util"], function (require, exports, DateTimePicker, DateUtil, Base, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-dateTimeRangePicker", widgetStartDateTimePickerClass = "azc-dateTimePicker-startDateTime", widgetEndDateTimePickerClass = "azc-dateTimePicker-endDateTime", template = "<div class=" + widgetStartDateTimePickerClass + " data-bind='azcDateTimePicker: data.startDateTime'></div>" + "<div class=" + widgetEndDateTimePickerClass + " data-bind='azcDateTimePicker: data.endDateTime'></div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                var _this = this;
                _super.call(this);
                // init start and end DateTimePickers
                this.startDateTime = new DateTimePicker.ViewModel();
                this.endDateTime = new DateTimePicker.ViewModel();
                // enable validation
                this.valid = ko.pureComputed(function () {
                    return _this.startDateTime.valid() && _this.endDateTime.valid();
                });
                this.showTimezoneDropdown = ko.observable(false);
                this.displayFieldsInline = ko.observable(false);
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                // Apply the content template
                this.element.addClass(widgetClass).html(template);
                if (this.options.displayFieldsInline()) {
                    this.element.addClass("inline");
                }
                // expose DateTimeRange as control value
                if (!Util.isNullOrUndefined(this.options.value())) {
                    this.options.startDateTime.value(this.options.value().startDateTime());
                    this.options.endDateTime.value(this.options.value().endDateTime());
                    this.options.endDateTime.timezonesDropdown.value(this.options.value().timezoneOffset());
                }
                // combine timezone dropdowns into 1 reference
                this.options.startDateTime.timezonesDropdown.value = this.options.endDateTime.timezonesDropdown.value;
                // display only endDateTime timezone dropdown
                this.options.endDateTime.showTimezoneDropdown = this.options.showTimezoneDropdown;
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
                // link DataTimeRange value with startDateTime and endDateTime pickers
                // TODO jjed: are nested subscriptions ok? do we have memory leaks in this case?
                this._subscriptions.registerForDispose(this.options.value.subscribe(function (newValue) {
                    if (_this._dateTimeRangeLifetimeManager) {
                        _this._dateTimeRangeLifetimeManager.dispose();
                        _this._dateTimeRangeLifetimeManager = null;
                    }
                    _this._dateTimeRangeLifetimeManager = _this._subscriptions.createChildLifetime();
                    _this.options.startDateTime.value(_this.options.value().startDateTime());
                    _this._dateTimeRangeLifetimeManager.registerForDispose(_this.options.value().startDateTime.subscribe(function (newValue) {
                        if (!DateUtil.compareDatesBySeconds(_this.options.startDateTime.value(), newValue)) {
                            _this.options.startDateTime.value(newValue);
                        }
                    }));
                    _this.options.endDateTime.value(_this.options.value().endDateTime());
                    _this._dateTimeRangeLifetimeManager.registerForDispose(_this.options.value().endDateTime.subscribe(function (newValue) {
                        if (!DateUtil.compareDatesBySeconds(_this.options.endDateTime.value(), newValue)) {
                            _this.options.endDateTime.value(newValue);
                        }
                    }));
                    _this.options.endDateTime.timezonesDropdown.value(_this.options.value().timezoneOffset());
                    _this._dateTimeRangeLifetimeManager.registerForDispose(_this.options.value().timezoneOffset.subscribe(function (newValue) {
                        _this.options.endDateTime.timezonesDropdown.value(newValue);
                    }));
                }));
                this._subscriptions.registerForDispose(this.options.startDateTime.value.subscribe(function (newValue) {
                    _this.options.value().startDateTime(newValue);
                }));
                this._subscriptions.registerForDispose(this.options.endDateTime.value.subscribe(function (newValue) {
                    _this.options.value().endDateTime(newValue);
                }));
                this._subscriptions.registerForDispose(this.options.endDateTime.timezonesDropdown.value.subscribe(function (newValue) {
                    _this.options.value().timezoneOffset(newValue);
                }));
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcDateTimeRangePicker"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
