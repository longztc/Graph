var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base"], function (require, exports, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uniqueId = 0, widgetClass = "azc-colorBar", template = "<div data-bind='css: func._cssClass'></div>" + "<span class='azc-colorBar-text' data-bind='text: data.text'></span>";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * The label text for the color bar.
                 */
                this.text = ko.observable("");
                /**
                 * The CSS classifier to apply to the color bar.
                 */
                this.cssClass = ko.observable("");
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
                this._initializeComputeds();
                this._bindDescendants();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._cleanElement(widgetClass);
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
                this._cssClass = ko.computed(function () {
                    return "azc-colorBar-bar " + _this.options.cssClass();
                });
                this._addDisposablesToCleanUp(this._cssClass);
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
