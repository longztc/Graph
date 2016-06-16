var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Validators", "./EditableControl"], function (require, exports, Validators, EditableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-validatableControl";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new validatable control view model.
             */
            function ViewModel() {
                _super.call(this);
                this.enableValidation = ko.observable(true);
                this.validationState = ko.observable(0 /* None */);
                this.validators = ko.observableArray();
                this.validationPlacements = ko.observableArray();
                var valid = !this.enableValidation() || this.validators().length === 0 || (this.enableValidation() && this.validators().length > 0 && (this.validationState() === 0 /* None */ || this.validationState() === 2 /* Valid */));
                this.valid = ko.observable(valid);
            }
            return ViewModel;
        })(EditableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                this._validationState = ko.observable(0 /* None */);
                this._validationStateInternal = null;
                this._initializingValidatableControl = true;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
                this._initializeValidation();
                // re-subscribe
                this._initializeSubscriptions(this.options);
                this._initializingValidatableControl = false;
                // Avoid repeated validation during validators array mutation and just run once.
                // Perform a forced validation only on dirty fields.  For clean fields, we don't want to bother
                // users with validation errors until they edit fields.
                if (this.options.dirty()) {
                    this.validate(true);
                }
                this._validationState.notifySubscribers(this._validationState());
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.options.validators.removeAll();
                this.options.validationPlacements.removeAll();
                _super.prototype.dispose.call(this);
                this.element.removeClass(widgetClass);
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
              * See interface.
              */
            Widget.prototype.validate = function (force) {
                var validators, value, forceValidate = !!force;
                // Check for validators
                if (this._shouldValidate()) {
                    validators = this.options.validators();
                    if (validators && validators.length > 0) {
                        value = this.options.value();
                        // Walk through the validator and stop when the first Invalid validator is hit.
                        // Continue validation if async validator is encountered.
                        validators.some(function (validator) {
                            if (value !== validator.validate()) {
                                validator.validate(value);
                            }
                            else if (forceValidate) {
                                validator.validate.notifySubscribers(value);
                            }
                            return validator.validationState() === 1 /* Invalid */;
                        });
                    }
                }
            };
            /**
             * See parent.
             */
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(this.options.value.subscribe(function (value) {
                    _this._onValueChanged(value);
                }));
                this._subscriptions.registerForDispose(this._validationState.subscribe(function (validationState) {
                    _this.options.validationState(validationState);
                }));
                if (this._validationStateInternal) {
                    var enableValidation = function (enabled) {
                        _this._disposeValidationLifetimeManager();
                        if (enabled) {
                            _this._validationLifetimeManager = _this.lifetimeManager.createChildLifetime();
                            // All subsequent _validationStateInternal changes will be transcribed to
                            // _validationState (and visible over view model).
                            _this._validationLifetimeManager.registerForDispose(_this._validationStateInternal.subscribe(function (state) {
                                _this._validationState(state);
                            }));
                            // Perform a forced validation only on dirty fields.  For clean fields, we don't want to bother
                            // users with validation errors until they edit fields.
                            if (_this.options.dirty()) {
                                _this.validate(true);
                            }
                        }
                    };
                    this._subscriptions.registerForDispose(this.options.enableValidation.subscribe(enableValidation));
                    enableValidation(this.options.enableValidation());
                }
                this._subscriptions.registerForDispose(viewModel.validators.subscribeArrayChanged(function (validator) {
                    _this._onValidatorsChanged();
                }, function (validator) {
                    validator.dispose();
                    _this._onValidatorsChanged();
                }, this));
            };
            /**
             * See parent.
             */
            Widget.prototype._afterCreate = function () {
                _super.prototype._afterCreate.call(this);
                this._initializeValidationPlacements();
            };
            Widget.prototype._onValueChanged = function (value) {
                if (this._hasValidators()) {
                    this._valueChangeValidation();
                }
            };
            Widget.prototype._valueChangeValidation = function () {
                this.validate();
            };
            Widget.prototype._initializeValidationPlacements = function () {
                var _this = this;
                var validationPlacements = this.options.validationPlacements.removeAll();
                this._subscriptions.registerForDispose(this.options.validationPlacements.subscribeArrayChanged(function (validationPlacement) {
                    validationPlacement.initialize(_this.element, _this.options);
                }, function (validationPlacement) {
                    validationPlacement.dispose();
                }, this));
                this.options.validationPlacements(validationPlacements);
            };
            Widget.prototype._disposeValidationLifetimeManager = function () {
                if (this._validationLifetimeManager) {
                    this._validationLifetimeManager.dispose();
                    this._validationLifetimeManager = null;
                }
            };
            Widget.prototype._hasValidators = function () {
                var validators = this.options.validators();
                return (this.options.enableValidation() && !this.options.disabled() && validators && validators.length > 0);
            };
            Widget.prototype._initializeValidation = function () {
                var _this = this;
                this._addDisposablesToCleanUp(this._valid = ko.computed(function () {
                    var newValue = !_this.options.enableValidation() || _this.options.validators().length === 0 || (_this.options.enableValidation() && _this.options.validators().length > 0 && (_this.options.validationState() === 0 /* None */ || _this.options.validationState() === 2 /* Valid */));
                    if (newValue !== _this.options.valid.peek()) {
                        _this.options.valid(newValue);
                    }
                    return newValue;
                }));
                this._addDisposablesToCleanUp(this._validationStateInternal = ko.computed(function () {
                    var validationState = 0 /* None */;
                    if (_this._shouldValidate()) {
                        // Walk through the validators and set the validation state of the first validator which is not in valid state.
                        // This will stop the validator iteration when first invalid state is hit.
                        _this.options.validators().some(function (validator) {
                            validationState = validator.validationState();
                            return (validator.validationState() === 1 /* Invalid */ || validator.validationState() === 3 /* Pending */ || validator.validationState() === 0 /* None */);
                        });
                    }
                    return validationState;
                }));
            };
            Widget.prototype._onValidatorsChanged = function () {
                if (!this._initializingValidatableControl) {
                    this.validate(true);
                }
            };
            Widget.prototype._shouldValidate = function () {
                var validators = this.options.validators();
                if (this.options.enableValidation() && !this.options.disabled() && validators && validators.length > 0) {
                    return true;
                }
                return false;
            };
            return Widget;
        })(EditableControl.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
