var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./DatePanel", "../Base/Base", "./EditableCombo", "../../Util/DateUtil"], function (require, exports, DatePanel, Base, EditableCombo, DateUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-dateTimeCombo", widgetDropPopupClass = "azc-dateTimeCombo-drop-popup", svg = "<svg viewBox='0 0 15 15'>" + "<path d='M14.2,0H0.9C0.4,0,0,0.4,0,0.9V14c0,0.6,0.4,1,0.9,1h13.2c0.5,0,0.9-0.4,0.9-0.9V0.9 C15.1,0.4,14.7,0,14.2,0z M14,14H1V4h13V14z'/>" + "<rect x='5' y='5' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='8' y='5' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='2' y='8' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='5' y='8' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='8' y='8' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='11' y='8' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='2' y='11' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='5' y='11' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='8' y='11' fill='#A0A1A2' width='2' height='2'/>" + "<rect x='11' y='5' fill='#A0A1A2' width='2' height='2'/>" + "</svg>";
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
                return this._focusDate(3 /* NextWeek */);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.upKey = function (evt) {
                return this._focusDate(4 /* PrevWeek */);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.leftKey = function (evt) {
                return this._focusDate(2 /* PrevDay */);
            };
            /**
             * See parent.
             */
            DropAdapter.prototype.rightKey = function (evt) {
                return this._focusDate(1 /* NextDay */);
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
            DropAdapter.prototype._focusDate = function (navigateTo) {
                var focusedDate, selectedDate, selectedCalendarDate, visibleCalendarDate, newDay;
                if (this.widgetExists) {
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
                 * A valid format string specifier (see DateUtil format), used to format the value.
                 */
                this.formatString = ko.observable("D");
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
                this.element.addClass(widgetClass);
                this.element.find(".azc-editableCombo-drop-image").append(svg);
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
            Widget.prototype._createDropAdapter = function () {
                return new DropAdapter();
            };
            Widget.prototype._createDropPopup = function () {
                var dropPopup = _super.prototype._createDropPopup.call(this);
                dropPopup.addClass(widgetDropPopupClass);
                return dropPopup;
            };
            Widget.prototype._parseValue = function (value) {
                var ticks = Date.parse($.trim(value));
                if (isNaN(ticks)) {
                    return null;
                }
                return new Date(ticks);
            };
            Widget.prototype._formatValue = function (value) {
                if (!value) {
                    return "";
                }
                return DateUtil.toString(value, this.options.formatString());
            };
            Widget.prototype._isSameValue = function (a, b) {
                if (!a || !b) {
                    return false;
                }
                return a.getTime() === b.getTime();
            };
            return Widget;
        })(EditableCombo.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcDateTimeCombo"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
