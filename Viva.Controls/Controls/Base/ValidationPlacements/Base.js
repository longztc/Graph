define(["require", "exports", "../../../Util/Util", "../../Base/KnockoutExtensions"], function (require, exports, Util, KnockoutExtensions) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery;
        var Base = (function () {
            function Base() {
                // To avoid recursive destroy been called.  We keep array of DestroyID.
                this._destroyIds = [];
            }
            /**
             * _checkExistsOrRegisterDestroyId.  This is utility function for the destroy method to avoid recursive
             *
             * @param destroyId Unique identifier for the destroy to identify itself.  In the javascript inheritance, this.destroy is always the same.
             *                  But super.dispose is unique since super is function scope.  Typically, use super.dispose as id. For root object, use null as Id.
             * @return whether this destroyMethod is already on the executed. If true, mean it is already been executed.
             */
            Base.prototype._checkExistsOrRegisterDestroyId = function (destroyId) {
                return Util.existsOrRegisterId(this._destroyIds, destroyId);
            };
            /**
             * See interface.
             */
            Base.prototype.isDestroyed = function () {
                return this._destroyIds.length > 0;
            };
            /**
             * See interface.
             */
            Base.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(null)) {
                    return;
                }
                if (this._errorMessage) {
                    this._errorMessage.dispose();
                    this._errorMessage = null;
                }
                this._disposeSubscriptions();
            };
            /**
             * See interface.
             */
            Base.prototype.initialize = function (element, validatable) {
                var _this = this;
                this._element = element;
                this._validatable = {
                    enableValidation: validatable.enableValidation,
                    valid: validatable.valid,
                    validationState: validatable.validationState,
                    validators: validatable.validators
                };
                if (!this._errorMessage) {
                    this._errorMessage = ko.computed(function () {
                        var errorMessage = "", validators = _this._validatable.validators();
                        if (validators) {
                            for (var i = 0; i < validators.length; i++) {
                                var validator = validators[i];
                                if (!validator.valid() && validator.message()) {
                                    errorMessage = validator.message();
                                    break;
                                }
                            }
                        }
                        // error messages are always strings so we can HTML encode them to prevent attacks
                        errorMessage = KnockoutExtensions.htmlEncode(errorMessage);
                        return errorMessage;
                    });
                }
                if (!this._subscriptions) {
                    this._initializeSubscriptions();
                }
            };
            /**
             * See interface.
             */
            Base.prototype.onErrorMessageChanged = function (newValue) {
            };
            /**
             * See interface.
             */
            Base.prototype.onValidationStateChanged = function (newValue) {
            };
            /**
             * Initializes the subscriptions property.
             */
            Base.prototype._initializeSubscriptions = function () {
                var _this = this;
                this._subscriptions = this._subscriptions || [];
                this._disposeSubscriptions();
                // make sure validation state change is called with initial value
                this.onValidationStateChanged(this._validatable.validationState());
                this._subscriptions.push(this._validatable.validationState.subscribe(function (newValue) {
                    _this.onValidationStateChanged(newValue);
                }));
                // make sure error message change is called with initial value
                this.onErrorMessageChanged(this._errorMessage());
                this._subscriptions.push(this._errorMessage.subscribe(function (newValue) {
                    _this.onErrorMessageChanged(newValue);
                }));
            };
            /**
             * Disposes the subscriptions property.
             */
            Base.prototype._disposeSubscriptions = function () {
                if (this._subscriptions) {
                    while (this._subscriptions.length) {
                        this._subscriptions.splice(0, 1)[0].dispose();
                    }
                }
            };
            return Base;
        })();
        Main.Base = Base;
    })(Main || (Main = {}));
    return Main;
});
