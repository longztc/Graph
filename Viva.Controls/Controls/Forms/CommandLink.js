var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/Base", "../Base/Command"], function (require, exports, Base, Command) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-commandLink", widgetTemplate = "<a class='azc-commandLink-link' data-bind='azcCommand: data, attr: { href: ((data.disabled() || !data.handler() || !data.handler().canExecute()) ? null : \"\")}'></a>";
        /**
         * Creates a CommandLink.
         */
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: Command.ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(widgetTemplate);
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
            return Widget;
        })(Base.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcCommandLink"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
