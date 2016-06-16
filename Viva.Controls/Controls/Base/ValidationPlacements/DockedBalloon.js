var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Validators", "../../DockedBalloon", "./Base"], function (require, exports, Validators, DockedBalloonViva, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, typeStringMap = { length: 4 };
        // Populate type string map for ValidationState enum
        typeStringMap[0 /* None */] = "none";
        typeStringMap[1 /* Invalid */] = "invalid";
        typeStringMap[2 /* Valid */] = "valid";
        typeStringMap[3 /* Pending */] = "pending";
        var DockedBalloon = (function (_super) {
            __extends(DockedBalloon, _super);
            function DockedBalloon(settings) {
                _super.call(this);
                this._inputSelector = "input, select";
                this._settings = settings;
            }
            /**
             * See interface.
             */
            DockedBalloon.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                _super.prototype.dispose.call(this);
                this._detachEvents();
                if (this._widget) {
                    this._widget.dispose();
                    this._widget = null;
                }
                if (this._element && this._widgetElement) {
                    ko.cleanNode(this._widgetElement[0]);
                    this._widgetElement.remove();
                }
                if (this._errorMessagesListWidget) {
                    this._errorMessagesListWidget.dispose();
                    this._errorMessagesListWidget = null;
                }
            };
            /**
             * See interface.
             */
            DockedBalloon.prototype.onValidationStateChanged = function (newValue) {
                _super.prototype.onValidationStateChanged.call(this, newValue);
                // delay creating docked balloon until needed
                if (!this._widgetElement) {
                    if (newValue === 0 /* None */) {
                        // validation state is none, no need to create a docked balloon
                        return;
                    }
                    this._createDockedBalloon();
                }
                this._widgetElement.removeClass("azc-bg-invalid");
                if (this._inputElement) {
                    switch (newValue) {
                        case 0 /* None */:
                        case 1 /* Invalid */:
                            this._widgetElement.addClass("azc-bg-invalid");
                        case 2 /* Valid */:
                        case 3 /* Pending */:
                            this._widgetViewModel.disabled(!this._validationStateBalloonOptions[typeStringMap[newValue]].balloonVisible);
                            break;
                        default:
                            break;
                    }
                }
            };
            /**
             * Sets the input element selector that will be modified to fit the width of the validation placement when shown.
             */
            DockedBalloon.prototype._setInputSelector = function (selector) {
                this._inputSelector = selector;
            };
            DockedBalloon.prototype._createDockedBalloon = function () {
                this._inputElement = this._element.find(this._inputSelector);
                if (!this._widgetElement) {
                    this._widgetElement = $("<div />");
                }
                this._widgetViewModel = new DockedBalloonViva.ViewModel();
                this._widgetViewModel.content = this._errorMessage;
                this._initializeValidationStateDockedBalloonOptions(this._settings);
                // Render the validation balloon
                this._element.append(this._widgetElement);
                this._widgetViewModel.type = 2 /* Validation */;
                this._widget = new DockedBalloonViva.Widget(this._widgetElement, this._widgetViewModel);
                // Note: the element might use box-sizing to border-box. we set to the innerHeight because of that
                this._widgetElement.css("height", this._element.innerHeight());
                this._attachEvents();
                // initialize to current validation state
                this.onValidationStateChanged(this._validatable.validationState());
            };
            DockedBalloon.prototype._initializeValidationStateDockedBalloonOptions = function (settings) {
                var none, invalid, valid, pending, valueExists = function (value) {
                    return value !== undefined && value !== null;
                };
                // Assign default validation docked balloon options.
                // This will show the validation anchor and balloon if the validated value is invalid.
                this._validationStateBalloonOptions = {
                    "none": {
                        "balloonVisible": false
                    },
                    "invalid": {
                        "balloonVisible": true
                    },
                    "valid": {
                        "balloonVisible": false
                    },
                    "pending": {
                        "balloonVisible": true
                    }
                };
                // Override default validation docked balloon options if its provided.
                if (settings && settings.validationStateBalloonOptions) {
                    none = settings.validationStateBalloonOptions.none;
                    invalid = settings.validationStateBalloonOptions.invalid;
                    valid = settings.validationStateBalloonOptions.valid;
                    pending = settings.validationStateBalloonOptions.pending;
                    if (none) {
                        this._validationStateBalloonOptions.none.balloonVisible = valueExists(none.balloonVisible) ? none.balloonVisible === true : this._validationStateBalloonOptions.none.balloonVisible;
                    }
                    if (invalid) {
                        this._validationStateBalloonOptions.invalid.balloonVisible = valueExists(invalid.balloonVisible) ? invalid.balloonVisible === true : this._validationStateBalloonOptions.invalid.balloonVisible;
                    }
                    if (valid) {
                        this._validationStateBalloonOptions.valid.balloonVisible = valueExists(valid.balloonVisible) ? valid.balloonVisible === true : this._validationStateBalloonOptions.valid.balloonVisible;
                    }
                    if (pending) {
                        this._validationStateBalloonOptions.pending.balloonVisible = valueExists(pending.balloonVisible) ? pending.balloonVisible === true : this._validationStateBalloonOptions.pending.balloonVisible;
                    }
                }
            };
            DockedBalloon.prototype._attachEvents = function () {
                var _this = this;
                this._detachEvents();
                this._inputElementFocusHandler = function (evt) {
                    _this._onInputElementFocus();
                };
                this._inputElementBlurHandler = function (evt) {
                    _this._onInputElementBlur();
                };
                this._widgetAnchorElementClickHandler = function (evt) {
                    evt.preventDefault();
                };
                this._element.find("input,select").on("focus", this._inputElementFocusHandler).on("blur", this._inputElementBlurHandler);
                // Remove hover and click events from docked balloon anchor
                this._widgetElement.find("a").on("click", this._widgetAnchorElementClickHandler);
            };
            DockedBalloon.prototype._detachEvents = function () {
                if (this._inputElementFocusHandler) {
                    this._inputElement.off("focus", this._inputElementFocusHandler);
                    this._inputElementFocusHandler = null;
                }
                if (this._inputElementBlurHandler) {
                    this._inputElement.off("blur", this._inputElementBlurHandler);
                    this._inputElementBlurHandler = null;
                }
                if (this._widgetAnchorElementClickHandler) {
                    this._widgetElement.find("a").off("blur", this._widgetAnchorElementClickHandler);
                    this._widgetAnchorElementClickHandler = null;
                }
            };
            DockedBalloon.prototype._onInputElementFocus = function () {
                if (this._widget && !this._validatable.valid()) {
                    this._widget.options.balloonVisible(true);
                }
            };
            DockedBalloon.prototype._onInputElementBlur = function () {
                if (this._widget) {
                    this._widget.options.balloonVisible(false);
                }
            };
            DockedBalloon.defaultOptions = {
                "validationStateBalloonOptions": {
                    "pending": {
                        "balloonVisible": false
                    }
                }
            };
            return DockedBalloon;
        })(Base.Base);
        Main.DockedBalloon = DockedBalloon;
    })(Main || (Main = {}));
    return Main;
});
