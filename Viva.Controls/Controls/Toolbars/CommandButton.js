var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ExecutableButtonBase", "./ToolbarItemType", "../Base/Base", "./ToolbarButton"], function (require, exports, ExecutableButtonBase, ToolbarItemType, Base, ToolbarButton) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-commandButton";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates an executable button.
             *
             * @param type The type of the button.
             */
            function ViewModel(type) {
                _super.call(this, type ? type : 4 /* CommandButton */);
                /**
                 * The context to pass on to the command.
                 */
                this.commandContext = ko.observable(null);
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
            Widget.prototype._isDisabled = function () {
                return this.options.disabled() || !this._canExecute();
            };
            /**
             * See base.
             */
            Widget.prototype._onClick = function (element, evt) {
                if (this.options.command && this.options.command.canExecute()) {
                    this.options.command.execute(this.options.commandContext());
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
        ko.bindingHandlers["azcToolbarCommandButton"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
