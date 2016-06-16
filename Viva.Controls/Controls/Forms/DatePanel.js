var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../../Util/DateUtil", "../Base/Base", "../../Util/Util"], function (require, exports, TemplateEngine, DateUtil, Base, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, numberOfWeeks = 6, widgetHeaderClass = "azc-header", widgetClass = "azc-datePanel", widgetBgDefaultClass = "azc-bg-default", template = "<div class='azc-datePanel-quick-navigation " + widgetHeaderClass + "'>" + "<a class='azc-datePanel-link azc-datePanel-prev-month' href='#'></a>" + "<span class='azc-datePanel-month-year' data-bind='text: func._headerText'></span>" + "<a class='azc-datePanel-link azc-datePanel-next-month' href='#'></a>" + "</div>" + "<!-- ko template: { name: 'daysTable', templateEngine: customTemplateEngine } --><!-- /ko -->", templateDaysTable = "<table class='azc-datePanel-days'>" + "<!-- ko template: { name: 'daysHeader', templateEngine: customTemplateEngine } --><!-- /ko -->" + "<!-- ko template: { name: 'daysBody', templateEngine: customTemplateEngine } --><!-- /ko -->" + "</table>", templateDaysHeader = "<thead>" + "<tr class='azc-datePanel-day-names' data-bind='template: { name: \"daysHeaderColumn\", foreach: data.dayNames, templateEngine: customTemplateEngine }'></tr>" + "</thead>", templateDaysHeaderColumn = "<th data-bind='text: $data'></th>", templateDaysBody = "<tbody data-bind='template: { name: \"daysBodyRow\", foreach: func._days, templateEngine: customTemplateEngine }'></tbody>", templateDaysBodyRow = "<tr class='days' data-bind='template: { name: \"daysBodyColumn\", foreach: $data.weekDays, templateEngine: $root.customTemplateEngine }'></tr>", templateDaysBodyColumn = "<td data-bind='css: { \"azc-datePanel-selected azc-bg-selected\": $data.selected(), \"azc-datePanel-other-month\": $data.otherMonth(), \"azc-datePanel-focused azc-bg-hover\": $data.focused() }'>" + "<a class='azc-datePanel-day' data-bind='text: $data.value, css: { \"azc-text-white\": $data.selected(), \"azc-datePanel-link\": $data.isEnabled(), \"azc-text-disabled\": !$data.isEnabled() }, attr: { href: $data.isEnabled() ? \"#\" : null }'></a>" + "</td>";
        /**
          * Represents a date object which takes different calendar types other than
          * GregorianCalendar in to account as well (like HijriCalendar, ThaiBuddhistCalendar).
          *
          * If the calendar of current culture is other than GregorianCalendar, it tries to convert
          * the date into appropriate calendar using converter if any exists. If there is no need
          * for conversion, it falls back to the base Date object.
          */
        var CalendarDate = (function () {
            /**
             * Constructs a new CalendarDate object using the specified date.
             *
             * @param date Base date object. If nothing specified, DateTime.Now is used.
             */
            function CalendarDate(date) {
                this._setDate(date || new Date(), false);
            }
            /**
             * Creates a date object using the specified date parts by trying to use current culture's.
             * calendar converter.
             *
             * @param year Year value.
             * @param month Month value.
             * @param day day value.
             * @return Date object.
             */
            CalendarDate.toGregorian = function (year, month, day) {
                return new Date(year, month, day);
            };
            /**
             * Creates a converted date using the specified gregorian date by trying to use current
             * culture's calendar converter.
             *
             * @param date Date object to convert.
             * @return Converted date values.
             */
            CalendarDate.fromGregorian = function (date) {
                // TODO: implement?
                return null;
            };
            /**
             * Gets the start of the day (to time 00:00).
             *
             * @param date Day to get the start.
             * @return Start of the day.
             */
            CalendarDate.toDayStart = function (date) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            };
            /**
             * Gets the base date.
             *
             * @return Base Date object.
             */
            CalendarDate.prototype.getBaseDate = function () {
                return this._baseDate;
            };
            /**
             * Sets a new time using the specified date value.
             *
             * @param date Date object to set.
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.setTime = function (date) {
                date = (date instanceof Date) ? date : new Date(date);
                this._setDate(date);
                return this;
            };
            /** Gets the base date in ticks.
             *
             * @return Base date in ticks.
             */
            CalendarDate.prototype.getTime = function () {
                return this.getBaseDate().getTime();
            };
            /**
             * Gets the day of the week (from 0 to 6) of this calendar date.
             *
             * @return Number value of the day of the week (0-6).
             */
            CalendarDate.prototype.getDay = function () {
                return this.getBaseDate().getDay();
            };
            /**
             * Gets the year of this calendar date.
             *
             * @param converted If specified true, uses converted date. Otherwise, it uses the base date.
             * @return Number value of the year.
             */
            CalendarDate.prototype.getFullYear = function (converted) {
                if (converted && this._convertedDate) {
                    return this._convertedDate[0];
                }
                return this.getBaseDate().getFullYear();
            };
            /**
             * Gets the month of this calendar date.
             *
             * @param converted If specified true, uses converted date. Otherwise, it uses the base date.
             * @return Number value of the month.
             */
            CalendarDate.prototype.getMonth = function (converted) {
                if (converted === true && this._convertedDate) {
                    return this._convertedDate[1];
                }
                return this.getBaseDate().getMonth();
            };
            /**
             * Gets the day of this calendar date in existing month.
             *
             * @param converted If specified true, uses converted date. Otherwise, it uses the base date.
             * @return Number value of the day.
             */
            CalendarDate.prototype.getDate = function (converted) {
                if (converted === true && this._convertedDate) {
                    return this._convertedDate[2];
                }
                return this.getBaseDate().getDate();
            };
            /**
             * Jumps to the start of the month using the converted date.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.jumpToMonthStart = function () {
                var monthStart = new CalendarDate(this._getCalculationDay());
                this.setTime(monthStart.getTime() - CalendarDate.DAY_IN_MILLISECONDS * (monthStart.getDate(true) - 1));
                return this;
            };
            /**
             * Jumps to the start of the week using the converted date (and culture).
             * Week start can be different for different cultures (Sunday of en-US, Monday for tr-TR, etc.).
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.jumpToWeekStart = function () {
                var firstDayOfWeek = DateUtil.getLocaleValues().firstDayOfWeek, dayDiff = (CalendarDate.DAYS_IN_A_WEEK - firstDayOfWeek + this.getDay()) % CalendarDate.DAYS_IN_A_WEEK;
                this.setTime(this._getCalculationDay().getTime() - dayDiff * CalendarDate.DAY_IN_MILLISECONDS);
                return this;
            };
            /**
             * Advances current date one day (24hrs) forward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.nextDay = function () {
                this.setTime(this._getCalculationDay().getTime() + CalendarDate.DAY_IN_MILLISECONDS);
                return this;
            };
            /**
             * Advances current date one day (24hrs) backward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.previousDay = function () {
                this.setTime(this._getCalculationDay().getTime() - CalendarDate.DAY_IN_MILLISECONDS);
                return this;
            };
            /**
             * Advances current date 7 days forward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.nextWeek = function () {
                this.setTime(this._getCalculationDay().getTime() + CalendarDate.DAY_IN_MILLISECONDS * CalendarDate.DAYS_IN_A_WEEK);
                return this;
            };
            /**
             * Advances current date 7 days backward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.previousWeek = function () {
                this.setTime(this._getCalculationDay().getTime() - CalendarDate.DAY_IN_MILLISECONDS * CalendarDate.DAYS_IN_A_WEEK);
                return this;
            };
            /**
             * Advances current date one month backward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.previousMonth = function () {
                this._increment(0, -1);
                return this;
            };
            /**
             * Advances current date one month forward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.nextMonth = function () {
                this._increment(0, 1);
                return this;
            };
            /**
             * Advances current date one year backward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.previousYear = function () {
                this._increment(-1, 0);
                return this;
            };
            /**
             * Advances current date one year forward.
             *
             * @return Current instance of CalendarDate.
             */
            CalendarDate.prototype.nextYear = function () {
                this._increment(1, 0);
                return this;
            };
            /**
             * Checks whether the specified date and current date correspond to the same day.
             *
             * @param date Date object to compare.
             * @return Boolean value stating the specified Date equals or not.
             */
            CalendarDate.prototype.dayEquals = function (date) {
                return (date && this.getFullYear() === date.getFullYear() && this.getMonth() === date.getMonth() && this.getDate() === date.getDate());
            };
            /**
             * Checks whether the specified date and current date are equal.
             *
             * @param date Date object to compare.
             * @return Boolean value stating the specified Date equals or not.
             */
            CalendarDate.prototype.equals = function (date) {
                return (date && this.getTime() === date.getTime());
            };
            CalendarDate.prototype._setDate = function (date, preserveTime) {
                if (preserveTime === void 0) { preserveTime = true; }
                if (preserveTime) {
                    var time = this._getTimePart(this.getBaseDate());
                    this._replaceTimePart(date, time);
                }
                this._baseDate = date;
                this._convertedDate = CalendarDate.fromGregorian(date);
            };
            CalendarDate.prototype._increment = function (yearIncrement, monthIncrement) {
                var day = this.getDate(true), month = this.getMonth(true), year = this.getFullYear(true);
                if (monthIncrement > 0) {
                    if (++month > 11) {
                        month = 0;
                        year++;
                    }
                }
                else if (monthIncrement < 0) {
                    if (--month < 0) {
                        month = 11;
                        year--;
                    }
                }
                year += yearIncrement;
                // We use Math.min to prevent skipping a month.
                // For example from Jan 30th to next month would be Feb 30th which
                // automatically becomes Mar 2nd if we don't make this fix.
                // We don't lose a day here because DatePanel only uses month, year and time part.
                this.setTime(CalendarDate.toGregorian(year, month, Math.min(day, 28)));
            };
            CalendarDate.prototype._getCalculationDay = function () {
                var year = this.getFullYear(), month = this.getMonth(), date = this.getDate();
                // We specify 12 as hour not to stay due to daylight saving
                return new Date(year, month, date, 12);
            };
            CalendarDate.prototype._getTimePart = function (date) {
                var timePart = 0;
                timePart += date.getHours() * 1000 * 60 * 60;
                timePart += date.getMinutes() * 1000 * 60;
                timePart += date.getSeconds() * 1000;
                timePart += date.getMilliseconds();
                return timePart;
            };
            CalendarDate.prototype._replaceTimePart = function (date, time) {
                var dayStart, timePart, dayStartTimezoneOffset, dateTimezoneOffset, daylightSavingDiff;
                dayStart = CalendarDate.toDayStart(date);
                dayStartTimezoneOffset = dayStart.getTimezoneOffset();
                date.setTime(dayStart.getTime() + time);
                dateTimezoneOffset = date.getTimezoneOffset();
                daylightSavingDiff = (dateTimezoneOffset - dayStartTimezoneOffset) * 60 * 1000;
                date.setTime(date.getTime() + daylightSavingDiff);
            };
            CalendarDate.DAY_IN_MILLISECONDS = 86400000;
            CalendarDate.DAYS_IN_A_WEEK = 7;
            return CalendarDate;
        })();
        Main.CalendarDate = CalendarDate;
        /**
         * DatePanel view model.
         */
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this);
                var now = CalendarDate.toDayStart(new Date());
                // Initialize visible month to be this month.
                this.visibleMonth = ko.observable(new CalendarDate(now).jumpToMonthStart().getBaseDate());
                // Set the selected date value to be null initially.
                this.selectedDate = ko.observable(null);
                // Set the focused date value to be null by initially.
                this.focusedDate = ko.observable(null);
                // Set enabled (selectable) data/time range.
                this.enabledDateTimeRange = ko.observable(new DateUtil.DateTimeRange());
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._templateEngine = new TemplateEngine.StringTemplateEngine();
                this._setTemplates();
                this.element.addClass(widgetClass).addClass(widgetBgDefaultClass).html(template);
                this._ensureCultureSpecificNames();
                this._ensureDays();
                this._initializeComputeds();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._attachEvents();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
                this._cleanElement(widgetClass, widgetBgDefaultClass);
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
            // TODO serkani: Untested section
            /**
             * See interface.
             */
            Widget.prototype.selectFocusedDate = function () {
                var focusedDate = this.options.focusedDate(), currentDate = this.options.selectedDate();
                // change date without changing the time
                if (focusedDate !== null && this._isDayEnabled(focusedDate)) {
                    currentDate.setFullYear(focusedDate.getFullYear());
                    currentDate.setMonth(focusedDate.getMonth());
                    currentDate.setDate(focusedDate.getDate());
                    this.options.selectedDate(currentDate);
                }
            };
            // /Untested section
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._headerText = ko.computed(function () {
                    var date = new CalendarDate(_this.options.visibleMonth());
                    // Formatting using DateUtil (Y => MMMM yyyy)
                    return DateUtil.toString(new Date(date.getFullYear(true), date.getMonth(true), 1), "Y");
                });
                this._addDisposablesToCleanUp([this._headerText]);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var selectedDate = _this.options.selectedDate(), visibleMonth;
                    if (selectedDate) {
                        visibleMonth = new CalendarDate(selectedDate).jumpToMonthStart();
                        if (!visibleMonth.equals(_this.options.visibleMonth.peek())) {
                            _this.options.visibleMonth(visibleMonth.getBaseDate());
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var i, j, weekDay, days = _this._days, selectedDate = _this.options.selectedDate(), focusedDate = _this.options.focusedDate(), visibleMonth = new CalendarDate(_this.options.visibleMonth()), month = visibleMonth.getMonth(true);
                    // First jump to proper month start.
                    visibleMonth.jumpToMonthStart();
                    // Then jump to start of the week.
                    visibleMonth.jumpToWeekStart();
                    for (i = 0; i < numberOfWeeks; i++) {
                        for (j = 0; j < CalendarDate.DAYS_IN_A_WEEK; j++) {
                            weekDay = days[i].weekDays[j];
                            weekDay.date = visibleMonth.getTime();
                            weekDay.value(visibleMonth.getDate(true));
                            weekDay.focused(visibleMonth.dayEquals(focusedDate));
                            weekDay.otherMonth(visibleMonth.getMonth(true) !== month);
                            weekDay.isEnabled(_this._isDayEnabled(new Date(weekDay.date)));
                            // Update selected property always.
                            weekDay.selected(visibleMonth.dayEquals(selectedDate));
                            // Advance to next day.
                            visibleMonth.nextDay();
                        }
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var focusedDate = _this.options.focusedDate(), focusedDateTicks, visibleMonthStartTicks, daysInVisibleArea;
                    if (focusedDate !== null) {
                        focusedDateTicks = focusedDate.getTime();
                        visibleMonthStartTicks = new CalendarDate(_this.options.visibleMonth()).jumpToWeekStart().getTime();
                        daysInVisibleArea = CalendarDate.DAY_IN_MILLISECONDS * CalendarDate.DAYS_IN_A_WEEK * 6;
                        if (focusedDateTicks < visibleMonthStartTicks || focusedDateTicks >= (visibleMonthStartTicks + daysInVisibleArea)) {
                            _this.options.visibleMonth(new CalendarDate(focusedDate).jumpToMonthStart().getBaseDate());
                        }
                    }
                }));
            };
            Widget.prototype._ensureCultureSpecificNames = function () {
                var i, dayNames, dateTimeFormat = DateUtil.getLocaleValues();
                if (!this.options.dayNames) {
                    dayNames = [];
                    for (i = 0; i < CalendarDate.DAYS_IN_A_WEEK; i++) {
                        dayNames.push(dateTimeFormat.daysAbbr[(dateTimeFormat.firstDayOfWeek + i) % CalendarDate.DAYS_IN_A_WEEK]);
                    }
                    this.options.dayNames = dayNames;
                    // Populate month names using CultureInfo object.
                    this.options.monthNames = dateTimeFormat.months;
                }
            };
            Widget.prototype._ensureDays = function () {
                var i, j;
                // Ensure the days are initialized. These values are going to be updated later
                // on whenever a date change occurs.
                this._days = [];
                for (i = 0; i < numberOfWeeks; i++) {
                    // Add a CalendarWeek object.
                    this._days.push({
                        index: i,
                        weekDays: []
                    });
                    for (j = 0; j < CalendarDate.DAYS_IN_A_WEEK; j++) {
                        // Add CalendarDay object.
                        this._days[i].weekDays.push({
                            date: 0,
                            value: ko.observable(0),
                            selected: ko.observable(false),
                            focused: ko.observable(false),
                            otherMonth: ko.observable(false),
                            isEnabled: ko.observable(true)
                        });
                    }
                }
            };
            Widget.prototype._setTemplates = function () {
                this._templateEngine.setTemplate("daysTable", templateDaysTable);
                this._templateEngine.setTemplate("daysHeader", templateDaysHeader);
                this._templateEngine.setTemplate("daysHeaderColumn", templateDaysHeaderColumn);
                this._templateEngine.setTemplate("daysBody", templateDaysBody);
                this._templateEngine.setTemplate("daysBodyRow", templateDaysBodyRow);
                this._templateEngine.setTemplate("daysBodyColumn", templateDaysBodyColumn);
            };
            Widget.prototype._attachEvents = function () {
                var that = this;
                this._detachEvents();
                this.element.on("click", "a.azc-datePanel-link", this._linkClickHandler = function (evt) {
                    var link = $(this), newMonth, clickedDay, options = that.options;
                    if (link.hasClass("azc-datePanel-prev-month")) {
                        newMonth = new CalendarDate(options.visibleMonth()).previousMonth();
                        options.visibleMonth(newMonth.getBaseDate());
                    }
                    else if (link.hasClass("azc-datePanel-next-month")) {
                        newMonth = new CalendarDate(options.visibleMonth()).nextMonth();
                        options.visibleMonth(newMonth.getBaseDate());
                    }
                    else if (link.hasClass("azc-datePanel-day")) {
                        clickedDay = ko.dataFor(this);
                        that.options.selectedDate(new Date(clickedDay.date));
                    }
                    evt.preventDefault();
                });
            };
            /**
             * Detaches event handlers.
             */
            Widget.prototype._detachEvents = function () {
                if (this._linkClickHandler) {
                    this.element.off("click", "a.azc-datePanel-link", this._linkClickHandler);
                    this._linkClickHandler = null;
                }
            };
            /**
             * Check if given date should be enabled (selectable) in calendar.
             */
            Widget.prototype._isDayEnabled = function (date) {
                var isTooEarly = false, isTooLate = false, startDate, endDate;
                if (Util.isNullOrUndefined(this.options.enabledDateTimeRange())) {
                    return true;
                }
                startDate = DateUtil.getDateWithOffset(this.options.enabledDateTimeRange().startDateTime(), this.options.enabledDateTimeRange().timezoneOffset());
                endDate = DateUtil.getDateWithOffset(this.options.enabledDateTimeRange().endDateTime(), this.options.enabledDateTimeRange().timezoneOffset());
                if (startDate) {
                    isTooEarly = (DateUtil.compareDatesByDays(date, startDate) === -1);
                }
                if (endDate) {
                    isTooLate = (DateUtil.compareDatesByDays(date, endDate) === 1);
                }
                return !isTooEarly && !isTooLate;
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
