var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ValueUpdateTrigger", "../Base/Base", "../Base/TypableControl"], function (require, exports, ValueUpdateTrigger, Base, TypableControl) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, globalFormControl = "azc-formControl", widgetInputClass = "azc-input", passwordWidgetClass = "azc-password", widgetHasFocusClass = "azc-password-hasfocus", passwordTemplate = "<div class='azc-password-wrapper'>" + "<input class='" + widgetInputClass + " " + globalFormControl + "' type='password' data-bind='value: data.value, attr: { placeholder: data.emptyValueText }, css: { \"azc-br-invalid\": data.validationState() === 1, \"azc-br-edited\": data.dirty(), \"azc-disabled\": data.disabled(), \"azc-br-focused\": data.focused() }, valueUpdate: \"afterkeydown\"' />" + "</div>";
        (function (Strength) {
            Strength[Strength["VeryWeak"] = 0] = "VeryWeak";
            Strength[Strength["Weak"] = 1] = "Weak";
            Strength[Strength["Fair"] = 2] = "Fair";
            Strength[Strength["Strong"] = 3] = "Strong";
            Strength[Strength["VeryStrong"] = 4] = "VeryStrong";
        })(Main.Strength || (Main.Strength = {}));
        var Strength = Main.Strength;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates a new instance of the view model.
             */
            function ViewModel() {
                _super.call(this);
                /**
                 * Placeholder text shown when password is empty.
                 */
                this.emptyValueText = ko.observable();
                this.valueUpdateTrigger = 1 /* AfterKeyDown */;
            }
            return ViewModel;
        })(TypableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                var _this = this;
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(passwordWidgetClass).html(passwordTemplate);
                this._input = this.element.find("input");
                this._input.on("focus." + passwordWidgetClass, function () {
                    _this.options.focused(true);
                    _this.element.toggleClass(widgetHasFocusClass, true);
                }).on("blur." + passwordWidgetClass, function () {
                    _this.options.focused(false);
                    _this.element.toggleClass(widgetHasFocusClass, false);
                });
                this._initializeComputeds();
                this._bindDescendants();
                this._afterCreate();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._cleanElement(passwordWidgetClass);
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
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._input[0];
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var disabled = _this.options.disabled();
                    _this.element.find("input").prop("disabled", disabled);
                }));
            };
            return Widget;
        })(TypableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcPassword"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
