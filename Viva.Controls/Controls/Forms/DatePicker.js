/// <reference path="../../../Definitions/OSS/jquery.dateentry.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/DateUtil", "./DatePanel", "../Base/Validators", "../Base/Base", "./EditableCombo"], function (require, exports, DateUtil, DatePanel, Validators, Base, EditableCombo) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-datePicker", widgetDropPopupClass = "azc-datePicker-drop-popup", dropImageClass = "azc-editableCombo-drop-image", svg = "<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 15 15' enable-background='new 0 0 15 15' xml:space='preserve' focusable='false'>" + "<g id='XMLID_74'>" + "<path fill='#333940' d='M14.1,0H0.9C0.4,0,0,0.4,0,0.9V14c0,0.6,0.4,1,0.9,1H14c0.5,0,1-0.4,1-0.9V0.9C15,0.4,14.6,0,14.1,0z M14,14H1V4h13V14z'/>" + "<rect x='5' y='5' fill='#333940' width='2' height='2'/>" + "<rect x='8' y='5' fill='#333940' width='2' height='2'/>" + "<rect x='2' y='8' fill='#333940' width='2' height='2'/>" + "<rect x='5' y='8' fill='#333940' width='2' height='2'/>" + "<rect x='8' y='8' fill='#333940' width='2' height='2'/>" + "<rect x='11' y='8' fill='#333940' width='2' height='2'/>" + "<rect x='2' y='11' fill='#333940' width='2' height='2'/>" + "<rect x='5' y='11' fill='#333940' width='2' height='2'/>" + "<rect x='8' y='11' fill='#333940' width='2' height='2'/>" + "<rect x='11' y='5' fill='#333940' width='2' height='2'/>" + "</g>" + "</svg>";
        var NavigateTo;
        (function (NavigateTo) {
            NavigateTo[NavigateTo["None"] = 0] = "None";
            NavigateTo[NavigateTo["NextDay"] = 1] = "NextDay";
            NavigateTo[NavigateTo["PrevDay"] = 2] = "PrevDay";
            NavigateTo[NavigateTo["NextWeek"] = 3] = "NextWeek";
            NavigateTo[NavigateTo["PrevWeek"] = 4] = "PrevWeek";
        })(NavigateTo || (NavigateTo = {}));
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
            /**
             * See parent.
             */
            DropAdapter.prototype.allowsTyping = function () {
                // Allows typing if drop popup is not visible.
                return !this.widgetExists;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.enterKey = function (evt) {
                if (this.widgetExists) {
                    this.widget.selectFocusedDate();
                    return false;
                }
                return true;
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.downKey = function (evt) {
                return this._focusDate(3 /* NextWeek */, evt);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.upKey = function (evt) {
                return this._focusDate(4 /* PrevWeek */, evt);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.leftKey = function (evt) {
                return this._focusDate(2 /* PrevDay */, evt);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.rightKey = function (evt) {
                return this._focusDate(1 /* NextDay */, evt);
            };
            DropAdapter.prototype._createWidget = function (combo, fixture) {
                var datePanel;
                // Create a DatePanel control inside the drop popup.
                var viewModel = new DatePanel.ViewModel();
                // Sets the selectedValue using value.
                viewModel.selectedDate(combo.options.value());
                // Attaches to selectedValue changes to reflect the change in the Combo.
                viewModel.selectedDate.subscribe(function (value) {
                    combo.options.value(value);
                });
                // Attaches to visibleMonth changes to keep the focus in the input.
                viewModel.visibleMonth.subscribe(function (visibleMonth) {
                    combo.restoreFocus();
                });
                // Sets the enabled (selectable) date/time range.
                viewModel.enabledDateTimeRange = combo.options.enabledDateTimeRange;
                datePanel = new DatePanel.Widget(fixture, viewModel);
                return datePanel;
            };
            DropAdapter.prototype._focusDate = function (navigateTo, evt) {
                var focusedDate, selectedDate, selectedCalendarDate, visibleCalendarDate, newDay;
                if (this.widgetExists) {
                    // Do not propagate event (even for listeners on the same element - to prevent dateentry plugin to change the date when DatePanel opened)
                    evt.stopImmediatePropagation();
                    // Trying to determine a focused date already exists.
                    focusedDate = this.widget.options.focusedDate();
                    if (focusedDate) {
                        // Focused date exists. Advancing using that date.
                        newDay = new DatePanel.CalendarDate(focusedDate);
                        this._advanceFocusedDate(newDay, navigateTo);
                    }
                    else {
                        // Trying to use selected date for focusing if exists.
                        selectedDate = this.widget.options.selectedDate();
                        if (selectedDate) {
                            selectedCalendarDate = new DatePanel.CalendarDate(selectedDate);
                            visibleCalendarDate = new DatePanel.CalendarDate(this.widget.options.visibleMonth());
                            // Trying to determine whether the selected date is on the visible area.
                            if (selectedCalendarDate.getFullYear(true) === visibleCalendarDate.getFullYear(true) && selectedCalendarDate.getMonth(true) === visibleCalendarDate.getMonth(true)) {
                                newDay = new DatePanel.CalendarDate(selectedDate);
                                this._advanceFocusedDate(newDay, navigateTo);
                            }
                        }
                        // Focused day could not be selected so far. Focusing first day in the visible area.
                        if (!newDay) {
                            newDay = new DatePanel.CalendarDate(this.widget.options.visibleMonth()).jumpToMonthStart().jumpToWeekStart();
                        }
                    }
                    // Set the new focused date.
                    this.widget.options.focusedDate(new Date(newDay.getTime()));
                    return false;
                }
                return true;
            };
            DropAdapter.prototype._advanceFocusedDate = function (day, navigateTo) {
                switch (navigateTo) {
                    case 1 /* NextDay */:
                        day.nextDay();
                        break;
                    case 3 /* NextWeek */:
                        day.nextWeek();
                        break;
                    case 2 /* PrevDay */:
                        day.previousDay();
                        break;
                    case 4 /* PrevWeek */:
                        day.previousWeek();
                        break;
                }
            };
            return DropAdapter;
        })(EditableCombo.DropAdapter);
        Main.DropAdapter = DropAdapter;
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
            return ViewModel;
        })(EditableCombo.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._initializeDateEntryPlugin();
                this.element.addClass(widgetClass);
                this.element.find("." + dropImageClass).append(svg);
                this.element.find("." + dropImageClass).attr("tabindex", this.options.disabled() ? -1 : 0);
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
            /**
             * See base.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newValue) {
                    // this ensures value update in the dateEntry plug-in
                    // seems to be unnecessary, but without it selecting date through DatePanel in the Acceptance test does not work
                    $(_this.element.find("input")[0]).dateEntry("setDate", newValue);
                }));
                this._subscriptions.registerForDispose(viewModel.disabled.subscribe(function (newValue) {
                    _this.element.find("." + dropImageClass).attr("tabindex", newValue ? -1 : 0);
                }));
            };
            Widget.prototype._createDropAdapter = function () {
                return new DropAdapter();
            };
            Widget.prototype._createDropPopup = function () {
                var dropPopup = _super.prototype._createDropPopup.call(this);
                dropPopup.addClass(widgetDropPopupClass);
                return dropPopup;
            };
            Widget.prototype._parseValue = function (value) {
                var currentDate = this.options.value(), result = null, parsedDate = $.trim(value).split("-").map(function (item) { return parseInt(item, 10); });
                // Given a date string of "3/7/2014", parse() assumes a local time zone,
                // but given an ISO format such as "2014-03-07" it will assume a time zone of UTC.
                // This behavior is changed in ECMAScript 6 so that both will be treated as local.
                // Thus, we cannot use parse() method to parse yyyy-MM-dd, and be ES5 and ES6 compatible.
                // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
                if (parsedDate.length === 3 && !isNaN(parsedDate[0]) && !isNaN(parsedDate[1]) && !isNaN(parsedDate[2])) {
                    result = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2], currentDate && currentDate.getHours() || 0, currentDate && currentDate.getMinutes() || 0, currentDate && currentDate.getSeconds() || 0);
                }
                return result;
            };
            Widget.prototype._formatValue = function (value) {
                var result = "";
                if (value) {
                    result = DateUtil.toString(value, "yyyy'-'MM'-'dd");
                }
                return result;
            };
            Widget.prototype._isSameValue = function (a, b) {
                return DateUtil.compareDatesByDays(a, b) === 0;
            };
            Widget.prototype._createValidators = function () {
                var _this = this;
                // temporarily disable validation so that adding our built in validator doesn't immediately
                // trigger validation on control creation
                var originalEnableValidationState = this.options.enableValidation();
                this.options.enableValidation(false);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this._dayValidator !== null && _this.options.validators.indexOf(_this._dayValidator) !== -1) {
                        _this.options.validators.remove(_this._dayValidator);
                    }
                    _this._dayValidator = new Validators.DayRange(_this.options.enabledDateTimeRange().startDateTime(), _this.options.enabledDateTimeRange().endDateTime(), _this.options.enabledDateTimeRange().timezoneOffset);
                    _this.options.validators.push(_this._dayValidator);
                }));
                this.options.enableValidation(originalEnableValidationState);
            };
            // this method initialize dateEntry jQuery plugin (rich keyboard/mouse support for manipulating date)
            Widget.prototype._initializeDateEntryPlugin = function () {
                var savedDate = this.options.value();
                $(this.element.find("input")[0]).dateEntry({ spinnerImage: null, dateFormat: "ymd-" });
                this.options.value(savedDate);
            };
            return Widget;
        })(EditableCombo.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcDatePicker"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
