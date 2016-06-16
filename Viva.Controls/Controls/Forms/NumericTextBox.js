var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Validators", "../Base/Base", "../Base/ValidatableControl", "../../Util/Util"], function (require, exports, Validators, Base, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, globalFormControl = "azc-formControl", widgetInputClass = "azc-input", widgetClass = "azc-numericTextBox", widgetHasFocusClass = "azc-numericTextBox-hasfocus", widgetDisabledClass = "azc-numericTextBox-disabled", uuid = 0, prefixId = "__azc-numericTextBox", template = "<div class='azc-numericTextBox-wrapper'>" + "<input class='" + widgetInputClass + " " + globalFormControl + "'type='text' data-bind='value: func._rawStringValue, attr: { name: func._name, placeholder: data.placeholder }, css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }' />" + "</div>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * Minimum number allowed.
                 */
                this.min = ko.observable(null);
                /**
                 * Maximum number allowed.
                 */
                this.max = ko.observable(null);
                /**
                 *  Maximum decimal points allowed for the number. No more than 20.
                 */
                this.decimalPoint = ko.observable(2);
                /**
                 * Placeholder text held by the control.
                 * Currently this does not work on IE9 (which does not support placeholder attr on input).
                 */
                this.placeholder = ko.observable(null);
                /**
                 * Text to display when entered text is not numeric.
                 */
                this.invalidText = "Value must be a valid number.";
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._maxDecimalPoints = 20;
                this._defaultDecimalPoints = 2;
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._input = this.element.find("input");
                this._attachEvents();
                this._initializeComputeds();
                this._createValidators();
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
                this._detachEvents();
                this._cleanElement(widgetClass, widgetDisabledClass);
                _super.prototype.dispose.call(this);
            };
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._input[0];
            };
            Widget.prototype._createValidators = function () {
                var _this = this;
                // temporarily disable validation so that adding our built in validator doesn't immediately
                // trigger validation on control creation
                var originalEnableValidationState = this.options.enableValidation();
                this.options.enableValidation(false);
                this._validNumberValidator = new Validators.Invalid(this.options.invalidText);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this._valueRange !== null && _this.options.validators.indexOf(_this._valueRange) !== -1) {
                        _this.options.validators.remove(_this._valueRange);
                    }
                    _this._valueRange = new Validators.ValueRange(_this.options.min(), _this.options.max());
                    _this.options.validators.push(_this._valueRange);
                }));
                this.options.enableValidation(originalEnableValidationState);
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._inputElementFocusHandler = function (evt) {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetHasFocusClass, true);
                };
                this._inputElementBlurHandler = function (evt) {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetHasFocusClass, false);
                };
                this._input.on("focus." + widgetClass, this._inputElementFocusHandler).on("blur." + widgetClass, this._inputElementBlurHandler);
            };
            Widget.prototype._detachEvents = function () {
                if (this._inputElementFocusHandler) {
                    this._input.off("focus." + widgetClass, this._inputElementFocusHandler);
                    this._inputElementFocusHandler = null;
                }
                if (this._inputElementBlurHandler) {
                    this._input.off("blur." + widgetClass, this._inputElementBlurHandler);
                    this._inputElementBlurHandler = null;
                }
            };
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.value.subscribe(function (newVal) {
                    _this._processValue(newVal);
                }));
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this._input.prop("disabled", disabled);
                    _this.element.toggleClass(widgetDisabledClass, disabled);
                }));
                this._decimalPointValidated = ko.computed(function () {
                    return _this._processDecimalPoint();
                });
                this._addDisposablesToCleanUp(this._decimalPointValidated);
                this._rawStringInternal = ko.observable(null);
                this._rawStringValue = ko.computed({
                    read: function () {
                        var raw = _this._rawStringInternal();
                        var decimalPoint = _this._decimalPointValidated(), value = _this.options.value();
                        if (raw !== null) {
                            return raw;
                        }
                        else {
                            var validatorIdx = _this.options.validators.indexOf(_this._validNumberValidator);
                            if (validatorIdx !== -1) {
                                _this.options.validators.remove(_this._validNumberValidator);
                            }
                            if (Util.isNullOrUndefined(value)) {
                                _this.options.value(null);
                            }
                            else {
                                var parsedVal = +value;
                                var formattedVal = parsedVal.toFixed(decimalPoint);
                                if (formattedVal.length < value.toString().length) {
                                    parsedVal = +formattedVal;
                                    _this.options.value(parsedVal);
                                }
                                else {
                                    _this.options.value(parsedVal);
                                }
                            }
                            return !Util.isNullOrUndefined(_this.options.value()) ? _this.options.value().toString() : "";
                        }
                    },
                    write: function (value) {
                        // TODO guruk: there is no good way to determine user locale and account for it in number formatting.
                        // Framework should provide some utilities for numbers.
                        // Those utilities should be used portal wide.
                        var parsedVal = +value;
                        // for value of +/-Infinity keep user input
                        if (!isNaN(parsedVal) && !isFinite(parsedVal)) {
                            _this.options.value(parsedVal);
                            _this._rawStringInternal(value);
                        }
                        else if (!isNaN(parsedVal)) {
                            _this.options.value(parsedVal);
                            _this._rawStringInternal(null);
                        }
                        else {
                            _this.options.value(null);
                            _this._rawStringInternal(value);
                            var validatorIdx = _this.options.validators.indexOf(_this._validNumberValidator);
                            if (validatorIdx === -1) {
                                // insert validator to the front of the validator list
                                _this.options.validators.unshift(_this._validNumberValidator);
                                _this.validate(true);
                            }
                        }
                    }
                });
                this._rawStringValue.extend({ notify: "always" });
                this._addDisposablesToCleanUp(this._rawStringValue);
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
             * Validates and propagates decimal point settings for the control.
             *
             * @return Number Indicates a valid number of decimal points set for the control.
             */
            Widget.prototype._processDecimalPoint = function () {
                var validDecPoint = this._defaultDecimalPoints;
                if (this.options.decimalPoint && !Util.isNullOrUndefined(this.options.decimalPoint())) {
                    validDecPoint = this.options.decimalPoint();
                    if (validDecPoint <= 0) {
                        validDecPoint = 0;
                    }
                    if (this.options.decimalPoint() > this._maxDecimalPoints) {
                        validDecPoint = this._maxDecimalPoints;
                    }
                }
                return validDecPoint;
            };
            /**
             * Propagates the value set on the view model to the UI.
             *
             * @param numericVal Set on the viewModel.
             */
            Widget.prototype._processValue = function (numericVal) {
                // if viewModel value is being set by user and current html value is valid
                // reset html value to keep in sync
                if (this._rawStringValue) {
                    var parsedVal = +this._rawStringValue();
                    if (!isNaN(parsedVal)) {
                        this._rawStringInternal(null);
                    }
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcNumericTextBox"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
