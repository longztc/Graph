var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Validators", "./Base"], function (require, exports, Validators, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, typeStringMap = [], 
        // This class is updated when validators are not yet run.
        widgetValidationNoneClass = "azc-validatableControl-none", 
        // This class is updated when value is invald, validators are not yet run or validation is pending.
        widgetValidationInvalidClass = "azc-validatableControl-invalid", 
        // This class is updated when validation is executing asyncronously and not yet completed.
        widgetValidationPendingClass = "azc-validatableControl-pending", 
        // This class is updated when one or more validators are attached and validators have executed and value is valid.
        widgetValidationValidClass = "azc-validatableControl-valid-validated", 
        // This attribute is updated in the input element to indicate if validation succeeded or not.
        widgetValidationAttribute = "data-validatable-control-valid", 
        // This attribute is updated in the input element to indicate the validation state.
        // This attribute is useful to indicate async operation status.
        widgetValidationStateAttribute = "data-validatable-control-validation-state";
        // Populate type string map for ValidationState enum
        typeStringMap[0 /* None */] = "none";
        typeStringMap[1 /* Invalid */] = "invalid";
        typeStringMap[2 /* Valid */] = "valid";
        typeStringMap[3 /* Pending */] = "pending";
        var Css = (function (_super) {
            __extends(Css, _super);
            function Css() {
                _super.apply(this, arguments);
                this._input = null;
                this._valid = ko.computed($.noop);
            }
            /**
             * See interface.
             */
            Css.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                if (this._element) {
                    this._element.removeClass([widgetValidationNoneClass, widgetValidationInvalidClass, widgetValidationPendingClass, widgetValidationValidClass].join(" "));
                }
                if (this._input) {
                    this._input.removeAttr(widgetValidationAttribute);
                }
                if (this._valid) {
                    this._valid.dispose();
                    this._valid = null;
                }
            };
            /**
             * See interface.
             */
            Css.prototype.initialize = function (element, validatable) {
                var _this = this;
                _super.prototype.initialize.call(this, element, validatable);
                this._valid = ko.computed(function () {
                    return _this._validatable.enableValidation() && _this._validatable.validators().length > 0 && _this._validatable.validationState() === 2 /* Valid */;
                });
                this._subscriptions.push(this._valid.subscribe(function (newValue) {
                    _this._element.toggleClass(widgetValidationValidClass, newValue);
                }));
                this._input = this._element.find("input, select, textarea");
                this._validatable.validationState.notifySubscribers(this._validatable.validationState());
                this._setValidationAttribute(this._validatable.validationState());
            };
            /**
             * See interface.
             */
            Css.prototype.onValidationStateChanged = function (newValue) {
                this._element.toggleClass(widgetValidationNoneClass, newValue === 0 /* None */);
                this._element.toggleClass(widgetValidationInvalidClass, newValue === 1 /* Invalid */);
                this._element.toggleClass(widgetValidationPendingClass, newValue === 3 /* Pending */);
                // Inject azc-validatableControl-valid-validated class only when one or more validators are attached and validation has been run and the value is valid.
                this._element.toggleClass(widgetValidationValidClass, this._valid());
                this._setValidationAttribute(newValue);
            };
            Css.prototype._setValidationAttribute = function (validationState) {
                if (this._input) {
                    this._input.attr(widgetValidationAttribute, validationState === 2 /* Valid */ || this._validatable.validators().length === 0);
                    this._input.attr(widgetValidationStateAttribute, typeStringMap[validationState]);
                }
            };
            return Css;
        })(Base.Base);
        Main.Css = Css;
    })(Main || (Main = {}));
    return Main;
});
