var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./ToolbarItemType", "../Base/Base", "./ToolbarButton", "./ClickableLink"], function (require, exports, ToolbarItemType, Base, ToolbarButton, ClickableLink) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, widgetClass = "azc-openLinkButton";
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            /**
             * Creates the selectable toolbar button.
             *
             * @param uri The URI that will be opened when target is clicked.
             * @param target The target window to open the URI in.
             */
            function ViewModel(uri, target) {
                if (target === void 0) { target = "_blank"; }
                _super.call(this, 2 /* OpenLinkButton */);
                this.clickableLink = new ClickableLink.ClickableLink(ko.observable(uri), ko.observable(target));
            }
            return ViewModel;
        })(ToolbarButton.ViewModel);
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
            Widget.prototype._onClick = function (element, evt) {
                global.open(this.options.clickableLink.uri(), this.options.clickableLink.target());
            };
            return Widget;
        })(ToolbarButton.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcToolbarOpenLinkButton"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
