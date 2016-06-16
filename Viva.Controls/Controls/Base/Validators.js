/// <reference path="../../../Definitions/jquery.d.ts" />
/// <reference path="../../../Definitions/knockout.d.ts" />
/// <reference path="../../../Definitions/knockout.projections.d.ts" />
/// <reference path="../../../Definitions/Q.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/DateUtil", "../../Util/Util", "../../Util/StringUtil"], function (require, exports, DateUtil, Util, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        /**
         * ValidationState represents the current validation state when list of validators are run.
         */
        (function (ValidationState) {
            /**
             * Default validation state.
             */
            ValidationState[ValidationState["None"] = 0] = "None";
            /**
             * Validation failed.
             */
            ValidationState[ValidationState["Invalid"] = 1] = "Invalid";
            /**
             * Validation succeeded.
             */
            ValidationState[ValidationState["Valid"] = 2] = "Valid";
            /**
             * Validation pending during async validation calls.
             */
            ValidationState[ValidationState["Pending"] = 3] = "Pending";
        })(Main.ValidationState || (Main.ValidationState = {}));
        var ValidationState = Main.ValidationState;
        /**
         * Validator base class. Used to define validators that can be attached to an
         * validatable control view model to validate the value.
         */
        var Validator = (function () {
            /**
             * Constructs a validator.
             *
             * @param message Describes the validation rule.
             */
            function Validator(message) {
                var _this = this;
                this.message = ko.observable(message);
                this.validationState = ko.observable(0 /* None */);
                this.validate = ko.observable();
                this.isEmptyValid = ko.observable(false);
                this.valid = ko.computed(function () {
                    return _this.validationState() === 2 /* Valid */;
                });
                this._subscription = this.validate.subscribe(function (value) {
                    _this.validationState(_this._validate(value));
                });
            }
            /**
             * Releases resources held by the validator.
             */
            Validator.prototype.dispose = function () {
                if (this._subscription) {
                    this._subscription.dispose();
                    this._subscription = null;
                }
            };
            /**
             * Determines if the value is valid.
             * Should be overridden in derived classes.
             *
             * @param value The value to check.
             * @return Indicates the current validation state.
             */
            Validator.prototype._validate = function (value) {
                return 0 /* None */;
            };
            return Validator;
        })();
        Main.Validator = Validator;
        /**
         * Escapes regular expression special characters -[]/{}()*+?.\^$|
         *
         * @param str The string to escape.
         * @return The escaped string.
         */
        function escapeRegExpOperators(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        Main.escapeRegExpOperators = escapeRegExpOperators;
        var Match = (function (_super) {
            __extends(Match, _super);
            /**
             * Constructs a validator that checks if the value matches a regular expression.
             *
             * @param message Validation rule error message.
             */
            function Match(expression, message) {
                this._expression = expression;
                _super.call(this, message || "The value must match the expression '" + expression + "'.");
            }
            /**
             * See base.
             */
            Match.prototype._validate = function (value) {
                if ((Util.isNullOrUndefined(value) || $.trim(value) === "") && this.isEmptyValid()) {
                    return 2 /* Valid */;
                }
                return this._expression.test(value || "") ? 2 /* Valid */ : 1 /* Invalid */;
            };
            return Match;
        })(Validator);
        Main.Match = Match;
        var NotMatch = (function (_super) {
            __extends(NotMatch, _super);
            /**
             * Constructs a validator that checks if the value does not match a regular expression.
             *
             * @param message Validation rule error message.
             */
            function NotMatch(expression, message) {
                this._expression = expression;
                _super.call(this, message || "The value must not match the expression '" + expression + "'.");
            }
            /**
             * See base.
             */
            NotMatch.prototype._validate = function (value) {
                if ((Util.isNullOrUndefined(value) || $.trim(value) === "") && this.isEmptyValid()) {
                    return 2 /* Valid */;
                }
                return !this._expression.test(value || "") ? 2 /* Valid */ : 1 /* Invalid */;
            };
            return NotMatch;
        })(Validator);
        Main.NotMatch = NotMatch;
        var Contains = (function (_super) {
            __extends(Contains, _super);
            /**
             * Constructs a validator that checks that the value contains at least one case insensitive match of a search string.
             *
             * @param search The search string to match.
             * @param message Validation rule error message.
             */
            function Contains(search, message) {
                _super.call(this, new RegExp(escapeRegExpOperators(search), "i"), message || "The value must contain at least one case insensitive match of '" + search + "'.");
            }
            return Contains;
        })(Match);
        Main.Contains = Contains;
        var NotContains = (function (_super) {
            __extends(NotContains, _super);
            /**
             * Constructs a validator that checks that the value does not contain a case insensitive match of a search string.
             *
             * @param search The search string to match.
             * @param message Validation rule error message.
             */
            function NotContains(search, message) {
                _super.call(this, new RegExp(escapeRegExpOperators(search), "i"), message || "The value must not contain a case insensitive match of '" + search + "'.");
            }
            return NotContains;
        })(NotMatch);
        Main.NotContains = NotContains;
        var ContainsCharacters = (function (_super) {
            __extends(ContainsCharacters, _super);
            /**
             * Constructs a validator that checks that the value contains at least one character from a character set.
             *
             * @param characters One or more characters to search for.
             * @param message Validation rule error message.
             */
            function ContainsCharacters(characters, message) {
                _super.call(this, new RegExp("[" + escapeRegExpOperators(characters) + "]", ""), message || "The value must contain at least one character from '" + characters + "'.");
            }
            return ContainsCharacters;
        })(Match);
        Main.ContainsCharacters = ContainsCharacters;
        var NotContainsCharacters = (function (_super) {
            __extends(NotContainsCharacters, _super);
            /**
             * Constructs a validator that checks that the value does not contain any characters from a character set.
             *
             * @param characters One or more characters to search for.
             * @param message Validation rule error message.
             */
            function NotContainsCharacters(characters, message) {
                _super.call(this, new RegExp("[" + escapeRegExpOperators(characters) + "]", ""), message || "The value must not contain characters from '" + characters + "'.");
            }
            return NotContainsCharacters;
        })(NotMatch);
        Main.NotContainsCharacters = NotContainsCharacters;
        var HasDigit = (function (_super) {
            __extends(HasDigit, _super);
            /**
             * Constructs a validator that checks that the value has at least one digit from 0 to 9.
             *
             * @param message Validation rule error message.
             */
            function HasDigit(message) {
                _super.call(this, /[0-9]/, message || "The value must have at least one digit from 0 to 9.");
            }
            return HasDigit;
        })(Match);
        Main.HasDigit = HasDigit;
        var HasLetter = (function (_super) {
            __extends(HasLetter, _super);
            /**
             * Constructs a validator that checks that the value has at least one upper or lower case letter from A to Z or a to z.
             * (Not Unicode)
             *
             * @param message Validation rule error message.
             */
            function HasLetter(message) {
                _super.call(this, /[A-Za-z]/, message || "The value must have at least one upper or lower case letter from A to Z or a to z.");
            }
            return HasLetter;
        })(Match);
        Main.HasLetter = HasLetter;
        var HasUpperCaseLetter = (function (_super) {
            __extends(HasUpperCaseLetter, _super);
            /**
             * Constructs a validator that checks that the value has at least one upper case letter from A to Z.
             * (Not Unicode)
             *
             * @param message Validation rule error message.
             */
            function HasUpperCaseLetter(message) {
                _super.call(this, /[A-Z]/, message || "The value must have at least one upper case letter from A to Z.");
            }
            return HasUpperCaseLetter;
        })(Match);
        Main.HasUpperCaseLetter = HasUpperCaseLetter;
        var HasLowerCaseLetter = (function (_super) {
            __extends(HasLowerCaseLetter, _super);
            /**
             * Constructs a validator that checks that the value has at least one lower case letter from a to z.
             * (Not Unicode)
             *
             * @param message Validation rule error message.
             */
            function HasLowerCaseLetter(message) {
                _super.call(this, /[a-z]/, message || "The value must have at least one lower case letter from a to z.");
            }
            return HasLowerCaseLetter;
        })(Match);
        Main.HasLowerCaseLetter = HasLowerCaseLetter;
        var HasPunctuation = (function (_super) {
            __extends(HasPunctuation, _super);
            /**
             * Constructs a validator that checks that the value contains at least one punctuation character from:
             * ! @ # $ % ^ & * ( ) _ + - = { } | [ ] \ : " ; ' < > , . ? / ~ `
             *
             * @param message Validation rule error message.
             */
            function HasPunctuation(message) {
                _super.call(this, "!@#$%^&*()_+-={}|[]\\:\";'<>,.?/~`", message || "The value must contain at least one punctuation character from '!@#$%^&*()_+-={}|[]\\:\";'<>,.?/~`'.");
            }
            return HasPunctuation;
        })(ContainsCharacters);
        Main.HasPunctuation = HasPunctuation;
        var Compare = (function (_super) {
            __extends(Compare, _super);
            /**
             * Base class for comparison validators. Not to be used directly.
             *
             * @param compareTo The value or accessor to get the value to compare to.
             * @param message Validation rule error message.
             */
            function Compare(compareTo, message) {
                if ($.isFunction(compareTo)) {
                    this._compareTo = compareTo;
                }
                else {
                    this._compareTo = function () {
                        return compareTo;
                    };
                }
                _super.call(this, message);
            }
            /**
             * See base.
             */
            Compare.prototype._validate = function (value) {
                return this._compare(value, this._compareTo()) ? 2 /* Valid */ : 1 /* Invalid */;
            };
            /**
             * Compares two values.
             * (Derived classes must override.)
             *
             * @param value The control value.
             * @param compareTo The value to compare to.
             * @return Result of comparison.
             */
            Compare.prototype._compare = function (value, compareTo) {
                return false;
            };
            return Compare;
        })(Validator);
        Main.Compare = Compare;
        var Equals = (function (_super) {
            __extends(Equals, _super);
            function Equals(compareTo, message) {
                _super.call(this, compareTo, message || "The value must equal the provided value.");
            }
            /**
             * Compares two values for strict equality.
             *
             * @param value The control value.
             * @param compareTo The value to compare to.
             * @return Result of equality comparison.
             */
            Equals.prototype._compare = function (value, compareTo) {
                return (value === compareTo);
            };
            return Equals;
        })(Compare);
        Main.Equals = Equals;
        var CaseInsensitiveComparison = (function (_super) {
            __extends(CaseInsensitiveComparison, _super);
            function CaseInsensitiveComparison(compareTo, message) {
                _super.call(this, compareTo, message || "The value must equal the provided value.");
            }
            /**
             * Compares two values for case insensitive equality.
             *
             * @param value The control value.
             * @param compareTo The value to compare to.
             * @return Result of equality comparison.
             */
            CaseInsensitiveComparison.prototype._compare = function (value, compareTo) {
                return value.toLowerCase() === compareTo.toLowerCase();
            };
            return CaseInsensitiveComparison;
        })(Compare);
        Main.CaseInsensitiveComparison = CaseInsensitiveComparison;
        var LocaleAwareCaseInsensitiveComparison = (function (_super) {
            __extends(LocaleAwareCaseInsensitiveComparison, _super);
            function LocaleAwareCaseInsensitiveComparison(compareTo, message) {
                _super.call(this, compareTo, message || "The value must equal the provided value.");
            }
            /**
             * Compares two values for locale aware case insensitive equality.
             *
             * @param value The control value.
             * @param compareTo The value to compare to.
             * @return Result of equality comparison.
             */
            LocaleAwareCaseInsensitiveComparison.prototype._compare = function (value, compareTo) {
                return value.toLocaleLowerCase() === compareTo.toLocaleLowerCase();
            };
            return LocaleAwareCaseInsensitiveComparison;
        })(Compare);
        Main.LocaleAwareCaseInsensitiveComparison = LocaleAwareCaseInsensitiveComparison;
        var LengthRange = (function (_super) {
            __extends(LengthRange, _super);
            /**
             * Constructs a validator that checks that the value length is between min and max.
             *
             * @param min The minimum number of characters to be valid. May be null if there is no min.
             * @param max The maximum number of characters to be valid. May be null if there is no max.
             * @param message Validation rule error message.
             */
            function LengthRange(min, max, message) {
                this._min = min;
                this._max = max;
                _super.call(this, message || "The value must have a length between " + min + " and " + max + ".");
            }
            /**
             * See base.
             */
            LengthRange.prototype._validate = function (value) {
                var length, min;
                // Spaces don't count toward length
                value = $.trim(value);
                if ((Util.isNullOrUndefined(value) || $.trim(value) === "") && this.isEmptyValid()) {
                    return 2 /* Valid */;
                }
                length = 0;
                if (value !== undefined && value !== null) {
                    length = value.length;
                }
                min = 0;
                if (this._min !== undefined && this._min !== null) {
                    min = this._min;
                }
                if (length >= min) {
                    if (this._max !== undefined && this._max !== null) {
                        if (length <= this._max) {
                            return 2 /* Valid */;
                        }
                    }
                    else {
                        return 2 /* Valid */;
                    }
                }
                return 1 /* Invalid */;
            };
            return LengthRange;
        })(Validator);
        Main.LengthRange = LengthRange;
        var MinLength = (function (_super) {
            __extends(MinLength, _super);
            /**
             * Constructs a validator that checks that the value length is at least min.
             *
             * @param min The minimum number of characters to be valid.
             * @param message Validation rule error message.
             */
            function MinLength(min, message) {
                _super.call(this, min, null, message || "The value must have a length of at least " + min + ".");
            }
            return MinLength;
        })(LengthRange);
        Main.MinLength = MinLength;
        var MaxLength = (function (_super) {
            __extends(MaxLength, _super);
            /**
             * Constructs a validator that checks that the value length is less than or equal to the max.
             *
             * @param max The maximum number of characters to be valid.
             * @param message Validation rule error message.
             */
            function MaxLength(max, message) {
                _super.call(this, 0, max, message || "The value must have a length of at most " + max + ".");
            }
            return MaxLength;
        })(LengthRange);
        Main.MaxLength = MaxLength;
        var Required = (function (_super) {
            __extends(Required, _super);
            /**
             * Constructs a validator that checks whether the value is empty.
             *
             * @param message Validation rule error message.
             */
            function Required(message) {
                _super.call(this, 1, message || "The value should not be empty.");
            }
            return Required;
        })(MinLength);
        Main.Required = Required;
        var NotNull = (function (_super) {
            __extends(NotNull, _super);
            /**
             * Constructs a validator that checks whether the value is null or not.
             *
             * @param message Validation rule error message.
             */
            function NotNull(message) {
                _super.call(this, message || "The input value must be a non-null value.");
            }
            /**
             * See base.
             */
            NotNull.prototype._validate = function (value) {
                if (value !== undefined && value !== null) {
                    return 2 /* Valid */;
                }
                return 1 /* Invalid */;
            };
            return NotNull;
        })(Validator);
        Main.NotNull = NotNull;
        var Numeric = (function (_super) {
            __extends(Numeric, _super);
            /**
             * Constructs a validator that checks whether the value is a number.
             *
             * @param message Validation rule error message.
             */
            function Numeric(message) {
                _super.call(this, message || "The input value must be a number.");
            }
            /**
             * See base.
             */
            Numeric.prototype._validate = function (value) {
                if ((Util.isNullOrUndefined(value) || $.trim(value) === "") && this.isEmptyValid()) {
                    return 2 /* Valid */;
                }
                if (value !== undefined && value !== null && value !== "") {
                    return !isNaN(+value) ? 2 /* Valid */ : 1 /* Invalid */;
                }
                return 1 /* Invalid */;
            };
            return Numeric;
        })(Validator);
        Main.Numeric = Numeric;
        var ValueRange = (function (_super) {
            __extends(ValueRange, _super);
            function ValueRange(min, max, message) {
                if ($.isFunction(min)) {
                    this.min = min;
                }
                else {
                    this.min = function () {
                        return min;
                    };
                }
                if ($.isFunction(max)) {
                    this.max = max;
                }
                else {
                    this.max = function () {
                        return max;
                    };
                }
                _super.call(this, message || "The value must be between " + this.min() + " and " + this.max() + ".");
            }
            /**
             * See base.
             */
            ValueRange.prototype._validate = function (value) {
                var numValue;
                if ((Util.isNullOrUndefined(value) || $.trim(value) === "") && this.isEmptyValid()) {
                    return 2 /* Valid */;
                }
                if ((Util.isNullOrUndefined(value) || value === "") && (this.min() === undefined || this.min() === null) && (this.max() === undefined || this.max() === null)) {
                    return 2 /* Valid */;
                }
                if (value !== null && value !== undefined && (typeof value === "string" || typeof value === "number") && value !== "") {
                    numValue = +value;
                    if (!isNaN(numValue)) {
                        if (this.min() !== undefined && this.min() !== null) {
                            if (numValue < this.min()) {
                                return 1 /* Invalid */;
                            }
                        }
                        if (this.max() !== undefined && this.max() !== null) {
                            if (numValue > this.max()) {
                                return 1 /* Invalid */;
                            }
                        }
                        return 2 /* Valid */;
                    }
                }
                return 1 /* Invalid */;
            };
            return ValueRange;
        })(Validator);
        Main.ValueRange = ValueRange;
        var MinValue = (function (_super) {
            __extends(MinValue, _super);
            /**
             * Constructs a validator that checks whether the value is greater than or equal to the specified minimum number.
             *
             * @param min Minimum range value.
             * @param message Validation rule error message.
             */
            function MinValue(min, message) {
                _super.call(this, min, null, message || "The value must be at least " + min + ".");
            }
            return MinValue;
        })(ValueRange);
        Main.MinValue = MinValue;
        var MaxValue = (function (_super) {
            __extends(MaxValue, _super);
            /**
             * Constructs a validator that checks whether the value is less than or equal to the specified maximum number.
             *
             * @param max Maximum range value.
             * @param message Validation rule error message.
             */
            function MaxValue(max, message) {
                _super.call(this, null, max, message || "The value must be at most " + max + ".");
            }
            return MaxValue;
        })(ValueRange);
        Main.MaxValue = MaxValue;
        var DateTimeRange = (function (_super) {
            __extends(DateTimeRange, _super);
            /**
             * Constructs a validator that checks whether the date is within the range defined by min and max date, with 1 second precision.
             *
             * @param min Earliest, enabled date.
             * @param max Latest, enabled date.
             * @param message Validation rule error message.
             */
            function DateTimeRange(min, max, timezoneOffset, message) {
                var msg;
                if (message) {
                    msg = message;
                }
                else if (min && max) {
                    msg = StringUtil.format("Selected date must be between {0} and {1}.", min.toUTCString(), max.toUTCString());
                }
                else if (min) {
                    msg = StringUtil.format("Selected date must be on or after {0}.", min.toUTCString());
                }
                else if (max) {
                    msg = StringUtil.format("Selected date must be on or before {0}.", max.toUTCString());
                }
                _super.call(this, msg || "Enter date in correct format.");
                this.minDateTime = min;
                this.maxDateTime = max;
                this.timezoneOffset = timezoneOffset;
            }
            /**
             * See base.
             */
            DateTimeRange.prototype._validate = function (value) {
                var numValue;
                if (Util.isNullOrUndefined(value)) {
                    return 1 /* Invalid */;
                }
                numValue = value.getTime();
                if (!Util.isNullOrUndefined(this.minDateTime)) {
                    // check (with 1 sec precision) if date is before minDateTime (taking timezone offset into account)
                    if (Math.floor(numValue / 1000) < Math.floor(DateUtil.getDateWithOffset(this.minDateTime, this.timezoneOffset()).getTime() / 1000)) {
                        return 1 /* Invalid */;
                    }
                }
                if (!Util.isNullOrUndefined(this.maxDateTime)) {
                    // check (with 1 sec precision) if date is after maxDateTime (taking timezone offset into account)
                    if (Math.floor(numValue / 1000) > Math.floor(DateUtil.getDateWithOffset(this.maxDateTime, this.timezoneOffset()).getTime() / 1000)) {
                        return 1 /* Invalid */;
                    }
                }
                return 2 /* Valid */;
            };
            return DateTimeRange;
        })(Validator);
        Main.DateTimeRange = DateTimeRange;
        var DayRange = (function (_super) {
            __extends(DayRange, _super);
            /**
             * Constructs a validator that checks whether the date is within the range defined by min and max date, with a day precision.
             *
             * @param min Earliest, enabled date.
             * @param max Latest, enabled date.
             * @param message Validation rule error message.
             */
            function DayRange(min, max, timezoneOffset, message) {
                var msg;
                if (message) {
                    msg = message;
                }
                else if (min && max) {
                    msg = StringUtil.format("Selected date must be between {0} and {1}.", min.toUTCString(), max.toUTCString());
                }
                else if (min) {
                    msg = StringUtil.format("Selected date must be on or after {0}.", min.toUTCString());
                }
                else if (max) {
                    msg = StringUtil.format("Selected date must be on or before {0}.", max.toUTCString());
                }
                _super.call(this, msg || "Enter date in correct format.");
                this.minDateTime = min;
                this.maxDateTime = max;
                this.timezoneOffset = timezoneOffset;
            }
            /**
             * See base.
             */
            DayRange.prototype._validate = function (value) {
                var minDateWithOffset, maxDateWithOffset;
                if (Util.isNullOrUndefined(value)) {
                    return 1 /* Invalid */;
                }
                if (!Util.isNullOrUndefined(this.minDateTime)) {
                    minDateWithOffset = DateUtil.getDateWithOffset(this.minDateTime, this.timezoneOffset());
                    if (DateUtil.compareDatesByDays(value, minDateWithOffset) === -1) {
                        return 1 /* Invalid */;
                    }
                }
                if (!Util.isNullOrUndefined(this.maxDateTime)) {
                    maxDateWithOffset = DateUtil.getDateWithOffset(this.maxDateTime, this.timezoneOffset());
                    if (DateUtil.compareDatesByDays(value, maxDateWithOffset) === 1) {
                        return 1 /* Invalid */;
                    }
                }
                return 2 /* Valid */;
            };
            return DayRange;
        })(Validator);
        Main.DayRange = DayRange;
        /**
         * Helper class used to keep track of pending async validation requests.
         */
        var PendingAsyncRequest = (function () {
            function PendingAsyncRequest(promise, asyncRequestId) {
                this.promise = promise;
                this.asyncRequestId = asyncRequestId;
            }
            return PendingAsyncRequest;
        })();
        var CustomAsyncValidator = (function (_super) {
            __extends(CustomAsyncValidator, _super);
            /**
             * Constructs a validator that invokes an async handler to check whether the given value is valid or not.
             * The async validation is provided by the user and can have any custom validation logic.
             *
             * @param message Validation rule error message.
             * @param validationHandler Validation function that takes in a value and an optional context object and returns a jquery promise object.
             * @param context Validation context that will be passed on when the validationHandler is invoked.
             */
            function CustomAsyncValidator(message, validationHandler, context) {
                this._validationHandler = validationHandler;
                this._context = context || null;
                this._pendingAsyncRequests = [];
                this._latestValidationAsyncRequestId = null;
                _super.call(this, message);
            }
            /**
             * For custom async validation we need to handle few important scenarios to make sure the validation result is consistent.
             *          1) Cuncurrent async validation request are possible and it must be handled.
             *          2) The result of async validation can race and can overwrite with an inconsistent result.
             *          3) Syncronous completion of the async request.
             *
             * Custom async validator will keep track of all pending request and will honor only the last validation request and update the validation state.
             *
             * @param value The current value that needs to be validated.
             *
             * @return The current validation state after evaluating the validation logic.
             */
            CustomAsyncValidator.prototype._validate = function (value) {
                var _this = this;
                var completed = false, promise;
                if (this._validationHandler) {
                    this._latestValidationAsyncRequestId = Util.newGuid();
                    promise = this._validationHandler(value, this._context);
                    this._pendingAsyncRequests.push(new PendingAsyncRequest(promise, this._latestValidationAsyncRequestId));
                    promise.then(function (message) {
                        _this._updateValidationResult(promise, message, 2 /* Valid */);
                    }, function (message) {
                        _this._updateValidationResult(promise, message, 1 /* Invalid */);
                    }).finally(function () {
                        completed = true;
                    });
                    // check if async validators completes syncronously.
                    if (completed) {
                        this._removePendingAsyncRequest(promise);
                        return this.validationState();
                    }
                    return 3 /* Pending */;
                }
                return 2 /* Valid */;
            };
            CustomAsyncValidator.prototype._updateResult = function (message, validationState) {
                if (message) {
                    this.message(message);
                }
                this.validationState(validationState);
            };
            CustomAsyncValidator.prototype._updateValidationResult = function (promise, message, validationState) {
                var removedPendingAsyncRequest;
                // we may have multiple concurrent requests. Since there is no straight forward way to abort or cancel the promise,
                // compare the asyncRequestId and ignore the results of previous validation requests.
                // Optimize for common scenario.
                if (this._pendingAsyncRequests.length <= 1) {
                    removedPendingAsyncRequest = this._pendingAsyncRequests.pop();
                }
                else {
                    removedPendingAsyncRequest = this._removePendingAsyncRequest(promise);
                }
                if (removedPendingAsyncRequest && removedPendingAsyncRequest.asyncRequestId === this._latestValidationAsyncRequestId) {
                    this._updateResult(message, validationState);
                }
            };
            CustomAsyncValidator.prototype._removePendingAsyncRequest = function (promise) {
                var i = 0, index = -1, itemToRemove = null;
                for (i = 0; i < this._pendingAsyncRequests.length; i++) {
                    if (this._pendingAsyncRequests[i].promise === promise) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) {
                    itemToRemove = this._pendingAsyncRequests[index];
                    this._pendingAsyncRequests.splice(index, 1);
                    return itemToRemove;
                }
                return null;
            };
            return CustomAsyncValidator;
        })(Validator);
        Main.CustomAsyncValidator = CustomAsyncValidator;
        var Invalid = (function (_super) {
            __extends(Invalid, _super);
            /**
             * Constructs a validator that always return invalid result.
             *
             * @param message Validation rule error message.
             */
            function Invalid(message) {
                _super.call(this, message || "The value is invalid.");
            }
            /**
             * See base.
             */
            Invalid.prototype._validate = function (value) {
                return 1 /* Invalid */;
            };
            return Invalid;
        })(Validator);
        Main.Invalid = Invalid;
    })(Main || (Main = {}));
    return Main;
});
