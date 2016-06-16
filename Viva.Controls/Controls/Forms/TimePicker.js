/// <reference path="../../../Definitions/OSS/jquery.timeentry.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Validators", "../../Util/DateUtil", "../Base/Base", "./EditableCombo"], function (require, exports, Validators, DateUtil, Base, EditableCombo) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-timePicker";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                _super.call(this);
                /**
                 * Date/time range in which user is able to select date/time.
                 */
                this.enabledDateTimeRange = ko.observable(new DateUtil.DateTimeRange());
                // Setting the defaults.
                this.value(null);
            }
            /**
             * Hour setter.
             */
            ViewModel.prototype.setHours = function (hours) {
                var currentDate = new Date(this.value().getTime());
                currentDate.setHours(hours);
                this.value(currentDate);
            };
            /**
             * Minutes setter.
             */
            ViewModel.prototype.setMinutes = function (minutes) {
                var currentDate = new Date(this.value().getTime());
                currentDate.setMinutes(minutes);
                this.value(currentDate);
            };
            /**
             * Seconds setter.
             */
            ViewModel.prototype.setSeconds = function (seconds) {
                var currentDate = new Date(this.value().getTime());
                currentDate.setSeconds(seconds);
                this.value(currentDate);
            };
            return ViewModel;
        })(EditableCombo.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._initializeTimeEntryPlugin();
                this.element.addClass(widgetClass);
                this._createValidators();
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
            Widget.prototype._parseValue = function (value) {
                var ticks = Date.parse(((this.options.value() && this.options.value().toDateString()) || new Date().toDateString()) + " " + $.trim(value)), result;
                if (isNaN(ticks)) {
                    result = this.options.value();
                }
                else {
                    result = new Date(ticks);
                }
                return result;
            };
            Widget.prototype._formatValue = function (value) {
                var result = "";
                if (value) {
                    result = DateUtil.toString(value, "HH':'mm':'ss");
                }
                return result;
            };
            Widget.prototype._isSameValue = function (a, b) {
                return DateUtil.compareDatesBySeconds(a, b);
            };
            Widget.prototype._createValidators = function () {
                var _this = this;
                // temporarily disable validation so that adding our built in validator doesn't immediately
                // trigger validation on control creation
                var originalEnableValidationState = this.options.enableValidation();
                this.options.enableValidation(false);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this._dateTimeRange !== null && _this.options.validators.indexOf(_this._dateTimeRange) !== -1) {
                        _this.options.validators.remove(_this._dateTimeRange);
                    }
                    _this._dateTimeRange = new Validators.DateTimeRange(_this.options.enabledDateTimeRange().startDateTime(), _this.options.enabledDateTimeRange().endDateTime(), _this.options.enabledDateTimeRange().timezoneOffset);
                    _this.options.validators.push(_this._dateTimeRange);
                }));
                this.options.enableValidation(originalEnableValidationState);
            };
            // this method initialize timeEntry jQuery plugin (rich keyboard/mouse support for manipulating time)
            Widget.prototype._initializeTimeEntryPlugin = function () {
                var savedTime = this.options.value();
                $(this.element.find("input")[0]).timeEntry({ showSeconds: true, spinnerImage: null, show24Hours: true });
                this.options.value(savedTime);
            };
            return Widget;
        })(EditableCombo.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcTimePicker"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
