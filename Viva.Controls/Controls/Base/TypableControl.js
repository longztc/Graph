var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ValueUpdateTrigger", "./ValidatableControl", "../../Util/Util"], function (require, exports, ValueUpdateTrigger, ValidatableControl, Util) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The global validation for the control will be delayed for the specified timeout value after a value update notification is received.
                 * Set the timeout value when continous value update on key press is enabled.
                 * Specify the timeout in milliseconds.
                 */
                this.delayValidationTimeout = ko.observable(500);
                /**
                 *  Updates the value view model based on enum option.
                 */
                this.valueUpdateTrigger = 0 /* Default */;
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            /**
             * Creates a new instance of the Widget.
             *
             * @param element The element to apply the widget to.
             * @param options The view model to use, as an un-typed object with key/value pairs that match the view model properties.
             * @param createOptions The creation options.
             */
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._delayValidationTimer = null;
                this._attachTypableEvents();
            }
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachTypableEvents();
                this._clearDelayValidationTimer();
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
            Widget.prototype.validate = function (force) {
                this._clearDelayValidationTimer();
                _super.prototype.validate.call(this, force);
            };
            Widget.prototype._attachTypableEvents = function () {
                var _this = this;
                this._keyUpCommitHandler = function (evt) {
                    if (evt.which === 13 /* Enter */) {
                        _this.element.trigger("typableControl-commit", { widget: _this, model: _this.options });
                    }
                };
                this.element.on("keyup", this._keyUpCommitHandler);
            };
            Widget.prototype._detachTypableEvents = function () {
                if (this._keyUpCommitHandler) {
                    this.element.off("keyup", this._keyUpCommitHandler);
                    this._keyUpCommitHandler = null;
                }
            };
            Widget.prototype._valueChangeValidation = function () {
                // Check if delay validation timeout is given.
                if (this._delayValidationEnabled()) {
                    // Check whether there is some idle time between key strokes. If the key strokes are in quick succession then delay the validation.
                    // If the idle time is greater than the specified delyaValidationTimeout, schedule validation immediately.
                    if (this._shouldDelayValidation()) {
                        this._runDelayValidationTimer();
                        // don't execute validation
                        return;
                    }
                }
                _super.prototype._valueChangeValidation.call(this);
            };
            Widget.prototype._getValueUpdateTrigger = function () {
                if (Widget._isContentChangeTrigger(this.options.valueUpdateTrigger)) {
                    return ValueUpdateTrigger.ValueUpdateTrigger[this.options.valueUpdateTrigger].toLowerCase();
                }
                // "blur" is a valid valueUpdate value for knockout but we're not using here because it will coerce non-string values into
                // string values when the control loses focus (even with no changes to input). This means if an extension specifies a value
                // of undefined for a string (happens often) "blur" will change the value to empty string when the input is tabbed over (causing
                // validation to fire). Instead if we leave the valueUpdate empty ko will only update the value on change (which happens on blur as well)
                return "";
            };
            /**
             * Runs when delay validation is enabled and checks the frequency of the key strokes are with in the delay validation timeout specified by the user.
             *
             * @return Whether validation should be delayed.
             */
            Widget.prototype._shouldDelayValidation = function () {
                return Widget._isContentChangeTrigger(this.options.valueUpdateTrigger);
            };
            Widget.prototype._clearDelayValidationTimer = function () {
                if (this._delayValidationTimer !== null) {
                    global.clearTimeout(this._delayValidationTimer);
                    this._delayValidationTimer = null;
                }
            };
            Widget._isContentChangeTrigger = function (valueUpdateTrigger) {
                switch (valueUpdateTrigger) {
                    case 1 /* AfterKeyDown */:
                    case 2 /* KeyPress */:
                    case 4 /* Input */:
                        return true;
                }
                return false;
            };
            Widget.prototype._runDelayValidationTimer = function () {
                var _this = this;
                // Clear any pending timer.
                this._clearDelayValidationTimer();
                // Schedule the delay validation after delayValidationTimeout value specified by the user.
                this._delayValidationTimer = global.setTimeout(function () {
                    _this._delayValidationTimer = null;
                    _this.validate();
                }, this.options.delayValidationTimeout());
            };
            Widget.prototype._delayValidationEnabled = function () {
                // no point in delaying validation if the value update mode is on blur because we don't
                // anticipate multiple blur events in a row
                return this.options.delayValidationTimeout() > 0 && this._shouldDelayValidation();
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
