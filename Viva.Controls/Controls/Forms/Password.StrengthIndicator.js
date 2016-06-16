var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Visualization/ColorBar", "./Password", "../Base/Base"], function (require, exports, ColorBar, Password, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, strengthClassifiers = [
            "azc-password-strengthIndicator-veryweak",
            "azc-password-strengthIndicator-weak",
            "azc-password-strengthIndicator-fair",
            "azc-password-strengthIndicator-strong",
            "azc-password-strengthIndicator-verystrong"
        ], strengthWidgetClass = "azc-password-strengthIndicator";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The current strength.
                 */
                this.strength = ko.observable(0 /* VeryWeak */);
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(strengthWidgetClass);
                this._colorBar = new ColorBar.Widget($("<div />").appendTo(this.element));
                this._strengthDescriptions = [
                    options.textVeryWeak || "",
                    options.textWeak || "",
                    options.textFair || "",
                    options.textStrong || "",
                    options.textVeryStrong || ""
                ];
                this._initializeComputeds();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                if (this._colorBar) {
                    this._colorBar.dispose();
                    this._colorBar = null;
                }
                this._cleanElement(strengthWidgetClass);
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var text, cssClass, strength = _this.options.strength();
                    text = "";
                    cssClass = "";
                    if (strength !== undefined && strength !== null && strength >= 0 /* VeryWeak */ && strength <= 4 /* VeryStrong */) {
                        text = _this._strengthDescriptions[strength];
                        cssClass = strengthClassifiers[strength];
                    }
                    _this._colorBar.options.text(text);
                    _this._colorBar.options.cssClass(cssClass);
                }));
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
