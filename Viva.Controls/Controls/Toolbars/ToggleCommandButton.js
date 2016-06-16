var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ExecutableButtonBase", "../Base/Base", "./ToolbarItemType", "./ToolbarButton"], function (require, exports, ExecutableButtonBase, Base, ToolbarItemType, ToolbarButton) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-toggleCommandButton", checkedToggleButtonClass = "azc-toggleCommandButton-checked azc-fill-primary";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.call(this, 6 /* ToggleButton */);
                /**
                 * The option group that the toggle button belongs to.
                 */
                this.optionGroupName = "";
                /**
                 * A value indicating whether or not the toggle button is in the checked state.
                 */
                this.checked = ko.observable(false);
                /**
                 * The context to pass on to the command.
                 */
                this.commandContext = ko.observable(null);
                /**
                 * This callback should be used when the toggle button belongs to options group and its state change will impact other toggle buttons in the group.
                 * The primary usage of the callback is to control the UI state of the toggle buttons when the current button state changes.
                 */
                this.onStateChangeCallback = null;
            }
            return ViewModel;
        })(ExecutableButtonBase.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass);
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this.element.removeClass(widgetClass);
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
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                _super.prototype._initializeComputeds.call(this);
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this.element.find("a").toggleClass(checkedToggleButtonClass, _this.options.checked());
                }));
            };
            /**
             * See base.
             */
            Widget.prototype._isDisabled = function () {
                return this.options.disabled() || !this._canExecute();
            };
            /**
             * See base.
             */
            Widget.prototype._onClick = function (element, evt) {
                this.options.checked(!this.options.checked());
                if (this.options.onStateChangeCallback) {
                    this.options.onStateChangeCallback(this.options, this.options.checked());
                }
                if (this.options.command && this.options.command.canExecute()) {
                    this.options.command.execute({ checked: this.options.checked(), context: this.options.commandContext() });
                }
            };
            /**
             * Command execution state will be used to show the disabled styling.
             * Users can toggle canExecute during long async command operation.
             */
            Widget.prototype._canExecute = function () {
                if (this.options.command && this.options.command.canExecute) {
                    return this.options.command.canExecute();
                }
                return false;
            };
            return Widget;
        })(ToolbarButton.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcToolbarToggleCommandButton"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
