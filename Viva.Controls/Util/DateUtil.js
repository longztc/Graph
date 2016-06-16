define(["require", "exports", "./Util", "./StringUtil"], function (require, exports, Util, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        /**
         * Used to specify date/time range in which user can select date/time.
         */
        var DateTimeRange = (function () {
            function DateTimeRange(startDateTime, endDateTime, timezoneOffset) {
                this.startDateTime = ko.observable(startDateTime || null);
                this.endDateTime = ko.observable(endDateTime || null);
                this.timezoneOffset = ko.observable(timezoneOffset || -(new Date().getTimezoneOffset()));
            }
            return DateTimeRange;
        })();
        Main.DateTimeRange = DateTimeRange;
        var global = window, previousDateToString = Date.prototype.toString, previousDateParse = Date.parse, 
        // Default en-US
        localeValues = {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            ampm: ["AM", "PM"],
            ampmAbbr: [],
            dateSeparator: "/",
            timeSeparator: ":",
            standard: {
                d: "M/d/yyyy",
                D: "dddd, MMMM dd, yyyy",
                F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                m: "MMMM dd",
                M: "MMMM dd",
                r: "ddd, dd MMM yyyy HH':'mm':'ss 'GMT'",
                R: "ddd, dd MMM yyyy HH':'mm':'ss 'GMT'",
                s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                t: "h:mm tt",
                T: "h:mm:ss tt",
                u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                y: "MMMM, yyyy",
                Y: "MMMM, yyyy" // DateTimeFormatInfo.YearMonthPattern
            },
            firstDayOfWeek: 0,
            agoStrings: {
                lessThanAMinute: "Just now",
                aMinute: "1 min ago",
                minutes: "{0} min ago",
                anHour: "1 h ago",
                hours: "{0} h ago",
                aDay: "1 d ago",
                days: "{0} d ago",
                aWeek: "1 wk ago",
                weeks: "{0} wk ago",
                aMonth: "1 mo ago",
                months: "{0} mo ago",
                aYear: "1 yr ago",
                years: "{0} yr ago"
            },
            // sources: http://en.wikipedia.org/wiki/List_of_time_zone_abbreviations and https://github.com/dmfilipenko/timezones.json
            timezones: [
                {
                    "text": "(UTC-12:00) Baker Island Time",
                    "value": -720
                },
                {
                    "text": "(UTC-11:00) Niue Time, Samoa Standard Time",
                    "value": -660
                },
                {
                    "text": "(UTC-10:00) Hawaii Standard Time, ",
                    "value": -600
                },
                {
                    "text": "(UTC-09:00) Alaska Standard Time",
                    "value": -540
                },
                {
                    "text": "(UTC-08:00) Pacific Standard Time, Alaska Daylight Time",
                    "value": -480
                },
                {
                    "text": "(UTC-07:00) Mountain Standard Time, Pacific Daylight Time",
                    "value": -420
                },
                {
                    "text": "(UTC-06:00) Central Standard Time, Mountain Daylight Time",
                    "value": -360
                },
                {
                    "text": "(UTC-05:00) Eastern Standard Time (North America), Central Daylight Time",
                    "value": -300
                },
                {
                    "text": "(UTC-04:00) Amazon Time (Brazil), Eastern Daylight Time (North America)",
                    "value": -240
                },
                {
                    "text": "(UTC-03:00) Uruguay Standard Time, Amazon Summer Time (Brazil)",
                    "value": -180
                },
                {
                    "text": "(UTC-02:00) Uruguay Summer Time",
                    "value": -120
                },
                {
                    "text": "(UTC-01:00) Eastern Greenland Time",
                    "value": -60
                },
                {
                    "text": "(UTC) Coordinated Universal Time",
                    "value": 0
                },
                {
                    "text": "(UTC+01:00) Central European Time, Western European Summer Time",
                    "value": 60
                },
                {
                    "text": "(UTC+02:00) Eastern European Time, Central European Summer Time",
                    "value": 120
                },
                {
                    "text": "(UTC+03:00) Arabia Standard Time, Eastern European Summer Time",
                    "value": 180
                },
                {
                    "text": "(UTC+04:00) Moscow Time",
                    "value": 240
                },
                {
                    "text": "(UTC+05:00) Pakistan Standard Time",
                    "value": 300
                },
                {
                    "text": "(UTC+06:00) British Indian Ocean Time",
                    "value": 360
                },
                {
                    "text": "(UTC+07:00) Western Indonesian Time",
                    "value": 420
                },
                {
                    "text": "(UTC+08:00) Australian Western Standard Time",
                    "value": 480
                },
                {
                    "text": "(UTC+09:00) Eastern Indonesian Time, Australian Western Daylight Time",
                    "value": 540
                },
                {
                    "text": "(UTC+10:00) Australian Eastern Standard Time",
                    "value": 600
                },
                {
                    "text": "(UTC+11:00) Australian Eastern Daylight Savings Time",
                    "value": 660
                },
                {
                    "text": "(UTC+12:00) New Zealand Standard Time",
                    "value": 720
                },
                {
                    "text": "(UTC+13:00) New Zealand Daylight Time",
                    "value": 780
                }
            ]
        }, 
        // All times are relative to/measured as a baseline in seconds
        secondsInMinute = 60, secondsInHour = secondsInMinute * 60, secondsInDay = secondsInHour * 24, secondsInWeek = secondsInDay * 7, secondsInYear = secondsInDay * 365, secondsInMonth = secondsInYear / 12, millisecondsInMinute = secondsInMinute * 1000, millisecondsInHour = secondsInHour * 1000, millisecondsInDay = secondsInDay * 1000, millisecondsInWeek = secondsInWeek * 1000, agoSteps = [
            { limit: secondsInMinute, format: localeValues.agoStrings.lessThanAMinute, factorSeconds: 0 },
            { limit: secondsInMinute * 1.5, format: localeValues.agoStrings.aMinute, factorSeconds: 0 },
            { limit: secondsInHour, format: localeValues.agoStrings.minutes, factorSeconds: secondsInMinute },
            { limit: secondsInHour * 1.5, format: localeValues.agoStrings.anHour, factorSeconds: 0 },
            { limit: secondsInDay, format: localeValues.agoStrings.hours, factorSeconds: secondsInHour },
            { limit: secondsInDay * 1.5, format: localeValues.agoStrings.aDay, factorSeconds: 0 },
            { limit: secondsInWeek, format: localeValues.agoStrings.days, factorSeconds: secondsInDay },
            { limit: secondsInWeek * 1.5, format: localeValues.agoStrings.aWeek, factorSeconds: 0 },
            { limit: secondsInMonth, format: localeValues.agoStrings.weeks, factorSeconds: secondsInWeek },
            { limit: secondsInMonth * 1.5, format: localeValues.agoStrings.aMonth, factorSeconds: 0 },
            { limit: secondsInYear, format: localeValues.agoStrings.months, factorSeconds: secondsInMonth },
            { limit: secondsInYear * 1.5, format: localeValues.agoStrings.aYear, factorSeconds: 0 },
            { limit: Number.POSITIVE_INFINITY, format: localeValues.agoStrings.years, factorSeconds: secondsInYear },
        ], savedDate;
        function _padString(str, length, padding) {
            /*jshint newcap:false*/
            padding = !padding ? "0" : padding;
            if (length + 1 >= str.length) {
                str = Array(length + 1 - str.length).join(padding) + str;
            }
            return str;
        }
        function _padNumber(num, length, padding) {
            return _padString(num + "", length, padding);
        }
        function _truncateString(str, length) {
            return str.substr(str.length - length);
        }
        function _truncateNumber(num, length) {
            return _truncateString(num + "", length);
        }
        function _truncateAndPadNumber(num, length) {
            return _truncateString(_padNumber(num, length, "0"), length);
        }
        function _fixHour12(time) {
            time = time % 12;
            return time === 0 ? 12 : time;
        }
        function _reverse(arg) {
            return arg.split("").reverse().join("");
        }
        function _escapeEverything(arg) {
            return "\\" + arg.split("").join("\\");
        }
        function _replaceCharacters(arg) {
            // Adding falls through to make sure JSHint doesn't complain, even though it doesn't fall through since it returns
            var length = arg.length, timezone, isNegative, hour, minute;
            switch (arg[0]) {
                case "y":
                    switch (length) {
                        case 3:
                            return _padNumber(savedDate.getFullYear(), length);
                        case 1:
                            return parseInt(_truncateNumber(savedDate.getFullYear(), 2), 10) + "";
                        default:
                            return _truncateAndPadNumber(savedDate.getFullYear(), length);
                    }
                case "M":
                    switch (length) {
                        case 4:
                            return _escapeEverything(localeValues.months[savedDate.getMonth()]);
                        case 3:
                            return _escapeEverything(localeValues.monthsAbbr[savedDate.getMonth()]);
                        case 2:
                            return _truncateAndPadNumber(savedDate.getMonth() + 1, 2);
                        default:
                            return _truncateNumber(savedDate.getMonth() + 1, 2);
                    }
                case "d":
                    switch (length) {
                        case 4:
                            return _escapeEverything(localeValues.days[savedDate.getDay()]);
                        case 3:
                            return _escapeEverything(localeValues.daysAbbr[savedDate.getDay()]);
                        case 2:
                            return _truncateAndPadNumber(savedDate.getDate(), 2);
                        default:
                            return _truncateNumber(savedDate.getDate(), 2);
                    }
                case "h":
                    if (length === 2) {
                        return _truncateAndPadNumber(_fixHour12(savedDate.getHours()), 2);
                    }
                    return _truncateNumber(_fixHour12(savedDate.getHours()), 2);
                case "H":
                    if (length === 2) {
                        return _truncateAndPadNumber(savedDate.getHours(), 2);
                    }
                    return _truncateNumber(savedDate.getHours(), 2);
                case "m":
                    if (length === 2) {
                        return _truncateAndPadNumber(savedDate.getMinutes(), 2);
                    }
                    return _truncateNumber(savedDate.getMinutes(), 2);
                case "s":
                    if (length === 2) {
                        return _truncateAndPadNumber(savedDate.getSeconds(), 2);
                    }
                    return _truncateNumber(savedDate.getSeconds(), 2);
                case "t":
                    if (length === 2) {
                        return localeValues.ampm[savedDate.getHours() < 12 ? 0 : 1];
                    }
                    return localeValues.ampmAbbr[savedDate.getHours() < 12 ? 0 : 1];
                case "z":
                    timezone = -savedDate.getTimezoneOffset() / 60;
                    isNegative = timezone < 0;
                    if (isNegative) {
                        timezone = -timezone;
                    }
                    hour = parseInt(timezone + "", 10);
                    minute = (timezone - hour) * 60;
                    if (length === 3) {
                        return (isNegative ? "-" : "+") + _padNumber(hour, 2) + ":" + _padNumber(minute, 2);
                    }
                    return (isNegative ? "-" : "+") + _padNumber(hour, length);
                case "/":
                    return localeValues.dateSeparator;
                case ":":
                    return localeValues.timeSeparator;
            }
            return "";
        }
        function _replaceCharactersWithReverse(arg) {
            return _reverse(_replaceCharacters(arg));
        }
        /**
            * Generates a string indicating how long ago the date is based on the difference between it and now.
            *
            * @param date The Date object to format.
            * @param now The relative Date object to compare date to.
            * @return A friendly string.
            */
        function _ago(date, now) {
            var i, step, diff, result;
            // Optionally set defaults
            now = now || new Date();
            // Get diff and convert to seconds
            diff = now.getTime() - date.getTime();
            diff /= 1000;
            for (i = 0; i < agoSteps.length; i++) {
                // If we don't find the step we look for, the last is used by default
                step = agoSteps[i];
                if (diff < step.limit) {
                    break;
                }
            }
            result = step.format;
            if (step.factorSeconds) {
                result = StringUtil.format(result, Math.round(diff / step.factorSeconds));
            }
            return result;
        }
        /**
         * Gets a relative timestamp for the date that changes format based on the difference between it and now. e.g. "4 hours ago", "Tuesday", "7/4/2012".
         *
         * @param date The Date object to format.
         * @param now The relative Date object to compare date to.
         * @return A string version of the date.
         */
        function _friendly(date, now) {
            var i, len, day = 60 * 60 * 24, diff, step, steps, firstDayOfNowWeek, result = date.toString();
            // Optionally set defaults
            now = now || new Date();
            firstDayOfNowWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + localeValues.firstDayOfWeek);
            steps = [
                {
                    limit: day,
                    format: function (dt) {
                        return _ago(dt, now);
                    }
                },
                {
                    limit: (now.getTime() - firstDayOfNowWeek.getTime()) / 1000,
                    format: function (dt) {
                        return toString(dt, "dddd");
                    }
                },
                {
                    limit: Number.POSITIVE_INFINITY,
                    format: function (dt) {
                        return toString(dt, "d");
                    }
                }
            ];
            // Getting the difference between now and the specified date in seconds
            diff = (now.getTime() - date.getTime()) / 1000;
            for (i = 0; i < steps.length; i++) {
                // The last step is used if the logical conditions aren't met
                step = steps[i];
                if (diff < step.limit && step.limit > 0) {
                    break;
                }
            }
            result = step.format(date);
            return result;
        }
        function getLocaleValues() {
            return localeValues;
        }
        Main.getLocaleValues = getLocaleValues;
        function setLocaleValues(def) {
            var standard;
            localeValues = def;
            localeValues.ampmAbbr = [localeValues.ampm[0][0] || "", localeValues.ampm[1][0] || ""];
            standard = localeValues.standard;
            standard.f = standard.D + " " + standard.t;
            standard.g = standard.d + " " + standard.t;
            standard.G = standard.d + " " + standard.T;
        }
        Main.setLocaleValues = setLocaleValues;
        /**
         * Returns a date string formatted relative to another date.
         *
         * @param format The relative format option (difference or timestamp) used to render the string.
         * @param now The relative Date object to compare date to.
         * @return A string representing the relative date.
         */
        function toRelativeString(date, format, now) {
            // TODO TypeScript 0.9.5:
            // ISSUE 1339948
            // ISSUE https://typescript.codeplex.com/workitem/482
            var relativeStr;
            // Optionally set defaults
            now = now || new Date();
            format = format || "difference";
            switch (format) {
                case "difference":
                    relativeStr = _ago(date, now);
                    break;
                case "timestamp":
                    relativeStr = _friendly(date, now);
                    break;
            }
            return relativeStr;
        }
        Main.toRelativeString = toRelativeString;
        function toString(date) {
            var relArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                relArgs[_i - 1] = arguments[_i];
            }
            /*jshint regexp:false*/
            // To prevent calling multiple functions for each replace,
            // We use private functions that would be called only if the regex is matched
            // We need to save the current this to a common place for the method
            // to be able to pick it up
            if (relArgs.length) {
                var format = relArgs[0];
                format = localeValues.standard[format] || format;
                // Support ' escape
                format = format.replace(/'([^']*)'/g, function (full, capture) {
                    return _escapeEverything(capture);
                });
                // Look-Behind are not supported, so we execute everything in reverse
                // So we can support escaping \\ by using a Look-Ahead.
                savedDate = date;
                return _reverse(_reverse(format).replace(/(y{1,5}|M{1,4}|d{1,4}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|t{1,2}|z{1,3}|\/|:)(?!\\)/g, _replaceCharactersWithReverse).replace(/\\(?!\\)/g, ""));
            }
            else {
                return previousDateToString.apply(date, arguments);
            }
        }
        Main.toString = toString;
        /**
         * Parse standard date strings, and MVC dates.
         *
         * @param value Date string.
         *
         * @return A new Date object (created from date string).
         */
        function parse(value) {
            if ((value + "").substr(0, 6) === "/Date(") {
                return parseInt(value.substr(6), 10);
            }
            else {
                return Date.parse(value);
            }
        }
        Main.parse = parse;
        /**
         * Returns a date for specified time zone.
         *
         * @param date The original date.
         * @param timezoneOffset Timezone offset (in minutes) to which the date will be converted.
         *
         * @return A new Date object, representing date in specified (by offset param) timezone.
         */
        function getDateWithOffset(date, timezoneOffset) {
            var utc;
            if (Util.isNullOrUndefined(date)) {
                return null;
            }
            utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000); // get UTC time
            return new Date(utc + (timezoneOffset * 60 * 1000));
        }
        Main.getDateWithOffset = getDateWithOffset;
        /**
         * Returns a date for local (user) time zone.
         *
         * @param date The original date.
         * @param timezoneOffset Timezone offset (in minutes) from which the date will be converted.
         *
         * @return A new Date object, representing date in the local (user) timezone.
         */
        function getLocalDate(date, timezoneOffset) {
            var utc;
            if (Util.isNullOrUndefined(date)) {
                return null;
            }
            utc = date.getTime() - (timezoneOffset * 60 * 1000); // get UTC time
            return new Date(utc - (date.getTimezoneOffset() * 60 * 1000));
        }
        Main.getLocalDate = getLocalDate;
        /**
        * Compare two dates with 1 day precision (does not take time into account).
        *
        * @param d1 First date.
        * @param d2 Second date.
        *
        * @return -1 - d1 is earlier than d2
        *          0 - d1 and d2 are equal
        *          1 - d1 is later than d2
        */
        function compareDatesByDays(d1, d2) {
            var result;
            if (!d1 || !d2) {
                result = -1; // TODO jjed: maybe come up with better result?
            }
            else {
                if (d1.getFullYear() === d2.getFullYear()) {
                    if (d1.getMonth() === d2.getMonth()) {
                        if (d1.getDate() === d2.getDate()) {
                            result = 0;
                        }
                        else if (d1.getDate() < d2.getDate()) {
                            result = -1;
                        }
                        else {
                            result = 1;
                        }
                    }
                    else if (d1.getMonth() < d2.getMonth()) {
                        result = -1;
                    }
                    else {
                        result = 1;
                    }
                }
                else if (d1.getFullYear() < d2.getFullYear()) {
                    result = -1;
                }
                else {
                    result = 1;
                }
            }
            return result;
        }
        Main.compareDatesByDays = compareDatesByDays;
        /**
        * Compare two dates with 1 second precision (does not take miliseconds into account).
        *
        * @param d1 First date.
        * @param d2 Second date.
        *
        * @return true if dates are equal, false otherwise
        */
        function compareDatesBySeconds(a, b) {
            if (!a || !b) {
                return false;
            }
            return Math.floor(a.getTime() / 1000) === Math.floor(b.getTime() / 1000);
        }
        Main.compareDatesBySeconds = compareDatesBySeconds;
        // Initialize some more variables
        setLocaleValues(localeValues);
    })(Main || (Main = {}));
    return Main;
});
