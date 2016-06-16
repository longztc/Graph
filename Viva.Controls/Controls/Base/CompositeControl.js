var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Base"], function (require, exports, Base) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-compositeControl";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                this.viewModels = [];
            }
            return ViewModel;
        })(Base.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                /**
                 * The widgets collections.
                 */
                this.widgets = [];
                /**
                 * Callback function to allow custom disable class to be inserted.
                 */
                this.widgetDisabledClass = $.noop;
                this.element.addClass(widgetClass);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                // call destroy on all widgets. This enforce the proper clean up on events.
                this.widgets.forEach(function (widget) {
                    widget.dispose();
                });
                this.widgets = [];
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
            Widget.prototype._initializeSubscriptions = function (viewModel) {
                var _this = this;
                _super.prototype._initializeSubscriptions.call(this, viewModel);
                this._subscriptions.registerForDispose(viewModel.disabled.subscribe(function (value) {
                    _this._onDisabledChanged(value);
                }));
            };
            /**
             * Notification that view model disabled property changed.
             *
             * @param value Disabled if true.
             */
            Widget.prototype._onDisabledChanged = function (value) {
                if (this.widgetDisabledClass && this.widgetDisabledClass()) {
                    // We only need to do this on the select element that we have.
                    this.element.toggleClass(this.widgetDisabledClass(), value);
                }
                this.widgets.forEach(function (widget) {
                    widget.options.disabled(value);
                });
            };
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
    })(Main || (Main = {}));
    return Main;
});
